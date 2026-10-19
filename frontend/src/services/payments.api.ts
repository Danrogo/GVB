import apiFetch from './api';
import type { Payment, CreatePaymentData } from '../types';

export const paymentsApi = {
    getAll: () => apiFetch<Payment[]>('/payments'),
    getById: (id: number) => apiFetch<Payment>(`/payments/${id}`),
    getByBooking: (bookingId: number) =>
        apiFetch<Payment[]>(`/payments/booking/${bookingId}`),
    create: (data: CreatePaymentData) =>
        apiFetch<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, statusId: number) =>
        apiFetch<Payment>(`/payments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ statusId }),
        }),
    refund: (id: number, amount?: number) =>
        apiFetch<Payment>(`/payments/${id}/refund`, {
            method: 'PUT',
            body: JSON.stringify({ amount }),
        }),
};
