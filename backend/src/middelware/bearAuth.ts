import { type Context, type Next } from 'hono';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (c: Context, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'No token provided' }, 401);
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // Attach user info to context
        c.set('user', decoded);
        
        await next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return c.json({ error: 'Token expired' }, 401);
        }
        return c.json({ error: 'Invalid token' }, 401);
    }
};

// Role-based middleware
export const requireRole = (...allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user');
        
        if (!user || !allowedRoles.includes(user.roleName)) {
            return c.json({ error: 'Insufficient permissions' }, 403);
        }
        
        await next();
    };
};