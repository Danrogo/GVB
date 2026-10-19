import { Hono } from 'hono';
import * as supportControllers from './ticket.controllers.js';

const supportRoutes = new Hono();

supportRoutes.get('/tickets', supportControllers.getAllTickets);
supportRoutes.get('/tickets/:ticketId', supportControllers.getTicketById);
supportRoutes.get('/tickets/customer/:customerId', supportControllers.getTicketsByCustomer);
supportRoutes.get('/tickets/:ticketId/messages', supportControllers.getTicketMessages);
supportRoutes.post('/tickets', supportControllers.createTicket);
supportRoutes.post('/tickets/:ticketId/messages', supportControllers.addTicketMessage);
supportRoutes.put('/tickets/:ticketId/status', supportControllers.updateTicketStatus);
supportRoutes.put('/tickets/:ticketId/assign', supportControllers.assignTicket);

export default supportRoutes;