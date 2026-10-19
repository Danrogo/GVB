import apiFetch from './api';
import type { Review, CreateReviewData } from '../types';

export const reviewsApi = {
    getAll: () => apiFetch<Review[]>('/reviews'),
    getById: (id: number) => apiFetch<Review>(`/reviews/${id}`),
    getByService: (serviceId: number) =>
        apiFetch<Review[]>(`/reviews/service/${serviceId}`),
    getByStaff: (staffId: number) =>
        apiFetch<Review[]>(`/reviews/staff/${staffId}`),
    create: (data: CreateReviewData) =>
        apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: number) =>
        apiFetch<Review>(`/reviews/${id}/approve`, { method: 'PUT' }),
    delete: (id: number) =>
        apiFetch<{ message: string }>(`/reviews/${id}`, { method: 'DELETE' }),
};
