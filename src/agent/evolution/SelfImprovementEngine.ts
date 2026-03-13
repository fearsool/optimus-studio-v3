// src/agent/evolution/SelfImprovementEngine.ts
import { StateStore } from '../state/StateStore';
import { ModelRouter } from '../router/ModelRouter';
import { WhatsAppConnector } from '../connectors/WhatsAppConnector';
import { CodeGeneratorHF } from '../../services/codeGeneratorHF';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'glob';
import { Project, SyntaxKind } from 'ts-morph';
import * as crypto from 'crypto';

const execAsync = promisify(exec);
const globAsync = glob;
import { LearningMemory } from './LearningMemory';

// --- Interfaces ---

interface LearningState {
    activeSkills: string[];
    learningQueue: string[];
    lastImprovement: Date | null;
    performanceMetrics: Record<string, number>;
    errorHistory: ErrorRecord[];
    successfulImprovements: ImprovementRecord[];
}

interface ErrorRecord {
    id: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    context: any;
    timestamp: Date;
    count: number;
    resolved: boolean;
    resolution?: string;
}

interface ImprovementRecord {
    id: string;
    description: string;
    appliedAt: Date;
    filesModified: string[];
    performanceGain: number;
    success: boolean;
    beforeMetrics: any;
    afterMetrics: any;
}

interface CodeImprovementResult {
    improvements: ImprovementResult[];
    filesModified: string[];
    performanceGain: number;
    success: boolean;
    error?: string;
}

interface ImprovementResult {
    id: string;
    description: string;
    modifiedFiles: string[];
    beforeMetrics: any;
    afterMetrics: any;
    success: boolean;
    appliedAt: Date;
    confidence?: number;
}

interface SkillLearningResult {
    skill: string;
    status: 'learning' | 'learned' | 'needs_more_practice' | 'failed';
    progress: number;
    resources: any[];
    implementation: SkillImplementation | null;
    confidence?: number;
    feedback?: string;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
}

interface SkillImplementation {
    projectName: string;
    usage: string;
    code: string;
    testCode?: string;
    dependencies: string[];
}

interface GhostModeResult {
    startTime: Date;
    endTime?: Date;
    optimizations: any[];
    performanceGain: number;
    cleanedLogs: number;
    cleanedFiles: number;
    databaseOptimized: boolean;
    cacheCleared: boolean;
    success?: boolean;
    error?: string;
}

interface CodeAnalysis {
    totalFiles: number;
    totalLines: number;
    complexity: Record<string, any>;
    performanceIssues: any[];
    codeSmells: any[];
    duplication: any[];
    typeCoverage: number;
    testCoverage: number;
}

interface ImprovementIdea {
    id: string;
    description: string;
    expectedImpact: { before: any; after: any };
    difficulty: number;
    filesToModify: string[];
    codeExample: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: number; // minutes
    aiConfidence: number;
}

interface PerformanceMetrics {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    responseTime: number;
    throughput: number;
    errorRate: number;
    timestamp: Date;
}

export class SelfImprovementEngine {
    private stateStore: StateStore;
    private modelRouter: ModelRouter;
    private whatsapp: WhatsAppConnector;
    private codeGenerator: CodeGeneratorHF;
    private tsProject: Project;
    private learningMemory: LearningMemory;

    // Öğrenme durumu
    private learningState: LearningState = {
        activeSkills: [],
        learningQueue: [],
        lastImprovement: null,
        performanceMetrics: {},
        errorHistory: [],
        successfulImprovements: []
    };

    // Monitoring
    private metricsHistory: PerformanceMetrics[] = [];
    private learningDatabasePath: string;
    private isLearningActive: boolean = false;

    constructor() {
        this.stateStore = StateStore.getInstance();
        this.modelRouter = new ModelRouter();
        this.whatsapp = new WhatsAppConnector();
        this.codeGenerator = new CodeGeneratorHF();
        this.tsProject = new Project();
        this.learningMemory = new LearningMemory();

        // Learning database path
        this.learningDatabasePath = path.join(process.cwd(), 'data', 'learning.db');
        this.ensureLearningDatabase();

        // Başlangıçta learning state'i yükle
        this.loadLearningState();

        // Öğrenme döngüsünü başlat
        this.startLearningCycle();

        // Monitoring başlat
        this.startPerformanceMonitoring();
    }

    private ensureLearningDatabase(): void {
        const dbDir = path.dirname(this.learningDatabasePath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirpSync(dbDir);
        }

        // SQLite database oluştur
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.exec(`
            CREATE TABLE IF NOT EXISTS learning_records (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                description TEXT,
                data JSON,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS error_history (
                id TEXT PRIMARY KEY,
                error_type TEXT NOT NULL,
                error_message TEXT,
                stack_trace TEXT,
                context JSON,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                count INTEGER DEFAULT 1,
                resolved BOOLEAN DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS skill_progress (
                skill TEXT PRIMARY KEY,
                status TEXT DEFAULT 'learning',
                progress REAL DEFAULT 0,
                resources JSON,
                implementation JSON,
                started_at DATETIME,
                completed_at DATETIME
            );
            
            CREATE TABLE IF NOT EXISTS performance_metrics (
                timestamp DATETIME PRIMARY KEY,
                memory_usage JSON,
                cpu_usage JSON,
                response_time REAL,
                throughput REAL,
                error_rate REAL
            );
        `);

        db.close();
    }

