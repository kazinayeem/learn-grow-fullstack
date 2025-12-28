import { Request, Response } from "express";
import * as service from "../service/blog.service";
import { Blog } from "../model/blog.model";

// ===== BLOG CONTROLLERS =====

export const createBlog = async (req: Request, res: Response) => {
  try {
    // Set author to current user
    req.body.author = req.userId;

    const blog = await service.createBlog(req.body);
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await service.getBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve blog",
      error: error.message,
    });
  }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const blog = await service.getBlogBySlug(req.params.slug);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve blog",
      error: error.message,
    });
  }
};

export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const filters: any = { ...req.query };

    // Public blogs (published and approved) - shown to all users
    // Remove the automatic author filter - let the service handle public vs personal blogs
    // Users can filter by their own blogs if needed via query parameter

    const result = await service.getAllBlogs(filters);

    res.json({
      success: true,
      message: "Blogs retrieved successfully",
      data: result.blogs,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve blogs",
      error: error.message,
    });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check ownership
    if (req.userRole === "instructor" && blog.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own blogs",
      });
    }

    const updated = await service.updateBlog(req.params.id, req.body);

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check ownership
    if (req.userRole === "instructor" && blog.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own blogs",
      });
    }

    await service.deleteBlog(req.params.id);

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

export const approveBlog = async (req: Request, res: Response) => {
  try {
    const blog = await service.approveBlog(req.params.id);

    res.json({
      success: true,
      message: "Blog approved successfully",
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to approve blog",
      error: error.message,
    });
  }
};

export const rejectBlog = async (req: Request, res: Response) => {
  try {
    const blog = await service.rejectBlog(req.params.id);

    res.json({
      success: true,
      message: "Blog rejected successfully",
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to reject blog",
      error: error.message,
    });
  }
};

export const getApprovalPendingBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await service.getApprovalPendingBlogs();

    res.json({
      success: true,
      message: "Pending approval blogs retrieved successfully",
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pending blogs",
      error: error.message,
    });
  }
};

// ===== CATEGORY CONTROLLERS =====

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await service.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await service.getAllCategories();
    res.json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      error: error.message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await service.updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await service.deleteCategory(req.params.id);
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
