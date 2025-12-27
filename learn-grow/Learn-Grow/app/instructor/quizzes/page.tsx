"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Input,
    Chip,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaQuestionCircle, FaClock } from "react-icons/fa";

export default function InstructorQuizzesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const [quizzes, setQuizzes] = useState([
        {
            id: "1",
            type: "quiz",
            title: "Python Basics Quiz",
            course: "Python for Beginners",
            questions: 15,
            duration: 30,
            status: "published",
            submissions: 45,
            avgScore: 78,
            dueDate: null,
        },
        {
            id: "2",
            type: "mid-exam",
            title: "Python Mid-Term Exam",
            course: "Python for Beginners",
            questions: 25,
            duration: 60,
            status: "published",
            submissions: 42,
            avgScore: 72,
            dueDate: "2024-10-15T10:00:00",
        },
        {
            id: "3",
            type: "project",
            title: "Final Python Project",
            course: "Python for Beginners",
            questions: 0,
            duration: 0,
            status: "draft",
            submissions: 0,
            avgScore: 0,
            dueDate: "2024-12-20T23:59:00",
        },
        {
            id: "4",
            type: "assignment",
            title: "Weekly Code Submission",
            course: "Web Development Bootcamp",
            questions: 0,
            duration: 0,
            status: "active",
            submissions: 12,
            avgScore: 85,
            dueDate: "2024-11-05T23:59:00",
        }
    ]);

    const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Delete quiz: "${title}"?`)) {
            setQuizzes(quizzes.filter((q) => q.id !== id));
            alert("Quiz deleted!");
        }
    };

    const getStatusColor = (status: string) => {
        return status === "published" ? "success" : "warning";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Assessments 📝</h1>
                    <p className="text-gray-600">Create and manage quizzes, exams, and assignments</p>
                </div>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaPlus />}
                    onPress={() => router.push("/instructor/quizzes/create")}
                >
                    Create Assessment
                </Button>
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
                        <p className="text-sm text-gray-600 mb-1">Published</p>
                        <p className="text-3xl font-bold text-green-600">
                            {quizzes.filter((q) => q.status === "published").length}
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
                        <p className="text-3xl font-bold text-yellow-600">
                            {Math.round(
                                quizzes.filter((q) => q.avgScore > 0).reduce((sum, q) => sum + q.avgScore, 0) /
                                quizzes.filter((q) => q.avgScore > 0).length || 0
                            )}
                            %
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

            {/* Quizzes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-xl transition-shadow">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2">
                                    <Chip color={getStatusColor(quiz.status) as any} size="sm" variant="flat">
                                        {quiz.status.toUpperCase()}
                                    </Chip>
                                    <Chip size="sm" variant="dot" color="secondary">
                                        {(quiz.type || 'quiz').toUpperCase().replace("-", " ")}
                                    </Chip>
                                </div>
                                {quiz.avgScore > 0 && (
                                    <span className="text-green-600 font-semibold">{quiz.avgScore}% avg</span>
                                )}
                            </div>

                            <h3 className="font-bold text-xl mb-2 line-clamp-2">{quiz.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{quiz.course}</p>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {["quiz", "mid-exam", "final-exam"].includes(quiz.type || 'quiz') ? (
                                    <>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaQuestionCircle className="text-primary" />
                                            <span>{quiz.questions} questions</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaClock className="text-orange-500" />
                                            <span>{quiz.duration} mins</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="col-span-2 flex items-center gap-2 text-sm text-red-500">
                                        <FaClock />
                                        <span>Due: {new Date(quiz.dueDate || "").toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm text-gray-500">
                                <p>{quiz.submissions} submissions</p>
                            </div>
                        </CardBody>

                        <CardFooter className="p-6 pt-0 flex gap-2">
                            <Button
                                size="sm"
                                variant="bordered"
                                startContent={<FaEye />}
                                className="flex-1"
                                onPress={() => router.push(`/quiz/${quiz.id}`)}
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                color="primary"
                                variant="bordered"
                                startContent={<FaEdit />}
                                onPress={() => router.push(`/instructor/quizzes/${quiz.id}/edit`)}
                            >
                                Edit
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
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
