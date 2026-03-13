/**
 * 🔒 AGENT AUTHORITY CONTRACT
 * ===========================
 * Defines the immutable laws of what the agent can and cannot do.
 * This is the checks-and-balances system for Autonomy.
 */

export const AUTHORITY = {
    // 🔴 ABSOLUTE PROHIBITIONS (Must never happen)
    CAN_NEVER: [
        'upload_private_keys',         // Never upload crypto keys
        'delete_system_directories',   // Never delete Windows/System32 etc.
        'modify_agent_core',           // Prevent self-lobotomy (can modify extensions, but not core without safety)
        'access_browser_passwords'     // Never dump Chrome passwords
    ],

    // 🟠 REQUIRES EXPLICIT USER APPROVAL (Voice or UI Click)
    REQUIRES_APPROVAL: [
        'delete_user_files',           // "delete functionality"
        'deploy_to_production',        // "netlify deploy --prod"
        'execute_financial_transaction', // "send eth"
        'send_whatsapp_message',       // Anti-spam
        'install_system_package'       // "npm install -g"
    ],

    // 🟢 AUTONOMOUSLY ALLOWED (Safe to run in loop)
    CAN_AUTO: [
        'read_project_files',
        'write_project_files',         // Code generation is allowed
        'run_tests',
        'web_search',                  // Read-only research
        'analyze_logs',
        'refactor_code'
    ]
};

/**
 * ⏳ EXECUTION BUDGET
 * Prevents runaway loops or excessive resource usage.
 */
export const EXECUTION_BUDGET = {
    MAX_STEPS_PER_TASK: 50,           // Stop after 50 steps to prevent infinite loops
    MAX_FILE_CHANGES_PER_RUN: 10,     // Don't rewrite the whole project at once
    MAX_API_COST_PER_DAY: 5.00,       // $5 limit (if using paid APIs)
    MAX_VRAM_USAGE_GB: 12             // Leave room for OS
};
