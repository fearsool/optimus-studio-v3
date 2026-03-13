
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, filePath, content } = req.body;

        if (!action || !filePath) {
            return res.status(400).json({ error: 'Missing action or filePath' });
        }

        const absolutePath = path.join(process.cwd(), filePath);

        if (action === 'read') {
            const fileContent = await fs.readFile(absolutePath, 'utf-8');
            return res.status(200).json({ success: true, content: fileContent });
        }

        if (action === 'write') {
            // Dizin yoksa oluştur
            const dir = path.dirname(absolutePath);
            await fs.mkdir(dir, { recursive: true });

            await fs.writeFile(absolutePath, content, 'utf-8');
            return res.status(200).json({ success: true });
        }

        if (action === 'list') {
            // Dizin içeriğini listele
            const files = await fs.readdir(absolutePath, { withFileTypes: true });
            const result = files.map(file => ({
                name: file.name,
                type: file.isDirectory() ? 'directory' : 'file',
                path: path.join(filePath, file.name)
            }));

            return res.status(200).json({ success: true, files: result });
        }

        res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('Files API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
