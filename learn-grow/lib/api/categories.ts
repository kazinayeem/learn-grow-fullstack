import { apiRequest } from '../api';
import { ENDPOINTS } from '@/config/apiConfig';

// TypeScript interfaces for Category API

export interface CreateCategoryRequest {
    name: string;
    description: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

export interface Category {
    _id: string;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryResponse {
    success: boolean;
    message?: string;
    data?: Category | Category[];
}

// Category API functions
export const categoryApi = {
    /**
     * Get all categories
     */
    getAll: async (): Promise<CategoryResponse> => {
        return apiRequest.get(ENDPOINTS.CATEGORIES.GET_ALL);
    },

    /**
     * Get single category by ID
     */
    getById: async (id: string): Promise<CategoryResponse> => {
        return apiRequest.get(`${ENDPOINTS.CATEGORIES.GET_SINGLE}/${id}`);
    },

    /**
     * Create new category (requires authentication)
     */
    create: async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
        return apiRequest.post(ENDPOINTS.CATEGORIES.CREATE, data);
    },

    /**
     * Update category (requires authentication)
     */
    update: async (id: string, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
        return apiRequest.patch(`${ENDPOINTS.CATEGORIES.UPDATE}/${id}`, data);
    },

    /**
     * Delete category (requires authentication)
     */
    delete: async (id: string): Promise<CategoryResponse> => {
        return apiRequest.delete(`${ENDPOINTS.CATEGORIES.DELETE}/${id}`);
    },
};
