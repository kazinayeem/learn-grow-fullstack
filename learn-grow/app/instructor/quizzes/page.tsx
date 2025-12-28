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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useGetQuizzesByCourseQuery, useDeleteQuizMutation } from "@/redux/api/quizApi";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaQuestionCircle,
} from "react-icons/fa";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  questions: any[];
  duration: number;
  passingScore: number;
  totalAttempts: number;
  status: "draft" | "active" | "published";
  submissionsCount: number;
  createdAt: string;
}

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [deleteQuiz] = useDeleteQuizMutation();

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

  const { data: quizzesResp, isLoading } = useGetQuizzesByCourseQuery(courseId, {
    skip: !courseId,
  });

  const allQuizzes: Quiz[] = Array.isArray(quizzesResp?.data) ? quizzesResp!.data : [];

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz(quizToDelete).unwrap();
      toast.success("Quiz deleted successfully");
      setQuizToDelete(null);
      onOpenChange();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete quiz");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "active":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Quizzes 📝</h1>
            <p className="text-gray-600">Create and manage course quizzes</p>
          </div>
          <Button
            isIconOnly
            color="primary"
            onPress={() => router.push("/instructor/quizzes/create")}
            size="lg"
            className="rounded-full"
          >
            <FaPlus size={20} />
          </Button>
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
              placeholder="Search quizzes..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
              className="w-full"
            />

            {/* Status Filter */}
            <Select
              label="Filter by Status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full"
            >
              <SelectItem key="">All</SelectItem>
              <SelectItem key="draft">Draft</SelectItem>
              <SelectItem key="active">Active</SelectItem>
              <SelectItem key="published">Published</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Quizzes Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No quizzes found</p>
            <Button
              color="primary"
              onPress={() => router.push("/instructor/quizzes/create")}
            >
              Create Your First Quiz
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 bg-gray-100 p-6">
            <h2 className="text-xl font-semibold">Quizzes ({filteredQuizzes.length})</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Quizzes table" className="p-4">
              <TableHeader>
                <TableColumn key="title">TITLE</TableColumn>
                <TableColumn key="questions">QUESTIONS</TableColumn>
                <TableColumn key="duration">DURATION</TableColumn>
                <TableColumn key="submissions">SUBMISSIONS</TableColumn>
                <TableColumn key="status">STATUS</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{quiz.title}</p>
                        {quiz.description && (
                          <p className="text-sm text-gray-500">{quiz.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaQuestionCircle />
                        {quiz.questions?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaClock size={14} />
                        {quiz.duration} min
                      </div>
                    </TableCell>
                    <TableCell>{quiz.submissionsCount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        startContent={
                          quiz.status === "published" ? <FaCheckCircle /> : undefined
                        }
                        variant="flat"
                        color={getStatusColor(quiz.status)}
                      >
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => router.push(`/instructor/quizzes/${quiz._id}`)}
                          title="View"
                        >
                          <FaEye size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => router.push(`/instructor/quizzes/${quiz._id}/edit`)}
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => {
                            setQuizToDelete(quiz._id);
                            onOpen();
                          }}
                          title="Delete"
                        >
                          <FaTrash size={16} />
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Delete Quiz</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => onOpenChange()}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteQuiz}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
