# TAM PROJE DOSYA DENETİM RAPORU

**Tarih:** 02.02.2026
**Proje:** Optimus Studio V3

##  AGENT (33 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\agent\connectors\WhatsAppConnector.ts | 132 |
| src\agent\core\AgentCore.ts | 257 |
| src\agent\core\Authority.ts | 42 |
| src\agent\core\Executor.ts | 74 |
| src\agent\core\LLMService.ts | 44 |
| src\agent\core\LMStudioAdapter.ts | 107 |
| src\agent\core\OptimusAgentCore.ts | 207 |
| src\agent\core\SystemProtocol.ts | 15 |
| src\agent\core\Verifier.ts | 80 |
| src\agent\evolution\SelfImprovementEngine.ts | 560 |
| src\agent\finance\FinancialAgent.ts | 642 |
| src\agent\memory\MemoryManager.ts | 332 |
| src\agent\memory\VectorMemory.ts | 87 |
| src\agent\planner\Planner.ts | 82 |
| src\agent\policy\ModelPolicy.ts | 81 |
| src\agent\router\ModelPolicy.ts | 45 |
| src\agent\router\ModelRouter.ts | 452 |
| src\agent\security\SevenLayerSecurity.ts | 255 |
| src\agent\specialists\TurkishSpecialistAgent.ts | 22 |
| src\agent\specialists\VideoScriptAgent.ts | 23 |
| src\agent\state\StateStore.ts | 216 |
| src\agent\tools\BrowserTool.ts | 75 |
| src\agent\tools\ConnectorTools.ts | 116 |
| src\agent\tools\FactoryTool.ts | 62 |
| src\agent\tools\FileTool.ts | 38 |
| src\agent\tools\TerminalTool.ts | 39 |
| src\agent\tools\ToolRegistry.ts | 71 |
| src\agent\tools\WebSearchTool.ts | 64 |
| src\agent\voice\IntentParser.ts | 902 |
| src\agent\voice\PiperTTS.ts | 217 |
| src\agent\voice\VoiceCommunicator.ts | 20 |
| src\agent\web\WebAutomation.ts | 510 |
| src\agent\LoopManager.ts | 53 |

##  APP (63 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\app\api\doctor\diagnose\route.ts | 54 |
| src\app\api\doctor\fix\route.ts | 87 |
| src\app\api\doctor\fix-all\route.ts | 27 |
| src\app\api\doctor\history\route.ts | 14 |
| src\app\api\doctor\scan\route.ts | 156 |
| src\app\api\scout\route.ts | 30 |
| src\app\api\self-healing\evolve\route.ts | 26 |
| src\app\api\self-healing\route.ts | 117 |
| src\app\api\system\connectors\route.ts | 22 |
| src\app\api\templates\all\route.ts | 14 |
| src\app\api\workflow\execute\route.ts | 54 |
| src\app\services\Critic.ts | 75 |
| src\app\services\Doctor.ts | 39 |
| src\app\services\ImmuneSystem.ts | 72 |
| src\app\services\LocalAIManager.ts | 25 |
| src\app\services\Surgeon.ts | 70 |
| src\app\ui\chat\ActiveContextBar.tsx | 49 |
| src\app\ui\chat\InputCapsule.tsx | 134 |
| src\app\ui\chat\MessageList.tsx | 111 |
| src\app\ui\dashboard\ActivityFeed.tsx | 27 |
| src\app\ui\dashboard\AgentMonitorDashboard.tsx | 112 |
| src\app\ui\dashboard\Dashboard.tsx | 97 |
| src\app\ui\dashboard\FactoryControlCenter.tsx | 194 |
| src\app\ui\dashboard\SelfHealer.tsx | 182 |
| src\app\ui\editor\CodeDiffViewer.tsx | 35 |
| src\app\ui\editor\CodeEditor.tsx | 67 |
| src\app\ui\editor\MonacoEditor.tsx | 140 |
| src\app\ui\explorer\FileExplorer.tsx | 129 |
| src\app\ui\factory\FactoryDashboard.tsx | 128 |
| src\app\ui\layout\ActivityBar.tsx | 80 |
| src\app\ui\layout\IdeLayout.tsx | 76 |
| src\app\ui\layout\index.ts | 6 |
| src\app\ui\layout\RightAgentPanel.tsx | 150 |
| src\app\ui\layout\Sidebar.tsx | 340 |
| src\app\ui\layout\TabsBar.tsx | 54 |
| src\app\ui\layout\Topbar.tsx | 99 |
| src\app\ui\panels\ChatPanel.tsx | 142 |
| src\app\ui\panels\CodePanel.tsx | 132 |
| src\app\ui\panels\index.ts | 5 |
| src\app\ui\panels\PersonalAgentDashboard.tsx | 272 |
| src\app\ui\panels\PlanPanel.tsx | 119 |
| src\app\ui\panels\TerminalPanel.tsx | 119 |
| src\app\ui\state\index.ts | 11 |
| src\app\ui\state\useAgentStore.ts | 78 |
| src\app\ui\state\useFileStore.ts | 120 |
| src\app\ui\state\useMessageStore.ts | 47 |
| src\app\ui\state\useStudioStore.ts | 54 |
| src\app\ui\state\useUIStore.ts | 54 |
| src\app\ui\terminal\BottomPanel.tsx | 131 |
| src\app\ui\terminal\ProblemsPanel.tsx | 89 |
| src\app\ui\terminal\RealTerminal.tsx | 164 |
| src\app\ui\terminal\TerminalInstance.tsx | 93 |
| src\app\ui\terminal\TerminalPanel.tsx | 103 |
| src\app\ui\terminal\XtermTerminal.tsx | 169 |
| src\app\ui\types\index.ts | 43 |
| src\app\ui\vision\VisionPanel.tsx | 118 |
| src\app\ui\workflow\nodes\TaskNode.tsx | 28 |
| src\app\ui\workflow\ReactFlowEditor.tsx | 228 |
| src\app\ui\workflow\WorkflowEditor.tsx | 81 |
| src\app\globals.css | 15 |
| src\app\layout.tsx | 25 |
| src\app\page.tsx | 118 |
| src\app\patient.ts | 48 |

