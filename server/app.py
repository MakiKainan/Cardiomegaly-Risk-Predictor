"""Local inference server for the cardiomegaly demo.

Serves the two trained PyTorch models behind a stable HTTP contract that the
React app talks to at POST /api/infer. A future Vercel + Gemini function can
satisfy the same contract without touching the frontend.

Run (from the app root):  uvicorn app:app --app-dir server --reload --port 8000
"""
import io
from pathlib import Path

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms

# server/app.py -> parents[2] is the "Cardiomegaly Computer Vision app" dir that
# holds the .pt artifacts. Override with MODELS_DIR env if you move them.
import os

MODELS_DIR = Path(os.environ.get("MODELS_DIR", Path(__file__).resolve().parents[2]))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Inference transform — must match the notebook's eval pipeline exactly, or the
# probabilities won't reproduce training (see server/check.py).
preprocess = transforms.Compose([
    transforms.Grayscale(3),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

_models: dict = {}


def load_models() -> dict:
    """Load both models once, lazily (so the server starts before the 343MB ViT)."""
    if _models:
        return _models
    # CNN was saved as a FULL model object -> weights_only=False (torch>=2.6 default flipped).
    cnn = torch.load(MODELS_DIR / "cnn_densenet121_full.pt", map_location=DEVICE, weights_only=False)
    cnn.eval()
    # ViT was saved as a state dict -> rebuild the identical architecture, then load.
    vit = models.vit_b_16(weights=models.ViT_B_16_Weights.IMAGENET1K_V1)
    vit.heads.head = nn.Linear(vit.heads.head.in_features, 1)
    vit.load_state_dict(torch.load(MODELS_DIR / "vit_b16_weights.pt", map_location=DEVICE))
    vit.to(DEVICE).eval()
    _models["cnn"], _models["vit"] = cnn, vit
    return _models


def infer(model, img: Image.Image) -> dict:
    """One image -> {label, prob, confidence}. prob = P(cardiomegaly)."""
    x = preprocess(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        prob = torch.sigmoid(model(x)).item()
    label = "Cardiomegaly" if prob >= 0.5 else "Normal"
    confidence = prob if label == "Cardiomegaly" else 1 - prob
    return {"label": label, "prob": round(prob, 4), "confidence": round(confidence, 4)}


app = FastAPI(title="Cardiomegaly inference")
# Open CORS: local-only dev server; the browser normally reaches this via the
# Vite /api proxy, but allowing direct calls keeps debugging painless.
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

MAX_BYTES = 10 * 1024 * 1024


@app.get("/api/health")
def health():
    return {"status": "ok", "device": DEVICE, "loaded": bool(_models)}


@app.post("/api/infer")
async def api_infer(image: UploadFile = File(...)):
    data = await image.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image too large (max 10MB)")
    try:
        img = Image.open(io.BytesIO(data)).convert("L")
    except Exception:
        raise HTTPException(400, "Could not read that file as an image")
    m = load_models()
    return {
        "source": "torch",
        "densenet": infer(m["cnn"], img),
        "vit": infer(m["vit"], img),
    }
