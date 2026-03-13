"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimusAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class OptimusAuth {
    constructor() {
        this.secretKey = process.env.AUTH_SECRET || 'dev-secret-change-in-production';
    }
    static getInstance() {
        if (!OptimusAuth.instance) {
            OptimusAuth.instance = new OptimusAuth();
        }
        return OptimusAuth.instance;
    }
    // FIX: JWT token generation
    generateToken(userId, permissions) {
        return jsonwebtoken_1.default.sign({ userId, permissions, iat: Date.now() }, this.secretKey, { expiresIn: '24h' });
    }
    // FIX: Middleware for API routes (Mocking NextRequest type to avoid dependency issues in this pure class)
    authenticate(reqHeaders) {
        var _a;
        const token = (_a = reqHeaders.get('authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return false;
        try {
            jsonwebtoken_1.default.verify(token, this.secretKey);
            return true;
        }
        catch (_b) {
            return false;
        }
    }
    // FIX: Role-based access control
    hasPermission(token, requiredPermission) {
        var _a;
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return ((_a = decoded === null || decoded === void 0 ? void 0 : decoded.permissions) === null || _a === void 0 ? void 0 : _a.includes(requiredPermission)) || false;
        }
        catch (_b) {
            return false;
        }
    }
}
exports.OptimusAuth = OptimusAuth;
