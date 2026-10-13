import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kantin-secret-token-key-2026';

export interface AuthUser {
  id: number;
  email: string;
  role: 'CUSTOMER' | 'SELLER';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa' });
    }
  }

  // Fallback demo/convenience header if provided
  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];
  if (headerUserId && headerUserRole) {
    req.user = {
      id: parseInt(headerUserId as string, 10),
      email: headerUserRole === 'SELLER' ? 'kantin@kampus.ac.id' : 'mahasiswa@kampus.ac.id',
      role: (headerUserRole as string).toUpperCase() === 'SELLER' ? 'SELLER' : 'CUSTOMER',
      name: headerUserRole === 'SELLER' ? 'Ibu Kantin Berkah' : 'Budi Santoso',
    };
    return next();
  }

  // Optional: pass through without blocking if route is public or has optional auth
  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Harap masuk ke akun terlebih dahulu' });
  }
  next();
};

export const requireSeller = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'SELLER') {
    return res.status(403).json({ message: 'Akses ditolak: Hanya penjual yang diizinkan' });
  }
  next();
};
