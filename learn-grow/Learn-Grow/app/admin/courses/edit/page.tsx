"use client";

import React, { useState, useEffect, Suspense } from "react";

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
  Spinner,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} from "@/redux/api/courseApi";

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

  // courseData is { statusCode: 200, success: true, data: { ... } }
  const course = courseData?.data;

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "Beginner",
    category: "",
    thumbnail: "",
    isPublished: true,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        price: String(course.price || ""),
        level: course.level || "Beginner",
        category: course.category || "",
        thumbnail: course.thumbnail || "",
        isPublished: course.isPublished ?? true,
      });
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    try {
      const payload = {
        id: courseId,
        ...formData,
        price: Number(formData.price),
      };

      await updateCourse(payload).unwrap();
      alert("Course updated successfully!");
      router.push("/admin/courses");
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(
        `Failed to update course: ${error?.data?.message || error?.message}`
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Button variant="light" onPress={() => router.back()} className="mb-6">
        ← Back to Course List
      </Button>

      <Card>
        <CardHeader className="flex-col items-start p-6">
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <p className="text-gray-600">Update course details</p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isRequired
              variant="bordered"
            />

            <Textarea
              label="Description"
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
                name="price"
                value={formData.price}
                onChange={handleChange}
                isRequired
                variant="bordered"
              />

              <Select
                label="Level"
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
              name="category"
              value={formData.category}
              onChange={handleChange}
              isRequired
              variant="bordered"
            />

            <Input
              label="Thumbnail URL"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              variant="bordered"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm">Is Published?</span>
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
                isLoading={isUpdating}
              >
                Update Course
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
  );
}

export default function EditCoursePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <EditCourseContent />
    </Suspense>
  );
}
