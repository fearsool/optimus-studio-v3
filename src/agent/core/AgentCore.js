"use strict";
/**
 * 🧠 OPTIMUS AGENT CORE (UNIFIED)
 * ===============================
 * The central nervous system of Optimus Studio.
 * Combines: Planner + Executor + Verifier + Tools + Extensions
 *
 * This is the "Antigravity" of your factory.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCore = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Planner_1 = require("../planner/Planner");
const Executor_1 = require("./Executor");
const Verifier_1 = require("./Verifier");
const ToolRegistry_1 = require("../tools/ToolRegistry");
const FactoryTool_1 = require("../tools/FactoryTool");
const ModelRouter_1 = require("../router/ModelRouter");
const LLMService_1 = require("./LLMService");
const SystemProtocol_1 = require("./SystemProtocol");
const StateStore_1 = require("../state/StateStore");
const VectorMemory_1 = require("../memory/VectorMemory");
class AgentCore {
    // Requested by User: Turkish Persona Logic
    setTurkishPersona(persona) {
        const personas = {
            'yardımcı': { tone: 'profesyonel', style: 'yardımsever' },
            'geliştirici': { tone: 'teknik', style: 'direkt' },
            'yaratıcı': { tone: 'enerjik', style: 'yaratıcı' }
        };
        return personas[persona] || personas['yardımcı'];
    }
    // Requested by User: Plan Tab Accessor
    showPlanTab() {
        return StateStore_1.StateStore.getInstance().getActivePlan();
    }
    constructor(projectRoot) {
        this.history = [];
        this.projectRoot = projectRoot;
        this.extensionsDir = path.join(projectRoot, 'apps', 'optimus-studio', 'extensions');
        // Initialize state
        this.state = {
            status: 'idle',
            currentPlan: null,
            currentStep: 0,
            activeTool: null,
            logs: [],
            errors: []
        };
        // Initialize components
        this.toolRegistry = new ToolRegistry_1.ToolRegistry(projectRoot);
        this.planner = new Planner_1.Planner();
        this.executor = new Executor_1.Executor(this.toolRegistry);
        this.verifier = new Verifier_1.Verifier();
        this.llmService = new LLMService_1.LLMService();
        // Register Factory Tool
        this.toolRegistry.register(new FactoryTool_1.FactoryTool(projectRoot));
        // Load extensions
        this.loadExtensions();
        this.log('🧠 Optimus Agent Core initialized');
    }
    /**
     * Dynamic Extension Loader
     */
    loadExtensions() {
        if (!fs.existsSync(this.extensionsDir)) {
            // Optional: Create if not exists
            // fs.mkdirSync(this.extensionsDir, { recursive: true });
            return;
        }
        try {
            const plugins = fs.readdirSync(this.extensionsDir, { withFileTypes: true });
            for (const dirent of plugins) {
                if (dirent.isDirectory()) {
                    this.log(`🔌 Loaded extension: ${dirent.name}`);
                }
            }
        }
        catch (e) {
            console.error('Extension loading failed', e);
        }
    }
    /**
     * MAIN LOOP
     */
    async processRequest(userInput) {
        this.log(`\n🤖 USER: ${userInput}`);
        this.history.push({ role: 'user', content: userInput, timestamp: new Date() });
        // 🧠 NEURAL MEMORY RECALL
        try {
            const memory = await VectorMemory_1.VectorMemory.getInstance();
            const relevantMemories = await memory.search(userInput);
            if (relevantMemories.length > 0) {
                const contextBlock = `\n[RELEVANT MEMORIES (Context)]:\n- ${relevantMemories.join('\n- ')}\n`;
                // Add to history as system context (hidden from user view but seen by LLM)
                this.history.push({ role: 'system', content: contextBlock, timestamp: new Date() });
                this.log(`🧠 Recalled: ${relevantMemories.length} memories`);
            }
        }
        catch (e) {
            console.error('Memory recall failed:', e);
        }
        // Save initial state checkpoint
        try {
            await StateStore_1.StateStore.getInstance().saveCheckpoint(this.state, 'New User Request');
        }
        catch (e) {
            // Ignore db errors
        }
        this.state.status = 'thinking';
        try {
            // Estimate tokens (simple: chars / 4)
            const tokenEstimate = Math.ceil(userInput.length / 4) + 500; // +500 for instructions
            // 1. PLANLAMA - Use imported modelRouter directly
            const routing = await ModelRouter_1.modelRouter.route('planning', { tokenEstimate });
            const plan = await this.planner.createPlan(userInput, this.toolRegistry.listTools(), routing.model);
            this.state.currentPlan = plan;
            // 3. CHECK PLAN & EXECUTE
            const isGenericChat = plan.steps.length === 1 && plan.steps[0].tool === 'none';
            if (isGenericChat) {
                this.log('💬 Switching to Chat Mode (LLM)...');
                // Route for chat
                // const chatRouting = await modelRouter.route('chat_turkish', { preferSpeed: true, tokenEstimate });
                // const model = chatRouting.model;
                const model = 'qwen2.5-coder:7b'; // FORCE INTELLIGENT MODEL (7B)
                // Construct messages from history with SHORT and TURKISH prompt
                const messages = [
                    {
                        role: 'system',
                        content: `SEN OPTIMUS PRIME ADINDA GELİŞMİŞ BİR YAPAY ZEKASIN.
DİL: SADECE VE SADECE TÜRKÇE KONUŞ.
HİTAP: KULLANICIYA "Efendim" VEYA "Ali Bey" DİYE HİTAP ET.
GÖREV: PROFESYONEL BİR FABRİKA YÖNETİCİSİ GİBİ DAVRAN. KISA VE ÖZ KONUŞ.

 protokolü:
${SystemProtocol_1.HIERARCHY_PROTOCOL}`
                    },
                    ...this.history
                        .filter(m => m.role !== 'system')
                        .map(m => ({ role: m.role, content: m.content }))
                ];
                const response = await this.llmService.chat(messages, model);
                this.state.status = 'done';
                this.history.push({ role: 'assistant', content: response, timestamp: new Date() });
                // Save final state
                await StateStore_1.StateStore.getInstance().saveCheckpoint(this.state, 'Chat Response Completed');
                // 🧠 MEMORY STORE
                VectorMemory_1.VectorMemory.getInstance().then(m => m.addMemory(`User: ${userInput}\nOptimus: ${response}`, ['chat']));
                return response;
            }
            else {
                // EXECUTING COMPLEX PLAN
                this.state.status = 'executing';
                // Set up step tracking
                this.executor.onStep((step) => {
                    this.state.currentStep = step.id;
                    this.state.activeTool = step.tool;
                    this.log(`⚙️ Executing: ${step.action}`);
                });
                const result = await this.executor.execute(plan);
                // 4. VERIFYING
                this.state.status = 'verifying';
                for (const step of plan.steps) {
                    const verification = await this.verifier.verify(step); // Await if async
                    if (!verification.passed) {
                        this.log(`⚠️ Verification Warning: ${verification.reason}`);
                    }
                }
                this.state.status = 'done';
                const outputStr = typeof result.finalOutput === 'object'
                    ? JSON.stringify(result.finalOutput, null, 2)
                    : result.finalOutput;
                // 5. SYNTHESIS (Sonucu Yorumla)
                this.log('🧠 Synthesizing final response...');
                // Add raw result to history as system info
                this.history.push({
                    role: 'system',
                    content: `GÖREV TAMAMLANDI.
SONUÇ VERİSİ (RAW):
${outputStr}

TALİMAT: Bu veriyi analiz et ve kullanıcıya Ali Bey'e hitaben raporla. JSON paylaşma, sadece özeti anlat.`,
                    timestamp: new Date()
                });
                // Get final natural language response
                const synthesisModel = 'qwen2.5-coder:7b';
                const messages = [
                    {
                        role: 'system',
                        content: SystemProtocol_1.HIERARCHY_PROTOCOL
                    },
                    ...this.history
                        .filter(m => m.role !== 'system')
                        .map(m => ({
                        role: m.role,
                        content: m.role === 'user' ? `${m.content} (YANIT DİLİ: TÜRKÇE)` : m.content
                    })),
                    // Add the result explicitly to ensure it's in context
                    {
                        role: 'system',
                        content: `SONUÇ: ${outputStr}`
                    }
                ];
                const finalResponse = await this.llmService.chat(messages, synthesisModel);
                this.history.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
                // Save final state
                await StateStore_1.StateStore.getInstance().saveCheckpoint(this.state, `Task Completed`);
                // 🧠 MEMORY STORE
                VectorMemory_1.VectorMemory.getInstance().then(m => m.addMemory(`User Task: ${userInput}\nResult: ${finalResponse}`, ['task']));
                return finalResponse;
            }
        }
        catch (error) {
            console.error('Agent Loop Error:', error);
            this.state.status = 'error';
            this.state.errors.push(error.message);
            this.log(`❌ Error: ${error.message}`);
            return `Error: ${error.message}`;
        }
    }
    log(message) {
        console.log(`[Optimus] ${message}`);
        this.state.logs.push(message);
    }
    /**
     * Get current state (for UI streaming)
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get available tools (for UI display)
     */
    getAvailableTools() {
        return this.toolRegistry.listTools();
    }
}
exports.AgentCore = AgentCore;
