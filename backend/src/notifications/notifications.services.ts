import { getDbPool } from '../db/config.js';
import type { Notification } from '../types.js';
import sql from 'mssql';

export const getAllNotificationsService = async (): Promise<Notification[]> => {
    const db = getDbPool();
    const result = await db.request().query(`
        SELECT n.*, nt.Name as NotificationType, u.FirstName + ' ' + u.LastName as UserName
        FROM Notifications n
        INNER JOIN NotificationTypes nt ON n.TypeId = nt.TypeId
        INNER JOIN Users u ON n.UserId = u.UserId
        ORDER BY n.CreatedAt DESC
    `);
    return result.recordset;
};

export const getNotificationsByUserService = async (userId: string): Promise<Notification[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query(`
            SELECT n.*, nt.Name as NotificationType
            FROM Notifications n
            INNER JOIN NotificationTypes nt ON n.TypeId = nt.TypeId
            WHERE n.UserId = @UserId
            ORDER BY n.CreatedAt DESC
        `);
    return result.recordset;
};

export const getUnreadNotificationsService = async (userId: string): Promise<Notification[]> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query(`
            SELECT n.*, nt.Name as NotificationType
            FROM Notifications n
            INNER JOIN NotificationTypes nt ON n.TypeId = nt.TypeId
            WHERE n.UserId = @UserId AND n.IsRead = 0
            ORDER BY n.CreatedAt DESC
        `);
    return result.recordset;
};

export const createNotificationService = async (
    userId: number,
    typeId: number,
    title: string,
    message: string,
    channel: string,
    relatedEntityId: number | null,
    relatedEntityType: string | null
): Promise<Notification | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .input('TypeId', sql.Int, typeId)
        .input('Title', sql.NVarChar, title)
        .input('Message', sql.NVarChar, message)
        .input('Channel', sql.NVarChar, channel)
        .input('RelatedEntityId', sql.Int, relatedEntityId)
        .input('RelatedEntityType', sql.NVarChar, relatedEntityType)
        .query(`
            INSERT INTO Notifications (UserId, TypeId, Title, Message, Channel, RelatedEntityId, RelatedEntityType)
            OUTPUT INSERTED.*
            VALUES (@UserId, @TypeId, @Title, @Message, @Channel, @RelatedEntityId, @RelatedEntityType)
        `);
    return result.recordset[0] || null;
};

export const markAsReadService = async (notificationId: string): Promise<Notification | null> => {
    const db = getDbPool();
    const result = await db.request()
        .input('NotificationId', sql.Int, notificationId)
        .query(`
            UPDATE Notifications 
            SET IsRead = 1
            OUTPUT INSERTED.*
            WHERE NotificationId = @NotificationId
        `);
    return result.recordset[0] || null;
};

export const markAllAsReadService = async (userId: string): Promise<number> => {
    const db = getDbPool();
    const result = await db.request()
        .input('UserId', sql.Int, userId)
        .query(`
            UPDATE Notifications 
            SET IsRead = 1
            WHERE UserId = @UserId AND IsRead = 0
        `);
    return result.rowsAffected[0];
};