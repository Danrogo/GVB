import { type Context } from 'hono';
import * as paymentServices from './payments.services.js';

export const getAllPayments = async (c: Context) => {
    try {
        const result = await paymentServices.getAllPaymentsService();
        if (result.length === 0) {
            return c.json({ message: 'No payments found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching payments:', error.message);
        return c.json({ error: 'Failed to fetch payments' }, 500);
    }
};

export const getPaymentById = async (c: Context) => {
    const paymentId = c.req.param('paymentId');
    try {
        const result = await paymentServices.getPaymentByIdService(paymentId);
        if (result === null) {
            return c.json({ error: 'Payment not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching payment:', error);
        return c.json({ error: 'Failed to fetch payment' }, 500);
    }
};

export const getPaymentsByBooking = async (c: Context) => {
    const bookingId = c.req.param('bookingId');
    try {
        const result = await paymentServices.getPaymentsByBookingService(bookingId);
        if (result.length === 0) {
            return c.json({ message: 'No payments found for this booking' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return c.json({ error: 'Failed to fetch payments' }, 500);
    }
};

export const createPayment = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.bookingId || !body.amount || !body.methodId) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['bookingId', 'amount', 'methodId'] 
            }, 400);
        }

        const result = await paymentServices.createPaymentService(
            body.bookingId,
            body.amount,
            body.methodId,
            body.transactionRef || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to create payment' }, 500);
        }

        return c.json({ 
            message: 'Payment created successfully', 
            payment: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating payment:', error.message);
        return c.json({ error: 'Failed to create payment' }, 500);
    }
};

export const updatePaymentStatus = async (c: Context) => {
    try {
        const paymentId = c.req.param('paymentId');
        const body = await c.req.json();

        if (!body.statusId) {
            return c.json({ error: 'StatusId is required' }, 400);
        }

        const result = await paymentServices.updatePaymentStatusService(paymentId, body.statusId);
        if (result === null) {
            return c.json({ error: 'Failed to update payment status' }, 404);
        }

        return c.json({ message: 'Payment status updated successfully', payment: result }, 200);
    } catch (error) {
        console.error('Error updating payment:', error);
        return c.json({ error: 'Failed to update payment' }, 500);
    }
};

export const refundPayment = async (c: Context) => {
    try {
        const paymentId = c.req.param('paymentId');
        const body = await c.req.json();

        if (!body.refundAmount) {
            return c.json({ error: 'Refund amount is required' }, 400);
        }

        const result = await paymentServices.refundPaymentService(paymentId, body.refundAmount);
        if (result === null) {
            return c.json({ error: 'Failed to process refund' }, 404);
        }

        return c.json({ message: 'Refund processed successfully', payment: result }, 200);
    } catch (error) {
        console.error('Error processing refund:', error);
        return c.json({ error: 'Failed to process refund' }, 500);
    }
};