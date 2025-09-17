import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // Don't redirect here - let the components handle it
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (loginData) => api.post('/auth/login', loginData),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

export const contributionsAPI = {
  getAll: () => api.get('/contributions'),
  create: (data) => api.post('/contributions', data),
  getMyContributions: () => api.get('/contributions/my-contributions'),
  updateStatus: (id, status) => api.patch(`/contributions/${id}/status`, { status }),
  delete: (id) => api.delete(`/contributions/${id}`),
};

export const settingsAPI = {
  // Get all settings
  getAll: () => api.get('/settings'),

  // Get specific setting by key
  getByKey: (key) => api.get(`/settings/${key}`),

  // Update a setting by key
  updateSetting: (key, data) => api.put(`/settings/${key}`, data),

  // Update next meeting settings (special endpoint)
  updateNextMeeting: (data) => api.patch('/settings/next-meeting', data),

  // Create a new setting
  createSetting: (data) => api.post('/settings', data),

  // Delete a setting by key
  deleteSetting: (key) => api.delete(`/settings/${key}`),

  // Alias for updateMeeting (backward compatibility)
  updateMeeting: (data) => api.patch('/settings/next-meeting', data),

  // Notification preferences
  getNotificationPreferences: () => api.get('/settings/notifications'),
  updateNotificationPreferences: (data) => api.put('/settings/notifications', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getUpcomingEvents: () => api.get('/dashboard/events'),
  getDashboard: () => api.get('/dashboard'),
  // Corrected: Added getDashboardData for backward compatibility
  getDashboardData: () => api.get('/dashboard'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getUserStats: () => api.get('/admin/user-stats'),
};

// Investment API endpoints
export const investmentAPI = {
  // Get all investments
  getAll: () => api.get('/investments'),

  // Get investment statistics
  getStats: () => api.get('/investments/stats'),

  // Get specific investment
  getById: (id) => api.get(`/investments/${id}`),

  // Create new investment
  create: (data) => api.post('/investments', data),

  // Update investment
  update: (id, data) => api.put(`/investments/${id}`, data),

  // Delete investment
  delete: (id) => api.delete(`/investments/${id}`),

  // Update current value
  updateCurrentValue: (id, value) => api.patch(`/investments/${id}/current-value`, { currentValue: value }),

  // Get investment proposals
  getProposals: () => api.get('/investments/proposals'),

  // Create proposal
  createProposal: (data) => api.post('/investments/proposals', data),

  // Vote on proposal
  voteOnProposal: (proposalId, vote) => api.post(`/investments/proposals/${proposalId}/vote`, { vote }),

  // Get performance reports
  getReports: (period) => api.get(`/investments/reports?period=${period}`),
};

// Add to your services/api.js
export const announcementsAPI = {
  // Get all announcements
  getAll: () => api.get('/announcements'),

  // Get specific announcement
  getById: (id) => api.get(`/announcements/${id}`),

  // Create new announcement
  create: (data) => api.post('/announcements', data),

  // Update announcement
  update: (id, data) => api.put(`/announcements/${id}`, data),

  // Delete announcement
  delete: (id) => api.delete(`/announcements/${id}`),

  // Update visibility
  updateVisibility: (id, data) => api.patch(`/announcements/${id}/visibility`, data),
};

export default api;