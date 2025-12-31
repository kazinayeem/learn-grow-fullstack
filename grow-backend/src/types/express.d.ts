declare namespace Express {
  export interface Request {
    userId?: string;
    userRole?: "admin" | "manager" | "instructor" | "student" | "guardian";
    userEmail?: string;
    validatedBody?: any;
    subscription?: any;
  }
}
