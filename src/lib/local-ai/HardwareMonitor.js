"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareMonitor = void 0;
const os_1 = __importDefault(require("os"));
class HardwareMonitor {
    static getSystemSpecs() {
        const cpus = os_1.default.cpus();
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        return {
            cpuModel: cpus[0].model,
            cpuCores: cpus.length,
            totalRAM_GB: (totalMem / (1024 ** 3)).toFixed(2),
            freeRAM_GB: (freeMem / (1024 ** 3)).toFixed(2),
            platform: os_1.default.platform()
        };
    }
    static async checkResourcesForModel(modelSizeGB) {
        const freeMem = os_1.default.freemem() / (1024 ** 3);
        // Reserve 2GB for OS overhead
        const available = freeMem - 2;
        console.log(`[Hardware] Check: Need ${modelSizeGB}GB | Available: ${available.toFixed(2)}GB`);
        return available >= modelSizeGB;
    }
}
exports.HardwareMonitor = HardwareMonitor;
