/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  CardHeader,
} from "@nextui-org/react";
import { useCreateCourseMutation } from "@/redux/api/courseApi";
import { useGetAllCategoriesQuery, useCreateCategoryMutation } from "@/redux/api/categoryApi";
import { FaPlus, FaCloudUploadAlt } from "react-icons/fa";
import Image from "next/image";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const COURSE_LANGUAGES = ["English", "Bangla", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Hindi", "Portuguese"];
const ACCESS_DURATIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "lifetime"];
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export default function InstructorCreateCoursePage() {
  const router = useRouter();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery(undefined);
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    type: "recorded" as "live" | "recorded",
    price: "",
    level: "Beginner",
    language: "English",
    duration: "",
    accessDuration: "lifetime",
    isRegistrationOpen: false,
    registrationDeadline: "",
    descriptionHtml: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setForm({ ...form, category: newCategoryId });
      setNewCategoryName("");
      setNewCategoryDescription("");
      onClose();
    } catch (err: any) {
      alert(err?.data?.message || "Failed to create category");
    }
  };

  const handleThumbnailFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, thumbnailUrl: "Please choose an image file" });
      return;
    }

    if (file.size > 1024 * 1024) {
      setErrors({ ...errors, thumbnailUrl: "File size must be less than 1MB" });
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview((e.target?.result as string) || "");
    };
    reader.readAsDataURL(file);
    setErrors({ ...errors, thumbnailUrl: "" });
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = () => {
    setIsDraggingThumbnail(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleThumbnailFileSelect(file);
    }
  };

  const onSubmit = async () => {
    setErrors({});
    const nextErrors: Record<string, string> = {};
    if (form.title.length < 5) nextErrors.title = "Min 5 characters";
    if (!form.descriptionHtml || form.descriptionHtml.replace(/<[^>]*>/g, "").length < 20) nextErrors.descriptionHtml = "Min 20 characters (rich text)";
    if (!form.price) nextErrors.price = "Required";
    if (!form.duration) nextErrors.duration = "Required";
    if (!thumbnailFile) nextErrors.thumbnailUrl = "Thumbnail image is required";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const instructorRaw = localStorage.getItem("user");
      const instructorId = instructorRaw ? JSON.parse(instructorRaw)?._id : undefined;

      // Create the course first without a thumbnail URL, then upload the image.
      const courseResult = await createCourse({
        title: form.title,
        description: form.descriptionHtml,
        category: form.category,
        type: form.type,
        price: parseInt(form.price),
        level: form.level,
        language: form.language,
        duration: parseInt(form.duration),
        accessDuration: form.accessDuration,
        isRegistrationOpen: !!form.isRegistrationOpen,
        registrationDeadline: form.registrationDeadline
          ? new Date(form.registrationDeadline + "T00:00:00.000Z").toISOString()
          : undefined,
        instructorId,
      } as any).unwrap();

      const newCourseId = courseResult.data?._id || courseResult._id;
      if (newCourseId && thumbnailFile) {
        const body = new FormData();
        body.append("thumbnail", thumbnailFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/course/upload-thumbnail/${newCourseId}`, {
          method: "POST",
          body,
          credentials: "include",
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success) {
          console.log("Thumbnail upload failed after course creation:", uploadResult?.message || uploadResponse.statusText);
        }
      }

      router.push("/instructor/courses");
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const fieldErrors: Record<string, string> = {};
        apiErrors.forEach((er: any) => {
          const field = er.field?.split(".").pop() || "general";
          fieldErrors[field] = er.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Failed to create course" });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <Button variant="flat" onPress={() => router.push("/instructor/courses")}>Back</Button>
      </div>

      {errors.general && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700">{errors.general}</div>
      )}

      <Card>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} isInvalid={!!errors.title} errorMessage={errors.title} />
            <div className="flex gap-2">
              <Select
                label="Category"
                placeholder={isCategoriesLoading ? "Loading..." : "Select a category"}
                selectedKeys={form.category ? new Set([form.category]) : new Set()}
                onSelectionChange={(keys) => setForm({ ...form, category: Array.from(keys)[0] as string })}
                className="flex-1"
                disallowEmptySelection={false}
                isLoading={isCategoriesLoading}
              >
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </Select>
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                onPress={onOpen}
                className="mt-6"
                title="Create new category"
              >
                <FaPlus />
              </Button>
            </div>
            <Select label="Type" selectedKeys={new Set([form.type])} onSelectionChange={(keys) => setForm({ ...form, type: Array.from(keys)[0] as any })}>
              <SelectItem key="live">Live</SelectItem>
              <SelectItem key="recorded">Recorded</SelectItem>
            </Select>
            <Input label="Price (BDT)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} isInvalid={!!errors.price} errorMessage={errors.price} />
            <Input label="Duration (hours)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} isInvalid={!!errors.duration} errorMessage={errors.duration} />
            <Select label="Level" selectedKeys={new Set([form.level])} onSelectionChange={(keys) => setForm({ ...form, level: Array.from(keys)[0] as any })}>
              {COURSE_LEVELS.map((lvl) => (<SelectItem key={lvl}>{lvl}</SelectItem>))}
            </Select>
            <Select label="Language" selectedKeys={new Set([form.language])} onSelectionChange={(keys) => setForm({ ...form, language: Array.from(keys)[0] as any })}>
              {COURSE_LANGUAGES.map((lng) => (<SelectItem key={lng}>{lng}</SelectItem>))}
            </Select>
            <Select label="Access Duration" selectedKeys={new Set([form.accessDuration])} onSelectionChange={(keys) => setForm({ ...form, accessDuration: Array.from(keys)[0] as string })}>
              {ACCESS_DURATIONS.map((duration) => (<SelectItem key={duration}>{duration === "lifetime" ? "Lifetime Access" : `${duration} Month${duration !== "1" ? "s" : ""}`}</SelectItem>))}
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm">Open Registration?</span>
              <Switch isSelected={!!form.isRegistrationOpen} onValueChange={(v) => setForm({ ...form, isRegistrationOpen: v })} />
            </div>
            <Input label="Registration Deadline" type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Rich Text)</label>
            <ReactQuill
              value={form.descriptionHtml}
              onChange={(html) => setForm({ ...form, descriptionHtml: html })}
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
            {errors.descriptionHtml && <p className="text-red-600 text-sm mt-1">{errors.descriptionHtml}</p>}
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex-col items-start p-6 pb-2">
              <h3 className="text-lg font-semibold">Course Thumbnail</h3>
              <p className="text-sm text-gray-600">Max size: 1MB (JPEG, PNG, WebP)</p>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {thumbnailPreview && (
                <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 512px"
                  />
                </div>
              )}

              <div
                onDragOver={handleThumbnailDragOver}
                onDragLeave={handleThumbnailDragLeave}
                onDrop={handleThumbnailDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDraggingThumbnail
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400"
                }`}
              >
                <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">Drag & drop your thumbnail here</p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleThumbnailFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Button as="span" color="primary" variant="flat" className="cursor-pointer">
                    Choose Image
                  </Button>
                </label>
              </div>

              {thumbnailFile && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Ready to upload:</strong> {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="light" onPress={() => router.push("/instructor/courses")}>Cancel</Button>
            <Button color="primary" onPress={onSubmit} isLoading={isLoading}>Create</Button>
          </div>
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
            <Button color="primary" onPress={handleCreateCategory} isLoading={isCreatingCategory}>
              Create Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
