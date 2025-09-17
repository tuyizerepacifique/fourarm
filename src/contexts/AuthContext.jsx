import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Auth check - Token exists:', !!token, 'Stored user exists:', !!storedUser);

      // If no token, clear everything and set loading to false
      if (!token) {
        console.log('No token found, clearing auth state');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying token with server...');
        const response = await authAPI.verifyToken();
        console.log('Token verification response:', response.data);

        if (response.data && response.data.valid) {
          // Use the user data from server response or fallback to stored user
          const userData = response.data.user || JSON.parse(storedUser);
          console.log('Token valid, setting user:', userData);
          setCurrentUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.log('Token invalid according to server');
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      } finally {
        console.log('Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (loginData) => {
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(loginData);
      
      if (response.data && response.data.token) {
        const { token, user } = response.data;
        console.log('Login successful, user:', user);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        return { success: true };
      } else {
        console.log('Invalid server response');
        return { success: false, error: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}