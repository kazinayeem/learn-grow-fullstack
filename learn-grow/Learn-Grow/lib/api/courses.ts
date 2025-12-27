import { apiRequest } from '../api';
import { ENDPOINTS } from '@/config/apiConfig';

// TypeScript interfaces for Course API

export interface CreateCourseRequest {
    title: string;
    description: string;
    category: string;
    price: number;
    level: string;
    instructor: string[];
    duration: string;
    language: string;
}

export interface UpdateCourseRequest {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
    level?: string;
    instructor?: string[];
    duration?: string;
    language?: string;
}

export interface UpdateCourseStatusRequest {
    status: string; // e.g., "active", "inactive", "draft"
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    level: string;
    instructor: string[];
    duration: string;
    language: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseResponse {
    success: boolean;
    message?: string;
    data?: Course | Course[];
}

// Course API functions
export const courseApi = {
    /**
     * Get all courses
     */
    getAll: async (): Promise<CourseResponse> => {
        return apiRequest.get(ENDPOINTS.COURSES.GET_ALL);
    },

    /**
     * Get single course by ID
     */
    getById: async (id: string): Promise<CourseResponse> => {
        return apiRequest.get(`${ENDPOINTS.COURSES.GET_SINGLE}/${id}`);
    },

    /**
     * Create new course (requires authentication)
     */
    create: async (data: CreateCourseRequest): Promise<CourseResponse> => {
        return apiRequest.post(ENDPOINTS.COURSES.CREATE, data);
    },

    /**
     * Update course (requires authentication)
     */
    update: async (id: string, data: UpdateCourseRequest): Promise<CourseResponse> => {
        return apiRequest.patch(`${ENDPOINTS.COURSES.UPDATE}/${id}`, data);
    },

    /**
     * Delete course (requires authentication)
     */
    delete: async (id: string): Promise<CourseResponse> => {
        return apiRequest.delete(`${ENDPOINTS.COURSES.DELETE}/${id}`);
    },

    /**
     * Update course status (requires authentication)
     */
    updateStatus: async (id: string, data: UpdateCourseStatusRequest): Promise<CourseResponse> => {
        return apiRequest.patch(`${ENDPOINTS.COURSES.UPDATE_STATUS}/${id}`, data);
    },
};
