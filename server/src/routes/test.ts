import { Request, Response } from 'express';
import express from 'express';

const router = express.Router();

// Simple test endpoint that doesn't use Prisma
router.get('/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    vercel: process.env.VERCEL || 'false',
    nodeEnv: process.env.NODE_ENV || 'not set'
  });
});

export default router;
