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
    isPublished: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        modules: [], // Start with empty modules
      };

      console.log("Creating course:", payload);
      const res = await createCourse(payload).unwrap();
      console.log("Response:", res);
      alert("Course created successfully!");
      router.push("/admin/courses");
    } catch (error: any) {
      console.error("Create failed:", error);
      alert(
        `Failed to create course: ${error?.data?.message || error?.message}`
      );
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
              <Input
                label="Course Title"
                placeholder="e.g., Advanced React Development"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isRequired
                variant="bordered"
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
                />

                <Select
                  label="Level"
                  placeholder="Select difficulty level"
                  selectedKeys={[formData.level]}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  variant="bordered"
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

              <Input
                label="Category"
                placeholder="e.g., Programming, Robotics, Math"
                name="category"
                value={formData.category}
                onChange={handleChange}
                isRequired
                variant="bordered"
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
