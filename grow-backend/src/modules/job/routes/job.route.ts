import express from "express";
import * as controller from "../controller/job.controller";
import * as applicationController from "../controller/jobApplication.controller";
import * as emailController from "../controller/emailController";
import * as schema from "../schema/job.schema";
import * as applicationSchema from "../schema/jobApplication.schema";
import { validate } from "@/middleware/validate";

const router = express.Router();

// ========== JOB POST ROUTES ==========

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

// ========== JOB APPLICATION ROUTES ==========

// Apply for a job
router.post(
  "/apply",
  validate(applicationSchema.applyForJobSchema),
  applicationController.applyForJob
);

// Get all applications with filters
router.get(
  "/applications",
  validate(applicationSchema.getApplicationsSchema),
  applicationController.getApplications
);

// Get applications for a specific job
router.get(
  "/applications/by-job/:jobId",
  applicationController.getApplicationsByJobId
);

// Get single application by ID
router.get(
  "/applications/:id",
  validate(applicationSchema.applicationIdSchema),
  applicationController.getApplicationById
);

// Update application status
router.patch(
  "/applications/:id/status",
  validate(applicationSchema.updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

// Delete application
router.delete(
  "/applications/:id",
  validate(applicationSchema.applicationIdSchema),
  applicationController.deleteApplication
);

// Get application statistics
router.get("/applications/stats/overview", applicationController.getApplicationStats);

// ========== EMAIL ROUTES ==========

// Send email to applicant
router.post(
  "/send-email",
  emailController.sendEmail
);

// Get email history for an application
router.get(
  "/email-history/:applicationId",
  emailController.getEmailHistory
);

// Get latest email for an application
router.get(
  "/email-latest/:applicationId",
  emailController.getLatestEmail
);

// Test email configuration
router.get(
  "/email/test",
  emailController.testConnection
);

export default router;
