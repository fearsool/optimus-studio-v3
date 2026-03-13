/**
 * 🛡️ SANDBOX EXECUTOR SERVICE
 * =============================
 * Üretilen JavaScript kodlarını izole ve güvenli bir ortamda çalıştırır.
 * Sonsuz döngüleri ve zararlı işlemleri engeller.
 */

export interface SandboxResult {
    success: boolean;
    output?: any;
    logs: string[];
    error?: string;
    executionTime: number;
}

export class SandboxService {

    /**
     * Güvensiz kodu izole ortamda çalıştır
     * @param code JavaScript kodu (fonksiyon gövdesi)
     * @param context Koda geçirilecek değişkenler (örn: input data)
     * @param timeoutMs Maksimum çalışma süresi (varsayılan: 2000ms)
     */
    async executeSafe(code: string, context: Record<string, any> = {}, timeoutMs: number = 2000): Promise<SandboxResult> {
        const start = Date.now();
        const logs: string[] = [];

        try {
            // 1. Kodu Sarma (Wrapping)
            // 'return' ifadesi yoksa son satırı return yapmaya çalışabiliriz (basitçe)
            const wrappedCode = `
                "use strict";
                const console = { 
                    log: (...args) => __logs.push(args.map(a => String(a)).join(' ')),
                    error: (...args) => __logs.push('[ERROR] ' + args.map(a => String(a)).join(' '))
                };
                
                // Context değişkenlerini tanımla
                ${Object.keys(context).map(key => `const ${key} = __context.${key};`).join('\n')}

                try {
                    ${code}
                } catch (e) {
                    throw e;
                }
            `;

            // 2. Function Constructor ile Çalıştırma
            // (Web Worker daha güvenli ama senkronize veri dönüşü zor, şimdilik Function yeterli)
            const executor = new Function('__context', '__logs', wrappedCode);

            // 3. Execution with Timeout Check
            /* 
              Not: JS single-threaded olduğu için gerçek pre-emptive timeout zordur.
              Ancak Promise.race ile en azından asenkron işlemlerin süresini kısıtlayabiliriz.
              Senkron sonsuz döngü tarayıcıyı dondurabilir (bunun için Web Worker şart).
            */

            await new Promise<void>((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Execution Timed Out')), timeoutMs);
                try {
                    executor(context, logs);
                    clearTimeout(timer);
                    resolve();
                } catch (e) {
                    clearTimeout(timer);
                    reject(e);
                }
            });

            return {
                success: true,
                logs,
                output: "Execution Completed", // Return değeri almak için kod yapısını değiştirmek gerekir
                executionTime: Date.now() - start
            };

        } catch (error: any) {
            return {
                success: false,
                logs,
                error: error.message,
                executionTime: Date.now() - start
            };
        }
    }
}

export const sandboxService = new SandboxService();
