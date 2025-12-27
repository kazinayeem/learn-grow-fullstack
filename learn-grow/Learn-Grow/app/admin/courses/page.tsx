"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  useGetAllCoursesQuery,
  useDeleteCourseMutation,
} from "@/redux/api/courseApi";

export default function ManageCoursesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetAllCoursesQuery({});
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  // API returns { statusCode: 200, success: true, message: "...", data: [...] }
  const courseList: any[] = data?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const filteredCourses = courseList.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId).unwrap();
        alert("Course deleted successfully!");
      } catch (err: any) {
        alert(`Failed to delete: ${err?.data?.message}`);
      }
    }
  };

  const handleViewDetails = (course: any) => {
    setSelectedCourse(course);
    onOpen();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Button
          variant="light"
          onPress={() => router.push("/admin")}
          className="mb-6"
        >
          ← Back to Admin Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manage Courses</h1>
              <p className="text-gray-600 mt-1">
                View, edit, and delete all courses via API
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              onPress={() => router.push("/admin/courses/create")}
            >
              + Create New Course
            </Button>
          </CardHeader>
          <CardBody className="p-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search courses by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                startContent={<span>🔍</span>}
                variant="bordered"
              />
            </div>

            {/* Courses Table */}
            <Table aria-label="Courses table">
              <TableHeader>
                <TableColumn>COURSE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>LEVEL</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No courses found.">
                {filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-xs text-gray-500">
                            {course.modules?.length || 0} Modules
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color="primary" variant="flat">
                        {course.category}
                      </Chip>
                    </TableCell>
                    <TableCell>BDT {course.price}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          course.level === "Beginner"
                            ? "success"
                            : course.level === "Advanced"
                              ? "danger"
                              : "warning"
                        }
                        variant="flat"
                        size="sm"
                      >
                        {course.level}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        variant="dot"
                        color={course.isPublished ? "success" : "default"}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleViewDetails(course)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={() => {
                            router.push(`/admin/courses/edit?id=${course._id}`);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          isLoading={isDeleting}
                          onPress={() => handleDelete(course._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Course Details Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              {selectedCourse && (
                <div className="flex items-center gap-3">
                  {selectedCourse.thumbnail && (
                    <img
                      src={selectedCourse.thumbnail}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCourse.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ID: {selectedCourse._id}
                    </p>
                  </div>
                </div>
              )}
            </ModalHeader>
            <ModalBody>
              {selectedCourse && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Description</h3>
                    <p className="text-gray-700">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold">
                        BDT {selectedCourse.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Modules</p>
                      <p className="font-semibold">
                        {selectedCourse.modules?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold">{selectedCourse.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="font-semibold">{selectedCourse.level}</p>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
