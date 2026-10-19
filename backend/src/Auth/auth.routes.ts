import { Hono } from 'hono';
import * as authControllers from './auth.controller.js';

const authRoutes = new Hono();

authRoutes.post('/auth/login', authControllers.login);
authRoutes.post('/auth/register', authControllers.register);
authRoutes.post('/auth/change-password', authControllers.changePassword);
authRoutes.get('/auth/verify', authControllers.verifyToken);
authRoutes.post('/auth/logout', authControllers.logout);

export default authRoutes;