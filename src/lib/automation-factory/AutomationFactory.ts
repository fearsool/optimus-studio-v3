
import { EventBus } from '../../core/EventBus';
import { ProductBuilder, ProductBuildResult } from '../../factory/core/ProductBuilder';
import { TemplateLoader, Template } from '../../factory/core/TemplateLoader';

export interface ProductCreationRequest {
    templateId: string;
    category: string;
    customizations: Record<string, any>;
    requestedBy?: string;
}

export class AutomationFactory {
    private static instance: AutomationFactory;
    private eventBus: EventBus;
    private productBuilder: ProductBuilder;
    private templateLoader: TemplateLoader;
    private isInitialized: boolean = false;

    private constructor() {
        this.eventBus = EventBus.getInstance();
        this.productBuilder = new ProductBuilder();
        this.templateLoader = new TemplateLoader();
    }

    public static getInstance(): AutomationFactory {
        if (!AutomationFactory.instance) {
            AutomationFactory.instance = new AutomationFactory();
        }
        return AutomationFactory.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('🏭 Automation Factory Initializing...');
        // Pre-load templates
        await this.templateLoader.loadTemplatesFromDisk('./templates');

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('✅ Automation Factory Ready');
    }

    private setupEventListeners(): void {
        this.eventBus.on('task:created', async (event: any) => {
            if (event.data?.type === 'create_product') {
                console.log('🏭 Factory received produce task');
                await this.createProduct(event.data.payload);
            }
        });
    }

    public async createProduct(request: ProductCreationRequest): Promise<ProductBuildResult> {
        console.log(`🏭 Starting production: ${request.templateId}`);

        try {
            // 1. Get Template
            const template = await this.templateLoader.getTemplate(request.category, request.templateId);
            if (!template) {
                throw new Error(`Template not found: ${request.category}/${request.templateId}`);
            }

            // 2. Build Product
            const result = await this.productBuilder.buildProduct(template, request.customizations);

            if (result.success) {
                // 3. Emit Success Event
                this.eventBus.emit('factory:product:created', {
                    productId: result.productId,
                    zipPath: result.zipPath,
                    info: result.productInfo,
                    requester: request.requestedBy
                }, 'AutomationFactory');

                console.log(`✅ Product created successfully: ${result.productId}`);
            } else {
                throw new Error(result.error || 'Build failed unknown error');
            }

            return result;

        } catch (error: any) {
            console.error('❌ Production failed:', error);

            this.eventBus.emit('error:occurred', {
                error: error.message,
                context: 'AutomationFactory.createProduct',
                request
            }, 'AutomationFactory');

            return {
                success: false,
                productId: 'failed',
                error: error.message
            };
        }
    }

    public async listAvailableTemplates(category?: string): Promise<Template[]> {
        if (category) {
            const templates = await this.templateLoader.loadTemplatesFromDisk('./templates');
            return templates[category] || [];
        }
        return this.templateLoader.searchTemplates('');
    }
}
