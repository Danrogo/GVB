import apiFetch from './api';
import type { User } from '../types';

export const usersApi = {
    getAll: () => apiFetch<User[]>('/users'),
    getById: (id: number) => apiFetch<User>(`/users/${id}`),
    create: (data: Partial<User>) =>
        apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<User>) =>
        apiFetch<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
        apiFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
    getStaffByRole: (role: string) =>
        apiFetch<User[]>(`/staff/${role}`),
};
