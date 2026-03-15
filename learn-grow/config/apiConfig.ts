// Environment configuration
// Create a .env.local file in your project root with:
// NEXT_PUBLIC_API_URL=http://localhost:5000/api (for local development)
// NEXT_PUBLIC_API_URL=https://learnandgrow.io/api (for production)

const DEFAULT_API_URL = "http://localhost:5000/api";

export const normalizeApiBaseUrl = (rawUrl?: string): string => {
    let apiUrl = (rawUrl || DEFAULT_API_URL).trim();

    // Remove trailing slash(es) first.
    apiUrl = apiUrl.replace(/\/+$/, "");

    // Collapse accidental repeated trailing /api segments, e.g. /api/api -> /api.
    apiUrl = apiUrl.replace(/(?:\/api)+$/i, "/api");

    // Ensure exactly one trailing /api segment.
    if (!/\/api$/i.test(apiUrl)) {
        apiUrl = `${apiUrl}/api`;
    }

    return apiUrl;
};

export const API_CONFIG = {
    // Base API URL with guaranteed single /api suffix.
    BASE_URL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),

    // Origin without /api suffix for services that build endpoint roots manually.
    ORIGIN: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL).replace(/\/api$/i, ""),

    // Request timeout (30 seconds)
    TIMEOUT: 30000,

    // Default headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

// LocalStorage keys
export const STORAGE_KEYS = {
    TOKEN: 'access_token',
    USER: 'user_data',
};

// API Endpoints - Exact paths from your Postman collection
export const ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        SEND_OTP: '/user/send-otp',
        VERIFY_OTP: '/user/otp-verification',
        LOGIN: '/user/login',
        CREATE_USER: '/user/create-user',
        CHANGE_PASSWORD: '/user/change-password',
        FORGET_PASSWORD: '/user/forget-password',
        RESET_PASSWORD: '/user/reset-password',
        RESEND_OTP: '/user/resend-otp',
    },

    // Category endpoints
    CATEGORIES: {
        CREATE: '/category/create-category',
        UPDATE: '/category/update-category',        // /:id
        GET_ALL: '/category/get-all-category',
        GET_SINGLE: '/category/get-single-category', // /:id
        DELETE: '/category/delete-category',         // /:id
    },

    // Course endpoints
    COURSES: {
        CREATE: '/course/create-course',
        UPDATE: '/course/update-course',              // /:id
        DELETE: '/course/delete-course',             // /:id
        GET_ALL: '/course/get-all-courses',
        GET_SINGLE: '/course/get-single-course',      // /:id
        UPDATE_STATUS: '/course/update-status',       // /:id
    },

    // Job endpoints
    JOBS: {
        GET_ALL: '/get-all-jobs',
        GET_PUBLISHED: '/get-published-jobs',
        GET_REMOTE: '/get-remote-jobs',
        GET_BY_DEPARTMENT: '/get-jobs-by-department', // /:department
        GET_SINGLE: '/get-single-job',                // /:id
        CREATE: '/create-job',
        UPDATE: '/update-job',                        // /:id
        PUBLISH: '/publish-job',                      // /:id
        UNPUBLISH: '/unpublish-job',                  // /:id
        DELETE: '/delete-job',                        // /:id
    },
};
