"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  useGetAllBlogsQuery,
  useDeleteBlogMutation,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";

export default function InstructorBlogsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (["instructor", "admin", "student"].includes(user.role)) {
          setUserId(user._id || user.id);
          setIsAuthorized(true);
        }
      }
    } catch (e) {
      console.error("Auth check failed");
    }

    if (!isAuthorized) {
      router.replace("/login");
    }
  }, [isAuthorized, router]);

  const { data: blogsResponse, isLoading, refetch } = useGetAllBlogsQuery(
    {
      authorId: userId || undefined,
      limit: 100,
      includeUnpublished: true,
    },
    { skip: !userId || !isAuthorized }
  );

  const [deleteBlog] = useDeleteBlogMutation();

  const blogs = blogsResponse?.data || [];

  const handleDelete = async (blogId: string) => {
    try {
      await deleteBlog(blogId).unwrap();
      toast.success("Blog deleted!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  if (!isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.back()}
          >
            Back
          </Button>
          <Button
            color="primary"
            startContent={<FaPlus />}
            onPress={() => router.push("/blog/create")}
          >
            Create New Blog
          </Button>
        </div>

        <Card>
          <CardBody className="p-8">
            <h1 className="text-3xl font-bold mb-2">My Blogs</h1>
            <p className="text-gray-600 mb-6">
              Manage your blog posts and submissions
            </p>

            {blogs.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardBody className="p-12 text-center">
                  <p className="text-gray-500 mb-4">No blogs yet</p>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => router.push("/blog/create")}
                  >
                    Create Your First Blog
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Table aria-label="User blogs">
                <TableHeader>
                  <TableColumn>Title</TableColumn>
                  <TableColumn>Category</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Approval</TableColumn>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog: any) => (
                    <TableRow key={blog._id}>
                      <TableCell className="max-w-xs truncate">
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            onOpen();
                          }}
                          className="text-primary hover:underline"
                        >
                          {blog.title}
                        </button>
                      </TableCell>
                      <TableCell>{blog.category?.name || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          color={blog.isPublished ? "success" : "warning"}
                          variant="flat"
                          size="sm"
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={blog.isApproved ? "success" : "warning"}
                          variant="flat"
                          size="sm"
                        >
                          {blog.isApproved ? "Approved" : "Pending"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() =>
                              router.push(`/blog/${blog._id}`)
                            }
                          >
                            <FaEye />
                          </Button>
                          <Button
                            isIconOnly
                            color="primary"
                            variant="light"
                            size="sm"
                            onPress={() =>
                              router.push(`/blog/${blog._id}/edit`)
                            }
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            size="sm"
                            onPress={() => handleDelete(blog._id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Blog Preview Modal */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedBlog?.title}
                </ModalHeader>
                <ModalBody>
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Status:</strong>{" "}
                      {selectedBlog?.isPublished ? "Published" : "Draft"}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Approval:</strong>{" "}
                      {selectedBlog?.isApproved ? "Approved" : "Pending"}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedBlog?.excerpt}
                    </p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      router.push(`/blog/${selectedBlog._id}/edit`);
                      onClose();
                    }}
                  >
                    Edit
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
