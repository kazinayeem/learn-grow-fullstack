import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error: any) {
      const issues = error.issues || error.errors || [];
      const errorDetails = issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })) || [];
      
      // Debug log for login validation failures
      if (req.path.includes('login')) {
        console.error(`[Login Validation Error] Path: ${req.path}`);
        console.error(`[Login Validation Error] Body received:`, req.body);
        console.error(`[Login Validation Error] Validation errors:`, errorDetails);
      }
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorDetails,
      });
    }
  };
