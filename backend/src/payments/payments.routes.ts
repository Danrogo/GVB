import { Hono } from 'hono';
import * as paymentControllers from './payments.controllers.js';

const paymentRoutes = new Hono();

paymentRoutes.get('/payments', paymentControllers.getAllPayments);
paymentRoutes.get('/payments/:paymentId', paymentControllers.getPaymentById);
paymentRoutes.get('/payments/booking/:bookingId', paymentControllers.getPaymentsByBooking);
paymentRoutes.post('/payments', paymentControllers.createPayment);
paymentRoutes.put('/payments/:paymentId/status', paymentControllers.updatePaymentStatus);
paymentRoutes.put('/payments/:paymentId/refund', paymentControllers.refundPayment);

export default paymentRoutes;
