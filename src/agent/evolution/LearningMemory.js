"use strict";
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
exports.LearningMemory = void 0;
// src/agent/evolution/LearningMemory.ts
const Database_1 = require("../../app/core/Database");
const crypto = __importStar(require("crypto"));
class LearningMemory {
    constructor() {
        this.memoryCache = new Map();
        this.db = new Database_1.Database('sqlite');
        // Auto-init for production, but allow manual await for tests
        this.init().catch(console.error);
    }
    async init() {
        if (this.db.isConnected)
            return;
        await this.db.connect();
    }
    async recordError(error, context) {
        const errorHash = this.hashError(error);
        // Check cache first
        if (this.memoryCache.has(errorHash)) {
            const existing = this.memoryCache.get(errorHash);
            existing.count++;
            existing.lastOccurred = new Date();
            await this.db.saveLearningError(existing);
            return;
        }
        // Check database if not in cache
        const similar = await this.db.getSimilarErrors({
            errorType: error.name,
            messageSnippet: error.message.substring(0, 50)
        });
        const exactMatch = similar.find(r => r.errorMessage === error.message);
        if (exactMatch) {
            exactMatch.count++;
            exactMatch.lastOccurred = new Date();
            this.memoryCache.set(errorHash, exactMatch);
            await this.db.saveLearningError(exactMatch);
            return;
        }
        // Create new record
        const learningRecord = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            errorType: error.name || error.constructor.name,
            errorMessage: error.message,
            stackTrace: error.stack,
            context: context,
            firstOccurred: new Date(),
            lastOccurred: new Date(),
            count: 1,
            fixed: false,
            fixAttempts: [],
            learnedSolution: null
        };
        this.memoryCache.set(errorHash, learningRecord);
        await this.db.saveLearningError(learningRecord);
        console.log(`🧠 Learning Memory: New error recorded - ${error.message}`);
    }
    async getSimilarErrors(currentError) {
        return this.db.getSimilarErrors({
            errorType: currentError.name || currentError.constructor.name,
            messageSnippet: currentError.message.substring(0, 50)
        });
    }
    async learnFromSuccess(error, solution, successRate) {
        var _a;
        const errorHash = this.hashError(error);
        let record = this.memoryCache.get(errorHash);
        if (!record) {
            const similar = await this.getSimilarErrors(error);
            record = similar.find(r => r.errorMessage === error.message);
        }
        if (record) {
            record.fixed = true;
            record.learnedSolution = {
                solution,
                successRate,
                lastApplied: new Date(),
                applicationCount: (((_a = record.learnedSolution) === null || _a === void 0 ? void 0 : _a.applicationCount) || 0) + 1
            };
            this.memoryCache.set(errorHash, record);
            await this.db.saveLearningError(record);
            console.log(`🧠 Learning Memory: Learned solution for ${error.message}`);
        }
    }
    hashError(error) {
        return crypto
            .createHash('md5')
            .update(`${error.name}:${error.message}`)
            .digest('hex');
    }
}
exports.LearningMemory = LearningMemory;
