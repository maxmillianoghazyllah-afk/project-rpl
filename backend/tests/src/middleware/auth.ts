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
  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];

  // 1. Prioritize explicit seller role header for seller operations (demo & robust access)
  if (headerUserRole && (headerUserRole as string).toUpperCase() === 'SELLER') {
    req.user = {
      id: headerUserId ? parseInt(headerUserId as string, 10) : 2,
      email: 'kantin@kampus.ac.id',
      role: 'SELLER',
      name: 'Ibu Kantin Berkah',
    };
    return next();
  }

  // 2. Bearer token verification
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
      return next();
    } catch (err) {
      if (headerUserRole) {
        req.user = {
          id: headerUserId ? parseInt(headerUserId as string, 10) : 1,
          email: 'mahasiswa@kampus.ac.id',
          role: 'CUSTOMER',
          name: 'Mahasiswa',
        };
        return next();
      }
      return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa' });
    }
  }

  // 3. Fallback demo role if provided
  if (headerUserId && headerUserRole) {
    req.user = {
      id: parseInt(headerUserId as string, 10),
      email: (headerUserRole as string).toUpperCase() === 'SELLER' ? 'kantin@kampus.ac.id' : 'mahasiswa@kampus.ac.id',
      role: (headerUserRole as string).toUpperCase() === 'SELLER' ? 'SELLER' : 'CUSTOMER',
      name: (headerUserRole as string).toUpperCase() === 'SELLER' ? 'Ibu Kantin Berkah' : 'Mahasiswa',
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
