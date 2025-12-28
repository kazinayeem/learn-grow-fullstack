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
import { useGetBlogByIdQuery } from "@/redux/api/blogApi";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const { data: blogResponse, isLoading } = useGetBlogByIdQuery(blogId, {
    skip: !blogId,
  });

  const blog = blogResponse?.data;

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
          {blog.image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

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
                  blog.metaTags.map((tag: string) => (
                    <Chip key={tag} size="sm" variant="bordered">
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
                    <p className="font-medium">{blog.author?.name || "Anonymous"}</p>
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
                  __html: DOMPurify.sanitize(blog.content),
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
                <div className="flex gap-2">
                  <Button
                    variant="bordered"
                    startContent={<FaEdit />}
                    onPress={() => router.push(`/blog/${blogId}/edit`)}
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
              </div>
            </CardBody>
          </Card>
        </article>
      </div>
    </div>
  );
}
