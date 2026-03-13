"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Critic = void 0;
const ts_morph_1 = require("ts-morph");
class Critic {
    constructor() {
        this.project = new ts_morph_1.Project({
            useInMemoryFileSystem: true // Speed up for single file analysis
        });
    }
    /**
     * Analyzes a single file's content and returns complexity metrics.
     */
    analyze(fileName, content) {
        const sourceFile = this.project.createSourceFile(fileName, content, { overwrite: true });
        const complexity = this.calculateCyclomaticComplexity(sourceFile);
        const loc = content.split('\n').length;
        const maintainability = this.calculateMaintainability(complexity, loc);
        return {
            cyclomaticComplexity: complexity,
            loc,
            maintainabilityIndex: maintainability
        };
    }
    /**
     * Calculates Cyclomatic Complexity (M = E - N + 2P)
     * Simplified: Count branching statements + 1
     */
    calculateCyclomaticComplexity(sourceFile) {
        let complexity = 1;
        sourceFile.forEachDescendant((node) => {
            switch (node.getKind()) {
                case ts_morph_1.SyntaxKind.IfStatement:
                case ts_morph_1.SyntaxKind.WhileStatement:
                case ts_morph_1.SyntaxKind.ForStatement:
                case ts_morph_1.SyntaxKind.ForInStatement:
                case ts_morph_1.SyntaxKind.ForOfStatement:
                case ts_morph_1.SyntaxKind.CaseClause:
                case ts_morph_1.SyntaxKind.ConditionalExpression: // Ternary ?
                case ts_morph_1.SyntaxKind.CatchClause:
                    complexity++;
                    break;
                case ts_morph_1.SyntaxKind.BinaryExpression:
                    // Check for && and ||
                    const operator = node.getOperatorToken().getKind();
                    if (operator === ts_morph_1.SyntaxKind.AmpersandAmpersandToken || operator === ts_morph_1.SyntaxKind.BarBarToken) {
                        complexity++;
                    }
                    break;
            }
        });
        return complexity;
    }
    /**
     * Simple Maintainability Index approximation
     * 100-20 = Bad, 100 = Good
     */
    calculateMaintainability(complexity, loc) {
        // Simplified formula derived from Halstead metrics
        // MI = 171 - 5.2 * ln(Halstead Vol) - 0.23 * (Cyclomatic) - 16.2 * ln(LOC)
        // We use a linear approximation for speed here
        const score = 100 - (complexity * 2) - (loc * 0.1);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
exports.Critic = Critic;
