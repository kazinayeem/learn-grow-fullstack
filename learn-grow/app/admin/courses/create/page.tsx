"use client";

import React, { useState } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCreateCourseMutation } from "@/redux/api/courseApi";

export default function CreateCoursePage() {
  const router = useRouter();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // client-side validation
      const nextErrors: Record<string, string> = {};
      if (!formData.title || formData.title.trim().length < 5) {
        nextErrors.title = "Title must be at least 5 characters";
      }
      if (!formData.description || formData.description.trim().length < 20) {
        nextErrors.description = "Description must be at least 20 characters";
      }
      if (!formData.price) {
        nextErrors.price = "Price is required";
      }
      if (!formData.level) {
        nextErrors.level = "Level is required";
      }
      if (!formData.category) {
        nextErrors.category = "Category is required";
      }
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        registrationDeadline: formData.registrationDeadline || undefined,
        modules: [], // Start with empty modules
      };

      console.log("Creating course:", payload);
      const res = await createCourse(payload).unwrap();
      console.log("Response:", res);
      alert("Course created successfully!");
      router.push("/admin/courses");
    } catch (error: any) {
      console.error("Create failed:", error);
      const apiErrors = error?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const fieldErrors: Record<string, string> = {};
        apiErrors.forEach((err: any) => {
          const field = (err.field || "general").split(".").pop();
          fieldErrors[field!] = err.message || "Invalid value";
        });
        setErrors(fieldErrors);
      } else if (error?.status === 401) {
        setErrors({ general: "You are not authenticated. Please login and try again." });
      } else if (error?.status === 403) {
        setErrors({ general: "Access denied. Admin or approved instructor required." });
      } else {
        setErrors({ general: error?.data?.message || error?.message || "Something went wrong. Please try again." });
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button variant="light" onPress={() => router.back()} className="mb-6">
          ← Back to Admin
        </Button>

        <Card>
          <CardHeader className="flex-col items-start p-6">
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <p className="text-gray-600">
              Fill in the details to create a new course
            </p>
          </CardHeader>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {errors.general}
                </div>
              )}
              <Input
                label="Course Title"
                placeholder="e.g., Advanced React Development"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isRequired
                variant="bordered"
                isInvalid={!!errors.title}
                errorMessage={errors.title}
              />

              <Textarea
                label="Description"
                placeholder="Describe what students will learn..."
                name="description"
                value={formData.description}
                onChange={handleChange}
                minRows={4}
                isRequired
                variant="bordered"
                isInvalid={!!errors.description}
                errorMessage={errors.description}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="number"
                  label="Price (BDT)"
                  placeholder="1500"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  isRequired
                  variant="bordered"
                  isInvalid={!!errors.price}
                  errorMessage={errors.price}
                />

                <Select
                  label="Level"
                  placeholder="Select difficulty level"
                  selectedKeys={new Set([formData.level])}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFormData({ ...formData, level: value });
                  }}
                  variant="bordered"
                  isInvalid={!!errors.level}
                  errorMessage={errors.level}
                >
                  <SelectItem key="Beginner" value="Beginner">
                    Beginner
                  </SelectItem>
                  <SelectItem key="Intermediate" value="Intermediate">
                    Intermediate
                  </SelectItem>
                  <SelectItem key="Advanced" value="Advanced">
                    Advanced
                  </SelectItem>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Course Type" selectedKeys={new Set([formData.type])} onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, type: value });
                }} variant="bordered">
                  <SelectItem key="live" value="live">Live</SelectItem>
                  <SelectItem key="recorded" value="recorded">Recorded</SelectItem>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Open Registration?</span>
                  <Switch isSelected={!!formData.isRegistrationOpen} onValueChange={(isSelected) => setFormData({ ...formData, isRegistrationOpen: isSelected })} />
                </div>
              </div>
              <Input label="Registration Deadline" type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} variant="bordered" description="Optional: deadline to allow registrations (for live courses)" />

              <Input
                label="Category"
                placeholder="e.g., Programming, Robotics, Math"
                name="category"
                value={formData.category}
                onChange={handleChange}
                isRequired
                variant="bordered"
                isInvalid={!!errors.category}
                errorMessage={errors.category}
              />

              <Input
                label="Thumbnail URL"
                placeholder="https://example.com/image.jpg"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                variant="bordered"
                description="Direct link to course image"
              />

              <div className="flex items-center gap-2">
                <span className="text-sm">Publish Immediately?</span>
                <Switch
                  isSelected={formData.isPublished}
                  onValueChange={(isSelected) =>
                    setFormData({ ...formData, isPublished: isSelected })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Create Course
                </Button>
                <Button
                  type="button"
                  variant="bordered"
                  size="lg"
                  onPress={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
