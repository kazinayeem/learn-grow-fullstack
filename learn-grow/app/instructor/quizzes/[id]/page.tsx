"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Spinner,
    Divider,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaArrowLeft, FaCheck, FaClock, FaQuestionCircle } from "react-icons/fa";
import { useGetQuizByIdQuery, useDeleteQuizMutation, usePublishQuizMutation } from "@/redux/api/quizApi";

export default function ViewQuizPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner /></div>}>
            <ViewQuizContent />
        </React.Suspense>
    );
}

function ViewQuizContent() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const { data: quizData, isLoading } = useGetQuizByIdQuery(quizId);
    const [deleteQuiz] = useDeleteQuizMutation();
    const [publishQuiz] = usePublishQuizMutation();

    const quiz = quizData?.data;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteQuiz(quizId).unwrap();
            toast.success("Quiz deleted successfully");
            router.push("/instructor/quizzes");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete quiz");
        }
    };

    const handlePublish = async (status: "published" | "draft" | "active") => {
        try {
            await publishQuiz({ id: quizId, status }).unwrap();
            toast.success(`Quiz ${status === "published" ? "published" : status === "draft" ? "unpublished" : "activated"} successfully`);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update quiz status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading quiz..." />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Card>
                    <CardBody className="text-center py-12">
                        <p className="text-gray-500 mb-4">Quiz not found</p>
                        <Button color="primary" onPress={() => router.push("/instructor/quizzes")}>
                            Back to Quizzes
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || 0;

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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="light"
                    startContent={<FaArrowLeft />}
                    onPress={() => router.push("/instructor/quizzes")}
                    className="mb-4"
                >
                    Back to Quizzes
                </Button>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
                        {quiz.description && (
                            <p className="text-gray-600 mb-4">{quiz.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Chip
                                startContent={quiz.status === "published" ? <FaCheck /> : undefined}
                                variant="flat"
                                color={getStatusColor(quiz.status)}
                            >
                                {quiz.status?.charAt(0).toUpperCase() + quiz.status?.slice(1)}
                            </Chip>
                            <Chip variant="flat" startContent={<FaQuestionCircle />}>
                                {quiz.questions?.length || 0} Questions
                            </Chip>
                            <Chip variant="flat" startContent={<FaClock />}>
                                {quiz.duration} minutes
                            </Chip>
                            <Chip variant="flat">
                                {totalPoints} Total Points
                            </Chip>
                            <Chip variant="flat">
                                {quiz.passingScore}% to Pass
                            </Chip>
                        </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                        <Button
                            color="primary"
                            startContent={<FaEdit />}
                            onPress={() => router.push(`/instructor/quizzes/${quizId}/edit`)}
                        >
                            Edit
                        </Button>
                        <Button
                            color="danger"
                            variant="bordered"
                            startContent={<FaTrash />}
                            onPress={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quiz Settings */}
            <Card className="mb-6">
                <CardHeader className="bg-gray-100">
                    <h2 className="text-xl font-semibold">Quiz Settings</h2>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold">{quiz.duration} minutes</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Passing Score</p>
                            <p className="font-semibold">{quiz.passingScore}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Points</p>
                            <p className="font-semibold">{totalPoints}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Shuffle Questions</p>
                            <p className="font-semibold">{quiz.shuffleQuestions ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Shuffle Options</p>
                            <p className="font-semibold">{quiz.shuffleOptions ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Show Correct Answers</p>
                            <p className="font-semibold">{quiz.showCorrectAnswers ? "Yes" : "No"}</p>
                        </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="flex gap-2">
                        {quiz.status === "draft" && (
                            <Button
                                color="success"
                                onPress={() => handlePublish("published")}
                            >
                                Publish Quiz
                            </Button>
                        )}
                        {quiz.status === "published" && (
                            <Button
                                color="warning"
                                variant="bordered"
                                onPress={() => handlePublish("draft")}
                            >
                                Unpublish Quiz
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Questions */}
            <Card>
                <CardHeader className="bg-gray-100">
                    <h2 className="text-xl font-semibold">Questions ({quiz.questions?.length || 0})</h2>
                </CardHeader>
                <CardBody className="p-6">
                    {!quiz.questions || quiz.questions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="mb-4">No questions added yet</p>
                            <Button
                                color="primary"
                                onPress={() => router.push(`/instructor/quizzes/${quizId}/edit`)}
                            >
                                Add Questions
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {quiz.questions.map((question: any, index: number) => (
                                <Card key={question._id || index} className="border-2 border-gray-200">
                                    <CardBody className="p-4">
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Chip size="sm" variant="flat" color="primary">
                                                    Q{index + 1}
                                                </Chip>
                                                <Chip size="sm" variant="flat">
                                                    {question.points} {question.points === 1 ? "point" : "points"}
                                                </Chip>
                                                <Chip size="sm" variant="dot">
                                                    {question.questionType?.replace("-", " ")}
                                                </Chip>
                                            </div>
                                            <p className="font-semibold text-lg mb-3">{question.questionText}</p>

                                            {question.questionImage && (
                                                <div className="mb-3">
                                                    <img
                                                        src={question.questionImage}
                                                        alt="Question"
                                                        className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                        style={{ maxHeight: "200px" }}
                                                    />
                                                </div>
                                            )}

                                            {question.questionType === "multiple-choice" && question.options && (
                                                <div className="space-y-2">
                                                    {question.options.map((option: any, optIndex: number) => (
                                                        <div
                                                            key={optIndex}
                                                            className={`p-3 rounded-lg ${option.isCorrect
                                                                ? "bg-green-100 border-2 border-green-500"
                                                                : "bg-gray-50 border-2 border-gray-200"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {option.isCorrect && (
                                                                    <FaCheck className="text-green-600" />
                                                                )}
                                                                <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                                                <span>{option.text}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(question.questionType === "short-answer" || question.questionType === "true-false") && (
                                                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                                    <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                                                    <p className="font-semibold text-green-700">{question.correctAnswer}</p>
                                                </div>
                                            )}

                                            {question.explanation && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                    <p className="text-sm text-gray-600 mb-1">Explanation:</p>
                                                    <p className="text-sm">{question.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Statistics */}
            <Card className="mt-6">
                <CardHeader className="bg-gray-100">
                    <h2 className="text-xl font-semibold">Statistics</h2>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Attempts</p>
                            <p className="text-2xl font-bold">{quiz.attemptCount || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Submissions</p>
                            <p className="text-2xl font-bold">{quiz.submissionsCount || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Max Attempts</p>
                            <p className="text-2xl font-bold">{quiz.totalAttempts === 0 ? "Unlimited" : quiz.totalAttempts}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="text-sm font-semibold">
                                {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
