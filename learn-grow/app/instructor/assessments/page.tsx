"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Select,
  SelectItem,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEdit, FaSearch, FaFilter } from "react-icons/fa";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { useGetQuizzesByCourseQuery } from "@/redux/api/quizApi";
import {
  useGetAssignmentsByCourseQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";

function InstructorAssessmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdFromUrl = searchParams.get("courseId");

  const [selectedCourse, setSelectedCourse] = useState(courseIdFromUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch instructor's courses
  const { data: coursesResp } = useGetAllCoursesQuery({});
  const courses = coursesResp?.data || [];

  // Fetch quizzes for selected course
  const { data: quizzesResp } = useGetQuizzesByCourseQuery(selectedCourse, {
    skip: !selectedCourse,
  });
  const quizzes = quizzesResp?.data || [];

  // Fetch assignments for selected course
  const { data: assignmentsResp } = useGetAssignmentsByCourseQuery(
    selectedCourse,
    { skip: !selectedCourse }
  );
  const assignments = assignmentsResp?.data || [];

  // Grade submission mutation
  const [gradeSubmission, { isLoading: grading }] =
    useGradeSubmissionMutation();

  // Combine all assessments
  const allAssessments = [
    ...quizzes.map((quiz: any) => ({
      _id: quiz._id,
      title: quiz.title,
      type: quiz.assessmentType || "quiz",
      details: `${quiz.questions?.length || 0} questions • ${quiz.duration || 30} min`,
      submissions: 0, // TODO: fetch quiz attempts
      typeLabel: quiz.assessmentType === "mid-exam" ? "Mid Exam" : 
                 quiz.assessmentType === "final-exam" ? "Final Exam" : "Quiz",
    })),
    ...assignments.map((assignment: any) => ({
      _id: assignment._id,
      title: assignment.title,
      type: assignment.assessmentType || "assignment",
      details: assignment.dueDate
        ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`
        : "No deadline",
      submissions: assignment.submissionsCount || 0,
      typeLabel:
        assignment.assessmentType === "project" ? "Project" :
        assignment.assessmentType === "mid-term" ? "Mid-Term Assignment" :
        assignment.assessmentType === "final" ? "Final Assignment" : "Assignment",
      hasSubmissions: true,
    })),
  ];

  // Filter assessments
  const filteredAssessments = allAssessments.filter((assessment) => {
    const matchesSearch = assessment.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" || assessment.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "primary";
      case "mid-exam":
      case "mid-term":
        return "warning";
      case "final-exam":
      case "final":
        return "danger";
      case "assignment":
        return "secondary";
      case "project":
        return "success";
      default:
        return "default";
    }
  };

  const handleViewSubmissions = async (assessment: any) => {
    if (assessment.type === "quiz" || assessment.type.includes("exam")) {
      // Navigate to quiz attempts page (to be created)
      router.push(`/instructor/quizzes/${assessment._id}/attempts`);
    } else {
      // Navigate to assignment submissions page
      router.push(`/instructor/assignments/${assessment._id}/submissions`);
    }
  };

  const handleGradeSubmission = (assignment: any, submission: any) => {
    setSelectedAssignment(assignment);
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
    if (isNaN(scoreNum) || scoreNum < 0) {
      toast.error("Please enter a valid score");
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
      setSelectedAssignment(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save grade");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Assessments 📚</h1>
        <p className="text-gray-600">
          Manage quizzes, assignments, exams, and projects for this course.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Selection */}
            <Select
              label="Select Course"
              placeholder="Choose a course"
              selectedKeys={selectedCourse ? [selectedCourse] : []}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disableAnimation
            >
              {courses.map((course: any) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </Select>

            {/* Search */}
            <Input
              label="Search assessments..."
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
            />

            {/* Filter by Type */}
            <Select
              label="Filter by Type"
              placeholder="All types"
              selectedKeys={filterType ? [filterType] : []}
              onChange={(e) => setFilterType(e.target.value)}
              startContent={<FaFilter className="text-gray-400" />}
              disableAnimation
            >
              <SelectItem key="all" value="all">
                All Types
              </SelectItem>
              <SelectItem key="quiz" value="quiz">
                Quiz
              </SelectItem>
              <SelectItem key="mid-exam" value="mid-exam">
                Mid Exam
              </SelectItem>
              <SelectItem key="final-exam" value="final-exam">
                Final Exam
              </SelectItem>
              <SelectItem key="assignment" value="assignment">
                Assignment
              </SelectItem>
              <SelectItem key="project" value="project">
                Project
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Assessments Count */}
      {selectedCourse && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Assessments ({filteredAssessments.length})
          </h2>
        </div>
      )}

      {/* Assessments Table */}
      {!selectedCourse ? (
        <Card>
          <CardBody className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              Please select a course to view assessments
            </p>
          </CardBody>
        </Card>
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <p className="text-gray-500 text-lg">No assessments found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or create a new assessment
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <Table aria-label="Assessments table">
              <TableHeader>
                <TableColumn>TITLE</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>DETAILS</TableColumn>
                <TableColumn>SUBMISSIONS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{assessment.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getTypeColor(assessment.type) as any}
                      >
                        {assessment.typeLabel}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {assessment.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {assessment.submissions}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<FaEye />}
                          onPress={() => handleViewSubmissions(assessment)}
                          isDisabled={
                            !assessment.hasSubmissions &&
                            assessment.submissions === 0
                          }
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          startContent={<FaEdit />}
                          onPress={() => {
                            if (
                              assessment.type === "quiz" ||
                              assessment.type.includes("exam")
                            ) {
                              router.push(
                                `/instructor/quizzes/${assessment._id}/edit`
                              );
                            } else {
                              router.push(
                                `/instructor/assignments/${assessment._id}/edit`
                              );
                            }
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Grade Submission Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Grade Submission</ModalHeader>
          <ModalBody>
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student:</p>
                  <p className="font-semibold">
                    {selectedSubmission.studentId?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submission Link:</p>
                  <a
                    href={selectedSubmission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedSubmission.submissionLink}
                  </a>
                </div>
                <Input
                  label="Score"
                  type="number"
                  placeholder="Enter score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  description={`Max score: ${selectedAssignment?.maxScore || 100}`}
                  isRequired
                />
                <Textarea
                  label="Feedback (Optional)"
                  placeholder="Provide feedback to the student"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  minRows={3}
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

export default function InstructorAssessmentsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <InstructorAssessmentsContent />
    </Suspense>
  );
}
