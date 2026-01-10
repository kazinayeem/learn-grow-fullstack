import { Types } from "mongoose";

// Combo Types
export interface ICourse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  level?: string;
  rating?: number;
  studentsEnrolled?: number;
}

export interface ICombo {
  _id: string;
  name: string;
  description?: string;
  courses: ICourse[] | string[];
  price: number;
  discountPrice?: number;
  duration: "1-month" | "2-months" | "3-months" | "lifetime";
  isActive: boolean;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IComboOrder {
  _id: string;
  comboId: ICombo;
  userId: string;
  paymentStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  startDate?: string;
  endDate?: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Enrollment Access Types
export interface IEnrollmentAccess {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
  };
  accessDuration: "1-month" | "2-months" | "3-months" | "lifetime";
  accessStartDate: string;
  accessEndDate: string | null;
  purchaseType: "single" | "combo";
  comboId?: string;
  progress?: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserAccessStatus {
  activeAccess: IEnrollmentAccess[];
  expiredAccess: IEnrollmentAccess[];
  total: number;
}

// Access Control Types
export interface IAccessStatus {
  hasAccess: boolean;
  remainingDays: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;
  isLifetime: boolean;
  formattedAccess: string;
}
