import os from 'os';

export class HardwareMonitor {
    static getSystemSpecs() {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        return {
            cpuModel: cpus[0].model,
            cpuCores: cpus.length,
            totalRAM_GB: (totalMem / (1024 ** 3)).toFixed(2),
            freeRAM_GB: (freeMem / (1024 ** 3)).toFixed(2),
            platform: os.platform()
        };
    }

    static async checkResourcesForModel(modelSizeGB: number): Promise<boolean> {
        const freeMem = os.freemem() / (1024 ** 3);
        // Reserve 2GB for OS overhead
        const available = freeMem - 2;

        console.log(`[Hardware] Check: Need ${modelSizeGB}GB | Available: ${available.toFixed(2)}GB`);
        return available >= modelSizeGB;
    }
}
