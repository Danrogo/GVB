import { getDbPool } from '../db/config.js';
import type { Booking } from '../types.js';
import sql from 'mssql';

export const getAllBookingsService = async (): Promise<Booking[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT b.*, 
               u1.FirstName + ' ' + u1.LastName as CustomerName,
               u2.FirstName + ' ' + u2.LastName as StaffName,
               s.Name as ServiceName,
               bs.Name as StatusName
        FROM Bookings b
        INNER JOIN Users u1 ON b.CustomerId = u1.UserId
        LEFT JOIN Users u2 ON b.StaffId = u2.UserId
        INNER JOIN Services s ON b.ServiceId = s.ServiceId
        INNER JOIN BookingStatuses bs ON b.StatusId = bs.StatusId
        ORDER BY b.BookingDate DESC, b.StartTime DESC
    `);
    return result.recordset;
};

export const getBookingByIdService = async (bookingId: string): Promise<Booking | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .query(`
            SELECT b.*, 
                   u1.FirstName + ' ' + u1.LastName as CustomerName,
                   u2.FirstName + ' ' + u2.LastName as StaffName,
                   s.Name as ServiceName,
                   bs.Name as StatusName
            FROM Bookings b
            INNER JOIN Users u1 ON b.CustomerId = u1.UserId
            LEFT JOIN Users u2 ON b.StaffId = u2.UserId
            INNER JOIN Services s ON b.ServiceId = s.ServiceId
            INNER JOIN BookingStatuses bs ON b.StatusId = bs.StatusId
            WHERE b.BookingId = @BookingId
        `);
    return result.recordset[0] || null;
};

export const getBookingsByCustomerService = async (customerId: string): Promise<Booking[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('CustomerId', sql.Int, customerId)
        .query(`
            SELECT b.*, s.Name as ServiceName, bs.Name as StatusName,
                   u.FirstName + ' ' + u.LastName as StaffName
            FROM Bookings b
            INNER JOIN Services s ON b.ServiceId = s.ServiceId
            INNER JOIN BookingStatuses bs ON b.StatusId = bs.StatusId
            LEFT JOIN Users u ON b.StaffId = u.UserId
            WHERE b.CustomerId = @CustomerId
            ORDER BY b.BookingDate DESC, b.StartTime DESC
        `);
    return result.recordset;
};

export const getBookingsByStaffService = async (staffId: string): Promise<Booking[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .query(`
            SELECT b.*, s.Name as ServiceName, bs.Name as StatusName,
                   u.FirstName + ' ' + u.LastName as CustomerName
            FROM Bookings b
            INNER JOIN Services s ON b.ServiceId = s.ServiceId
            INNER JOIN BookingStatuses bs ON b.StatusId = bs.StatusId
            INNER JOIN Users u ON b.CustomerId = u.UserId
            WHERE b.StaffId = @StaffId
            ORDER BY b.BookingDate DESC, b.StartTime DESC
        `);
    return result.recordset;
};

const timeToDate = (time: string): Date => {
    const [h, m, s] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, s ?? 0, 0);
    return d;
};

// Helper to convert "YYYY-MM-DD" to a Date object for sql.Date
const dateToDate = (date: string): Date => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const createBookingService = async (
    customerId: number,
    serviceId: number,
    staffId: number | null,
    bookingDate: string,
    startTime: string,
    endTime: string,
    notes: string | null,
    totalPrice: number,
    depositPaid: number
): Promise<Booking | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('CustomerId', sql.Int, customerId)
        .input('ServiceId', sql.Int, serviceId)
        .input('StaffId', sql.Int, staffId)
        .input('StatusId', sql.Int, 1) // Pending
        .input('BookingDate', sql.Date, dateToDate(bookingDate))  // ← fixed
        .input('StartTime', sql.Time, timeToDate(startTime))      // ← fixed
        .input('EndTime', sql.Time, timeToDate(endTime))          // ← fixed
        .input('Notes', sql.NVarChar, notes)
        .input('TotalPrice', sql.Decimal(12, 2), totalPrice)
        .input('DepositPaid', sql.Decimal(12, 2), depositPaid)
        .query(`
            INSERT INTO Bookings (CustomerId, ServiceId, StaffId, StatusId, BookingDate, 
                                  StartTime, EndTime, Notes, TotalPrice, DepositPaid)
            OUTPUT INSERTED.*
            VALUES (@CustomerId, @ServiceId, @StaffId, @StatusId, @BookingDate, 
                    @StartTime, @EndTime, @Notes, @TotalPrice, @DepositPaid)
        `);
    return result.recordset[0] || null;
};

export const updateBookingStatusService = async (
    bookingId: string,
    statusId: number
): Promise<Booking | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .input('StatusId', sql.Int, statusId)
        .query(`
            UPDATE Bookings 
            SET StatusId = @StatusId, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE BookingId = @BookingId
        `);
    return result.recordset[0] || null;
};

export const cancelBookingService = async (
    bookingId: string,
    reason: string
): Promise<Booking | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('BookingId', sql.Int, bookingId)
        .input('Reason', sql.NVarChar, reason)
        .query(`
            UPDATE Bookings 
            SET StatusId = 5, CancelledAt = GETUTCDATE(), 
                CancellationReason = @Reason, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE BookingId = @BookingId
        `);
    return result.recordset[0] || null;
};