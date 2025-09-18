import axios from 'axios';

// Use environment variable for API URL with fallbacks (Vite only)
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     'https://fourarm-backend.onrender.com/api';

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
  // ✅ CORRECT: No duplicate /api prefix
  login: (loginData) => api.post('/auth/login', loginData),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

export const contributionsAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getAll: () => api.get('/contributions'),
  create: (data) => api.post('/contributions', data),
  getMyContributions: () => api.get('/contributions/my-contributions'),
  updateStatus: (id, status) => api.patch(`/contributions/${id}/status`, { status }),
  delete: (id) => api.delete(`/contributions/${id}`),
};

export const settingsAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  updateSetting: (key, data) => api.put(`/settings/${key}`, data),
  updateNextMeeting: (data) => api.patch('/settings/next-meeting', data),
  createSetting: (data) => api.post('/settings', data),
  deleteSetting: (key) => api.delete(`/settings/${key}`),
  updateMeeting: (data) => api.patch('/settings/next-meeting', data),
  getNotificationPreferences: () => api.get('/settings/notifications'),
  updateNotificationPreferences: (data) => api.put('/settings/notifications', data),
};

export const dashboardAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getUpcomingEvents: () => api.get('/dashboard/events'),
  getDashboard: () => api.get('/dashboard'),
  getDashboardData: () => api.get('/dashboard'),
};

export const adminAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserStats: () => api.get('/admin/user-stats'),
};

export const investmentAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getAll: () => api.get('/investments'),
  getStats: () => api.get('/investments/stats'),
  getById: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
  updateCurrentValue: (id, value) => api.patch(`/investments/${id}/current-value`, { currentValue: value }),
  getProposals: () => api.get('/investments/proposals'),
  createProposal: (data) => api.post('/investments/proposals', data),
  voteOnProposal: (proposalId, vote) => api.post(`/investments/proposals/${proposalId}/vote`, { vote }),
  getReports: (period) => api.get(`/investments/reports?period=${period}`),
};

export const announcementsAPI = {
  // ✅ CORRECT: No duplicate /api prefix
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  updateVisibility: (id, data) => api.patch(`/announcements/${id}/visibility`, data),
};

export const testConnection = async () => {
  try {
    // ✅ CORRECT: No duplicate /api prefix
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default api;