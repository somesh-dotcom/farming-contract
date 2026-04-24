export default function handler(req: any, res: any) {
  res.json({ 
    status: 'ok',
    message: 'Contract Farming API is running',
    timestamp: new Date().toISOString(),
    vercel: process.env.VERCEL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'not set'
  });
}
