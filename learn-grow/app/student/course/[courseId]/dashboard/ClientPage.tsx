"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Progress,
    Chip,
    Accordion,
    AccordionItem,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaLock,
    FaVideo,
    FaFileAlt,
    FaClipboardList,
    FaTasks,
    FaBook,
    FaPlay,
    FaExternalLinkAlt,
} from "react-icons/fa";
import { useGetCourseByIdQuery } from "@/redux/api/courseApi";
import { toast } from "react-toastify";

interface Lesson {
    _id: string;
    id: string;
    title: string;
    type: "video" | "pdf" | "quiz" | "assignment" | "article";
    description?: string;
    contentUrl?: string;
    duration?: number;
    isLocked: boolean;
    isCompleted: boolean;
    lockReason?: string;
    isFreePreview?: boolean;
}

interface Module {
    _id: string;
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    isLocked: boolean;
    isCompleted: boolean;
    lockReason?: string;
}

export default function StudentCourseDashboardClient({ params }: { params: { courseId: string } }) {
    const router = useRouter();
    const { courseId } = params;
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Auth check - must be logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Wait for hydration
                if (typeof window === 'undefined') {
                    return;
                }

                // Give localStorage time to be available
                await new Promise(resolve => setTimeout(resolve, 100));

                const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
                const userStr = localStorage.getItem("user");
                
                console.log("[Dashboard] Auth check - Token:", !!token, "User:", !!userStr);

                if (!token || !userStr) {
                    console.warn("[Dashboard] No token or user found, redirecting to login");
                    toast.error("Please login to access this course");
                    setIsAuthorized(false);
                    setAuthChecked(true);
                    
                    // Redirect after a small delay
                    const timer = setTimeout(() => {
                        router.replace("/login");
                    }, 500);
                    
                    return () => clearTimeout(timer);
                }

                // Validate user can be parsed
                try {
                    const user = JSON.parse(userStr);
                    console.log("[Dashboard] User authenticated:", user._id);
                    setIsAuthorized(true);
                    setAuthChecked(true);
                } catch (parseErr) {
                    console.error("[Dashboard] Failed to parse user:", parseErr);
                    toast.error("Session invalid. Please login again.");
                    setIsAuthorized(false);
                    setAuthChecked(true);
                    
                    const timer = setTimeout(() => {
                        router.replace("/login");
                    }, 500);
                    
                    return () => clearTimeout(timer);
                }
            } catch (err) {
                console.error("[Dashboard] Auth check error:", err);
                setIsAuthorized(false);
                setAuthChecked(true);
                toast.error("Authentication error");
                
                const timer = setTimeout(() => {
                    router.replace("/login");
                }, 500);
                
                return () => clearTimeout(timer);
            }
        };

        checkAuth();
    }, [router]);

    // Fetch course data
    const { data: courseResponse, isLoading, error, refetch } = useGetCourseByIdQuery(courseId);
    const courseData = courseResponse?.data || null;

    // Log course fetch status
    useEffect(() => {
        if (authChecked && isAuthorized) {
            console.log("[Dashboard] Course fetch status - Loading:", isLoading, "Has data:", !!courseData, "Error:", error);
            if (courseData) {
                console.log("[Dashboard] Course loaded:", courseData.title, "Modules:", courseData.modules?.length || 0);
            }
            if (error) {
                console.error("[Dashboard] Course fetch error:", error);
            }
        }
    }, [isLoading, courseData, error, authChecked, isAuthorized]);

    const modules: Module[] = courseData?.modules || [];
    const isCompleted = courseData?.isCompleted || false;

    // Calculate progress
    const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    const completedLessons = modules.reduce(
        (sum, mod) => sum + mod.lessons.filter((l) => l.isCompleted).length,
        0
    );
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const getLessonIcon = (type: string) => {
        switch (type) {
            case "video":
                return <FaVideo />;
            case "pdf":
                return <FaFileAlt />;
            case "quiz":
                return <FaClipboardList />;
            case "assignment":
                return <FaTasks />;
            case "article":
                return <FaBook />;
            default:
                return <FaBook />;
        }
    };

    const handleLessonClick = (lesson: Lesson) => {
        if (lesson.isLocked) {
            toast.warning(lesson.lockReason || "This lesson is locked");
            return;
        }

        if (lesson.type === "quiz" || lesson.type === "assignment") {
            // Navigate to quiz or assignment page
            if (lesson.type === "quiz") {
                router.push(`/student/quiz/${lesson.id}`);
            } else {
                router.push(`/student/assignment/${lesson.id}`);
            }
        } else if (lesson.contentUrl) {
            setCurrentLesson(lesson);
            onOpen();
        } else {
            toast.info("No content available for this lesson yet");
        }
    };

    const renderLessonContent = () => {
        if (!currentLesson) return null;

        if (currentLesson.type === "video") {
            // Check if YouTube or other video URL
            const isYouTube = currentLesson.contentUrl?.includes("youtube.com") || currentLesson.contentUrl?.includes("youtu.be");
            
            if (isYouTube) {
                // Extract YouTube video ID
                let videoId = "";
                const url = currentLesson.contentUrl || "";
                if (url.includes("youtube.com/watch?v=")) {
                    videoId = url.split("v=")[1]?.split("&")[0] || "";
                } else if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
                }

                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={currentLesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            } else {
                // Direct video or Google Drive link
                return (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                            controls
                            className="w-full h-full"
                            src={currentLesson.contentUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            }
        } else if (currentLesson.type === "pdf" || currentLesson.type === "article") {
            // Check if Google Drive link
            const isGoogleDrive = currentLesson.contentUrl?.includes("drive.google.com");
            
            if (isGoogleDrive) {
                // Convert Google Drive view link to embed link
                let embedUrl = currentLesson.contentUrl || "";
                if (embedUrl.includes("/file/d/")) {
                    const fileId = embedUrl.split("/file/d/")[1]?.split("/")[0];
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                }

                return (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="100%"
                            allow="autoplay"
                            className="border-0"
                        ></iframe>
                    </div>
                );
            } else {
                return (
                    <div className="p-8 bg-gray-50 rounded-lg text-center">
                        <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-4">{currentLesson.title}</p>
                        <Button
                            color="primary"
                            size="lg"
                            startContent={<FaExternalLinkAlt />}
                            onPress={() => window.open(currentLesson.contentUrl, "_blank")}
                        >
                            Open Document
                        </Button>
                    </div>
                );
            }
        }

        return null;
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" label="Checking authorization..." />
                    <p className="mt-4 text-gray-600">Please wait while we verify your access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md">
                    <CardBody className="p-8 text-center">
                        <p className="text-gray-600 text-lg mb-4">You must be logged in to view this course.</p>
                        <Button color="primary" onPress={() => router.push("/login")}>
                            Go to Login
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading course..." />
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md">
                    <CardBody className="p-8 text-center">
                        <p className="text-red-500 text-lg mb-4">Failed to load course</p>
                        {error && (
                            <p className="text-sm text-gray-600 mb-4">
                                {typeof error === 'string' ? error : (error as any).status || 'Unknown error'}
                            </p>
                        )}
                        <div className="flex gap-2 justify-center">
                            <Button color="primary" onPress={() => refetch()}>
                                Retry
                            </Button>
                            <Button color="default" onPress={() => router.push("/student/my-courses")}>
                                Back to My Courses
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 shadow-lg">
                <div className="container mx-auto max-w-7xl">
                    <Button
                        variant="light"
                        startContent={<FaArrowLeft />}
                        onPress={() => router.push("/student/my-courses")}
                        className="text-white mb-4"
                    >
                        Back to My Courses
                    </Button>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[300px]">
                            <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
                            <p className="text-blue-100 mb-4">
                                Instructor: {courseData.instructorId?.name || "Unknown"}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                                <Chip
                                    color={isCompleted ? "success" : "warning"}
                                    variant="flat"
                                    startContent={isCompleted ? <FaCheckCircle /> : null}
                                    className="text-white"
                                >
                                    {isCompleted ? "Completed" : "In Progress"}
                                </Chip>
                                <span className="text-sm">
                                    {completedLessons} / {totalLessons} Lessons Completed
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
                            <p className="text-sm mb-2">Overall Progress</p>
                            <Progress
                                value={progressPercentage}
                                color="success"
                                className="mb-2"
                                size="lg"
                            />
                            <p className="text-2xl font-bold">{progressPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="container mx-auto max-w-7xl px-6 py-8">
                <Card>
                    <CardBody className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Course Content</h2>

                        {modules.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FaBook className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p>No modules available yet</p>
                            </div>
                        ) : (
                            <Accordion variant="bordered" selectionMode="multiple">
                                {modules.map((module, moduleIndex) => (
                                    <AccordionItem
                                        key={module.id}
                                        aria-label={module.title}
                                        title={
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        module.isCompleted ? "bg-green-100 text-green-600" :
                                                        module.isLocked ? "bg-gray-100 text-gray-400" :
                                                        "bg-blue-100 text-blue-600"
                                                    }`}>
                                                        {moduleIndex + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg">{module.title}</p>
                                                        {module.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {module.isLocked && (
                                                        <Chip size="sm" color="default" startContent={<FaLock />}>
                                                            Locked
                                                        </Chip>
                                                    )}
                                                    {module.isCompleted && (
                                                        <Chip size="sm" color="success" startContent={<FaCheckCircle />}>
                                                            Completed
                                                        </Chip>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        {module.lessons.filter(l => l.isCompleted).length}/{module.lessons.length} lessons
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        className={module.isLocked ? "opacity-60" : ""}
                                    >
                                        <div className="p-4 space-y-2">
                                            {module.isLocked ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <FaLock className="text-4xl mx-auto mb-3 text-gray-300" />
                                                    <p>{module.lockReason || "This module is locked"}</p>
                                                </div>
                                            ) : (
                                                module.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                                            lesson.isLocked
                                                                ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                                                                : lesson.isCompleted
                                                                ? "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"
                                                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                                                        }`}
                                                        onClick={() => handleLessonClick(lesson)}
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className={`p-3 rounded-lg ${
                                                                lesson.isCompleted ? "bg-green-200 text-green-700" :
                                                                lesson.isLocked ? "bg-gray-200 text-gray-500" :
                                                                "bg-blue-100 text-blue-600"
                                                            }`}>
                                                                {lesson.isLocked ? <FaLock /> : getLessonIcon(lesson.type)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-semibold">{lesson.title}</p>
                                                                    <Chip size="sm" variant="flat" className="capitalize">
                                                                        {lesson.type}
                                                                    </Chip>
                                                                    {lesson.isFreePreview && (
                                                                        <Chip size="sm" color="primary" variant="flat">
                                                                            Free Preview
                                                                        </Chip>
                                                                    )}
                                                                </div>
                                                                {lesson.description && (
                                                                    <p className="text-sm text-gray-500">{lesson.description}</p>
                                                                )}
                                                                {lesson.duration && (
                                                                    <p className="text-xs text-gray-400 mt-1">{lesson.duration} min</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {lesson.isCompleted && (
                                                                <Chip size="sm" color="success" startContent={<FaCheckCircle />}>
                                                                    Completed
                                                                </Chip>
                                                            )}
                                                            {lesson.isLocked ? (
                                                                <Chip size="sm" color="default" startContent={<FaLock />}>
                                                                    Locked
                                                                </Chip>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    color="primary"
                                                                    variant="flat"
                                                                    startContent={<FaPlay />}
                                                                >
                                                                    {lesson.type === "quiz" || lesson.type === "assignment" ? "Start" : "View"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardBody>
                </Card>

                {/* Course Completion Card */}
                {isCompleted && (
                    <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                        <CardBody className="p-8 text-center">
                            <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-800 mb-2">
                                🎉 Congratulations!
                            </h2>
                            <p className="text-green-700 mb-6">
                                You have completed this course. Great job!
                            </p>
                            <Button color="success" size="lg">
                                Download Certificate
                            </Button>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Lesson Content Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
                <ModalContent>
                    <ModalHeader>
                        <div>
                            <h3 className="text-xl font-bold">{currentLesson?.title}</h3>
                            {currentLesson?.description && (
                                <p className="text-sm text-gray-500 font-normal mt-1">
                                    {currentLesson.description}
                                </p>
                            )}
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-6">
                        {renderLessonContent()}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                            Close
                        </Button>
                        {currentLesson && !currentLesson.isCompleted && (
                            <Button color="success" onPress={async () => {
                                try {
                                    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/course/complete-lesson/${currentLesson.id}`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                    
                                    if (response.ok) {
                                        toast.success("Lesson marked as complete!");
                                        onClose();
                                        refetch();
                                    } else {
                                        const error = await response.json();
                                        toast.error(error.message || "Failed to mark lesson as complete");
                                    }
                                } catch (error) {
                                    console.error("Error marking lesson complete:", error);
                                    toast.error("Failed to mark lesson as complete");
                                }
                            }}>
                                Mark as Complete
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
