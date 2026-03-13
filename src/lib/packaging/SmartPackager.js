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
exports.SmartPackager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver_1 = __importDefault(require("archiver"));
class SmartPackager {
    constructor() {
        this.warehousePath = path.join(process.cwd(), 'warehouse', 'ready_to_ship');
        this.exportPath = path.join(process.cwd(), 'warehouse', 'exports');
        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }
    }
    async createPackage(templateId, metadata) {
        console.log(`[SmartPackager] Packaging template: ${templateId} v${metadata.version}...`);
        const templatePath = path.join(process.cwd(), 'products', 'profit-factory-os-v1', 'workshop', 'templates', templateId);
        const zipFileName = `${templateId}_v${metadata.version}.zip`;
        const zipOutputPath = path.join(this.exportPath, zipFileName);
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipOutputPath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            output.on('close', () => {
                console.log(`[SmartPackager] Package created: ${zipFileName} (${archive.pointer()} total bytes)`);
                resolve(zipOutputPath);
            });
            archive.on('error', (err) => reject(err));
            archive.pipe(output);
            // 1. Add Template Files
            if (fs.existsSync(templatePath)) {
                archive.directory(templatePath, 'template');
            }
            // 2. Add Blueprint
            const blueprintPath = path.join(templatePath, 'blueprint.json');
            if (fs.existsSync(blueprintPath)) {
                archive.file(blueprintPath, { name: 'blueprint.json' });
            }
            // 3. Add Metadata & Marketing CTAs (Generated during packaging)
            const readmeContent = `# ${metadata.name}\n\n${metadata.description}\n\nCategory: ${metadata.category}\nVersion: ${metadata.version}`;
            archive.append(readmeContent, { name: 'README.md' });
            archive.finalize();
        });
    }
}
exports.SmartPackager = SmartPackager;
