import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add session ID to all requests
api.interceptors.request.use((config) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
        config.headers['x-session-id'] = sessionId;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('sessionId', response.data.sessionId);
        }
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('sessionId');
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

// Jobs API
export const jobsAPI = {
    getJobs: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.title) params.append('title', filters.title);
        if (filters.skills?.length) params.append('skills', filters.skills.join(','));
        if (filters.datePosted) params.append('datePosted', filters.datePosted);
        if (filters.jobType) params.append('jobType', filters.jobType);
        if (filters.workMode) params.append('workMode', filters.workMode);
        if (filters.location) params.append('location', filters.location);
        if (filters.matchScore) params.append('matchScore', filters.matchScore);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/jobs?${params.toString()}`);
        return response.data;
    },

    getBestMatches: async () => {
        const response = await api.get('/jobs/best-matches');
        return response.data;
    }
};

// Resume API
export const resumeAPI = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    get: async () => {
        const response = await api.get('/resume');
        return response.data;
    },

    delete: async () => {
        const response = await api.delete('/resume');
        return response.data;
    }
};

// Applications API
export const applicationsAPI = {
    create: async (job) => {
        const response = await api.post('/applications', { job });
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/applications');
        return response.data;
    },

    updateStatus: async (id, status, note) => {
        const response = await api.patch(`/applications/${id}`, { status, note });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/applications/${id}`);
        return response.data;
    }
};

// AI Assistant API
export const assistantAPI = {
    chat: async (message, conversationHistory = []) => {
        const response = await api.post('/assistant/chat', { message, conversationHistory });
        return response.data;
    }
};

export default api;
