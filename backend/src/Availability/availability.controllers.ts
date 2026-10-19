import { type Context } from 'hono';
import * as availabilityServices from './availability.services.js';

export const getStaffAvailability = async (c: Context) => {
    const staffId = c.req.param('staffId');
    try {
        const result = await availabilityServices.getStaffAvailabilityService(staffId);
        return c.json(result);
    } catch (error) {
        console.error('Error fetching availability:', error);
        return c.json({ error: 'Failed to fetch availability' }, 500);
    }
};

export const getStaffTimeOff = async (c: Context) => {
    const staffId = c.req.param('staffId');
    try {
        const result = await availabilityServices.getStaffTimeOffService(staffId);
        return c.json(result);
    } catch (error) {
        console.error('Error fetching time off:', error);
        return c.json({ error: 'Failed to fetch time off' }, 500);
    }
};

export const addStaffAvailability = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.staffId || body.dayOfWeek === undefined || !body.startTime || !body.endTime) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['staffId', 'dayOfWeek', 'startTime', 'endTime'] 
            }, 400);
        }

        const result = await availabilityServices.addStaffAvailabilityService(
            body.staffId,
            body.dayOfWeek,
            body.startTime,
            body.endTime
        );

        if (result === null) {
            return c.json({ error: 'Failed to add availability' }, 500);
        }

        return c.json({ 
            message: 'Availability added successfully', 
            availability: result 
        }, 201);
    } catch (error: any) {
        console.error('Error adding availability:', error.message);
        return c.json({ error: 'Failed to add availability' }, 500);
    }
};

export const updateStaffAvailability = async (c: Context) => {
    try {
        const availabilityId = c.req.param('availabilityId');
        const body = await c.req.json();

        const result = await availabilityServices.updateStaffAvailabilityService(
            availabilityId,
            body.startTime,
            body.endTime,
            body.isAvailable
        );

        if (result === null) {
            return c.json({ error: 'Failed to update availability' }, 404);
        }

        return c.json({ message: 'Availability updated successfully', availability: result }, 200);
    } catch (error) {
        console.error('Error updating availability:', error);
        return c.json({ error: 'Failed to update availability' }, 500);
    }
};

export const requestTimeOff = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.staffId || !body.startDate || !body.endDate) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['staffId', 'startDate', 'endDate'] 
            }, 400);
        }

        const result = await availabilityServices.requestTimeOffService(
            body.staffId,
            body.startDate,
            body.endDate,
            body.reason || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to request time off' }, 500);
        }

        return c.json({ 
            message: 'Time off request submitted successfully', 
            timeOff: result 
        }, 201);
    } catch (error: any) {
        console.error('Error requesting time off:', error.message);
        return c.json({ error: 'Failed to request time off' }, 500);
    }
};

export const approveTimeOff = async (c: Context) => {
    const timeOffId = c.req.param('timeOffId');
    try {
        const result = await availabilityServices.approveTimeOffService(timeOffId);
        if (result === null) {
            return c.json({ error: 'Failed to approve time off' }, 404);
        }
        return c.json({ message: 'Time off approved successfully', timeOff: result }, 200);
    } catch (error) {
        console.error('Error approving time off:', error);
        return c.json({ error: 'Failed to approve time off' }, 500);
    }
};
