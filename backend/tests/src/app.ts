import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless development and testing
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
}));
app.use(express.json());

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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    message: 'Terjadi kesalahan internal pada server',
    error: err.message,
  });
});

export default app;
