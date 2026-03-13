import { chromium, Browser, Page } from 'playwright';
import { PlatformUploader, VideoMetadata, UploadResult } from './VideoDistributor';

export class YouTubeUploader implements PlatformUploader {
    name = 'YouTube';

    async upload(videoPath: string, metadata: VideoMetadata): Promise<UploadResult> {
        console.log(`[YouTubeUploader] Starting upload for: ${metadata.title}`);

        let browser: Browser | null = null;
        try {
            browser = await chromium.launch({ headless: false }); // Show browser for visibility
            const context = await browser.newContext();
            const page = await context.newPage();

            // 1. Navigate to YouTube Studio
            await page.goto('https://studio.youtube.com');
            console.log('[YouTubeUploader] Navigated to YouTube Studio. Waiting for login...');

            // NOTE: In a real scenario, we'd use a persistent context with cookies or wait for user login
            // For now, we'll wait for the "CREATE" button or similar to indicate we're in
            await page.waitForSelector('#create-icon', { timeout: 60000 });

            // 2. Click Create -> Upload Video
            await page.click('#create-icon');
            await page.click('#text-item-0'); // Upload video

            // 3. Upload File
            const [fileChooser] = await Promise.all([
                page.waitForEvent('filechooser'),
                page.click('#select-files-button'),
            ]);
            await fileChooser.setFiles(videoPath);
            console.log('[YouTubeUploader] File selected.');

            // 4. Fill Metadata
            await page.waitForSelector('#title-textarea');
            await page.fill('#title-textarea', metadata.title);

            await page.waitForSelector('#description-textarea');
            await page.fill('#description-textarea', metadata.description);

            // 5. Navigate through the wizard
            // This is a simplified flow. Real flow involves clicking "Next" several times
            for (let i = 0; i < 3; i++) {
                await page.click('#next-button');
                await page.waitForTimeout(1000);
            }

            // 6. Set Visibility (Public)
            await page.click('tp-yt-paper-radio-button[name="PUBLIC"]');

            // 7. Publish
            await page.click('#done-button');
            console.log('[YouTubeUploader] Video published!');

            return {
                platform: this.name,
                status: 'success',
                url: page.url()
            };

        } catch (error: any) {
            console.error(`[YouTubeUploader] Upload failed: ${error.message}`);
            return {
                platform: this.name,
                status: 'failure',
                error: error.message
            };
        } finally {
            if (browser) await browser.close();
        }
    }
}

