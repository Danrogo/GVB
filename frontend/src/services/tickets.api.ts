import apiFetch from './api';
import type { SupportTicket, CreateTicketData } from '../types';

export const ticketsApi = {
    getAll: () => apiFetch<SupportTicket[]>('/tickets'),
    getById: (id: number) => apiFetch<SupportTicket>(`/tickets/${id}`),
    getByCustomer: (customerId: number) =>
        apiFetch<SupportTicket[]>(`/tickets/customer/${customerId}`),
    getMessages: (ticketId: number) =>
        apiFetch<unknown[]>(`/tickets/${ticketId}/messages`),
    create: (data: CreateTicketData) =>
        apiFetch<SupportTicket>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    addMessage: (ticketId: number, message: string) =>
        apiFetch<unknown>(`/tickets/${ticketId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
    updateStatus: (ticketId: number, statusId: number) =>
        apiFetch<SupportTicket>(`/tickets/${ticketId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ statusId }),
        }),
    assign: (ticketId: number, staffId: number) =>
        apiFetch<SupportTicket>(`/tickets/${ticketId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ staffId }),
        }),
};
