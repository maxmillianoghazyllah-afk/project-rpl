"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for seamless development and testing
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
}));
app.use(express_1.default.json());
// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Sistem Antrean Kantin API',
        time: new Date().toISOString(),
    });
});
// API Routes
app.use('/api', routes_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled API Error:', err);
    res.status(500).json({
        message: 'Terjadi kesalahan internal pada server',
        error: err.message,
    });
});
exports.default = app;
