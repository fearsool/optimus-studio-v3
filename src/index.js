"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const MainOrchestrator_1 = require("./core/MainOrchestrator");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Environment variables
dotenv.config();
// Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3005;
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path.join(__dirname, '../public')));
// Ana orchestrator
let orchestrator;
// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'optimus-factory'
    });
});
app.get('/api/factory/status', async (req, res) => {
    try {
        res.json({
            initialized: orchestrator ? true : false,
            productionMode: process.env.NODE_ENV === 'production',
            uptime: process.uptime()
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/factory/create-product', async (req, res) => {
    try {
        const { category, template, customizations } = req.body;
        if (!category || !template) {
            return res.status(400).json({ error: 'category and template required' });
        }
        const result = await orchestrator.createProduct(category, template, customizations);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/security/audit', async (req, res) => {
    try {
        const audit = await orchestrator.security.runSecurityAudit();
        res.json(audit);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Dashboard route
app.get('/factory', (req, res) => {
    // If no dashboard exists (first run), serve a simple placeholder or the one created by mass production
    // Ideally this should serve the public/factory-dashboard.html static file
    // but for now we'll serve a simple response if file not found
    try {
        res.sendFile(path.join(__dirname, '../public/factory-dashboard.html'));
    }
    catch (e) {
        res.send("Dashboard not initialized yet.");
    }
});
// Başlatma fonksiyonu
async function startServer() {
    try {
        console.log('🚀 Optimus Digital Factory starting...');
        // Orchestrator'ı başlat
        orchestrator = new MainOrchestrator_1.MainOrchestrator(process.env.NODE_ENV === 'production');
        await orchestrator.initialize();
        // Server'ı başlat
        app.listen(PORT, () => {
            console.log(`✅ Server listening on port ${PORT}`);
            console.log(`🌐 Dashboard: http://localhost:${PORT}/factory`);
            console.log(`🔧 API: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error('❌ Startup failed:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    if (orchestrator) {
        // Cleanup operations
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down...');
    process.exit(0);
});
// Başlat
startServer();
