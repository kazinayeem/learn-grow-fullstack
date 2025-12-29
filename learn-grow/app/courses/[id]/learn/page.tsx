"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Spinner,
    Chip,
    Progress,
    Accordion,
    AccordionItem,
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import { useGetCourseByIdQuery } from "@/redux/api/courseApi";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import { 
    FaVideo, 
    FaFilePdf, 
    FaCheckCircle, 
    FaLock, 
    FaPlay, 
    FaDownload, 
    FaBook,
    FaClock,
    FaChevronLeft,
    FaTrophy,
    FaExpand
} from "react-icons/fa";

interface Lesson {
    _id: string;
    title: string;
    type: "video" | "pdf" | "quiz" | "assignment" | "article";
    contentUrl?: string;
    duration?: number;
    description?: string;
    isFreePreview?: boolean;
    isPublished?: boolean;
    orderIndex: number;
}

interface Module {
    _id: string;
    title: string;
    description?: string;
    lessons?: Lesson[];
    orderIndex: number;
}

export default function CourseLearnPage() {
    const params = useParams();
    const courseId = params?.id as string;
    const router = useRouter();
    
    const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(courseId);
    const { data: ordersData } = useGetMyOrdersQuery();
    
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const course = courseData?.data || courseData;
    const modules: Module[] = course?.modules || [];
    const orders = ordersData?.orders || [];

    // Check if user has access to this course
    const now = new Date();
    const hasAllAccess = orders.some(
        order =>
            order.planType === "quarterly" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            order.endDate &&
            new Date(order.endDate) > now
    );

    const hasPurchasedCourse = orders.some(
        order =>
            order.planType === "single" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            order.courseId?._id === courseId
    );

    const hasAccess = hasAllAccess || hasPurchasedCourse;

    // Load completed lessons from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`course-${courseId}-completed`);
        if (saved) {
            setCompletedLessons(new Set(JSON.parse(saved)));
        }
    }, [courseId]);

    // Save completed lessons to localStorage
    const markAsCompleted = (lessonId: string) => {
        const newCompleted = new Set(completedLessons);
        newCompleted.add(lessonId);
        setCompletedLessons(newCompleted);
        localStorage.setItem(`course-${courseId}-completed`, JSON.stringify(Array.from(newCompleted)));
    };

    // Calculate progress
    const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
    const completedCount = completedLessons.size;
    const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    const handleLessonClick = (lesson: Lesson) => {
        if (!hasAccess && !lesson.isFreePreview) {
            alert("Please purchase this course to access this lesson.");
            router.push(`/checkout?plan=single&courseId=${courseId}`);
            return;
        }
        setSelectedLesson(lesson);
        onOpen();
    };

    const handleMarkComplete = () => {
        if (selectedLesson) {
            markAsCompleted(selectedLesson._id);
        }
    };

    const getLessonIcon = (type: string) => {
        switch (type) {
            case "video":
                return <FaVideo className="text-red-500" />;
            case "pdf":
                return <FaFilePdf className="text-blue-500" />;
            case "article":
                return <FaBook className="text-green-500" />;
            default:
                return <FaBook />;
        }
    };

    if (courseLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading course..." />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl">Course not found</p>
                <Button onPress={() => router.push("/courses")}>Back to Courses</Button>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <FaLock className="text-6xl text-gray-300" />
                <h1 className="text-2xl font-bold">Course Access Required</h1>
                <p className="text-gray-600 text-center max-w-md">
                    You need to purchase this course or have an active subscription to access the learning materials.
                </p>
                <div className="flex gap-3">
                    <Button color="primary" onPress={() => router.push(`/checkout?plan=single&courseId=${courseId}`)}>
                        Buy This Course
                    </Button>
                    <Button variant="bordered" onPress={() => router.push("/pricing")}>
                        View All Plans
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={() => router.push(`/courses/${courseId}`)}
                            >
                                <FaChevronLeft />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold">{course.title}</h1>
                                <p className="text-sm text-gray-600">
                                    {completedCount} of {totalLessons} lessons completed
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Chip color="success" variant="flat" startContent={<FaTrophy />}>
                                {Math.round(progressPercentage)}% Complete
                            </Chip>
                        </div>
                    </div>
                    <Progress 
                        value={progressPercentage} 
                        color="success" 
                        className="mt-3"
                        size="sm"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Course Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <h2 className="text-2xl font-bold">Course Content</h2>
                            </CardHeader>
                            <CardBody>
                                {modules.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaBook className="text-6xl mx-auto mb-4 text-gray-300" />
                                        <p>No modules available yet</p>
                                    </div>
                                ) : (
                                    <Accordion 
                                        selectedKeys={[currentModuleIndex.toString()]}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0];
                                            if (selected !== undefined) {
                                                setCurrentModuleIndex(parseInt(selected.toString()));
                                            }
                                        }}
                                    >
                                        {[...modules]
                                            .sort((a, b) => a.orderIndex - b.orderIndex)
                                            .map((module, moduleIdx) => {
                                                const moduleLessons = module.lessons || [];
                                                const moduleCompleted = moduleLessons.filter(l => 
                                                    completedLessons.has(l._id)
                                                ).length;
                                                const moduleProgress = moduleLessons.length > 0 
                                                    ? (moduleCompleted / moduleLessons.length) * 100 
                                                    : 0;

                                                return (
                                                    <AccordionItem
                                                        key={moduleIdx.toString()}
                                                        title={
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="flex-1">
                                                                    <h3 className="font-semibold text-lg">
                                                                        {module.title}
                                                                    </h3>
                                                                    {module.description && (
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {module.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Chip size="sm" variant="flat">
                                                                        {moduleCompleted}/{moduleLessons.length}
                                                                    </Chip>
                                                                </div>
                                                            </div>
                                                        }
                                                    >
                                                        <div className="space-y-2 pt-2">
                                                            <Progress 
                                                                value={moduleProgress} 
                                                                color="success" 
                                                                size="sm"
                                                                className="mb-4"
                                                            />
                                                            {[...moduleLessons]
                                                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                                                .map((lesson, lessonIdx) => {
                                                                    const isCompleted = completedLessons.has(lesson._id);
                                                                    const isLocked = !hasAccess && !lesson.isFreePreview;
                                                                    const isPublished = lesson.isPublished !== false;

                                                                    if (!isPublished && !hasAccess) return null;

                                                                    return (
                                                                        <Card
                                                                            key={lesson._id}
                                                                            isPressable={!isLocked}
                                                                            onPress={() => !isLocked && handleLessonClick(lesson)}
                                                                            className={`${
                                                                                isCompleted ? 'bg-green-50 border-green-200' : ''
                                                                            } ${isLocked ? 'opacity-60' : ''}`}
                                                                        >
                                                                            <CardBody className="p-4">
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="text-2xl">
                                                                                        {isLocked ? (
                                                                                            <FaLock className="text-gray-400" />
                                                                                        ) : isCompleted ? (
                                                                                            <FaCheckCircle className="text-green-500" />
                                                                                        ) : (
                                                                                            getLessonIcon(lesson.type)
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <p className="font-medium">
                                                                                                {lessonIdx + 1}. {lesson.title}
                                                                                            </p>
                                                                                            {lesson.isFreePreview && (
                                                                                                <Chip size="sm" color="primary" variant="flat">
                                                                                                    Free Preview
                                                                                                </Chip>
                                                                                            )}
                                                                                        </div>
                                                                                        {lesson.description && (
                                                                                            <p className="text-sm text-gray-600 mt-1">
                                                                                                {lesson.description}
                                                                                            </p>
                                                                                        )}
                                                                                        <div className="flex items-center gap-3 mt-2">
                                                                                            <Chip size="sm" variant="flat" className="capitalize">
                                                                                                {lesson.type}
                                                                                            </Chip>
                                                                                            {lesson.duration && (
                                                                                                <Chip 
                                                                                                    size="sm" 
                                                                                                    variant="flat" 
                                                                                                    startContent={<FaClock />}
                                                                                                >
                                                                                                    {lesson.duration} min
                                                                                                </Chip>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    {!isLocked && (
                                                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary rounded-lg text-sm font-medium">
                                                                                            <FaPlay className="text-xs" />
                                                                                            <span>{isCompleted ? "Review" : "Start"}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </CardBody>
                                                                        </Card>
                                                                    );
                                                                })}
                                                        </div>
                                                    </AccordionItem>
                                                );
                                            })}
                                    </Accordion>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Info */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Course Overview</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Progress</p>
                                    <Progress 
                                        value={progressPercentage} 
                                        color="success" 
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-gray-600 mt-1">
                                        {completedCount} of {totalLessons} lessons
                                    </p>
                                </div>
                                <Divider />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Modules</span>
                                        <span className="font-semibold">{modules.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Lessons</span>
                                        <span className="font-semibold">{totalLessons}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Completed</span>
                                        <span className="font-semibold text-green-600">{completedCount}</span>
                                    </div>
                                </div>
                                {hasAllAccess && (
                                    <>
                                        <Divider />
                                        <Chip color="success" variant="flat" className="w-full justify-center">
                                            🎉 All Access Subscription Active
                                        </Chip>
                                    </>
                                )}
                            </CardBody>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Quick Actions</h3>
                            </CardHeader>
                            <CardBody className="space-y-2">
                                <Button 
                                    color="primary" 
                                    variant="flat"
                                    className="w-full justify-start"
                                    onPress={() => router.push(`/courses/${courseId}`)}
                                >
                                    Course Details
                                </Button>
                                <Button 
                                    color="secondary" 
                                    variant="flat"
                                    className="w-full justify-start"
                                    onPress={() => router.push("/student")}
                                >
                                    My Dashboard
                                </Button>
                                <Button 
                                    color="default" 
                                    variant="flat"
                                    className="w-full justify-start"
                                    onPress={() => router.push("/courses")}
                                >
                                    All Courses
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Lesson Viewer Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={onClose} 
                size="5xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader>
                        <div>
                            <h2 className="text-xl font-bold">{selectedLesson?.title}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Chip size="sm" variant="flat" className="capitalize">
                                    {selectedLesson?.type}
                                </Chip>
                                {completedLessons.has(selectedLesson?._id || "") && (
                                    <Chip size="sm" color="success" variant="flat" startContent={<FaCheckCircle />}>
                                        Completed
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        {selectedLesson && (
                            <div className="space-y-4">
                                {selectedLesson.description && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">{selectedLesson.description}</p>
                                    </div>
                                )}

                                {/* Content Display */}
                                {selectedLesson.type === "video" && selectedLesson.contentUrl && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        {selectedLesson.contentUrl.includes("youtube.com") || selectedLesson.contentUrl.includes("youtu.be") ? (
                                            <iframe
                                                src={selectedLesson.contentUrl.replace("watch?v=", "embed/")}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : selectedLesson.contentUrl.includes("vimeo.com") ? (
                                            <iframe
                                                src={selectedLesson.contentUrl}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="autoplay; fullscreen; picture-in-picture"
                                            />
                                        ) : (
                                            <video
                                                src={selectedLesson.contentUrl}
                                                controls
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                )}

                                {selectedLesson.type === "pdf" && selectedLesson.contentUrl && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FaFilePdf className="text-3xl text-red-500" />
                                                <div>
                                                    <p className="font-semibold">PDF Document</p>
                                                    <p className="text-sm text-gray-600">Click to view or download</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    startContent={<FaExpand />}
                                                    onPress={() => window.open(selectedLesson.contentUrl, "_blank")}
                                                >
                                                    Open
                                                </Button>
                                                <Button
                                                    color="secondary"
                                                    variant="flat"
                                                    startContent={<FaDownload />}
                                                    as="a"
                                                    href={selectedLesson.contentUrl}
                                                    download
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                        <iframe
                                            src={`${selectedLesson.contentUrl}#toolbar=0`}
                                            className="w-full h-[600px] border rounded-lg"
                                        />
                                    </div>
                                )}

                                {selectedLesson.type === "article" && selectedLesson.contentUrl && (
                                    <div className="prose max-w-none">
                                        <iframe
                                            src={selectedLesson.contentUrl}
                                            className="w-full h-[600px] border rounded-lg"
                                        />
                                    </div>
                                )}

                                {!selectedLesson.contentUrl && (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaBook className="text-6xl mx-auto mb-4 text-gray-300" />
                                        <p>Content not available yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Close
                        </Button>
                        {selectedLesson && !completedLessons.has(selectedLesson._id) && (
                            <Button 
                                color="success" 
                                onPress={() => {
                                    handleMarkComplete();
                                    onClose();
                                }}
                                startContent={<FaCheckCircle />}
                            >
                                Mark as Complete
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
