export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL || 'https://ocnnzxazrhcqahuwbphk.supabase.co',
    supabaseKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_-57e-uHhWkivtsW5-aK6sg_avsyZRzy',
    githubRepo: 'https://github.com/layetsneh/Laye-consultant.git',
  });
}
