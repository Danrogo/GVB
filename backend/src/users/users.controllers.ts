import { type Context } from 'hono';
import * as userServices from './users.services.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (c: Context) => {
    try {
        const result = await userServices.getAllUsersService();
        if (result.length === 0) {
            return c.json({ message: 'No users found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching users:', error.message);
        return c.json({ error: 'Failed to fetch users' }, 500);
    }
};

export const getUserById = async (c: Context) => {
    const userId = c.req.param('userId');
    try {
        const result = await userServices.getUserByIdService(userId);
        if (result === null) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching user:', error);
        return c.json({ error: 'Failed to fetch user' }, 500);
    }
};

export const createUser = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.firstName || !body.lastName || !body.email || !body.password) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['firstName', 'lastName', 'email', 'password'] 
            }, 400);
        }

        const existingUser = await userServices.getUserByEmailService(body.email);
        if (existingUser) {
            return c.json({ error: 'User with this email already exists' }, 409);
        }

        const passwordHash = await bcrypt.hash(body.password, 10);
        const result = await userServices.createUserService(
            body.roleId || 6, // Default to Customer role
            body.firstName,
            body.lastName,
            body.email,
            passwordHash,
            body.phone || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to create user' }, 500);
        }

        const { PasswordHash, ...userWithoutPassword } = result;
        return c.json({ 
            message: 'User created successfully', 
            user: userWithoutPassword 
        }, 201);
    } catch (error: any) {
        console.error('Error creating user:', error.message);
        return c.json({ error: 'Failed to create user' }, 500);
    }
};

export const updateUser = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const body = await c.req.json();

        const checkExists = await userServices.getUserByIdService(userId);
        if (checkExists === null) {
            return c.json({ error: 'User not found' }, 404);
        }

        const result = await userServices.updateUserService(
            userId, 
            body.firstName, 
            body.lastName, 
            body.email, 
            body.phone
        );

        if (result === null) {
            return c.json({ error: 'Failed to update user' }, 404);
        }

        return c.json({ message: 'User updated successfully', user: result }, 200);
    } catch (error) {
        console.error('Error updating user:', error);
        return c.json({ error: 'Failed to update user' }, 500);
    }
};

export const deleteUser = async (c: Context) => {
    const userId = c.req.param('userId');
    try {
        const check = await userServices.getUserByIdService(userId);
        if (check === null) {
            return c.json({ error: 'User not found' }, 404);
        }

        const result = await userServices.deleteUserService(userId);
        if (result === null) {
            return c.json({ error: 'Failed to delete user' }, 404);
        }

        return c.json({ message: 'User deleted successfully' }, 200);
    } catch (error) {
        console.error('Error deleting user:', error);
        return c.json({ error: 'Failed to delete user' }, 500);
    }
};

export const getStaffByRole = async (c: Context) => {
    const role = c.req.param('role');
    try {
        const result = await userServices.getStaffByRoleService(role);
        if (result.length === 0) {
            return c.json({ message: `No ${role} found` }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return c.json({ error: 'Failed to fetch staff' }, 500);
    }
};