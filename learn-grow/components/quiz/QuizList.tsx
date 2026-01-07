"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Chip, Progress, Spinner } from "@nextui-org/react";
import { useGetQuizzesByCourseQuery } from "@/redux/api/quizApi";
import { useRouter } from "next/navigation";
import { FaLock } from "react-icons/fa";

interface QuizListProps {
    courseId: string;
    hasAccess?: boolean;
}

export default function QuizList({ courseId, hasAccess = false }: QuizListProps) {
    const router = useRouter();

    // Fetch quizzes from API
    const { data: quizzesData, isLoading, error } = useGetQuizzesByCourseQuery(courseId);
    const quizzes = quizzesData?.data || quizzesData?.quizzes || [];

    if (isLoading) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <Spinner size="lg" label="Loading quizzes..." />
                </CardBody>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-danger">Failed to load quizzes. Please try again.</p>
                </CardBody>
            </Card>
        );
    }

    if (!quizzes || quizzes.length === 0) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-default-500">No quizzes available for this course yet.</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {quizzes.map((quiz: any) => {
                const quizId = quiz._id;
                const isLocked = !hasAccess;

                if (!quizId) {
                    return null;
                }

                return (
                    <Card key={quizId} className={`hover:shadow-lg transition-shadow ${isLocked ? 'opacity-70 bg-gray-50' : ''}`}>
                        <CardBody>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {isLocked && <FaLock className="text-gray-500" />}
                                        <h3 className="text-xl font-bold">{quiz.title}</h3>
                                    </div>
                                    <p className="text-sm text-default-600 mb-3">{quiz.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip size="sm" variant="flat">
                                            📝 {quiz.questions?.length || 0} Questions
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            🎯 {quiz.passingScore || 60}% to Pass
                                        </Chip>
                                        {quiz.duration && (
                                            <Chip size="sm" variant="flat">
                                                ⏱️ {quiz.duration} min
                                            </Chip>
                                        )}
                                        {isLocked && (
                                            <Chip size="sm" color="warning" variant="flat">
                                                Locked
                                            </Chip>
                                        )}
                                        {!isLocked && quiz.status && (
                                            <Chip
                                                size="sm"
                                                color={quiz.status === "published" ? "success" : "warning"}
                                                variant="flat"
                                            >
                                                {quiz.status}
                                            </Chip>
                                        )}
                                    </div>
                                </div>

                                {!isLocked && (
                                    <div className="text-right ml-4">
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onPress={() => router.push(`/quiz/${quizId}`)}
                                        >
                                            Take Quiz
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}
