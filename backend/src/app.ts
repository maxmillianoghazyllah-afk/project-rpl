import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

// Middleware Keamanan CORS & Body Parsing
app.use(cors({
  origin: '*', // Diizinkan untuk testing & seamless multi-device demo
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
}));
app.use(express.json({ limit: '5mb' }));

// Safe Request Logger Middleware (Mencatat request tanpa membocorkan data rahasia)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    logger.info(
      `${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`,
      'HTTP',
      { ip: clientIp, userRole: req.headers['x-user-role'] || 'ANONYMOUS' }
    );
  });
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sistem Antrean Kantin API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Serve Frontend Production Build (Mendukung akses mandiri & subpath /kantin)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use('/kantin', express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler
app.use((req, res) => {
  logger.warn(`Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`, 'Router');
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// Sanitized Error Handling Middleware (Mencegah kebocoran stack trace database sensitif)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled Server Error pada ${req.method} ${req.originalUrl}`, 'ErrorHandler', {
    errorName: err.name,
    errorMessage: err.message,
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Terjadi kesalahan internal pada server',
    status: 'error',
  });
});

export default app;
