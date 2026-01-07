import axios from 'axios';

// Helper function to construct API URL with proper /api suffix
const getApiBaseUrl = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // If URL doesn't end with /api, add it
    if (!apiUrl.endsWith('/api')) {
        apiUrl = `${apiUrl}/api`;
    }
    
    return apiUrl;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to all requests
api.interceptors.request.use((config) => {
    // Debug Log
    console.log(`📡 Axios Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
