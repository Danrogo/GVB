import { Hono } from 'hono';
import * as notificationControllers from './notifications.controllers.js';

const notificationRoutes = new Hono();

notificationRoutes.get('/notifications', notificationControllers.getAllNotifications);
notificationRoutes.get('/notifications/user/:userId', notificationControllers.getNotificationsByUser);
notificationRoutes.get('/notifications/user/:userId/unread', notificationControllers.getUnreadNotifications);
notificationRoutes.post('/notifications', notificationControllers.createNotification);
notificationRoutes.put('/notifications/:notificationId/read', notificationControllers.markAsRead);
notificationRoutes.put('/notifications/user/:userId/read-all', notificationControllers.markAllAsRead);

export default notificationRoutes;

