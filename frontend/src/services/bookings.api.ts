import apiFetch from './api';
import type { Booking, CreateBookingData } from '../types';

export const bookingsApi = {
    getAll: () => apiFetch<Booking[]>('/bookings'),
    getById: (id: number) => apiFetch<Booking>(`/bookings/${id}`),
    getByCustomer: (customerId: number) =>
        apiFetch<Booking[]>(`/bookings/customer/${customerId}`),
    getByStaff: (staffId: number) =>
        apiFetch<Booking[]>(`/bookings/staff/${staffId}`),
    create: (data: CreateBookingData) =>
        apiFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, statusId: number) =>
        apiFetch<Booking>(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ statusId }),
        }),
    cancel: (id: number, reason?: string) =>
        apiFetch<Booking>(`/bookings/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        }),
};
