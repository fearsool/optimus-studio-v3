import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Tool } from './ToolRegistry';

interface IndexItem {
    filePath: string;
    paragraph: string;
}

/**
 * 🏛️ SOKRATES LOCAL KNOWLEDGE TOOL (Local RAG)
 * ============================================
 * Kullanıcının masaüstü veya belirtilen bir dizindeki .txt, .md belgelerini
 * paragraf bazlı tarayıp en alakalı kısımları arayarak hızlı yanıt üretir.
 */
export class SokratesTool implements Tool {
    name = 'sokrates_local_rag';
    description = 'Yerel notlar, belgeler ve metin dosyaları (.txt, .md) içinde hızlı anahtar kelime ve içerik araması yapar.';

    private index: IndexItem[] = [];
    private indexedFolder: string | null = null;
    private desktopPath: string;

    constructor() {
        const homeDir = os.homedir();
        const oneDriveDesktop = path.join(homeDir, 'OneDrive', 'Desktop');
        const standardDesktop = path.join(homeDir, 'Desktop');
        this.desktopPath = fs.existsSync(oneDriveDesktop) ? oneDriveDesktop : standardDesktop;
    }

    async execute(args: { action: 'index' | 'search' | 'info'; folderPath?: string; query?: string; topK?: number }): Promise<string> {
        const action = args.action || 'search';

        if (action === 'index') {
            const targetFolder = args.folderPath || this.desktopPath;
            return this.buildIndex(targetFolder);
        }

        if (action === 'info') {
            if (!this.indexedFolder) {
                return 'Henüz indekslenmiş bir klasör yok.';
            }
            return `İndekslenmiş klasör: ${this.indexedFolder} (${this.index.length} paragraf).`;
        }

        // Default: Search
        const query = args.query || '';
        if (!query) {
            return 'Arama için bir sorgu (query) belirtilmedi.';
        }

        if (!this.indexedFolder || this.index.length === 0) {
            // Otomatik masaüstü indeksleme
            this.buildIndex(this.desktopPath);
        }

        return this.search(query, args.topK || 3);
    }

    private buildIndex(folderPath: string): string {
        if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
            return `'${folderPath}' klasörü bulunamadı.`;
        }

        const newIndex: IndexItem[] = [];
        let fileCount = 0;

        const walk = (dir: string) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!['node_modules', '.git', '.next', 'dist', '__pycache__'].includes(entry.name)) {
                            walk(fullPath);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (['.txt', '.md'].includes(ext)) {
                            try {
                                const content = fs.readFileSync(fullPath, 'utf-8');
                                if (content.trim()) {
                                    fileCount++;
                                    const paragraphs = content
                                        .split(/\n\s*\n/)
                                        .map(p => p.trim())
                                        .filter(p => p.length > 40);

                                    for (const p of paragraphs) {
                                        newIndex.push({ filePath: fullPath, paragraph: p });
                                    }
                                }
                            } catch (e) {
                                // Skip unreadable file
                            }
                        }
                    }
                }
            } catch (e) {
                // Directory read error
            }
        };

        walk(folderPath);

        this.index = newIndex;
        this.indexedFolder = folderPath;
        return `'${folderPath}' başarıyla indekslendi: ${fileCount} dosya, ${this.index.length} paragraf.`;
    }

    private search(query: string, topK: number): string {
        if (this.index.length === 0) {
            return `'${this.indexedFolder}' klasöründe indekslenmiş içerik bulunamadı.`;
        }

        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

        const scored = this.index.map(item => {
            const textLower = item.paragraph.toLowerCase();
            let score = 0;
            for (const word of queryWords) {
                if (textLower.includes(word)) {
                    score += 2;
                }
            }
            return { item, score };
        });

        scored.sort((a, b) => b.score - a.score);
        const topResults = scored.filter(s => s.score > 0).slice(0, topK);

        if (topResults.length === 0) {
            return `Notlarda ve belgelerde '${query}' ile ilgili bir içerik bulunamadı.`;
        }

        return topResults
            .map(res => `[${path.basename(res.item.filePath)}]\n${res.item.paragraph.substring(0, 400)}...`)
            .join('\n\n');
    }
}
