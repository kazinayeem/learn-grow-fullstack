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
  Pagination,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  useGetAllBlogsQuery,
  useApproveBlogMutation,
  useRejectBlogMutation,
  useDeleteBlogMutation,
} from "@/redux/api/blogApi";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEye,
  FaBlog,
  FaFilter,
  FaPlus,
  FaPenNib,
  FaUser,
  FaTimes
} from "react-icons/fa";

export default function AdminBlogPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
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

  const totalPages = Math.max(1, Math.ceil(blogs.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndexExclusive = startIndex + rowsPerPage;
  const paginatedBlogs = blogs.slice(startIndex, endIndexExclusive);

  const pendingCount = allBlogs.filter((b: any) => !b.isApproved).length;
  const approvedCount = allBlogs.filter((b: any) => b.isApproved).length;

  useEffect(() => {
    setPage(1);
  }, [approvalFilter, roleFilter, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="light"
              startContent={<FaArrowLeft />}
              onPress={() => router.push("/admin")}
              className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <FaBlog className="text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Blog Management
                </h1>
                <p className="text-sm sm:text-base text-white/90 mt-1">
                  Manage, approve, and moderate blog content
                </p>
              </div>
            </div>
          </div>
          <Button
            color="default"
            size="lg"
            onPress={() => router.push("/blog/create")}
            startContent={<FaPlus />}
            className="min-h-[44px] bg-white text-orange-600 font-semibold shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
          >
            Create Blog
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Blogs</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{allBlogs.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaBlog className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pendingCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                <FaPenNib className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Approved</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{approvedCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-4 sm:p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Approval Status</label>
            <Select
              selectedKeys={[approvalFilter]}
              onChange={(e) => setApprovalFilter(e.target.value)}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="all" value="all">All Blogs</SelectItem>
              <SelectItem key="pending" value="pending">Pending Approval</SelectItem>
              <SelectItem key="approved" value="approved">Approved</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Author Role</label>
            <Select
              selectedKeys={[roleFilter]}
              onChange={(e) => setRoleFilter(e.target.value)}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="all" value="all">All Roles</SelectItem>
              <SelectItem key="student" value="student">Students</SelectItem>
              <SelectItem key="instructor" value="instructor">Instructors</SelectItem>
              <SelectItem key="admin" value="admin">Admins</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Items per page</label>
            <Select
              selectedKeys={[String(rowsPerPage)]}
              onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="10" value="10">10 per page</SelectItem>
              <SelectItem key="50" value="50">50 per page</SelectItem>
              <SelectItem key="100" value="100">100 per page</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Blogs Table/Cards */}
      <Card className="shadow-xl border-2 border-gray-100">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {blogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="bg-gradient-to-br from-orange-100 to-amber-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBlog className="text-4xl sm:text-5xl text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No blogs found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Blogs Table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
                  <TableHeader>
                    <TableColumn>TITLE</TableColumn>
                    <TableColumn>AUTHOR</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>CATEGORY</TableColumn>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedBlogs.map((blog: any) => (
                      <TableRow key={blog._id} className="hover:bg-gray-50">
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              onOpen();
                            }}
                            className="text-gray-900 font-semibold hover:text-orange-600 transition-colors max-w-xs truncate block text-left"
                          >
                            {blog.title}
                          </button>
                        </TableCell>
                        <TableCell className="text-gray-700">{blog.author?.name || "Anonymous"}</TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="secondary">
                            {blog.author?.role || "—"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="dot" color="default">
                            {blog.category?.name || "—"}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={blog.isApproved ? "success" : "warning"}
                            variant="flat"
                            size="sm"
                            startContent={blog.isApproved ? <FaCheckCircle size={12} /> : <FaPenNib size={12} />}
                          >
                            {blog.isApproved ? "Approved" : "Pending"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              isIconOnly
                              variant="flat"
                              size="sm"
                              onPress={() => router.push(`/blog/${blog.slug}`)}
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <FaEye />
                            </Button>
                            {!blog.isApproved && (
                              <Button
                                isIconOnly
                                color="success"
                                variant="flat"
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
                                variant="flat"
                                size="sm"
                                onPress={() => handleReject(blog._id)}
                              >
                                <FaTimesCircle />
                              </Button>
                            )}
                            <Button
                              isIconOnly
                              color="danger"
                              variant="flat"
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
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {paginatedBlogs.map((blog: any) => (
                  <Card key={blog._id} className="border border-gray-200 shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 mr-2">
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              onOpen();
                            }}
                            className="font-bold text-lg text-gray-900 leading-tight mb-1 text-left block"
                          >
                            {blog.title}
                          </button>
                          <p className="text-sm text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Chip
                          color={blog.isApproved ? "success" : "warning"}
                          variant="flat"
                          size="sm"
                          className="shrink-0"
                        >
                          {blog.isApproved ? "Approved" : "Pending"}
                        </Chip>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm mb-4">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          <FaUser className="text-gray-400" />
                          <span>{blog.author?.name}</span>
                        </div>
                        <Chip size="sm" variant="flat" color="secondary" className="h-[28px]">
                          {blog.author?.role}
                        </Chip>
                        <Chip size="sm" variant="dot" color="default" className="h-[28px]">
                          {blog.category?.name}
                        </Chip>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => router.push(`/blog/${blog.slug}`)}
                          startContent={<FaEye />}
                          className="flex-1 font-semibold"
                        >
                          View
                        </Button>
                        {!blog.isApproved && (
                          <>
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              onPress={() => handleApprove(blog._id)}
                              isIconOnly
                            >
                              <FaCheckCircle />
                            </Button>
                            <Button
                              size="sm"
                              color="warning"
                              variant="flat"
                              onPress={() => handleReject(blog._id)}
                              isIconOnly
                            >
                              <FaTimesCircle />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDelete(blog._id)}
                          isIconOnly
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                  showControls
                  color="warning"
                  size="lg"
                  variant="flat"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Blog Preview Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white p-6">
                <h2 className="text-xl font-bold">{selectedBlog?.title}</h2>
              </ModalHeader>
              <ModalBody className="p-6">
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-500">Author:</span>
                    <Chip size="sm" variant="flat" avatar={<FaUser className="p-0.5" />}>
                      {selectedBlog?.author?.name}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-500">Category:</span>
                    <Chip size="sm" color="warning" variant="dot">
                      {selectedBlog?.category?.name}
                    </Chip>
                  </div>
                </div>

                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedBlog?.content || "",
                  }}
                  className="prose prose-sm sm:prose-base max-w-none text-gray-800"
                />
              </ModalBody>
              <ModalFooter className="border-t border-gray-100 p-6 bg-gray-50">
                <Button color="default" variant="flat" onPress={onClose} size="lg" className="min-h-[48px]" startContent={<FaTimes />}>
                  Close
                </Button>
                {!selectedBlog?.isApproved && (
                  <Button
                    color="success"
                    onPress={() => {
                      handleApprove(selectedBlog._id);
                      onClose();
                    }}
                    size="lg"
                    className="min-h-[48px] bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    startContent={<FaCheckCircle />}
                  >
                    Approve and Publish
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
