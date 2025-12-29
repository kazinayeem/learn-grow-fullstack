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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaLink,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  useGetAssignmentByIdQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";

export default function AssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch assignment details
  const { data: assignmentResp, isLoading: assignmentLoading } =
    useGetAssignmentByIdQuery(id);
  const assignment = assignmentResp?.data;

  // Fetch submissions
  const {
    data: submissionsResp,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useGetAssignmentSubmissionsQuery(id);
  const submissions = submissionsResp?.data || [];

  // Grade submission mutation
  const [gradeSubmission, { isLoading: grading }] =
    useGradeSubmissionMutation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleGrade = (submission: any) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || "");
    setFeedback(submission.feedback || "");
    onOpen();
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission || !score) {
      toast.error("Please enter a score");
      return;
    }

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > (assignment?.maxScore || 100)) {
      toast.error(`Score must be between 0 and ${assignment?.maxScore || 100}`);
      return;
    }

    try {
      await gradeSubmission({
        id: selectedSubmission._id,
        score: scoreNum,
        feedback: feedback.trim(),
      }).unwrap();

      toast.success("Grade saved successfully!");
      onClose();
      setScore("");
      setFeedback("");
      setSelectedSubmission(null);
      refetchSubmissions();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save grade");
    }
  };

  const getSubmissionStatus = (submission: any) => {
    if (submission.score !== undefined && submission.score !== null) {
      return { label: "Graded", color: "success" };
    }
    return { label: "Pending", color: "warning" };
  };

  if (assignmentLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardBody className="p-8 text-center">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardBody className="p-8 text-center">
            <p className="text-red-500">Assignment not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const gradedCount = submissions.filter(
    (s: any) => s.score !== undefined && s.score !== null
  ).length;
  const pendingCount = submissions.length - gradedCount;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Button
        variant="light"
        startContent={<FaArrowLeft />}
        onPress={() => router.push("/instructor/assessments")}
        className="mb-6"
      >
        Back to Assessments
      </Button>

      {/* Assignment Header */}
      <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <CardBody className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Chip
                color={
                  assignment.assessmentType === "project"
                    ? "success"
                    : "primary"
                }
                variant="solid"
                className="border border-white/30 mb-3"
              >
                {assignment.assessmentType === "project"
                  ? "Project"
                  : "Assignment"}
              </Chip>
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
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUser className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Submissions</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Graded</p>
                <p className="text-2xl font-bold">{gradedCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaClock className="text-2xl text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader className="pb-0 pt-6 px-6">
          <h2 className="text-2xl font-bold">Student Submissions</h2>
        </CardHeader>
        <CardBody className="p-6">
          {submissionsLoading ? (
            <div className="text-center py-8">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Students haven't submitted their work yet
              </p>
            </div>
          ) : (
            <Table aria-label="Submissions table">
              <TableHeader>
                <TableColumn>STUDENT</TableColumn>
                <TableColumn>SUBMITTED AT</TableColumn>
                <TableColumn>SUBMISSION LINK</TableColumn>
                <TableColumn>SCORE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {submissions.map((submission: any) => {
                  const status = getSubmissionStatus(submission);
                  return (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            {submission.studentId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {submission.studentId?.email || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <a
                          href={submission.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <FaLink />
                          View Link
                        </a>
                      </TableCell>
                      <TableCell>
                        {submission.score !== undefined &&
                        submission.score !== null ? (
                          <Chip size="sm" color="success" variant="flat">
                            {submission.score} / {assignment.maxScore}
                          </Chip>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not graded
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={status.color as any}
                          variant="dot"
                        >
                          {status.label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleGrade(submission)}
                        >
                          {submission.score !== undefined &&
                          submission.score !== null
                            ? "Edit Grade"
                            : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Grade Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Grade Submission</ModalHeader>
          <ModalBody>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Student:</p>
                  <p className="font-semibold text-lg">
                    {selectedSubmission.studentId?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSubmission.studentId?.email || ""}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Submission Link:
                  </p>
                  <a
                    href={selectedSubmission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all flex items-center gap-2"
                  >
                    <FaLink />
                    {selectedSubmission.submissionLink}
                  </a>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="mt-3"
                    onPress={() =>
                      window.open(selectedSubmission.submissionLink, "_blank")
                    }
                  >
                    Open in New Tab
                  </Button>
                </div>

                <Input
                  label="Score"
                  type="number"
                  placeholder="Enter score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  description={`Max score: ${assignment?.maxScore || 100}`}
                  isRequired
                  min="0"
                  max={assignment?.maxScore || 100}
                />

                <Textarea
                  label="Feedback (Optional)"
                  placeholder="Provide feedback to the student"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  minRows={4}
                  description="This feedback will be visible to the student"
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveGrade}
              isLoading={grading}
            >
              Save Grade
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
