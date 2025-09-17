import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalLoading from './components/GlobalLoading';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contributions from './pages/Contributions';
import Investments from './pages/Investments';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import UserManagement from './pages/admin/UserManagement';
import { ErrorBoundary } from 'react-error-boundary';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Something went wrong</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error.message}</p>
          <div className="mt-4">
            <button
              onClick={resetErrorBoundary}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Route Error Boundary component
function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Main App Content with proper error handling
function AppContent() {
  const { currentUser, loading } = useAuth();

  console.log('AppContent - Loading:', loading, 'Authenticated:', !!currentUser);

  if (loading) {
    console.log('Showing global loading screen');
    return <GlobalLoading isLoading={true} />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - accessible without authentication */}
        <Route 
          path="/login" 
          element={
            <RouteErrorBoundary>
              {currentUser ? (
                <>
                  {console.log('Redirecting authenticated user from /login to /dashboard')}
                  <Navigate to="/dashboard" replace />
                </>
              ) : (
                <>
                  {console.log('Showing login page to unauthenticated user')}
                  <Login />
                </>
              )}
            </RouteErrorBoundary>
          } 
        />
        
        {/* Root path - redirect based on auth status */}
        <Route 
          path="/" 
          element={
            <RouteErrorBoundary>
              {currentUser ? (
                <>
                  {console.log('Redirecting authenticated user from / to /dashboard')}
                  <Navigate to="/dashboard" replace />
                </>
              ) : (
                <>
                  {console.log('Redirecting unauthenticated user from / to /login')}
                  <Navigate to="/login" replace />
                </>
              )}
            </RouteErrorBoundary>
          } 
        />
        
        {/* Protected Routes - all routes under AppShell */}
        <Route
          path="/*"
          element={
            <RouteErrorBoundary>
              {currentUser ? (
                <ProtectedRoute>
                  <AppShell>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/contributions" element={<Contributions />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/announcements" element={<Announcements />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/user-management" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              ) : (
                <>
                  {console.log('Unauthenticated user trying to access protected route, redirecting to /login')}
                  <Navigate to="/login" replace />
                </>
              )}
            </RouteErrorBoundary>
          }
        />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
            <AppContent />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;