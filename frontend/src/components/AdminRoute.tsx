import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
