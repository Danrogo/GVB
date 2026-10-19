import { getDbPool } from '../db/config.js';
import type { SupportTicket } from '../types.js';
import sql from 'mssql';

export const getAllTicketsService = async (): Promise<SupportTicket[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT st.*, 
               u1.FirstName + ' ' + u1.LastName as CustomerName,
               u2.FirstName + ' ' + u2.LastName as AssignedToName,
               ts.Name as StatusName
        FROM SupportTickets st
        INNER JOIN Users u1 ON st.CustomerId = u1.UserId
        LEFT JOIN Users u2 ON st.AssignedToId = u2.UserId
        INNER JOIN TicketStatuses ts ON st.StatusId = ts.StatusId
        ORDER BY st.CreatedAt DESC
    `);
    return result.recordset;
};

export const getTicketByIdService = async (ticketId: string): Promise<SupportTicket | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('TicketId', sql.Int, ticketId)
        .query(`
            SELECT st.*, 
                   u1.FirstName + ' ' + u1.LastName as CustomerName,
                   u2.FirstName + ' ' + u2.LastName as AssignedToName,
                   ts.Name as StatusName
            FROM SupportTickets st
            INNER JOIN Users u1 ON st.CustomerId = u1.UserId
            LEFT JOIN Users u2 ON st.AssignedToId = u2.UserId
            INNER JOIN TicketStatuses ts ON st.StatusId = ts.StatusId
            WHERE st.TicketId = @TicketId
        `);
    return result.recordset[0] || null;
};

export const getTicketsByCustomerService = async (customerId: string): Promise<SupportTicket[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('CustomerId', sql.Int, customerId)
        .query(`
            SELECT st.*, ts.Name as StatusName
            FROM SupportTickets st
            INNER JOIN TicketStatuses ts ON st.StatusId = ts.StatusId
            WHERE st.CustomerId = @CustomerId
            ORDER BY st.CreatedAt DESC
        `);
    return result.recordset;
};

export const getTicketMessagesService = async (ticketId: string) => {
    const db = getDbPool();
    const result = await db.request()
        .input('TicketId', sql.Int, ticketId)
        .query(`
            SELECT tm.*, u.FirstName + ' ' + u.LastName as SenderName
            FROM TicketMessages tm
            INNER JOIN Users u ON tm.SenderId = u.UserId
            WHERE tm.TicketId = @TicketId
            ORDER BY tm.CreatedAt ASC
        `);
    return result.recordset;
};

export const createTicketService = async (
    customerId: number,
    subject: string,
    description: string,
    priority: string
): Promise<SupportTicket | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('CustomerId', sql.Int, customerId)
        .input('Subject', sql.NVarChar, subject)
        .input('Description', sql.NVarChar, description)
        .input('Priority', sql.NVarChar, priority)
        .query(`
            INSERT INTO SupportTickets (CustomerId, Subject, Description, Priority)
            OUTPUT INSERTED.*
            VALUES (@CustomerId, @Subject, @Description, @Priority)
        `);
    return result.recordset[0] || null;
};

export const addTicketMessageService = async (
    ticketId: number,
    senderId: number,
    message: string,
    isInternal: boolean
) => {
    const db = getDbPool();
    const result = await db.request()
        .input('TicketId', sql.Int, ticketId)
        .input('SenderId', sql.Int, senderId)
        .input('Message', sql.NVarChar, message)
        .input('IsInternal', sql.Bit, isInternal)
        .query(`
            INSERT INTO TicketMessages (TicketId, SenderId, Message, IsInternal)
            OUTPUT INSERTED.*
            VALUES (@TicketId, @SenderId, @Message, @IsInternal)
        `);
    
    // Update ticket's UpdatedAt
    await db.request()
        .input('TicketId', sql.Int, ticketId)
        .query('UPDATE SupportTickets SET UpdatedAt = GETUTCDATE() WHERE TicketId = @TicketId');
    
    return result.recordset[0] || null;
};

export const updateTicketStatusService = async (
    ticketId: string,
    statusId: number
): Promise<SupportTicket | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('TicketId', sql.Int, ticketId)
        .input('StatusId', sql.Int, statusId)
        .input('ClosedAt', sql.DateTime2, statusId === 5 ? new Date() : null)
        .query(`
            UPDATE SupportTickets 
            SET StatusId = @StatusId, UpdatedAt = GETUTCDATE(), ClosedAt = @ClosedAt
            OUTPUT INSERTED.*
            WHERE TicketId = @TicketId
        `);
    return result.recordset[0] || null;
};

export const assignTicketService = async (
    ticketId: string,
    assignedToId: number
): Promise<SupportTicket | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('TicketId', sql.Int, ticketId)
        .input('AssignedToId', sql.Int, assignedToId)
        .query(`
            UPDATE SupportTickets 
            SET AssignedToId = @AssignedToId, UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE TicketId = @TicketId
        `);
    return result.recordset[0] || null;
};
