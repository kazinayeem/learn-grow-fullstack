import { JobPost, IJobPost } from "../model/jobPost.model";

interface GetJobPostsQuery {
  department?: string;
  jobType?: string;
  isRemote?: string;
  isPublished?: string;
  page?: string;
  limit?: string;
}

export const createJobPost = async (data: Partial<IJobPost>) => {
  return JobPost.create(data);
};

export const getAllJobPosts = async (query: GetJobPostsQuery = {}) => {
  try {
    const filter: any = {};
    
    if (query.department) {
      filter.department = query.department;
    }
    
    if (query.jobType) {
      filter.jobType = query.jobType;
    }
    
    if (query.isRemote !== undefined && query.isRemote !== "") {
      filter.isRemote = query.isRemote === "true";
    }
    
    if (query.isPublished !== undefined && query.isPublished !== "") {
      filter.isPublished = query.isPublished === "true";
    }
    
    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "10")));
    const skip = (page - 1) * limit;
    
    const jobs = await JobPost.find(filter)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await JobPost.countDocuments(filter);
    
    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getAllJobPosts:", error);
    throw error;
  }
};

export const getPublishedJobPosts = async () => {
  return JobPost.find({ isPublished: true })
    .sort({ postedAt: -1 });
};

export const getJobPostById = (id: string) => {
  return JobPost.findById(id);
};

export const updateJobPost = async (id: string, data: Partial<IJobPost>) => {
  return JobPost.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteJobPost = (id: string) => {
  return JobPost.findByIdAndDelete(id);
};

export const publishJobPost = (id: string) => {
  return JobPost.findByIdAndUpdate(
    id,
    { isPublished: true },
    { new: true }
  );
};

export const unpublishJobPost = (id: string) => {
  return JobPost.findByIdAndUpdate(
    id,
    { isPublished: false },
    { new: true }
  );
};

export const getJobPostsByDepartment = (department: string) => {
  return JobPost.find({ department, isPublished: true })
    .sort({ postedAt: -1 });
};

export const getRemoteJobPosts = () => {
  return JobPost.find({ isRemote: true, isPublished: true })
    .sort({ postedAt: -1 });
};
