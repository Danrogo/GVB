import { Hono } from 'hono';
import * as availabilityControllers from './availability.controllers.js';

const availabilityRoutes = new Hono();

availabilityRoutes.get('/availability/staff/:staffId', availabilityControllers.getStaffAvailability);
availabilityRoutes.get('/availability/staff/:staffId/timeoff', availabilityControllers.getStaffTimeOff);
availabilityRoutes.post('/availability', availabilityControllers.addStaffAvailability);
availabilityRoutes.put('/availability/:availabilityId', availabilityControllers.updateStaffAvailability);
availabilityRoutes.post('/availability/timeoff', availabilityControllers.requestTimeOff);
availabilityRoutes.put('/availability/timeoff/:timeOffId/approve', availabilityControllers.approveTimeOff);

export default availabilityRoutes;