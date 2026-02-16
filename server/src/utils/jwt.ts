import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export const generateToken = (userId: string, role: UserRole): string => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

