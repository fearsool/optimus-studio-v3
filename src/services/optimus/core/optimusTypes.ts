/**
 * 🤖 OPTIMUS TYPE DEFINITIONS
 * ===========================
 * Operations & Production Tactical Intelligence Matrix Universal System
 * 
 * Central type definitions for the OPTIMUS AI Core
 */

// ============================================
// BASE TYPES
// ============================================

export type OptimusMode =
    | 'SILENT'    // Sadece izle, hiç konuşma
    | 'ADVISOR'   // Öner ama uygulama
    | 'OPERATOR'  // Normal otonom mod
    | 'ANALYST'   // Derinlemesine analiz modu
    | 'CRISIS';   // Kritik durum modu

export type AuthorityLevel =
    | 'SYSTEM'    // En yüksek yetki
    | 'ADMIN'     // Admin seviyesi
    | 'USER'      // Normal kullanıcı
    | 'GUEST';    // Misafir/Read-only

export type ActionType =
    | 'EXECUTE'   // Direkt uygula
    | 'DEFER'     // Ertele
    | 'ALERT'     // Uyar
    | 'BLOCK'     // Engelle
    | 'ESCALATE'  // Üst seviyeye ilet
    | 'SCALE_UP'  // Ölçeği artır
    | 'SCALE_DOWN' // Ölçeği azalt
    | 'ADVISE';   // Tavsiye ver / Konuş

export type IntentType =
    | 'NATURAL'   // Doğal dil komutu
    | 'SYSTEM'    // Sistem olayı
    | 'STRATEGIC' // Stratejik karar
    | 'SCHEDULED'; // Zamanlanmış görev

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

// ============================================
// EVENT TYPES
// ============================================

export interface OptimusEvent {
    id: string;
    type: 'USER_COMMAND' | 'SYSTEM_EVENT' | 'FACTORY_EVENT' | 'SCHEDULED' | 'EXTERNAL';
    source: string;
    payload: Record<string, any>;
    timestamp: Date;
    priority: PriorityLevel;
    metadata?: Record<string, any>;
}

export interface OptimusEventHandler {
    eventType: string;
    handler: (event: OptimusEvent) => Promise<OptimusResponse>;
    priority: number;
}

// ============================================
// INTENT & CONTEXT
// ============================================

export interface ResolvedIntent {
    id: string;
    type: IntentType;
    action: string;
    confidence: number;
    entities: Record<string, any>;
    rawInput: string;
    timestamp: Date;
}

export interface ConversationContext {
    sessionId: string;
    turnCount: number;
    lastIntent: ResolvedIntent | null;
    entities: Map<string, any>;
    history: ResolvedIntent[];
    startedAt: Date;
    lastActivityAt: Date;
}

// ============================================
// DECISION TYPES
// ============================================

export interface Decision {
    id: string;
    intent: ResolvedIntent;
    action: ActionType;
    reason: string;
    confidence: number;
    riskLevel: RiskLevel;
    priority: PriorityLevel;
    params: Record<string, any>;
    timestamp: Date;
}

export interface RiskAssessment {
    level: RiskLevel;
    score: number; // 0-100
    factors: string[];
    mitigations: string[];
}

// ============================================
// POLICY TYPES
// ============================================

export interface Policy {
    id: string;
    rule: string;
    condition: string | ((context: any) => boolean);
    action: ActionType;
    reason: string;
    priority: number;
    enabled: boolean;
}

export interface PolicyEvaluationResult {
    policyId: string;
    matched: boolean;
    action: ActionType;
    reason: string;
}

// ============================================
// AUTHORITY TYPES
// ============================================

export interface AuthorityCheck {
    requiredLevel: AuthorityLevel;
    currentLevel: AuthorityLevel;
    action: string;
    resource: string;
    granted: boolean;
    reason: string;
}

export interface Permission {
    action: string;
    resource: string;
    levels: AuthorityLevel[];
}

// ============================================
// MEMORY TYPES
// ============================================

export interface MemoryEntry {
    id: string;
    type: 'decision' | 'event' | 'learning' | 'pattern';
    content: any;
    importance: number;
    createdAt: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessedAt: Date;
}

export interface DecisionLogEntry {
    id: string;
    decision: Decision;
    outcome: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'PENDING';
    humanOverride: boolean;
    executionTimeMs: number;
    feedback?: string;
    timestamp: Date;
}

// ============================================
// METRICS TYPES
// ============================================

export interface IntelligenceMetrics {
    correctDecisionRate: number;      // 0-1
    humanOverrideCount: number;
    unnecessaryActionCount: number;
    falseSpeechRate: number;          // Susturulması gerekirken konuşma
    failSafeTriggerCount: number;
    averageResponseTimeMs: number;
    lastUpdated: Date;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface OptimusResponse {
    success: boolean;
    action: ActionType;
    message: string;
    data?: any;
    decision?: Decision;
    shouldSpeak: boolean;
    voiceMessage?: string;
    uiUpdate?: UIUpdate;
    timestamp: Date;
}

export interface UIUpdate {
    type: 'NOTIFICATION' | 'ALERT' | 'STATUS_CHANGE' | 'MODE_CHANGE';
    payload: any;
    priority: PriorityLevel;
}

// ============================================
// OBSERVER TYPES
// ============================================

export interface AnomalyReport {
    id: string;
    type: string;
    severity: RiskLevel;
    description: string;
    affectedSystems: string[];
    detectedAt: Date;
    suggestedAction: ActionType;
}

export interface OpportunityReport {
    id: string;
    type: string;
    confidence: number;
    description: string;
    potentialValue: number;
    expiresAt?: Date;
    suggestedAction: string;
    detectedAt: Date;
}

// ============================================
// FAILSAFE TYPES
// ============================================

export interface FailSafeConfig {
    maxApiCallsPerMinute: number;
    maxDecisionsPerMinute: number;
    maxLoopIterations: number;
    latencyThresholdMs: number;
    memoryThresholdMb: number;
    enabled: boolean;
}

export interface FailSafeStatus {
    isTriggered: boolean;
    reason?: string;
    triggeredAt?: Date;
    recoveryEta?: Date;
}

// ============================================
// CORE LIFECYCLE
// ============================================

export interface OptimusCoreConfig {
    mode: OptimusMode;
    authorityLevel: AuthorityLevel;
    failSafeConfig: FailSafeConfig;
    personality: PersonalityConfig;
    voiceEnabled: boolean;
    debugMode: boolean;
}

export interface PersonalityConfig {
    name: string;
    language: 'tr' | 'en' | 'auto';
    tone: 'formal' | 'friendly' | 'technical';
    verbosity: 'minimal' | 'normal' | 'detailed';
    humor: boolean;
}

export interface OptimusCoreStatus {
    isRunning: boolean;
    mode: OptimusMode;
    uptime: number;
    eventCount: number;
    decisionCount: number;
    lastActivity: Date;
    health: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
    failSafe: FailSafeStatus;
}
