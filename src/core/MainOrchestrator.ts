// src/core/MainOrchestrator.ts
import { SecurityOrchestrator } from '../agent/security/SecurityOrchestrator';
import { TemplateLoader } from '../factory/core/TemplateLoader';
import { ProductBuilder } from '../factory/core/ProductBuilder';
import { PaymentProcessor } from '../factory/sales/PaymentProcessor';
import { Database } from '../app/core/Database';
import { WhatsAppConnector } from '../agent/connectors/WhatsAppConnector';
import { WebAutomation } from '../agent/web/WebAutomation';
import { EventBus } from './EventBus';

export class MainOrchestrator {
    public security: SecurityOrchestrator;
    private templateLoader: TemplateLoader;
    private productBuilder: ProductBuilder;
    private paymentProcessor: PaymentProcessor;
    private database: Database;
    private whatsApp: WhatsAppConnector;
    private webAutomation: WebAutomation;

    private isInitialized = false;
    private productionMode: boolean;

    constructor(productionMode: boolean = false) {
        this.productionMode = productionMode;

        this.security = new SecurityOrchestrator();
        this.templateLoader = new TemplateLoader();
        this.productBuilder = new ProductBuilder();
        this.paymentProcessor = new PaymentProcessor(!productionMode);
        this.database = new Database(productionMode ? 'postgres' : 'sqlite');
        this.whatsApp = new WhatsAppConnector();
        this.webAutomation = new WebAutomation();
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('🔄 Orchestrator already initialized');
            return;
        }

        console.log('🚀 OPTIMUS DIGITAL FACTORY - Initializing...');