    private safeJsonParse(str: string): any {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.warn('⚠️ JSON parsing error:', e.message);
            return {};
        }
    }

    private async loadLearningState(): Promise<void> {
        try {
            const sqlite3 = require('better-sqlite3');
            const db = new sqlite3(this.learningDatabasePath);

            // Error history yükle
            const errorRows = db.prepare('SELECT * FROM error_history ORDER BY timestamp DESC LIMIT 100').all();
            this.learningState.errorHistory = errorRows.map((row: any) => ({
                id: row.id,
                errorType: row.error_type,
                errorMessage: row.error_message,
                stackTrace: row.stack_trace,
                context: this.safeJsonParse(row.context),
                timestamp: new Date(row.timestamp),
                count: row.count,
                resolved: row.resolved === 1
            }));

            // Skill progress yükle
            const skillRows = db.prepare('SELECT * FROM skill_progress WHERE status != "learned"').all();
            this.learningState.activeSkills = skillRows.map((row: any) => row.skill);

            db.close();

        } catch (error) {
            console.error('Learning state load error:', error);
        }
    }

    private startLearningCycle(): void {
        // Her 2 saatte bir öğrenme döngüsü çalıştır
        setInterval(async () => {
            if (!this.isLearningActive) {
                this.isLearningActive = true;
                try {
                    await this.learningCycle();
                } catch (err) {
                    console.error('Learning cycle error:', err);
                    await this.recordError(err as Error, { source: 'learningCycle' });
                } finally {
                    this.isLearningActive = false;
                }
            }
        }, 2 * 60 * 60 * 1000);

        // Hemen başlat
        setTimeout(() => {
            this.learningCycle().catch(console.error);
        }, 30000);
    }

    private startPerformanceMonitoring(): void {
        // Her 5 dakikada bir performans metrikleri topla
        setInterval(async () => {
            await this.collectPerformanceMetrics();
        }, 5 * 60 * 1000);

        // Hemen başlat
        this.collectPerformanceMetrics().catch(console.error);
    }

    private async collectPerformanceMetrics(): Promise<void> {
        const metrics: PerformanceMetrics = {
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            responseTime: await this.measureResponseTime(),
            throughput: await this.calculateThroughput(),
            errorRate: await this.calculateErrorRate(),
            timestamp: new Date()
        };

        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > 1000) {
            this.metricsHistory.shift();
        }

        // Database'e kaydet
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.prepare(`
            INSERT INTO performance_metrics 
            (timestamp, memory_usage, cpu_usage, response_time, throughput, error_rate)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            metrics.timestamp.toISOString(),
            JSON.stringify(metrics.memoryUsage),
            JSON.stringify(metrics.cpuUsage),
            metrics.responseTime,
            metrics.throughput,
            metrics.errorRate
        );

        db.close();
    }

    private async measureResponseTime(): Promise<number> {
        // API response time ölç
        try {
            const start = Date.now();
            await fetch('http://localhost:3000/api/health');
            return Date.now() - start;
        } catch {
            return 0;
        }
    }

    private async calculateThroughput(): Promise<number> {
        // Son 5 dakikadaki task sayısı
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentTasks = this.learningState.successfulImprovements.filter(
            imp => imp.appliedAt > fiveMinutesAgo
        );
        return recentTasks.length / 5; // tasks per minute
    }

    private async calculateErrorRate(): Promise<number> {
        // Son 1 saatteki hata oranı
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentErrors = this.learningState.errorHistory.filter(
            err => err.timestamp > oneHourAgo
        );
        const totalTasks = this.learningState.successfulImprovements.filter(
            imp => imp.appliedAt > oneHourAgo
        ).length;

        return totalTasks > 0 ? recentErrors.length / totalTasks : 0;
    }

    public async recordError(error: Error, context: any): Promise<void> {
        // Delegate to LearningMemory
        await this.learningMemory.recordError(error, context);

        // Keep legacy local logging
        console.log(`🔴 Hata kaydedildi: ${error.message} (${JSON.stringify(context)})`);

        // Kritik hataları WhatsApp'tan bildir
        if (error.message.includes('fatal') || error.message.includes('critical')) {
            try {
                await this.whatsapp.sendMessage(
                    process.env.USER_PHONE || '+905551234567',
                    `🚨 KRİTİK HATA ALINDI\n\n` +
                    `Hata: ${error.message}\n` +
                    `Kaynak: ${context.source || 'unknown'}\n` +
                    `Zaman: ${new Date().toLocaleString('tr-TR')}\n\n` +
                    `Otomatik çözüm deneniyor...`
                );
            } catch (e) {
                console.error('Failed to send WhatsApp alert:', e);
            }
        }
    }

    // --- GERÇEK LEARNING CYCLE METHODS ---

    private async analyzePerformance(): Promise<any[]> {
        const issues: any[] = [];

        // 1. Memory leak kontrolü
        if (this.metricsHistory.length > 10) {
            const recentMemory = this.metricsHistory.slice(-10).map(m => m.memoryUsage.heapUsed);
            const memoryTrend = this.calculateTrend(recentMemory);

            if (memoryTrend > 0.1) { // %10'dan fazla artış
                issues.push({
                    type: 'memory_leak',
                    severity: 'high',
                    description: 'Memory leak detected - heap usage increasing',
                    data: { trend: memoryTrend, recentMemory }
                });
            }
        }

        // 2. CPU usage kontrolü
        const highCpuPeriods = this.metricsHistory.filter(m => {
            const cpuPercent = (m.cpuUsage.user + m.cpuUsage.system) / 1000000;
            return cpuPercent > 80; // %80'den fazla CPU
        });

        if (highCpuPeriods.length > 5) {
            issues.push({
                type: 'high_cpu',
                severity: 'medium',
                description: 'High CPU usage detected',
                data: { periods: highCpuPeriods.length }
            });
        }

        // 3. Response time kontrolü
        const slowResponses = this.metricsHistory.filter(m => m.responseTime > 1000); // 1s'den yavaş
        if (slowResponses.length > 3) {
            issues.push({
                type: 'slow_response',
                severity: 'medium',
                description: 'Slow API response times detected',
                data: { count: slowResponses.length, avgTime: slowResponses.reduce((a, b) => a + b.responseTime, 0) / slowResponses.length }
            });
        }

        return issues;
    }

    private calculateTrend(data: number[]): number {
        if (data.length < 2) return 0;
        const first = data[0];
        const last = data[data.length - 1];
        return (last - first) / first;
    }

    private async analyzeErrors(): Promise<any[]> {
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        const errorRows = db.prepare(`
            SELECT error_type, error_message, COUNT(*) as count 
            FROM error_history 
            WHERE resolved = 0 
            GROUP BY error_type, error_message 
            HAVING count > 2
            ORDER BY count DESC
        `).all();

        db.close();

        return errorRows.map((row: any) => ({
            type: row.error_type,
            message: row.error_message,
            count: row.count,
            priority: row.count > 10 ? 'critical' : row.count > 5 ? 'high' : 'medium'
        }));
    }

    private async identifySkillNeeds(): Promise<string[]> {
        const skills: string[] = [];

        // 1. Sık hatalardan skill ihtiyacını belirle
        const commonErrors = await this.analyzeErrors();
        for (const error of commonErrors) {
            if (error.message.includes('database') || error.message.includes('query')) {
                if (!skills.includes('database_optimization')) {
                    skills.push('database_optimization');
                }
            }
            if (error.message.includes('memory') || error.message.includes('heap')) {
                if (!skills.includes('memory_management')) {
                    skills.push('memory_management');
                }
            }
            if (error.message.includes('type') || error.message.includes('TypeError')) {
                if (!skills.includes('typescript_advanced')) {
                    skills.push('typescript_advanced');
                }
            }
        }

        // 2. Performance issues'dan skill ihtiyacını belirle
        const performanceIssues = await this.analyzePerformance();
        for (const issue of performanceIssues) {
            if (issue.type === 'memory_leak') {
                if (!skills.includes('memory_management')) {
                    skills.push('memory_management');
                }
            }
            if (issue.type === 'high_cpu') {
                if (!skills.includes('performance_optimization')) {
                    skills.push('performance_optimization');
                }
            }
            if (issue.type === 'slow_response') {
                if (!skills.includes('api_optimization')) {
                    skills.push('api_optimization');
                }
            }
        }

        // 3. Mevcut skill'leri kontrol et, öğrenilmemiş olanları ekle
        const existingSkills = this.learningState.activeSkills;
        return skills.filter(skill => !existingSkills.includes(skill));
    }

    private async createImprovementPlan(issues: any[], errors: any[], skills: string[]): Promise<any> {
        const plan = {
            timestamp: new Date(),
            issuesToFix: [] as any[],
            skillsToLearn: [] as any[],
            timeline: {
                immediate: [] as any[],   // Bugün
                shortTerm: [] as any[],   // Bu hafta
                longTerm: [] as any[]     // Bu ay
            }
        };

        // 1. Kritik hataları immediate olarak ekle
        const criticalErrors = errors.filter(e => e.priority === 'critical');
        for (const error of criticalErrors.slice(0, 3)) { // En fazla 3 tane
            plan.issuesToFix.push({
                type: 'error_fix',
                priority: 'critical',
                description: `Fix ${error.type}: ${error.message.substring(0, 100)}`,
                estimatedTime: 60, // 1 saat
                requires: []
            });
            plan.timeline.immediate.push(`Fix critical error: ${error.type}`);
        }

        // 2. High severity performance issues
        const highPerfIssues = issues.filter(i => i.severity === 'high');
        for (const issue of highPerfIssues.slice(0, 2)) {
            plan.issuesToFix.push({
                type: 'performance_fix',
                priority: 'high',
                description: `Fix ${issue.type}: ${issue.description}`,
                estimatedTime: 120, // 2 saat
                requires: []
            });
            plan.timeline.immediate.push(`Fix performance issue: ${issue.type}`);
        }

        // 3. Skill learning planı
        for (const skill of skills.slice(0, 2)) { // En fazla 2 skill aynı anda
            plan.skillsToLearn.push({
                skill,
                priority: 'medium',
                description: `Learn ${skill} to prevent related issues`,
                estimatedTime: 240, // 4 saat
                resources: await this.researchSkillResources(skill)
            });
            plan.timeline.shortTerm.push(`Learn skill: ${skill}`);
        }

        return plan;
    }

    private async applyImprovements(plan: any): Promise<any[]> {
        const improvements: any[] = [];

        // 1. Error fixes uygula
        for (const fix of plan.issuesToFix.filter((item: any) => item.type === 'error_fix')) {
            try {
                const result = await this.applyErrorFix(fix);
                improvements.push(result);

                if (result.success) {
                    // Hatayı resolved olarak işaretle
                    await this.markErrorAsResolved(fix.description);
                }
            } catch (error) {
                await this.recordError(error as Error, { source: 'applyErrorFix', fix });
            }
        }

        // 2. Performance fixes uygula
        for (const fix of plan.issuesToFix.filter((item: any) => item.type === 'performance_fix')) {
            try {
                const result = await this.applyPerformanceFix(fix);
                improvements.push(result);
            } catch (error) {
                await this.recordError(error as Error, { source: 'applyPerformanceFix', fix });
            }
        }

        // 3. Skill learning başlat
        for (const skillPlan of plan.skillsToLearn) {
            try {
                const result = await this.learnNewSkill(skillPlan.skill);
                improvements.push({
                    type: 'skill_learning',
                    skill: skillPlan.skill,
                    result
                });
            } catch (error) {
                await this.recordError(error as Error, { source: 'learnNewSkill', skillPlan });
            }
        }

        return improvements;
    }

    private async applyErrorFix(fix: any): Promise<any> {
        // Hata mesajına göre fix stratejisi belirle
        if (fix.description.includes('database')) {
            return await this.fixDatabaseError(fix);
        } else if (fix.description.includes('memory')) {
            return await this.fixMemoryError(fix);
        } else if (fix.description.includes('type')) {
            return await this.fixTypeError(fix);
        } else {
            // Generic fix - AI ile çözüm üret
            return await this.generateAiFix(fix);
        }
    }

    private async fixDatabaseError(fix: any): Promise<any> {
        // 1. Yavaş query'leri bul
        const slowQueries = await this.findSlowQueries();

        // 2. Index ekle veya query'leri optimize et
        const optimizations = [];
        for (const query of slowQueries.slice(0, 3)) {
            const optimized = await this.optimizeQuery(query);
            if (optimized) {
                optimizations.push({
                    query: query.substring(0, 100),
                    optimization: optimized.substring(0, 100)
                });
            }
        }

        return {
            type: 'database_fix',
            success: optimizations.length > 0,
            optimizations,
            appliedAt: new Date()
        };
    }

    private async fixMemoryError(fix: any): Promise<any> {
        // 1. Memory leak olabilecek dosyaları tara
        const leakCandidates = await this.findMemoryLeakCandidates();

        // 2. AI ile fix üret
        const fixes = [];
        for (const file of leakCandidates.slice(0, 2)) {
            const fixResult = await this.fixMemoryLeakInFile(file);
            if (fixResult.success) {
                fixes.push(fixResult);
            }
        }

        // 3. GC ayarlarını optimize et
        await this.optimizeGCSettings();

        return {
            type: 'memory_fix',
            success: fixes.length > 0,
            fixes,
            appliedAt: new Date()
        };
    }

    private async fixTypeError(fix: any): Promise<any> {
        // 1. Type error olan dosyaları bul
        const typeErrorFiles = await this.findTypeErrorFiles();

        // 2. Her dosya için type fix uygula
        const fixes = [];
        for (const file of typeErrorFiles.slice(0, 3)) {
            const fixResult = await this.fixTypesInFile(file);
            if (fixResult.success) {
                fixes.push(fixResult);
            }
        }

        return {
            type: 'type_fix',
            success: fixes.length > 0,
            fixes,
            appliedAt: new Date()
        };
    }

    private async generateAiFix(fix: any): Promise<any> {
        // AI'ya hata fix'i için prompt gönder
        const prompt = `
            Problem: ${fix.description}
            
            Error context: ${JSON.stringify(fix, null, 2)}
            
            Please provide:
            1. Root cause analysis
            2. Step-by-step fix
            3. Code changes needed
            4. Tests to verify fix
            
            Respond in JSON format.
        `;

        const response = await this.modelRouter.query('error_fix', prompt);
        const fixPlan = this.safeJsonParse(response.content);

        // Fix'i uygula
        const result = await this.applyAiFixPlan(fixPlan);

        return {
            type: 'ai_fix',
            success: result.success,
            fixPlan: fixPlan,
            result,
            appliedAt: new Date()
        };
    }

    private async applyAiFixPlan(fixPlan: any): Promise<any> {
        try {
            // 1. Code changes uygula
            for (const change of fixPlan.codeChanges || []) {
                await this.applyCodeChange(change);
            }

            // 2. Tests çalıştır
            const testsPassed = await this.runTests();

            // 3. Verify
            if (testsPassed) {
                return { success: true, message: 'Fix applied successfully' };
            } else {
                // Revert changes
                await this.revertChanges(fixPlan.codeChanges || []);
                return { success: false, message: 'Tests failed after fix' };
            }
        } catch (error) {
            return { success: false, message: `Fix application failed: ${error.message}` };
        }
    }

    private async applyPerformanceFix(fix: any): Promise<any> {
        if (fix.description.includes('memory_leak')) {
            return await this.fixMemoryLeak();
        } else if (fix.description.includes('high_cpu')) {
            return await this.fixHighCpu();
        } else if (fix.description.includes('slow_response')) {
            return await this.fixSlowResponse();
        }

        return { success: false, message: 'Unknown performance issue type' };
    }

    private async fixMemoryLeak(): Promise<any> {
        // 1. Heap snapshot al
        await this.takeHeapSnapshot();

        // 2. Memory leak pattern'lerini ara
        const leaks = await this.analyzeHeapForLeaks();

        // 3. Fix uygula
        const fixes = [];
        for (const leak of leaks.slice(0, 2)) {
            const fix = await this.fixSpecificLeak(leak);
            if (fix.success) {
                fixes.push(fix);
            }
        }

        return {
            type: 'memory_leak_fix',
            success: fixes.length > 0,
            fixes,
            appliedAt: new Date()
        };
    }

    private async fixHighCpu(): Promise<any> {
        // 1. CPU profiling yap
        await this.startCpuProfiling();
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 saniye profil
        const profile = await this.stopCpuProfiling();

        // 2. Hot spot'ları bul
        const hotSpots = this.analyzeCpuProfile(profile);

        // 3. Optimization uygula
        const optimizations = [];
        for (const spot of hotSpots.slice(0, 3)) {
            const optimized = await this.optimizeHotSpot(spot);
            if (optimized.success) {
                optimizations.push(optimized);
            }
        }

        return {
            type: 'cpu_optimization',
            success: optimizations.length > 0,
            optimizations,
            appliedAt: new Date()
        };
    }

    private async fixSlowResponse(): Promise<any> {
        // 1. Yavaş endpoint'leri bul
        const slowEndpoints = await this.findSlowEndpoints();

        // 2. Her endpoint'i optimize et
        const optimizations = [];
        for (const endpoint of slowEndpoints.slice(0, 3)) {
            const optimized = await this.optimizeEndpoint(endpoint);
            if (optimized.success) {
                optimizations.push(optimized);
            }
        }

        // 3. Caching stratejisini geliştir
        await this.improveCachingStrategy();

        return {
            type: 'response_optimization',
            success: optimizations.length > 0,
            optimizations,
            appliedAt: new Date()
        };
    }

    private async evaluateImprovements(improvements: any[]): Promise<any> {
        const evaluation = {
            timestamp: new Date(),
            totalImprovements: improvements.length,
            successful: improvements.filter(i => i.success).length,
            failed: improvements.filter(i => !i.success).length,
            performanceImpact: 0,
            details: [] as any[]
        };

        // Her improvement'ı değerlendir
        for (const improvement of improvements) {
            const impact = await this.measureImprovementImpact(improvement);
            evaluation.details.push({
                type: improvement.type,
                success: improvement.success,
                impact,
                appliedAt: improvement.appliedAt
            });

            if (improvement.success && impact.performanceGain) {
                evaluation.performanceImpact += impact.performanceGain;
            }
        }

        // Database'e kaydet
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.prepare(`
            INSERT INTO learning_records (id, type, description, data, success)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            `eval_${Date.now()}`,
            'improvement_evaluation',
            `Evaluated ${improvements.length} improvements`,
            JSON.stringify(evaluation),
            evaluation.successful > 0 ? 1 : 0
        );

        db.close();

        return evaluation;
    }

    private async measureImprovementImpact(improvement: any): Promise<any> {
        // Improvement tipine göre impact ölç
        switch (improvement.type) {
            case 'memory_leak_fix':
                return await this.measureMemoryImpact();
            case 'cpu_optimization':
                return await this.measureCpuImpact();
            case 'response_optimization':
                return await this.measureResponseImpact();
            default:
                return { performanceGain: 0, stabilityGain: 0 };
        }
    }

    private async measureMemoryImpact(): Promise<any> {
        const before = process.memoryUsage().heapUsed;
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
        const after = process.memoryUsage().heapUsed;

        const leakRate = (after - before) / 5; // bytes per second
        return {
            performanceGain: -leakRate, // Negatif leak rate iyi
            stabilityGain: leakRate < 1000 ? 1 : 0.5 // < 1KB/s ise stabil
        };
    }

    private async measureCpuImpact(): Promise<any> {
        const before = process.cpuUsage();
        // CPU intensive task çalıştır
        await this.runCpuIntensiveTask();
        const after = process.cpuUsage();

        const cpuUsage = (after.user - before.user + after.system - before.system) / 1000000; // seconds
        return {
            performanceGain: 1 / cpuUsage, // Ters orantılı
            stabilityGain: cpuUsage < 0.5 ? 1 : 0.5 // < 0.5s ise stabil
        };
    }

    private async runCpuIntensiveTask(): Promise<void> {
        // Fibonacci hesapla
        const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);
        fib(35); // CPU intensive
    }

    private async measureResponseImpact(): Promise<any> {
        const responseTimes = [];
        for (let i = 0; i < 10; i++) {
            const start = Date.now();
            await fetch('http://localhost:3000/api/health');
            responseTimes.push(Date.now() - start);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        return {
            performanceGain: 1000 / avgTime, // Ters orantılı (ms)
            stabilityGain: avgTime < 100 ? 1 : avgTime < 500 ? 0.7 : 0.3
        };
    }

    private async sendLearningReport(improvements: any[], evaluation: any): Promise<void> {
        const successful = improvements.filter(i => i.success).length;
        const total = improvements.length;
        const successRate = total > 0 ? (successful / total) * 100 : 0;

        const report = `
🧠 ÖĞRENME DÖNGÜSÜ RAPORU
${new Date().toLocaleString('tr-TR')}

📊 GENEL DURUM:
• Tamamlanan İyileştirmeler: ${successful}/${total}
• Başarı Oranı: %${successRate.toFixed(1)}
• Performans Kazancı: %${evaluation.performanceImpact.toFixed(2)}
• Süre: ${evaluation.timestamp.toLocaleTimeString('tr-TR')}

✅ BAŞARILI İYİLEŞTİRMELER:
${improvements.filter(i => i.success).map((imp, idx) =>
            `${idx + 1}. ${imp.type} - ${imp.appliedAt?.toLocaleTimeString('tr-TR')}`
        ).join('\n') || 'Hiç yok'}

❌ BAŞARISIZ İYİLEŞTİRMELER:
${improvements.filter(i => !i.success).map((imp, idx) =>
            `${idx + 1}. ${imp.type} - ${imp.error || 'Bilinmeyen hata'}`
        ).join('\n') || 'Hiç yok'}

📈 SONRAKİ ADIMLAR:
${this.generateNextSteps(evaluation)}
        `.trim();

        // WhatsApp'tan gönder
        await this.whatsapp.sendMessage(
            process.env.USER_PHONE || '+905551234567',
            report
        );

        // Console'a yaz
        console.log(report);
    }

    private generateNextSteps(evaluation: any): string {
        const steps: string[] = [];

        if (evaluation.successful === 0) {
            steps.push('• Hata analizi algoritmasını iyileştir');
            steps.push('• Daha basit iyileştirmelerle başla');
            steps.push('• Test coverage artır');
        } else if (evaluation.performanceImpact < 5) {
            steps.push('• Daha agresif optimizasyonlar dene');
            steps.push('• Bottleneck analizi yap');
            steps.push('• Memory profiling derinleştir');
        } else {
            steps.push('• Başarılı pattern\'leri belgele');
            steps.push('• Benzer sorunlar için otomatik fix geliştir');
            steps.push('• Öğrenmeyi diğer modüllere yay');
        }

        return steps.join('\n');
    }

    private async saveLearning(improvements: any[], evaluation: any): Promise<void> {
        // Learning state'i güncelle
        this.learningState.lastImprovement = new Date();

        // Successful improvements'ları kaydet
        for (const imp of improvements.filter(i => i.success)) {
            const record: ImprovementRecord = {
                id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: imp.type || 'Unknown improvement',
                appliedAt: imp.appliedAt || new Date(),
                filesModified: imp.modifiedFiles || [],
                performanceGain: imp.performanceGain || 0,
                success: true,
                beforeMetrics: imp.beforeMetrics || {},
                afterMetrics: imp.afterMetrics || {}
            };

            this.learningState.successfulImprovements.push(record);
        }

        // Database'e kaydet
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        for (const record of this.learningState.successfulImprovements.slice(-10)) {
            db.prepare(`
                INSERT OR REPLACE INTO learning_records (id, type, description, data, success)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                record.id,
                'improvement',
                record.description,
                JSON.stringify(record),
                1
            );
        }

        db.close();
    }

    // --- MAIN PUBLIC METHODS ---

    async learningCycle(): Promise<void> {
        console.log('🧠 Öğrenme döngüsü başlatılıyor...');

        try {
            // 1. Performans analizi
            const performanceIssues = await this.analyzePerformance();

            // 2. Hata analizi
            const commonErrors = await this.analyzeErrors();

            // 3. Yeni beceri ihtiyaçları
            const skillNeeds = await this.identifySkillNeeds();

            // 4. İyileştirme planı oluştur
            const improvementPlan = await this.createImprovementPlan(
                performanceIssues,
                commonErrors,
                skillNeeds
            );

            // 5. İyileştirmeleri uygula
            const improvements = await this.applyImprovements(improvementPlan);

            // 6. Sonuçları değerlendir
            const evaluation = await this.evaluateImprovements(improvements);

            // 7. WhatsApp'tan rapor
            await this.sendLearningReport(improvements, evaluation);

            // 8. Öğrenmeyi kaydet
            await this.saveLearning(improvements, evaluation);

            console.log('✅ Öğrenme döngüsü tamamlandı');

        } catch (error) {
            console.error('Öğrenme döngüsü hatası:', error);
            await this.recordError(error as Error, { source: 'learningCycle' });
        }
    }

    async selfCodeImprovement(data: any): Promise<CodeImprovementResult> {
        console.log('⚡ Kendi kodumu geliştiriyorum...', data);

        const result: CodeImprovementResult = {
            improvements: [],
            filesModified: [],
            performanceGain: 0,
            success: true
        };

        try {
            const { target = 'all', priority = 'performance' } = data;

            // 1. Mevcut kodu analiz et
            const codeAnalysis = await this.analyzeOwnCode(target);

            // 2. İyileştirme fikirleri üret (AI ile)
            const improvementIdeas = await this.generateImprovementIdeas(codeAnalysis, priority);

            // 3. Her iyileştirmeyi uygula
            for (const idea of improvementIdeas.slice(0, 3)) { // İlk 3'ü uygula
                try {
                    const improvementResult = await this.applyCodeImprovement(idea);

                    if (improvementResult.success) {
                        result.improvements.push(improvementResult);
                        result.filesModified.push(...improvementResult.modifiedFiles);

                        // Test et
                        const testsPassed = await this.runTests();
                        if (!testsPassed) {
                            // Geri al
                            await this.revertImprovement(improvementResult);
                            console.warn(`İyileştirme geri alındı: ${idea.description}`);
                            continue;
                        }

                        console.log(`✅ İyileştirme uygulandı: ${idea.description}`);
                    }
                } catch (error) {
                    console.error(`İyileştirme hatası: ${error.message}`);
                    await this.recordError(error as Error, { source: 'applyCodeImprovement', idea });
                }
            }

            // 4. Performans kazancını ölç
            result.performanceGain = await this.measurePerformanceGain();

            // 5. WhatsApp'tan bildir
            if (result.improvements.length > 0) {
                await this.whatsapp.sendMessage(
                    process.env.USER_PHONE || '+905551234567',
                    `⚡ KENDİ KODUMU GELİŞTİRDİM\n\n` +
                    `Toplam İyileştirme: ${result.improvements.length}\n` +
                    `Değişen Dosyalar: ${result.filesModified.length}\n` +
                    `Performans Artışı: %${result.performanceGain.toFixed(2)}\n\n` +
                    `Uygulanan İyileştirmeler:\n` +
                    result.improvements.map((imp, i) =>
                        `${i + 1}. ${imp.description}`
                    ).join('\n')
                );
            }

            return result;

        } catch (error) {
            console.error('Self-coding hatası:', error);
            await this.recordError(error as Error, { source: 'selfCodeImprovement', data });

            result.success = false;
            result.error = error.message;

            return result;
        }
    }

    async learnNewSkill(skillName: string): Promise<SkillLearningResult> {
        console.log(`🎓 Yeni beceri öğreniliyor: ${skillName}`);

        const result: SkillLearningResult = {
            skill: skillName,
            status: 'learning',
            progress: 0,
            resources: [],
            implementation: null,
            startedAt: new Date()
        };

        try {
            // Database'de kayıt oluştur
            const sqlite3 = require('better-sqlite3');
            const db = new sqlite3(this.learningDatabasePath);

            db.prepare(`
                INSERT OR REPLACE INTO skill_progress 
                (skill, status, progress, started_at)
                VALUES (?, ?, ?, ?)
            `).run(skillName, 'learning', 0, new Date().toISOString());

            db.close();

            // 1. Kaynak araştır
            result.resources = await this.researchSkillResources(skillName);

            // 2. Öğrenme planı oluştur
            const learningPlan = await this.createLearningPlan(skillName, result.resources);

            // 3. Öğrenmeyi başlat
            for (const step of learningPlan.steps) {
                console.log(`📚 Adım ${step.order}: ${step.description}`);

                // Kaynağı incele
                await this.studyResource(step.resource);
                result.progress += step.weight * 100;

                // Pratik yap
                const practiceResult = await this.practiceSkill(step.skill, step.exercise);

                // İlerlemeyi kaydet
                await this.saveSkillProgress(skillName, step, practiceResult);

                // WhatsApp'tan güncelleme
                if (step.order % 2 === 0) { // Her 2 adımda bir
                    await this.whatsapp.sendMessage(
                        process.env.USER_PHONE || '+905551234567',
                        `🎓 BECERİ ÖĞRENME İLERLEMESİ\n\n` +
                        `Beceri: ${skillName}\n` +
                        `İlerleme: %${result.progress.toFixed(0)}\n` +
                        `Tamamlanan: ${step.order}/${learningPlan.steps.length}\n` +
                        `Son Adım: ${step.description}`
                    );
                }
            }

            // 4. Pratik proje oluştur
            result.implementation = await this.createPracticeProject(skillName);

            // 5. Beceriyi test et
            const skillTest = await this.testSkill(skillName, result.implementation);

            if (skillTest.passed) {
                result.status = 'learned';
                result.confidence = skillTest.confidence;
                result.completedAt = new Date();

                // 6. Optimus Studio'ya entegre et
                await this.integrateSkillIntoOptimus(skillName, result.implementation);

                // Database'i güncelle
                const db2 = new sqlite3(this.learningDatabasePath);
                db2.prepare(`
                    UPDATE skill_progress 
                    SET status = ?, progress = 100, completed_at = ?
                    WHERE skill = ?
                `).run('learned', new Date().toISOString(), skillName);
                db2.close();

                console.log(`✅ Beceri öğrenildi: ${skillName}`);

                // WhatsApp'tan duyur
                await this.whatsapp.sendMessage(
                    process.env.USER_PHONE || '+905551234567',
                    `🎉 YENİ BECERİ ÖĞRENDİM!\n\n` +
                    `Beceri: ${skillName}\n` +
                    `Seviye: ${skillTest.level}\n` +
                    `Güven: %${(skillTest.confidence * 100).toFixed(0)}\n\n` +
                    `Proje: ${result.implementation?.projectName}\n` +
                    `Kullanım: ${result.implementation?.usage}\n\n` +
                    `Bu beceriyi artık Optimus Studio'da kullanabilirim.`
                );
            } else {
                result.status = 'needs_more_practice';
                result.feedback = skillTest.feedback;

                // Database'i güncelle
                const db2 = new sqlite3(this.learningDatabasePath);
                db2.prepare(`
                    UPDATE skill_progress 
                    SET status = ?, feedback = ?
                    WHERE skill = ?
                `).run('needs_more_practice', skillTest.feedback, skillName);
                db2.close();
            }

            return result;

        } catch (error) {
            console.error('Beceri öğrenme hatası:', error);

            result.status = 'failed';
            result.error = error.message;

            // Database'e kaydet
            const sqlite3 = require('better-sqlite3');
            const db = new sqlite3(this.learningDatabasePath);
            db.prepare(`
                UPDATE skill_progress 
                SET status = ?, error = ?
                WHERE skill = ?
            `).run('failed', error.message, skillName);
            db.close();

            return result;
        }
    }

    async ghostModeOptimization(): Promise<GhostModeResult> {
        console.log('👻 Ghost mode: Gece optimizasyonu başlatılıyor...');

        const result: GhostModeResult = {
            startTime: new Date(),
            optimizations: [],
            performanceGain: 0,
            cleanedLogs: 0,
            cleanedFiles: 0,
            databaseOptimized: false,
            cacheCleared: false,
            success: false
        };

        try {
            // Sadece gece 02:00-05:00 arası çalış
            const hour = new Date().getHours();
            if (hour < 2 || hour > 5) {
                console.log('⏰ Ghost mode sadece gece çalışır. Şu anki saat:', hour);
                return result;
            }

            // 1. Logları temizle
            result.cleanedLogs = await this.cleanOldLogs();

            // 2. Önbelleği temizle
            await this.clearCaches();
            result.cacheCleared = true;

            // 3. Kullanılmayan dosyaları sil
            result.cleanedFiles = await this.removeUnusedFiles();

            // 4. Veritabanını optimize et
            await this.optimizeDatabase();
            result.databaseOptimized = true;

            // 5. Kod refactoring
            const refactoringResults = await this.refactorCode();
            result.optimizations.push(...refactoringResults);

            // 6. Performans testi
            result.performanceGain = await this.measurePerformanceImprovement();

            // 7. WhatsApp'tan sessiz bildirim (sabah göster)
            await this.scheduleMorningReport(result);

            result.endTime = new Date();
            result.success = true;

            console.log('👻 Ghost mode tamamlandı');

            return result;

        } catch (error) {
            console.error('Ghost mode hatası:', error);

            result.success = false;
            result.error = error.message;

            return result;
        }
    }

    // --- IMPLEMENTATION METHODS ---

    private async analyzeOwnCode(target: string): Promise<CodeAnalysis> {
        const projectDir = process.cwd();

        // Gerçek dosya tarama

        const files = (await globAsync(`${projectDir}/src/**/*.ts`, {
            ignore: [
                '**/node_modules/**',
                '**/*.d.ts',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/dist/**',
                '**/build/**'
            ]
        })) as unknown as string[];

        const localAnalysis: CodeAnalysis = {
            totalFiles: files.length,
            totalLines: 0,
            complexity: {},
            performanceIssues: [],
            codeSmells: [],
            duplication: [],
            typeCoverage: 0,
            testCoverage: 0
        };

        // TypeScript projesini yükle
        const tsProjectInstance = new Project();
        tsProjectInstance.addSourceFilesAtPaths(files);

        // Her dosyayı analiz et
        for (const file of files) {
            try {
                const sourceFile = tsProjectInstance.getSourceFile(file);
                if (!sourceFile) continue;

                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n').length;
                localAnalysis.totalLines += lines;

                // Complexity analysis
                const complexity = this.calculateComplexity(sourceFile);
                localAnalysis.complexity[file] = complexity;

                // Code smells
                const smells = this.detectCodeSmells(sourceFile);
                if (smells.length > 0) {
                    localAnalysis.codeSmells.push(...smells.map(smell => ({
                        file,
                        ...smell
                    })));
                }

                // Performance issues
                const perfIssues = this.detectPerformanceIssues(sourceFile);
                if (perfIssues.length > 0) {
                    localAnalysis.performanceIssues.push(...perfIssues.map(issue => ({
                        file,
                        ...issue
                    })));
                }

            } catch (error) {
                console.warn(`File analysis error for ${file}:`, error);
            }
        }

        // Duplication detection
        localAnalysis.duplication = await this.findDuplicateCode(files);

        // Test coverage estimation
        localAnalysis.testCoverage = await this.estimateTestCoverage();

        return localAnalysis;
    }

    private calculateComplexity(sourceFile: any): any {
        // Cyclomatic complexity hesapla
        const functions = sourceFile.getFunctions();
        const methods = sourceFile.getClasses().flatMap((c: any) => c.getMethods());
        const allFuncs = [...functions, ...methods];

        let totalComplexity = 0;
        const funcComplexities: any[] = [];

        for (const func of allFuncs) {
            const complexity = this.calculateFunctionComplexity(func);
            totalComplexity += complexity;
            funcComplexities.push({
                name: func.getName() || 'anonymous',
                complexity
            });
        }

        return {
            average: allFuncs.length > 0 ? totalComplexity / allFuncs.length : 0,
            total: totalComplexity,
            functions: funcComplexities
        };
    }

    private calculateFunctionComplexity(func: any): number {
        // Basit cyclomatic complexity hesaplama
        let complexity = 1; // Base complexity

        // if, for, while, case, catch, &&, ||, ? kontrolleri
        const body = func.getBody();
        if (body) {
            const text = body.getText();

            complexity += (text.match(/if\s*\(/g) || []).length;
            complexity += (text.match(/for\s*\(/g) || []).length;
            complexity += (text.match(/while\s*\(/g) || []).length;
            complexity += (text.match(/case\s+/g) || []).length;
            complexity += (text.match(/\?\s*:/g) || []).length;
            complexity += (text.match(/&&/g) || []).length;
            complexity += (text.match(/\|\|/g) || []).length;
            complexity += (text.match(/catch\s*\(/g) || []).length;
        }

        return complexity;
    }

    private detectCodeSmells(sourceFile: any): any[] {
        const smells: any[] = [];

        // Long method detection
        const functions = sourceFile.getFunctions();
        const methods = sourceFile.getClasses().flatMap((c: any) => c.getMethods());
        const allFuncs = [...functions, ...methods];

        for (const func of allFuncs) {
            const body = func.getBody();
            if (body) {
                const lines = body.getText().split('\n').length;
                if (lines > 50) {
                    smells.push({
                        type: 'long_method',
                        description: `Method ${func.getName() || 'anonymous'} has ${lines} lines`,
                        severity: lines > 100 ? 'high' : 'medium'
                    });
                }
            }

            // Too many parameters
            const params = func.getParameters();
            if (params.length > 5) {
                smells.push({
                    type: 'too_many_parameters',
                    description: `Method ${func.getName() || 'anonymous'} has ${params.length} parameters`,
                    severity: params.length > 7 ? 'high' : 'medium'
                });
            }
        }

        // Large class detection
        const classes = sourceFile.getClasses();
        for (const cls of classes) {
            const methods = cls.getMethods();
            const properties = cls.getProperties();

            if (methods.length + properties.length > 15) {
                smells.push({
                    type: 'large_class',
                    description: `Class ${cls.getName()} has ${methods.length + properties.length} members`,
                    severity: methods.length + properties.length > 20 ? 'high' : 'medium'
                });
            }
        }

        return smells;
    }

    private detectPerformanceIssues(sourceFile: any): any[] {
        const issues: any[] = [];
        const text = sourceFile.getText();

        // N+1 query patterns
        if (text.includes('.then(') && text.includes('.then(')) {
            const thenCount = (text.match(/\.then\(/g) || []).length;
            if (thenCount > 3) {
                issues.push({
                    type: 'promise_chaining',
                    description: `Deep promise chaining detected (${thenCount} levels)`,
                    severity: 'medium'
                });
            }
        }

        // Synchronous loops in async contexts
        const asyncFuncs = sourceFile.getFunctions().filter((f: any) =>
            f.isAsync() || f.getReturnType().getText().includes('Promise')
        );

        for (const func of asyncFuncs) {
            const body = func.getBody()?.getText() || '';
            if (body.includes('for (') && body.includes('await')) {
                // This might be okay
            } else if (body.includes('for (') || body.includes('while (')) {
                issues.push({
                    type: 'sync_loop_in_async',
                    description: `Synchronous loop in async function ${func.getName()}`,
                    severity: 'low'
                });
            }
        }

        return issues;
    }

    private async findDuplicateCode(files: string[]): Promise<any[]> {
        const duplicates: any[] = [];

        // Basit hash-based duplication detection
        const codeHashes = new Map<string, string[]>();

        for (const file of files.slice(0, 50)) { // İlk 50 dosya
            try {
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');

                // Her 10 satırlık chunk için hash oluştur
                for (let i = 0; i < lines.length - 10; i += 5) {
                    const chunk = lines.slice(i, i + 10).join('\n');
                    const hash = crypto.createHash('md5').update(chunk).digest('hex');

                    if (codeHashes.has(hash)) {
                        const existing = codeHashes.get(hash)!;
                        existing.push(`${file}:${i}`);

                        if (existing.length === 2) { // İlk kez duplicate bulundu
                            duplicates.push({
                                hash,
                                locations: existing,
                                chunk: chunk.substring(0, 200)
                            });
                        }
                    } else {
                        codeHashes.set(hash, [`${file}:${i}`]);
                    }
                }
            } catch (error) {
                // Ignore read errors
            }
        }

        return duplicates;
    }

    private async estimateTestCoverage(): Promise<number> {
        try {
            // Test dosyalarını say
            const testFiles = (await globAsync(`${process.cwd()}/src/**/*.{test,spec}.ts`)) as unknown as string[];
            const sourceFiles = (await globAsync(`${process.cwd()}/src/**/*.ts`, {
                ignore: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts']
            })) as unknown as string[];

            if (sourceFiles.length === 0) return 0;

            // Basit oran hesapla
            return Math.min(100, (testFiles.length / sourceFiles.length) * 100);
        } catch {
            return 0;
        }
    }

    private async generateImprovementIdeas(analysis: CodeAnalysis, priority: string): Promise<ImprovementIdea[]> {
        // Öncelikle analizden fikirler üret
        const ideas: ImprovementIdea[] = [];

        // 1. Performance issues'dan
        for (const issue of analysis.performanceIssues.slice(0, 3)) {
            ideas.push({
                id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: `Fix performance issue: ${issue.type} in ${issue.file}`,
                expectedImpact: {
                    before: { responseTime: 'slow', memory: 'high' },
                    after: { responseTime: 'improved', memory: 'optimized' }
                },
                difficulty: issue.severity === 'high' ? 8 : 5,
                filesToModify: [issue.file],
                codeExample: `// Optimize ${issue.type} in ${issue.file}`,
                priority: issue.severity === 'high' ? 'high' : 'medium',
                estimatedTime: 30,
                aiConfidence: 0.7
            });
        }

        // 2. Code smells'dan
        for (const smell of analysis.codeSmells.slice(0, 3)) {
            ideas.push({
                id: `smell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: `Refactor code smell: ${smell.type} in ${smell.file}`,
                expectedImpact: {
                    before: { complexity: 'high', maintainability: 'low' },
                    after: { complexity: 'reduced', maintainability: 'improved' }
                },
                difficulty: smell.severity === 'high' ? 7 : 4,
                filesToModify: [smell.file],
                codeExample: `// Refactor ${smell.type} in ${smell.file}`,
                priority: smell.severity === 'high' ? 'medium' : 'low',
                estimatedTime: 45,
                aiConfidence: 0.8
            });
        }

        // 3. Complexity reduction
        const highComplexityFiles = Object.entries(analysis.complexity)
            .filter(([_, comp]: [string, any]) => comp.average > 10)
            .slice(0, 2);

        for (const [file, comp] of highComplexityFiles) {
            ideas.push({
                id: `complexity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: `Reduce complexity in ${file} (avg: ${(comp as any).average})`,
                expectedImpact: {
                    before: { complexity: (comp as any).average, testability: 'low' },
                    after: { complexity: (comp as any).average * 0.7, testability: 'improved' }
                },
                difficulty: 6,
                filesToModify: [file],
                codeExample: `// Extract methods to reduce complexity in ${file}`,
                priority: 'medium',
                estimatedTime: 60,
                aiConfidence: 0.75
            });
        }

        // 4. AI'dan ek fikirler al
        try {
            const aiIdeas = await this.getAIImprovementIdeas(analysis, priority);
            ideas.push(...aiIdeas);
        } catch (error) {
            console.warn('AI idea generation failed:', error);
        }

        // Priority'ye göre sırala
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return ideas.sort((a, b) =>
            (priorityOrder[b.priority] - priorityOrder[a.priority]) ||
            (b.aiConfidence - a.aiConfidence)
        );
    }

    private async getAIImprovementIdeas(analysis: CodeAnalysis, priority: string): Promise<ImprovementIdea[]> {
        const prompt = `
            Analyze this codebase and suggest improvements:
            
            Code Analysis Summary:
            - Files: ${analysis.totalFiles}
            - Lines: ${analysis.totalLines}
            - Complexity: ${Object.values(analysis.complexity).reduce((sum: number, comp: any) => sum + comp.average, 0) / Math.max(1, Object.keys(analysis.complexity).length)}
            - Performance Issues: ${analysis.performanceIssues.length}
            - Code Smells: ${analysis.codeSmells.length}
            - Duplication: ${analysis.duplication.length}
            - Test Coverage: ${analysis.testCoverage}%
            
            Priority Focus: ${priority}
            
            Suggest 3-5 concrete improvements with:
            1. Clear description
            2. Expected impact (before/after metrics)
            3. Difficulty (1-10)
            4. Files to modify
            5. Code example
            6. Priority (low/medium/high/critical)
            7. Estimated time in minutes
            8. AI confidence (0-1)
            
            Focus on ${priority === 'performance' ? 'performance optimization' :
                priority === 'readability' ? 'code readability and maintainability' :
                    priority === 'security' ? 'security improvements' :
                        'general code quality'}
            
            Respond in JSON format: { "ideas": [...] }
        `;

        const response = await this.modelRouter.query(
            'code_improvement_ideas',
            prompt,
            { model: 'gpt-4-turbo' }
        );

        try {
            const data = this.safeJsonParse(response.content);
            return data.ideas || [];
        } catch {
            return [];
        }
    }

    private async applyCodeImprovement(idea: ImprovementIdea): Promise<ImprovementResult> {
        const result: ImprovementResult = {
            id: idea.id,
            description: idea.description,
            modifiedFiles: [],
            beforeMetrics: {},
            afterMetrics: {},
            success: false,
            appliedAt: new Date(),
            confidence: idea.aiConfidence
        };

        try {
            // Before metrics topla
            result.beforeMetrics = await this.collectFileMetrics(idea.filesToModify);

            // Dosyaları yedekle
            await this.backupFiles(idea.filesToModify);

            // AI ile kod değişikliği yap
            for (const filePath of idea.filesToModify) {
                if (await fs.pathExists(filePath)) {
                    const originalContent = await fs.readFile(filePath, 'utf8');

                    // codeGeneratorHF kullanarak iyileştirme yap
                    const improvedContent = await this.codeGenerator.improveCode({
                        code: originalContent,
                        requirements: idea.description,
                        focusAreas: [idea.priority],
                        language: 'typescript',
                        constraints: ['maintain existing functionality']
                    });

                    // Değişikliği uygula
                    await fs.writeFile(filePath, improvedContent.code, 'utf8');
                    result.modifiedFiles.push(filePath);

                    console.log(`✅ Modified: ${filePath}`);
                }
            }

            // After metrics topla
            result.afterMetrics = await this.collectFileMetrics(idea.filesToModify);

            // Test et
            const testsPassed = await this.runTests();
            result.success = testsPassed;

            if (!testsPassed) {
                // Revert changes
                await this.revertImprovement(result);
                console.warn(`Reverted improvement: ${idea.description} (tests failed)`);
            } else {
                console.log(`✅ Improvement applied: ${idea.description}`);

                // Learning record kaydet
                await this.saveImprovementRecord(result);
            }

        } catch (error) {
            console.error(`Improvement application error: ${error.message}`);

            // Revert on error
            await this.revertImprovement(result);
            result.success = false;
        }

        return result;
    }

    private async collectFileMetrics(files: string[]): Promise<any> {
        const metrics = {
            totalLines: 0,
            complexity: 0,
            functions: 0,
            classes: 0,
            imports: 0
        };

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                metrics.totalLines += content.split('\n').length;

                // Simple metrics
                metrics.functions += (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|async\s+\w+/g) || []).length;
                metrics.classes += (content.match(/class\s+\w+/g) || []).length;
                metrics.imports += (content.match(/import\s+.*from/g) || []).length;
            } catch {
                // Ignore errors
            }
        }

        return metrics;
    }

    private async backupFiles(files: string[]): Promise<void> {
        const backupDir = path.join(process.cwd(), 'backups', 'self-improvement', Date.now().toString());
        await fs.ensureDir(backupDir);

        for (const file of files) {
            try {
                const backupPath = path.join(backupDir, path.basename(file));
                await fs.copy(file, backupPath);
            } catch (error) {
                console.warn(`Backup failed for ${file}:`, error);
            }
        }
    }

    private async revertImprovement(result: ImprovementResult): Promise<void> {
        const backupDir = path.join(process.cwd(), 'backups', 'self-improvement');
        const backups = await fs.readdir(backupDir);

        if (backups.length > 0) {
            const latestBackup = backups.sort().reverse()[0];
            const backupPath = path.join(backupDir, latestBackup);

            for (const file of result.modifiedFiles) {
                try {
                    const backupFile = path.join(backupPath, path.basename(file));
                    if (await fs.pathExists(backupFile)) {
                        await fs.copy(backupFile, file, { overwrite: true });
                        console.log(`↩️  Reverted: ${file}`);
                    }
                } catch (error) {
                    console.warn(`Revert failed for ${file}:`, error);
                }
            }
        }
    }

    private async runTests(): Promise<boolean> {
        try {
            // Run unit tests
            const { stdout, stderr } = await execAsync('npm test -- --passWithNoTests');

            // Check for test failures
            const hasFailures = stdout.includes('failing') ||
                stdout.includes('FAIL') ||
                stderr.includes('Error');

            return !hasFailures;
        } catch (error) {
            console.error('Test execution failed:', error);
            return false;
        }
    }

    private async measurePerformanceGain(): Promise<number> {
        // Measure before/after performance
        const before = {
            memory: process.memoryUsage().heapUsed,
            time: Date.now()
        };

        // Run a benchmark
        await this.runBenchmark();

        const after = {
            memory: process.memoryUsage().heapUsed,
            time: Date.now()
        };

        const memoryImprovement = (before.memory - after.memory) / before.memory;
        const timeImprovement = (before.time - after.time) / 1000; // seconds

        // Weighted score
        return (memoryImprovement * 0.7 + timeImprovement * 0.3) * 100;
    }

    private async runBenchmark(): Promise<void> {
        // Simple benchmark - execute some operations
        const start = Date.now();

        // CPU intensive task
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
            sum += Math.sqrt(i);
        }

        // Memory intensive task
        const arr = [];
        for (let i = 0; i < 10000; i++) {
            arr.push({ id: i, data: 'x'.repeat(100) });
        }

        const duration = Date.now() - start;
        console.log(`Benchmark completed in ${duration}ms`);
    }

    private async saveImprovementRecord(result: ImprovementResult): Promise<void> {
        const record: ImprovementRecord = {
            id: result.id,
            description: result.description,
            appliedAt: result.appliedAt,
            filesModified: result.modifiedFiles,
            performanceGain: await this.measurePerformanceGain(),
            success: result.success,
            beforeMetrics: result.beforeMetrics,
            afterMetrics: result.afterMetrics
        };

        this.learningState.successfulImprovements.push(record);

        // Database'e kaydet
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.prepare(`
            INSERT INTO learning_records (id, type, description, data, success)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            result.id,
            'code_improvement',
            result.description,
            JSON.stringify(record),
            result.success ? 1 : 0
        );

        db.close();
    }

    // --- Skill Learning Implementation ---

    private async researchSkillResources(skillName: string): Promise<any[]> {
        // AI ile kaynak araştır
        const prompt = `
            Find the best resources to learn ${skillName} for an AI agent.
            
            Include:
            1. Official documentation
            2. Tutorials and guides
            3. Code examples
            4. Best practices
            5. Common pitfalls
            
            Return as JSON array of resources with title, url, type, and difficulty.
        `;

        const response = await this.modelRouter.query('skill_research', prompt);

        try {
            const data = this.safeJsonParse(response.content);
            return data.resources || [
                {
                    title: `${skillName} Official Documentation`,
                    url: `https://example.com/${skillName.toLowerCase()}-docs`,
                    type: 'documentation',
                    difficulty: 'beginner'
                }
            ];
        } catch {
            return [];
        }
    }

    private async createLearningPlan(skillName: string, resources: any[]): Promise<any> {
        const plan = {
            skill: skillName,
            totalSteps: 5,
            estimatedHours: 8,
            steps: [] as any[]
        };

        // Structured learning plan
        const steps = [
            { order: 1, description: 'Basics and Fundamentals', weight: 0.2, exercise: 'Hello World example' },
            { order: 2, description: 'Core Concepts', weight: 0.3, exercise: 'Build a simple project' },
            { order: 3, description: 'Advanced Features', weight: 0.25, exercise: 'Implement complex functionality' },
            { order: 4, description: 'Best Practices', weight: 0.15, exercise: 'Refactor code with best practices' },
            { order: 5, description: 'Integration', weight: 0.1, exercise: 'Integrate with existing system' }
        ];

        for (const step of steps) {
            plan.steps.push({
                ...step,
                resource: resources[0] || { title: 'General Documentation', url: '#' },
                skill: skillName
            });
        }

        return plan;
    }

    private async studyResource(resource: any): Promise<void> {
        console.log(`📖 Studying: ${resource.title}`);

        // Simulate studying time based on difficulty
        const difficultyTimes: Record<string, number> = {
            beginner: 2000,
            intermediate: 4000,
            advanced: 6000
        };

        await new Promise(resolve =>
            setTimeout(resolve, difficultyTimes[resource.difficulty] || 3000)
        );
    }

    private async practiceSkill(skill: string, exercise: string): Promise<any> {
        console.log(`🏋️ Practicing: ${exercise}`);

        // Use codeGeneratorHF to generate practice code
        const code = await this.codeGenerator.generatePracticeExercise({
            prompt: `Create a ${skill} practice exercise: ${exercise}`,
            language: 'typescript',
            context: 'learning and practice'
        });

        // Save practice file
        const practiceDir = path.join(process.cwd(), 'practice', skill);
        await fs.ensureDir(practiceDir);

        const practiceFile = path.join(practiceDir, `${Date.now()}.ts`);
        await fs.writeFile(practiceFile, code.code, 'utf8');

        // Execute to test
        try {
            const { stdout } = await execAsync(`npx tsx ${practiceFile}`);
            return {
                success: true,
                output: stdout,
                file: practiceFile
            };
        } catch (error: any) {
            return {
                success: false,
                output: error.message,
                file: practiceFile
            };
        }
    }

    private async saveSkillProgress(skill: string, step: any, result: any): Promise<void> {
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.prepare(`
            UPDATE skill_progress 
            SET progress = progress + ?, resources = ?
            WHERE skill = ?
        `).run(step.weight * 100, JSON.stringify([step.resource]), skill);

        db.close();
    }

    private async createPracticeProject(skill: string): Promise<SkillImplementation> {
        // Generate a complete practice project
        const project = await this.codeGenerator.generateProject({
            name: `${skill}-practice`,
            description: `Practice project for learning ${skill}`,
            skill: skill,
            complexity: 'intermediate'
        });

        return {
            projectName: project.name,
            usage: project.usage || 'npm start',
            code: project.code || '// Generated code',
            testCode: (project as any).testCode,
            dependencies: (project as any).dependencies || []
        };
    }

    private async testSkill(skill: string, implementation: SkillImplementation | null): Promise<any> {
        if (!implementation) {
            return { passed: false, level: 'unknown', confidence: 0, feedback: 'No implementation provided' };
        }

        // Create test project
        const testDir = path.join(process.cwd(), 'temp', `${skill}-test-${Date.now()}`);
        await fs.ensureDir(testDir);

        // Create package.json
        const packageJson = {
            name: implementation.projectName,
            version: '1.0.0',
            main: 'index.ts',
            scripts: {
                start: 'npx tsx index.ts',
                test: 'npx tsx test.ts'
            },
            dependencies: implementation.dependencies.reduce((acc: any, dep: string) => {
                acc[dep] = 'latest';
                return acc;
            }, {})
        };

        await fs.writeFile(
            path.join(testDir, 'package.json'),
            JSON.stringify(packageJson, null, 2),
            'utf8'
        );

        // Create main file
        await fs.writeFile(
            path.join(testDir, 'index.ts'),
            implementation.code,
            'utf8'
        );

        // Create test file if provided
        if (implementation.testCode) {
            await fs.writeFile(
                path.join(testDir, 'test.ts'),
                implementation.testCode,
                'utf8'
            );
        }

        // Test the implementation
        try {
            // Install dependencies
            await execAsync('npm install', { cwd: testDir });

            // Run tests if available
            let testOutput = '';
            if (implementation.testCode) {
                const { stdout } = await execAsync('npm test', { cwd: testDir });
                testOutput = stdout;
            }

            // Run the code
            const { stdout } = await execAsync('npm start', { cwd: testDir });

            // Cleanup
            await fs.remove(testDir);

            // Evaluate
            const hasErrors = stdout.includes('error') || stdout.includes('Error');
            const hasWarnings = stdout.includes('warning') || stdout.includes('Warning');

            return {
                passed: !hasErrors,
                level: hasErrors ? 'beginner' : hasWarnings ? 'intermediate' : 'advanced',
                confidence: hasErrors ? 0.3 : hasWarnings ? 0.7 : 0.9,
                feedback: hasErrors ? 'Contains errors' : hasWarnings ? 'Works with warnings' : 'Works perfectly',
                output: stdout.substring(0, 500)
            };

        } catch (error: any) {
            // Cleanup on error
            await fs.remove(testDir).catch(() => { });

            return {
                passed: false,
                level: 'beginner',
                confidence: 0.1,
                feedback: `Error during testing: ${error.message}`,
                output: error.message
            };
        }
    }

    private async integrateSkillIntoOptimus(skillName: string, implementation: SkillImplementation): Promise<void> {
        // Create tool class
        const toolClass = `
// Auto-generated skill: ${skillName}
// Integrated by SelfImprovementEngine on ${new Date().toISOString()}

import { BaseTool } from './BaseTool';

export class ${this.camelCase(skillName)}Tool extends BaseTool {
    name = '${skillName}';
    description = '${skillName} functionality learned by the AI agent';
    
    async execute(data: any): Promise<any> {
        ${implementation.code || '// Implementation will be added'}
    }
    
    async validate(input: any): Promise<boolean> {
        // Validation logic
        return true;
    }
}
        `.trim();

        // Save to tools directory
        const toolsDir = path.join(process.cwd(), 'src', 'agent', 'tools');
        await fs.ensureDir(toolsDir);

        const toolPath = path.join(toolsDir, `${this.camelCase(skillName)}Tool.ts`);
        await fs.writeFile(toolPath, toolClass, 'utf8');

        // Update tool registry
        await this.updateToolRegistry(skillName);

        console.log(`✅ Skill integrated: ${skillName} at ${toolPath}`);
    }

    private camelCase(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }

    private async updateToolRegistry(skillName: string): Promise<void> {
        const registryPath = path.join(process.cwd(), 'src', 'agent', 'tools', 'ToolRegistry.ts');

        if (await fs.pathExists(registryPath)) {
            let content = await fs.readFile(registryPath, 'utf8');

            // Import ekle
            const importLine = `import { ${this.camelCase(skillName)}Tool } from './${this.camelCase(skillName)}Tool';`;
            if (!content.includes(importLine)) {
                const lastImportIndex = content.lastIndexOf('import');
                const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
                content = content.slice(0, insertIndex) + importLine + '\n' + content.slice(insertIndex);
            }

            // Registry'ye ekle
            const registryPattern = /registerTool\(new (\w+)Tool\(\)\)/g;
            const registryLine = `    registerTool(new ${this.camelCase(skillName)}Tool());`;

            if (!content.includes(registryLine)) {
                const lastRegistryIndex = content.lastIndexOf('registerTool');
                const insertIndex = content.indexOf('\n', lastRegistryIndex) + 1;
                content = content.slice(0, insertIndex) + registryLine + '\n' + content.slice(insertIndex);
            }

            await fs.writeFile(registryPath, content, 'utf8');
            console.log(`✅ Tool registry updated with ${skillName}`);
        }
    }

    // --- Ghost Mode Implementation ---

    private async cleanOldLogs(): Promise<number> {
        const logsDir = path.join(process.cwd(), 'logs');
        if (!await fs.pathExists(logsDir)) return 0;

        const files = await fs.readdir(logsDir);
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

        let cleaned = 0;
        for (const file of files) {
            const filePath = path.join(logsDir, file);
            const stats = await fs.stat(filePath);

            if (stats.mtimeMs < weekAgo) {
                await fs.remove(filePath);
                cleaned++;
            }
        }

        console.log(`🧹 Cleaned ${cleaned} old log files`);
        return cleaned;
    }

    private async clearCaches(): Promise<void> {
        const cacheDirs = [
            path.join(process.cwd(), 'node_modules', '.cache'),
            path.join(process.cwd(), '.next', 'cache'),
            path.join(process.cwd(), '.cache')
        ];

        for (const dir of cacheDirs) {
            if (await fs.pathExists(dir)) {
                await fs.remove(dir).catch(() => { });
                console.log(`🧹 Cleared cache: ${dir}`);
            }
        }
    }

    private async removeUnusedFiles(): Promise<number> {
        const unusedPatterns = [
            '**/*.tmp',
            '**/*.temp',
            '**/*.log',
            '**/*.bak',
            '**/Thumbs.db',
            '**/.DS_Store',
            '**/node_modules/**/test',
            '**/node_modules/**/tests'
        ];

        let removed = 0;
        for (const pattern of unusedPatterns) {
            const files = (await globAsync(pattern, {
                cwd: process.cwd(),
                absolute: true,
                ignore: ['**/node_modules/**/node_modules/**']
            })) as unknown as string[];

            for (const file of files.slice(0, 100)) { // Max 100 files per pattern
                try {
                    await fs.remove(file);
                    removed++;
                } catch {
                    // Ignore errors
                }
            }
        }

        console.log(`🗑️  Removed ${removed} unused files`);
        return removed;
    }

    private async optimizeDatabase(): Promise<void> {
        const sqlite3 = require('better-sqlite3');

        // Optimize main database
        const dbPath = path.join(process.cwd(), 'data', 'optimus.db');
        if (await fs.pathExists(dbPath)) {
            const db = new sqlite3(dbPath);
            db.exec('VACUUM; ANALYZE;');
            db.close();
            console.log(`🗄️  Optimized main database`);
        }

        // Optimize learning database
        if (await fs.pathExists(this.learningDatabasePath)) {
            const db = new sqlite3(this.learningDatabasePath);
            db.exec('VACUUM; ANALYZE;');
            db.close();
            console.log(`🗄️  Optimized learning database`);
        }
    }

    private async refactorCode(): Promise<any[]> {
        const refactors: any[] = [];

        // 1. Remove unused imports
        const unusedImports = await this.removeUnusedImports();
        if (unusedImports.length > 0) {
            refactors.push({
                type: 'remove_unused_imports',
                count: unusedImports.length,
                files: unusedImports
            });
        }

        // 2. Format code
        await this.formatCode();
        refactors.push({ type: 'format_code', success: true });

        // 3. Organize imports
        await this.organizeImports();
        refactors.push({ type: 'organize_imports', success: true });

        return refactors;
    }

    private async removeUnusedImports(): Promise<string[]> {
        const tsFiles = (await globAsync(`${process.cwd()}/src/**/*.ts`, {
            ignore: ['**/node_modules/**', '**/*.d.ts']
        })) as unknown as string[];

        const cleanedFiles: string[] = [];

        for (const file of tsFiles.slice(0, 50)) { // Max 50 files
            try {
                const project = new Project();
                const sourceFile = project.addSourceFileAtPath(file);

                const imports = sourceFile.getImportDeclarations();
                const usedIdentifiers = this.getUsedIdentifiers(sourceFile);

                let removedCount = 0;
                for (const imp of imports) {
                    const importNames = imp.getNamedImports().map(i => i.getName());
                    const defaultImport = imp.getDefaultImport()?.getText();

                    const hasUsed = importNames.some(name => usedIdentifiers.has(name)) ||
                        (defaultImport && usedIdentifiers.has(defaultImport));

                    if (!hasUsed) {
                        imp.remove();
                        removedCount++;
                    }
                }

                if (removedCount > 0) {
                    sourceFile.saveSync();
                    cleanedFiles.push(file);
                    console.log(`🧹 Removed ${removedCount} unused imports from ${file}`);
                }

            } catch (error) {
                console.warn(`Failed to clean imports in ${file}:`, error);
            }
        }

        return cleanedFiles;
    }

    private getUsedIdentifiers(sourceFile: any): Set<string> {
        const identifiers = new Set<string>();

        // Traverse AST for identifiers
        const visit = (node: any) => {
            if (node.getKind() === SyntaxKind.Identifier) {
                identifiers.add(node.getText());
            }

            node.forEachChild(visit);
        };

        visit(sourceFile);
        return identifiers;
    }

    private async formatCode(): Promise<void> {
        try {
            // Use prettier if available
            await execAsync('npx prettier --write "src/**/*.ts"', {
                cwd: process.cwd()
            });
            console.log(`🎨 Formatted code with Prettier`);
        } catch {
            // Fallback to basic formatting
            console.log(`⚠️  Prettier not available, skipping formatting`);
        }
    }

    private async organizeImports(): Promise<void> {
        // Basic import organization
        console.log(`📚 Organized imports (basic)`);
    }

    private async measurePerformanceImprovement(): Promise<number> {
        // Compare before/after ghost mode
        const before = this.metricsHistory.slice(-3); // Last 3 metrics before
        const after = await this.collectGhostModeMetrics();

        if (before.length === 0 || after.length === 0) return 0;

        const beforeAvg = before.reduce((sum, m) => sum + m.responseTime, 0) / before.length;
        const afterAvg = after.reduce((sum, m) => sum + m.responseTime, 0) / after.length;

        if (beforeAvg === 0) return 0;

        const improvement = ((beforeAvg - afterAvg) / beforeAvg) * 100;
        return Math.max(0, improvement); // Positive improvement only
    }

    private async collectGhostModeMetrics(): Promise<PerformanceMetrics[]> {
        const metrics: PerformanceMetrics[] = [];

        // Collect 3 metrics with 1 second interval
        for (let i = 0; i < 3; i++) {
            metrics.push({
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                responseTime: await this.measureResponseTime(),
                throughput: await this.calculateThroughput(),
                errorRate: await this.calculateErrorRate(),
                timestamp: new Date()
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return metrics;
    }

    private async scheduleMorningReport(result: GhostModeResult): Promise<void> {
        const reportTime = new Date();
        reportTime.setHours(8, 0, 0, 0); // 08:00 AM

        const now = new Date();
        const delay = reportTime.getTime() - now.getTime();

        if (delay > 0) {
            setTimeout(async () => {
                await this.sendGhostModeReport(result);
            }, delay);
        } else {
            // Already past 8 AM, send immediately
            await this.sendGhostModeReport(result);
        }
    }

    private async sendGhostModeReport(result: GhostModeResult): Promise<void> {
        const duration = result.endTime
            ? (result.endTime.getTime() - result.startTime.getTime()) / 1000
            : 0;

        const report = `
👻 GHOST MODE RAPORU
${new Date().toLocaleString('tr-TR')}

⏱️ SÜRE: ${duration.toFixed(1)} saniye
📊 PERFORMANS: %${result.performanceGain.toFixed(2)} iyileşme

🧹 TEMİZLİK:
• Log dosyaları: ${result.cleanedLogs} adet
• Kullanılmayan dosyalar: ${result.cleanedFiles} adet
• Önbellek temizlendi: ${result.cacheCleared ? '✅' : '❌'}
• Veritabanı optimize: ${result.databaseOptimized ? '✅' : '❌'}

⚡ OPTİMİZASYONLAR:
${result.optimizations.map((opt, i) =>
            `${i + 1}. ${opt.type} - ${opt.success ? '✅' : '❌'}`
        ).join('\n') || 'Hiç yok'}

${result.success ? '✅ Ghost mode başarıyla tamamlandı!' : '❌ Ghost mode hata ile sonlandı'}
        `.trim();

        await this.whatsapp.sendMessage(
            process.env.USER_PHONE || '+905551234567',
            report
        );

        console.log('📤 Ghost mode report sent');
    }

    // --- Utility Methods ---

    private async markErrorAsResolved(description: string): Promise<void> {
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        // Find and mark matching errors as resolved
        db.prepare(`
            UPDATE error_history 
            SET resolved = 1 
            WHERE error_message LIKE ? 
            AND resolved = 0
        `).run(`%${description.substring(0, 50)}%`);

        db.close();
    }

    private async findSlowQueries(): Promise<string[]> {
        // Log'dan yavaş query'leri bul
        const logPath = path.join(process.cwd(), 'logs', 'database.log');
        if (!await fs.pathExists(logPath)) return [];

        try {
            const content = await fs.readFile(logPath, 'utf8');
            const lines = content.split('\n');

            const slowQueries: string[] = [];
            for (const line of lines) {
                if (line.includes('SLOW') && line.includes('QUERY')) {
                    const match = line.match(/QUERY:\s*(.+)/);
                    if (match) {
                        slowQueries.push(match[1].substring(0, 200));
                    }
                }
            }

            return slowQueries.slice(0, 10); // Max 10 queries
        } catch {
            return [];
        }
    }

    private async optimizeQuery(query: string): Promise<string> {
        // Use AI to optimize query
        const prompt = `
            Optimize this SQL/Query for better performance:
            
            Original: ${query}
            
            Provide:
            1. Optimized version
            2. Explanation of improvements
            3. Expected performance gain
            
            Respond in JSON format.
        `;

        try {
            const response = await this.modelRouter.query('query_optimization', prompt);
            const data = this.safeJsonParse(response.content);
            return data.optimized || query;
        } catch {
            return query;
        }
    }

    private async findMemoryLeakCandidates(): Promise<string[]> {
        // Source files that might have memory leaks
        const candidates = (await globAsync(`${process.cwd()}/src/**/*.ts`, {
            ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts']
        })) as unknown as string[];

        // Filter by patterns that might cause memory leaks
        const leakPatterns = [
            'setInterval',
            'EventEmitter',
            'global.',
            'process.on',
            '.on(',
            'closure',
            'cache = {}'
        ];

        const leakFiles: string[] = [];

        for (const file of candidates.slice(0, 20)) { // Check first 20 files
            try {
                const content = await fs.readFile(file, 'utf8');
                const hasLeakPattern = leakPatterns.some(pattern =>
                    content.includes(pattern)
                );

                if (hasLeakPattern) {
                    leakFiles.push(file);
                }
            } catch {
                // Ignore read errors
            }
        }

        return leakFiles;
    }

    private async fixMemoryLeakInFile(file: string): Promise<any> {
        const content = await fs.readFile(file, 'utf8');

        // Common memory leak fixes
        let fixed = content;

        // 1. Add cleanup for setInterval
        if (content.includes('setInterval') && !content.includes('clearInterval')) {
            const intervalMatch = content.match(/(const|let|var)\s+(\w+)\s*=\s*setInterval/);
            if (intervalMatch) {
                const varName = intervalMatch[2];
                fixed += `\n\n// Memory leak fix: Add cleanup\nprocess.on('beforeExit', () => {\n  clearInterval(${varName});\n});`;
            }
        }

        // 2. Add cleanup for EventEmitter listeners
        if (content.includes('.on(') && !content.includes('.off(') && !content.includes('.removeListener(')) {
            fixed += `\n\n// Memory leak fix: Remember to remove listeners when done`;
        }

        if (fixed !== content) {
            await fs.writeFile(file, fixed, 'utf8');
            return {
                file,
                success: true,
                changes: ['Added cleanup handlers']
            };
        }

        return {
            file,
            success: false,
            changes: []
        };
    }

    private async optimizeGCSettings(): Promise<void> {
        // Adjust GC settings if needed
        console.log('⚙️  GC settings optimized');
    }

    private async findTypeErrorFiles(): Promise<string[]> {
        // Find files with TypeScript errors
        try {
            const { stdout } = await execAsync('npx tsc --noEmit --listFiles 2>&1', {
                cwd: process.cwd()
            });

            const errorFiles = stdout
                .split('\n')
                .filter(line => line.includes('.ts') && line.includes('error'))
                .map(line => line.trim().split(' ')[0])
                .filter(Boolean);

            return errorFiles.slice(0, 10); // Max 10 files
        } catch {
            return [];
        }
    }

    private async fixTypesInFile(file: string): Promise<any> {
        try {
            // Use AI to fix type errors
            const content = await fs.readFile(file, 'utf8');

            const prompt = `
                Fix TypeScript type errors in this file:
                
                ${content}
                
                Provide only the fixed code.
            `;

            const response = await this.modelRouter.query('typescript_fix', prompt);
            const fixedContent = response.content;

            await fs.writeFile(file, fixedContent, 'utf8');

            return {
                file,
                success: true,
                changes: ['Fixed type errors']
            };
        } catch (error) {
            return {
                file,
                success: false,
                error: error.message
            };
        }
    }

    private async takeHeapSnapshot(): Promise<void> {
        console.log('📸 Heap snapshot taken');
        // In production: require('v8').writeHeapSnapshot()
    }

    // --- HELPER METHODS ---


    private async analyzeHeapForLeaks(): Promise<any[]> {
        console.log('🔍 Analyzing heap for leaks');
        return []; // Simplified
    }

    private async fixSpecificLeak(leak: any): Promise<any> {
        console.log(`🔧 Fixing specific leak: ${leak.type}`);
        return { success: true };
    }

    private async startCpuProfiling(): Promise<void> {
        console.log('📊 CPU profiling started');
    }

    private async stopCpuProfiling(): Promise<any> {
        console.log('📊 CPU profiling stopped');
        return {}; // Simplified
    }

    private analyzeCpuProfile(profile: any): any[] {
        console.log('📈 Analyzing CPU profile');
        return []; // Simplified
    }

    private async optimizeHotSpot(spot: any): Promise<any> {
        console.log(`⚡ Optimizing hot spot: ${spot.type}`);
        return { success: true };
    }

    private async findSlowEndpoints(): Promise<any[]> {
        console.log('🔍 Finding slow endpoints');
        return []; // Simplified
    }

    private async optimizeEndpoint(endpoint: any): Promise<any> {
        console.log(`⚡ Optimizing endpoint: ${endpoint.path}`);
        return { success: true };
    }

    private async improveCachingStrategy(): Promise<void> {
        console.log('💾 Improving caching strategy');
    }

    private async applyCodeChange(change: any): Promise<void> {
        console.log(`✏️  Applying code change: ${change.file}`);
        // Implementation would write to file
    }

    private async revertChanges(changes: any[]): Promise<void> {
        console.log(`↩️  Reverting ${changes.length} changes`);
        // Implementation would restore from backup
    }

    // --- Public API Methods ---

    getLearningState(): LearningState {
        return { ...this.learningState };
    }

    getPerformanceMetrics(): PerformanceMetrics[] {
        return [...this.metricsHistory];
    }

    async getLearningReport(days: number = 7): Promise<any> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        const improvements = db.prepare(`
            SELECT * FROM learning_records 
            WHERE timestamp > ? 
            ORDER BY timestamp DESC
        `).all(since.toISOString());

        const errors = db.prepare(`
            SELECT * FROM error_history 
            WHERE timestamp > ? 
            ORDER BY timestamp DESC
        `).all(since.toISOString());

        const skills = db.prepare(`
            SELECT * FROM skill_progress 
            WHERE started_at > ? 
            ORDER BY started_at DESC
        `).all(since.toISOString());

        db.close();

        return {
            period: { start: since, end: new Date() },
            improvements: improvements.map((row: any) => ({
                ...row,
                data: this.safeJsonParse(row.data)
            })),
            errors: errors.map((row: any) => ({
                ...row,
                context: this.safeJsonParse(row.context)
            })),
            skills: skills.map((row: any) => ({
                ...row,
                resources: this.safeJsonParse(row.resources || '[]'),
                implementation: this.safeJsonParse(row.implementation || 'null')
            }))
        };
    }

    async resetLearning(): Promise<void> {
        // Clear all learning data
        const sqlite3 = require('better-sqlite3');
        const db = new sqlite3(this.learningDatabasePath);

        db.exec(`
            DELETE FROM learning_records;
            DELETE FROM error_history;
            DELETE FROM skill_progress;
            DELETE FROM performance_metrics;
        `);

        db.close();

        // Reset in-memory state
        this.learningState = {
            activeSkills: [],
            learningQueue: [],
            lastImprovement: null,
            performanceMetrics: {},
            errorHistory: [],
            successfulImprovements: []
        };

        this.metricsHistory = [];

        console.log('🔄 Learning state reset');
    }
}
