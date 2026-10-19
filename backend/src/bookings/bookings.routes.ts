import { Hono } from 'hono';
import * as bookingControllers from './bookings.controllers.js';

const bookingRoutes = new Hono();

bookingRoutes.get('/bookings', bookingControllers.getAllBookings);
bookingRoutes.get('/bookings/:bookingId', bookingControllers.getBookingById);
bookingRoutes.get('/bookings/customer/:customerId', bookingControllers.getBookingsByCustomer);
bookingRoutes.get('/bookings/staff/:staffId', bookingControllers.getBookingsByStaff);
bookingRoutes.post('/bookings', bookingControllers.createBooking);
bookingRoutes.put('/bookings/:bookingId/status', bookingControllers.updateBookingStatus);
bookingRoutes.put('/bookings/:bookingId/cancel', bookingControllers.cancelBooking);

export default bookingRoutes;
