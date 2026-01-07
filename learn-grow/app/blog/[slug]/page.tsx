"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Image,
  Chip,
  Button,
  Spinner,
  Divider,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useGetBlogBySlugQuery } from "@/redux/api/blogApi";
import { FaArrowLeft, FaEdit, FaTrash, FaImage } from "react-icons/fa";

// Helper function to decode HTML entities
const decodeHtmlEntities = (html: string): string => {
  if (typeof document === "undefined") {
    // Server-side fallback
    return html
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const blogSlug = params.slug as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user._id || user.id);
        setUserRole(user.role);
      } catch (e) {
      }
    }
  }, []);

  const { data: blogResponse, isLoading } = useGetBlogBySlugQuery(blogSlug, {
    skip: !blogSlug,
  });

  const blog = blogResponse?.data;

  // Check if user can edit/delete
  const isOwner = blog && userId && (blog.author?._id === userId || blog.author?.id === userId);
  const isAdmin = userRole === "admin";
  const canManage = isOwner || isAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading blog..." />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-2 border-red-500">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Blog Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The blog you're looking for doesn't exist or has been deleted.
            </p>
            <Button color="primary" onPress={() => router.push("/blog")}>
              Back to Blogs
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/blog")}
          className="mb-6"
        >
          Back to Blogs
        </Button>

        <article>
          {/* Featured Image */}
          <div className="mb-8 rounded-lg overflow-hidden">
            {blog.image ? (
              <Image
                src={blog.image}
                alt={blog.title}
                className="w-full h-96 object-cover"
                fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23e5e7eb' width='800' height='400'/%3E%3C/svg%3E"
                onError={(e: any) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.image-placeholder')) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center';
                    placeholder.innerHTML = '<svg class="w-20 h-20 text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg><span class="text-base text-gray-500 font-medium">No Image Available</span>';
                    parent.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center rounded-lg">
                <FaImage className="w-20 h-20 text-gray-400 mb-3" />
                <span className="text-base text-gray-500 font-medium">No Image Available</span>
              </div>
            )}
          </div>

          {/* Header */}
          <Card className="mb-8">
            <CardBody className="p-8">
              {/* Category and Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {blog.category && (
                  <Chip color="primary" variant="flat">
                    {blog.category.name}
                  </Chip>
                )}
                {blog.metaTags && blog.metaTags.length > 0 && (
                  blog.metaTags.map((tag: string, index: number) => (
                    <Chip key={`${tag}-${index}`} size="sm" variant="bordered">
                      #{tag}
                    </Chip>
                  ))
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {blog.author?.profileImage ? (
                      <Image
                        src={blog.author.profileImage}
                        alt={blog.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {blog.author?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p 
                      className="font-medium text-primary cursor-pointer hover:underline"
                      onClick={() => router.push(`/blog/author/${blog.author?._id || blog.author?.id}`)}
                    >
                      {blog.author?.name || "Anonymous"}
                    </p>
                    <p className="text-sm">
                      {new Date(blog.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span>•</span>
                <span>{blog.readTime || 5} min read</span>
                <span>•</span>
                <span>{blog.viewCount || 0} views</span>
              </div>

              {/* Excerpt */}
              <p className="text-lg text-gray-700 italic mb-4">{blog.excerpt}</p>

              {/* Approval Status */}
              {!blog.isApproved && (
                <Chip
                  color="warning"
                  variant="flat"
                  className="mb-4"
                >
                  Pending Admin Approval
                </Chip>
              )}
            </CardBody>
          </Card>

          {/* Content */}
          <Card className="mb-8">
            <CardBody className="p-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(decodeHtmlEntities(blog.content)),
                }}
              />
            </CardBody>
          </Card>

          {/* Footer */}
          <Card>
            <CardBody className="p-8">
              <Divider className="mb-6" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-gray-600">
                    Last updated:{" "}
                    {new Date(blog.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button
                      variant="bordered"
                      startContent={<FaEdit />}
                      onPress={() => router.push(`/blog/${blogSlug}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="danger"
                      variant="bordered"
                      startContent={<FaTrash />}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </article>
      </div>
    </div>
  );
}
