/**
 * 🛡️ OPTIMUS AUTHORITY MATRIX
 * ===========================
 * Yetki haritası - "Yapabilir mi?" sorusunu yanıtlar
 * 
 * SEVİYELER:
 * - SYSTEM: En yüksek yetki (OPTIMUS kendisi)
 * - ADMIN: Yönetici
 * - USER: Normal kullanıcı
 * - GUEST: Misafir (read-only)
 */

import {
    AuthorityLevel,
    AuthorityCheck,
    Permission,
    ActionType
} from '../core/optimusTypes';

// ============================================
// PERMISSION DEFINITIONS
// ============================================

const PERMISSIONS: Permission[] = [
    // System Operations
    { action: 'START_PRODUCTION', resource: 'factory', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'STOP_PRODUCTION', resource: 'factory', levels: ['SYSTEM', 'ADMIN', 'USER'] },
    { action: 'EMERGENCY_STOP', resource: 'factory', levels: ['SYSTEM', 'ADMIN', 'USER', 'GUEST'] },

    // Product Management
    { action: 'CREATE_PRODUCT', resource: 'products', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'DELETE_PRODUCT', resource: 'products', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'UPDATE_PRODUCT', resource: 'products', levels: ['SYSTEM', 'ADMIN', 'USER'] },

    // Configuration
    { action: 'SET_MODE', resource: 'config', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'SET_PRICING', resource: 'config', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'UPDATE_POLICY', resource: 'config', levels: ['SYSTEM', 'ADMIN'] },

    // Monitoring  
    { action: 'CHECK_STATUS', resource: 'monitoring', levels: ['SYSTEM', 'ADMIN', 'USER', 'GUEST'] },
    { action: 'GET_REPORT', resource: 'monitoring', levels: ['SYSTEM', 'ADMIN', 'USER'] },
    { action: 'GET_METRICS', resource: 'monitoring', levels: ['SYSTEM', 'ADMIN', 'USER'] },

    // Crisis Management
    { action: 'ACTIVATE_CRISIS', resource: 'crisis', levels: ['SYSTEM', 'ADMIN'] },
    { action: 'DEACTIVATE_CRISIS', resource: 'crisis', levels: ['SYSTEM', 'ADMIN'] },

    // Override Controls
    { action: 'OVERRIDE_DECISION', resource: 'override', levels: ['ADMIN'] },
    { action: 'SILENCE_OPTIMUS', resource: 'override', levels: ['ADMIN', 'USER'] },
    { action: 'SILENCE_OPTIMUS', resource: 'override', levels: ['ADMIN', 'USER'] },
    { action: 'RESET_FAILSAFE', resource: 'override', levels: ['SYSTEM', 'ADMIN'] },

    // AI & Advice
    { action: 'ADVISE', resource: 'ai', levels: ['SYSTEM', 'ADMIN', 'USER', 'GUEST'] },
    { action: 'AI_TASK', resource: 'ai', levels: ['SYSTEM', 'ADMIN', 'USER', 'GUEST'] }
];

// ============================================
// AUTHORITY MATRIX CLASS
// ============================================

class OptimusAuthorityMatrix {
    private permissions: Permission[] = PERMISSIONS;
    private currentLevel: AuthorityLevel = 'USER';

    /**
     * Set current authority level
     */
    setCurrentLevel(level: AuthorityLevel): void {
        this.currentLevel = level;
        console.log(`[AuthorityMatrix] Level set to: ${level}`);
    }

    /**
     * Get current authority level
     */
    getCurrentLevel(): AuthorityLevel {
        return this.currentLevel;
    }

    /**
     * Check if action is authorized
     */
    check(action: string, resource?: string): AuthorityCheck {
        // Find matching permission
        const permission = this.findPermission(action, resource);

        if (!permission) {
            // No permission defined = default deny for safety
            return {
                requiredLevel: 'SYSTEM',
                currentLevel: this.currentLevel,
                action,
                resource: resource || 'unknown',
                granted: false,
                reason: 'No permission defined for this action'
            };
        }

        // Check if current level is in allowed levels
        const granted = permission.levels.includes(this.currentLevel);
        const requiredLevel = permission.levels[permission.levels.length - 1]; // Highest required

        return {
            requiredLevel: requiredLevel as AuthorityLevel,
            currentLevel: this.currentLevel,
            action,
            resource: permission.resource,
            granted,
            reason: granted
                ? 'Authorization granted'
                : `Requires ${requiredLevel} level, current is ${this.currentLevel}`
        };
    }

    /**
     * Quick authorization check
     */
    isAuthorized(action: string, resource?: string): boolean {
        return this.check(action, resource).granted;
    }

    /**
     * Find permission by action and optional resource
     */
    private findPermission(action: string, resource?: string): Permission | undefined {
        // First try exact match
        let perm = this.permissions.find(p =>
            p.action === action && (!resource || p.resource === resource)
        );

        if (perm) return perm;

        // Try partial match (for composite actions)
        for (const p of this.permissions) {
            if (action.includes(p.action) || p.action.includes(action)) {
                return p;
            }
        }

        return undefined;
    }

    /**
     * Get all permissions for a level
     */
    getPermissionsForLevel(level: AuthorityLevel): Permission[] {
        return this.permissions.filter(p => p.levels.includes(level));
    }

    /**
     * Get required level for an action
     */
    getRequiredLevel(action: string): AuthorityLevel {
        const permission = this.findPermission(action);
        if (!permission) return 'SYSTEM';

        // Return the minimum required level
        const order: AuthorityLevel[] = ['GUEST', 'USER', 'ADMIN', 'SYSTEM'];
        for (const level of order) {
            if (permission.levels.includes(level)) {
                return level;
            }
        }
        return 'SYSTEM';
    }

    /**
     * Add a new permission
     */
    addPermission(permission: Permission): void {
        this.permissions.push(permission);
    }

    /**
     * Remove a permission
     */
    removePermission(action: string, resource: string): boolean {
        const index = this.permissions.findIndex(
            p => p.action === action && p.resource === resource
        );
        if (index !== -1) {
            this.permissions.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Get all permissions
     */
    getAllPermissions(): Permission[] {
        return [...this.permissions];
    }

    /**
     * Get level hierarchy
     */
    getLevelHierarchy(): AuthorityLevel[] {
        return ['SYSTEM', 'ADMIN', 'USER', 'GUEST'];
    }

    /**
     * Check if level A has higher authority than level B
     */
    isHigherAuthority(levelA: AuthorityLevel, levelB: AuthorityLevel): boolean {
        const hierarchy = this.getLevelHierarchy();
        return hierarchy.indexOf(levelA) < hierarchy.indexOf(levelB);
    }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const authorityMatrix = new OptimusAuthorityMatrix();
export default authorityMatrix;