##  COMPONENTS (19 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\components\auth\AuthGuard.tsx | 69 |
| src\components\dashboard\EnvironmentValidator.tsx | 61 |
| src\components\layout\BottomPanel.tsx | 52 |
| src\components\layout\LeftPanel.tsx | 99 |
| src\components\layout\OptimusLayout.tsx | 74 |
| src\components\layout\RightPanel.tsx | 78 |
| src\components\layout\TopBar.tsx | 148 |
| src\components\quantum-builder\QuantumNoCodeBuilder.tsx | 73 |
| src\components\ui\ErrorBoundary.tsx | 48 |
| src\components\unified-editor\mocks.tsx | 51 |
| src\components\unified-editor\UnifiedEditor.tsx | 213 |
| src\components\workflow\canvas\WorkflowCanvas.tsx | 142 |
| src\components\workflow\engine\WorkflowConsole.tsx | 56 |
| src\components\workflow\panels\NodePalette.tsx | 68 |
| src\components\workflow\panels\PropertyPanel.tsx | 130 |
| src\components\workflow\types.ts | 13 |
| src\components\workflow\WorkflowDesigner.tsx | 156 |
| src\components\workflow\WorkflowToolbar.tsx | 58 |
| src\components\workspace\WorkspaceTabs.tsx | 33 |

##  CONNECTORS (4 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\connectors\GitHubConnector.ts | 195 |
| src\connectors\index.ts | 65 |
| src\connectors\NetlifyConnector.ts | 233 |
| src\connectors\SupabaseConnector.ts | 194 |

##  CORE (7 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\core\production\AutomationFactory.ts | 37 |
| src\core\production\VideoProductionPipeline.ts | 68 |
| src\core\quantum\QuantumOrchestrator.ts | 34 |
| src\core\safety\SelfHealingEngine.ts | 66 |
| src\core\OmniFlowMasterOS.ts | 129 |
| src\core\OptimusStudioMasterOS.ts | 94 |
| src\core\OSSRegistry.ts | 226 |

##  DATA (1 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\data\workflows\my-workflow.json | 91 |

##  FACTORY (3 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\factory\OmniFlowDigitalFactory.ts | 372 |
| src\factory\RevenueMatrix.ts | 81 |
| src\factory\SalesAutomationEngine.ts | 370 |

