import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const automationAPI = {
  startLoop: (cycles) => {
    return api.post('/automation/start-loop', { cycles });
  },
  
  getLogs: (page = 1, limit = 10) => {
    return api.get(`/automation/logs?page=${page}&limit=${limit}`);
  },
  
  getLoopStatus: () => {
    return api.get('/loop/active');
  },
  
  stopLoop: (loopId) => {
    return api.post('/loop/stop', { loopId });
  },
  
  startInfiniteLoop: (maxCycles) => {
    return api.post('/loop/start', { cycles: maxCycles });
  }
};

export const analyticsAPI = {
  getStats: () => {
    return api.get('/analytics/stats');
  },
  
  getUserStats: () => {
    return api.get('/analytics/user-stats');
  }
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

export default api;