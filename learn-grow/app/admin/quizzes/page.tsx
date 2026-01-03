"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
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
    Select,
    SelectItem,
} from "@nextui-org/react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaClock, FaQuestionCircle, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AdminQuizzesPage() {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");

    const [quizzes, setQuizzes] = useState([
        {
            id: "1",
            title: "Python Basics Quiz",
            course: "Python for Beginners",
            instructor: "John Doe",
            questions: 15,
            duration: 30,
            status: "active",
            submissions: 45,
            avgScore: 78,
        },
        {
            id: "2",
            title: "React Fundamentals Test",
            course: "Web Development Bootcamp",
            instructor: "Jane Smith",
            questions: 20,
            duration: 45,
            status: "active",
            submissions: 32,
            avgScore: 82,
        },
        {
            id: "3",
            title: "HTML & CSS Assessment",
            course: "Web Development Bootcamp",
            instructor: "Jane Smith",
            questions: 10,
            duration: 20,
            status: "draft",
            submissions: 0,
            avgScore: 0,
        },
    ]);

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            setQuizzes(quizzes.filter((q) => q.id !== id));
            alert("Quiz deleted successfully!");
        }
    };

    const getStatusColor = (status: string) => {
        return status === "active" ? "success" : "warning";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="light" 
                        startContent={<FaArrowLeft />}
                        onPress={() => router.push("/admin")}
                    >
                        Back
                    </Button>
                    <div>
                    <h1 className="text-4xl font-bold mb-2">Quiz Management 📝</h1>
                    <p className="text-gray-600">Manage and review all platform quizzes</p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
                        <p className="text-3xl font-bold">{quizzes.length}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Active</p>
                        <p className="text-3xl font-bold text-green-600">
                            {quizzes.filter((q) => q.status === "active").length}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                        <p className="text-3xl font-bold">
                            {quizzes.reduce((sum, q) => sum + q.submissions, 0)}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Avg. Score</p>
                        <p className="text-3xl font-bold text-primary">
                            {Math.round(
                                quizzes.filter((q) => q.avgScore > 0).reduce((sum, q) => sum + q.avgScore, 0) /
                                quizzes.filter((q) => q.avgScore > 0).length || 0
                            )}%
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search quizzes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="lg"
                    startContent={<FaQuestionCircle />}
                />
            </div>

            {/* Quizzes Table */}
            <div className="space-y-4">
                {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                        <CardBody className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-xl">{quiz.title}</h3>
                                        <Chip color={getStatusColor(quiz.status) as any} size="sm" variant="flat">
                                            {quiz.status.toUpperCase()}
                                        </Chip>
                                    </div>
                                    <p className="text-gray-600 mb-2">Course: {quiz.course}</p>
                                    <p className="text-sm text-gray-500">Instructor: {quiz.instructor}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Questions</p>
                                        <p className="text-xl font-bold">{quiz.questions}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="text-xl font-bold">{quiz.duration}m</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Submissions</p>
                                        <p className="text-xl font-bold">{quiz.submissions}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Score</p>
                                        <p className="text-xl font-bold text-green-600">{quiz.avgScore}%</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        startContent={<FaEye />}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="bordered"
                                        isIconOnly
                                        onPress={() => handleDelete(quiz.id, quiz.title)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