##  LİB (44 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\lib\ai-development\core.ts | 58 |
| src\lib\ai-ecosystem\agents\CodeGenerationAgent.ts | 77 |
| src\lib\ai-ecosystem\agents\LongContextManager.ts | 68 |
| src\lib\ai-ecosystem\agents\TurkishSpecialistAgent.ts | 70 |
| src\lib\ai-ecosystem\agents\VideoScriptAgent.ts | 92 |
| src\lib\ai-ecosystem\core\ModelOrchestrator.ts | 146 |
| src\lib\ai-ecosystem\orchestration\ModelSelector.ts | 30 |
| src\lib\ai-ecosystem\workflows\VideoProductionPipeline.ts | 95 |
| src\lib\ai-ecosystem\types.ts | 69 |
| src\lib\analytics\RealTimeAnalytics.ts | 28 |
| src\lib\auth\OptimusAuth.ts | 42 |
| src\lib\automation\AutomationFactory.ts | 64 |
| src\lib\cloud\HybridCloudManager.ts | 66 |
| src\lib\collaboration\RealTimeCollaboration.ts | 57 |
| src\lib\collective-intelligence\CollectiveOrchestrator.ts | 106 |
| src\lib\distributor\VideoDistributor.ts | 83 |
| src\lib\distributor\YouTubeUploader.ts | 60 |
| src\lib\error\GlobalErrorHandler.ts | 41 |
| src\lib\factory\ComfyUIIntegration.ts | 28 |
| src\lib\hyper-automation\HyperAutomation.ts | 84 |
| src\lib\learning\AdaptiveLearningSystem.ts | 73 |
| src\lib\local-ai\HardwareMonitor.ts | 22 |
| src\lib\local-ai\index.ts | 2 |
| src\lib\local-ai\LocalAICluster.ts | 66 |
| src\lib\local-ai\LocalVectorDB.ts | 62 |
| src\lib\local-ai\LongContextManager.ts | 21 |
| src\lib\local-ai\ModelOrchestrator.ts | 111 |
| src\lib\local-ai\OllamaService.ts | 37 |
| src\lib\marketplace\ExtensionMarketplace.ts | 61 |
| src\lib\mocks\chromadb.ts | 19 |
| src\lib\monitoring\PerformanceSuite.ts | 50 |
| src\lib\omni-integration\OmniIntegrationHub.ts | 85 |
| src\lib\packaging\SmartPackager.ts | 51 |
| src\lib\plugin-system\core.ts | 68 |
| src\lib\quantum-cloud\mock\dependencies.ts | 14 |
| src\lib\quantum-cloud\QuantumOrchestrator.ts | 103 |
| src\lib\quantum-workflow\QuantumWorkflow.ts | 88 |
| src\lib\reality-synthesis\RealitySynthesis.ts | 92 |
| src\lib\safety\AdaptiveLearning.ts | 13 |
| src\lib\safety\EmergencyController.ts | 12 |
| src\lib\universal-api\UniversalAPIGenerator.ts | 95 |
| src\lib\autonomous-agent.ts | 121 |
| src\lib\hybrid-mocks.ts | 78 |
| src\lib\universal-import-fixer.ts | 92 |

##  PAGES (2 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\pages\api\agent.ts | 27 |
| src\pages\api\files.ts | 43 |

##  SCRİPTS (3 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| scripts\auto-fix.js | 51 |
| scripts\COMPLETE-WORKFLOW-EXAMPLE.ts | 64 |
| scripts\start-agent.ts | 32 |

