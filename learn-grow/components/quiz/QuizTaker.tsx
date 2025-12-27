"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    RadioGroup,
    Radio,
    Input,
    Progress,
    Chip,
    Divider,
} from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { submitQuizAttempt, type Quiz, type QuizAttempt } from "@/redux/slices/quizAssignmentSlice";
import type { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface QuizTakerProps {
    quiz: Quiz;
}

export default function QuizTaker({ quiz }: QuizTakerProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string | number }>({});
    const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : 0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [result, setResult] = useState<QuizAttempt | null>(null);
    const [startTime] = useState(Date.now());

    const handleSubmit = useCallback(() => {
        // Auto-grade the quiz
        let totalScore = 0;
        let totalPoints = 0;

        const gradedAnswers = quiz.questions.map((q) => {
            totalPoints += q.points;
            const userAnswer = answers[q.id];
            const isCorrect =
                String(userAnswer).toLowerCase().trim() ===
                String(q.correctAnswer).toLowerCase().trim();

            if (isCorrect) {
                totalScore += q.points;
            }

            return {
                questionId: q.id,
                answer: userAnswer || "",
            };
        });

        const percentage = (totalScore / totalPoints) * 100;
        const passed = percentage >= quiz.passingScore;
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        const attempt: QuizAttempt = {
            id: `ATTEMPT-${Date.now()}`,
            quizId: quiz.id,
            userId: localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!)?._id
                : "guest",
            answers: gradedAnswers,
            score: totalScore,
            totalPoints,
            percentage: Math.round(percentage),
            passed,
            startedAt: new Date(startTime).toISOString(),
            completedAt: new Date().toISOString(),
            timeSpent,
        };

        dispatch(submitQuizAttempt(attempt));
        setResult(attempt);
        setIsCompleted(true);
    }, [quiz.questions, quiz.id, quiz.passingScore, answers, startTime, dispatch]);

    // Timer countdown
    useEffect(() => {
        if (!quiz.timeLimit || isCompleted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz.timeLimit, isCompleted, handleSubmit]);

    const handleAnswerChange = (questionId: string, answer: string | number) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isCompleted && result) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-primary-50 to-secondary-50 p-8">
                    <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                    <Chip
                        color={result.passed ? "success" : "danger"}
                        size="lg"
                        variant="flat"
                        className="text-xl font-bold px-6 py-4"
                    >
                        {result.passed ? "✓ Passed" : "✗ Failed"}
                    </Chip>
                </CardHeader>
                <CardBody className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="text-center">
                            <p className="text-sm text-default-500">Score</p>
                            <p className="text-3xl font-bold text-primary">
                                {result.score}/{result.totalPoints}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-default-500">Percentage</p>
                            <p className="text-3xl font-bold text-secondary">{result.percentage}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-default-500">Passing Score</p>
                            <p className="text-3xl font-bold text-default-600">{quiz.passingScore}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-default-500">Time Spent</p>
                            <p className="text-3xl font-bold text-default-600">
                                {formatTime(result.timeSpent)}
                            </p>
                        </div>
                    </div>

                    <Progress
                        value={result.percentage}
                        color={result.passed ? "success" : "danger"}
                        size="lg"
                        className="mb-8"
                    />

                    <Divider className="my-6" />

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Answer Review</h3>
                        {quiz.questions.map((question, idx) => {
                            const userAnswer = result.answers.find((a) => a.questionId === question.id)?.answer;
                            const isCorrect =
                                String(userAnswer).toLowerCase().trim() ===
                                String(question.correctAnswer).toLowerCase().trim();

                            return (
                                <Card key={question.id} className={isCorrect ? "border-2 border-success" : "border-2 border-danger"}>
                                    <CardBody>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-semibold">
                                                {idx + 1}. {question.question}
                                            </p>
                                            <Chip color={isCorrect ? "success" : "danger"} size="sm" variant="flat">
                                                {isCorrect ? "✓" : "✗"} {question.points} pts
                                            </Chip>
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm">
                                                <span className="font-semibold">Your Answer:</span>{" "}
                                                <span className={isCorrect ? "text-success" : "text-danger"}>
                                                    {userAnswer || "Not answered"}
                                                </span>
                                            </p>
                                            {!isCorrect && (
                                                <p className="text-sm">
                                                    <span className="font-semibold">Correct Answer:</span>{" "}
                                                    <span className="text-success">{question.correctAnswer}</span>
                                                </p>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <Button color="primary" size="lg" onPress={() => router.push("/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </CardBody>
            </Card>
        );
    }

    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex justify-between items-center bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
                <div>
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <p className="text-sm text-default-500">{quiz.description}</p>
                </div>
                {quiz.timeLimit && (
                    <Chip
                        color={timeLeft < 60 ? "danger" : "primary"}
                        size="lg"
                        variant="flat"
                        className="font-mono text-xl px-4 py-2"
                    >
                        ⏱️ {formatTime(timeLeft)}
                    </Chip>
                )}
            </CardHeader>
            <CardBody className="p-8">
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        <span>{currentQ.points} points</span>
                    </div>
                    <Progress value={progress} color="primary" className="mb-4" />
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{currentQ.question}</h3>

                    {currentQ.type === "multiple-choice" && currentQ.options && (
                        <RadioGroup
                            value={String(answers[currentQ.id] || "")}
                            onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                        >
                            {currentQ.options.map((option, idx) => (
                                <Radio key={idx} value={option}>
                                    {option}
                                </Radio>
                            ))}
                        </RadioGroup>
                    )}

                    {currentQ.type === "true-false" && (
                        <RadioGroup
                            value={String(answers[currentQ.id] || "")}
                            onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                        >
                            <Radio value="true">True</Radio>
                            <Radio value="false">False</Radio>
                        </RadioGroup>
                    )}

                    {currentQ.type === "short-answer" && (
                        <Input
                            value={String(answers[currentQ.id] || "")}
                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                            placeholder="Type your answer here..."
                            size="lg"
                        />
                    )}
                </div>

                <Divider className="my-6" />

                <div className="flex justify-between">
                    <Button
                        onPress={handlePrevious}
                        isDisabled={currentQuestion === 0}
                        variant="flat"
                    >
                        Previous
                    </Button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <Button color="success" size="lg" onPress={handleSubmit} className="font-semibold">
                            Submit Quiz
                        </Button>
                    ) : (
                        <Button color="primary" onPress={handleNext}>
                            Next
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
