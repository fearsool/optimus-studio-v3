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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const pg_1 = require("pg");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class Database {
    constructor(dbType = 'sqlite') {
        this.sqlite = null;
        this.postgres = null;
        this.isConnected = false;
        this.type = dbType;
    }
    async connect() {
        switch (this.type) {
            case 'sqlite':
                await this.connectSQLite();
                break;
            case 'postgres':
                await this.connectPostgres();
                break;
            case 'memory':
                await this.connectMemory();
                break;
        }
        this.isConnected = true;
        await this.initializeTables();
    }
    async connectSQLite() {
        const betterSqlite3 = await Promise.resolve().then(() => __importStar(require('better-sqlite3')));
        const dbPath = process.env.SQLITE_PATH || './data/optimus.db';
        // Veri dizinini oluştur
        await fs.mkdir(path.dirname(dbPath), { recursive: true });
        this.sqlite = new betterSqlite3.default(dbPath, {
            verbose: process.env.NODE_ENV === 'development'
                ? console.log
                : undefined
        });
        // PRAGMA ayarları
        this.sqlite.pragma('journal_mode = WAL');
        this.sqlite.pragma('foreign_keys = ON');
        this.sqlite.pragma('busy_timeout = 5000');
        console.log(`✅ SQLite connected: ${dbPath}`);
    }
    async connectPostgres() {
        this.postgres = new pg_1.Pool({
            host: process.env.PG_HOST || 'localhost',
            port: parseInt(process.env.PG_PORT || '5432'),
            database: process.env.PG_DATABASE || 'optimus',
            user: process.env.PG_USER || 'optimus',
            password: process.env.PG_PASSWORD || 'optimus123',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        // Bağlantıyı test et
        const client = await this.postgres.connect();
        try {
            const result = await client.query('SELECT NOW()');
            console.log(`✅ PostgreSQL connected: ${result.rows[0].now}`);
        }
        finally {
            client.release();
        }
    }
    async connectMemory() {
        const betterSqlite3 = await Promise.resolve().then(() => __importStar(require('better-sqlite3')));
        this.sqlite = new betterSqlite3.default(':memory:');
        console.log('✅ In-memory SQLite connected');
    }
    async initializeTables() {
        const schema = `
    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      template_id TEXT,
      zip_path TEXT,
      file_size INTEGER,
      checksum TEXT,
      customizations JSON,
      built_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      installed_at TIMESTAMP,
      installed_path TEXT,
      status TEXT DEFAULT 'active'
    );

    -- Sales table
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      payment_id TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      gateway TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      affiliate_id TEXT,
      commission_rate REAL DEFAULT 0.3,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      paid_at TIMESTAMP,
      delivered_at TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Security audits table
    CREATE TABLE IF NOT EXISTS security_audits (
      id TEXT PRIMARY KEY,
      audit_type TEXT NOT NULL,
      score INTEGER NOT NULL,
      details JSON,
      recommendations JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    );

    -- Affiliates table
    CREATE TABLE IF NOT EXISTS affiliates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      commission_rate REAL DEFAULT 0.3,
      total_earnings REAL DEFAULT 0,
      total_referrals INTEGER DEFAULT 0,
      referral_code TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    );

    -- Templates table
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      complexity INTEGER DEFAULT 1,
      steps JSON,
      required_components JSON,
      estimated_time INTEGER,
      file_path TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_sales_gateway ON sales(gateway);
    CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
    CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(referral_code);

    -- Learning Errors table
    CREATE TABLE IF NOT EXISTS learning_errors (
      id TEXT PRIMARY KEY,
      error_type TEXT NOT NULL,
      error_message TEXT,
      stack_trace TEXT,
      context JSON,
      first_occurred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_occurred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      count INTEGER DEFAULT 1,
      fixed BOOLEAN DEFAULT 0,
      fix_attempts JSON,
      learned_solution JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
        await this.runScript(schema);
        console.log('✅ Database tables initialized');
    }
    async runScript(script) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        try {
            if (this.type === 'postgres' && this.postgres) {
                await this.postgres.query(script);
            }
            else if (this.sqlite) {
                this.sqlite.exec(script);
            }
        }
        catch (error) {
            console.error('Database script error:', error);
            throw error;
        }
    }
    async execute(query, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        try {
            if (this.type === 'postgres' && this.postgres) {
                return await this.postgres.query(query, params);
            }
            else if (this.sqlite) {
                if (query.trim().toUpperCase().startsWith('SELECT')) {
                    const stmt = this.sqlite.prepare(query);
                    return params.length > 0 ? stmt.all(...params) : stmt.all();
                }
                else {
                    const stmt = this.sqlite.prepare(query);
                    return params.length > 0 ? stmt.run(...params) : stmt.run();
                }
            }
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    // Products CRUD
    async saveProduct(product) {
        const query = `
      INSERT OR REPLACE INTO products 
      (id, name, description, category, price, template_id, zip_path, 
       file_size, checksum, customizations, built_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.execute(query, [
            product.id,
            product.name,
            product.description,
            product.category,
            product.price,
            product.templateId,
            product.zipPath,
            product.fileSize,
            product.checksum,
            JSON.stringify(product.customizations || {}),
            product.builtAt.toISOString(),
            product.status || 'active'
        ]);
    }
    async getProduct(productId) {
        const query = 'SELECT * FROM products WHERE id = ?';
        const result = await this.execute(query, [productId]);
        if (this.type === 'postgres') {
            return result.rows[0] ? this.mapProduct(result.rows[0]) : null;
        }
        else {
            return result[0] ? this.mapProduct(result[0]) : null;
        }
    }
    async getProductsByCategory(category) {
        const query = 'SELECT * FROM products WHERE category = ? AND status = "active" ORDER BY built_at DESC';
        const result = await this.execute(query, [category]);
        if (this.type === 'postgres') {
            return result.rows.map(this.mapProduct);
        }
        else {
            return result.map(this.mapProduct);
        }
    }
    mapProduct(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            price: row.price,
            templateId: row.template_id,
            zipPath: row.zip_path,
            fileSize: row.file_size,
            checksum: row.checksum,
            customizations: typeof row.customizations === 'string'
                ? JSON.parse(row.customizations)
                : row.customizations,
            builtAt: new Date(row.built_at),
            installedAt: row.installed_at ? new Date(row.installed_at) : undefined,
            installedPath: row.installed_path,
            status: row.status
        };
    }
    // Sales CRUD
    async saveSale(sale) {
        var _a, _b;
        const query = `
      INSERT INTO sales 
      (id, product_id, payment_id, customer_email, customer_phone, 
       amount, currency, gateway, status, affiliate_id, commission_rate, 
       created_at, paid_at, delivered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.execute(query, [
            sale.id,
            sale.productId,
            sale.paymentId,
            sale.customerEmail,
            sale.customerPhone,
            sale.amount,
            sale.currency,
            sale.gateway,
            sale.status,
            sale.affiliateId,
            sale.commissionRate,
            sale.createdAt.toISOString(),
            (_a = sale.paidAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
            (_b = sale.deliveredAt) === null || _b === void 0 ? void 0 : _b.toISOString()
        ]);
    }
    async getDailySales(date = new Date()) {
        const dateStr = date.toISOString().split('T')[0];
        const query = `
      SELECT 
        COUNT(*) as count,
        SUM(amount) as revenue,
        gateway,
        DATE(created_at) as sale_date
      FROM sales 
      WHERE DATE(created_at) = ?
      GROUP BY gateway, DATE(created_at)
    `;
        const result = await this.execute(query, [dateStr]);
        let rows;
        if (this.type === 'postgres') {
            rows = result.rows;
        }
        else {
            rows = result;
        }
        const daily = {
            date: new Date(dateStr),
            totalSales: 0,
            totalRevenue: 0,
            byGateway: {}
        };
        for (const row of rows) {
            daily.totalSales += parseInt(row.count);
            daily.totalRevenue += parseFloat(row.revenue);
            daily.byGateway[row.gateway] = {
                count: parseInt(row.count),
                revenue: parseFloat(row.revenue)
            };
        }
        return daily;
    }
    // Security audits
    async saveAudit(audit) {
        const query = `
      INSERT INTO security_audits 
      (id, audit_type, score, details, recommendations, created_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.execute(query, [
            audit.id,
            audit.auditType,
            audit.score,
            JSON.stringify(audit.details || {}),
            JSON.stringify(audit.recommendations || []),
            audit.createdAt.toISOString(),
            audit.ipAddress,
            audit.userAgent
        ]);
    }
    async getRecentAudits(limit = 10) {
        const query = 'SELECT * FROM security_audits ORDER BY created_at DESC LIMIT ?';
        const result = await this.execute(query, [limit]);
        let rows;
        if (this.type === 'postgres') {
            rows = result.rows;
        }
        else {
            rows = result;
        }
        return rows.map(row => ({
            id: row.id,
            auditType: row.audit_type,
            score: row.score,
            details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
            recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : row.recommendations,
            createdAt: new Date(row.created_at),
            ipAddress: row.ip_address,
            userAgent: row.user_agent
        }));
    }
    // Learning Errors
    async saveLearningError(record) {
        const query = `
      INSERT OR REPLACE INTO learning_errors 
      (id, error_type, error_message, stack_trace, context, first_occurred, 
       last_occurred, count, fixed, fix_attempts, learned_solution)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await this.execute(query, [
            record.id,
            record.errorType,
            record.errorMessage,
            record.stackTrace,
            JSON.stringify(record.context || {}),
            record.firstOccurred instanceof Date ? record.firstOccurred.toISOString() : record.firstOccurred,
            record.lastOccurred instanceof Date ? record.lastOccurred.toISOString() : record.lastOccurred,
            record.count,
            record.fixed ? 1 : 0,
            JSON.stringify(record.fixAttempts || []),
            JSON.stringify(record.learnedSolution || null)
        ]);
    }
    async getLearningError(id) {
        const query = 'SELECT * FROM learning_errors WHERE id = ?';
        const result = await this.execute(query, [id]);
        const row = this.type === 'postgres' ? result.rows[0] : result[0];
        return row ? this.mapLearningError(row) : null;
    }
    async getSimilarErrors(params) {
        const query = `
            SELECT * FROM learning_errors 
            WHERE error_type = ? 
            OR error_message LIKE ?
            ORDER BY count DESC
            LIMIT 5
        `;
        const result = await this.execute(query, [params.errorType, `%${params.messageSnippet}%`]);
        const rows = this.type === 'postgres' ? result.rows : result;
        return rows.map(this.mapLearningError);
    }
    mapLearningError(row) {
        return {
            id: row.id,
            errorType: row.error_type,
            errorMessage: row.error_message,
            stackTrace: row.stack_trace,
            context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
            firstOccurred: new Date(row.first_occurred),
            lastOccurred: new Date(row.last_occurred),
            count: row.count,
            fixed: Boolean(row.fixed),
            fixAttempts: typeof row.fix_attempts === 'string' ? JSON.parse(row.fix_attempts) : row.fix_attempts,
            learnedSolution: typeof row.learned_solution === 'string' ? JSON.parse(row.learned_solution) : row.learned_solution
        };
    }
    // Backup ve restore
    async backup(filePath) {
        if (this.type !== 'sqlite' || !this.sqlite) {
            throw new Error('Backup only supported for SQLite');
        }
        await this.sqlite.backup(filePath);
        console.log(`✅ Database backed up to: ${filePath}`);
    }
    async close() {
        if (this.postgres) {
            await this.postgres.end();
        }
        if (this.sqlite) {
            this.sqlite.close();
        }
        this.isConnected = false;
        console.log('✅ Database connection closed');
    }
}
exports.Database = Database;
