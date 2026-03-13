import jwt from 'jsonwebtoken';

export class OptimusAuth {
    private secretKey: string;
    private static instance: OptimusAuth;

    constructor() {
        this.secretKey = process.env.AUTH_SECRET || 'dev-secret-change-in-production';
    }

    public static getInstance(): OptimusAuth {
        if (!OptimusAuth.instance) {
            OptimusAuth.instance = new OptimusAuth();
        }
        return OptimusAuth.instance;
    }

    // FIX: JWT token generation
    public generateToken(userId: string, permissions: string[]): string {
        return jwt.sign(
            { userId, permissions, iat: Date.now() },
            this.secretKey,
            { expiresIn: '24h' }
        );
    }

    // FIX: Middleware for API routes (Mocking NextRequest type to avoid dependency issues in this pure class)
    public authenticate(reqHeaders: Headers): boolean {
        const token = reqHeaders.get('authorization')?.split(' ')[1];
        if (!token) return false;

        try {
            jwt.verify(token, this.secretKey);
            return true;
        } catch {
            return false;
        }
    }

    // FIX: Role-based access control
    public hasPermission(token: string, requiredPermission: string): boolean {
        try {
            const decoded = jwt.decode(token) as any;
            return decoded?.permissions?.includes(requiredPermission) || false;
        } catch {
            return false;
        }
    }
}
