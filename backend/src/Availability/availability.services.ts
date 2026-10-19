import { getDbPool } from '../db/config.js';
import type { StaffAvailability } from '../types.js';
import sql from 'mssql';

export const getStaffAvailabilityService = async (staffId: string): Promise<StaffAvailability[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .query(`
            SELECT * FROM StaffAvailability 
            WHERE StaffId = @StaffId AND IsAvailable = 1
            ORDER BY DayOfWeek
        `);
    return result.recordset;
};

export const getStaffTimeOffService = async (staffId: string) => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .query(`
            SELECT * FROM StaffTimeOff 
            WHERE StaffId = @StaffId AND IsApproved = 1
            AND EndDate >= CAST(GETUTCDATE() AS DATE)
            ORDER BY StartDate
        `);
    return result.recordset;
};

export const addStaffAvailabilityService = async (
    staffId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
): Promise<StaffAvailability | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .input('DayOfWeek', sql.Int, dayOfWeek)
        .input('StartTime', sql.Time, startTime)
        .input('EndTime', sql.Time, endTime)
        .query(`
            INSERT INTO StaffAvailability (StaffId, DayOfWeek, StartTime, EndTime)
            OUTPUT INSERTED.*
            VALUES (@StaffId, @DayOfWeek, @StartTime, @EndTime)
        `);
    return result.recordset[0] || null;
};

export const updateStaffAvailabilityService = async (
    availabilityId: string,
    startTime: string,
    endTime: string,
    isAvailable: boolean
): Promise<StaffAvailability | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('AvailabilityId', sql.Int, availabilityId)
        .input('StartTime', sql.Time, startTime)
        .input('EndTime', sql.Time, endTime)
        .input('IsAvailable', sql.Bit, isAvailable)
        .query(`
            UPDATE StaffAvailability 
            SET StartTime = @StartTime, EndTime = @EndTime, IsAvailable = @IsAvailable
            OUTPUT INSERTED.*
            WHERE AvailabilityId = @AvailabilityId
        `);
    return result.recordset[0] || null;
};

export const requestTimeOffService = async (
    staffId: number,
    startDate: string,
    endDate: string,
    reason: string | null
) => {
    const db = getDbPool();
    const result = await db.request()
        .input('StaffId', sql.Int, staffId)
        .input('StartDate', sql.Date, startDate)
        .input('EndDate', sql.Date, endDate)
        .input('Reason', sql.NVarChar, reason)
        .query(`
            INSERT INTO StaffTimeOff (StaffId, StartDate, EndDate, Reason)
            OUTPUT INSERTED.*
            VALUES (@StaffId, @StartDate, @EndDate, @Reason)
        `);
    return result.recordset[0] || null;
};

export const approveTimeOffService = async (timeOffId: string) => {
    const db = getDbPool();
    const result = await db.request()
        .input('TimeOffId', sql.Int, timeOffId)
        .query(`
            UPDATE StaffTimeOff 
            SET IsApproved = 1
            OUTPUT INSERTED.*
            WHERE TimeOffId = @TimeOffId
        `);
    return result.recordset[0] || null;
};
