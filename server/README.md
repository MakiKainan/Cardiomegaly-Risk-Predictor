# Local inference server

Loads the two trained models and serves `POST /api/infer` for the demo page.
The React app reaches it through the Vite `/api` proxy, so only uploads need
this running — dataset samples render from precomputed `samples/metadata.json`.

## Run

```bash
# from the app root (cardiovascular-risk-prediction-ai/)
pip install -r server/requirements.txt
npm run api          # = uvicorn app:app --app-dir server --reload --port 8000
```

Models are read from the parent `Cardiomegaly Computer Vision app/` dir
(`cnn_densenet121_full.pt`, `vit_b16_weights.pt`). Override with `MODELS_DIR`.

## Verify it matches training

```bash
cd server && python check.py
```

Reproduces the probabilities in `metadata.json` for the first few samples
(within tolerance). If this passes, preprocessing + model loading match the
notebook.

## Contract

`POST /api/infer` (multipart, field `image`) →
```json
{ "source": "torch",
  "densenet": { "label": "Cardiomegaly", "prob": 0.81, "confidence": 0.81 },
  "vit":      { "label": "Cardiomegaly", "prob": 0.87, "confidence": 0.87 } }
```
A future Vercel + Gemini function returns the same shape with `"source":"gemini"`.
