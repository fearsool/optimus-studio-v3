
export enum NodeType {
  AGENT_PLANNER = 'planner',
  RESEARCH_WEB = 'research',
  CONTENT_CREATOR = 'creator',
  MEDIA_ENGINEER = 'media',
  VIDEO_ARCHITECT = 'video',
  TRADING_DESK = 'trader',
  SOCIAL_MANAGER = 'social',
  ANALYST_CRITIC = 'analyst',
  LOGIC_GATE = 'logic_gate',
  EXTERNAL_CONNECTOR = 'webhook',
  STATE_MANAGER = 'vault_node',

  HUMAN_APPROVAL = 'approval',
  HTTP_REQUEST = 'http_request'
}

export enum StepStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  REJECTED = 'rejected',
  REPAIRING = 'repairing',
  WAITING_APPROVAL = 'waiting'
}

// ============================================
// EXECUTION STATE MACHINE (V3.1)
// Production-grade state tracking for sellable automations
// ============================================

export enum ExecutionState {
  IDLE = 'IDLE',           // Henüz başlamadı
  RUNNING = 'RUNNING',     // Aktif çalışıyor
  WAITING = 'WAITING',     // External input bekliyor (webhook, rate limit, vs.)
  RETRYING = 'RETRYING',   // Hata sonrası yeniden deneniyor
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS', // Bazı adımlar başarılı, bazıları başarısız
  SUCCESS = 'SUCCESS',     // Tüm adımlar başarılı
  FAILED = 'FAILED',       // Kritik hata, devam edilemiyor
  CANCELLED = 'CANCELLED'  // Kullanıcı veya sistem tarafından iptal edildi
}

// Valid state transitions (State Machine rules)
export const VALID_STATE_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
  [ExecutionState.IDLE]: [ExecutionState.RUNNING, ExecutionState.CANCELLED],
  [ExecutionState.RUNNING]: [ExecutionState.WAITING, ExecutionState.RETRYING, ExecutionState.SUCCESS, ExecutionState.FAILED, ExecutionState.PARTIAL_SUCCESS, ExecutionState.CANCELLED],
  [ExecutionState.WAITING]: [ExecutionState.RUNNING, ExecutionState.FAILED, ExecutionState.CANCELLED],
  [ExecutionState.RETRYING]: [ExecutionState.RUNNING, ExecutionState.FAILED, ExecutionState.CANCELLED],
  [ExecutionState.PARTIAL_SUCCESS]: [ExecutionState.RUNNING, ExecutionState.SUCCESS, ExecutionState.FAILED, ExecutionState.CANCELLED],
  [ExecutionState.SUCCESS]: [], // Terminal state
  [ExecutionState.FAILED]: [ExecutionState.RETRYING], // Can retry from failed
  [ExecutionState.CANCELLED]: [] // Terminal state
};

