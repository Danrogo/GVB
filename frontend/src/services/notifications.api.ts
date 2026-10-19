import apiFetch from './api';
import type { Notification } from '../types';

export const notificationsApi = {
    getAll: () => apiFetch<Notification[]>('/notifications'),
    markRead: (id: number) =>
        apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
};
