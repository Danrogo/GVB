import { getDbPool } from '../db/config.js';
import type { Review } from '../types.js';
import sql from 'mssql';

export const getAllReviewsService = async (): Promise<Review[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT r.*, 
               u1.FirstName + ' ' + u1.LastName as CustomerName,
               u2.FirstName + ' ' + u2.LastName as StaffName,
               s.Name as ServiceName
        FROM Reviews r
        INNER JOIN Users u1 ON r.CustomerId = u1.UserId
        LEFT JOIN Users u2 ON r.StaffId = u2.UserId
        INNER JOIN Services s ON r.ServiceId = s.ServiceId
        WHERE r.IsDeleted = 0
        ORDER BY r.CreatedAt DESC
    `);
    return result.recordset;
};

export const getReviewByIdService = async (reviewId: string): Promise<Review | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('ReviewId', sql.Int, reviewId)
        .query(`
            SELECT r.*, 
                   u1.FirstName + ' ' + u1.LastName as CustomerName,
                   u2.FirstName + ' ' + u2.LastName as StaffName,
                   s.Name as ServiceName
            FROM Reviews r
            INNER JOIN Users u1 ON r.CustomerId = u1.UserId
            LEFT JOIN Users u2 ON r.StaffId = u2.UserId
            INNER JOIN Services s ON r.ServiceId = s.ServiceId
            WHERE r.ReviewId = @ReviewId AND r.IsDeleted = 0
        `);
    return result.recordset[0] || null;
};

export const getReviewsByServiceService = async (serviceId: string): Promise<Review[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('ServiceId', sql.Int, serviceId)
        .query(`
            SELECT r.*, u.FirstName + ' ' + u.LastName as CustomerName
            FROM Reviews r
            INNER JOIN Users u ON r.CustomerId = u.UserId
            WHERE r.ServiceId = @ServiceId AND r.IsApproved = 1 AND r.IsDeleted = 0
            ORDER BY r.CreatedAt DESC
        `);
    return result.recordset;
};

export const getReviewsByStaffService = async (staffId: string): Promise<Review[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .query(`
            SELECT r.*, u.FirstName + ' ' + u.LastName as CustomerName, s.Name as ServiceName
            FROM Reviews r
            INNER JOIN Users u ON r.CustomerId = u.UserId
            INNER JOIN Services s ON r.ServiceId = s.ServiceId
            WHERE r.StaffId = @StaffId AND r.IsApproved = 1 AND r.IsDeleted = 0
            ORDER BY r.CreatedAt DESC
        `);
    return result.recordset;
};

export const createReviewService = async (
    bookingId: number,
    customerId: number,
    staffId: number | null,
    serviceId: number,
    rating: number,
    comment: string | null
): Promise<Review | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .input('CustomerId', sql.Int, customerId)
        .input('StaffId', sql.Int, staffId)
        .input('ServiceId', sql.Int, serviceId)
        .input('Rating', sql.Int, rating)
        .input('Comment', sql.NVarChar, comment)
        .query(`
            INSERT INTO Reviews (BookingId, CustomerId, StaffId, ServiceId, Rating, Comment)
            OUTPUT INSERTED.*
            VALUES (@BookingId, @CustomerId, @StaffId, @ServiceId, @Rating, @Comment)
        `);
    return result.recordset[0] || null;
};

export const approveReviewService = async (reviewId: string): Promise<Review | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('ReviewId', sql.Int, reviewId)
        .query(`
            UPDATE Reviews 
            SET IsApproved = 1, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE ReviewId = @ReviewId
        `);
    return result.recordset[0] || null;
};

export const deleteReviewService = async (reviewId: string): Promise<Review | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('ReviewId', sql.Int, reviewId)
        .query(`
            UPDATE Reviews 
            SET IsDeleted = 1, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE ReviewId = @ReviewId
        `);
    return result.recordset[0] || null;
};