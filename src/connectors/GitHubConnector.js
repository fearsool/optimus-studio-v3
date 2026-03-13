"use strict";
/**
 * 🔗 GITHUB CONNECTOR - Local-First Git Operations
 * ================================================
 * Handles Git operations without requiring GitHub API when possible.
 * Falls back to local git commands for maximum independence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubConnector = exports.GitHubConnector = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// =============== GITHUB CONNECTOR CLASS ===============
class GitHubConnector {
    constructor(workspacePath = process.cwd()) {
        this.token = null;
        this.workspacePath = workspacePath;
        this.loadToken();
    }
    loadToken() {
        // Try to load from environment or config
        this.token = process.env.GITHUB_TOKEN || null;
    }
    // =============== LOCAL GIT OPERATIONS ===============
    async getStatus() {
        try {
            const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: this.workspacePath });
            const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: this.workspacePath });
            const lines = statusOut.split('\n').filter(l => l.trim());
            const staged = [];
            const modified = [];
            const untracked = [];
            for (const line of lines) {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                if (status.includes('A') || status.includes('M') && status[0] !== ' ') {
                    staged.push(file);
                }
                else if (status.includes('M') || status.includes('D')) {
                    modified.push(file);
                }
                else if (status.includes('?')) {
                    untracked.push(file);
                }
            }
            return {
                branch: branchOut.trim(),
                ahead: 0, // Would need git rev-list to calculate
                behind: 0,
                staged,
                modified,
                untracked
            };
        }
        catch (error) {
            throw new Error(`Git status failed: ${error}`);
        }
    }
    async add(files = 'all') {
        const fileArg = files === 'all' ? '-A' : files.join(' ');
        await execAsync(`git add ${fileArg}`, { cwd: this.workspacePath });
    }
    async commit(message) {
        try {
            const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
                cwd: this.workspacePath
            });
            // Extract commit hash
            const match = stdout.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
            return match ? match[1] : 'unknown';
        }
        catch (error) {
            if (error.message.includes('nothing to commit')) {
                return 'no-changes';
            }
            throw error;
        }
    }
    async push(remote = 'origin', branch) {
        const branchArg = branch || (await this.getCurrentBranch());
        await execAsync(`git push ${remote} ${branchArg}`, { cwd: this.workspacePath });
    }
    async pull(remote = 'origin', branch) {
        const branchArg = branch || (await this.getCurrentBranch());
        await execAsync(`git pull ${remote} ${branchArg}`, { cwd: this.workspacePath });
    }
    async clone(repoUrl, targetPath) {
        await execAsync(`git clone ${repoUrl} "${targetPath}"`);
    }
    async getCurrentBranch() {
        const { stdout } = await execAsync('git branch --show-current', { cwd: this.workspacePath });
        return stdout.trim();
    }
    async getLog(limit = 10) {
        const { stdout } = await execAsync(`git log -${limit} --pretty=format:"%H|%s|%an|%aI"`, { cwd: this.workspacePath });
        return stdout.split('\n').filter(l => l.trim()).map(line => {
            const [hash, message, author, date] = line.split('|');
            return { hash, message, author, date: new Date(date) };
        });
    }
    async createBranch(name, checkout = true) {
        if (checkout) {
            await execAsync(`git checkout -b ${name}`, { cwd: this.workspacePath });
        }
        else {
            await execAsync(`git branch ${name}`, { cwd: this.workspacePath });
        }
    }
    async switchBranch(name) {
        await execAsync(`git checkout ${name}`, { cwd: this.workspacePath });
    }
    async getBranches() {
        const { stdout } = await execAsync('git branch -a', { cwd: this.workspacePath });
        return stdout.split('\n')
            .map(b => b.trim().replace('* ', ''))
            .filter(b => b && !b.includes('->'));
    }
    // =============== GITHUB API OPERATIONS ===============
    async createPullRequest(title, body, head, base = 'main') {
        if (!this.token) {
            console.warn('[GitHubConnector] No token available for PR creation');
            return null;
        }
        // Get repo info from remote
        const { stdout: remoteOut } = await execAsync('git remote get-url origin', { cwd: this.workspacePath });
        const repoMatch = remoteOut.match(/github\.com[:/](.+?)(?:\.git)?$/);
        if (!repoMatch) {
            throw new Error('Could not parse GitHub repo from remote URL');
        }
        const repo = repoMatch[1].replace('.git', '');
        const response = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, body, head, base })
        });
        if (!response.ok) {
            throw new Error(`PR creation failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.html_url;
    }
    // =============== UTILITY METHODS ===============
    async isGitRepo() {
        try {
            await execAsync('git rev-parse --git-dir', { cwd: this.workspacePath });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async init() {
        await execAsync('git init', { cwd: this.workspacePath });
    }
    async getRemotes() {
        const { stdout } = await execAsync('git remote -v', { cwd: this.workspacePath });
        const remotes = {};
        stdout.split('\n').forEach(line => {
            const match = line.match(/^(\S+)\s+(\S+)/);
            if (match) {
                remotes[match[1]] = match[2];
            }
        });
        return remotes;
    }
    setWorkspace(path) {
        this.workspacePath = path;
    }
    setToken(token) {
        this.token = token;
    }
}
exports.GitHubConnector = GitHubConnector;
// =============== SINGLETON ===============
exports.githubConnector = new GitHubConnector();
