"use client";

import React, { useState, useEffect, use } from "react";
import {
    Card,
    CardBody,
    Button,
    Progress,
    RadioGroup,
    Radio,
    Chip,
    Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaClock, FaCheck, FaTimes, FaTrophy } from "react-icons/fa";
import { useGetQuizByIdQuery } from "@/redux/api/quizApi";

interface Question {
    _id?: string;
    id?: string;
    questionText: string;
    questionImage?: string;
    questionType: "multiple-choice" | "short-answer" | "true-false";
    options?: { text: string; isCorrect: boolean }[];
    correctAnswer?: string;
    points: number;
}

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number | string }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [previousAttempt, setPreviousAttempt] = useState<any>(null);

    // Fetch quiz data from API
    const { data: quizData, isLoading, error } = useGetQuizByIdQuery(resolvedParams.id);
    const quiz = quizData?.data;

    // Check if student has already taken this quiz
    useEffect(() => {
        if (quiz) {
            const attemptKey = `quiz_attempt_${resolvedParams.id}`;
            const savedAttempt = localStorage.getItem(attemptKey);
            if (savedAttempt) {
                try {
                    const attempt = JSON.parse(savedAttempt);
                    setPreviousAttempt(attempt);
                    setAnswers(attempt.answers);
                    setScore(attempt.score);
                    setQuizSubmitted(true);
                } catch (e) {
                    console.error("Error loading previous attempt:", e);
                }
            }
        }
    }, [quiz, resolvedParams.id]);

    // Initialize timer when quiz loads
    useEffect(() => {
        if (quiz?.duration) {
            setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
        }
    }, [quiz]);

    // Timer
    useEffect(() => {
        if (quizSubmitted || !quiz) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizSubmitted, quiz]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerSelect = (questionIndex: number, answer: number | string) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const handleSubmitQuiz = () => {
        if (!quiz?.questions) return;

        // Calculate score automatically
        let totalScore = 0;
        let correctCount = 0;

        quiz.questions.forEach((question: Question, index: number) => {
            const userAnswer = answers[index];
            
            if (question.questionType === "multiple-choice" && question.options) {
                // Find correct option index
                const correctIndex = question.options.findIndex(opt => opt.isCorrect);
                if (userAnswer === correctIndex) {
                    totalScore += question.points;
                    correctCount++;
                }
            } else if (question.questionType === "true-false" || question.questionType === "short-answer") {
                if (userAnswer?.toString().toLowerCase() === question.correctAnswer?.toLowerCase()) {
                    totalScore += question.points;
                    correctCount++;
                }
            }
        });

        setScore(totalScore);
        setQuizSubmitted(true);

        // Save attempt to localStorage
        const attemptKey = `quiz_attempt_${resolvedParams.id}`;
        const attemptData = {
            quizId: resolvedParams.id,
            score: totalScore,
            totalPoints,
            answers,
            correctCount,
            totalQuestions: quiz.questions.length,
            submittedAt: new Date().toISOString(),
            percentage: (totalScore / totalPoints) * 100,
        };
        localStorage.setItem(attemptKey, JSON.stringify(attemptData));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading quiz..." />
            </div>
        );
    }

    // Error state
    if (error || !quiz) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card>
                    <CardBody className="text-center py-12">
                        <p className="text-danger mb-4">Failed to load quiz. Please try again.</p>
                        <Button color="primary" onPress={() => router.back()}>
                            Go Back
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const totalPoints = quiz.questions.reduce((sum: number, q: Question) => sum + q.points, 0);

    if (quizSubmitted) {
        const correctAnswers = quiz.questions.filter((q: Question, i: number) => {
            const userAnswer = answers[i];
            if (q.questionType === "multiple-choice" && q.options) {
                const correctIndex = q.options.findIndex(opt => opt.isCorrect);
                return userAnswer === correctIndex;
            } else {
                return userAnswer?.toString().toLowerCase() === q.correctAnswer?.toLowerCase();
            }
        }).length;
        const percentage = (score / totalPoints) * 100;
        const passed = percentage >= (quiz.passingScore || 60);
        const submittedDate = previousAttempt ? new Date(previousAttempt.submittedAt).toLocaleString() : new Date().toLocaleString();

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {previousAttempt && (
                    <Card className="mb-4 border-2 border-warning">
                        <CardBody className="p-4 bg-warning-50">
                            <p className="text-center font-semibold text-warning-700">
                                ℹ️ You have already taken this quiz. Retaking is not allowed. Below are your previous results.
                            </p>
                            <p className="text-center text-sm text-gray-600 mt-1">
                                Submitted on: {submittedDate}
                            </p>
                        </CardBody>
                    </Card>
                )}
                <Card className="border-2 border-primary">
                    <CardBody className="p-8 text-center">
                        <div className={`inline-block p-6 rounded-full mb-6 ${passed ? "bg-green-100" : "bg-orange-100"}`}>
                            <FaTrophy className={`text-6xl ${passed ? "text-green-600" : "text-orange-600"}`} />
                        </div>

                        <h1 className="text-4xl font-bold mb-2">
                            {passed ? "Congratulations! 🎉" : "Quiz Completed"}
                        </h1>
                        <p className="text-gray-600 mb-8">{quiz.title}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                                <p className="text-4xl font-bold text-primary">
                                    {score}/{totalPoints}
                                </p>
                            </div>

                            <div className="p-6 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                                <p className="text-4xl font-bold text-green-600">{percentage.toFixed(0)}%</p>
                            </div>

                            <div className="p-6 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                                <p className="text-4xl font-bold text-purple-600">
                                    {correctAnswers}/{quiz.questions.length}
                                </p>
                            </div>
                        </div>

                        {/* Review Answers */}
                        {quiz.showCorrectAnswers && (
                            <div className="text-left mb-8">
                                <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
                                <div className="space-y-4">
                                    {quiz.questions.map((question: Question, index: number) => {
                                        const userAnswer = answers[index];
                                        let isCorrect = false;
                                        let correctIndex = -1;

                                        if (question.questionType === "multiple-choice" && question.options) {
                                            correctIndex = question.options.findIndex(opt => opt.isCorrect);
                                            isCorrect = userAnswer === correctIndex;
                                        } else {
                                            isCorrect = userAnswer?.toString().toLowerCase() === question.correctAnswer?.toLowerCase();
                                        }

                                        return (
                                            <Card key={question._id || question.id || index} className={`border-2 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
                                                <CardBody className="p-4">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`p-2 rounded-full ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                                                            {isCorrect ? (
                                                                <FaCheck className="text-green-600" />
                                                            ) : (
                                                                <FaTimes className="text-red-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold mb-2">Q{index + 1}. {question.questionText}</p>

                                                            {question.questionImage && (
                                                                <div className="mb-3">
                                                                    <img
                                                                        src={question.questionImage}
                                                                        alt="Question image"
                                                                        className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                                        style={{ maxHeight: "300px" }}
                                                                    />
                                                                </div>
                                                            )}

                                                            {question.questionType === "multiple-choice" && question.options && (
                                                                <div className="space-y-2">
                                                                    {question.options.map((option, optIndex) => {
                                                                        const isUserAnswer = userAnswer === optIndex;
                                                                        const isCorrectAnswer = option.isCorrect;

                                                                        return (
                                                                            <div
                                                                                key={optIndex}
                                                                                className={`p-2 rounded-lg ${isCorrectAnswer
                                                                                    ? "bg-green-100 border-2 border-green-500"
                                                                                    : isUserAnswer
                                                                                        ? "bg-red-100 border-2 border-red-500"
                                                                                        : "bg-gray-50"
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    {isCorrectAnswer && <FaCheck className="text-green-600" />}
                                                                                    {isUserAnswer && !isCorrectAnswer && <FaTimes className="text-red-600" />}
                                                                                    <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                                                                    <span>{option.text}</span>
                                                                                    {isCorrectAnswer && <Chip size="sm" color="success">Correct</Chip>}
                                                                                    {isUserAnswer && !isCorrectAnswer && <Chip size="sm" color="danger">Your Answer</Chip>}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {(question.questionType === "true-false" || question.questionType === "short-answer") && (
                                                                <div className="space-y-2">
                                                                    <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                                                        <p className="text-sm text-gray-600">Correct Answer:</p>
                                                                        <p className="font-semibold text-green-700">{question.correctAnswer}</p>
                                                                    </div>
                                                                    {!isCorrect && (
                                                                        <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                                                                            <p className="text-sm text-gray-600">Your Answer:</p>
                                                                            <p className="font-semibold text-red-700">{userAnswer || "Not answered"}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button
                                color="primary"
                                size="lg"
                                onPress={() => router.push("/student/my-courses")}
                            >
                                Back to My Courses
                            </Button>
                            {!previousAttempt && (
                                <Button
                                    variant="bordered"
                                    size="lg"
                                    onPress={() => {
                                        setQuizSubmitted(false);
                                        setAnswers({});
                                        setCurrentQuestionIndex(0);
                                        setTimeLeft(quiz.duration * 60);
                                    }}
                                >
                                    Retake Quiz
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <Card className="mb-6">
                <CardBody className="p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{quiz.title}</h1>
                            {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
                        </div>
                        <div className="text-right">
                            {quiz.duration > 0 && (
                                <div className="flex items-center gap-2 text-orange-600 mb-2">
                                    <FaClock />
                                    <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
                                </div>
                            )}
                            <p className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {quiz.questions.length}
                            </p>
                        </div>
                    </div>

                    <Progress value={progress} color="primary" size="sm" className="mt-4" />
                </CardBody>
            </Card>

            {/* Question */}
            <Card className="mb-6">
                <CardBody className="p-8">
                    <div className="mb-6">
                        <Chip color="primary" variant="flat" className="mb-4">
                            Question {currentQuestionIndex + 1} • {currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}
                        </Chip>
                        <h2 className="text-2xl font-semibold mb-4">{currentQuestion.questionText}</h2>

                        {currentQuestion.questionImage && (
                            <div className="mb-6">
                                <img
                                    src={currentQuestion.questionImage}
                                    alt="Question image"
                                    className="max-w-full h-auto rounded-lg border-2 border-gray-200 mx-auto"
                                    style={{ maxHeight: "400px" }}
                                />
                            </div>
                        )}
                    </div>

                    {currentQuestion.questionType === "multiple-choice" && currentQuestion.options && (
                        <RadioGroup
                            value={answers[currentQuestionIndex]?.toString() || ""}
                            onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                        >
                            {currentQuestion.options.map((option: { text: string; isCorrect: boolean }, index: number) => (
                                <Radio key={index} value={index.toString()} className="mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                                        <span className="text-lg">{option.text}</span>
                                    </div>
                                </Radio>
                            ))}
                        </RadioGroup>
                    )}

                    {currentQuestion.questionType === "true-false" && (
                        <RadioGroup
                            value={answers[currentQuestionIndex]?.toString() || ""}
                            onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, value)}
                        >
                            <Radio value="true" className="mb-3">
                                <span className="text-lg">True</span>
                            </Radio>
                            <Radio value="false" className="mb-3">
                                <span className="text-lg">False</span>
                            </Radio>
                        </RadioGroup>
                    )}

                    {currentQuestion.questionType === "short-answer" && (
                        <input
                            type="text"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                            placeholder="Type your answer here..."
                            value={answers[currentQuestionIndex]?.toString() || ""}
                            onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Answered: {answeredCount} / {quiz.questions.length}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="bordered"
                        onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        isDisabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <Button
                            color="primary"
                            onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            color="primary"
                            onPress={handleSubmitQuiz}
                            startContent={<FaCheck />}
                        >
                            Submit Quiz
                        </Button>
                    )}
                </div>
            </div>

            {/* Question Navigation */}
            <Card className="mt-6">
                <CardBody className="p-4">
                    <p className="text-sm font-semibold mb-3">Question Navigator</p>
                    <div className="flex flex-wrap gap-2">
                        {quiz.questions.map((_: Question, index: number) => (
                            <Button
                                key={index}
                                size="sm"
                                variant={currentQuestionIndex === index ? "solid" : "bordered"}
                                color={answers[index] !== undefined ? "success" : "default"}
                                onPress={() => setCurrentQuestionIndex(index)}
                                className="min-w-12"
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
