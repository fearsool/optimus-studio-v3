"use strict";
/**
 * 📂 FILE TOOL
 * ============
 * Optimus'un dosya sistemine erişmesini sağlar.
 * Antigravity gibi kod okuyup yazabilir.
 */
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
exports.FileTool = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FileTool {
    constructor(baseDir) {
        this.name = 'file_tool';
        this.description = 'Read, write, and list files. Use this to conduct engineering tasks.';
        this.baseDir = baseDir;
    }
    async execute(args) {
        const fullPath = path.resolve(this.baseDir, args.path);
        // Güvenlik: Base dir dışına çıkmayı engelle (Sandbox)
        if (!fullPath.startsWith(path.resolve(this.baseDir))) {
            throw new Error('Access denied: Cannot access files outside workspace.');
        }
        switch (args.command) {
            case 'read':
                return fs.readFileSync(fullPath, 'utf-8');
            case 'write':
                if (!args.content)
                    throw new Error('Content required for write');
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, args.content);
                return `Successfully wrote to ${args.path}`;
            case 'list':
                const files = fs.readdirSync(fullPath);
                return files.join('\n');
            default:
                throw new Error('Unknown command');
        }
    }
}
exports.FileTool = FileTool;