// Helper: Check if transition is valid
export function isValidTransition(from: ExecutionState, to: ExecutionState): boolean {
  return VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================
// STATE TRANSITION POLICY TABLE (V3.2)
// Formal policy: WHO can move WHICH state to WHICH state
// ============================================

export type TransitionTrigger =
  | 'ENGINE_START'       // executionEngine.startExecution()
  | 'STEP_COMPLETE'      // agentQueue step success
  | 'STEP_FAILED'        // agentQueue step error
  | 'RETRY_TRIGGER'      // automatic retry after failure
  | 'RETRY_EXHAUSTED'    // max retries reached
  | 'WEBHOOK_RECEIVED'   // external webhook trigger
  | 'TIMEOUT'            // step or execution timeout
  | 'USER_CANCEL'        // manual cancellation
  | 'ALL_STEPS_DONE'     // processEvent found no pending work
  | 'PARTIAL_COMPLETE';  // some success, some failed

export interface StateTransitionPolicy {
  from: ExecutionState;
  to: ExecutionState;
  trigger: TransitionTrigger;
  condition?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

// FORMAL STATE TRANSITION TABLE
export const STATE_TRANSITION_POLICIES: StateTransitionPolicy[] = [
  // IDLE transitions
  { from: ExecutionState.IDLE, to: ExecutionState.RUNNING, trigger: 'ENGINE_START' },
  { from: ExecutionState.IDLE, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },

  // RUNNING transitions
  { from: ExecutionState.RUNNING, to: ExecutionState.SUCCESS, trigger: 'ALL_STEPS_DONE', condition: 'all steps SUCCESS' },
  { from: ExecutionState.RUNNING, to: ExecutionState.FAILED, trigger: 'STEP_FAILED', condition: 'critical step failed' },
  { from: ExecutionState.RUNNING, to: ExecutionState.PARTIAL_SUCCESS, trigger: 'PARTIAL_COMPLETE', condition: 'some success, some failed' },
  { from: ExecutionState.RUNNING, to: ExecutionState.WAITING, trigger: 'WEBHOOK_RECEIVED', condition: 'step requires external input' },
  { from: ExecutionState.RUNNING, to: ExecutionState.RETRYING, trigger: 'STEP_FAILED', condition: 'retries remaining', maxRetries: 3 },
  { from: ExecutionState.RUNNING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },
  { from: ExecutionState.RUNNING, to: ExecutionState.FAILED, trigger: 'TIMEOUT', timeoutMs: 300000 }, // 5 min

  // WAITING transitions
  { from: ExecutionState.WAITING, to: ExecutionState.RUNNING, trigger: 'WEBHOOK_RECEIVED', condition: 'webhook data received' },
  { from: ExecutionState.WAITING, to: ExecutionState.FAILED, trigger: 'TIMEOUT', timeoutMs: 86400000 }, // 24h max wait
  { from: ExecutionState.WAITING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },

  // RETRYING transitions
  { from: ExecutionState.RETRYING, to: ExecutionState.RUNNING, trigger: 'RETRY_TRIGGER', condition: 'retry attempt started' },
  { from: ExecutionState.RETRYING, to: ExecutionState.FAILED, trigger: 'RETRY_EXHAUSTED', condition: 'retries > maxRetries', maxRetries: 3 },
  { from: ExecutionState.RETRYING, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },

  // PARTIAL_SUCCESS transitions
  { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.RUNNING, trigger: 'RETRY_TRIGGER', condition: 'user chose to retry failed steps' },
  { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.SUCCESS, trigger: 'ALL_STEPS_DONE', condition: 'all retries succeeded' },
  { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.FAILED, trigger: 'RETRY_EXHAUSTED' },
  { from: ExecutionState.PARTIAL_SUCCESS, to: ExecutionState.CANCELLED, trigger: 'USER_CANCEL' },

  // FAILED can retry
  { from: ExecutionState.FAILED, to: ExecutionState.RETRYING, trigger: 'RETRY_TRIGGER', condition: 'user manual retry' },

  // Terminal states (SUCCESS, CANCELLED) have no outgoing transitions
];

// Constants
export const MAX_RETRIES = 3;
export const EXECUTION_TIMEOUT_MS = 300000; // 5 minutes
export const WAITING_TIMEOUT_MS = 86400000; // 24 hours

// Helper: Get allowed transitions for a state
export function getAllowedTransitions(from: ExecutionState): StateTransitionPolicy[] {
  return STATE_TRANSITION_POLICIES.filter(p => p.from === from);
}

// Helper: Validate transition with reason
export function validateTransition(from: ExecutionState, to: ExecutionState, trigger: TransitionTrigger): { valid: boolean; reason?: string } {
  const policy = STATE_TRANSITION_POLICIES.find(p => p.from === from && p.to === to && p.trigger === trigger);
  if (!policy) {
    return { valid: false, reason: `No policy for ${from} → ${to} via ${trigger}` };
  }
  return { valid: true };
}

export interface NodeConnection {
  targetId: string;
  condition?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  role: string;
  task: string;
  status: StepStatus;
  inputData?: string;
  outputData?: string;

  variableMap?: Record<string, string>;
  connections: NodeConnection[];
  httpConfig?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: string;
  };
}

export interface MarketOpportunity {
  id: string;
  profession: string;
  painPoint: string;
  solutionName: string;
  solutionLogic: string;
  estimatedRevenue: string;
  startupCost: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
}

export interface TestVariable {
  key: string;
  value: string;
}

// API Requirement tanımı (templateService'den import yerine duplicate)
export interface ApiRequirement {
  name: string;
  label: string;
  description: string;
  link?: string;
  required?: boolean;
  placeholder?: string;
}

export interface SystemBlueprint {
  id: string;
  name: string;
  description: string;
  masterGoal: string;
  nodes: WorkflowNode[];
  baseKnowledge: string;
  category: string;
  version: number;
  verified?: boolean; // Şablonun test edilip edilmediği
  // Scheduling support for scheduled-runner
  schedule_cron?: string | null;
  last_run?: string | null;
  testConfig?: {
    variables: TestVariable[];
    simulateFailures: boolean;
  };
  // 4 Adımlık İçerik Analizi Sonuçları
  contentScore?: number; // 0-100, hızlı erişim için
  contentAnalysis?: {
    step1Score: number;
    step2Score: number;
    step3Score: number;
    step4Score: number;
    finalScore: number;
    approved: boolean;
    recommendations: string[];
    analyzedAt: string; // ISO date
  };
  // Gerekli API anahtarları (deploy öncesi girilecek)
  requiredApis?: ApiRequirement[];
  // Girilen API değerleri
  apiValues?: Record<string, string>;
}

// ============================================
// SELLABLE TEMPLATE STANDARD (V3.1)
// Production-grade template for Gumroad/Etsy sales
// ============================================

export interface InputField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'file';
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

export interface OutputField {
  name: string;
  type: 'string' | 'number' | 'json' | 'file' | 'url';
  description: string;
  example?: any;
}

export interface TestBadge {
  passed: boolean;
  lastTestDate: string;       // ISO date
  testCount: number;
  averageRunTime: number;     // ms
  successRate: number;        // 0-100
  engineVersion: string;      // e.g., "v3.1"
}

export interface SellableTemplate {
  // Core
  id: string;
  name: string;
  description: string;
  version: string;             // Semantic: "1.0.0"

  // Blueprint Reference
  blueprint: SystemBlueprint;

  // Input/Output Contract
  inputSchema: InputField[];
  expectedOutput: OutputField[];

  // Quality Assurance
  testBadge: TestBadge;
  verified: boolean;

  // Sales Metadata
  category: string;
  tags: string[];
  estimatedRevenue: string;    // e.g., "$50-200/month"
  difficulty: 'easy' | 'medium' | 'hard';

  // Pricing
  suggestedPrice: number;
  currency: 'USD' | 'EUR' | 'TRY';

  // Generated Assets (for Gumroad/Etsy)
  salesAssets?: {
    title: string;
    description: string;
    coverImageUrl?: string;
    readmeContent: string;
    keywords: string[];
  };

  // Versioning
  createdAt: string;
  updatedAt: string;
  changelog?: string[];

  // ===========================================
  // V1.1 SAFETY FIELDS (Satış Güvenliği)
  // ===========================================

  /** Engine compatibility requirement - e.g., ">=3.1" */
  engineCompatibility: string;

  /** Known scenarios where the template may fail */
  knownFailureScenarios?: string[];

  /** Is this template safe to offer refund guarantee? */
  refundSafe: boolean;

  /** Average execution time in milliseconds */
  avgExecutionTime: number;

  /** Estimated external API costs per run (e.g., "$0.002 per run") */
  externalCostEstimate?: string;

  /** Maximum monthly API cost estimate */
  maxMonthlyCost?: string;

  /** Support tier - affects refund policy */
  supportTier: 'community' | 'email' | 'priority';

  // ===========================================
  // V1.2 SLA + ANTI-CLONE FIELDS (Ticari Güvenlik)
  // ===========================================

  /** SLA Manifest - Service Level Agreement for buyers */
  sla?: SLAManifest;

  /** Template fingerprint for anti-clone protection */
  fingerprint?: TemplateFingerprint;

  /** Canary execution configuration */
  canaryConfig?: CanaryConfig;
}

// ============================================
// SLA MANIFEST (V1.2)
// Müşteri için sorumluluk sınırları
// ============================================

export interface SLAManifest {
  /** Maximum acceptable latency (ms) */
  maxLatency: number;

  /** Expected failure rate (0-100, percentage) */
  expectedFailureRate: number;

  /** Refund condition - when refund is applicable */
  refundCondition: RefundCondition;

  /** Maximum retries before considering failed */
  maxRetries: number;

  /** Uptime guarantee (e.g., "99%") */
  uptimeGuarantee?: string;

  /** Support response time (e.g., "24h") */
  supportResponseTime?: string;

  /** What logs are visible to customer */
  customerLogLevel: 'none' | 'summary' | 'full';
}

export interface RefundCondition {
  /** Auto-refund if execution fails completely */
  onTotalFailure: boolean;

  /** Refund if SLA breached (> maxLatency) */
  onSLABreach: boolean;

  /** Refund window in days */
  windowDays: number;

  /** Maximum refunds per customer */
  maxRefundsPerCustomer: number;

  /** Exceptions that void refund */
  exceptions: string[];
}

// ============================================
// TEMPLATE FINGERPRINT (ANTI-CLONE)
// Kopya tespiti için yapısal hash
// ============================================

export interface TemplateFingerprint {
  /** Structural hash of node graph */
  structuralHash: string;

  /** Policy hash (transitions, configs) */
  policyHash: string;

  /** Combined fingerprint */
  combinedFingerprint: string;

  /** Watermark node ID (engine ignores but included in hash) */
  watermarkNodeId?: string;

  /** Creation timestamp */
  createdAt: string;

  /** Creator ID or username */
  creatorId: string;
}

// ============================================
// CANARY EXECUTION (DEMO MODE)
// Satın almadan önce test
// ============================================

export interface CanaryConfig {
  /** Is canary mode enabled for this template */
  enabled: boolean;

  /** Pre-defined safe input for demo */
  demoInput: any;

  /** Mock output (shown instead of real execution) */
  mockOutput: any;

  /** Which nodes to simulate (rest skipped) */
  simulatedNodes: string[];

  /** Estimated demo duration (ms) */
  demoDuration: number;

  /** Show "Live Demo" badge */
  showDemoBadge: boolean;
}

// ============================================
// SLA BREACH DETECTION
// ============================================

export type SLAStatus = 'OK' | 'SLA_WARNING' | 'SLA_BREACH' | 'REFUND_ELIGIBLE';

export interface SLACheckResult {
  status: SLAStatus;
  actualLatency: number;
  maxLatency: number;
  breachReason?: string;
  refundEligible: boolean;
}

export function checkSLABreach(
  executionTime: number,
  sla: SLAManifest,
  avgExecutionTime: number
): SLACheckResult {
  const warningThreshold = avgExecutionTime * 2;
  const breachThreshold = sla.maxLatency;

  if (executionTime > breachThreshold) {
    return {
      status: 'SLA_BREACH',
      actualLatency: executionTime,
      maxLatency: breachThreshold,
      breachReason: `Execution exceeded SLA: ${executionTime}ms > ${breachThreshold}ms`,
      refundEligible: sla.refundCondition.onSLABreach
    };
  }

  if (executionTime > warningThreshold) {
    return {
      status: 'SLA_WARNING',
      actualLatency: executionTime,
      maxLatency: breachThreshold,
      breachReason: `Execution slow: ${executionTime}ms > ${warningThreshold}ms (2x avg)`,
      refundEligible: false
    };
  }

  return {
    status: 'OK',
    actualLatency: executionTime,
    maxLatency: breachThreshold,
    refundEligible: false
  };
}

// ============================================
// TEMPLATE FINGERPRINT GENERATOR
// ============================================

export function generateTemplateFingerprint(
  blueprint: SystemBlueprint,
  creatorId: string
): TemplateFingerprint {
  // Create structural hash from nodes
  const nodeSignatures = blueprint.nodes.map(n =>
    `${n.id}:${n.type}:${n.connections?.map(c => c.targetId).join(',')}`
  ).sort().join('|');

  const structuralHash = simpleHash(nodeSignatures);

  // Create policy hash from config
  const policyData = JSON.stringify({
    version: blueprint.version,
    category: blueprint.category,
    requiredApis: blueprint.requiredApis?.map(a => a.name)
  });
  const policyHash = simpleHash(policyData);

  // Combined fingerprint
  const combinedFingerprint = simpleHash(structuralHash + policyHash + creatorId);

  return {
    structuralHash,
    policyHash,
    combinedFingerprint,
    createdAt: new Date().toISOString(),
    creatorId
  };
}

// Simple hash function for fingerprinting
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Validation helper (V1.1)
export function validateSellableTemplate(template: SellableTemplate): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Core validations
  if (!template.name || template.name.length < 3) {
    errors.push('Template name must be at least 3 characters');
  }

  if (!template.version || !/^\d+\.\d+\.\d+$/.test(template.version)) {
    errors.push('Version must be semantic (e.g., 1.0.0)');
  }

  if (!template.inputSchema || template.inputSchema.length === 0) {
    errors.push('Input schema is required');
  }

  if (!template.testBadge || !template.testBadge.passed) {
    errors.push('Template must pass tests before sale');
  }

  if (!template.verified) {
    errors.push('Template must be verified');
  }

  // V1.1 Safety validations
  if (!template.engineCompatibility) {
    errors.push('Engine compatibility version is required (e.g., ">=3.1")');
  }

  if (template.avgExecutionTime <= 0) {
    warnings.push('Average execution time should be measured');
  }

  if (template.avgExecutionTime > 300000) { // 5 min
    warnings.push('Long execution time may cause timeout issues');
  }

  if (!template.refundSafe && !template.knownFailureScenarios?.length) {
    warnings.push('Non-refund-safe templates should document failure scenarios');
  }

  if (!template.externalCostEstimate) {
    warnings.push('External API cost estimate helps buyers make decisions');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================
// AGENT HEALTH & RECOVERY SYSTEM
// Scalable for 30-40+ agents
// ============================================

export enum AgentHealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  RECOVERING = 'recovering',
  OFFLINE = 'offline',
  CIRCUIT_OPEN = 'circuit_open'
}

export interface AgentHealthState {
  nodeId: string;
  nodeName: string;
  status: AgentHealthStatus;
  lastHeartbeat: number; // timestamp
  consecutiveFailures: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
  averageResponseTime: number;
  lastResponseTime: number;
  circuitBreakerOpen: boolean;
  circuitBreakerResetTime: number | null;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  lastError: string | null;
  fallbackNodeId: string | null;
  queuedTasks: number;
  memoryUsage: number; // percentage
  cpuLoad: number; // percentage
}

export interface HealthCheckResult {
  nodeId: string;
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: number;
  checkType: 'heartbeat' | 'execution' | 'manual';
}

export interface RecoveryAction {
  id: string;
  type: 'retry' | 'fallback' | 'reset' | 'skip' | 'restart' | 'manual' | 'circuit_reset';
  nodeId: string;
  nodeName: string;
  timestamp: number;
  success: boolean;
  details: string;
  previousStatus: AgentHealthStatus;
  newStatus: AgentHealthStatus;
  duration: number; // ms
}

export interface AgentMetrics {
  totalAgents: number;
  healthyAgents: number;
  warningAgents: number;
  criticalAgents: number;
  offlineAgents: number;
  recoveringAgents: number;
  averageSuccessRate: number;
  averageResponseTime: number;
  totalExecutions: number;
  totalRecoveries: number;
  successfulRecoveries: number;
  uptime: number; // percentage
  lastUpdated: number;
  systemLoad: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentCluster {
  id: string;
  name: string;
  agents: string[]; // node IDs
  loadBalancer: 'round-robin' | 'least-connections' | 'weighted';
  healthThreshold: number; // minimum healthy agents percentage
  autoScale: boolean;
  minAgents: number;
  maxAgents: number;
}

// ============================================
// FACTORY & SALES TYPES
// ============================================

export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  package: any;
  demoUrl: string;
  salesPageUrl: string;
  createdAt: Date;
  tags: string[];
  installed?: boolean;
}

export interface PaymentLinks {
  stripe: string;
  paypal: string;
  crypto: CryptoPayment[];
}

export interface CryptoPayment {
  coin: string;
  address: string;
  amount: number;
  qrCode: string;
}

export interface SalesChannel {
  id?: string;
  name?: string;
  sales?: number;
  revenue?: number;
  url?: string;
  productId: string;
  salesPageUrl: string;
  paymentLinks: PaymentLinks;
  demoUrl: string;
  marketplaceLinks: any; // string[] or object
  createdAt: Date;
}

export interface SalesSystem {
  platforms: { name: string; url: string; productId: string }[];
  analytics: {
    dailySales: number;
    totalRevenue: number;
    conversionRate: number;
  };
  marketing: {
    socialMedia: boolean;
    emailCampaigns: boolean;
    affiliateProgram: boolean;
  };
}

export interface SalesPage {
  url: string;
  adminUrl: string;
  analyticsId: string;
  conversionRate: number;
}

export interface AffiliateSystem {
  programActive: boolean;
  commissionRate: number;
  affiliates: any[];
  payouts: any[];
}

export interface SalesResults {
  productsListed: number;
  salesChannels: SalesChannel[];
  totalRevenue: number;
  customers: any[];
  marketing: any;
}

export interface RevenueProjection {
  months: {
    name: string;
    productSales: number;
    affiliate: number;
    custom: number;
    consulting: number;
    crypto: number;
    total: number;
  }[];
  totalYearly: number;
  passivePercentage: number;
}

export interface ScalingStrategy {
  actions: string[];
  investment: number;
  expectedROI: number;
}

export interface InstallationResult {
  productId: string;
  steps: string[];
  success: boolean;
  installedPath: string;
  error?: string;
}

export interface Pricing {
  standard: number;
  premium: number;
  enterprise: number;
  discount: number;
  bundle: number;
}

export interface SecurityReport {
  score: number;
  details: any;
  timestamp: Date;
}

export interface SalesData {
  total: number;
  today: number;
  channels?: { id: string; name: string; sales: number; revenue: number; url: string }[];
  crypto?: number;
  stripe?: number;
  paypal?: number;
  affiliates?: number;
  commissions?: number;
}

export type ProductionStatus = 'idle' | 'starting' | 'running';

export interface MarketplaceConnector {
  listProduct?(product: DigitalProduct): Promise<string>;
  createStore?(product: DigitalProduct): Promise<string>;
  promoteProduct?(product: DigitalProduct): Promise<number>;
}

