// src/factory/core/TemplateLoader.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

export class TemplateLoader {
    private templateCache = new Map<string, any>();
    private categories = [
        'social-media',
        'ecommerce',
        'seo',
        'crypto',
        'marketing',
        'development'
    ];

    async loadTemplatesFromDisk(baseDir: string): Promise<TemplateCollection> {
        const templates: TemplateCollection = {};

        for (const category of this.categories) {
            const categoryDir = path.join(baseDir, category);

            try {
                const files = await fs.readdir(categoryDir);
                const categoryTemplates: Template[] = [];

                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(categoryDir, file);
                        const content = await fs.readFile(filePath, 'utf8');
                        const template = JSON.parse(content);

                        categoryTemplates.push({
                            id: file.replace('.json', ''),
                            name: template.name || file,
                            description: template.description,
                            category,
                            complexity: template.complexity || 1,
                            steps: template.steps || [],
                            requiredComponents: template.requiredComponents || [],
                            estimatedTime: template.estimatedTime || 30,
                            filePath
                        });
                    }
                }

                templates[category] = categoryTemplates;

            } catch (error: any) {
                console.warn(`Category ${category} not found:`, error.message);
                templates[category] = [];
            }
        }

        // Cache'e kaydet
        this.templateCache.set('disk', templates);

        return templates;
    }

    async loadTemplateFromURL(url: string): Promise<Template> {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const template = response.data;

            return {
                id: `remote_${Date.now()}`,
                name: template.name,
                description: template.description,
                category: template.category || 'uncategorized',
                complexity: template.complexity || 2,
                steps: template.steps,
                requiredComponents: template.requiredComponents,
                estimatedTime: template.estimatedTime || 60,
                source: 'remote',
                url
            };
        } catch (error: any) {
            throw new Error(`Failed to load template from URL: ${error.message}`);
        }
    }

    async getTemplate(category: string, templateId: string): Promise<Template | null> {
        // Önce cache'den bak
        if (this.templateCache.has(category)) {
            const categoryTemplates = this.templateCache.get(category) as Template[];
            return categoryTemplates.find(t => t.id === templateId) || null;
        }

        // Cache'de yoksa diskten yükle
        const templates = await this.loadTemplatesFromDisk('./templates');
        this.templateCache.set(category, templates[category] || []);

        return templates[category]?.find(t => t.id === templateId) || null;
    }

    async searchTemplates(query: string): Promise<Template[]> {
        const allTemplates: Template[] = [];

        // Tüm kategorileri yükle
        for (const category of this.categories) {
            if (!this.templateCache.has(category)) {
                const templates = await this.loadTemplatesFromDisk('./templates');
                this.templateCache.set(category, templates[category] || []);
            }

            const categoryTemplates = this.templateCache.get(category) || [];
            allTemplates.push(...categoryTemplates);
        }

        // Arama
        return allTemplates.filter(template =>
            template.name.toLowerCase().includes(query.toLowerCase()) ||
            template.description?.toLowerCase().includes(query.toLowerCase()) ||
            template.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    async createCustomTemplate(data: TemplateCreationData): Promise<Template> {
        const template: Template = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            description: data.description,
            category: data.category,
            complexity: data.complexity || 1,
            steps: data.steps,
            requiredComponents: data.requiredComponents,
            estimatedTime: data.estimatedTime || 45,
            customFields: data.customFields,
            createdAt: new Date(),
            createdBy: data.createdBy || 'system'
        };

        // Dosyaya kaydet
        const templateDir = path.join('./templates', data.category);
        await fs.mkdir(templateDir, { recursive: true });

        const filePath = path.join(templateDir, `${template.id}.json`);
        await fs.writeFile(
            filePath,
            JSON.stringify(template, null, 2),
            'utf8'
        );

        template.filePath = filePath;

        // Cache'e ekle
        if (!this.templateCache.has(data.category)) {
            this.templateCache.set(data.category, []);
        }
        this.templateCache.get(data.category)?.push(template);

        return template;
    }
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    category: string;
    complexity: number; // 1-5
    steps: any[];
    requiredComponents: string[];
    estimatedTime: number; // minutes
    filePath?: string;
    source?: 'disk' | 'remote';
    url?: string;
    customFields?: Record<string, any>;
    createdAt?: Date;
    createdBy?: string;
}

export interface TemplateCollection {
    [category: string]: Template[];
}

export interface TemplateCreationData {
    name: string;
    description: string;
    category: string;
    steps: any[];
    requiredComponents: string[];
    complexity?: number;
    estimatedTime?: number;
    customFields?: Record<string, any>;
    createdBy?: string;
}
