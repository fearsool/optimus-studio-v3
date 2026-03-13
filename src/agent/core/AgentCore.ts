/**
 * 🧠 OPTIMUS AGENT CORE (UNIFIED)
 * ===============================
 * The central nervous system of Optimus Studio.
 * Combines: Planner + Executor + Verifier + Tools + Extensions
 * 
 * This is the "Antigravity" of your factory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Planner, Plan } from '../planner/Planner';
import { Executor } from './Executor';
import { Verifier } from './Verifier';
import { ToolRegistry } from '../tools/ToolRegistry';
import { FactoryTool } from '../tools/FactoryTool';
import { modelRouter } from '../router/ModelRouter';
import { LLMService, ChatMessage } from './LLMService';
import { HIERARCHY_PROTOCOL } from './SystemProtocol';
import { StateStore } from '../state/StateStore';
import { VectorMemory } from '../memory/VectorMemory';

// Temel Tool Arayüzü
export interface Tool {
    name: string;
    description: string;
    execute(args: any): Promise<any>;
}

// Agent Durumu (UI'a stream edilecek)
export interface AgentState {
    status: 'idle' | 'thinking' | 'planning' | 'executing' | 'verifying' | 'done' | 'error';
    currentPlan: Plan | null;
    currentStep: number;
    activeTool: string | null;
    logs: string[];
    errors: string[];
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export class AgentCore {
    private planner: Planner;
    private executor: Executor;
    private verifier: Verifier;
    private toolRegistry: ToolRegistry;
    private llmService: LLMService;
    private extensionsDir: string;
    private projectRoot: string;

    public state: AgentState;
    public history: Message[] = [];

    // Requested by User: Turkish Persona Logic
    private setTurkishPersona(persona: string) {
        const personas: Record<string, { tone: string, style: string }> = {
            'yardımcı': { tone: 'profesyonel', style: 'yardımsever' },
            'geliştirici': { tone: 'teknik', style: 'direkt' },
            'yaratıcı': { tone: 'enerjik', style: 'yaratıcı' }
        };
        return personas[persona] || personas['yardımcı'];
    }

    // Requested by User: Plan Tab Accessor
    public showPlanTab(): Plan | null {
        return StateStore.getInstance().getActivePlan();
    }

    constructor(projectRoot: string) {
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
        this.toolRegistry = new ToolRegistry(projectRoot);
        this.planner = new Planner();
        this.executor = new Executor(this.toolRegistry);
        this.verifier = new Verifier();
        this.llmService = new LLMService();

        // Register Factory Tool
        this.toolRegistry.register(new FactoryTool(projectRoot));

        // Load extensions
        this.loadExtensions();

        this.log('🧠 Optimus Agent Core initialized');
    }

    /**
     * Dynamic Extension Loader
     */
    private loadExtensions() {
        if (!fs.existsSync(this.extensionsDir)) {
            return;
        }

        try {
            const plugins = fs.readdirSync(this.extensionsDir, { withFileTypes: true });
            for (const dirent of plugins) {
                if (dirent.isDirectory()) {
                    this.log(`🔌 Loaded extension: ${dirent.name}`);
                }
            }
        } catch (e) {
            console.error('Extension loading failed', e);
        }
    }

    /**
     * MAIN LOOP
     */
    public async processRequest(userInput: string): Promise<string> {
        this.log(`\n🤖 USER: ${userInput}`);
        this.history.push({ role: 'user', content: userInput, timestamp: new Date() });

        // 🧠 NEURAL MEMORY RECALL
        try {
            const memory = await VectorMemory.getInstance();
            const relevantMemories = await memory.search(userInput);
            if (relevantMemories.length > 0) {
                const contextBlock = `\n[RELEVANT MEMORIES (Context)]:\n- ${relevantMemories.join('\n- ')}\n`;
                this.history.push({ role: 'system', content: contextBlock, timestamp: new Date() });
                this.log(`🧠 Recalled: ${relevantMemories.length} memories`);
            }
        } catch (e) {
            console.error('Memory recall failed:', e);
        }

        // 👮 SUPERVISOR DELEGATION
        const { supervisorAgent } = require('./SupervisorAgent');
        const delegation = await supervisorAgent.delegate(userInput);
        this.log(`👮 Supervisor Decision: ${delegation.specialist} (${delegation.reason})`);

        try {
            await StateStore.getInstance().saveCheckpoint(this.state, `Supervisor delegated to ${delegation.specialist}`);
        } catch (e) { }

        this.state.status = 'thinking';

        try {
            const tokenEstimate = Math.ceil(userInput.length / 4) + 500;
            const routing = await modelRouter.route('planning', { tokenEstimate });
            const plan = await this.planner.createPlan(userInput, this.toolRegistry.listTools(), routing.model);
            this.state.currentPlan = plan;

            const isGenericChat = plan.steps.length === 1 && plan.steps[0].tool === 'none';

            if (isGenericChat) {
                this.log('💬 Supervisor proceeding with Chat/Specialist flow...');
                const finalResponse = await supervisorAgent.executeDelegatedTask(delegation, userInput);

                this.state.status = 'done';
                this.history.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
                await StateStore.getInstance().saveCheckpoint(this.state, 'Task Completed');
                VectorMemory.getInstance().then(m => m.addMemory(`User: ${userInput}\nOptimus: ${finalResponse}`, ['chat']));

                return finalResponse;
            } else {
                this.state.status = 'executing';
                this.executor.onStep((step) => {
                    this.state.currentStep = step.id;
                    this.state.activeTool = step.tool;
                    this.log(`⚙️ Executing: ${step.action}`);
                });

                const result = await this.executor.execute(plan);

                this.state.status = 'verifying';
                for (const step of plan.steps) {
                    const verification = await this.verifier.verify(step);
                    if (!verification.passed) {
                        this.log(`⚠️ Verification Warning: ${verification.reason}`);
                    }
                }

                this.state.status = 'done';
                const outputStr = typeof result.finalOutput === 'object'
                    ? JSON.stringify(result.finalOutput, null, 2)
                    : result.finalOutput;

                this.log('🧠 Synthesizing final response...');
                this.history.push({
                    role: 'system',
                    content: `GÖREV TAMAMLANDI. SONUÇ: ${outputStr}\n\nTALİMAT: Ali Bey'e hitaben raporla.`,
                    timestamp: new Date()
                });

                const messages: ChatMessage[] = [
                    { role: 'system', content: HIERARCHY_PROTOCOL },
                    ...this.history.filter(m => m.role !== 'system').map(m => ({ 
                        role: m.role as "user" | "assistant" | "system", 
                        content: m.content 
                    })),
                    { role: 'system', content: `SONUÇ: ${outputStr}` }
                ];

                const finalResponse = await this.llmService.chat(messages, 'qwen2.5-coder:7b');
                this.history.push({ role: 'assistant', content: finalResponse, timestamp: new Date() });
                await StateStore.getInstance().saveCheckpoint(this.state, `Task Completed`);
                VectorMemory.getInstance().then(m => m.addMemory(`User Task: ${userInput}\nResult: ${finalResponse}`, ['task']));

                return finalResponse;
            }
        } catch (error: any) {
            console.error('Agent Loop Error:', error);
            this.state.status = 'error';
            this.state.errors.push(error.message);
            this.log(`❌ Error: ${error.message}`);
            return `Error: ${error.message}`;
        }
    }

    private log(message: string) {
        console.log(`[Optimus] ${message}`);
        this.state.logs.push(message);
    }

    public getState(): AgentState {
        return { ...this.state };
    }

    public getAvailableTools(): string[] {
        return this.toolRegistry.listTools();
    }
}