        try {
            // 1. Veritabanı bağlantısı
            await this.database.connect();

            // 2. Güvenlik sistemi
            await this.security.initialize();

            // 3. WhatsApp bağlantısı (isteğe bağlı)
            if (process.env.WHATSAPP_ENABLED === 'true') {
                try {
                    // Check if initialize exists before calling (assuming partial implementation)
                    // Or just await it if we are confident.
                    await this.whatsApp.initialize();
                } catch (e) {
                    console.warn("WhatsApp initialization failed, continuing without it.");
                }
            }

            // 4. Template'leri yükle
            const templates = await this.templateLoader.loadTemplatesFromDisk('./templates');
            console.log(`📚 ${Object.values(templates).flat().length} templates loaded`);

            // 5. Güvenlik audit'i çalıştır
            const audit = await this.security.runSecurityAudit();
            console.log(`🛡️  Security score: ${audit.overallScore}%`);

            // 6. Sistem durumunu kaydet
            await this.saveSystemStatus('initialized');

            this.isInitialized = true;

            // Initialize EventBus integration
            const eventBus = EventBus.getInstance();
            eventBus.emit('system:init', {
                component: 'MainOrchestrator',
                productionMode: this.productionMode,
                securityScore: audit.overallScore,
                templatesLoaded: Object.values(templates).flat().length
            }, 'MainOrchestrator');

            console.log('✅ OPTIMUS DIGITAL FACTORY - Bridge to Agent Established');
            console.log('================================================');
            console.log('🎯 Available Commands:');
            console.log('   create-product <category> <template>');
            console.log('   mass-produce <category>');
            console.log('   run-sales-pipeline');
            console.log('   security-audit');
            console.log('   show-dashboard');
            console.log('================================================');

            // WhatsApp'tan bildir
            await this.sendInitializationNotification();

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            throw error;
        }
    }

    // ANA İŞLEMLER

    async createProduct(category: string, templateId: string, customizations?: any): Promise<ProductCreationResult> {
        this.ensureInitialized();

        console.log(`🏭 Creating product: ${category}/${templateId}`);

        try {
            // 1. Template'i yükle
            const template = await this.templateLoader.getTemplate(category, templateId);
            if (!template) {
                throw new Error(`Template not found: ${category}/${templateId}`);
            }

            // 2. Ürünü oluştur
            const buildResult = await this.productBuilder.buildProduct(template, customizations);
            if (!buildResult.success || !buildResult.productInfo) {
                throw new Error(`Build failed: ${buildResult.error}`);
            }

            // 3. Veritabanına kaydet
            await this.database.saveProduct({
                id: buildResult.productInfo.id,
                name: buildResult.productInfo.name,
                description: buildResult.productInfo.description,
                category: buildResult.productInfo.category,
                price: customizations?.price || 49.99,
                templateId: template.id,
                zipPath: buildResult.productInfo.zipPath,
                fileSize: buildResult.productInfo.fileSize,
                checksum: buildResult.productInfo.checksum,
                customizations: buildResult.productInfo.customizations,
                builtAt: buildResult.productInfo.buildDate,
                status: 'active'
            });

            // 4. WhatsApp bildirimi
            await this.whatsApp.sendMessage(
                process.env.ADMIN_PHONE!,
                `✅ Yeni ürün oluşturuldu!\n\n` +
                `Ürün: ${buildResult.productInfo.name}\n` +
                `Kategori: ${category}\n` +
                `Boyut: ${(buildResult.productInfo.fileSize / 1024 / 1024).toFixed(2)} MB\n` +
                `Dosya: ${buildResult.productInfo.zipPath}\n` +
                `SHA256: ${buildResult.productInfo.checksum.substring(0, 16)}...`
            );

            return {
                success: true,
                product: buildResult.productInfo,
                template,
                buildResult
            };

        } catch (error: any) {
            console.error('Product creation failed:', error);

            if (process.env.ADMIN_PHONE) {
                await this.whatsApp.sendMessage(
                    process.env.ADMIN_PHONE,
                    `❌ Ürün oluşturma hatası!\n\n` +
                    `Kategori: ${category}\n` +
                    `Template: ${templateId}\n` +
                    `Hata: ${error.message}`
                );
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    async massProduce(category: string, count: number = 5): Promise<MassProductionResult> {
        this.ensureInitialized();

        console.log(`🏭🏭 Mass production started: ${category} x${count}`);

        const results: ProductCreationResult[] = [];
        const startTime = Date.now();

        try {
            // Kategorideki tüm template'leri al
            const templates = await this.templateLoader.searchTemplates(category);

            if (templates.length === 0) {
                throw new Error(`No templates found for category: ${category}`);
            }

            // Her template'den ürün oluştur
            for (let i = 0; i < Math.min(count, templates.length); i++) {
                const template = templates[i];

                console.log(`  ${i + 1}/${Math.min(count, templates.length)} - ${template.name}`);

                const result = await this.createProduct(
                    category,
                    template.id,
                    {
                        productName: `${template.name} #${i + 1}`,
                        price: this.calculatePrice(template.complexity)
                    }
                );

                results.push(result);

                // Her 2 üründe bir bekle
                if ((i + 1) % 2 === 0) {
                    await this.sleep(2000);
                }
            }

            const duration = Date.now() - startTime;
            const successful = results.filter(r => r.success).length;

            // Rapor oluştur
            const report: MassProductionReport = {
                category,
                total: results.length,
                successful,
                failed: results.length - successful,
                duration,
                averageTimePerProduct: duration / results.length,
                products: results.filter(r => r.success).map(r => r.product!),
                timestamp: new Date()
            };

            // WhatsApp raporu
            await this.sendMassProductionReport(report);

            return {
                success: true,
                report
            };

        } catch (error: any) {
            console.error('Mass production failed:', error);
            return {
                success: false,
                error: error.message,
                completed: results.length,
                total: count
            };
        }
    }

    async runSalesPipeline(productIds: string[]): Promise<SalesPipelineResult> {
        this.ensureInitialized();

        console.log(`💰 Sales pipeline started for ${productIds.length} products`);

        const salesResults: SaleResult[] = [];

        try {
            // Her ürün için satış kanalı oluştur
            for (const productId of productIds) {
                const product = await this.database.getProduct(productId);
                if (!product) {
                    console.warn(`Product not found: ${productId}`);
                    continue;
                }

                console.log(`  Setting up sales for: ${product.name}`);

                // Stripe ürünü oluştur
                const stripeProduct = await this.paymentProcessor.createStripeProduct({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category
                });

                // PayPal order oluştur
                const paypalOrder = await this.paymentProcessor.createPayPalOrder({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category
                });

                // Crypto payment seçeneği
                const cryptoPayment = await this.paymentProcessor.setupCryptoPayment({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category
                }, 'BTC');

                salesResults.push({
                    productId: product.id,
                    productName: product.name,
                    stripe: {
                        productId: stripeProduct.productId,
                        sessionId: stripeProduct.sessionId,
                        url: stripeProduct.url
                    },
                    paypal: {
                        orderId: paypalOrder.orderId,
                        approveUrl: paypalOrder.approveUrl
                    },
                    crypto: cryptoPayment,
                    setupAt: new Date()
                });

                // Veritabanına kaydet
                await this.database.saveSale({
                    id: `sale_${Date.now()}_${product.id}`,
                    productId: product.id,
                    paymentId: stripeProduct.sessionId,
                    amount: product.price,
                    currency: 'USD',
                    gateway: 'stripe',
                    status: 'pending',
                    createdAt: new Date()
                });
            }

            // Satış dashboard linki oluştur
            const dashboardUrl = await this.createSalesDashboard(salesResults);

            return {
                success: true,
                salesResults,
                dashboardUrl,
                totalProducts: productIds.length,
                estimatedRevenue: salesResults.reduce((sum, r) => sum + 49.99, 0)
            };

        } catch (error: any) {
            console.error('Sales pipeline failed:', error);
            return {
                success: false,
                error: error.message,
                completedSales: salesResults.length
            };
        }
    }

    // YARDIMCI METODLAR

    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('Orchestrator not initialized. Call initialize() first.');
        }
    }

    private calculatePrice(complexity: number): number {
        const basePrice = 49.99;
        return basePrice * complexity;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async saveSystemStatus(status: string): Promise<void> {
        // Sistem durumunu EventBus üzerinden bildir
        EventBus.getInstance().emit('system:status', { status, productionMode: this.productionMode }, 'MainOrchestrator');
        console.log(`📝 System status: ${status}`);
    }

    private async sendInitializationNotification(): Promise<void> {
        if (!process.env.ADMIN_PHONE) return;

        await this.whatsApp.sendMessage(
            process.env.ADMIN_PHONE,
            `🚀 OPTIMUS FACTORY BAŞLATILDI!\n\n` +
            `Tarih: ${new Date().toLocaleString('tr-TR')}\n` +
            `Mod: ${this.productionMode ? 'PRODUCTION' : 'DEVELOPMENT'}\n` +
            `Database: ${this.productionMode ? 'PostgreSQL' : 'SQLite'}\n` +
            `Ödeme: ${this.productionMode ? 'LIVE' : 'SANDBOX'}\n\n` +
            `Sistem hazır ve çalışıyor.`
        );
    }

    private async sendMassProductionReport(report: MassProductionReport): Promise<void> {
        if (!process.env.ADMIN_PHONE) return;

        const successRate = ((report.successful / report.total) * 100).toFixed(1);

        await this.whatsApp.sendMessage(
            process.env.ADMIN_PHONE,
            `🏭🏭 TOPLU ÜRETİM RAPORU\n\n` +
            `Kategori: ${report.category}\n` +
            `Toplam: ${report.total} ürün\n` +
            `Başarılı: ${report.successful} ürün\n` +
            `Başarı Oranı: ${successRate}%\n` +
            `Süre: ${(report.duration / 1000).toFixed(1)} saniye\n` +
            `Ortalama: ${report.averageTimePerProduct.toFixed(0)} ms/ürün\n\n` +
            `💰 Tahmini Değer: $${(report.successful * 49.99).toFixed(2)}`
        );
    }

    private async createSalesDashboard(salesResults: SaleResult[]): Promise<string> {
        // Basit bir dashboard sayfası oluştur
        const dashboardId = `dashboard_${Date.now()}`;
        const dashboardPath = `./dashboards/${dashboardId}.html`;

        const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Optimus Sales Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 10px 15px; margin: 5px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .crypto { background: #f7931a; }
      </style>
    </head>
    <body>
      <h1>Optimus Sales Dashboard</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      
      ${salesResults.map(sale => `
      <div class="product">
        <h3>${sale.productName}</h3>
        <a href="${sale.stripe.url}" class="button" target="_blank">💳 Buy with Stripe</a>
        <a href="${sale.paypal.approveUrl}" class="button" target="_blank">📱 Buy with PayPal</a>
        <a href="#" class="button crypto" onclick="showCrypto('${sale.crypto.paymentId}')">₿ Buy with Crypto</a>
      </div>
      `).join('')}
      
      <script>
        function showCrypto(paymentId) {
          alert('Crypto payment details for: ' + paymentId);
        }
      </script>
    </body>
    </html>
    `;

        const fs = await import('fs/promises');
        await fs.mkdir('./dashboards', { recursive: true });
        await fs.writeFile(dashboardPath, html, 'utf8');

        return dashboardPath;
    }
}

// Type Definitions
export interface ProductCreationResult {
    success: boolean;
    product?: any;
    template?: any;
    buildResult?: any;
    error?: string;
}

export interface MassProductionResult {
    success: boolean;
    report?: MassProductionReport;
    error?: string;
    completed?: number;
    total?: number;
}

export interface MassProductionReport {
    category: string;
    total: number;
    successful: number;
    failed: number;
    duration: number;
    averageTimePerProduct: number;
    products: any[];
    timestamp: Date;
}

export interface SaleResult {
    productId: string;
    productName: string;
    stripe: {
        productId: string;
        sessionId: string;
        url: string;
    };
    paypal: {
        orderId: string;
        approveUrl: string;
    };
    crypto: any;
    setupAt: Date;
}

export interface SalesPipelineResult {
    success: boolean;
    salesResults?: SaleResult[];
    dashboardUrl?: string;
    totalProducts?: number;
    estimatedRevenue?: number;
    error?: string;
    completedSales?: number;
}
