import { type Context } from 'hono';
import * as notificationServices from './notifications.services.js';

export const getAllNotifications = async (c: Context) => {
    try {
        const result = await notificationServices.getAllNotificationsService();
        if (result.length === 0) {
            return c.json({ message: 'No notifications found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching notifications:', error.message);
        return c.json({ error: 'Failed to fetch notifications' }, 500);
    }
};

export const getNotificationsByUser = async (c: Context) => {
    const userId = c.req.param('userId');
    try {
        const result = await notificationServices.getNotificationsByUserService(userId);
        if (result.length === 0) {
            return c.json({ message: 'No notifications found for this user' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return c.json({ error: 'Failed to fetch notifications' }, 500);
    }
};

export const getUnreadNotifications = async (c: Context) => {
    const userId = c.req.param('userId');
    try {
        const result = await notificationServices.getUnreadNotificationsService(userId);
        return c.json(result);
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        return c.json({ error: 'Failed to fetch unread notifications' }, 500);
    }
};

export const createNotification = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.userId || !body.typeId || !body.title || !body.message) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['userId', 'typeId', 'title', 'message'] 
            }, 400);
        }

        const result = await notificationServices.createNotificationService(
            body.userId,
            body.typeId,
            body.title,
            body.message,
            body.channel || 'InApp',
            body.relatedEntityId || null,
            body.relatedEntityType || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to create notification' }, 500);
        }

        return c.json({ 
            message: 'Notification created successfully', 
            notification: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating notification:', error.message);
        return c.json({ error: 'Failed to create notification' }, 500);
    }
};

export const markAsRead = async (c: Context) => {
    const notificationId = c.req.param('notificationId');
    try {
        const result = await notificationServices.markAsReadService(notificationId);
        if (result === null) {
            return c.json({ error: 'Notification not found' }, 404);
        }
        return c.json({ message: 'Notification marked as read', notification: result }, 200);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return c.json({ error: 'Failed to mark notification as read' }, 500);
    }
};

export const markAllAsRead = async (c: Context) => {
    const userId = c.req.param('userId');
    try {
        const count = await notificationServices.markAllAsReadService(userId);
        return c.json({ message: `${count} notifications marked as read` }, 200);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return c.json({ error: 'Failed to mark notifications as read' }, 500);
    }
};
