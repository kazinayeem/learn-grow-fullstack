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
import { FaSearch, FaCheck, FaTimes, FaEye, FaVideo, FaFileAlt, FaTrash, FaEdit, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ManageCoursesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
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
  const totalCourses = data?.data?.total || data?.total || courseList.length;
  const totalPages = Math.ceil(totalCourses / limit);

  // Debug: Log course data to see structure
  React.useEffect(() => {
    if (courseList.length > 0) {
      console.log("Sample course data:", courseList[0]);
    }
  }, [courseList]);

  // No need for client-side filtering anymore - backend handles it
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
    total: courseList.length,
    pending: courseList.filter((c) => !c.isAdminApproved).length,
    approved: courseList.filter((c) => c.isAdminApproved).length,
    published: courseList.filter((c) => c.isPublished && c.isAdminApproved).length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-gray-600">Manage all courses, approve or reject submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-3xl font-bold text-primary">{totalCourses}</p>
            <p className="text-gray-600 mt-1">Total Courses</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-3xl font-bold text-warning">{stats.pending}</p>
            <p className="text-gray-600 mt-1">Pending Approval</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-3xl font-bold text-success">{stats.approved}</p>
            <p className="text-gray-600 mt-1">Approved</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <p className="text-3xl font-bold text-secondary">{stats.published}</p>
            <p className="text-gray-600 mt-1">Live & Published</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Limit Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search courses by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="lg"
          startContent={<span>🔍</span>}
          variant="bordered"
          className="flex-1"
          isClearable
          onClear={() => setSearchTerm("")}
        />
        <Select
          label="Category"
          placeholder="All Categories"
          selectedKeys={selectedCategory ? [selectedCategory] : []}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
          size="lg"
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
          className="w-full sm:w-32"
          size="lg"
        >
          <SelectItem key="10" value="10">10</SelectItem>
          <SelectItem key="20" value="20">20</SelectItem>
          <SelectItem key="50" value="50">50</SelectItem>
          <SelectItem key="100" value="100">100</SelectItem>
        </Select>
      </div>

      {/* Filter Tabs */}
      <Tabs
        selectedKey={filterStatus}
        onSelectionChange={(key) => {
          setFilterStatus(key as "all" | "pending" | "approved");
          setPage(1);
        }}
        className="mb-6"
        color="primary"
      >
        <Tab key="all" title="All Courses" />
        <Tab key="pending" title="Pending Approval" />
        <Tab key="approved" title="Approved" />
      </Tabs>

      {/* Loading Indicator */}
      {isFetching && (
        <div className="flex justify-center mb-4">
          <Spinner size="sm" />
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardBody className="p-0">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
                  {course.isAdminApproved ? (
                    <Chip color="success" variant="flat" size="sm">
                      Approved
                    </Chip>
                  ) : (
                    <Chip color="warning" variant="flat" size="sm">
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
                  <Chip size="sm" variant="flat">
                    Type: {String(course.type || "recorded")}
                  </Chip>
                  <Chip size="sm" variant="flat" color={course.isRegistrationOpen ? "success" : "default"}>
                    {course.isRegistrationOpen ? "Reg. Open" : "Reg. Closed"}
                  </Chip>
                  <Chip size="sm" variant="flat" color={course.isPublished ? "success" : "default"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Chip>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>BDT {course.price}</strong> • {course.modules?.length || 0} Modules
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Instructor: {
                      typeof course.instructorId === 'object' && course.instructorId 
                        ? (course.instructorId.name || course.instructorId.email || course.instructorId._id)
                        : (course.instructorName || course.instructor?.name || String(course.instructorId || "Unknown"))
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => handleView(course)}
                    startContent={<FaEye />}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="bordered"
                    onPress={() => router.push(`/admin/courses/${course._id}/instor`)}
                  >
                    Open Details Page
                  </Button>
                  <Button
                    size="sm"
                    color="default"
                    variant="flat"
                    onPress={() => router.push(`/admin/courses/edit?id=${course._id}`)}
                    startContent={<FaEdit />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color={course.isPublished ? "warning" : "success"}
                    variant="flat"
                    isLoading={isUpdatingCourse}
                    onPress={() => handleTogglePublish(course._id, course.isPublished)}
                  >
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    color={course.isFeatured ? "secondary" : "default"}
                    variant="flat"
                    isLoading={isUpdatingCourse}
                    onPress={() => handleToggleFeatured(course._id, course.isFeatured)}
                  >
                    {course.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  {!course.isAdminApproved ? (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      isLoading={isApproving}
                      onPress={() => handleApprove(course._id)}
                      startContent={<FaCheck />}
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
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && !isFetching && (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-gray-500">No courses found</p>
          </CardBody>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 mb-6">
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            showControls
            color="primary"
            size="lg"
          />
        </div>
      )}

      {/* Course Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
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
                  <h2 className="text-2xl font-bold">
                    {activeCourse.title}
                  </h2>
                  <div className="flex gap-2 mt-1">
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
                  <p className="text-sm text-gray-500 mt-1">
                    Instructor: {activeCourse?.instructorName || activeCourse?.instructor?.name || activeCourse?.instructor?.fullName || activeCourse?.instructorId || "Unknown"}
                  </p>
                </div>
              </div>
            )}
          </ModalHeader>
          <ModalBody>
            {isFetchingSelectedCourse && (
              <div className="flex justify-center py-6">
                <Spinner size="md" />
              </div>
            )}
            {isFetchingModules && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div>
                    <p className="text-sm text-gray-600">Lessons</p>
                    <p className="font-semibold">
                      {activeModules?.reduce((sum: number, m: any) => sum + (m?.lessons?.length || 0), 0) || activeCourse.lessonsCount || 0}
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
                                            <div className="flex gap-2 mt-1">
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
                  >
                    {activeCourse.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    color="default"
                    variant="flat"
                    startContent={<FaEdit />}
                    onPress={() => router.push(`/admin/courses/edit?id=${activeCourse._id}`)}
                  >
                    Edit Course
                  </Button>
                  <Button
                    color={activeCourse.isFeatured ? "secondary" : "default"}
                    variant="flat"
                    onPress={() => handleToggleFeatured(activeCourse._id, activeCourse.isFeatured)}
                    isLoading={isUpdatingCourse}
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
                  >
                    Delete Course
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="light" onPress={handleCloseModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
