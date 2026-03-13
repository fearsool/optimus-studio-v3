/**
 * 📂 FILE TOOL
 * ============
 * Optimus'un dosya sistemine erişmesini sağlar.
 * Antigravity gibi kod okuyup yazabilir.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Tool } from '../core/AgentCore';

export class FileTool implements Tool {
    name = 'file_tool';
    description = 'Read, write, and list files. Use this to conduct engineering tasks.';

    private baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    async execute(args: { command: 'read' | 'write' | 'list', path: string, content?: string }) {
        const fullPath = path.resolve(this.baseDir, args.path);

        // Güvenlik: Base dir dışına çıkmayı engelle (Sandbox)
        if (!fullPath.startsWith(path.resolve(this.baseDir))) {
            throw new Error('Access denied: Cannot access files outside workspace.');
        }

        switch (args.command) {
            case 'read':
                return fs.readFileSync(fullPath, 'utf-8');

            case 'write':
                if (!args.content) throw new Error('Content required for write');
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
