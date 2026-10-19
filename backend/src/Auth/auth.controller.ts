import { type Context } from 'hono';
import * as authServices from './auth.services.js';

export const login = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.email || !body.password) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['email', 'password'] 
            }, 400);
        }

        const result = await authServices.loginService(body.email, body.password);
        
        if (result === null) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        return c.json({ 
            message: 'Login successful',
            ...result
        }, 200);
    } catch (error: any) {
        console.error('Login error:', error.message);
        return c.json({ error: 'Login failed' }, 500);
    }
};

export const register = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.firstName || !body.lastName || !body.email || !body.password) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['firstName', 'lastName', 'email', 'password'] 
            }, 400);
        }

        // Validate password strength
        if (body.password.length < 8) {
            return c.json({ 
                error: 'Password must be at least 8 characters long' 
            }, 400);
        }

        const result = await authServices.registerService(
            body.roleId || 6, // Default to Customer role
            body.firstName,
            body.lastName,
            body.email,
            body.password,
            body.phone || null
        );

        if (result === null) {
            return c.json({ error: 'Registration failed' }, 500);
        }

        return c.json({ 
            message: 'Registration successful',
            ...result
        }, 201);
    } catch (error: any) {
        if (error.message === 'Email already exists') {
            return c.json({ error: 'Email already exists' }, 409);
        }
        console.error('Registration error:', error.message);
        return c.json({ error: 'Registration failed' }, 500);
    }
};

export const changePassword = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.userId || !body.currentPassword || !body.newPassword) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['userId', 'currentPassword', 'newPassword'] 
            }, 400);
        }

        // Validate new password strength
        if (body.newPassword.length < 8) {
            return c.json({ 
                error: 'New password must be at least 8 characters long' 
            }, 400);
        }

        const success = await authServices.changePasswordService(
            body.userId,
            body.currentPassword,
            body.newPassword
        );

        if (!success) {
            return c.json({ error: 'Current password is incorrect' }, 401);
        }

        return c.json({ message: 'Password changed successfully' }, 200);
    } catch (error: any) {
        console.error('Change password error:', error.message);
        return c.json({ error: 'Failed to change password' }, 500);
    }
};

export const verifyToken = async (c: Context) => {
    try {
        const authHeader = c.req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'No token provided' }, 401);
        }

        const token = authHeader.substring(7);
        const decoded = authServices.verifyTokenService(token);

        if (!decoded) {
            return c.json({ error: 'Invalid or expired token' }, 401);
        }

        return c.json({ 
            message: 'Token is valid',
            user: decoded
        }, 200);
    } catch (error: any) {
        console.error('Token verification error:', error.message);
        return c.json({ error: 'Token verification failed' }, 500);
    }
};

export const logout = async (c: Context) => {
    // In a stateless JWT setup, logout is typically handled client-side
    // by removing the token. However, you can implement token blacklisting
    // if needed for added security.
    return c.json({ message: 'Logout successful' }, 200);
};