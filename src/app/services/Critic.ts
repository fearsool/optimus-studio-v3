import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

/**
 * 🧐 THE CRITIC
 * ============
 * Uses AST analysis to evaluate code quality, complexity, and maintainability.
 * It provides "Optimization" diagnoses to the Doctor.
 */

export interface CodeMetrics {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    loc: number;
}

export class Critic {
    private project: Project;

    constructor() {
        this.project = new Project({
            useInMemoryFileSystem: true // Speed up for single file analysis
        });
    }

    /**
     * Analyzes a single file's content and returns complexity metrics.
     */
    analyze(fileName: string, content: string): CodeMetrics {
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
    private calculateCyclomaticComplexity(sourceFile: any): number {
        let complexity = 1;

        sourceFile.forEachDescendant((node: any) => {
            switch (node.getKind()) {
                case SyntaxKind.IfStatement:
                case SyntaxKind.WhileStatement:
                case SyntaxKind.ForStatement:
                case SyntaxKind.ForInStatement:
                case SyntaxKind.ForOfStatement:
                case SyntaxKind.CaseClause:
                case SyntaxKind.ConditionalExpression: // Ternary ?
                case SyntaxKind.CatchClause:
                    complexity++;
                    break;
                case SyntaxKind.BinaryExpression:
                    // Check for && and ||
                    const operator = node.getOperatorToken().getKind();
                    if (operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken) {
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
    private calculateMaintainability(complexity: number, loc: number): number {
        // Simplified formula derived from Halstead metrics
        // MI = 171 - 5.2 * ln(Halstead Vol) - 0.23 * (Cyclomatic) - 16.2 * ln(LOC)
        // We use a linear approximation for speed here
        const score = 100 - (complexity * 2) - (loc * 0.1);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
