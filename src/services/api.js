import axios from 'axios';

// Use environment variable for API URL with fallbacks (Vite only)
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     'https://fourarm-backend.onrender.com';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API 401 error - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend may be unavailable');
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Add /api prefix to every API call
  login: (loginData) => api.post('/api/auth/login', loginData),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyToken: () => api.get('/api/auth/verify'),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/api/auth/change-password', passwordData),
};

export const contributionsAPI = {
  // Add /api prefix to every API call
  getAll: () => api.get('/api/contributions'),
  create: (data) => api.post('/api/contributions', data),
  getMyContributions: () => api.get('/api/contributions/my-contributions'),
  updateStatus: (id, status) => api.patch(`/api/contributions/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/contributions/${id}`),
};

export const settingsAPI = {
  // Add /api prefix to every API call
  getAll: () => api.get('/api/settings'),
  getByKey: (key) => api.get(`/api/settings/${key}`),
  updateSetting: (key, data) => api.put(`/api/settings/${key}`, data),
  updateNextMeeting: (data) => api.patch('/api/settings/next-meeting', data),
  createSetting: (data) => api.post('/api/settings', data),
  deleteSetting: (key) => api.delete(`/api/settings/${key}`),
  updateMeeting: (data) => api.patch('/api/settings/next-meeting', data),
  getNotificationPreferences: () => api.get('/api/settings/notifications'),
  updateNotificationPreferences: (data) => api.put('/api/settings/notifications', data),
};

export const dashboardAPI = {
  // Add /api prefix to every API call
  getStats: () => api.get('/api/dashboard/stats'),
  getRecentActivity: () => api.get('/api/dashboard/activity'),
  getUpcomingEvents: () => api.get('/api/dashboard/events'),
  getDashboard: () => api.get('/api/dashboard'),
  getDashboardData: () => api.get('/api/dashboard'),
};

export const adminAPI = {
  // Add /api prefix to every API call
  getUsers: () => api.get('/api/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/api/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  getUserStats: () => api.get('/api/admin/user-stats'),
};

export const investmentAPI = {
  // Add /api prefix to every API call
  getAll: () => api.get('/api/investments'),
  getStats: () => api.get('/api/investments/stats'),
  getById: (id) => api.get(`/api/investments/${id}`),
  create: (data) => api.post('/api/investments', data),
  update: (id, data) => api.put(`/api/investments/${id}`, data),
  delete: (id) => api.delete(`/api/investments/${id}`),
  updateCurrentValue: (id, value) => api.patch(`/api/investments/${id}/current-value`, { currentValue: value }),
  getProposals: () => api.get('/api/investments/proposals'),
  createProposal: (data) => api.post('/api/investments/proposals', data),
  voteOnProposal: (proposalId, vote) => api.post(`/api/investments/proposals/${proposalId}/vote`, { vote }),
  getReports: (period) => api.get(`/api/investments/reports?period=${period}`),
};

export const announcementsAPI = {
  // Add /api prefix to every API call
  getAll: () => api.get('/api/announcements'),
  getById: (id) => api.get(`/api/announcements/${id}`),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  delete: (id) => api.delete(`/api/announcements/${id}`),
  updateVisibility: (id, data) => api.patch(`/api/announcements/${id}/visibility`, data),
};

export const testConnection = async () => {
  try {
    const response = await api.get('/api/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default api;