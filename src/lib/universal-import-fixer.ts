import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export class UniversalImportFixer {
    private static readonly MODULE_MAP: Record<string, string[]> = {
        'react': ['React', 'useState', 'useEffect', 'useContext', 'useReducer'],
        'react-dom': ['ReactDOM'],
        'next': ['NextPage', 'GetServerSideProps', 'GetStaticProps'],
        'next/headers': ['cookies', 'headers'],
        'next/navigation': ['useRouter', 'usePathname', 'useSearchParams'],
        'fs': ['readFileSync', 'writeFileSync', 'existsSync', 'mkdirSync'],
        'path': ['join', 'resolve', 'dirname', 'basename', 'extname'],
        'util': ['promisify', 'inspect', 'format'],
        'child_process': ['exec', 'spawn', 'fork']
    };

    static fixFile(filePath: string): boolean {
        if (!existsSync(filePath)) return false;

        const content = readFileSync(filePath, 'utf-8');
        let fixedContent = content;
        let changesMade = false;

        // 1. Fix all import statements
        const importRegex = /import\s+(.*?)\s+from\s+['"]([^'"]+)['"]/g;

        fixedContent = fixedContent.replace(importRegex, (match, imports, moduleName) => {
            // Skip if it's a named import
            if (imports.includes('{')) return match;

            // Check if module has default export issues
            if (this.hasDefaultExportIssue(moduleName)) {
                changesMade = true;
                return `import * as ${imports} from '${moduleName}'`;
            }

            return match;
        });

        // 2. Fix require statements
        const requireRegex = /const\s+(.*?)\s*=\s*require\(['"]([^'"]+)['"]\)/g;

        fixedContent = fixedContent.replace(requireRegex, (match, varName, moduleName) => {
            if (this.hasDefaultExportIssue(moduleName)) {
                changesMade = true;
                return `const ${varName} = require('${moduleName}')`;
            }
            return match;
        });

        if (changesMade) {
            // Create backup
            const backupPath = filePath + '.backup';
            writeFileSync(backupPath, content, 'utf-8');

            // Write fixed content
            writeFileSync(filePath, fixedContent, 'utf-8');

            console.log(`✅ Fixed imports in: ${filePath}`);
            return true;
        }

        return false;
    }

    private static hasDefaultExportIssue(moduleName: string): boolean {
        // Modules known to have default export issues
        const problematicModules = [
            'fs', 'path', 'util', 'child_process', 'os', 'events',
            'stream', 'crypto', 'http', 'https', 'net', 'dns',
            'zlib', 'buffer', 'url', 'querystring'
        ];

        return problematicModules.some(m =>
            moduleName === m || moduleName.startsWith(m + '/')
        );
    }

    static fixProject(rootDir: string): void {
        // Basic recursive walker since we can't easily rely on 'fs.readdirSync' with 'withFileTypes' in all node versions without proper types sometimes
        const fs = require('fs');
        const path = require('path');

        const walk = (dir: string) => {
            let list = [];
            try {
                list = fs.readdirSync(dir);
            } catch (e) { return; }

            list.forEach((file: string) => {
                const fullPath = path.join(dir, file);
                let stat;
                try {
                    stat = fs.statSync(fullPath);
                } catch (e) { return; }

                if (stat && stat.isDirectory()) {
                    if (!['node_modules', '.next', '.git', 'dist', '.turbo'].includes(file)) {
                        walk(fullPath);
                    }
                } else {
                    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                        this.fixFile(fullPath);
                    }
                }
            });
        };

        walk(rootDir);
        console.log('🎯 Project imports fixed successfully!');
    }
}
