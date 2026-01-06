"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Switch,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery, useCreateCategoryMutation } from "@/redux/api/categoryApi";
import {
  FaPlus,
  FaArrowLeft,
  FaBook,
  FaMoneyBillWave,
  FaGraduationCap,
  FaImage,
  FaVideo,
  FaSave,
  FaTimes,
  FaTags,
  FaInfoCircle,
  FaCalendarAlt
} from "react-icons/fa";
import { toast } from "react-toastify";

function EditCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const { data: courseData, isLoading: isFetching } = useGetCourseByIdQuery(
    courseId ?? "",
    {
      skip: !courseId,
    }
  );

  const course = courseData?.data;
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
    category: "",
    thumbnail: "",
    type: "recorded",
    isRegistrationOpen: false,
    registrationDeadline: "",
    isPublished: true,
  });

  useEffect(() => {
    if (course) {
      const categoryValue = typeof course.category === 'object' && course.category?._id
        ? course.category._id
        : course.category || "";

      setFormData({
        title: course.title || "",
        description: course.description || "",
        price: String(course.price || ""),
        level: course.level || "Beginner",
        category: categoryValue,
        thumbnail: course.thumbnail || "",
        type: course.type || "recorded",
        isRegistrationOpen: !!course.isRegistrationOpen,
        registrationDeadline: course.registrationDeadline ? new Date(course.registrationDeadline).toISOString().split('T')[0] : "",
        isPublished: course.isPublished ?? true,
      });
    }
  }, [course]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const result = await createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
      }).unwrap();
      const newCategoryId = result.data?._id || result._id;
      setFormData({ ...formData, category: newCategoryId });
      setNewCategoryName("");
      setNewCategoryDescription("");
      onClose();
      toast.success("Category created successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    try {
      const payload = {
        id: courseId,
        ...formData,
        price: Number(formData.price),
        registrationDeadline: formData.registrationDeadline || undefined,
      };

      await updateCourse(payload).unwrap();
      toast.success("Course updated successfully!");
      router.push("/admin/courses");
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Failed to update course: ${error?.data?.message || error?.message}`);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Spinner size="lg" label="Loading course details..." color="secondary" />
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Card className="border-2 border-red-500 max-w-lg w-full shadow-xl">
          <CardBody className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Missing Course ID</h2>
            <Button color="primary" onPress={() => router.push("/admin/courses")} size="lg">
              Return to Courses
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      {/* Modern Header */}
      <div className="mb-8 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin/courses")}
            className="mb-4 text-white/90 hover:bg-white/20"
          >
            Back to Courses
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <FaBook className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Course</h1>
              <p className="text-teal-100 mt-1">Updating content for "{formData.title || "Course"}"</p>
            </div>
          </div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaInfoCircle className="text-teal-600" />
                Course Details
              </h2>
              <div className="space-y-6">
                <Input
                  label="Course Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isRequired
                  variant="bordered"
                  startContent={<FaBook className="text-gray-400" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Rich Text)</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                    <ReactQuill
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ color: [] }, { background: [] }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "image"],
                          ["clean"],
                        ],
                      }}
                      theme="snow"
                      className="bg-white min-h-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Curriculum & Pricing */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaTags className="text-emerald-600" />
                Pricing & Category
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  type="number"
                  label="Price (BDT)"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  isRequired
                  variant="bordered"
                  startContent={<span className="text-gray-500 font-bold">৳</span>} // BDT Symbol
                />

                <Select
                  label="Level"
                  selectedKeys={new Set([formData.level])}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFormData({ ...formData, level: value });
                  }}
                  variant="bordered"
                  startContent={<FaGraduationCap className="text-gray-400" />}
                >
                  <SelectItem key="Beginner" startContent={<span className="text-green-500">🌱</span>}>Beginner</SelectItem>
                  <SelectItem key="Intermediate" startContent={<span className="text-blue-500">🚀</span>}>Intermediate</SelectItem>
                  <SelectItem key="Advanced" startContent={<span className="text-purple-500">🏆</span>}>Advanced</SelectItem>
                </Select>
              </div>

              <div className="flex gap-2 items-end">
                <Select
                  label="Category"
                  placeholder={isCategoriesLoading ? "Loading..." : "Select a category"}
                  selectedKeys={formData.category ? new Set([formData.category]) : new Set()}
                  onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] as string })}
                  variant="bordered"
                  className="flex-1"
                  isRequired
                  isLoading={isCategoriesLoading}
                  startContent={<FaTags className="text-gray-400" />}
                >
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </Select>
                <Button
                  isIconOnly
                  color="secondary"
                  variant="flat"
                  onPress={onOpen}
                  className="min-w-[56px] min-h-[56px]"
                  title="Create new category"
                >
                  <FaPlus />
                </Button>
              </div>
            </CardBody>
          </Card>

        </div>

        {/* Right Column: Media, Settings, Actions */}
        <div className="space-y-6">

          {/* Media Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaImage className="text-blue-600" />
                Course Media
              </h2>

              {formData.thumbnail ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 mb-4 bg-gray-50 relative group">
                  <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                    Preview
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl border border-dashed border-gray-300 mb-4 bg-gray-50 flex items-center justify-center text-gray-400 flex-col gap-2">
                  <FaImage size={32} />
                  <span className="text-xs">No thumbnail provided</span>
                </div>
              )}

              <Input
                label="Thumbnail URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                variant="bordered"
                startContent={<FaImage className="text-gray-400" />}
              />
            </CardBody>
          </Card>

          {/* Settings Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaVideo className="text-red-500" />
                Delivery Settings
              </h2>

              <div className="space-y-4">
                <Select label="Course Type" selectedKeys={new Set([formData.type])} onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, type: value });
                }} variant="bordered" startContent={<FaVideo className="text-gray-400" />}>
                  <SelectItem key="live" startContent={<span className="text-red-500">🔴</span>}>Live</SelectItem>
                  <SelectItem key="recorded" startContent={<span className="text-blue-500">📹</span>}>Recorded</SelectItem>
                </Select>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Open Registration</span>
                    <span className="text-xs text-gray-500">Allow new students</span>
                  </div>
                  <Switch isSelected={!!formData.isRegistrationOpen} onValueChange={(isSelected) => setFormData({ ...formData, isRegistrationOpen: isSelected })} color="success" size="sm" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Publish Course</span>
                    <span className="text-xs text-gray-500">Visible to students</span>
                  </div>
                  <Switch isSelected={formData.isPublished} onValueChange={(isSelected) => setFormData({ ...formData, isPublished: isSelected })} color="primary" size="sm" />
                </div>

                <Input
                  label="Registration Deadline"
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  variant="bordered"
                  startContent={<FaCalendarAlt className="text-gray-400" />}
                  className={!formData.isRegistrationOpen ? "opacity-50 pointer-events-none" : ""}
                />
              </div>
            </CardBody>
          </Card>

          {/* Sticky Actions */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 sticky bottom-4 z-20">
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full mb-3 font-bold text-lg shadow-lg bg-gradient-to-r from-teal-600 to-green-600 border-none"
              startContent={<FaSave />}
              isLoading={isUpdating}
            >
              Update Course
            </Button>
            <Button
              variant="flat"
              color="danger"
              size="lg"
              onPress={() => router.push("/admin/courses")}
              className="w-full font-medium"
              startContent={<FaTimes />}
            >
              Cancel
            </Button>
          </div>

        </div>

      </form>

      {/* Create Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="text-xl font-bold text-gray-800">Create New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="e.g., Web Development"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
              variant="bordered"
            />
            <Input
              label="Description (Optional)"
              placeholder="Brief description of this category"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" color="danger" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreateCategory} isLoading={isCreatingCategory}>
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function EditCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" label="Loading..." />
        </div>
      }
    >
      <EditCourseContent />
    </Suspense>
  );
}
