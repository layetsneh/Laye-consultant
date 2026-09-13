import { generateFollowUpWithGemini } from '../../src/lib/consultantAi';

export default async function handler(req: any, res: any) {
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
    const { ticketSubject, clientName, previousConversation, userMessage } = body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const reply = await generateFollowUpWithGemini(
      ticketSubject,
      clientName,
      previousConversation || [],
      userMessage
    );

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('Vercel API followup error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error during follow-up',
    });
  }
}
