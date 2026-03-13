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
exports.TemplateLoader = void 0;
// src/factory/core/TemplateLoader.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
class TemplateLoader {
    constructor() {
        this.templateCache = new Map();
        this.categories = [
            'social-media',
            'ecommerce',
            'seo',
            'crypto',
            'marketing',
            'development'
        ];
    }
    async loadTemplatesFromDisk(baseDir) {
        const templates = {};
        for (const category of this.categories) {
            const categoryDir = path.join(baseDir, category);
            try {
                const files = await fs.readdir(categoryDir);
                const categoryTemplates = [];
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
            }
            catch (error) {
                console.warn(`Category ${category} not found:`, error.message);
                templates[category] = [];
            }
        }
        // Cache'e kaydet
        this.templateCache.set('disk', templates);
        return templates;
    }
    async loadTemplateFromURL(url) {
        try {
            const response = await axios_1.default.get(url, { timeout: 10000 });
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
        }
        catch (error) {
            throw new Error(`Failed to load template from URL: ${error.message}`);
        }
    }
    async getTemplate(category, templateId) {
        var _a;
        // Önce cache'den bak
        if (this.templateCache.has(category)) {
            const categoryTemplates = this.templateCache.get(category);
            return categoryTemplates.find(t => t.id === templateId) || null;
        }
        // Cache'de yoksa diskten yükle
        const templates = await this.loadTemplatesFromDisk('./templates');
        this.templateCache.set(category, templates[category] || []);
        return ((_a = templates[category]) === null || _a === void 0 ? void 0 : _a.find(t => t.id === templateId)) || null;
    }
    async searchTemplates(query) {
        const allTemplates = [];
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
        return allTemplates.filter(template => {
            var _a;
            return template.name.toLowerCase().includes(query.toLowerCase()) ||
                ((_a = template.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase())) ||
                template.category.toLowerCase().includes(query.toLowerCase());
        });
    }
    async createCustomTemplate(data) {
        var _a;
        const template = {
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
        await fs.writeFile(filePath, JSON.stringify(template, null, 2), 'utf8');
        template.filePath = filePath;
        // Cache'e ekle
        if (!this.templateCache.has(data.category)) {
            this.templateCache.set(data.category, []);
        }
        (_a = this.templateCache.get(data.category)) === null || _a === void 0 ? void 0 : _a.push(template);
        return template;
    }
}
exports.TemplateLoader = TemplateLoader;
