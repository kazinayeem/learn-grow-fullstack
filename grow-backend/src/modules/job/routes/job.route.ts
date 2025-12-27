import express from "express";
import * as controller from "../controller/job.controller";
import * as schema from "../schema/job.schema";
import { validate } from "@/middleware/validate";

const router = express.Router();

// Get all job posts with filters and pagination
router.get(
  "/get-all-jobs",
  validate(schema.getJobPostsQuerySchema),
  controller.getAllJobPosts
);

// Get only published job posts
router.get("/get-published-jobs", controller.getPublishedJobPosts);

// Get remote job posts
router.get("/get-remote-jobs", controller.getRemoteJobPosts);

// Get job posts by department
router.get("/get-jobs-by-department/:department", controller.getJobPostsByDepartment);

// Get single job post by ID
router.get(
  "/get-single-job/:id",
  validate(schema.jobPostIdSchema),
  controller.getJobPostById
);

// Create new job post
router.post(
  "/create-job",
  validate(schema.createJobPostSchema),
  controller.createJobPost
);

// Update job post
router.patch(
  "/update-job/:id",
  validate(schema.updateJobPostSchema),
  controller.updateJobPost
);

// Publish job post
router.patch(
  "/publish-job/:id",
  validate(schema.jobPostIdSchema),
  controller.publishJobPost
);

// Unpublish job post
router.patch(
  "/unpublish-job/:id",
  validate(schema.jobPostIdSchema),
  controller.unpublishJobPost
);

// Delete job post
router.delete(
  "/delete-job/:id",
  validate(schema.jobPostIdSchema),
  controller.deleteJobPost
);

export default router;
