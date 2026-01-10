/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
  Checkbox,
  Badge,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { useCreateComboMutation } from "@/redux/api/comboApi";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function CreateComboPage() {
  const router = useRouter();
  const [createCombo, { isLoading }] = useCreateComboMutation();
  const { data: coursesData, isLoading: isLoadingCourses } = useGetInstructorCoursesQuery(undefined);

  const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    discountPercentage: "",
    isActive: true,
  });

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const onSubmit = async () => {
    setErrors({});
    const e: Record<string, string> = {};

    if (form.name.length < 3) e.name = "Min 3 characters";
    if (form.description.length < 20) e.description = "Min 20 characters";
    if (!form.discountPercentage) e.discountPercentage = "Required";
    if (parseInt(form.discountPercentage) < 0 || parseInt(form.discountPercentage) > 100) {
      e.discountPercentage = "Must be between 0-100";
    }
    if (selectedCourses.length === 0) e.courses = "Select at least one course";

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      const instructorRaw = localStorage.getItem("user");
      const instructorId = instructorRaw ? JSON.parse(instructorRaw)?._id : undefined;

      await createCombo({
        name: form.name,
        description: form.description,
        courses: selectedCourses,
        discountPercentage: parseInt(form.discountPercentage),
        isActive: form.isActive,
        instructorId,
      } as any).unwrap();

      router.push("/instructor/combos");
    } catch (err: any) {
      setErrors({ general: err?.data?.message || "Failed to create combo" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Course Combo</h1>
        <Button variant="flat" onPress={() => router.push("/instructor/combos")}>
          Back
        </Button>
      </div>

      {errors.general && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700">
          {errors.general}
        </div>
      )}

      <Card>
        <CardBody className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Combo Name"
              placeholder="e.g., Web Development Mastery"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
            />
            <Input
              label="Discount Percentage"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 20"
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
              isInvalid={!!errors.discountPercentage}
              errorMessage={errors.discountPercentage}
              endContent={<span className="text-sm text-gray-500">%</span>}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe this combo and its benefits..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            isInvalid={!!errors.description}
            errorMessage={errors.description}
            minRows={4}
          />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Active</span>
            <Switch
              isSelected={form.isActive}
              onValueChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Courses</label>
            {errors.courses && (
              <p className="text-red-600 text-sm mb-2">{errors.courses}</p>
            )}

            {isLoadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <Spinner label="Loading your courses..." />
              </div>
            ) : courses.length === 0 ? (
              <Card className="bg-gray-50">
                <CardBody className="text-center text-gray-600">
                  <p>No courses found. Create a course first before creating a combo.</p>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courses.map((course: any) => (
                  <Card
                    key={course._id}
                    className={`cursor-pointer transition-all ${
                      selectedCourses.includes(course._id)
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border border-gray-200 hover:border-gray-300"
                    }`}
                    isPressable
                    onPress={() => handleCourseToggle(course._id)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{course.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {course.category?.name || "Uncategorized"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Chip size="sm" variant="flat" color="primary">
                              {course.level}
                            </Chip>
                            <Chip size="sm" variant="flat" color="success">
                              ৳{course.price}
                            </Chip>
                          </div>
                        </div>
                        <Checkbox
                          isSelected={selectedCourses.includes(course._id)}
                          onChange={() => handleCourseToggle(course._id)}
                          color="primary"
                        />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {selectedCourses.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected Courses ({selectedCourses.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.map((courseId) => {
                    const course = courses.find((c: any) => c._id === courseId);
                    return (
                      <Chip
                        key={courseId}
                        variant="flat"
                        color="primary"
                        onClose={() => handleCourseToggle(courseId)}
                        startContent={course && <span className="mr-1">{course.title}</span>}
                      >
                        {course?.title || courseId}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="light"
              onPress={() => router.push("/instructor/combos")}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={onSubmit}
              isLoading={isLoading}
              disabled={isLoadingCourses || courses.length === 0}
            >
              Create Combo
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
