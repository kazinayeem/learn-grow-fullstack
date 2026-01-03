"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Radio,
    RadioGroup,
    Chip,
    Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaSave, FaCheck, FaImage } from "react-icons/fa";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useCreateQuizMutation } from "@/redux/api/quizApi";

interface Question {
    id: string;
    questionText: string;
    questionImage?: string;
    questionType: "multiple-choice";
    options: { text: string; image?: string; isCorrect: boolean }[];
    points: number;
}

interface Quiz {
    title: string;
    description?: string;
    courseId: string;
    duration: number;
    passingScore: number;
    questions: Question[];
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showCorrectAnswers: boolean;
}

export default function CreateQuizPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner /></div>}>
            <CreateQuizContent />
        </React.Suspense>
    );
}

function CreateQuizContent() {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [instructorId, setInstructorId] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
    const [serverErrorQuestionIndices, setServerErrorQuestionIndices] = useState<Set<number>>(new Set());

    const [quiz, setQuiz] = useState<Quiz>({
        title: "",
        description: "",
        courseId: "",
        duration: 30,
        passingScore: 60,
        questions: [],
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: true,
    });

    const [createQuiz] = useCreateQuizMutation();

    const { data: coursesResp } = useGetInstructorCoursesQuery(
        instructorId ? { instructorId, page: 1, limit: 100 } : null,
        {
            skip: !instructorId,
        }
    );

    const courses = Array.isArray(coursesResp?.data) ? coursesResp!.data : [];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setInstructorId(user._id || user.id || null);
            }
        }
    }, []);

    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: "",
        questionText: "",
        questionImage: "",
        questionType: "multiple-choice",
        options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
        points: 1,
    });

    const handleAddQuestion = () => {
        const questionErrors: { [key: string]: string } = {};

        // Validate question text
        if (!currentQuestion.questionText || currentQuestion.questionText.trim().length < 5) {
            questionErrors["questionText"] = "Question must be at least 5 characters";
        }

        // Validate multiple-choice options
        if (!currentQuestion.options || currentQuestion.options.length === 0) {
            questionErrors["options"] = "At least one option is required";
        } else {
            // Check all options have text
            currentQuestion.options.forEach((opt, idx) => {
                if (!opt.text || opt.text.trim().length === 0) {
                    questionErrors[`option_${idx}`] = "Option text required";
                }
            });
        }
        
        // Check at least one correct answer
        if (!currentQuestion.options?.some(opt => opt.isCorrect)) {
            questionErrors["correctAnswer"] = "Please select at least one correct answer";
        }

        // Check points
        if (!currentQuestion.points || currentQuestion.points < 1) {
            questionErrors["points"] = "Points must be at least 1";
        }

        // If there are errors, show them
        if (Object.keys(questionErrors).length > 0) {
            // Convert string errors to string[] for fieldErrors
            const convertedErrors: { [key: string]: string[] } = {};
            Object.entries(questionErrors).forEach(([key, value]) => {
                convertedErrors[key] = [value];
            });
            setFieldErrors(convertedErrors);
            toast.error("Please fix the errors in the question");
            return;
        }

        // Clear errors if validation passed
        setFieldErrors({});

        if (editingQuestion) {
            // Update existing question
            setQuiz({
                ...quiz,
                questions: quiz.questions.map(q =>
                    q.id === editingQuestion.id ? { ...currentQuestion, id: editingQuestion.id } : q
                ),
            });
            toast.success("Question updated");
        } else {
            // Add new question
            const newQuestion = {
                ...currentQuestion,
                id: Date.now().toString(),
            };
            setQuiz({
                ...quiz,
                questions: [...quiz.questions, newQuestion],
            });
            toast.success("Question added");
        }

        // Reset form
        setCurrentQuestion({
            id: "",
            questionText: "",
            questionImage: "",
            questionType: "multiple-choice",
            options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
            points: 1,
        });
        setEditingQuestion(null);
        onClose();
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setCurrentQuestion(question);
        onOpen();
    };

    const handleDeleteQuestion = (id: string) => {
        if (confirm("Delete this question?")) {
            setQuiz({
                ...quiz,
                questions: quiz.questions.filter(q => q.id !== id),
            });
            toast.success("Question deleted");
        }
    };

    const handleSaveQuiz = async (publish: boolean) => {
        // Clear previous errors
        setErrors({});
        setFieldErrors({});
        setServerErrorQuestionIndices(new Set());

        // Client-side validation
        const clientErrors: { [key: string]: string } = {};

        if (!quiz.title || quiz.title.trim().length < 3) {
            clientErrors["title"] = "Title must be at least 3 characters";
        }

        if (!quiz.courseId) {
            clientErrors["courseId"] = "Please select a course";
        }

        if (quiz.duration < 0) {
            clientErrors["duration"] = "Duration cannot be negative";
        }

        if (quiz.questions.length === 0) {
            clientErrors["questions"] = "Please add at least one question";
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            toast.error("Please fix the validation errors");
            return;
        }

        // Additional client-side validation: highlight questions with empty option text
        const localErrorIndices = new Set<number>();
        quiz.questions.forEach((q, idx) => {
            if (q.questionType === "multiple-choice" && q.options) {
                const hasEmpty = q.options.some(opt => !opt.text || opt.text.trim().length === 0);
                if (hasEmpty) localErrorIndices.add(idx);
            }
        });
        if (localErrorIndices.size > 0) {
            setServerErrorQuestionIndices(localErrorIndices);
            toast.error("Please fix highlighted questions: empty option text");
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform questions to API format
            const questionsForApi = quiz.questions.map((q, idx) => ({
                questionText: q.questionText,
                questionImage: q.questionImage,
                questionType: q.questionType,
                options: q.questionType === "multiple-choice" ? q.options : undefined,
                correctAnswer: q.questionType === "multiple-choice" ? undefined : q.correctAnswer,
                points: q.points,
                order: idx,
            }));

            await createQuiz({
                courseId: quiz.courseId,
                title: quiz.title,
                description: quiz.description,
                questions: questionsForApi,
                duration: quiz.duration,
                passingScore: quiz.passingScore,
                shuffleQuestions: quiz.shuffleQuestions,
                shuffleOptions: quiz.shuffleOptions,
                showCorrectAnswers: quiz.showCorrectAnswers,
            }).unwrap();

            toast.success(`Quiz ${publish ? "published" : "saved as draft"} successfully!`);
            router.push("/instructor/quizzes");
        } catch (error: any) {
            // Handle validation errors from API
            if (error?.data?.errors && Array.isArray(error.data.errors)) {
                const apiErrors: { [key: string]: string[] } = {};
                const indices = new Set<number>();
                error.data.errors.forEach((err: any) => {
                    const field = err.field || "general";
                    if (!apiErrors[field]) {
                        apiErrors[field] = [];
                    }
                    apiErrors[field].push(err.message);
                    const match = String(field).match(/questions\.(\d+)/);
                    if (match) {
                        const idx = parseInt(match[1], 10);
                        if (!Number.isNaN(idx)) indices.add(idx);
                    }
                });
                setFieldErrors(apiErrors);
                setServerErrorQuestionIndices(indices);
                
                // Show first error in toast
                const firstError = Object.values(apiErrors)[0];
                if (firstError && firstError.length > 0) {
                    toast.error(firstError[0]);
                }

                // Auto-open the first problematic question for quick fixing
                const firstErrField = error.data.errors[0]?.field as string | undefined;
                const openMatch = String(firstErrField || "").match(/questions\.(\d+)/);
                if (openMatch) {
                    const idx = parseInt(openMatch[1], 10);
                    if (!Number.isNaN(idx)) {
                        const q = quiz.questions[idx];
                        if (q) {
                            setEditingQuestion(q);
                            setCurrentQuestion(q);
                            onOpen();
                        }
                    }
                }
            } else {
                const errorMessage = error?.data?.message || "Failed to save quiz";
                setErrors({ general: errorMessage });
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Create Quiz 📝</h1>
                <p className="text-gray-600">Build interactive quizzes for your course</p>
            </div>

            {/* Error Summary */}
            {(Object.keys(errors).length > 0 || Object.keys(fieldErrors).length > 0) && (
                <Card className="mb-6 border-2 border-red-500 bg-red-50">
                    <CardBody className="p-4">
                        <h3 className="font-bold text-red-600 mb-2">Validation Errors:</h3>
                        <ul className="list-disc list-inside space-y-1 text-red-600">
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                            {Object.entries(fieldErrors).map(([key, messages]) => (
                                Array.isArray(messages) ? messages.map((msg, idx) => (
                                    <li key={`${key}-${idx}`}>{msg}</li>
                                )) : (
                                    <li key={key}>{String(messages)}</li>
                                )
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            )}

            {/* Quiz Details */}
            <Card className="mb-6">
                <CardBody className="p-6">
                    <div className="space-y-4">
                        {/* Course Selection */}
                        <div>
                            <Select
                                label="Select Course"
                                selectedKeys={quiz.courseId ? new Set([quiz.courseId]) : new Set()}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys as Set<string>)[0];
                                    setQuiz({ ...quiz, courseId: key || "" });
                                }}
                                disallowEmptySelection
                                isRequired
                                isDisabled={courses.length === 0 || !instructorId}
                                isInvalid={!!errors.courseId}
                                errorMessage={errors.courseId}
                            >
                                {courses.map((course: any) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <Input
                            label="Quiz Title"
                            placeholder="e.g., Python Basics Quiz"
                            value={quiz.title}
                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                            size="lg"
                            isRequired
                            isInvalid={!!errors.title}
                            errorMessage={errors.title}
                        />

                        <Input
                            label="Description (Optional)"
                            placeholder="Describe what this quiz covers"
                            value={quiz.description || ""}
                            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                            size="lg"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Duration (minutes)"
                                type="number"
                                value={quiz.duration.toString()}
                                onChange={(e) => {
                                    const n = parseInt(e.target.value);
                                    setQuiz({ ...quiz, duration: Number.isNaN(n) ? 30 : n });
                                }}
                                description="Set 0 for no time limit"
                                isRequired
                                isInvalid={!!errors.duration}
                                errorMessage={errors.duration}
                            />

                            <Input
                                label="Passing Score (%)"
                                type="number"
                                value={quiz.passingScore.toString()}
                                onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 60 })}
                                min={0}
                                max={100}
                            />
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={quiz.shuffleQuestions}
                                    onChange={(e) => setQuiz({ ...quiz, shuffleQuestions: e.target.checked })}
                                />
                                <span className="text-sm">Shuffle Questions</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={quiz.shuffleOptions}
                                    onChange={(e) => setQuiz({ ...quiz, shuffleOptions: e.target.checked })}
                                />
                                <span className="text-sm">Shuffle Options</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={quiz.showCorrectAnswers}
                                    onChange={(e) => setQuiz({ ...quiz, showCorrectAnswers: e.target.checked })}
                                />
                                <span className="text-sm">Show Correct Answers</span>
                            </label>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Questions List */}
            <Card className="mb-6">
                <CardBody className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Questions ({quiz.questions.length})</h2>
                            <p className="text-sm text-gray-600">Total Points: {totalPoints}{totalPoints === 0 ? " — add questions to accumulate points" : ""}</p>
                        </div>
                        <Button
                            color="primary"
                            startContent={<FaPlus />}
                            onPress={() => {
                                setEditingQuestion(null);
                                setCurrentQuestion({
                                    id: "",
                                    questionText: "",
                                    questionImage: "",
                                    questionType: "multiple-choice",
                                    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
                                    points: 1,
                                });
                                    // Clear any lingering error flags
                                    setFieldErrors({});
                                    setServerErrorQuestionIndices(new Set());
                                onOpen();
                            }}
                        >
                            Add Question
                        </Button>
                    </div>

                    {quiz.questions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="mb-4">No questions added yet</p>
                            <Button color="primary" onPress={onOpen}>Add Your First Question</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quiz.questions.map((question, index) => (
                                <Card key={question.id} className="border-2 border-gray-200">
                                    <CardBody className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Chip size="sm" variant="flat" color="primary">
                                                        Q{index + 1}
                                                    </Chip>
                                                    <Chip size="sm" variant="flat">
                                                        {question.points} {question.points === 1 ? "point" : "points"}
                                                    </Chip>
                                                    <Chip size="sm" variant="dot">
                                                        {question.questionType.replace("-", " ")}
                                                    </Chip>
                                                    {serverErrorQuestionIndices.has(index) && (
                                                        <Chip size="sm" color="danger" variant="flat">Fix required</Chip>
                                                    )}
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
                                                        {question.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-2 rounded-lg ${option.isCorrect
                                                                    ? "bg-green-100 border-2 border-green-500"
                                                                    : "bg-gray-50"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {option.isCorrect && (
                                                                        <FaCheck className="text-green-600" />
                                                                    )}
                                                                    <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                                                    <span>{option.text || <span className="text-red-600">(missing option text)</span>}</span>
                                                                </div>
                                                                {/* Inline server-side validation for option text */}
                                                                {(() => {
                                                                    const key = `body.questions.${index}.options.${optIndex}.text`;
                                                                    const msgs = fieldErrors[key];
                                                                    if (msgs && msgs.length > 0) {
                                                                        return (
                                                                            <p className="text-xs text-red-600 mt-1">{msgs[0]}</p>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {(question.questionType === "short-answer" || question.questionType === "true-false") && (
                                                    <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                                        <p className="text-sm text-gray-600">Correct Answer:</p>
                                                        <p className="font-semibold text-green-700">{question.correctAnswer}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="bordered"
                                                    isIconOnly
                                                    onPress={() => handleEditQuestion(question)}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="bordered"
                                                    isIconOnly
                                                    onPress={() => handleDeleteQuestion(question.id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <Button
                    variant="bordered"
                    size="lg"
                    onPress={() => router.push("/instructor/quizzes")}
                    isDisabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant="bordered"
                    size="lg"
                    onPress={() => handleSaveQuiz(false)}
                    isDisabled={isSubmitting || !quiz.title || !quiz.courseId}
                    isLoading={isSubmitting}
                >
                    Save as Draft
                </Button>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaSave />}
                    onPress={() => handleSaveQuiz(true)}
                    isDisabled={isSubmitting || !quiz.title || !quiz.courseId || quiz.questions.length === 0}
                    isLoading={isSubmitting}
                >
                    Publish Quiz
                </Button>
            </div>

            {/* Add/Edit Question Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isDismissable={false}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {editingQuestion ? "Edit Question" : "Add New Question"}
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    {/* Field Errors Display */}
                                    {Object.keys(fieldErrors).length > 0 && (
                                        <Card className="border-2 border-red-500 bg-red-50">
                                            <CardBody className="p-3">
                                                <p className="text-red-600 font-semibold text-sm mb-1">Please fix these errors:</p>
                                                <ul className="text-red-600 text-sm list-disc list-inside space-y-1">
                                                    {Object.values(fieldErrors).flat().map((msg, idx) => (
                                                        <li key={idx}>{msg}</li>
                                                    ))}
                                                </ul>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {/* Question Type - MCQ Only */}
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <p className="text-sm font-semibold text-blue-900">Question Type: Multiple Choice (MCQ)</p>
                                        <p className="text-xs text-blue-700 mt-1">Quiz questions are multiple choice with up to 4 options per question</p>
                                    </div>

                                    {/* Question Text */}
                                    <Input
                                        label="Question"
                                        placeholder="Enter your question (minimum 5 characters)"
                                        value={currentQuestion.questionText}
                                        onChange={(e) =>
                                            setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })
                                        }
                                        isRequired
                                        isInvalid={!!fieldErrors["questionText"]}
                                        errorMessage={fieldErrors["questionText"]?.[0]}
                                    />

                                    {/* Question Image URL */}
                                    <div>
                                        <label className="text-sm font-semibold block mb-2">Question Image URL (Optional)</label>
                                        <Input
                                            type="url"
                                            placeholder="https://example.com/image.jpg"
                                            value={currentQuestion.questionImage || ""}
                                            onChange={(e) =>
                                                setCurrentQuestion({
                                                    ...currentQuestion,
                                                    questionImage: e.target.value,
                                                })
                                            }
                                            className="w-full"
                                        />
                                        {currentQuestion.questionImage && (
                                            <div className="mt-3 relative">
                                                <img
                                                    src={currentQuestion.questionImage}
                                                    alt="Preview"
                                                    className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                    style={{ maxHeight: "200px" }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    className="mt-2"
                                                    onPress={() => setCurrentQuestion({ ...currentQuestion, questionImage: "" })}
                                                >
                                                    Remove URL
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Multiple Choice Options (exactly 4 options with image support) */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold">Answer Options (up to 4 options)</label>
                                        {currentQuestion.options?.slice(0, 4).map((option, index) => (
                                            <div key={index} className="border border-gray-300 rounded-lg p-3 space-y-2">
                                                <div className="flex gap-2 items-end">
                                                    <Input
                                                        label={`Option ${String.fromCharCode(65 + index)} Text`}
                                                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                                                        value={option.text}
                                                        onChange={(e) => {
                                                            const newOptions = [...(currentQuestion.options || [])];
                                                            newOptions[index] = { ...newOptions[index], text: e.target.value };
                                                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                        }}
                                                        className="flex-1"
                                                        isInvalid={!!fieldErrors[`option_${index}`]}
                                                        errorMessage={Array.isArray(fieldErrors[`option_${index}`]) ? fieldErrors[`option_${index}`][0] : (fieldErrors[`option_${index}`] as any)}
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded bg-blue-50 border border-blue-200">
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            checked={option.isCorrect}
                                                            onChange={() => {
                                                                const newOptions = currentQuestion.options?.map((opt, i) => ({
                                                                    ...opt,
                                                                    isCorrect: i === index,
                                                                })) || [];
                                                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium">Correct</span>
                                                    </label>
                                                </div>
                                                <Input
                                                    label={`Option ${String.fromCharCode(65 + index)} Image URL (Optional)`}
                                                    type="url"
                                                    placeholder="https://example.com/option-image.jpg"
                                                    value={option.image || ""}
                                                    onChange={(e) => {
                                                        const newOptions = [...(currentQuestion.options || [])];
                                                        newOptions[index] = { ...newOptions[index], image: e.target.value };
                                                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                    }}
                                                    size="sm"
                                                />
                                                {option.image && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={option.image}
                                                            alt={`Option ${String.fromCharCode(65 + index)}`}
                                                            className="max-w-full h-auto rounded border border-gray-200"
                                                            style={{ maxHeight: "120px" }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='10'%3EImage not found%3C/text%3E%3C/svg%3E";
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Points */}
                                    <Input
                                        label="Points"
                                        type="number"
                                        value={currentQuestion.points.toString()}
                                        onChange={(e) =>
                                            setCurrentQuestion({
                                                ...currentQuestion,
                                                points: parseInt(e.target.value) || 1,
                                            })
                                        }
                                        min={1}
                                        isInvalid={!!fieldErrors["points"]}
                                        errorMessage={fieldErrors["points"]?.[0]}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleAddQuestion}>
                                    {editingQuestion ? "Update Question" : "Add Question"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
