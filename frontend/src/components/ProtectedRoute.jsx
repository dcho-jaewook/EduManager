import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredRole = null }) {
    const { user, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return (
            <div className="container">
                <div className="error">
                    You don't have permission to access this page.
                </div>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute; 