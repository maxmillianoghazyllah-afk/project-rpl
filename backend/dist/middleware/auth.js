"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSeller = exports.requireAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'kantin-secret-token-key-2026';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        }
        catch (err) {
            return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa' });
        }
    }
    // Fallback demo/convenience header if provided
    const headerUserId = req.headers['x-user-id'];
    const headerUserRole = req.headers['x-user-role'];
    if (headerUserId && headerUserRole) {
        req.user = {
            id: parseInt(headerUserId, 10),
            email: headerUserRole === 'SELLER' ? 'kantin@kampus.ac.id' : 'mahasiswa@kampus.ac.id',
            role: headerUserRole.toUpperCase() === 'SELLER' ? 'SELLER' : 'CUSTOMER',
            name: headerUserRole === 'SELLER' ? 'Ibu Kantin Berkah' : 'Budi Santoso',
        };
        return next();
    }
    // Optional: pass through without blocking if route is public or has optional auth
    next();
};
exports.authenticate = authenticate;
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Harap masuk ke akun terlebih dahulu' });
    }
    next();
};
exports.requireAuth = requireAuth;
const requireSeller = (req, res, next) => {
    if (!req.user || req.user.role !== 'SELLER') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya penjual yang diizinkan' });
    }
    next();
};
exports.requireSeller = requireSeller;
