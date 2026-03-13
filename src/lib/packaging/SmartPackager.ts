import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

export interface PackageMetadata {
    id: string;
    version: string;
    name: string;
    description: string;
    category: string;
    price: number;
}

export class SmartPackager {
    private warehousePath: string;
    private exportPath: string;

    constructor() {
        this.warehousePath = path.join(process.cwd(), 'warehouse', 'ready_to_ship');
        this.exportPath = path.join(process.cwd(), 'warehouse', 'exports');

        if (!fs.existsSync(this.exportPath)) {
            fs.mkdirSync(this.exportPath, { recursive: true });
        }
    }

    async createPackage(templateId: string, metadata: PackageMetadata): Promise<string> {
        console.log(`[SmartPackager] Packaging template: ${templateId} v${metadata.version}...`);

        const templatePath = path.join(process.cwd(), 'products', 'profit-factory-os-v1', 'workshop', 'templates', templateId);
        const zipFileName = `${templateId}_v${metadata.version}.zip`;
        const zipOutputPath = path.join(this.exportPath, zipFileName);

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipOutputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

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
