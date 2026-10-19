// =============================================
// src/auth/auth.services.ts
// =============================================
import { getDbPool } from '../db/config.js';
import type { User } from '../types.js';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface LoginResponse {
    user: Omit<User, 'PasswordHash'>;
    token: string;
}

export const loginService = async (email: string, password: string): Promise<LoginResponse | null> => {
    const db = getDbPool();
    
    // Get user with password
    const result = await db.request()
        .input('Email', sql.NVarChar, email)
        .query(`
            SELECT u.*, r.Name as RoleName
            FROM Users u
            INNER JOIN Roles r ON u.RoleId = r.RoleId
            WHERE u.Email = @Email AND u.IsActive = 1 AND u.IsDeleted = 0
        `);
    
    const user = result.recordset[0];
    
    if (!user) {
        return null;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
    
    if (!isPasswordValid) {
        return null;
    }
    
    // Update last login
    await db.request()
        .input('UserId', sql.Int, user.UserId)
        .query('UPDATE Users SET LastLogin = GETUTCDATE() WHERE UserId = @UserId');
    
    // Generate JWT token
    const token = jwt.sign(
        { 
            userId: user.UserId, 
            email: user.Email,
            roleId: user.RoleId,
            roleName: user.RoleName
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
    
    // Remove password from response
    const { PasswordHash, ...userWithoutPassword } = user;
    
    return {
        user: userWithoutPassword,
        token
    };
};

export const registerService = async (
    roleId: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string | null
): Promise<LoginResponse | null> => {
    const db = getDbPool();
    
    // Check if email already exists
    const existingUser = await db.request()
        .input('Email', sql.NVarChar, email)
        .query('SELECT UserId FROM Users WHERE Email = @Email');
    
    if (existingUser.recordset.length > 0) {
        throw new Error('Email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.request()
        .input('RoleId', sql.Int, roleId)
        .input('FirstName', sql.NVarChar, firstName)
        .input('LastName', sql.NVarChar, lastName)
        .input('Email', sql.NVarChar, email)
        .input('PasswordHash', sql.NVarChar, passwordHash)
        .input('Phone', sql.NVarChar, phone)
        .query(`
            INSERT INTO Users (RoleId, FirstName, LastName, Email, PasswordHash, Phone)
            OUTPUT INSERTED.*
            VALUES (@RoleId, @FirstName, @LastName, @Email, @PasswordHash, @Phone)
        `);
    
    const newUser = result.recordset[0];
    
    // Get role name
    const roleResult = await db.request()
        .input('RoleId', sql.Int, roleId)
        .query('SELECT Name FROM Roles WHERE RoleId = @RoleId');
    
    const roleName = roleResult.recordset[0]?.Name;
    
    // Generate JWT token
    const token = jwt.sign(
        { 
            userId: newUser.UserId, 
            email: newUser.Email,
            roleId: newUser.RoleId,
            roleName: roleName
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
    
    // Remove password from response
    const { PasswordHash, ...userWithoutPassword } = newUser;
    
    return {
        user: { ...userWithoutPassword, RoleName: roleName },
        token
    };
};

export const changePasswordService = async (
    userId: number,
    currentPassword: string,
    newPassword: string
): Promise<boolean> => {
    const db = getDbPool();
    
    // Get current password hash
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query('SELECT PasswordHash FROM Users WHERE UserId = @UserId AND IsDeleted = 0');
    
    const user = result.recordset[0];
    
    if (!user) {
        return false;
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash);
    
    if (!isPasswordValid) {
        return false;
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.request()
        .input('UserId', sql.Int, userId)
        .input('PasswordHash', sql.NVarChar, newPasswordHash)
        .query(`
            UPDATE Users 
            SET PasswordHash = @PasswordHash, UpdatedAt = GETUTCDATE()
            WHERE UserId = @UserId
        `);
    
    return true;
};

export const verifyTokenService = (token: string): any => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        return null;
    }
};