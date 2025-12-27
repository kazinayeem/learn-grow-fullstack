"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Input,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Textarea,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaChartLine } from "react-icons/fa";
import { useGetInstructorCoursesQuery, useCreateCourseMutation, useDeleteCourseMutation } from "@/redux/api/courseApi";

export default function InstructorCoursesPage() {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");

    // Mock courses data - replace with API
    // Mock courses data - replace with API
    const [courses, setCourses] = useState([
        {
            id: "1",
            title: "Web Development Bootcamp",
            students: 45,
            status: "published",
            price: 2000,
            rating: 4.8,
            lastUpdated: "2024-12-01",
        },
        {
            id: "2",
            title: "Python for Kids",
            students: 32,
            status: "published",
            price: 1500,
            rating: 4.9,
            lastUpdated: "2024-11-28",
        },
        {
            id: "3",
            title: "Robotics Basics",
            students: 18,
            status: "published",
            price: 2500,
            rating: 4.7,
            lastUpdated: "2024-12-05",
        },
        {
            id: "4",
            title: "Game Development with Scratch",
            students: 60,
            status: "published",
            price: 1200,
            rating: 4.9,
            lastUpdated: "2024-12-07",
        },
    ]);

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
        level: "Beginner",
        language: "English",
        duration: "",
    });

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateCourse = () => {
        if (!newCourse.title || !newCourse.price) {
            alert("Please fill in all fields");
            return;
        }

        const course = {
            id: Date.now().toString(),
            title: newCourse.title,
            students: 0,
            status: "draft",
            price: parseInt(newCourse.price),
            rating: null,
            lastUpdated: new Date().toISOString().split("T")[0],
        };

        setCourses([...courses, course]);
        setNewCourse({ title: "", description: "", price: "" });
        onClose();
        alert("Course created successfully!");
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            setCourses(courses.filter((c) => c.id !== id));
            alert("Course deleted!");
        }
    };

    const getStatusColor = (status: string) => {
        return status === "published" ? "success" : "warning";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Courses</h1>
                    <p className="text-gray-600">Manage and create your courses</p>
                </div>
                <Button color="primary" size="lg" startContent={<FaPlus />} onPress={onOpen} isLoading={isLoading || isCreating}>
                    Create New Course
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                        <p className="text-3xl font-bold">{courses?.length || 0}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Published</p>
                        <p className="text-3xl font-bold text-green-600">
                            {courses?.filter((c: any) => c.isPublished)?.length || 0}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Students</p>
                        <p className="text-3xl font-bold">
                            {courses?.reduce((sum: number, c: any) => sum + (c.enrolled || 0), 0) || 0}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {(
                                courses
                                    .filter((c) => c.rating)
                                    .reduce((sum, c) => sum + (c.rating || 0), 0) /
                                courses.filter((c) => c.rating).length || 0
                            ).toFixed(1)} ⭐
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="lg"
                    startContent={<FaEdit />}
                />
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-xl transition-shadow">
                        <CardBody className="p-6">
                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-3">
                                <Chip color={getStatusColor(course.isPublished ? "published" : "draft") as any} size="sm" variant="flat">
                                    {(course.isPublished ? "PUBLISHED" : "DRAFT")}
                                </Chip>
                                {course.rating && (
                                    <span className="text-yellow-600 font-semibold">⭐ {course.rating}</span>
                                )}
                            </div>

                            {/* Course Title */}
                            <h3 className="font-bold text-xl mb-3 line-clamp-2">{course.title}</h3>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaUsers />
                                    <span>{course.enrolled || 0} students</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-green-600">{course.price} BDT</span>
                                </div>
                            </div>

                            {/* Last Updated */}
                            <p className="text-xs text-gray-500 mb-4">
                                Updated: {new Date(course.lastUpdated).toLocaleDateString()}
                            </p>
                        </CardBody>

                        <CardFooter className="p-6 pt-0 flex gap-2">
                            <Button
                                size="sm"
                                variant="bordered"
                                startContent={<FaEye />}
                                className="flex-1"
                                onPress={() => router.push(`/instructor/courses/${course._id || course.id}`)}
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                color="primary"
                                variant="bordered"
                                startContent={<FaChartLine />}
                                onPress={() => router.push(`/instructor/courses/${course._id || course.id}`)}
                            >
                                Manage
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                variant="bordered"
                                isIconOnly
                                onPress={() => handleDelete(course._id || course.id, course.title)}
                            >
                                <FaTrash />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Create Course Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Create New Course</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} variant="bordered" isRequired />
                                        <Input label="Category" value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} variant="bordered" />
                                        <Input label="Price" type="number" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} variant="bordered" isRequired />
                                        <Input label="Duration (hours)" type="number" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} variant="bordered" />
                                        <Input label="Level" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} variant="bordered" />
                                        <Input label="Language" value={newCourse.language} onChange={(e) => setNewCourse({ ...newCourse, language: e.target.value })} variant="bordered" />
                                    </div>
                                    <Textarea label="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} variant="bordered" minRows={4} isRequired />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="primary" onPress={handleCreateCourse} isLoading={isCreating}>Create</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
