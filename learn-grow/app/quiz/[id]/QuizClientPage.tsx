"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Progress,
    RadioGroup,
    Radio,
    Chip,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaClock, FaCheck, FaTimes, FaTrophy } from "react-icons/fa";

interface Question {
    id: string;
    question: string;
    image?: string;
    options: string[];
    correctAnswer: number;
    points: number;
}

export default function TakeQuizPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Mock quiz data - replace with actual data from API
    const quiz = {
        id: params.id,
        title: "Python Basics Quiz",
        course: "Python for Beginners",
        duration: 30,
        totalPoints: 10,
        questions: [
            {
                id: "1",
                question: "What is the correct file extension for Python files?",
                options: [".python", ".py", ".pt", ".pyt"],
                correctAnswer: 1,
                points: 1,
            },
            {
                id: "2",
                question: "Which keyword is used to define a function in Python?",
                options: ["function", "func", "def", "define"],
                correctAnswer: 2,
                points: 1,
            },
            {
                id: "3",
                question: "What is the output of print(2 ** 3)?",
                options: ["5", "6", "8", "9"],
                correctAnswer: 2,
                points: 1,
            },
            {
                id: "4",
                question: "Which data type is mutable in Python?",
                options: ["tuple", "string", "int", "list"],
                correctAnswer: 3,
                points: 1,
            },
            {
                id: "5",
                question: "How do you create a comment in Python?",
                options: ["// comment", "/* comment */", "# comment", "<!-- comment -->"],
                correctAnswer: 2,
                points: 1,
            },
        ] as Question[],
    };

    // Timer
    useEffect(() => {
        if (quizSubmitted) return;

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
    }, [quizSubmitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
        setAnswers({ ...answers, [questionIndex]: answerIndex });
    };

    const handleSubmitQuiz = () => {
        // Calculate score automatically
        let totalScore = 0;
        let correctCount = 0;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                totalScore += question.points;
                correctCount++;
            }
        });

        setScore(totalScore);
        setQuizSubmitted(true);
    };

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    if (quizSubmitted) {
        const correctAnswers = quiz.questions.filter(
            (q, i) => answers[i] === q.correctAnswer
        ).length;
        const percentage = (score / quiz.totalPoints) * 100;
        const passed = percentage >= 60;

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                                    {score}/{quiz.totalPoints}
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
                        <div className="text-left mb-8">
                            <h2 className="text-2xl font-bold mb-4">Review Your Answers</h2>
                            <div className="space-y-4">
                                {quiz.questions.map((question, index) => {
                                    const userAnswer = answers[index];
                                    const isCorrect = userAnswer === question.correctAnswer;

                                    return (
                                        <Card key={question.id} className={`border-2 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
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
                                                        <p className="font-semibold mb-2">Q{index + 1}. {question.question}</p>

                                                        {question.image && (
                                                            <div className="mb-3">
                                                                <img
                                                                    src={question.image}
                                                                    alt="Question image"
                                                                    className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                                    style={{ maxHeight: "300px" }}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="space-y-2">
                                                            {question.options.map((option, optIndex) => {
                                                                const isUserAnswer = userAnswer === optIndex;
                                                                const isCorrectAnswer = question.correctAnswer === optIndex;

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
                                                                            <span>{option}</span>
                                                                            {isCorrectAnswer && <Chip size="sm" color="success">Correct</Chip>}
                                                                            {isUserAnswer && !isCorrectAnswer && <Chip size="sm" color="danger">Your Answer</Chip>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                color="primary"
                                size="lg"
                                onPress={() => router.push("/dashboard/my-courses")}
                            >
                                Back to Courses
                            </Button>
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
                            <p className="text-gray-600">{quiz.course}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                                <FaClock />
                                <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
                            </div>
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
                        <h2 className="text-2xl font-semibold mb-4">{currentQuestion.question}</h2>

                        {currentQuestion.image && (
                            <div className="mb-6">
                                <img
                                    src={currentQuestion.image}
                                    alt="Question image"
                                    className="max-w-full h-auto rounded-lg border-2 border-gray-200 mx-auto"
                                    style={{ maxHeight: "400px" }}
                                />
                            </div>
                        )}
                    </div>

                    <RadioGroup
                        value={answers[currentQuestionIndex]?.toString() || ""}
                        onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
                    >
                        {currentQuestion.options.map((option, index) => (
                            <Radio key={index} value={index.toString()} className="mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                                    <span className="text-lg">{option}</span>
                                </div>
                            </Radio>
                        ))}
                    </RadioGroup>
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
                        {quiz.questions.map((_, index) => (
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
