import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/config/apiConfig';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Return just the data from successful responses
        return response.data;
    },
    (error: AxiosError) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data: any = error.response.data;

            switch (status) {
                case 401:
                    // Unauthorized - clear auth data and redirect to login
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(STORAGE_KEYS.TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.USER);
                        window.location.href = '/auth/login';
                    }
                    break;

                case 403:
                    // Forbidden - user doesn't have permission
                    break;

                case 404:
                    // Not found
                    break;

                case 500:
                    // Server error
                    break;
            }

            // Return error message from server or generic message
            return Promise.reject(new Error(data.message || 'An error occurred'));
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject(new Error('No response from server'));
        } else {
            // Error in request setup
            return Promise.reject(new Error(error.message || 'Request failed'));
        }
    }
);

// Generic API request methods
export const apiRequest = {
    get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return api.get(url, config);
    },

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return api.post(url, data, config);
    },

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return api.put(url, data, config);
    },

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        return api.patch(url, data, config);
    },

    delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return api.delete(url, config);
    },
};

export default api;
