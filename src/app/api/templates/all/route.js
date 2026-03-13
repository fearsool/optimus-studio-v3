"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const server_1 = require("next/server");
const store_1 = require("@/services/templates/store");
async function GET() {
    try {
        const templates = await (0, store_1.getTemplates)();
        return server_1.NextResponse.json({
            success: true,
            count: templates.length,
            templates: templates
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
exports.GET = GET;
