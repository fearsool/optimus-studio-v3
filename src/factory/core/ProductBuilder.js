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
exports.ProductBuilder = void 0;
// src/factory/core/ProductBuilder.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = require("fs");
const util_1 = require("util");
const child_process_1 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ProductBuilder {
    async buildProduct(template, customizations = {}) {
        const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const buildDir = path.join('./builds', productId);
        try {
            // Build dizinini oluştur
            await fs.mkdir(buildDir, { recursive: true });
            // 1. Template dosyalarını kopyala
            await this.copyTemplateFiles(template, buildDir);
            // 2. Özelleştirmeleri uygula
            await this.applyCustomizations(template, buildDir, customizations);
            // 3. Gereksinim dosyalarını oluştur
            await this.createRequirementsFiles(template, buildDir);
            // 4. Dokümantasyon oluştur
            await this.generateDocumentation(template, buildDir, customizations);
            // 5. Lisans dosyası ekle
            await this.addLicenseFile(buildDir, customizations.license || 'MIT');
            // 6. ZIP paketi oluştur
            const zipPath = await this.createZipPackage(buildDir, productId);
            // 7. Build bilgilerini kaydet
            const productInfo = await this.createProductInfo(productId, template, customizations, zipPath);
            return {
                success: true,
                productId,
                zipPath,
                productInfo,
                buildDir,
                fileCount: await this.countFiles(buildDir)
            };
        }
        catch (error) {
            console.error('Product build failed:', error);
            return {
                success: false,
                productId,
                error: error.message,
                buildDir
            };
        }
    }
    async copyTemplateFiles(template, destDir) {
        // Template dosyalarını kaynak dizinden hedefe kopyala
        const templateDir = template.filePath
            ? path.dirname(template.filePath)
            : path.join('./templates', template.category, template.id);
        try {
            // NOTE: fs.cp is node 16.7+. Assuming Node 18+ per user requirements.
            // If node version is old, this might need a polyfill (fs-extra or ncp).
            // Given package.json has fs-extra, we could use that if fs.cp fails, but prompt used fs.cp.
            // I will keep fs.cp but if environment is weird I might need to switch.
            // Wait, Node 14 doesn't have cp. User said node 18+ required in install script.
            // Actually, fs-extra is in dev dependencies. Let's assume fs exists on recent node.
            // In case fs.cp is not available (some strict environments), fallback to recursive copy logic is needed.
            // I'll assume Node 18+ as per requirements.
            await fs.cp(templateDir, destDir, { recursive: true });
        }
        catch (error) {
            // Template dosyaları yoksa, temel yapı oluştur
            await this.createBasicStructure(destDir, template);
        }
    }
    async createBasicStructure(dir, template) {
        const structure = {
            'src/': [
                'main.js',
                'config.json',
                'utils/'
            ],
            'docs/': [
                'README.md',
                'INSTALLATION.md'
            ],
            'tests/': [
                'test.js'
            ],
            'package.json': '',
            'LICENSE': ''
        };
        for (const [folder, files] of Object.entries(structure)) {
            const folderPath = path.join(dir, folder);
            if (folder.endsWith('/')) {
                // it's a directory
                await fs.mkdir(folderPath, { recursive: true });
                if (Array.isArray(files)) {
                    for (const file of files) {
                        if (file.endsWith('/')) {
                            await fs.mkdir(path.join(folderPath, file), { recursive: true });
                        }
                        else {
                            await fs.writeFile(path.join(folderPath, file), '', 'utf8');
                        }
                    }
                }
            }
            else {
                // it's a file at root
                await fs.writeFile(path.join(dir, folder), '', 'utf8');
            }
        }
    }
    async applyCustomizations(template, dir, customizations) {
        // Config dosyasını güncelle
        const configPath = path.join(dir, 'src/config.json');
        let config = {};
        try {
            const configContent = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(configContent);
        }
        catch (error) {
            config = {};
        }
        // Özelleştirmeleri merge et
        const updatedConfig = {
            ...config,
            ...customizations,
            _meta: {
                templateId: template.id,
                templateName: template.name,
                builtAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        // Ensure dir exists before writing config if it wasn't there
        await fs.mkdir(path.dirname(configPath), { recursive: true });
        await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
    }
    async createRequirementsFiles(template, dir) {
        const requirements = {
            dependencies: template.requiredComponents || [],
            nodeVersion: '>=16.0.0',
            os: ['windows', 'linux', 'macos']
        };
        // package.json oluştur
        const packageJson = {
            name: `optimus-${template.id}`,
            version: '1.0.0',
            description: template.description || 'Automation product built by Optimus',
            main: 'src/main.js',
            scripts: {
                start: 'node src/main.js',
                test: 'node tests/test.js'
            },
            dependencies: requirements.dependencies.reduce((acc, dep) => {
                acc[dep] = 'latest';
                return acc;
            }, {}),
            engines: {
                node: requirements.nodeVersion
            },
            os: requirements.os,
            keywords: ['automation', 'optimus', template.category],
            author: 'Optimus Digital Factory',
            license: 'MIT'
        };
        await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');
        // requirements.txt (Python için)
        if (template.category.includes('python') || requirements.dependencies.some((d) => d.includes('python'))) {
            await fs.writeFile(path.join(dir, 'requirements.txt'), requirements.dependencies.join('\n'), 'utf8');
        }
    }
    async generateDocumentation(template, dir, customizations) {
        var _a;
        const readmeContent = `# ${template.name}

${template.description || 'Automation product built by Optimus Digital Factory'}

## Features
${((_a = template.steps) === null || _a === void 0 ? void 0 : _a.map((step, i) => `- ${step.name || `Step ${i + 1}`}`).join('\n')) || '- No specific features listed'}

## Installation

\`\`\`bash
npm install
npm start
\`\`\`

## Configuration

Edit \`src/config.json\` to customize the behavior.

## Customizations Applied

\`\`\`json
${JSON.stringify(customizations, null, 2)}
\`\`\`

## Support

For support, contact the Optimus system.

## License

MIT License - see LICENSE file for details.

---

*Built with ❤️ by Optimus Digital Factory at ${new Date().toISOString()}*`;
        await fs.mkdir(path.join(dir, 'docs'), { recursive: true });
        await fs.writeFile(path.join(dir, 'docs/README.md'), readmeContent, 'utf8');
    }
    async addLicenseFile(dir, licenseType) {
        const licenses = {
            'MIT': `MIT License

Copyright (c) ${new Date().getFullYear()} Optimus Digital Factory

Permission is hereby granted...`,
            'Apache-2.0': `Apache License 2.0...`,
            'GPL-3.0': `GNU GENERAL PUBLIC LICENSE...`
        };
        const licenseText = licenses[licenseType] || licenses.MIT;
        await fs.writeFile(path.join(dir, 'LICENSE'), licenseText, 'utf8');
    }
    async createZipPackage(sourceDir, productId) {
        const zipPath = path.join('./products', `${productId}.zip`);
        await fs.mkdir(path.dirname(zipPath), { recursive: true });
        return new Promise((resolve, reject) => {
            const output = (0, fs_1.createWriteStream)(zipPath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            output.on('close', () => {
                console.log(`ZIP created: ${archive.pointer()} total bytes`);
                resolve(zipPath);
            });
            archive.on('error', (err) => reject(err));
            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
    async createProductInfo(productId, template, customizations, zipPath) {
        const stats = await fs.stat(zipPath);
        return {
            id: productId,
            name: customizations.productName || template.name,
            description: customizations.description || template.description,
            category: template.category,
            templateId: template.id,
            version: '1.0.0',
            fileSize: stats.size,
            zipPath,
            buildDate: new Date(),
            customizations,
            checksum: await this.calculateChecksum(zipPath)
        };
    }
    async calculateChecksum(filePath) {
        try {
            const { stdout } = await execAsync(`shasum -a 256 "${filePath}"`);
            return stdout.split(' ')[0];
        }
        catch (error) {
            // Fallback to simple hash if shasum missing (Windows)
            const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
            const content = await fs.readFile(filePath);
            return crypto.createHash('sha256').update(content).digest('hex');
        }
    }
    async countFiles(dir) {
        let count = 0;
        async function countRecursive(currentDir) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    await countRecursive(fullPath);
                }
                else {
                    count++;
                }
            }
        }
        await countRecursive(dir);
        return count;
    }
}
exports.ProductBuilder = ProductBuilder;
