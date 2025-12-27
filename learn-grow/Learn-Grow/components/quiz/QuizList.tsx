"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Chip, Progress } from "@nextui-org/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface QuizListProps {
    courseId: string;
}

export default function QuizList({ courseId }: QuizListProps) {
    const router = useRouter();
    const quizzes = useSelector((state: RootState) =>
        state.quizAssignment.quizzes.filter((q) => q.courseId === courseId)
    );
    const attempts = useSelector((state: RootState) => state.quizAssignment.quizAttempts);

    const getQuizStats = (quizId: string) => {
        const quizAttempts = attempts.filter((a) => a.quizId === quizId);
        const passed = quizAttempts.filter((a) => a.passed).length > 0;
        const bestScore = quizAttempts.length > 0
            ? Math.max(...quizAttempts.map((a) => a.percentage))
            : 0;
        const attemptCount = quizAttempts.length;

        return { passed, bestScore, attemptCount };
    };

    if (quizzes.length === 0) {
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
            {quizzes.map((quiz) => {
                const stats = getQuizStats(quiz.id);

                return (
                    <Card key={quiz.id} isPressable className="hover:shadow-lg transition-shadow">
                        <CardBody>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                                    <p className="text-sm text-default-600 mb-3">{quiz.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Chip size="sm" variant="flat">
                                            📝 {quiz.questions.length} Questions
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            🎯 {quiz.passingScore}% to Pass
                                        </Chip>
                                        {quiz.timeLimit && (
                                            <Chip size="sm" variant="flat">
                                                ⏱️ {quiz.timeLimit} min
                                            </Chip>
                                        )}
                                        {stats.attemptCount > 0 && (
                                            <Chip
                                                size="sm"
                                                color={stats.passed ? "success" : "warning"}
                                                variant="flat"
                                            >
                                                {stats.attemptCount} Attempt{stats.attemptCount > 1 ? "s" : ""}
                                            </Chip>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right ml-4">
                                    {stats.attemptCount > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs text-default-500">Best Score</p>
                                            <p className="text-2xl font-bold text-primary">{stats.bestScore}%</p>
                                            {stats.passed && (
                                                <Chip color="success" size="sm" variant="flat" className="mt-1">
                                                    ✓ Passed
                                                </Chip>
                                            )}
                                        </div>
                                    )}
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onPress={() => router.push(`/quiz/${quiz.id}`)}
                                    >
                                        {stats.attemptCount > 0 ? "Retake Quiz" : "Take Quiz"}
                                    </Button>
                                </div>
                            </div>

                            {stats.bestScore > 0 && (
                                <Progress
                                    value={stats.bestScore}
                                    color={stats.passed ? "success" : "warning"}
                                    size="sm"
                                    className="mt-2"
                                />
                            )}
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}
