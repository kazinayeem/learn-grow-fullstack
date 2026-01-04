import { JobApplication, IJobApplication } from "../model/jobApplication.model";
import { JobPost } from "../model/jobPost.model";
import { parsePagination } from "@/utils/pagination";

interface GetApplicationsQuery {
  jobId?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export const applyForJob = async (data: Partial<IJobApplication>) => {
  // Check if job exists
  const job = await JobPost.findById(data.jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  // Check if user already applied for this job
  const existingApplication = await JobApplication.findOne({
    jobId: data.jobId,
    email: data.email,
  });

  if (existingApplication) {
    throw new Error("You have already applied for this job");
  }

  return JobApplication.create(data);
};

export const getApplications = async (query: GetApplicationsQuery = {}) => {
  try {
    const filter: any = {};

    if (query.jobId) {
      filter.jobId = query.jobId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const { page, limit, skip } = parsePagination(query, { defaultLimit: 10, maxLimit: 10 });

    const applications = await JobApplication.find(filter)
      .populate("jobId", "title department jobType location")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JobApplication.countDocuments(filter);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getApplicationById = async (id: string) => {
  return JobApplication.findById(id).populate(
    "jobId",
    "title department jobType location description"
  );
};

export const getApplicationsByJobId = async (jobId: string) => {
  return JobApplication.find({ jobId: jobId as any })
    .populate("jobId", "title department")
    .sort({ appliedAt: -1 })
    .lean();
};

export const updateApplicationStatus = async (
  id: string,
  status: string
) => {
  return JobApplication.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
};

export const deleteApplication = async (id: string) => {
  return JobApplication.findByIdAndDelete(id);
};

export const getApplicationStats = async () => {
  const stats = await JobApplication.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return stats;
};
