"use client";

import React, { useState, useEffect, use } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import {
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation,
} from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import "@/styles/prose.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export default function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  // Fetch assignment data
  const {
    data: assignmentResp,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useGetAssignmentByIdQuery(id);
  const assignment = assignmentResp?.data;

  // Update mutation
  const [updateAssignment, { isLoading: updating }] =
    useUpdateAssignmentMutation();

  // Form state
  const [title, setTitle] = useState("");
  const [assessmentType, setAssessmentType] = useState<"assignment" | "project">("assignment");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [status, setStatus] = useState<"draft" | "published">("published");

  // Load assignment data into form
  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title || "");
      setAssessmentType(assignment.assessmentType || "assignment");
      setDescription(assignment.description || "");
      setInstructions(assignment.instructions || "");
      setMaxScore(assignment.maxScore?.toString() || "100");
      setStatus(assignment.status || "published");
      
      // Format date for input field (YYYY-MM-DD)
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        const formattedDate = date.toISOString().split("T")[0];
        setDueDate(formattedDate);
      }
    }
  }, [assignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!dueDate) {
      toast.error("Please select a due date");
      return;
    }

    const maxScoreNum = parseInt(maxScore);
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      toast.error("Please enter a valid max score");
      return;
    }

    try {
      await updateAssignment({
        id,
        title: title.trim(),
        assessmentType,
        description: description.trim(),
        instructions: instructions.trim(),
        dueDate: new Date(dueDate).toISOString(),
        maxScore: maxScoreNum,
        status,
      }).unwrap();

      toast.success("Assignment updated successfully!");
      router.push("/instructor/assessments");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update assignment");
    }
  };

  if (assignmentLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardBody className="p-8 text-center">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading assignment...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
          className="mb-6"
        >
          Back
        </Button>
        <Card className="border-2 border-red-200">
          <CardBody className="p-8 text-center">
            <p className="text-red-500">Assignment not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="light"
        startContent={<FaArrowLeft />}
        onPress={() => router.back()}
        className="mb-6"
      >
        Back to Assessments
      </Button>

      {/* Header */}
      <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <CardBody className="p-6">
          <h1 className="text-2xl font-bold">Edit Assignment</h1>
          <p className="text-blue-100 mt-1 text-sm">
            Update assignment details and settings
          </p>
        </CardBody>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader className="pb-0 pt-4 px-6">
            <h2 className="text-lg font-bold">Basic Information</h2>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {/* Title */}
            <Input
              label="Title"
              placeholder="Enter assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
            />

            {/* Assessment Type */}
            <Select
              label="Type"
              placeholder="Select type"
              selectedKeys={assessmentType ? [assessmentType] : []}
              onChange={(e) =>
                setAssessmentType(e.target.value as "assignment" | "project")
              }
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

            {/* Due Date and Max Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                isRequired
              />
              <Input
                label="Max Score"
                type="number"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                isRequired
                min="1"
              />
            </div>

            {/* Status */}
            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={status ? [status] : []}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              isRequired
              disableAnimation
            >
              <SelectItem key="draft" value="draft">
                Draft
              </SelectItem>
              <SelectItem key="published" value="published">
                Published
              </SelectItem>
            </Select>
          </CardBody>
        </Card>

        {/* Description */}
        <Card className="mb-6">
          <CardHeader className="pb-0 pt-4 px-6">
            <h2 className="text-lg font-bold">Description</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="min-h-[200px]">
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                placeholder="Enter assignment description..."
                className="h-40 mb-12"
              />
            </div>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader className="pb-0 pt-4 px-6">
            <h2 className="text-lg font-bold">Instructions (Optional)</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="min-h-[200px]">
              <ReactQuill
                theme="snow"
                value={instructions}
                onChange={setInstructions}
                placeholder="Enter detailed instructions for students..."
                className="h-40 mb-12"
              />
            </div>
          </CardBody>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            color="danger"
            variant="light"
            onPress={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={updating}
            startContent={<FaSave />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
