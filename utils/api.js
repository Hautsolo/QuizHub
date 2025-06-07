// utils/api.js - Fixed ESLint errors
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

// Handle token refresh (WITHOUT auto-redirect)
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
          // Clear tokens but DON'T redirect - let components handle it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('guest_user');
        }
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

// Quiz API - Enhanced with multimedia and solo play
export const quizAPI = {
  getCategories: () => api.get('/categories/'),
  getTopics: (categoryId) => api.get(`/topics/?category=${categoryId}`),
  getQuizzes: (params = {}) => api.get('/quizzes/', { params }),
  getQuiz: (id) => api.get(`/quizzes/${id}/`),
  getQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions/`),
  createQuiz: (data) => api.post('/quizzes/', data),

  // Solo Play Endpoints
  createAttempt: (data) => api.post('/quiz-attempts/', data),
  getMyAttempts: () => api.get('/quiz-attempts/my_attempts/'),
  getAttemptStats: () => api.get('/quiz-attempts/stats/'),
  getAttempt: (id) => api.get(`/quiz-attempts/${id}/`),
};

// Media API - New for multimedia support
export const mediaAPI = {
  uploadFile: (formData) => api.post('/media/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getMediaByType: (type) => api.get(`/media/by_type/?type=${type}`),
  getMediaFile: (id) => api.get(`/media/${id}/`),
  deleteMediaFile: (id) => api.delete(`/media/${id}/`),
};

// Leaderboard API - New for rankings
export const leaderboardAPI = {
  getGlobalRankings: () => api.get('/leaderboards/global_rankings/'),
  getCategoryRankings: (categoryId) => api.get(`/leaderboards/category_rankings/?category=${categoryId}`),
  getQuizRankings: (quizId) => api.get(`/leaderboards/quiz_rankings/?quiz=${quizId}`),
  getLeaderboards: () => api.get('/leaderboards/'),
  getLeaderboard: (id) => api.get(`/leaderboards/${id}/`),
};

// Enhanced Question API - With multimedia support
export const questionAPI = {
  getQuestions: (params = {}) => api.get('/questions/', { params }),
  getQuestion: (id) => api.get(`/questions/${id}/`),
  createQuestion: (data) => api.post('/questions/', data),
  updateQuestion: (id, data) => api.put(`/questions/${id}/`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}/`),

  // Moderation endpoints
  getMyQuestions: () => api.get('/questions/my_questions/'),
  getPendingQuestions: () => api.get('/questions/pending/'),
  approveQuestion: (id) => api.post(`/questions/${id}/approve/`),
  rejectQuestion: (id) => api.post(`/questions/${id}/reject/`),
};

// Match API - Enhanced
export const matchAPI = {
  getMatches: () => api.get('/matches/'),
  createMatch: (data) => api.post('/matches/', data),
  getMatch: (id) => api.get(`/matches/${id}/`),
  startMatch: (id) => api.post(`/matches/${id}/start/`),
  endMatch: (id) => api.post(`/matches/${id}/end/`),

  // Player actions
  joinMatch: (matchId) => api.post(`/matches/${matchId}/join/`),
  leaveMatch: (matchId) => api.post(`/matches/${matchId}/leave/`),
  joinByCode: (data) => api.post('/matches/join-by-code/', data),

  // Support system
  supportPlayer: (matchId, playerId, data) => api.post(`/matches/${matchId}/support/${playerId}/`, data),
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

// User API - Enhanced
export const userAPI = {
  getUsers: (params = {}) => api.get('/users/', { params }),
  getUser: (id) => api.get(`/users/${id}/`),
  getUserProfile: (id) => api.get(`/users/${id}/profile/`),
  getLeaderboard: () => api.get('/users/leaderboard/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};

// Guest API - For guest users
export const guestAPI = {
  createGuest: (data) => api.post('/guest/create/', data),
};

// Utility functions for multimedia
export const mediaUtils = {
  // Check if file is valid image
  isValidImage: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
  },

  // Check if file is valid audio
  isValidAudio: (file) => {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg'];
    return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB limit
  },

  // Check if file is valid video
  isValidVideo: (file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024; // 100MB limit
  },

  // Upload media file with progress tracking
  uploadMediaFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_filename', file.name);
    formData.append('file_size', file.size);
    formData.append('mime_type', file.type);

    // Determine media type
    let mediaType = 'image';
    if (file.type.startsWith('audio/')) mediaType = 'audio';
    if (file.type.startsWith('video/')) mediaType = 'video';
    formData.append('media_type', mediaType);

    return api.post('/media/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  // Get media URL with fallback
  getMediaUrl: (mediaItem) => {
    if (!mediaItem) return null;
    return mediaItem.media_url || mediaItem.file_url || mediaItem.image || mediaItem.audio || mediaItem.video;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  },
};

// Quiz utilities
export const quizUtils = {
  // Calculate quiz score
  calculateScore: (answers, questions) => {
    let correctCount = 0;
    let totalScore = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer.is_correct) {
        correctCount += 1;
        totalScore += 10; // Base points per correct answer
      }
    });

    const percentage = (correctCount / questions.length) * 100;

    // Bonus points for perfect score
    if (percentage === 100) {
      totalScore += 50;
    }

    return {
      score: totalScore,
      correctCount,
      totalQuestions: questions.length,
      percentage: Math.round(percentage * 100) / 100,
    };
  },

  // Get difficulty color
  getDifficultyColor: (difficulty) => {
    const colors = {
      1: '#10b981', // green
      2: '#f59e0b', // yellow
      3: '#f97316', // orange
      4: '#ef4444', // red
      5: '#8b5cf6', // purple
    };
    return colors[difficulty] || '#6b7280';
  },

  // Get difficulty label
  getDifficultyLabel: (difficulty) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Expert',
    };
    return labels[difficulty] || 'Unknown';
  },

  // Format time duration
  formatDuration: (seconds) => {
    if (!seconds) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  },

  // Shuffle array (for randomizing questions/answers)
  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

// WebSocket utilities for real-time features
export const wsUtils = {
  // Create WebSocket connection for matches
  createMatchConnection: (matchId, callbacks = {}) => {
    const wsUrl = `ws://localhost:8000/ws/match/${matchId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // console.log('Match WebSocket connected'); // Removed console.log
      if (callbacks.onOpen) callbacks.onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (callbacks.onMessage) callbacks.onMessage(data);
      } catch (error) {
        // console.error('WebSocket message parsing error:', error); // Removed console.error
        // Silent error handling
      }
    };

    ws.onerror = (error) => {
      // console.error('WebSocket error:', error); // Removed console.error
      if (callbacks.onError) callbacks.onError(error);
    };

    ws.onclose = () => {
      // console.log('Match WebSocket disconnected'); // Removed console.log
      if (callbacks.onClose) callbacks.onClose();
    };

    return ws;
  },
};

export default api;
