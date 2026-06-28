import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load local environment variables
dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Basic CORS header middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post(['/', '/api/infer'], upload.single('image'), async (req: express.Request, res: express.Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is not configured. Please add it to your environment variables or local .env file.'
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No chest X-ray image file provided.' });
  }

  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const promptText = `Analyze this chest X-ray image for Cardiomegaly.
You must simulate the output of two distinct deep learning models trained on NIH chest X-rays of elderly patients (ages 60-100):
1. CNN (DenseNet-121): Trained on binary classification. It has an AUC of 0.808.
2. Vision Transformer (ViT-B/16): Trained on the same dataset. It has an AUC of 0.849.

Determine if the heart size is normal or enlarged (Cardiomegaly). Calculate or estimate the Cardiothoracic Ratio (CTR) visually:
- CTR = (Cardiac width / Thoracic width).
- A CTR > 0.50 generally indicates Cardiomegaly.

Replicate both model outputs. Keep in mind:
- Both models should generally align, but they can show slight differences in confidence.
- ViT-B/16 is slightly more sensitive and accurate.
- If Cardiomegaly is present:
  - Return high probabilities for both (e.g. 0.65 to 0.98).
  - Set the labels to "Cardiomegaly".
- If Normal:
  - Return low probabilities for both (e.g. 0.05 to 0.45).
  - Set the labels to "Normal".

Provide the output in the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: promptText }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            densenet: {
              type: "OBJECT",
              properties: {
                prob: { type: "NUMBER", description: "Probability of cardiomegaly, between 0.0 and 1.0" },
                label: { type: "STRING", enum: ["Cardiomegaly", "Normal"] }
              },
              required: ["prob", "label"]
            },
            vit: {
              type: "OBJECT",
              properties: {
                prob: { type: "NUMBER", description: "Probability of cardiomegaly, between 0.0 and 1.0" },
                label: { type: "STRING", enum: ["Cardiomegaly", "Normal"] }
              },
              required: ["prob", "label"]
            }
          },
          required: ["densenet", "vit"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('Empty response received from Gemini.');
    }

    const prediction = JSON.parse(jsonText);

    const formatOutput = (prob: number, label: string) => {
      const isPositive = label === 'Cardiomegaly';
      const confidence = isPositive ? prob : 1 - prob;
      return {
        prob: parseFloat(prob.toFixed(4)),
        label: label,
        confidence: parseFloat(confidence.toFixed(4))
      };
    };

    res.json({
      source: 'gemini',
      densenet: formatOutput(prediction.densenet.prob, prediction.densenet.label),
      vit: formatOutput(prediction.vit.prob, prediction.vit.label)
    });

  } catch (err: any) {
    console.error('Gemini Inference Error:', err);
    res.status(500).json({
      error: `Gemini serverless inference failed: ${err.message || err}`
    });
  }
});

// Run server locally if not imported by Vercel serverless loader
const port = process.env.PORT || 8000;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Gemini serverless replica local API running at http://localhost:${port}`);
  });
}

export default app;
