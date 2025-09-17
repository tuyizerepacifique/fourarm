import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import GlobalLoading from './GlobalLoading';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, loading } = useAuth();
  
  console.log('ProtectedRoute - Loading:', loading, 'User:', currentUser, 'AdminOnly:', adminOnly);

  // Show loading while authentication state is being determined
  if (loading) {
    console.log('ProtectedRoute showing loading');
    return <GlobalLoading isLoading={true} />;
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('ProtectedRoute redirecting to login - no user');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to dashboard if admin access is required but user is not admin
  if (adminOnly && currentUser.role?.toUpperCase() !== 'ADMIN') {
    console.log('ProtectedRoute redirecting to dashboard - insufficient permissions');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('ProtectedRoute allowing access');
  return children;
}