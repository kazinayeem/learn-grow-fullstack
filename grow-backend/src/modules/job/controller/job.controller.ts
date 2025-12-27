import { Request, Response } from "express";
import * as service from "../service/job.service";

export const createJobPost = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.createJobPost(req.body);
    res.status(201).json({
      success: true,
      message: "Job post created successfully",
      data: jobPost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create job post",
      error: error.message,
    });
  }
};

export const getAllJobPosts = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllJobPosts(req.query);
    res.json({
      success: true,
      message: "Job posts retrieved successfully",
      data: result.jobs,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job posts",
      error: error.message,
    });
  }
};

export const getPublishedJobPosts = async (_: Request, res: Response) => {
  try {
    const jobs = await service.getPublishedJobPosts();
    res.json({
      success: true,
      message: "Published job posts retrieved successfully",
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve published job posts",
      error: error.message,
    });
  }
};

export const getJobPostById = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.getJobPostById(req.params.id);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }
    res.json({
      success: true,
      message: "Job post retrieved successfully",
      data: jobPost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job post",
      error: error.message,
    });
  }
};

export const updateJobPost = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.updateJobPost(req.params.id, req.body);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }
    res.json({
      success: true,
      message: "Job post updated successfully",
      data: jobPost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update job post",
      error: error.message,
    });
  }
};

export const deleteJobPost = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.deleteJobPost(req.params.id);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }
    res.json({
      success: true,
      message: "Job post deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job post",
      error: error.message,
    });
  }
};

export const publishJobPost = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.publishJobPost(req.params.id);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }
    res.json({
      success: true,
      message: "Job post published successfully",
      data: jobPost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to publish job post",
      error: error.message,
    });
  }
};

export const unpublishJobPost = async (req: Request, res: Response) => {
  try {
    const jobPost = await service.unpublishJobPost(req.params.id);
    if (!jobPost) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }
    res.json({
      success: true,
      message: "Job post unpublished successfully",
      data: jobPost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to unpublish job post",
      error: error.message,
    });
  }
};

export const getJobPostsByDepartment = async (req: Request, res: Response) => {
  try {
    const jobs = await service.getJobPostsByDepartment(req.params.department);
    res.json({
      success: true,
      message: "Job posts by department retrieved successfully",
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job posts",
      error: error.message,
    });
  }
};

export const getRemoteJobPosts = async (_: Request, res: Response) => {
  try {
    const jobs = await service.getRemoteJobPosts();
    res.json({
      success: true,
      message: "Remote job posts retrieved successfully",
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve remote job posts",
      error: error.message,
    });
  }
};
