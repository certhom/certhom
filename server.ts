import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface GuidanceRequestBody {
  mood?: string;
  moodIntensity?: number;
  energy?: number;
  stress?: number;
  focusType?: string;
  feelingNote?: string;
  ideaNote?: string;
  goalText?: string;
  linkedDimensionLabel?: string;
  activities?: string[];
  promptResponses?: Array<{ category: string; prompt: string; response: string }>;
  wheelScores?: Record<string, number>;
  recentMoodSummary?: string;
}

interface MindfulnessRequestBody {
  wheelScores?: Record<string, number>;
  lowestDimensions?: Array<{ label: string; score: number }>;
  latestMood?: string;
  avgMood?: number;
  avgEnergy?: number;
  avgStress?: number;
  topActivities?: Array<{ activity: string; avgMood: number }>;
  recentGoals?: string[];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/guidance', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to generate personalized guidance.',
      });
      return;
    }

    const body = (req.body || {}) as GuidanceRequestBody;
    const wheelSummary = body.wheelScores
      ? Object.entries(body.wheelScores)
          .map(([k, v]) => `${k}: ${Number(v).toFixed(1)}/10`)
          .join(', ')
      : 'Not provided';

    const promptQa = (body.promptResponses || [])
      .filter((p) => p.response && p.response.trim().length > 0)
      .map((p) => `- [${p.category}] ${p.prompt} -> "${p.response.trim()}"`)
      .join('\n');

    const prompt = [
      'A user just completed a daily check-in in Sweet Spot, a calming Wheel of Life & mood reflection app.',
      `Current emotional state: ${body.mood || 'Reflective'} (intensity ${body.moodIntensity ?? 3}/5).`,
      `Energy: ${body.energy ?? 3}/5, Stress: ${body.stress ?? 3}/5.`,
      `Primary check-in focus: ${body.focusType || 'Goal'}.`,
      body.activities && body.activities.length > 0 ? `Recent activities logged: ${body.activities.join(', ')}.` : '',
      body.feelingNote ? `Feelings shared: "${body.feelingNote}"` : '',
      body.ideaNote ? `Ideas shared: "${body.ideaNote}"` : '',
      body.goalText ? `Goal or intention: "${body.goalText}"` : 'No specific goal written yet — gently suggest practical next steps based on their mood and lowest life balance area.',
      body.linkedDimensionLabel ? `Linked Wheel of Life dimension: ${body.linkedDimensionLabel}.` : '',
      promptQa ? `Daily reflection prompt responses:\n${promptQa}` : '',
      `Current Wheel of Life scores: ${wheelSummary}.`,
      body.recentMoodSummary ? `Recent mood pattern: ${body.recentMoodSummary}.` : '',
      '',
      'Provide:',
      '1. Exactly 3 realistic, gentle, concrete tips to make progress on their goal or intention today without overwhelm.',
      '2. One tailored mindfulness recommendation suited to their exact energy, stress, and emotional state.',
      '3. One brief, grounded reflection note (2 sentences max, warm and clear, zero clichés or hype).',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a calm, thoughtful life-balance and mindfulness coach for Sweet Spot. Keep language grounded, compassionate, concise, and practical. Never use hollow clichés, exclamation marks, or hustle-culture jargon.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goalTips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Short 4-7 word actionable step title' },
                    detail: { type: Type.STRING, description: '1-2 clear sentences explaining how to carry out this step today' },
                  },
                  required: ['title', 'detail'],
                },
              },
              mindfulness: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'One of: Breathwork, Grounding, Journaling, Movement, Body Scan' },
                  durationMinutes: { type: Type.INTEGER },
                  whyItFits: { type: Type.STRING, description: '1 concise sentence connecting this practice to their current mood and Wheel scores' },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 to 4 brief, clear guided steps',
                  },
                },
                required: ['title', 'category', 'durationMinutes', 'whyItFits', 'steps'],
              },
              reflectionNote: {
                type: Type.STRING,
                description: 'A calm 1-2 sentence perspective note tailored to what they shared',
              },
            },
            required: ['goalTips', 'mindfulness', 'reflectionNote'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate guidance right now.';
      console.error('Gemini /api/guidance error:', message);
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/mindfulness', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets to refresh personalized recommendations.',
      });
      return;
    }

    const body = (req.body || {}) as MindfulnessRequestBody;
    const lowest = (body.lowestDimensions || [])
      .map((d) => `${d.label} (${d.score.toFixed(1)}/10)`)
      .join(', ');
    const wheelSummary = body.wheelScores
      ? Object.entries(body.wheelScores)
          .map(([k, v]) => `${k}: ${Number(v).toFixed(1)}/10`)
          .join(', ')
      : 'Not provided';
    const actSummary = (body.topActivities || [])
      .map((a) => `${a.activity} (avg mood ${a.avgMood}/5)`)
      .join(', ');

    const prompt = [
      'Analyze the user’s mood tracking data and Wheel of Life scores to generate 3 distinct, personalized mindfulness exercises, meditations, or actionable tips.',
      `Latest mood: ${body.latestMood || 'Reflective'}.`,
      `Average mood: ${body.avgMood?.toFixed(1) ?? '3.5'}/5, Average energy: ${body.avgEnergy?.toFixed(1) ?? '3.0'}/5, Average stress: ${body.avgStress?.toFixed(1) ?? '3.0'}/5.`,
      lowest ? `Struggling Wheel of Life areas needing care: ${lowest}.` : '',
      actSummary ? `Activities correlated with higher mood: ${actSummary}.` : '',
      `Full Wheel of Life scores: ${wheelSummary}.`,
      body.recentGoals && body.recentGoals.length > 0
        ? `Recent user goals: ${body.recentGoals.slice(0, 3).join(' | ')}.`
        : '',
      'Create 3 varied, practical recommendations (for example one breathwork/meditation, one cognitive/journaling exercise, and one actionable micro-habit tip) directly addressing their lowest Wheel dimensions and mood/stress pattern.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a grounded mindfulness educator. Offer evidence-informed, soothing practices with clear step-by-step instructions. Avoid overly mystical language or empty platitudes.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'Breathwork, Grounding, Journaling, Movement, or Body Scan' },
                    durationMinutes: { type: Type.INTEGER },
                    targetDimension: { type: Type.STRING, description: 'Which life area or mood state this supports' },
                    whyItFits: { type: Type.STRING },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['title', 'category', 'durationMinutes', 'targetDimension', 'whyItFits', 'steps'],
                },
              },
            },
            required: ['recommendations'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate mindfulness recommendations.';
      console.error('Gemini /api/mindfulness error:', message);
      res.status(502).json({ error: message });
    }
  });

  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Stillpoint server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
