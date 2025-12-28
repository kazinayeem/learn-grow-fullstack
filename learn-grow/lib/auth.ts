import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        const response = await axios.post(`${API_URL}/users/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        Cookies.set("accessToken", accessToken);
        Cookies.set("refreshToken", newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface SendOTPResponse {
  success: boolean;
  message: string;
  otp?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: "student" | "instructor" | "guardian";
      isVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: "student" | "instructor" | "guardian";
      isVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Send OTP to email or phone
 */
export const sendOTP = async (
  email?: string,
  phone?: string
): Promise<SendOTPResponse> => {
  try {
    const response = await authApi.post("/users/send-otp", { email, phone });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (
  otp: string,
  email?: string,
  phone?: string
): Promise<VerifyOTPResponse> => {
  try {
    const response = await authApi.post("/users/verify-otp", {
      email,
      phone,
      otp,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to verify OTP",
    };
  }
};

/**
 * Register user
 */
export const register = async (userData: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "student" | "instructor" | "guardian";
}): Promise<RegisterResponse> => {
  try {
    const response = await authApi.post("/users/register", userData);
    const { accessToken, refreshToken } = response.data.data;

    // Store tokens
    Cookies.set("accessToken", accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("refreshToken", refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("userRole", response.data.data.user.role);

    // Store full user object in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem("token", accessToken);
      
      // Trigger custom event for navbar to update
      window.dispatchEvent(new Event("auth-change"));
    }

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

/**
 * Login user
 */
export const login = async (credentials: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await authApi.post("/users/login", credentials);
    const { accessToken, refreshToken } = response.data.data;

    // Store tokens
    Cookies.set("accessToken", accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("refreshToken", refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("userRole", response.data.data.user.role);

    // Store full user object in localStorage (includes isApproved status)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      localStorage.setItem("token", accessToken);
      
      // Trigger custom event for navbar to update
      window.dispatchEvent(new Event("auth-change"));
    }

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await authApi.post("/users/logout", {});
    
    // Clear tokens
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userRole");
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      
      // Trigger custom event for navbar to update
      window.dispatchEvent(new Event("auth-change"));
    }

    return { success: true, message: "Logged out successfully" };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<any> => {
  try {
    const response = await authApi.get("/users/profile");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authApi.post("/users/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password",
    };
  }
};

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = () => {
  window.location.href = `${API_URL.replace("/api", "")}/api/auth/google`;
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = (params: URLSearchParams) => {
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const role = params.get("role");

  if (accessToken && refreshToken) {
    Cookies.set("accessToken", accessToken, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set("refreshToken", refreshToken, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    if (role) {
      Cookies.set("userRole", role);
    }
    return true;
  }
  return false;
};

export default authApi;
