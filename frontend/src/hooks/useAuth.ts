import { useAppSelector, useAppDispatch } from './useAppRedux';
import { logout, setCredentials } from '../store/slices/authSlice';
import { authApi } from '../services/api';
import type { LoginCredentials, RegisterData } from '../types';
import { ROLE_IDS } from '../types';

export function useAuth() {
    const dispatch = useAppDispatch();
    const { user, token, isAuthenticated, isLoading } = useAppSelector(
        (s) => s.auth
    );

    const login = async (credentials: LoginCredentials) => {
        const result = await authApi.login(credentials);
        dispatch(
            setCredentials({
                user: {
                    userId: result.user.UserId,
                    email: result.user.Email,
                    firstName: result.user.FirstName,
                    lastName: result.user.LastName,
                    roleId: result.user.RoleId,
                    roleName: result.user.RoleName,
                },
                token: result.token,
            })
        );
        return result;
    };

    const register = async (data: RegisterData) => {
        const result = await authApi.register(data);
        dispatch(
            setCredentials({
                user: {
                    userId: result.user.UserId,
                    email: result.user.Email,
                    firstName: result.user.FirstName,
                    lastName: result.user.LastName,
                    roleId: result.user.RoleId,
                    roleName: result.user.RoleName,
                },
                token: result.token,
            })
        );
        return result;
    };

    const logoutUser = async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore
        } finally {
            dispatch(logout());
        }
    };

    const isAdmin = user ? [1, 2].includes(user.roleId) : false;
    const roleName = user ? ROLE_IDS[user.roleId] ?? 'Customer' : null;

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        isAdmin,
        roleName,
        login,
        register,
        logout: logoutUser,
    };
}