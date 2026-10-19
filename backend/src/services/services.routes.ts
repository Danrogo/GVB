import { Hono } from 'hono';
import * as serviceControllers from './services.controllers.js';

const serviceRoutes = new Hono();

serviceRoutes.get('/services', serviceControllers.getAllServices);
serviceRoutes.get('/services/:serviceId', serviceControllers.getServiceById);
serviceRoutes.get('/services/category/:categoryId', serviceControllers.getServicesByCategory);
serviceRoutes.post('/services', serviceControllers.createService);
serviceRoutes.put('/services/:serviceId', serviceControllers.updateService);
serviceRoutes.delete('/services/:serviceId', serviceControllers.deleteService);

export default serviceRoutes;