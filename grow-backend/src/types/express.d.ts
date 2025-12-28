declare namespace Express {
  export interface Request {
    userId?: string;
    userRole?: "admin" | "instructor" | "student" | "guardian";
    validatedBody?: any;
    subscription?: any;
  }
}
