"use strict";
/**
 * 🧩 OSS REGISTRY - Open Source Integration Guide
 * ================================================
 * Approved open-source tools for Optimus Studio.
 * Rule: If API-dependent → replace with local alternative.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOSSStatus = exports.INTEGRATION_PRIORITY = exports.findReplacement = exports.getPlanned = exports.getIntegrated = exports.getByCategory = exports.OSS_REGISTRY = void 0;
// =============== OSS REGISTRY ===============
exports.OSS_REGISTRY = [
    // ═══════════════ LLM RUNTIME ═══════════════
    {
        name: 'Ollama',
        category: 'llm_runtime',
        github: 'https://github.com/ollama/ollama',
        description: 'Local LLM runtime. Run any open model locally.',
        localFirst: true,
        installCommand: 'curl -fsSL https://ollama.com/install.sh | sh',
        integrationStatus: 'integrated',
        replaces: 'OpenAI API, Claude API, any cloud LLM'
    },
    {
        name: 'llama.cpp',
        category: 'llm_runtime',
        github: 'https://github.com/ggerganov/llama.cpp',
        description: 'Ultra-low resource LLM inference. For devices with <4GB RAM.',
        localFirst: true,
        installCommand: 'git clone https://github.com/ggerganov/llama.cpp && cd llama.cpp && make',
        integrationStatus: 'optional',
        replaces: 'Ollama when resources are extremely limited',
        notes: 'Use when Ollama is too heavy. Good for edge devices.'
    },
    // ═══════════════ AGENT FRAMEWORKS ═══════════════
    {
        name: 'Open Interpreter',
        category: 'agent_framework',
        github: 'https://github.com/OpenInterpreter/open-interpreter',
        description: 'Natural language to terminal commands. Full computer control.',
        localFirst: true,
        installCommand: 'pip install open-interpreter',
        integrationStatus: 'planned',
        replaces: 'Code Interpreter API',
        notes: 'Use with --local flag for Ollama integration'
    },
    {
        name: 'LangGraph',
        category: 'agent_framework',
        github: 'https://github.com/langchain-ai/langgraph',
        description: 'Stateful agent workflows as graphs.',
        localFirst: true, // Can work with local models
        installCommand: 'pip install langgraph',
        integrationStatus: 'planned',
        notes: 'Use with Ollama backend, not LangChain cloud'
    },
    {
        name: 'AutoGen',
        category: 'agent_framework',
        github: 'https://github.com/microsoft/autogen',
        description: 'Multi-agent conversation framework.',
        localFirst: true, // Supports local models
        installCommand: 'pip install pyautogen',
        integrationStatus: 'planned',
        replaces: 'Custom multi-agent logic',
        notes: 'Configure to use Ollama as backend'
    },
    // ═══════════════ MEDIA GENERATION ═══════════════
    {
        name: 'ComfyUI',
        category: 'media_generation',
        github: 'https://github.com/comfyanonymous/ComfyUI',
        description: 'Node-based Stable Diffusion pipeline. Image & video generation.',
        localFirst: true,
        installCommand: 'git clone https://github.com/comfyanonymous/ComfyUI',
        integrationStatus: 'planned',
        replaces: 'Midjourney, DALL-E, Runway',
        notes: 'Use with SD 1.5 or SDXL for image, AnimateDiff for video'
    },
    {
        name: 'FFmpeg',
        category: 'media_generation',
        github: 'https://github.com/FFmpeg/FFmpeg',
        description: 'Video processing, encoding, effects.',
        localFirst: true,
        installCommand: 'apt install ffmpeg / choco install ffmpeg',
        integrationStatus: 'integrated',
        replaces: 'Any cloud video API',
        notes: 'Already integrated in OVI engine'
    },
    // ═══════════════ VOICE ═══════════════
    {
        name: 'Whisper.cpp',
        category: 'voice',
        github: 'https://github.com/ggerganov/whisper.cpp',
        description: 'Local speech-to-text. Fast, accurate, offline.',
        localFirst: true,
        installCommand: 'git clone https://github.com/ggerganov/whisper.cpp && make',
        integrationStatus: 'planned',
        replaces: 'Google Speech API, AssemblyAI',
        notes: 'Use ggml-base.en.bin for English, ggml-small for Turkish'
    },
    {
        name: 'faster-whisper',
        category: 'voice',
        github: 'https://github.com/SYSTRAN/faster-whisper',
        description: 'Optimized Whisper. 4x faster than original.',
        localFirst: true,
        installCommand: 'pip install faster-whisper',
        integrationStatus: 'integrated',
        replaces: 'Original Whisper, cloud STT'
    },
    {
        name: 'Piper TTS',
        category: 'voice',
        github: 'https://github.com/rhasspy/piper',
        description: 'Local text-to-speech. Natural voices, offline.',
        localFirst: true,
        installCommand: 'pip install piper-tts',
        integrationStatus: 'planned',
        replaces: 'ElevenLabs, Google TTS, AWS Polly',
        notes: 'Turkish voice: tr_TR-dfki-medium'
    },
    // ═══════════════ TERMINAL & EDITOR ═══════════════
    {
        name: 'Xterm.js',
        category: 'terminal',
        github: 'https://github.com/xtermjs/xterm.js',
        description: 'Terminal emulator for web. Full PTY support.',
        localFirst: true,
        installCommand: 'npm install xterm',
        integrationStatus: 'planned',
        replaces: 'Basic terminal components',
        notes: 'Add xterm-addon-fit for responsive sizing'
    },
    {
        name: 'Monaco Editor',
        category: 'editor',
        github: 'https://github.com/microsoft/monaco-editor',
        description: 'VS Code editor component. Full IDE experience.',
        localFirst: true,
        installCommand: 'npm install monaco-editor',
        integrationStatus: 'planned',
        replaces: 'Basic code editors',
        notes: 'Use @monaco-editor/react for React integration'
    },
    // ═══════════════ AUTOMATION ═══════════════
    {
        name: 'Playwright',
        category: 'automation',
        github: 'https://github.com/microsoft/playwright',
        description: 'Browser automation. Headless publishing, scraping.',
        localFirst: true,
        installCommand: 'npm install playwright',
        integrationStatus: 'planned',
        replaces: 'Puppeteer (Chrome-only), cloud automation',
        notes: 'Use for auto-publishing to platforms without APIs'
    },
    // ═══════════════ WORKFLOW ═══════════════
    {
        name: 'ReactFlow',
        category: 'workflow',
        github: 'https://github.com/xyflow/xyflow',
        description: 'Node-based visual editor. Build workflows visually.',
        localFirst: true,
        installCommand: 'npm install reactflow',
        integrationStatus: 'planned',
        replaces: 'n8n, Make.com UI',
        notes: 'Integrate with agent tools for visual automation'
    }
];
// =============== HELPER FUNCTIONS ===============
function getByCategory(category) {
    return exports.OSS_REGISTRY.filter(c => c.category === category);
}
exports.getByCategory = getByCategory;
function getIntegrated() {
    return exports.OSS_REGISTRY.filter(c => c.integrationStatus === 'integrated');
}
exports.getIntegrated = getIntegrated;
function getPlanned() {
    return exports.OSS_REGISTRY.filter(c => c.integrationStatus === 'planned');
}
exports.getPlanned = getPlanned;
function findReplacement(cloudService) {
    return exports.OSS_REGISTRY.find(c => { var _a; return (_a = c.replaces) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(cloudService.toLowerCase()); });
}
exports.findReplacement = findReplacement;
// =============== INTEGRATION PRIORITY ===============
exports.INTEGRATION_PRIORITY = [
    'Monaco Editor', // IDE experience
    'Xterm.js', // Better terminal
    'ReactFlow', // Visual workflows
    'Whisper.cpp', // Voice input
    'Piper TTS', // Voice output
    'ComfyUI', // Image/video
    'Playwright', // Auto-publish
    'LangGraph', // Agent flows
];
// =============== QUICK STATUS ===============
function getOSSStatus() {
    return {
        integrated: getIntegrated().length,
        planned: getPlanned().length,
        total: exports.OSS_REGISTRY.length
    };
}
exports.getOSSStatus = getOSSStatus;
