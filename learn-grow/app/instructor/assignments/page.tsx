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
import { useGetAssignmentsByCourseQuery, useDeleteAssignmentMutation } from "@/redux/api/assignmentApi";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCalendar,
  FaFileAlt,
  FaUsers,
} from "react-icons/fa";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  assessmentType: "assignment" | "project";
  dueDate: string;
  maxScore: number;
  status: "draft" | "published";
  submissionsCount: number;
  createdAt: string;
}

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [deleteAssignment] = useDeleteAssignmentMutation();

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

  const { data: assignmentsResp, isLoading } = useGetAssignmentsByCourseQuery(courseId, {
    skip: !courseId,
  });

  const allAssignments: Assignment[] = Array.isArray(assignmentsResp?.data) ? assignmentsResp!.data : [];

  const filteredAssignments = allAssignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      await deleteAssignment(assignmentToDelete).unwrap();
      toast.success("Assignment deleted successfully");
      setAssignmentToDelete(null);
      onOpenChange();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete assignment");
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Assignments & Projects 📄</h1>
            <p className="text-gray-600">Create and manage assignments and projects</p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<FaPlus />}
            onPress={() => router.push("/instructor/assignments/create")}
          >
            Create
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Search assignments..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
              className="w-full"
            />
          </div>
        </CardBody>
      </Card>

      {/* Assignments Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No assignments found</p>
            <Button
              color="primary"
              onPress={() => router.push("/instructor/assignments/create")}
            >
              Create Your First Assignment
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 bg-gray-100 p-6">
            <h2 className="text-xl font-semibold">Assignments ({filteredAssignments.length})</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Assignments table" className="p-4">
              <TableHeader>
                <TableColumn key="title">TITLE</TableColumn>
                <TableColumn key="type">TYPE</TableColumn>
                <TableColumn key="dueDate">DUE DATE</TableColumn>
                <TableColumn key="maxScore">MAX SCORE</TableColumn>
                <TableColumn key="submissions">SUBMISSIONS</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{assignment.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {assignment.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={assignment.assessmentType === "project" ? "success" : "primary"}
                      >
                        {assignment.assessmentType === "project" ? "Project" : "Assignment"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaCalendar size={14} />
                        <span className={isOverdue(assignment.dueDate) ? "text-red-500" : ""}>
                          {formatDate(assignment.dueDate)}
                        </span>
                        {isOverdue(assignment.dueDate) && (
                          <Chip size="sm" color="danger" variant="flat">
                            Overdue
                          </Chip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.maxScore}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaUsers size={14} />
                        {assignment.submissionsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => router.push(`/instructor/assignments/${assignment._id}`)}
                          title="View Submissions"
                        >
                          <FaEye size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => router.push(`/instructor/assignments/${assignment._id}/edit`)}
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
                            setAssignmentToDelete(assignment._id);
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
          <ModalHeader className="flex flex-col gap-1">Delete Assignment</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => onOpenChange()}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteAssignment}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
