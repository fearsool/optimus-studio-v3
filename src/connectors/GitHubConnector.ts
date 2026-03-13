/**
 * 🔗 GITHUB CONNECTOR - Local-First Git Operations
 * ================================================
 * Handles Git operations without requiring GitHub API when possible.
 * Falls back to local git commands for maximum independence.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// =============== TYPES ===============
export interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    staged: string[];
    modified: string[];
    untracked: string[];
}

export interface CommitInfo {
    hash: string;
    message: string;
    author: string;
    date: Date;
}

export interface RepoInfo {
    name: string;
    path: string;
    remote: string;
    branch: string;
}

// =============== GITHUB CONNECTOR CLASS ===============
export class GitHubConnector {
    private workspacePath: string;
    private token: string | null = null;

    constructor(workspacePath: string = process.cwd()) {
        this.workspacePath = workspacePath;
        this.loadToken();
    }

    private loadToken(): void {
        // Try to load from environment or config
        this.token = process.env.GITHUB_TOKEN || null;
    }

    // =============== LOCAL GIT OPERATIONS ===============

    async getStatus(): Promise<GitStatus> {
        try {
            const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: this.workspacePath });
            const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: this.workspacePath });

            const lines = statusOut.split('\n').filter(l => l.trim());
            const staged: string[] = [];
            const modified: string[] = [];
            const untracked: string[] = [];

            for (const line of lines) {
                const status = line.substring(0, 2);
                const file = line.substring(3);

                if (status.includes('A') || status.includes('M') && status[0] !== ' ') {
                    staged.push(file);
                } else if (status.includes('M') || status.includes('D')) {
                    modified.push(file);
                } else if (status.includes('?')) {
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
        } catch (error) {
            throw new Error(`Git status failed: ${error}`);
        }
    }

    async add(files: string[] | 'all' = 'all'): Promise<void> {
        const fileArg = files === 'all' ? '-A' : files.join(' ');
        await execAsync(`git add ${fileArg}`, { cwd: this.workspacePath });
    }

    async commit(message: string): Promise<string> {
        try {
            const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
                cwd: this.workspacePath
            });

            // Extract commit hash
            const match = stdout.match(/\[[\w-]+\s+([a-f0-9]+)\]/);
            return match ? match[1] : 'unknown';
        } catch (error: any) {
            if (error.message.includes('nothing to commit')) {
                return 'no-changes';
            }
            throw error;
        }
    }

    async push(remote: string = 'origin', branch?: string): Promise<void> {
        const branchArg = branch || (await this.getCurrentBranch());
        await execAsync(`git push ${remote} ${branchArg}`, { cwd: this.workspacePath });
    }

    async pull(remote: string = 'origin', branch?: string): Promise<void> {
        const branchArg = branch || (await this.getCurrentBranch());
        await execAsync(`git pull ${remote} ${branchArg}`, { cwd: this.workspacePath });
    }

    async clone(repoUrl: string, targetPath: string): Promise<void> {
        await execAsync(`git clone ${repoUrl} "${targetPath}"`);
    }

    async getCurrentBranch(): Promise<string> {
        const { stdout } = await execAsync('git branch --show-current', { cwd: this.workspacePath });
        return stdout.trim();
    }

    async getLog(limit: number = 10): Promise<CommitInfo[]> {
        const { stdout } = await execAsync(
            `git log -${limit} --pretty=format:"%H|%s|%an|%aI"`,
            { cwd: this.workspacePath }
        );

        return stdout.split('\n').filter(l => l.trim()).map(line => {
            const [hash, message, author, date] = line.split('|');
            return { hash, message, author, date: new Date(date) };
        });
    }

    async createBranch(name: string, checkout: boolean = true): Promise<void> {
        if (checkout) {
            await execAsync(`git checkout -b ${name}`, { cwd: this.workspacePath });
        } else {
            await execAsync(`git branch ${name}`, { cwd: this.workspacePath });
        }
    }

    async switchBranch(name: string): Promise<void> {
        await execAsync(`git checkout ${name}`, { cwd: this.workspacePath });
    }

    async getBranches(): Promise<string[]> {
        const { stdout } = await execAsync('git branch -a', { cwd: this.workspacePath });
        return stdout.split('\n')
            .map(b => b.trim().replace('* ', ''))
            .filter(b => b && !b.includes('->'));
    }

    // =============== GITHUB API OPERATIONS ===============

    async createPullRequest(title: string, body: string, head: string, base: string = 'main'): Promise<string | null> {
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

    async isGitRepo(): Promise<boolean> {
        try {
            await execAsync('git rev-parse --git-dir', { cwd: this.workspacePath });
            return true;
        } catch {
            return false;
        }
    }

    async init(): Promise<void> {
        await execAsync('git init', { cwd: this.workspacePath });
    }

    async getRemotes(): Promise<Record<string, string>> {
        const { stdout } = await execAsync('git remote -v', { cwd: this.workspacePath });
        const remotes: Record<string, string> = {};

        stdout.split('\n').forEach(line => {
            const match = line.match(/^(\S+)\s+(\S+)/);
            if (match) {
                remotes[match[1]] = match[2];
            }
        });

        return remotes;
    }

    setWorkspace(path: string): void {
        this.workspacePath = path;
    }

    setToken(token: string): void {
        this.token = token;
    }
}

// =============== SINGLETON ===============
export const githubConnector = new GitHubConnector();
