"""Sanity check: our load + preprocess must reproduce metadata.json's probs.

This is the test that proves the wiring is correct (not just that it runs). If
the transform or model-load is wrong, the probabilities drift and this fails.

Run from the server dir:  python check.py
"""
import json
from pathlib import Path

from PIL import Image

from app import infer, load_models

SAMPLES = Path(__file__).resolve().parent.parent / "samples"
TOL = 0.03  # GPU+AMP (training) vs local CPU can differ slightly

meta = json.loads((SAMPLES / "metadata.json").read_text())
m = load_models()

for row in meta[:8]:
    img = Image.open(SAMPLES / row["filename"]).convert("L")
    cnn = infer(m["cnn"], img)
    vit = infer(m["vit"], img)
    assert abs(cnn["prob"] - row["cnn_prob"]) < TOL, (row["filename"], "cnn", cnn, row)
    assert abs(vit["prob"] - row["vit_prob"]) < TOL, (row["filename"], "vit", vit, row)
    print(f"{row['filename']}: cnn {cnn['prob']:.4f}~{row['cnn_prob']}  vit {vit['prob']:.4f}~{row['vit_prob']}  ok")

print("All samples within tolerance — preprocessing matches training.")
