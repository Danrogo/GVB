import { Hono } from 'hono';
import * as userControllers from './users.controllers.js';

const userRoutes = new Hono();

userRoutes.get('/users', userControllers.getAllUsers);
userRoutes.get('/users/:userId', userControllers.getUserById);
userRoutes.post('/users', userControllers.createUser);
userRoutes.put('/users/:userId', userControllers.updateUser);
userRoutes.delete('/users/:userId', userControllers.deleteUser);
userRoutes.get('/staff/:role', userControllers.getStaffByRole);

export default userRoutes;