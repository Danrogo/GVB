import type { LoginCredentials, RegisterData, LoginResponse } from '../types';

const BASE_URL = '/api';

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('gvb_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
            ...(options.headers as Record<string, string> || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
    login: (credentials: LoginCredentials) =>
        apiFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    register: (data: RegisterData) =>
        apiFetch<LoginResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                phone: data.phone,
            }),
        }),

    logout: () =>
        apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),

    verify: () =>
        apiFetch<{ message: string; user: unknown }>('/auth/verify'),
};

export default apiFetch;
