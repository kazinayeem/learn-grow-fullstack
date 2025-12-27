// Export all API modules for easy imports
export * from './auth';
export * from './courses';
export * from './categories';

// Re-export for convenience
import { authApi } from './auth';
import { courseApi } from './courses';
import { categoryApi } from './categories';

export const api = {
    auth: authApi,
    courses: courseApi,
    categories: categoryApi,
};

export default api;
