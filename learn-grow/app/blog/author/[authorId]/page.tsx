"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Image,
  Chip,
  Pagination,
} from "@nextui-org/react";
import { FaArrowLeft, FaCalendar, FaClock, FaEye } from "react-icons/fa";
import { useGetBlogsByAuthorQuery } from "@/redux/api/blogApi";
import DOMPurify from "dompurify";

export default function AuthorBlogsPage() {
  const params = useParams();
  const router = useRouter();
  const authorId = params.authorId as string;
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: blogsResponse,
    isLoading,
    error,
  } = useGetBlogsByAuthorQuery({ authorId, page, limit });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !blogsResponse?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-6">
          <Card>
            <CardBody className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Error Loading Author Blogs
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to load blogs for this author.
              </p>
              <Button color="primary" onPress={() => router.push("/blog")}>
                Back to Blogs
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const blogs = blogsResponse.data || [];
  const pagination = blogsResponse.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const authorName = blogs.length > 0 ? blogs[0].author?.name : "Author";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/blog")}
          className="mb-6"
        >
          Back to Blogs
        </Button>

        {/* Author Header */}
        <Card className="mb-8">
          <CardBody className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                {authorName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{authorName}</h1>
                <p className="text-gray-600">
                  {pagination.total} {pagination.total === 1 ? "Blog" : "Blogs"} Published
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <Card>
            <CardBody className="p-8 text-center">
              <p className="text-gray-600">This author hasn't published any blogs yet.</p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {blogs.map((blog: any) => (
                <Card
                  key={blog._id}
                  isPressable
                  onPress={() => router.push(`/blog/${blog.slug}`)}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-0">
                    {/* Blog Image */}
                    <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {blog.image ? (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23e5e7eb' width='400' height='200'/%3E%3C/svg%3E"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Blog Content */}
                    <div className="p-6">
                      {/* Category */}
                      {blog.category && (
                        <Chip color="primary" variant="flat" size="sm" className="mb-3">
                          {blog.category.name}
                        </Chip>
                      )}

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaCalendar className="text-xs" />
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          <span>{blog.readTime || 5} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaEye className="text-xs" />
                          <span>{blog.viewCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={pagination.totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
