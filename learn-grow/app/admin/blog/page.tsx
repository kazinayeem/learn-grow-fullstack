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
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  useGetAllBlogsQuery,
  useApproveBlogMutation,
  useRejectBlogMutation,
  useDeleteBlogMutation,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTrash, FaEye } from "react-icons/fa";

export default function AdminBlogPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: blogsResponse, isLoading } = useGetAllBlogsQuery({
    limit: 100,
    includeUnpublished: true,
  });
  const [approveBlog] = useApproveBlogMutation();
  const [rejectBlog] = useRejectBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const allBlogs = blogsResponse?.data || [];

  // Filter blogs based on approval status and role
  const blogs = allBlogs.filter((blog: any) => {
    const matchesApproval = 
      approvalFilter === "all" ? true :
      approvalFilter === "approved" ? blog.isApproved :
      approvalFilter === "pending" ? !blog.isApproved : true;

    const matchesRole = 
      roleFilter === "all" ? true :
      blog.author?.role === roleFilter;

    return matchesApproval && matchesRole;
  });

  // Check authorization
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          setIsAuthorized(true);
          return;
        }
      } catch (e) {
        console.error("Auth check failed");
      }
    }
    router.replace("/admin");
  }, [router]);

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

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(blogId).unwrap();
      toast.success("Blog deleted!");
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Blog Management Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage all blogs, approve submissions, and moderate content
                </p>
              </div>
              <Button
                color="primary"
                onPress={() => router.push("/blog/create")}
              >
                Create Blog
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Select
                label="Approval Status"
                selectedKeys={[approvalFilter]}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <SelectItem key="all" value="all">All Blogs</SelectItem>
                <SelectItem key="pending" value="pending">Pending Approval</SelectItem>
                <SelectItem key="approved" value="approved">Approved</SelectItem>
              </Select>

              <Select
                label="Author Role"
                selectedKeys={[roleFilter]}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <SelectItem key="all" value="all">All Roles</SelectItem>
                <SelectItem key="student" value="student">Students</SelectItem>
                <SelectItem key="instructor" value="instructor">Instructors</SelectItem>
                <SelectItem key="admin" value="admin">Admins</SelectItem>
              </Select>

              <div className="flex items-end">
                <Chip size="lg" variant="flat" color="primary">
                  Total: {blogs.length} blogs
                </Chip>
              </div>
            </div>

            {blogs.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardBody className="p-8 text-center">
                  <p className="text-gray-500">No blogs found with current filters</p>
                </CardBody>
              </Card>
            ) : (
              <Table aria-label="All blogs">
                <TableHeader>
                  <TableColumn>Title</TableColumn>
                  <TableColumn>Author</TableColumn>
                  <TableColumn>Role</TableColumn>
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
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {blog.author?.role || "—"}
                        </Chip>
                      </TableCell>
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
                            variant="light"
                            size="sm"
                            onPress={() => router.push(`/blog/${blog.slug}`)}
                          >
                            <FaEye />
                          </Button>
                          {!blog.isApproved && (
                            <Button
                              isIconOnly
                              color="success"
                              variant="light"
                              size="sm"
                              onPress={() => handleApprove(blog._id)}
                            >
                              <FaCheckCircle />
                            </Button>
                          )}
                          {!blog.isApproved && (
                            <Button
                              isIconOnly
                              color="warning"
                              variant="light"
                              size="sm"
                              onPress={() => handleReject(blog._id)}
                            >
                              <FaTimesCircle />
                            </Button>
                          )}
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
