"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useCreateAssignmentMutation } from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";
import { FaSave, FaArrowLeft } from "react-icons/fa";

function CreateAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const typeParam = searchParams.get("type") || "assignment";

  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseId: courseIdParam || "",
    assessmentType: typeParam as "assignment" | "project",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxScore: 100,
  });

  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setInstructorId(user._id || user.id || null);
    }
  }, []);

  const { data: coursesResp, isLoading: isLoadingCourses } = useGetInstructorCoursesQuery(
    instructorId as string,
    {
      skip: !instructorId,
    }
  );

  const courses = Array.isArray(coursesResp?.data) ? coursesResp!.data : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter assignment title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter assignment description");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Please select due date");
      return;
    }

    try {
      await createAssignment(formData).unwrap();
      toast.success(`${formData.assessmentType === "project" ? "Project" : "Assignment"} created successfully`);
      router.push("/instructor/assessments");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create assignment");
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const isProject = formData.assessmentType === "project";

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>
        <h1 className="text-4xl font-bold mb-2">
          {isProject ? "Create Project 🎯" : "Create Assignment 📄"}
        </h1>
        <p className="text-gray-600">
          {isProject 
            ? "Create a new project for your students to work on"
            : "Create a new assignment for your course"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="bg-gray-100 p-6">
            <h2 className="text-xl font-semibold">
              {isProject ? "Project Details" : "Assignment Details"}
            </h2>
          </CardHeader>
          <CardBody className="gap-6 p-6">
            {/* Course Selection */}
            <Select
              label="Select Course *"
              placeholder="Choose a course"
              selectedKeys={formData.courseId ? [formData.courseId] : []}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              isRequired
              disableAnimation
            >
              {courses.map((course: any) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </Select>

            {/* Type Selection */}
            <Select
              label="Type *"
              selectedKeys={[formData.assessmentType]}
              onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value as "assignment" | "project" })}
              isRequired
              disableAnimation
            >
              <SelectItem key="assignment" value="assignment">
                Assignment
              </SelectItem>
              <SelectItem key="project" value="project">
                Project
              </SelectItem>
            </Select>

            {/* Title */}
            <Input
              label={`${isProject ? "Project" : "Assignment"} Title *`}
              placeholder={isProject ? "Enter project title" : "Enter assignment title"}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              isRequired
            />

            {/* Description */}
            <Textarea
              label="Description *"
              placeholder={isProject ? "Enter project description" : "Enter assignment description"}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              minRows={4}
              isRequired
            />

            {/* Instructions */}
            <Textarea
              label="Instructions (Optional)"
              placeholder="Enter detailed instructions for students"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              minRows={6}
              description={isProject 
                ? "Provide clear guidelines, requirements, and deliverables for the project"
                : "Provide step-by-step instructions for completing the assignment"}
            />

            {/* Due Date and Max Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                label="Due Date *"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                isRequired
              />

              <Input
                type="number"
                label="Maximum Score *"
                placeholder="100"
                value={formData.maxScore.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })
                }
                min={1}
                isRequired
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>📌 Note:</strong> Students will submit their work via Google Drive links. 
                Make sure to provide clear instructions on what format and content you expect.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end pt-4">
              <Button
                variant="bordered"
                onPress={() => router.back()}
                isDisabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                startContent={<FaSave />}
                isLoading={isCreating}
              >
                {isProject ? "Create Project" : "Create Assignment"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}

export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <CreateAssignmentContent />
    </Suspense>
  );
}
