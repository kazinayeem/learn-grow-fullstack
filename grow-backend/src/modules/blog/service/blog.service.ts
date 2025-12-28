import { Blog, IBlog } from "../model/blog.model";
import { BlogCategory } from "../model/blog-category.model";

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Calculate read time (approx 200 words per minute)
const calculateReadTime = (content: string): number => {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

// ===== BLOG SERVICES =====

export const createBlog = async (data: Partial<IBlog>) => {
  const slug = generateSlug(data.title || "");
  const readTime = calculateReadTime(data.content || "");

  return Blog.create({
    ...data,
    slug,
    readTime,
  });
};

export const getBlogById = async (id: string) => {
  return Blog.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("author", "name email profileImage")
    .populate("category", "name slug");
};

export const getBlogBySlug = async (slug: string) => {
  return Blog.findOneAndUpdate(
    { slug },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("author", "name email profileImage")
    .populate("category", "name slug");
};

export const getAllBlogs = async (filters: any = {}) => {
  const query: any = {};

  // Public blogs (published and approved)
  if (!filters.includeUnpublished) {
    query.isPublished = true;
    query.isApproved = true;
  }

  // Filter by role/author
  if (filters.authorId) {
    query.author = filters.authorId;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  // Search by title or excerpt
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { excerpt: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(50, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;

  const blogs = await Blog.find(query)
    .populate("author", "name email profileImage")
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Blog.countDocuments(query);

  return {
    blogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getApprovalPendingBlogs = async () => {
  return Blog.find({ isPublished: true, isApproved: false })
    .populate("author", "name email")
    .sort({ createdAt: -1 });
};

export const updateBlog = async (id: string, data: Partial<IBlog>) => {
  // Recalculate slug if title changed
  if (data.title) {
    data.slug = generateSlug(data.title);
  }

  // Recalculate read time if content changed
  if (data.content) {
    data.readTime = calculateReadTime(data.content);
  }

  return Blog.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteBlog = async (id: string) => {
  return Blog.findByIdAndDelete(id);
};

export const approveBlog = async (id: string) => {
  return Blog.findByIdAndUpdate(id, { isApproved: true }, { new: true });
};

export const rejectBlog = async (id: string) => {
  return Blog.findByIdAndUpdate(id, { isApproved: false }, { new: true });
};

// ===== CATEGORY SERVICES =====

export const createCategory = async (data: any) => {
  const slug = generateSlug(data.name);
  return BlogCategory.create({
    ...data,
    slug,
  });
};

export const getAllCategories = async () => {
  return BlogCategory.find().sort({ name: 1 });
};

export const getCategoryBySlug = async (slug: string) => {
  return BlogCategory.findOne({ slug });
};

export const updateCategory = async (id: string, data: any) => {
  if (data.name) {
    data.slug = generateSlug(data.name);
  }
  return BlogCategory.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCategory = async (id: string) => {
  return BlogCategory.findByIdAndDelete(id);
};
