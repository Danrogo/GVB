import { type Context } from 'hono';
import * as bookingServices from './bookings.services.js';

export const getAllBookings = async (c: Context) => {
    try {
        const result = await bookingServices.getAllBookingsService();
        if (result.length === 0) {
            return c.json({ message: 'No bookings found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching bookings:', error.message);
        return c.json({ error: 'Failed to fetch bookings' }, 500);
    }
};

export const getBookingById = async (c: Context) => {
    const bookingId = c.req.param('bookingId');
    try {
        const result = await bookingServices.getBookingByIdService(bookingId);
        if (result === null) {
            return c.json({ error: 'Booking not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching booking:', error);
        return c.json({ error: 'Failed to fetch booking' }, 500);
    }
};

export const getBookingsByCustomer = async (c: Context) => {
    const customerId = c.req.param('customerId');
    try {
        const result = await bookingServices.getBookingsByCustomerService(customerId);
        if (result.length === 0) {
            return c.json({ message: 'No bookings found for this customer' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return c.json({ error: 'Failed to fetch bookings' }, 500);
    }
};

export const getBookingsByStaff = async (c: Context) => {
    const staffId = c.req.param('staffId');
    try {
        const result = await bookingServices.getBookingsByStaffService(staffId);
        if (result.length === 0) {
            return c.json({ message: 'No bookings found for this staff member' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return c.json({ error: 'Failed to fetch bookings' }, 500);
    }
};

export const createBooking = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.customerId || !body.serviceId || !body.bookingDate || 
            !body.startTime || !body.endTime || !body.totalPrice) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['customerId', 'serviceId', 'bookingDate', 'startTime', 'endTime', 'totalPrice'] 
            }, 400);
        }

        const result = await bookingServices.createBookingService(
            body.customerId,
            body.serviceId,
            body.staffId || null,
            body.bookingDate,
            body.startTime,
            body.endTime,
            body.notes || null,
            body.totalPrice,
            body.depositPaid || 0
        );

        if (result === null) {
            return c.json({ error: 'Failed to create booking' }, 500);
        }

        return c.json({ 
            message: 'Booking created successfully', 
            booking: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating booking:', error.message);
        return c.json({ error: 'Failed to create booking' }, 500);
    }
};

export const updateBookingStatus = async (c: Context) => {
    try {
        const bookingId = c.req.param('bookingId');
        const body = await c.req.json();

        if (!body.statusId) {
            return c.json({ error: 'StatusId is required' }, 400);
        }

        const result = await bookingServices.updateBookingStatusService(bookingId, body.statusId);
        if (result === null) {
            return c.json({ error: 'Failed to update booking status' }, 404);
        }

        return c.json({ message: 'Booking status updated successfully', booking: result }, 200);
    } catch (error) {
        console.error('Error updating booking:', error);
        return c.json({ error: 'Failed to update booking' }, 500);
    }
};

export const cancelBooking = async (c: Context) => {
    try {
        const bookingId = c.req.param('bookingId');
        const body = await c.req.json();

        const result = await bookingServices.cancelBookingService(
            bookingId, 
            body.reason || 'Cancelled by user'
        );

        if (result === null) {
            return c.json({ error: 'Failed to cancel booking' }, 404);
        }

        return c.json({ message: 'Booking cancelled successfully', booking: result }, 200);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return c.json({ error: 'Failed to cancel booking' }, 500);
    }
};