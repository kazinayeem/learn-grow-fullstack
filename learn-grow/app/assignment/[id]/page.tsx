"use client";

import React, { useState, use } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaLink,
} from "react-icons/fa";
import {
  useGetAssignmentByIdQuery,
  useSubmitAssignmentMutation,
  useGetMySubmissionQuery,
} from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";
import DOMPurify from "isomorphic-dompurify";

export default function AssignmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [submissionLink, setSubmissionLink] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch assignment details
  const {
    data: assignmentResp,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useGetAssignmentByIdQuery(id);
  const assignment = assignmentResp?.data;

  // Fetch student's submission
  const { data: submissionResp, refetch: refetchSubmission } =
    useGetMySubmissionQuery(id);
  const submission = submissionResp?.data;

  // Submit assignment mutation
  const [submitAssignment, { isLoading: submitting }] =
    useSubmitAssignmentMutation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case "assignment":
        return "Assignment";
      case "project":
        return "Project";
      default:
        return "Task";
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "primary";
      case "project":
        return "success";
      default:
        return "default";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleSubmit = async () => {
    if (!submissionLink.trim()) {
      toast.error("Please enter a submission link");
      return;
    }

    // Validate URL format
    try {
      new URL(submissionLink);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      await submitAssignment({
        id,
        submissionLink: submissionLink.trim(),
      }).unwrap();

      toast.success("Assignment submitted successfully!");
      setSubmissionLink("");
      onClose();
      refetchSubmission();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit assignment");
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
            <p className="text-gray-500 mt-4">Loading assignment details...</p>
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
            <FaExclamationCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Assignment Not Found
            </h2>
            <p className="text-gray-600">
              The assignment you're looking for doesn't exist or has been removed.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const overdue = isOverdue(assignment.dueDate);
  const hasSubmitted = !!submission;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="light"
        startContent={<FaArrowLeft />}
        onPress={() => router.back()}
        className="mb-6"
      >
        Back to Course
      </Button>

      {/* Assignment Header */}
      <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <CardBody className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Chip
                  color={
                    getAssignmentTypeColor(assignment.assessmentType) as any
                  }
                  variant="solid"
                  className="border border-white/30"
                >
                  {getAssignmentTypeLabel(assignment.assessmentType)}
                </Chip>
                <Chip
                  color={
                    assignment.status === "published" ? "success" : "warning"
                  }
                  variant="solid"
                  className="border border-white/30"
                >
                  {assignment.status}
                </Chip>
                {hasSubmitted && (
                  <Chip
                    color="success"
                    variant="solid"
                    className="border border-white/30"
                    startContent={<FaCheckCircle />}
                  >
                    Submitted
                  </Chip>
                )}
                {overdue && !hasSubmitted && (
                  <Chip
                    color="danger"
                    variant="solid"
                    className="border border-white/30"
                  >
                    Overdue
                  </Chip>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {assignment.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-blue-100">
                {assignment.dueDate && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt />
                    <span>Due: {formatDate(assignment.dueDate)}</span>
                  </div>
                )}
                {assignment.maxScore && (
                  <div className="flex items-center gap-2">
                    <span>📊</span>
                    <span>Max Score: {assignment.maxScore}</span>
                  </div>
                )}
              </div>
            </div>
            {!hasSubmitted && !overdue && (
              <Button
                color="success"
                size="lg"
                className="text-white font-semibold"
                startContent={<FaFileAlt />}
                onPress={onOpen}
              >
                Submit Assignment
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Submission Status */}
      {hasSubmitted && (
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <FaCheckCircle className="text-3xl text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Assignment Submitted
                </h3>
                <p className="text-gray-700 mb-3">
                  You submitted this assignment on{" "}
                  {formatDate(submission.submittedAt)}
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Your submission link:
                  </p>
                  <a
                    href={submission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all flex items-center gap-2"
                  >
                    <FaLink />
                    {submission.submissionLink}
                  </a>
                </div>
                {submission.score !== undefined && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-900">
                      Score: {submission.score} / {assignment.maxScore}
                    </p>
                    {submission.feedback && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">
                          Instructor Feedback:
                        </p>
                        <p className="text-gray-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
                {submission.score === undefined && (
                  <p className="text-sm text-gray-600 mt-3">
                    ⏳ Waiting for instructor to grade your submission
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Overdue Notice */}
      {overdue && !hasSubmitted && (
        <Card className="mb-6 border-2 border-red-200 bg-red-50">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <FaExclamationCircle className="text-3xl text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Assignment Overdue
                </h3>
                <p className="text-gray-700">
                  The deadline for this assignment has passed. Please contact
                  your instructor if you need an extension.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Assignment Description */}
      <Card className="mb-6">
        <CardHeader className="pb-0 pt-6 px-6">
          <h2 className="text-2xl font-bold">Assignment Description</h2>
        </CardHeader>
        <CardBody className="p-6">
          {assignment.description ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(assignment.description),
              }}
            />
          ) : (
            <p className="text-gray-500">No description provided</p>
          )}
        </CardBody>
      </Card>

      {/* Instructions */}
      {assignment.instructions && (
        <Card className="mb-6">
          <CardHeader className="pb-0 pt-6 px-6">
            <h2 className="text-2xl font-bold">Instructions</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(assignment.instructions),
              }}
            />
          </CardBody>
        </Card>
      )}

      {/* Submission Guidelines */}
      <Card>
        <CardHeader className="pb-0 pt-6 px-6">
          <h2 className="text-2xl font-bold">Submission Guidelines</h2>
        </CardHeader>
        <CardBody className="p-6">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Upload your work to Google Drive, Dropbox, or GitHub
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Make sure the link is publicly accessible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Submit the link before the deadline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                You can only submit once, so make sure your work is complete
              </span>
            </li>
          </ul>
        </CardBody>
      </Card>

      {/* Submit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Submit Assignment</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-600">
                Please provide a link to your completed assignment. Make sure
                the link is publicly accessible.
              </p>
              <Input
                label="Submission Link"
                placeholder="https://drive.google.com/..."
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                startContent={<FaLink className="text-gray-400" />}
                description="Google Drive, Dropbox, GitHub, or any public link"
                isRequired
              />
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  ⚠️ Important:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You can only submit once</li>
                  <li>• Make sure your link is publicly accessible</li>
                  <li>• Double-check your work before submitting</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={submitting}
            >
              Submit Assignment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
