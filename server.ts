import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache audio responses in-memory so playback is instant
const audioCache = new Map<string, string>();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Kurdish Sorani Text-To-Speech endpoint using Gemini TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, type = 'welcome' } = req.body;

    const targetText =
      text ||
      (type === 'welcome'
        ? 'بەخێربێن، خۆشحاڵین بە هاتنتان. دەتوانیت لە ڕێگەی گۆگڵەوە خۆت تۆمار بکەیت، وە ئەگەر گۆگڵت نییە بە ژمارەی مۆبایل بچۆرە ژوورەوە.'
        : 'بەخێربێیت بۆ پلاتفۆرمی زێڕین، پیرۆزە خۆتۆمارکردنەکەت بەسەرکەوتوویی ئەنجامدرا.');

    // Check cache
    if (audioCache.has(targetText)) {
      return res.json({ audio: audioCache.get(targetText), cached: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: targetText,
              speechMetadata: {
                style: 'Gentle, natural and friendly Kurdish female voice speaking clear Sorani Kurdish. Pure human spoken speech without background music or sound effects.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from model' });
    }

    // Cache the result
    audioCache.set(targetText, base64Audio);

    res.json({ audio: base64Audio });
  } catch (err: unknown) {
    console.error('Server TTS error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Error generating Kurdish speech',
    });
  }
});

// Setup static serving or Vite middleware
const distPath = path.join(__dirname, 'dist');
const distIndex = path.join(distPath, 'index.html');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distIndex);

if (isProduction && fs.existsSync(distIndex)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(distIndex);
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const indexHtml = path.join(__dirname, 'index.html');
      let template = fs.readFileSync(indexHtml, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      next(e);
    }
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
