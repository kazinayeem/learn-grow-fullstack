"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import "react-quill-new/dist/quill.snow.css";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCloudUploadAlt, FaPlus, FaTrash } from "react-icons/fa";
import { useGetCourseByIdQuery, useUpdateCourseMutation } from "@/redux/api/courseApi";
import { useCreateCategoryMutation, useGetAllCategoriesQuery } from "@/redux/api/categoryApi";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const ACCESS_DURATIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "lifetime"];
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

function EditInstructorCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  const { data: courseData, isLoading: isFetching } = useGetCourseByIdQuery(courseId ?? "", { skip: !courseId });
  const course = courseData?.data;

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
    category: "",
    thumbnail: "",
    isPublished: true,
    type: "recorded",
    accessDuration: "lifetime",
    isRegistrationOpen: false,
    registrationDeadline: "",
  });

  useEffect(() => {
    if (!course) return;

    const categoryValue = typeof course.category === "object" && course.category?._id
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
      accessDuration: course.accessDuration || "lifetime",
      isPublished: course.isPublished ?? true,
      isRegistrationOpen: !!course.isRegistrationOpen,
      registrationDeadline: course.registrationDeadline ? new Date(course.registrationDeadline).toISOString().slice(0, 10) : "",
    });
    setThumbnailPreview(course.thumbnail || "");
  }, [course]);

  const handleThumbnailFileSelect = (file: File) => {
    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile || !courseId) return;

    setIsUploadingThumbnail(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("thumbnail", thumbnailFile);

      const response = await fetch(`${API_BASE_URL}/course/upload-thumbnail/${courseId}`, {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        alert(result?.message || "Failed to upload thumbnail");
        return;
      }

      setFormData((prev) => ({ ...prev, thumbnail: result.data.thumbnailUrl }));
      setThumbnailFile(null);
      alert("Thumbnail uploaded successfully");
    } catch (error: any) {
      alert(`Upload failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleThumbnailDelete = async () => {
    if (!courseId || !formData.thumbnail) return;
    if (!confirm("Are you sure you want to delete the thumbnail?")) return;

    setIsUploadingThumbnail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/course/delete-thumbnail/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        alert(result?.message || "Failed to delete thumbnail");
        return;
      }

      setFormData((prev) => ({ ...prev, thumbnail: "" }));
      setThumbnailPreview("");
      setThumbnailFile(null);
      alert("Thumbnail deleted successfully");
    } catch (error: any) {
      alert(`Delete failed: ${error?.message || "Unknown error"}`);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const result = await createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
      }).unwrap();

      const newCategoryId = result.data?._id || result._id;
      setFormData((prev) => ({ ...prev, category: newCategoryId }));
      setNewCategoryName("");
      setNewCategoryDescription("");
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    try {
      const deadline = formData.registrationDeadline
        ? new Date(`${formData.registrationDeadline}T00:00:00.000Z`).toISOString()
        : undefined;

      const payload = {
        id: courseId,
        ...formData,
        price: Number(formData.price),
        registrationDeadline: deadline,
      } as any;

      await updateCourse(payload).unwrap();
      alert("Course updated successfully");
      router.push("/instructor/courses");
    } catch (error: any) {
      alert(`Failed to update course: ${error?.data?.message || error?.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isFetching) {
    return (
      <div className="flex justify-center p-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!courseId) {
    return <div className="p-10 text-center">No Course ID provided</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex gap-3">
        <Button variant="light" onPress={() => router.back()}>← Back</Button>
        <Button variant="flat" onPress={() => router.push("/instructor/courses")}>Back to My Courses</Button>
      </div>

      <Card>
        <CardHeader className="flex-col items-start p-6">
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <p className="text-gray-600">Update course details</p>
        </CardHeader>

        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Course Title" name="title" value={formData.title} onChange={handleChange} isRequired variant="bordered" />

            <div>
              <label className="mb-2 block text-sm font-medium">Description (Rich Text)</label>
              <ReactQuill
                value={formData.description}
                onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    ["blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    ["link", "image", "video"],
                    ["clean"],
                  ],
                }}
                theme="snow"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input type="number" label="Price (BDT)" name="price" value={formData.price} onChange={handleChange} isRequired variant="bordered" />

              <Select
                label="Level"
                selectedKeys={new Set([formData.level])}
                onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, level: Array.from(keys)[0] as string }))}
                variant="bordered"
              >
                <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex gap-2">
                <Select
                  label="Category"
                  placeholder={isCategoriesLoading ? "Loading..." : "Select a category"}
                  selectedKeys={formData.category ? new Set([formData.category]) : new Set()}
                  onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, category: Array.from(keys)[0] as string }))}
                  variant="bordered"
                  className="flex-1"
                  isLoading={isCategoriesLoading}
                >
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </Select>

                <Button isIconOnly color="primary" variant="flat" onPress={onOpen} className="mt-6" title="Create new category">
                  <FaPlus />
                </Button>
              </div>

              <Select
                label="Course Type"
                selectedKeys={new Set([formData.type])}
                onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, type: Array.from(keys)[0] as string }))}
                variant="bordered"
              >
                <SelectItem key="live" value="live">Live</SelectItem>
                <SelectItem key="recorded" value="recorded">Recorded</SelectItem>
              </Select>

              <Select
                label="Access Duration"
                selectedKeys={new Set([formData.accessDuration])}
                onSelectionChange={(keys) => setFormData((prev) => ({ ...prev, accessDuration: Array.from(keys)[0] as string }))}
                variant="bordered"
              >
                {ACCESS_DURATIONS.map((duration) => (
                  <SelectItem key={duration}>
                    {duration === "lifetime" ? "Lifetime Access" : `${duration} Month${duration !== "1" ? "s" : ""}`}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm">Open Registration?</span>
                <Switch
                  isSelected={!!formData.isRegistrationOpen}
                  onValueChange={(isSelected) => setFormData((prev) => ({ ...prev, isRegistrationOpen: isSelected }))}
                />
              </div>
            </div>

            <Input
              label="Registration Deadline"
              type="date"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              variant="bordered"
              description="Optional: deadline to allow registrations (for live courses)"
            />

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="flex-col items-start p-6 pb-2">
                <h3 className="text-lg font-semibold">Course Thumbnail</h3>
                <p className="text-sm text-gray-600">Max size: 1MB (JPEG, PNG, WebP)</p>
              </CardHeader>

              <CardBody className="space-y-4 p-6">
                {thumbnailPreview && (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 900px"
                    />
                  </div>
                )}

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingThumbnail(true);
                  }}
                  onDragLeave={() => setIsDraggingThumbnail(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingThumbnail(false);
                    const dropped = e.dataTransfer.files?.[0];
                    if (dropped) handleThumbnailFileSelect(dropped);
                  }}
                  className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDraggingThumbnail ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-gray-50 hover:border-blue-400"
                  }`}
                >
                  <FaCloudUploadAlt className="mx-auto mb-3 text-4xl text-gray-400" />
                  <p className="mb-1 font-medium text-gray-700">Drag and drop your thumbnail here</p>
                  <p className="mb-4 text-sm text-gray-500">or</p>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) handleThumbnailFileSelect(selected);
                      }}
                    />
                    <Button as="span" color="primary" variant="flat" className="cursor-pointer">Choose Image</Button>
                  </label>
                </div>

                {thumbnailFile && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="mb-3 text-sm text-yellow-800">
                      <strong>Ready:</strong> {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <Button
                      color="warning"
                      size="sm"
                      fullWidth
                      onClick={handleThumbnailUpload}
                      isLoading={isUploadingThumbnail}
                    >
                      Upload Thumbnail
                    </Button>
                  </div>
                )}

                {formData.thumbnail && !thumbnailFile && (
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    startContent={<FaTrash />}
                    onClick={handleThumbnailDelete}
                    isLoading={isUploadingThumbnail}
                  >
                    Delete Current Thumbnail
                  </Button>
                )}
              </CardBody>
            </Card>

            <div className="flex items-center gap-2">
              <span className="text-sm">Is Published?</span>
              <Switch
                isSelected={formData.isPublished}
                onValueChange={(isSelected) => setFormData((prev) => ({ ...prev, isPublished: isSelected }))}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" color="primary" size="lg" className="flex-1" isLoading={isUpdating}>Update Course</Button>
              <Button type="button" variant="bordered" size="lg" onPress={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Create New Category</ModalHeader>
          <ModalBody>
            <Input
              label="Category Name"
              placeholder="e.g., Web Development"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              isRequired
            />
            <Input
              label="Description (Optional)"
              placeholder="Brief description of this category"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Cancel</Button>
            <Button color="primary" onPress={handleCreateCategory} isLoading={isCreatingCategory}>Create Category</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function EditInstructorCoursePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}>
      <EditInstructorCourseContent />
    </Suspense>
  );
}
