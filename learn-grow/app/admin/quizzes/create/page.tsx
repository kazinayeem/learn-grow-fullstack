"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Textarea,
    Button,
    Select,
    SelectItem,
    Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { PlusIcon, DeleteIcon } from "@/components/icons";

interface Question {
    id: string;
    type: "multiple-choice" | "true-false" | "short-answer";
    question: string;
    options?: string[];
    correctAnswer: string;
    points: number;
}

export default function CreateQuizPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        courseId: "",
        passingScore: 70,
        timeLimit: 30,
    });

    const [questions, setQuestions] = useState<Question[]>([{
        id: "Q1",
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 10,
    }]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const quizData = {
            ...formData,
            questions,
            id: `QUIZ-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        console.log("Creating quiz:", quizData);
        alert("Quiz created successfully! (Mock mode)");
        router.push("/admin");
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: `Q${questions.length + 1}`,
            type: "multiple-choice",
            question: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            points: 10,
        }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        if (updated[qIndex].options) {
            updated[qIndex].options![optIndex] = value;
            setQuestions(updated);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-5xl">
            <Button variant="light" onPress={() => router.back()} className="mb-6">
                ← Back to Admin
            </Button>

            <Card>
                <CardHeader className="flex-col items-start p-6">
                    <h1 className="text-2xl font-bold">Create New Quiz</h1>
                    <p className="text-gray-600">Add questions and configure quiz settings</p>
                </CardHeader>
                <CardBody className="p-6 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Quiz Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Quiz Information</h3>
                            <Input
                                label="Quiz Title"
                                placeholder="e.g., JavaScript Fundamentals Quiz"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                isRequired
                                variant="bordered"
                            />

                            <Textarea
                                label="Description"
                                placeholder="Brief description of the quiz..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                isRequired
                                variant="bordered"
                                minRows={2}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Course ID"
                                    placeholder="SAMPLE"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    variant="bordered"
                                />
                                <Input
                                    type="number"
                                    label="Passing Score (%)"
                                    value={formData.passingScore.toString()}
                                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                    variant="bordered"
                                />
                                <Input
                                    type="number"
                                    label="Time Limit (minutes)"
                                    value={formData.timeLimit.toString()}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                    variant="bordered"
                                />
                            </div>
                        </div>

                        <Divider />

                        {/* Questions */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Questions</h3>
                                <Button
                                    size="sm"
                                    color="success"
                                    startContent={<PlusIcon />}
                                    onPress={addQuestion}
                                >
                                    Add Question
                                </Button>
                            </div>

                            {questions.map((q, qIndex) => (
                                <Card key={q.id} className="bg-gray-50">
                                    <CardBody className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold">Question {qIndex + 1}</h4>
                                            {questions.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    isIconOnly
                                                    onPress={() => removeQuestion(qIndex)}
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Select
                                                label="Question Type"
                                                selectedKeys={[q.type]}
                                                onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                                                variant="bordered"
                                            >
                                                <SelectItem key="multiple-choice" value="multiple-choice">Multiple Choice</SelectItem>
                                                <SelectItem key="true-false" value="true-false">True/False</SelectItem>
                                                <SelectItem key="short-answer" value="short-answer">Short Answer</SelectItem>
                                            </Select>

                                            <Input
                                                type="number"
                                                label="Points"
                                                value={q.points.toString()}
                                                onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value))}
                                                variant="bordered"
                                            />
                                        </div>

                                        <Textarea
                                            label="Question"
                                            placeholder="Enter your question here..."
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                                            variant="bordered"
                                            minRows={2}
                                        />

                                        {q.type === "multiple-choice" && q.options && (
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600">Options</label>
                                                {q.options.map((opt, optIndex) => (
                                                    <Input
                                                        key={optIndex}
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                        variant="bordered"
                                                        size="sm"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <Input
                                            label="Correct Answer"
                                            placeholder="Enter correct answer..."
                                            value={q.correctAnswer}
                                            onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                                            variant="bordered"
                                        />
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        <Divider />

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" color="primary" size="lg" className="flex-1">
                                Create Quiz
                            </Button>
                            <Button type="button" variant="bordered" size="lg" onPress={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
