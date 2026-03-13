// src/index.ts
import { MainOrchestrator } from './core/MainOrchestrator';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Environment variables
dotenv.config();

// Express app
const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ana orchestrator
let orchestrator: MainOrchestrator;

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
    } catch (error: any) {
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

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/security/audit', async (req, res) => {
    try {
        const audit = await orchestrator.security.runSecurityAudit();
        res.json(audit);
    } catch (error: any) {
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
    } catch (e) {
        res.send("Dashboard not initialized yet.");
    }
});

// Başlatma fonksiyonu
async function startServer() {
    try {
        console.log('🚀 Optimus Digital Factory starting...');

        // Orchestrator'ı başlat
        orchestrator = new MainOrchestrator(process.env.NODE_ENV === 'production');
        await orchestrator.initialize();

        // Server'ı başlat
        app.listen(PORT, () => {
            console.log(`✅ Server listening on port ${PORT}`);
            console.log(`🌐 Dashboard: http://localhost:${PORT}/factory`);
            console.log(`🔧 API: http://localhost:${PORT}/api/health`);
        });

    } catch (error) {
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
