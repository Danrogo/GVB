import apiFetch from './api';
import type { Service } from '../types';

export const servicesApi = {
    getAll: () => apiFetch<Service[]>('/services'),
    getById: (id: number) => apiFetch<Service>(`/services/${id}`),
    getByCategory: (categoryId: number) =>
        apiFetch<Service[]>(`/services/category/${categoryId}`),
    create: (data: Partial<Service>) =>
        apiFetch<Service>('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Service>) =>
        apiFetch<Service>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
        apiFetch<{ message: string }>(`/services/${id}`, { method: 'DELETE' }),
};
