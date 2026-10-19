import { getDbPool } from '../db/config.js';
import type { Payment } from '../types.js';
import sql from 'mssql';

export const getAllPaymentsService = async (): Promise<Payment[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT p.*, 
               pm.Name as PaymentMethod,
               ps.Name as PaymentStatus,
               b.BookingId,
               u.FirstName + ' ' + u.LastName as CustomerName
        FROM Payments p
        INNER JOIN PaymentMethods pm ON p.MethodId = pm.MethodId
        INNER JOIN PaymentStatuses ps ON p.StatusId = ps.StatusId
        INNER JOIN Bookings b ON p.BookingId = b.BookingId
        INNER JOIN Users u ON b.CustomerId = u.UserId
        ORDER BY p.CreatedAt DESC
    `);
    return result.recordset;
};

export const getPaymentByIdService = async (paymentId: string): Promise<Payment | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('PaymentId', sql.Int, paymentId)
        .query(`
            SELECT p.*, 
                   pm.Name as PaymentMethod,
                   ps.Name as PaymentStatus
            FROM Payments p
            INNER JOIN PaymentMethods pm ON p.MethodId = pm.MethodId
            INNER JOIN PaymentStatuses ps ON p.StatusId = ps.StatusId
            WHERE p.PaymentId = @PaymentId
        `);
    return result.recordset[0] || null;
};

export const getPaymentsByBookingService = async (bookingId: string): Promise<Payment[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .query(`
            SELECT p.*, 
                   pm.Name as PaymentMethod,
                   ps.Name as PaymentStatus
            FROM Payments p
            INNER JOIN PaymentMethods pm ON p.MethodId = pm.MethodId
            INNER JOIN PaymentStatuses ps ON p.StatusId = ps.StatusId
            WHERE p.BookingId = @BookingId
            ORDER BY p.CreatedAt DESC
        `);
    return result.recordset;
};

export const createPaymentService = async (
    bookingId: number,
    amount: number,
    methodId: number,
    transactionRef: string | null
): Promise<Payment | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .input('Amount', sql.Decimal(12, 2), amount)
        .input('MethodId', sql.Int, methodId)
        .input('StatusId', sql.Int, 1) // Pending
        .input('TransactionRef', sql.NVarChar, transactionRef)
        .query(`
            INSERT INTO Payments (BookingId, Amount, MethodId, StatusId, TransactionRef)
            OUTPUT INSERTED.*
            VALUES (@BookingId, @Amount, @MethodId, @StatusId, @TransactionRef)
        `);
    return result.recordset[0] || null;
};

export const updatePaymentStatusService = async (
    paymentId: string,
    statusId: number
): Promise<Payment | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('PaymentId', sql.Int, paymentId)
        .input('StatusId', sql.Int, statusId)
        .input('PaidAt', sql.DateTime2, statusId === 2 ? new Date() : null)
        .query(`
            UPDATE Payments 
            SET StatusId = @StatusId, PaidAt = @PaidAt
            OUTPUT INSERTED.*
            WHERE PaymentId = @PaymentId
        `);
    return result.recordset[0] || null;
};

export const refundPaymentService = async (
    paymentId: string,
    refundAmount: number
): Promise<Payment | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('PaymentId', sql.Int, paymentId)
        .input('RefundAmount', sql.Decimal(12, 2), refundAmount)
        .query(`
            UPDATE Payments 
            SET StatusId = 4, RefundAmount = @RefundAmount, RefundedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE PaymentId = @PaymentId
        `);
    return result.recordset[0] || null;
};