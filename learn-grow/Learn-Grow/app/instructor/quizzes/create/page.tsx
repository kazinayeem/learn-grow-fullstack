"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Radio,
    RadioGroup,
    Chip,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaPlus, FaTrash, FaEdit, FaSave, FaCheck, FaImage } from "react-icons/fa";

interface Question {
    id: string;
    question: string;
    image?: string; // Optional image URL or base64
    options: string[];
    correctAnswer: number;
    points: number;
}

interface Quiz {
    type: "quiz" | "mid-exam" | "final-exam" | "assignment" | "project";
    title: string;
    course: string;
    duration?: number;
    dueDate?: string;
    maxPoints?: number;
    questions: Question[];
    status: "draft" | "published";
}

export default function CreateQuizPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <CreateQuizContent />
        </React.Suspense>
    );
}

function CreateQuizContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const [quiz, setQuiz] = useState<Quiz>({
        type: "quiz",
        title: "",
        course: "",
        duration: 30,
        questions: [],
        status: "draft",
    });

    useEffect(() => {
        const courseTitle = searchParams.get("courseTitle");
        if (courseTitle) {
            setQuiz(prev => ({ ...prev, course: courseTitle }));
        }
    }, [searchParams]);

    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: "",
        question: "",
        image: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 1,
    });

    const handleAddQuestion = () => {
        if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
            alert("Please fill in all question fields and options");
            return;
        }

        if (editingQuestion) {
            // Update existing question
            setQuiz({
                ...quiz,
                questions: quiz.questions.map(q =>
                    q.id === editingQuestion.id ? { ...currentQuestion, id: editingQuestion.id } : q
                ),
            });
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
        }

        // Reset form
        setCurrentQuestion({
            id: "",
            question: "",
            image: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
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
        }
    };

    const handleSaveQuiz = (status: "draft" | "published") => {
        if (!quiz.title || !quiz.course) {
            alert("Please fill in quiz title and course");
            return;
        }

        if (["quiz", "mid-exam", "final-exam"].includes(quiz.type) && quiz.questions.length === 0) {
            alert("Please add at least one question");
            return;
        }

        setQuiz({ ...quiz, status });
        alert(`Quiz ${status === "published" ? "published" : "saved as draft"} successfully!`);
        router.push("/instructor/quizzes");
    };

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Create Assessment 📝</h1>
                <p className="text-gray-600">Build quizzes, exams, or assignments for your course</p>
            </div>

            {/* Type Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
                {(["quiz", "mid-exam", "final-exam", "assignment", "project"] as const).map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setQuiz({ ...quiz, type })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${quiz.type === type
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } capitalize`}
                    >
                        {type.replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* Quiz Details */}
            <Card className="mb-6">
                <CardBody className="p-6">
                    <div className="space-y-4">
                        <Input
                            label="Quiz Title"
                            placeholder="e.g., Python Basics Quiz"
                            value={quiz.title}
                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                            size="lg"
                            isRequired
                        />

                        <Input
                            label="Course"
                            placeholder="e.g., Python for Beginners"
                            value={quiz.course}
                            onChange={(e) => setQuiz({ ...quiz, course: e.target.value })}
                            size="lg"
                            isRequired
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {["quiz", "mid-exam", "final-exam"].includes(quiz.type) ? (
                                <Input
                                    label="Duration (minutes)"
                                    type="number"
                                    value={quiz.duration?.toString()}
                                    onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) || 30 })}
                                    size="lg"
                                />
                            ) : (
                                <Input
                                    label="Due Date"
                                    type="datetime-local"
                                    value={quiz.dueDate || ""}
                                    onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                                    size="lg"
                                    isRequired
                                />
                            )}

                            <div className="flex items-end">
                                <div className="p-4 bg-blue-50 rounded-lg w-full">
                                    <p className="text-sm text-gray-600">Total Points</p>
                                    {["quiz", "mid-exam", "final-exam"].includes(quiz.type) ? (
                                        <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                                    ) : (
                                        <Input
                                            type="number"
                                            value={quiz.maxPoints?.toString() || "100"}
                                            onChange={(e) => setQuiz({ ...quiz, maxPoints: parseInt(e.target.value) })}
                                            label="Max Points"
                                            variant="bordered"
                                            size="sm"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Questions List - Only for Quizzes/Exams */}
            {["quiz", "mid-exam", "final-exam"].includes(quiz.type) && (
                <Card className="mb-6">
                    <CardBody className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Questions ({quiz.questions.length})</h2>
                            <Button
                                color="primary"
                                startContent={<FaPlus />}
                                onPress={() => {
                                    setEditingQuestion(null);
                                    setCurrentQuestion({
                                        id: "",
                                        question: "",
                                        image: "",
                                        options: ["", "", "", ""],
                                        correctAnswer: 0,
                                        points: 1,
                                    });
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
                                                    </div>
                                                    <p className="font-semibold text-lg mb-3">{question.question}</p>

                                                    {question.image && (
                                                        <div className="mb-3">
                                                            <img
                                                                src={question.image}
                                                                alt="Question image"
                                                                className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                                style={{ maxHeight: "200px" }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        {question.options.map((option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-2 rounded-lg ${optIndex === question.correctAnswer
                                                                    ? "bg-green-100 border-2 border-green-500"
                                                                    : "bg-gray-50"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {optIndex === question.correctAnswer && (
                                                                        <FaCheck className="text-green-600" />
                                                                    )}
                                                                    <span className="font-semibold">{String.fromCharCode(65 + optIndex)}.</span>
                                                                    <span>{option}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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
            )}

            {/* Assignment Details - Only for Assignments/Projects */}
            {["assignment", "project"].includes(quiz.type) && (
                <Card className="mb-6 bg-blue-50 border border-blue-100">
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <FaCheck className="text-blue-500 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-900">Submission Settings</h3>
                                <p className="text-blue-700">Students will be able to upload files or submit text for this {quiz.type}.</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
                <Button
                    variant="bordered"
                    size="lg"
                    onPress={() => router.push("/instructor/quizzes")}
                >
                    Cancel
                </Button>
                <Button
                    variant="bordered"
                    size="lg"
                    onPress={() => handleSaveQuiz("draft")}
                >
                    Save as Draft
                </Button>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaSave />}
                    onPress={() => handleSaveQuiz("published")}
                >
                    Publish Quiz
                </Button>
            </div>

            {/* Add/Edit Question Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {editingQuestion ? "Edit Question" : "Add New Question"}
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Question"
                                        placeholder="Enter your question"
                                        value={currentQuestion.question}
                                        onChange={(e) =>
                                            setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                                        }
                                        isRequired
                                    />

                                    <div>
                                        <label className="text-sm font-semibold block mb-2">Question Image (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setCurrentQuestion({
                                                            ...currentQuestion,
                                                            image: reader.result as string,
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600 cursor-pointer"
                                        />
                                        {currentQuestion.image && (
                                            <div className="mt-3 relative">
                                                <img
                                                    src={currentQuestion.image}
                                                    alt="Preview"
                                                    className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                                                    style={{ maxHeight: "200px" }}
                                                />
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    className="mt-2"
                                                    onPress={() => setCurrentQuestion({ ...currentQuestion, image: "" })}
                                                >
                                                    Remove Image
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold">Answer Options</label>
                                        {currentQuestion.options.map((option, index) => (
                                            <Input
                                                key={index}
                                                label={`Option ${String.fromCharCode(65 + index)}`}
                                                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...currentQuestion.options];
                                                    newOptions[index] = e.target.value;
                                                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                }}
                                                isRequired
                                            />
                                        ))}
                                    </div>

                                    <RadioGroup
                                        label="Correct Answer"
                                        value={currentQuestion.correctAnswer.toString()}
                                        onValueChange={(value) =>
                                            setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(value) })
                                        }
                                    >
                                        {currentQuestion.options.map((option, index) => (
                                            <Radio key={index} value={index.toString()}>
                                                Option {String.fromCharCode(65 + index)}: {option || "(empty)"}
                                            </Radio>
                                        ))}
                                    </RadioGroup>

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