##  SERVİCES (97 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\services\integrations\alphaVantageService.ts | 69 |
| src\services\integrations\ayrshareService.ts | 64 |
| src\services\integrations\coinGeckoService.ts | 58 |
| src\services\integrations\googleCalendarService.ts | 63 |
| src\services\integrations\groqService.ts | 74 |
| src\services\integrations\gumroadService.ts | 56 |
| src\services\integrations\hubspotService.ts | 38 |
| src\services\integrations\lmStudioService.ts | 71 |
| src\services\integrations\mediaToolsService.ts | 59 |
| src\services\integrations\pexelsService.ts | 69 |
| src\services\integrations\shopifyService.ts | 58 |
| src\services\nodes\HttpNodeService.ts | 112 |
| src\services\optimus\core\optimusCore.ts | 625 |
| src\services\optimus\core\optimusFallbackBrain.ts | 271 |
| src\services\optimus\core\optimusPersonality.ts | 297 |
| src\services\optimus\core\optimusTypes.ts | 249 |
| src\services\optimus\decision\optimusDecisionEngine.ts | 310 |
| src\services\optimus\decision\optimusPriorityResolver.ts | 258 |
| src\services\optimus\decision\optimusRiskEvaluator.ts | 204 |
| src\services\optimus\enhancer\templateEnhancer.ts | 498 |
| src\services\optimus\hunter\autonomousHunter.ts | 680 |
| src\services\optimus\intent\optimusContextTracker.ts | 245 |
| src\services\optimus\intent\optimusIntentResolver.ts | 247 |
| src\services\optimus\intent\optimusIntentSeparator.ts | 233 |
| src\services\optimus\metrics\optimusIntelligenceMetrics.ts | 215 |
| src\services\optimus\modes\optimusModeController.ts | 188 |
| src\services\optimus\policy\optimusPolicyEngine.ts | 209 |
| src\services\optimus\policy\optimusPolicySet.ts | 237 |
| src\services\optimus\safety\optimusAuthorityMatrix.ts | 187 |
| src\services\optimus\safety\optimusFailSafe.ts | 181 |
| src\services\optimus\safety\optimusKillSwitch.ts | 154 |
| src\services\optimus\tests\optimusDryRunTest.ts | 273 |
| src\services\optimus\tests\optimusIsolatedTest.ts | 186 |
| src\services\optimus\tests\optimusPipelineTest.ts | 226 |
| src\services\optimus\tests\optimusSmokeTest.ts | 173 |
| src\services\optimus\index.ts | 242 |
| src\services\policy\failSafeGuard.ts | 187 |
| src\services\policy\immutabilityPolicy.ts | 57 |
| src\services\policy\salonStandards.ts | 157 |
| src\services\reliability\sandboxService.ts | 78 |
| src\services\reliability\schemas.ts | 60 |
| src\services\reliability\testEngineer.ts | 110 |
| src\services\templates\detailedDescriptions.ts | 141 |
| src\services\templates\etsySeoListing.ts | 88 |
| src\services\templates\feedbackClient.ts | 117 |
| src\services\templates\githubImportedTemplates.ts | 211 |
| src\services\templates\hairSalonBot.ts | 350 |
| src\services\templates\index.ts | 4 |
| src\services\templates\packager.ts | 411 |
| src\services\templates\standaloneRunnerTemplate.ts | 125 |
| src\services\templates\store.ts | 1547 |
| src\services\templates\validator.ts | 155 |
| src\services\utils\hashUtil.ts | 22 |
| src\services\agentHealthService.ts | 431 |
| src\services\agentQueueService.ts | 141 |
| src\services\aiIdeaGenerator.ts | 143 |
| src\services\apiConnectorService.ts | 183 |
| src\services\apiIntegrations.ts | 380 |
| src\services\automationIdeasService.ts | 396 |
| src\services\automationRunnerService.ts | 397 |
| src\services\automationTestService.ts | 151 |
| src\services\canaryExecutionService.ts | 143 |
| src\services\codeGenerator.ts | 683 |
| src\services\codeGeneratorHF.ts | 785 |
| src\services\codeGeneratorService.ts | 434 |
| src\services\contentStandardsService.ts | 650 |
| src\services\credentialService.ts | 395 |
| src\services\customerService.ts | 722 |
| src\services\deployManagerService.ts | 186 |
| src\services\executionCore.ts | 346 |
| src\services\factoryDecisionEngine.ts | 206 |
| src\services\factoryService.ts | 357 |
| src\services\factoryStandards.ts | 197 |
| src\services\feedbackService.ts | 161 |
| src\services\geminiService.ts | 301 |
| src\services\githubImportService.ts | 183 |
| src\services\huggingfaceNativeService.ts | 443 |
| src\services\huggingfaceService.ts | 558 |
| src\services\imageGenerationService.ts | 212 |
| src\services\integrationService.ts | 231 |
| src\services\nemotronService.ts | 482 |
| src\services\nicheFinderService.ts | 113 |
| src\services\nodeExecutors.ts | 206 |
| src\services\notificationService.ts | 286 |
| src\services\oviVideoService.ts | 398 |
| src\services\profitScoutService.ts | 288 |
| src\services\salesPackageService.ts | 341 |
| src\services\storeFrontManager.ts | 88 |
| src\services\supabaseService.ts | 652 |
| src\services\templateService.ts | 1 |
| src\services\templateVersionService.ts | 115 |
| src\services\ttsService.ts | 237 |
| src\services\universalAutomationService.ts | 150 |
| src\services\videoGenerationService.ts | 223 |
| src\services\videoService.ts | 418 |
| src\services\webhookService.ts | 382 |
| src\services\workflowExecutor.ts | 366 |

##  STATE (1 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\state\StateStore.ts | 394 |

##  TYPES.TS (1 dosya)
| Dosya Yolu | Satır Sayısı |
|---|---:|
| src\types.ts | 679 |

## 📊 ÖZET İSTATİSTİKLER
- **Toplam Dosya Sayısı:** 278
- **Toplam Kod Satırı:** 44947

