import { apiRequest } from '../api';
import { ENDPOINTS } from '@/config/apiConfig';

// TypeScript interfaces based on your Postman documentation

export interface SendOTPRequest {
    phone: string; // Format: +6011...
}

export interface VerifyOTPRequest {
    phone: string;
    otp: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
}

export interface CreateUserRequest {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ForgetPasswordRequest {
    phone: string;
}

export interface ResetPasswordRequest {
    phone: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResendOTPRequest {
    phone: string;
}

// API Response types (adjust based on your actual API responses)
export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        user?: {
            _id: string;
            name: string;
            email: string;
            phone: string;
            role?: string;
        };
    };
}

// Authentication API functions
export const authApi = {
    /**
     * Send OTP to phone number
     */
    sendOTP: async (data: SendOTPRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.SEND_OTP, data);
    },

    /**
     * Verify OTP
     */
    verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
    },

    /**
     * Login with phone and password
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.LOGIN, data);
    },

    /**
     * Create new user account
     */
    createUser: async (data: CreateUserRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.CREATE_USER, data);
    },

    /**
     * Change password (requires authentication)
     */
    changePassword: async (data: ChangePasswordRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    },

    /**
     * Request password reset
     */
    forgetPassword: async (data: ForgetPasswordRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.FORGET_PASSWORD, data);
    },

    /**
     * Reset password with OTP
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    },

    /**
     * Resend OTP
     */
    resendOTP: async (data: ResendOTPRequest): Promise<AuthResponse> => {
        return apiRequest.post(ENDPOINTS.AUTH.RESEND_OTP, data);
    },
};
