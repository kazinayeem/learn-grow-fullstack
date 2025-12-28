"use client";

import React, { useState, useEffect } from "react";
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
  useGetPendingBlogsQuery,
  useApproveBlogMutation,
  useRejectBlogMutation,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AdminBlogPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: blogsResponse, isLoading } = useGetPendingBlogsQuery();
  const [approveBlog] = useApproveBlogMutation();
  const [rejectBlog] = useRejectBlogMutation();

  const blogs = blogsResponse?.data || [];

  // Check authorization
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          setIsAuthorized(true);
        }
      }
    } catch (e) {
      console.error("Auth check failed");
    }

    if (!isAuthorized) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthorized, router]);

  const handleApprove = async (blogId: string) => {
    try {
      await approveBlog(blogId).unwrap();
      toast.success("Blog approved!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (blogId: string) => {
    try {
      await rejectBlog(blogId).unwrap();
      toast.success("Blog rejected!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject");
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
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin")}
          className="mb-6"
        >
          Back to Admin
        </Button>

        <Card>
          <CardBody className="p-8">
            <h1 className="text-3xl font-bold mb-2">
              Blog Moderation Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              Review and approve pending blog submissions
            </p>

            {blogs.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-500">No pending blogs for approval</p>
                </CardBody>
              </Card>
            ) : (
              <Table aria-label="Pending blogs">
                <TableHeader>
                  <TableColumn>Title</TableColumn>
                  <TableColumn>Author</TableColumn>
                  <TableColumn>Category</TableColumn>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog: any) => (
                    <TableRow key={blog._id}>
                      <TableCell>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            onOpen();
                          }}
                          className="text-primary hover:underline max-w-xs truncate"
                        >
                          {blog.title}
                        </button>
                      </TableCell>
                      <TableCell>{blog.author?.name || "Anonymous"}</TableCell>
                      <TableCell>{blog.category?.name || "—"}</TableCell>
                      <TableCell>
                        {new Date(blog.createdAt).toLocaleDateString()}
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
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="success"
                            variant="light"
                            size="sm"
                            onPress={() => handleApprove(blog._id)}
                          >
                            <FaCheckCircle />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            size="sm"
                            onPress={() => handleReject(blog._id)}
                          >
                            <FaTimesCircle />
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
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {selectedBlog?.title}
                </ModalHeader>
                <ModalBody>
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Author:</strong> {selectedBlog?.author?.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Category:</strong> {selectedBlog?.category?.name}
                    </p>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedBlog?.content || "",
                      }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="success"
                    onPress={() => {
                      handleApprove(selectedBlog._id);
                      onClose();
                    }}
                  >
                    Approve
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
