import { type Context } from 'hono';
import * as supportServices from './ticket.services.js';

export const getAllTickets = async (c: Context) => {
    try {
        const result = await supportServices.getAllTicketsService();
        if (result.length === 0) {
            return c.json({ message: 'No tickets found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching tickets:', error.message);
        return c.json({ error: 'Failed to fetch tickets' }, 500);
    }
};

export const getTicketById = async (c: Context) => {
    const ticketId = c.req.param('ticketId');
    try {
        const result = await supportServices.getTicketByIdService(ticketId);
        if (result === null) {
            return c.json({ error: 'Ticket not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return c.json({ error: 'Failed to fetch ticket' }, 500);
    }
};

export const getTicketsByCustomer = async (c: Context) => {
    const customerId = c.req.param('customerId');
    try {
        const result = await supportServices.getTicketsByCustomerService(customerId);
        if (result.length === 0) {
            return c.json({ message: 'No tickets found for this customer' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return c.json({ error: 'Failed to fetch tickets' }, 500);
    }
};

export const getTicketMessages = async (c: Context) => {
    const ticketId = c.req.param('ticketId');
    try {
        const result = await supportServices.getTicketMessagesService(ticketId);
        return c.json(result);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({ error: 'Failed to fetch messages' }, 500);
    }
};

export const createTicket = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.customerId || !body.subject || !body.description) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['customerId', 'subject', 'description'] 
            }, 400);
        }

        const result = await supportServices.createTicketService(
            body.customerId,
            body.subject,
            body.description,
            body.priority || 'Medium'
        );

        if (result === null) {
            return c.json({ error: 'Failed to create ticket' }, 500);
        }

        return c.json({ 
            message: 'Ticket created successfully', 
            ticket: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating ticket:', error.message);
        return c.json({ error: 'Failed to create ticket' }, 500);
    }
};

export const addTicketMessage = async (c: Context) => {
    try {
        const ticketId = c.req.param('ticketId');
        const body = await c.req.json();
        
        if (!body.senderId || !body.message) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['senderId', 'message'] 
            }, 400);
        }

        const result = await supportServices.addTicketMessageService(
            parseInt(ticketId),
            body.senderId,
            body.message,
            body.isInternal || false
        );

        if (result === null) {
            return c.json({ error: 'Failed to add message' }, 500);
        }

        return c.json({ 
            message: 'Message added successfully', 
            ticketMessage: result 
        }, 201);
    } catch (error: any) {
        console.error('Error adding message:', error.message);
        return c.json({ error: 'Failed to add message' }, 500);
    }
};

export const updateTicketStatus = async (c: Context) => {
    try {
        const ticketId = c.req.param('ticketId');
        const body = await c.req.json();

        if (!body.statusId) {
            return c.json({ error: 'StatusId is required' }, 400);
        }

        const result = await supportServices.updateTicketStatusService(ticketId, body.statusId);
        if (result === null) {
            return c.json({ error: 'Failed to update ticket status' }, 404);
        }

        return c.json({ message: 'Ticket status updated successfully', ticket: result }, 200);
    } catch (error) {
        console.error('Error updating ticket:', error);
        return c.json({ error: 'Failed to update ticket' }, 500);
    }
};

export const assignTicket = async (c: Context) => {
    try {
        const ticketId = c.req.param('ticketId');
        const body = await c.req.json();

        if (!body.assignedToId) {
            return c.json({ error: 'AssignedToId is required' }, 400);
        }

        const result = await supportServices.assignTicketService(ticketId, body.assignedToId);
        if (result === null) {
            return c.json({ error: 'Failed to assign ticket' }, 404);
        }

        return c.json({ message: 'Ticket assigned successfully', ticket: result }, 200);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        return c.json({ error: 'Failed to assign ticket' }, 500);
    }
};