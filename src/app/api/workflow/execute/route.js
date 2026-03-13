"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const server_1 = require("next/server");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function POST(req) {
    try {
        const { nodeId, action, params } = await req.json();
        // Mock Execution Logic for now
        // In real implementation, this would trigger specific factory scripts
        console.log(`Executing Node ${nodeId}: ${action}`, params);
        let result = '';
        if (action === 'run_command') {
            const { stdout, stderr } = await execAsync(params.command || 'echo "No command provided"');
            result = stdout || stderr;
        }
        else if (action === 'ovi_render') {
            // Trigger Real OVI-4 Engine
            // Running the channels script in a detached process or waiting for it
            console.log('Starting OVI-4 Render Process...');
            // Construct the command to run the specific channel or all channels
            // For now, we run the existing run_channels.ts script
            // In future, params.channelId could specify which channel to render
            const projectRoot = process.cwd().split('apps')[0]; // Go up from apps/optimus-studio
            const corePath = `${projectRoot}/products/profit-factory-os-v1/core`;
            // We use a promise to wrap the execution but maybe not wait for full completion if long running
            // For this demo, let's wait a bit or run in background
            const command = `cd "${corePath}" && npx tsx run_channels.ts`;
            // Execute (this might hang the request if we wait too long, so maybe fire and forget?)
            // Let's assume we want to trigger it and return "Started"
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`OVI Execution error: ${error}`);
                    return;
                }
                console.log(`OVI Output: ${stdout}`);
            });
            result = 'OVI-4 Production Run Initiated (Background)';
        }
        else {
            await new Promise(resolve => setTimeout(resolve, 500));
            result = `Action ${action} executed.`;
        }
        return server_1.NextResponse.json({
            success: true,
            nodeId,
            status: 'done',
            result
        });
    }
    catch (error) {
        console.error('Workflow Execution Error:', error);
        return server_1.NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
exports.POST = POST;
