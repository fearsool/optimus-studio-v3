import { NextRequest, NextResponse } from 'next/server';
import { OptimusAgentCore } from '@/agent/core/OptimusAgentCore';

// Singleton instance for the agent (simple approach for dev)
let globalAgent: OptimusAgentCore | null = null;

function getAgent() {
    if (!globalAgent) {
        globalAgent = new OptimusAgentCore();
    }
    return globalAgent;
}

export async function POST(req: NextRequest) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            console.warn('[API Agent] Invalid or empty JSON body');
            body = {};
        }

        let { action, data } = body;
        const agent = getAgent();

        // Backward compatibility for old frontend sending { message, history }
        if (!action && body.message) {
            action = 'processText';
            data = { text: body.message, history: body.history };
        }

        if (!action) {
            return NextResponse.json({ success: false, error: 'No action provided' }, { status: 400 });
        }

        console.log(`[API Agent] Action: ${action}`);

        switch (action) {
            case 'init':
                await agent.start();
                return NextResponse.json({ success: true, status: 'running' });

            case 'addTask':
                await agent.addTask(data.task);
                return NextResponse.json({ success: true });

            case 'processText':
                const response = await agent.processTextCommand(data.text);
                return NextResponse.json({ success: true, response });

            case 'processOllama':
                // Original logic from src/pages/api/agent.ts
                const ollamaRes = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'mistral',
                        prompt: `As Optimus Agent, respond to: ${data.message}\n\nContext: ${JSON.stringify(data.history || [])}`,
                        stream: false
                    })
                });
                const ollamaData = await ollamaRes.json();
                return NextResponse.json({
                    success: true,
                    response: ollamaData.response,
                    plan: null
                });

            case 'getStatus':
                const health = await agent.performHealthCheck();
                return NextResponse.json({ success: true, health });

            default:
                return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[API Agent Error]:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
