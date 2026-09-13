import type { IncomingMessage, ServerResponse } from 'http';
import { analyzeInquiryWithGemini } from '../../src/lib/consultantAi';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, email, subject, complaint } = body;

    if (!name || !email || !subject || !complaint) {
      return res.status(400).json({
        error: 'Please provide all required fields: name, email, subject, and complaint.',
      });
    }

    const analysis = await analyzeInquiryWithGemini(name, email, subject, complaint);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Vercel API support analyze error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error during analysis',
    });
  }
}
