import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from '../../types';

const TOKEN_KEY = 'gvb_token';
const USER_KEY = 'gvb_user';

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const user = userStr ? (JSON.parse(userStr) as AuthUser) : null;
        return { token, user };
    } catch {
        return { token: null, user: null };
    }
}

const { token: storedToken, user: storedUser } = loadFromStorage();

const initialState: AuthState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: AuthUser; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            localStorage.setItem(TOKEN_KEY, action.payload.token);
            localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
