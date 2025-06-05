import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      const newConfig = { ...config };
      newConfig.headers.Authorization = `Bearer ${token}`;
      return newConfig;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          const newConfig = { ...error.config };
          newConfig.headers.Authorization = `Bearer ${response.data.access}`;
          return api.request(newConfig);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
};

// Quiz API
export const quizAPI = {
  getCategories: () => api.get('/categories/'),
  getTopics: (categoryId) => api.get(`/topics/?category=${categoryId}`),
  getQuizzes: (params = {}) => api.get('/quizzes/', { params }),
  getQuiz: (id) => api.get(`/quizzes/${id}/`),
  getQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions/`),
  createQuiz: (data) => api.post('/quizzes/', data),
};

// Match API
export const matchAPI = {
  getMatches: () => api.get('/matches/'),
  createMatch: (data) => api.post('/matches/', data),
  joinMatch: (matchId) => api.post(`/matches/${matchId}/join/`),
  leaveMatch: (matchId) => api.post(`/matches/${matchId}/leave/`),
  joinByCode: (data) => api.post('/matches/join-by-code/', data),
  getMatch: (id) => api.get(`/matches/${id}/`),
  startMatch: (id) => api.post(`/matches/${id}/start/`),
};

// Social API
export const socialAPI = {
  getFriends: () => api.get('/social/friends/'),
  getFriendRequests: () => api.get('/social/friend-requests/'),
  sendFriendRequest: (data) => api.post('/social/send-friend-request/', data),
  respondFriendRequest: (id, action) => api.post(`/social/respond-friend-request/${id}/`, { action }),
  followUser: (userId) => api.post(`/social/follow/${userId}/`),
  unfollowUser: (userId) => api.post(`/social/unfollow/${userId}/`),
};

// Notifications API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
};

export default api;
