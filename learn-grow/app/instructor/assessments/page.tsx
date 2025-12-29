"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@nextui-org/react";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useGetQuizzesByCourseQuery } from "@/redux/api/quizApi";
import { useGetAssignmentsByCourseQuery } from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaQuestionCircle,
  FaFileAlt,
  FaGraduationCap,
  FaProjectDiagram,
} from "react-icons/fa";

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  type: "quiz" | "assignment" | "mid-exam" | "final-exam" | "project";
  status?: string;
  submissionsCount: number;
  createdAt: string;
  // Quiz/Exam specific
  questions?: any[];
  duration?: number;
  assessmentType?: string;
  // Assignment/Project specific
  dueDate?: string;
  maxScore?: number;
}

export default function UnifiedAssessmentsPage() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setInstructorId(user._id || user.id || null);
    }
  }, []);

  const { data: coursesResp } = useGetInstructorCoursesQuery(instructorId as string, {
    skip: !instructorId,
  });

  const courses = Array.isArray(coursesResp?.data) ? coursesResp!.data : [];
  const courseId = selectedCourse || (courses[0]?._id as string);

  const { data: quizzesResp, isLoading: isLoadingQuizzes } = useGetQuizzesByCourseQuery(courseId, {
    skip: !courseId,
  });

  const { data: assignmentsResp, isLoading: isLoadingAssignments } = useGetAssignmentsByCourseQuery(courseId, {
    skip: !courseId,
  });

  const quizzes = Array.isArray(quizzesResp?.data) ? quizzesResp!.data : [];
  const assignments = Array.isArray(assignmentsResp?.data) ? assignmentsResp!.data : [];

  // Combine all assessments
  const allAssessments: Assessment[] = [
    ...quizzes.map((q: any) => ({
      ...q,
      type: q.assessmentType || "quiz",
    })),
    ...assignments.map((a: any) => ({
      ...a,
      type: a.assessmentType || "assignment",
    })),
  ];

  // Filter assessments
  const filteredAssessments = allAssessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || assessment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const isLoading = isLoadingQuizzes || isLoadingAssignments;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <FaQuestionCircle />;
      case "assignment":
        return <FaFileAlt />;
      case "mid-exam":
        return <FaGraduationCap />;
      case "final-exam":
        return <FaGraduationCap />;
      case "project":
        return <FaProjectDiagram />;
      default:
        return <FaQuestionCircle />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "primary";
      case "assignment":
        return "secondary";
      case "mid-exam":
        return "warning";
      case "final-exam":
        return "danger";
      case "project":
        return "success";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "quiz":
        return "Quiz";
      case "assignment":
        return "Assignment";
      case "mid-exam":
        return "Mid Exam";
      case "final-exam":
        return "Final Exam";
      case "project":
        return "Project";
      default:
        return type;
    }
  };

  const handleCreate = (type: string) => {
    if (type === "quiz" || type === "mid-exam" || type === "final-exam") {
      router.push(`/instructor/quizzes/create?type=${type}`);
    } else if (type === "assignment" || type === "project") {
      router.push(`/instructor/assignments/create?type=${type}`);
    }
  };

  const handleView = (assessment: Assessment) => {
    if (assessment.type === "quiz" || assessment.type === "mid-exam" || assessment.type === "final-exam") {
      router.push(`/instructor/quizzes/${assessment._id}`);
    } else {
      router.push(`/instructor/assignments/${assessment._id}`);
    }
  };

  const handleEdit = (assessment: Assessment) => {
    if (assessment.type === "quiz" || assessment.type === "mid-exam" || assessment.type === "final-exam") {
      router.push(`/instructor/quizzes/${assessment._id}/edit`);
    } else {
      router.push(`/instructor/assignments/${assessment._id}/edit`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">All Assessments 📚</h1>
            <p className="text-gray-600">Manage quizzes, assignments, exams, and projects</p>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button
                color="primary"
                size="lg"
                className="rounded-full"
                startContent={<FaPlus />}
              >
                Create
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Assessment types" onAction={(key) => handleCreate(key as string)}>
              <DropdownItem key="quiz" startContent={<FaQuestionCircle />}>
                Quiz
              </DropdownItem>
              <DropdownItem key="assignment" startContent={<FaFileAlt />}>
                Assignment
              </DropdownItem>
              <DropdownItem key="mid-exam" startContent={<FaGraduationCap />}>
                Mid Exam
              </DropdownItem>
              <DropdownItem key="final-exam" startContent={<FaGraduationCap />}>
                Final Exam
              </DropdownItem>
              <DropdownItem key="project" startContent={<FaProjectDiagram />}>
                Project
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Selection */}
            <Select
              label="Select Course"
              selectedKeys={selectedCourse ? [selectedCourse] : []}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full"
              isDisabled={courses.length === 0}
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
              isClearable
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
              className="w-full"
            />

            {/* Type Filter */}
            <Select
              label="Filter by Type"
              selectedKeys={typeFilter ? [typeFilter] : []}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full"
              disableAnimation
            >
              <SelectItem key="">All Types</SelectItem>
              <SelectItem key="quiz">Quiz</SelectItem>
              <SelectItem key="assignment">Assignment</SelectItem>
              <SelectItem key="mid-exam">Mid Exam</SelectItem>
              <SelectItem key="final-exam">Final Exam</SelectItem>
              <SelectItem key="project">Project</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Assessments Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No assessments found</p>
            <p className="text-sm text-gray-400 mb-4">Create your first assessment using the button above</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 bg-gray-100 p-6">
            <h2 className="text-xl font-semibold">Assessments ({filteredAssessments.length})</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Assessments table" className="p-4">
              <TableHeader>
                <TableColumn key="title">TITLE</TableColumn>
                <TableColumn key="type">TYPE</TableColumn>
                <TableColumn key="details">DETAILS</TableColumn>
                <TableColumn key="submissions">SUBMISSIONS</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{assessment.title}</p>
                        {assessment.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{assessment.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        startContent={getTypeIcon(assessment.type)}
                        variant="flat"
                        color={getTypeColor(assessment.type) as any}
                      >
                        {getTypeLabel(assessment.type)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {assessment.questions ? (
                        <div className="flex items-center gap-2 text-sm">
                          <FaQuestionCircle />
                          {assessment.questions.length} questions
                          <FaClock />
                          {assessment.duration} min
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendar />
                          Due: {formatDate(assessment.dueDate!)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{assessment.submissionsCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleView(assessment)}
                          title="View"
                        >
                          <FaEye size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(assessment)}
                          title="Edit"
                        >
                          <FaEdit size={16} />
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
    </div>
  );
}
