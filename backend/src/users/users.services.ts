import { getDbPool } from '../db/config.js';
import type { User } from '../types.js';
import sql from 'mssql';

export const getAllUsersService = async (): Promise<User[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT UserId, RoleId, FirstName, LastName, Phone, Email, 
               IsActive, IsDeleted, ProfilePicture, CreatedAt, UpdatedAt, LastLogin
        FROM Users
        WHERE IsDeleted = 0
    `);
    return result.recordset;
};

export const getUserByIdService = async (userId: string): Promise<User | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query(`
            SELECT UserId, RoleId, FirstName, LastName, Phone, Email, 
                   IsActive, IsDeleted, ProfilePicture, CreatedAt, UpdatedAt, LastLogin
            FROM Users 
            WHERE UserId = @UserId AND IsDeleted = 0
        `);
    return result.recordset[0] || null;
};

export const getUserByEmailService = async (email: string): Promise<User | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('Email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE Email = @Email AND IsDeleted = 0');
    return result.recordset[0] || null;
};

export const createUserService = async (
    roleId: number,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    phone: string | null
): Promise<User | null> => {
    const db = getDbPool();
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
    return result.recordset[0] || null;
};

export const updateUserService = async (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string | null
): Promise<User | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .input('FirstName', sql.NVarChar, firstName)
        .input('LastName', sql.NVarChar, lastName)
        .input('Email', sql.NVarChar, email)
        .input('Phone', sql.NVarChar, phone)
        .query(`
            UPDATE Users 
            SET FirstName = @FirstName, LastName = @LastName, 
                Email = @Email, Phone = @Phone, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE UserId = @UserId AND IsDeleted = 0
        `);
    return result.recordset[0] || null;
};

export const deleteUserService = async (userId: string): Promise<User | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query(`
            UPDATE Users 
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE UserId = @UserId
        `);
    return result.recordset[0] || null;
};

export const getStaffByRoleService = async (roleName: string): Promise<User[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('RoleName', sql.NVarChar, roleName)
        .query(`
            SELECT u.UserId, u.RoleId, u.FirstName, u.LastName, u.Phone, u.Email,
                   u.IsActive, u.ProfilePicture, u.CreatedAt
            FROM Users u
            INNER JOIN Roles r ON u.RoleId = r.RoleId
            WHERE r.Name = @RoleName AND u.IsActive = 1 AND u.IsDeleted = 0
        `);
    return result.recordset;
};
