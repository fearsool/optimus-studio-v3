"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surgeon = void 0;
const ts_morph_1 = require("ts-morph");
const fs_1 = __importDefault(require("fs"));
/**
 * 👨‍⚕️ THE SURGEON
 * =============
 * Performs safe, AST-based code modifications (surgery).
 */
class Surgeon {
    constructor() {
        this.project = new ts_morph_1.Project({
            useInMemoryFileSystem: true,
            skipAddingFilesFromTsConfig: true
        });
    }
    /**
     * Optimizes imports in a file (Remove unused, sort)
     */
    async optimizeImports(filePath) {
        try {
            if (!fs_1.default.existsSync(filePath))
                return { success: false, message: 'File not found' };
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const sourceFile = this.project.createSourceFile(filePath, content, { overwrite: true });
            sourceFile.organizeImports();
            const newContent = sourceFile.getFullText();
            if (newContent.length < 10)
                return { success: false, message: 'Surgery resulted in empty file' };
            fs_1.default.writeFileSync(filePath, newContent, 'utf-8');
            return { success: true, message: 'Imports optimized successfully' };
        }
        catch (error) {
            return { success: false, message: `Surgery failed: ${error.message}` };
        }
    }
    /**
     * Attempts to split very long functions into smaller ones.
     * This is an aggressive "Surgeon" move.
     */
    async splitLongFunctions(filePath) {
        try {
            if (!fs_1.default.existsSync(filePath))
                return { success: false, message: 'File not found' };
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const sourceFile = this.project.createSourceFile(filePath, content, { overwrite: true });
            let changesMade = false;
            // Find functions longer than 50 lines
            sourceFile.getFunctions().forEach(func => {
                const start = func.getStartLineNumber();
                const end = func.getEndLineNumber();
                const length = end - start;
                if (length > 100) {
                    // Strategy: Add a comment suggesting refactoring
                    // Auto-extraction is extremely risky without deep semantic analysis.
                    // Instead, we mark it with a TODO comment that the AI Agent can pick up later.
                    const existingDocs = func.getJsDocs();
                    if (existingDocs.length === 0) {
                        func.addJsDoc({
                            description: ` TODO: Refactor this function (Length: ${length} lines). \n Consider breaking it down.`
                        });
                        changesMade = true;
                    }
                }
            });
            if (changesMade) {
                fs_1.default.writeFileSync(filePath, sourceFile.getFullText(), 'utf-8');
                return { success: true, message: 'Marked complex functions for refactoring.' };
            }
            return { success: true, message: 'No critical complexity requiring immediate surgery found.' };
        }
        catch (error) {
            return { success: false, message: `Surgery failed: ${error.message}` };
        }
    }
}
exports.Surgeon = Surgeon;
