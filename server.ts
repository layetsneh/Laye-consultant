import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeInquiryWithGemini, generateFollowUpWithGemini } from './src/lib/consultantAi';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Laye Consultant API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// System config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL || 'https://ocnnzxazrhcqahuwbphk.supabase.co',
    supabaseKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_-57e-uHhWkivtsW5-aK6sg_avsyZRzy',
    githubRepo: 'https://github.com/layetsneh/Laye-consultant.git',
  });
});

// AI Ticket Generation Endpoint
app.post('/api/support/analyze', async (req, res) => {
  try {
    const { name, email, subject, complaint } = req.body;

    if (!name || !email || !subject || !complaint) {
      return res.status(400).json({
        error: 'Please provide all required fields: name, email, subject, and complaint.',
      });
    }

    const analysis = await analyzeInquiryWithGemini(name, email, subject, complaint);

    return res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process AI support response.',
    });
  }
});

// Follow-up conversation endpoint
app.post('/api/support/followup', async (req, res) => {
  try {
    const { ticketSubject, clientName, previousConversation, userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const reply = await generateFollowUpWithGemini(
      ticketSubject,
      clientName,
      previousConversation || [],
      userMessage
    );

    return res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('Follow-up error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate follow-up reply.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laye Consultant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
