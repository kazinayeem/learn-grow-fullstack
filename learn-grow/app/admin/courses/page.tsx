"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Accordion,
  AccordionItem,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Pagination,
  Skeleton,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import {
  useGetAllCoursesQuery,
  useDeleteCourseMutation,
  useApproveCourseMutation,
  useRejectCourseApprovalMutation,
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
  useGetModulesQuery,
} from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { FaSearch, FaCheck, FaTimes, FaEye, FaVideo, FaFileAlt, FaTrash, FaEdit, FaArrowLeft, FaBook, FaClock, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManageCoursesPage() {
  const router = useRouter();

  // Get user role
  const [userRole, setUserRole] = React.useState<string>("");

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role || "admin");
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: categoriesData } = useGetAllCategoriesQuery(undefined);
  const categories: any[] = Array.isArray(categoriesData) ? categoriesData : [];

  const { data, isLoading, error, isFetching } = useGetAllCoursesQuery({
    page,
    limit,
    search: debouncedSearch,
    status: filterStatus === "all" ? undefined : filterStatus,
    category: selectedCategory || undefined,
  });
  const { data: selectedCourseResponse, isFetching: isFetchingSelectedCourse } = useGetCourseByIdQuery(
    selectedCourseId!,
    { skip: !selectedCourseId }
  );
  const { data: selectedModulesResponse, isFetching: isFetchingModules } = useGetModulesQuery(selectedCourseId!, {
    skip: !selectedCourseId,
  });
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [approveCourse, { isLoading: isApproving }] = useApproveCourseMutation();
  const [rejectCourse, { isLoading: isRejecting }] = useRejectCourseApprovalMutation();
  const [updateCourse, { isLoading: isUpdatingCourse }] = useUpdateCourseMutation();

  const courseList: any[] = data?.data?.courses || data?.data || [];
  const totalCourses = data?.pagination?.total || data?.data?.total || data?.total || courseList.length;
  const totalPages = data?.pagination?.totalPages || Math.ceil(totalCourses / limit);

  const filteredCourses = courseList;

  const activeCourse = selectedCourseResponse?.data || selectedCourse;
  const activeModules = selectedModulesResponse?.data || activeCourse?.modules || [];

  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId).unwrap();
        toast.success("Course deleted successfully");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete course");
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveCourse(id).unwrap();
      toast.success("Course approved successfully! Email sent to instructor.");
    } catch (error: any) {
      console.error("Failed to approve course:", error);
      toast.error(error?.data?.message || "Failed to approve course");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectCourse(id).unwrap();
      toast.success("Course approval revoked successfully");
    } catch (error: any) {
      console.error("Failed to reject course:", error);
      toast.error(error?.data?.message || "Failed to reject course");
    }
  };

  const handleView = (course: any) => {
    setSelectedCourse(course);
    setSelectedCourseId(course._id);
    onOpen();
  };

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      await updateCourse({ id: courseId, isPublished: !isPublished }).unwrap();
      toast.success(!isPublished ? "Course published successfully" : "Course unpublished successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update publish status");
    }
  };

  const handleToggleFeatured = async (courseId: string, isFeatured: boolean) => {
    try {
      await updateCourse({ id: courseId, isFeatured: !isFeatured }).unwrap();
      toast.success(!isFeatured ? "Marked as featured" : "Removed from featured");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update featured status");
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedCourse(null);
    setSelectedCourseId(null);
  };

  const stats = {
    total: totalCourses,
    pending: courseList.filter((c) => !c.isAdminApproved).length,
    approved: courseList.filter((c) => c.isAdminApproved).length,
    published: courseList.filter((c) => c.isPublished && c.isAdminApproved).length,
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
            className="self-start text-white hover:bg-white/20 min-h-[44px]"
            size="lg"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
              <FaBook className="text-3xl sm:text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Course Management
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                Manage all courses, approve or reject submissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardBody className="p-4 sm:p-5 lg:p-6">
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))
        ) : (
          <>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
              <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Courses</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.total}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                    <FaBook className="text-2xl sm:text-3xl lg:text-4xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200">
              <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending Approval</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.pending}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                    <FaClock className="text-2xl sm:text-3xl lg:text-4xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Approved</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.approved}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                    <FaCheck className="text-2xl sm:text-3xl lg:text-4xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
              <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Live & Published</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.published}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                    <FaStar className="text-2xl sm:text-3xl lg:text-4xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
        <CardBody className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
              startContent={<FaSearch className="text-primary-500" />}
              variant="bordered"
              className="lg:col-span-2"
              isClearable
              onClear={() => setSearchTerm("")}
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[44px] border-2 hover:border-primary-400 transition-colors",
              }}
            />
            <Select
              label="Category"
              placeholder="All Categories"
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[44px]",
              }}
            >
              <SelectItem key="" value="">All Categories</SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem key={cat._id} value={cat._id} textValue={cat.name}>
                  {cat?.name}
                </SelectItem>
              )) as any}
            </Select>
            <Select
              label="Items per page"
              selectedKeys={[String(limit)]}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[44px]",
              }}
            >
              <SelectItem key="6" value="6">6</SelectItem>
              <SelectItem key="10" value="10">10</SelectItem>
              <SelectItem key="20" value="20">20</SelectItem>
              <SelectItem key="50" value="50">50</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Filter Tabs */}
      <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
        <CardBody className="p-3 sm:p-4 overflow-x-auto">
          <Tabs
            selectedKey={filterStatus}
            onSelectionChange={(key) => {
              setFilterStatus(key as "all" | "pending" | "approved");
              setPage(1);
            }}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-4 sm:gap-6 w-full",
              cursor: "w-full bg-gradient-to-r from-primary-500 to-blue-500",
              tab: "min-h-[44px] px-3 sm:px-4",
              tabContent: "text-sm sm:text-base font-semibold"
            }}
          >
            <Tab key="all" title="All Courses" />
            <Tab key="pending" title="Pending Approval" />
            <Tab key="approved" title="Approved" />
          </Tabs>
        </CardBody>
      </Card>

      {/* Loading Indicator */}
      {isFetching && (
        <div className="flex justify-center mb-4">
          <Spinner size="lg" />
        </div>
      )}

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardBody className="p-0">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="shadow-xl border-2 border-gray-200">
          <CardBody className="p-10 sm:p-12 lg:p-16 text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBook className="text-4xl sm:text-5xl text-indigo-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
              No courses found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedCategory || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No courses available yet"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardBody className="p-0">
                {course.thumbnail && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {course.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Chip color="warning" variant="solid" size="sm" startContent={<FaStar />}>
                          Featured
                        </Chip>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-bold text-base sm:text-lg line-clamp-2 flex-1">{course.title}</h3>
                    {course.isAdminApproved ? (
                      <Chip color="success" variant="flat" size="sm" className="flex-shrink-0">
                        Approved
                      </Chip>
                    ) : (
                      <Chip color="warning" variant="flat" size="sm" className="flex-shrink-0">
                        Pending
                      </Chip>
                    )}
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Chip size="sm" variant="flat" color="primary">
                      {String(course.category || "")}
                    </Chip>
                    <Chip size="sm" variant="flat">
                      {String(course.level || "")}
                    </Chip>
                    <Chip size="sm" variant="flat" color={course.isPublished ? "success" : "default"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Chip>
                  </div>
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-gray-700 font-semibold">
                      BDT {course.price} • {course.modules?.length || 0} Modules
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Instructor: {
                        (() => {
                          const instructor = course.instructorId || course.instructor;
                          if (typeof instructor === 'string') return instructor;
                          if (typeof instructor === 'object' && instructor) {
                            return (instructor as any).name || (instructor as any).fullName || (instructor as any).email || "Unknown";
                          }
                          return course.instructorName || "Unknown";
                        })()
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="md"
                      color="primary"
                      variant="flat"
                      onPress={() => handleView(course)}
                      startContent={<FaEye />}
                      className="flex-1 min-h-[44px] font-semibold"
                    >
                      Details
                    </Button>
                    <Button
                      size="md"
                      color="default"
                      variant="flat"
                      onPress={() => router.push(`/admin/courses/edit?id=${course._id}`)}
                      startContent={<FaEdit />}
                      className="flex-1 min-h-[44px] font-semibold"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {!course.isAdminApproved ? (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isLoading={isApproving}
                        onPress={() => handleApprove(course._id)}
                        startContent={<FaCheck />}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        isLoading={isRejecting}
                        onPress={() => handleReject(course._id)}
                        startContent={<FaTimes />}
                        className="flex-1"
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isLoading={isDeleting}
                      onPress={() => handleDelete(course._id)}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6 shadow-lg border border-gray-200">
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button
                  size="md"
                  isDisabled={page === 1}
                  variant="flat"
                  className="text-sm sm:text-base font-semibold px-4 min-h-[44px] hover:bg-primary-50 transition-colors"
                  onPress={() => setPage(Math.max(1, page - 1))}
                >
                  ← Previous
                </Button>

                <div className="hidden sm:flex gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else {
                      const startPage = Math.max(1, Math.min(page - 3, totalPages - 6));
                      pageNum = startPage + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        size="md"
                        color={page === pageNum ? "primary" : "default"}
                        variant={page === pageNum ? "solid" : "flat"}
                        className={`text-sm font-semibold px-3 min-w-[44px] min-h-[44px] ${page === pageNum ? "shadow-lg" : ""
                          }`}
                        onPress={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  size="md"
                  isDisabled={page === totalPages}
                  variant="flat"
                  className="text-sm sm:text-base font-semibold px-4 min-h-[44px] hover:bg-primary-50 transition-colors"
                  onPress={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Next →
                </Button>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 font-medium text-center bg-gray-50 px-4 py-2 rounded-full">
                Page <span className="font-bold text-primary-600">{page}</span> of <span className="font-bold">{totalPages}</span> • Total: <span className="font-bold text-primary-600">{totalCourses}</span> courses
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Course Details Modal - Keeping existing implementation */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            {activeCourse && (
              <div className="flex items-center gap-3">
                {activeCourse.thumbnail && (
                  <img
                    src={activeCourse.thumbnail}
                    className="w-16 h-16 rounded object-cover"
                    alt={activeCourse.title}
                  />
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {activeCourse.title}
                  </h2>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {activeCourse.isAdminApproved ? (
                      <Chip color="success" variant="flat" size="sm">
                        Approved
                      </Chip>
                    ) : (
                      <Chip color="warning" variant="flat" size="sm">
                        Pending Approval
                      </Chip>
                    )}
                    <Chip
                      color={activeCourse.isPublished ? "success" : "default"}
                      variant="flat"
                      size="sm"
                    >
                      {activeCourse.isPublished ? "Published" : "Draft"}
                    </Chip>
                  </div>
                  <p className="text-sm text-white/90 mt-1">
                    Instructor: {
                      (() => {
                        const instructor = activeCourse.instructorId || activeCourse.instructor;
                        if (typeof instructor === 'string') return instructor;
                        if (typeof instructor === 'object' && instructor) {
                          return (instructor as any).name || (instructor as any).fullName || (instructor as any).email || "Unknown";
                        }
                        return activeCourse.instructorName || "Unknown";
                      })()
                    }
                  </p>
                </div>
              </div>
            )}
          </ModalHeader>
          <ModalBody className="p-6">
            {(isFetchingSelectedCourse || isFetchingModules) && (
              <div className="flex justify-center py-6">
                <Spinner size="lg" />
              </div>
            )}
            {activeCourse && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <div
                    className="text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(activeCourse.description || "")) }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">
                      BDT {activeCourse.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold">{activeCourse.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-semibold">{activeCourse.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modules</p>
                    <p className="font-semibold">
                      {activeModules?.length || activeCourse.modulesCount || 0}
                    </p>
                  </div>
                </div>

                {/* Modules and Lessons Accordion */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Course Curriculum</h3>
                  {activeModules && activeModules.length > 0 ? (
                    <Accordion variant="bordered">
                      {activeModules.map((module: any, moduleIndex: number) => (
                        <AccordionItem
                          key={module._id}
                          title={
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  Module {moduleIndex + 1}: {module.title}
                                </span>
                                {module.isPublished ? (
                                  <Chip color="success" variant="flat" size="sm">
                                    Published
                                  </Chip>
                                ) : (
                                  <Chip color="default" variant="flat" size="sm">
                                    Draft
                                  </Chip>
                                )}
                              </div>
                              <Chip size="sm" variant="flat">
                                {module.lessons?.length || 0} Lessons
                              </Chip>
                            </div>
                          }
                        >
                          <div className="pl-4 space-y-2">
                            {module.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {module.description}
                              </p>
                            )}
                            {module.lessons && module.lessons.length > 0 ? (
                              <div className="space-y-2">
                                {module.lessons.map((lesson: any, lessonIndex: number) => (
                                  <Card key={lesson._id} className="bg-gray-50">
                                    <CardBody className="py-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          {lesson.type === "video" ? (
                                            <FaVideo className="text-blue-500" />
                                          ) : lesson.type === "pdf" ? (
                                            <FaFileAlt className="text-red-500" />
                                          ) : lesson.type === "quiz" ? (
                                            <span className="text-purple-500">📝</span>
                                          ) : (
                                            <span className="text-green-500">📄</span>
                                          )}
                                          <div>
                                            <p className="font-medium">
                                              {lessonIndex + 1}. {lesson.title}
                                            </p>
                                            <div className="flex gap-2 mt-1 flex-wrap">
                                              <Chip size="sm" variant="flat" color="primary">
                                                {lesson.type}
                                              </Chip>
                                              {lesson.isPublished ? (
                                                <Chip color="success" variant="flat" size="sm">
                                                  Published
                                                </Chip>
                                              ) : (
                                                <Chip color="default" variant="flat" size="sm">
                                                  Draft
                                                </Chip>
                                              )}
                                              {lesson.isFreePreview && (
                                                <Chip color="secondary" variant="flat" size="sm">
                                                  Free Preview
                                                </Chip>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {lesson.description && (
                                        <p className="text-sm text-gray-600 mt-2 ml-9">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </CardBody>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No lessons added yet
                              </p>
                            )}
                          </div>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-gray-500 italic">No modules added yet</p>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex gap-3 pt-4 border-t flex-wrap">
                  <Button
                    color={activeCourse.isPublished ? "warning" : "success"}
                    variant="flat"
                    isLoading={isUpdatingCourse}
                    onPress={() => handleTogglePublish(activeCourse._id, activeCourse.isPublished)}
                    size="md"
                    className="min-h-[44px]"
                  >
                    {activeCourse.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    color="default"
                    variant="flat"
                    startContent={<FaEdit />}
                    onPress={() => router.push(`/admin/courses/edit?id=${activeCourse._id}`)}
                    size="md"
                    className="min-h-[44px]"
                  >
                    Edit Course
                  </Button>
                  <Button
                    color={activeCourse.isFeatured ? "secondary" : "default"}
                    variant="flat"
                    onPress={() => handleToggleFeatured(activeCourse._id, activeCourse.isFeatured)}
                    isLoading={isUpdatingCourse}
                    size="md"
                    className="min-h-[44px]"
                  >
                    {activeCourse.isFeatured ? "Unfeature" : "Mark Featured"}
                  </Button>
                  {!activeCourse.isAdminApproved ? (
                    <Button
                      color="success"
                      onPress={() => {
                        handleApprove(activeCourse._id);
                        handleCloseModal();
                      }}
                      isLoading={isApproving}
                      startContent={<FaCheck />}
                      size="md"
                      className="min-h-[44px]"
                    >
                      Approve Course
                    </Button>
                  ) : (
                    <Button
                      color="warning"
                      onPress={() => {
                        handleReject(activeCourse._id);
                        handleCloseModal();
                      }}
                      isLoading={isRejecting}
                      startContent={<FaTimes />}
                      size="md"
                      className="min-h-[44px]"
                    >
                      Revoke Approval
                    </Button>
                  )}
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      handleDelete(activeCourse._id);
                      handleCloseModal();
                    }}
                    isLoading={isDeleting}
                    size="md"
                    className="min-h-[44px]"
                  >
                    Delete Course
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-gray-200">
            <Button
              color="primary"
              variant="light"
              onPress={handleCloseModal}
              size="lg"
              className="min-h-[44px] font-semibold"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
