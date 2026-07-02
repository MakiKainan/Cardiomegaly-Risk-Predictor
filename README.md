# Cardiovascular Risk Prediction — Research Landing Page

An interactive single-page web app presenting research on **cardiomegaly detection in chest X-rays of elderly patients (ages 60–100)** using the NIH ChestX-ray14 dataset. It compares two deep-learning architectures — **DenseNet-121 (CNN)** and **ViT-B/16 (Vision Transformer)** — and explains their decisions with LIME and SHAP.

This is the companion site to the research notebook in the parent repo.

## Sections

- **Hero** — animated title over a medical-imaging backdrop.
- **Research Overview** — the study, dataset, and headline metrics.
- **Model Comparison** — CNN vs ViT across AUC-ROC, Accuracy, Precision, Recall, and F1, with animated bar charts.
- **Explainability (XAI)** — LIME and SHAP write-ups.
- **Try the Demo** — drag-and-drop (or pick a sample) chest X-ray and get a side-by-side dual-model prediction. The inference is **simulated client-side** for demonstration; no images leave the browser.

## Results (test set)

| Metric    | CNN (DenseNet-121) | ViT-B/16 |
|-----------|:------------------:|:--------:|
| AUC-ROC   | 0.8229             | 0.8483   |
| Accuracy  | 0.7473             | 0.7834   |
| Precision | 0.7619             | 0.7547   |
| Recall    | 0.5614             | 0.7018   |
| F1 Score  | 0.6465             | 0.7273   |

ViT-B/16 is the stronger model overall, attending to clinically meaningful bilateral cardiac borders.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4. Scroll reveals use a native `IntersectionObserver` hook; the rest of the motion is CSS animations.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev      # dev server on http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # type-check (tsc --noEmit)
```


