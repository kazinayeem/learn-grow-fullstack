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
    Tabs,
    Tab,
    Avatar,
    Divider,
    CircularProgress,
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
    FaClock,
    FaChartLine,
    FaGraduationCap,
    FaCalendar,
    FaAward,
} from "react-icons/fa";
import { useGetCourseByIdQuery } from "@/redux/api/courseApi";
import { useGetQuizzesByCourseQuery } from "@/redux/api/quizApi";
import { useGetAssignmentsByCourseQuery } from "@/redux/api/assignmentApi";
import {
    useGenerateCertificateMutation,
    useGetCertificateQuery,
} from "@/redux/api/certificateApi";
import CertificateComponent from "@/components/certificate/CertificateComponent";
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
    const [activeTab, setActiveTab] = useState("overview");
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

    // Fetch quizzes for this course
    const { data: quizzesResponse, isLoading: quizzesLoading } = useGetQuizzesByCourseQuery(courseId);
    const quizzes = quizzesResponse?.data || [];

    // Fetch assignments for this course
    const { data: assignmentsResponse, isLoading: assignmentsLoading } = useGetAssignmentsByCourseQuery(courseId);
    const assignments = assignmentsResponse?.data || [];

    // Certificate management
    const [generateCertificate, { isLoading: generatingCertificate }] = useGenerateCertificateMutation();
    const { data: certificateResponse, refetch: refetchCertificate } = useGetCertificateQuery(courseId, {
        skip: !authChecked || !isAuthorized,
    });
    const certificate = certificateResponse?.data || null;

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

    // Calculate progress
    const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
    const completedLessons = modules.reduce(
        (sum, mod) => sum + mod.lessons.filter((l) => l.isCompleted).length,
        0
    );
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Course is completed when progress reaches 100%
    const isCompleted = progressPercentage === 100;

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
                router.push(`/quiz/${lesson.id}`);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Modern Header with Course Info */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
                    {/* Back Button */}
                    <Button
                        variant="light"
                        size="sm"
                        startContent={<FaArrowLeft />}
                        onPress={() => router.push("/student/my-courses")}
                        className="mb-4 text-gray-600 hover:text-gray-900"
                    >
                        Back to My Courses
                    </Button>

                    {/* Course Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Left: Course Info */}
                        <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                                <Avatar
                                    src={courseData.instructorId?.avatar}
                                    name={courseData.instructorId?.name}
                                    size="lg"
                                    className="flex-shrink-0"
                                />
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                        {courseData.title}
                                    </h1>
                                    <p className="text-gray-600 flex items-center gap-2 mb-2">
                                        <FaGraduationCap className="text-blue-600" />
                                        <span>Instructor: {courseData.instructorId?.name || "Unknown"}</span>
                                    </p>
                                    {courseData.description && (
                                        <div 
                                            className="text-sm text-gray-500 line-clamp-2 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: courseData.description }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <Chip
                                    color={isCompleted ? "success" : "primary"}
                                    variant="flat"
                                    startContent={isCompleted ? <FaCheckCircle /> : <FaClock />}
                                    size="lg"
                                >
                                    {isCompleted ? "Completed" : "In Progress"}
                                </Chip>
                                <span className="text-sm text-gray-600">
                                    {completedLessons} of {totalLessons} lessons completed
                                </span>
                            </div>
                        </div>

                        {/* Right: Progress Card */}
                        <Card className="w-full lg:w-80 shadow-lg border-2 border-blue-100">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                                        <p className="text-3xl font-bold text-blue-600">{progressPercentage}%</p>
                                    </div>
                                    <CircularProgress
                                        value={progressPercentage}
                                        size="lg"
                                        color="primary"
                                        showValueLabel={false}
                                        strokeWidth={4}
                                    />
                                </div>
                                <Progress
                                    value={progressPercentage}
                                    color="primary"
                                    size="sm"
                                    className="mb-3"
                                />
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-gray-600">Modules</p>
                                        <p className="text-lg font-bold text-blue-600">{modules.length}</p>
                                    </div>
                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                        <p className="text-xs text-gray-600">Quizzes</p>
                                        <p className="text-lg font-bold text-green-600">{quizzes.length}</p>
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                                        <p className="text-xs text-gray-600">Tasks</p>
                                        <p className="text-lg font-bold text-purple-600">{assignments.length}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    size="lg"
                    variant="underlined"
                    classNames={{
                        base: "w-full",
                        tabList: "gap-2 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider bg-white px-2 sm:px-4 shadow-sm overflow-x-auto flex-nowrap",
                        cursor: "w-full bg-blue-600",
                        tab: "max-w-fit px-2 sm:px-4 h-12 font-semibold whitespace-nowrap",
                        tabContent: "group-data-[selected=true]:text-blue-600 text-xs sm:text-sm"
                    }}
                >
                    {/* Overview Tab */}
                    <Tab
                        key="overview"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaChartLine className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Overview</span>
                            </div>
                        }
                    >
                        {renderOverviewTab()}
                    </Tab>

                    {/* Lessons Tab */}
                    <Tab
                        key="lessons"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaBook className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Lessons</span>
                            </div>
                        }
                    >
                        {renderLessonsTab()}
                    </Tab>

                    {/* Quizzes Tab */}
                    <Tab
                        key="quizzes"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaClipboardList className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Quizzes</span>
                            </div>
                        }
                    >
                        {renderQuizzesTab()}
                    </Tab>

                    {/* Assignments Tab */}
                    <Tab
                        key="assignments"
                        title={
                            <div className="flex items-center gap-1 sm:gap-2">
                                <FaTasks className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Assignments</span>
                            </div>
                        }
                    >
                        {renderAssignmentsTab()}
                    </Tab>
                </Tabs>

                {/* Course Completion Banner */}
                {isCompleted && !certificate && (
                    <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
                        <CardBody className="p-8 text-center">
                            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                                <FaAward className="text-5xl text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-green-800 mb-2">
                                🎉 Course Completed!
                            </h2>
                            <p className="text-green-700 mb-6 text-lg">
                                Congratulations! You've successfully completed this course.
                            </p>
                            <Button
                                color="success"
                                size="lg"
                                startContent={generatingCertificate ? <Spinner size="sm" color="white" /> : <FaAward />}
                                className="font-semibold"
                                isDisabled={generatingCertificate}
                                onPress={async () => {
                                    try {
                                        const result = await generateCertificate(courseId).unwrap();
                                        if (result.success) {
                                            toast.success("Certificate generated successfully!");
                                            refetchCertificate();
                                        }
                                    } catch (err: any) {
                                        toast.error(err?.data?.message || "Failed to generate certificate");
                                    }
                                }}
                            >
                                {generatingCertificate ? "Generating..." : "Generate Certificate"}
                            </Button>
                        </CardBody>
                    </Card>
                )}

                {/* Certificate Display */}
                {isCompleted && certificate && (
                    <div className="mt-8">
                        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-lg mb-6">
                            <CardBody className="p-6 text-center">
                                <div className="inline-block p-3 bg-yellow-100 rounded-full mb-3">
                                    <FaAward className="text-4xl text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-yellow-800 mb-2">
                                    Your Certificate is Ready!
                                </h2>
                                <p className="text-yellow-700 text-sm">
                                    Download your certificate and share your achievement
                                </p>
                            </CardBody>
                        </Card>
                        <CertificateComponent certificate={certificate} />
                    </div>
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

    // Render Functions for Each Tab
    function renderOverviewTab() {
        const nextLesson = modules
            .flatMap(m => m.lessons)
            .find(l => !l.isCompleted && !l.isLocked);
        
        const upcomingQuiz = quizzes.find((q: any) =>
            q.status === "published" && !localStorage.getItem(`quiz_attempt_${q._id}`)
        );

        const upcomingAssignment = assignments.find((a: any) =>
            a.status === "published" && new Date(a.dueDate) > new Date()
        );

        return (
            <div className="space-y-6 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                                    <p className="text-3xl font-bold text-blue-600">{totalLessons}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FaBook className="text-2xl text-blue-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {completedLessons} completed
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Quizzes</p>
                                    <p className="text-3xl font-bold text-green-600">{quizzes.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FaClipboardList className="text-2xl text-green-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {quizzes.filter((q: any) => localStorage.getItem(`quiz_attempt_${q._id}`)).length} completed
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Assignments</p>
                                    <p className="text-3xl font-bold text-purple-600">{assignments.length}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FaTasks className="text-2xl text-purple-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                View all tasks
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardBody className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Progress</p>
                                    <p className="text-3xl font-bold text-orange-600">{progressPercentage}%</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <FaChartLine className="text-2xl text-orange-600" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Keep going!
                            </p>
                        </CardBody>
                    </Card>
                </div>

                {/* Continue Learning Section */}
                <Card className="shadow-lg border-2 border-blue-100">
                    <CardBody className="p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <FaPlay className="text-blue-600" />
                            Continue Learning
                        </h2>

                        {nextLesson ? (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <Chip size="sm" color="primary" variant="flat" className="mb-3">
                                            Up Next
                                        </Chip>
                                        <h3 className="text-xl font-bold mb-2">{nextLesson.title}</h3>
                                        {nextLesson.description && (
                                            <p className="text-gray-600 mb-4">{nextLesson.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            {getLessonIcon(nextLesson.type)}
                                            <span className="capitalize">{nextLesson.type}</span>
                                            {nextLesson.duration && (
                                                <>
                                                    <span>•</span>
                                                    <span>{nextLesson.duration} min</span>
                                                </>
                                            )}
                                        </div>
                                        <Button
                                            color="primary"
                                            size="lg"
                                            startContent={<FaPlay />}
                                            onPress={() => handleLessonClick(nextLesson)}
                                            className="font-semibold"
                                        >
                                            Continue Lesson
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FaCheckCircle className="text-5xl mx-auto mb-3 text-green-500" />
                                <p className="text-lg">All lessons completed! Great job! 🎉</p>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Upcoming Items */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Quiz */}
                    {upcomingQuiz && (
                        <Card className="shadow-md border-2 border-green-100">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FaClipboardList className="text-green-600" />
                                    Upcoming Quiz
                                </h3>
                                <div className="bg-green-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold mb-2">{upcomingQuiz.title}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{upcomingQuiz.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{upcomingQuiz.questions?.length || 0} Questions</span>
                                        <span>•</span>
                                        <span>{upcomingQuiz.timeLimit || 30} minutes</span>
                                    </div>
                                </div>
                                <Button
                                    color="success"
                                    variant="flat"
                                    fullWidth
                                    startContent={<FaPlay />}
                                    onPress={() => router.push(`/quiz/${upcomingQuiz._id}`)}
                                >
                                    Start Quiz
                                </Button>
                            </CardBody>
                        </Card>
                    )}

                    {/* Upcoming Assignment */}
                    {upcomingAssignment && (
                        <Card className="shadow-md border-2 border-purple-100">
                            <CardBody className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FaTasks className="text-purple-600" />
                                    Upcoming Assignment
                                </h3>
                                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                                    <h4 className="font-semibold mb-2">{upcomingAssignment.title}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{upcomingAssignment.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FaCalendar className="text-purple-600" />
                                        <span>
                                            Due: {new Date(upcomingAssignment.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    color="secondary"
                                    variant="flat"
                                    fullWidth
                                    startContent={<FaPlay />}
                                    onPress={() => router.push(`/assignment/${upcomingAssignment._id}`)}
                                >
                                    View Assignment
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        );
    }

    function renderLessonsTab() {
        return (
            <div className="py-6">
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FaBook className="text-blue-600" />
                            Course Curriculum
                        </h2>

                        {modules.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FaBook className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">No modules available yet</p>
                            </div>
                        ) : (
                            <Accordion variant="splitted" selectionMode="multiple" className="px-0">
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
            </div>
        );
    }

    function renderQuizzesTab() {
        return (
            <div className="py-6">
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FaClipboardList className="text-blue-600" />
                            Quizzes & Assessments
                        </h2>
                        
                        {quizzesLoading ? (
                            <div className="text-center py-8">
                                <Spinner size="lg" label="Loading quizzes..." />
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FaClipboardList className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">No quizzes or assessments available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Regular Quizzes */}
                                {quizzes.filter((q: any) => q.assessmentType === "quiz").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaClipboardList className="text-blue-600" />
                                            Regular Quizzes
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "quiz").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                                    <FaClipboardList size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>{quiz.questions?.length || 0} Questions</span>
                                                            {quiz.timeLimit && <span>{quiz.timeLimit} mins</span>}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="primary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={quiz.status !== "published"}
                                                            onPress={() => {
                                                                if (quiz.status === "published") {
                                                                    // Check if already taken
                                                                    const attemptKey = `quiz_attempt_${quiz._id}`;
                                                                    const hasAttempt = localStorage.getItem(attemptKey);
                                                                    if (hasAttempt) {
                                                                        router.push(`/quiz/${quiz._id}`); // Will show results
                                                                    } else {
                                                                        router.push(`/quiz/${quiz._id}`);
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {quiz.status === "published" ? 
                                                                (typeof window !== 'undefined' && localStorage.getItem(`quiz_attempt_${quiz._id}`) ? "View Results" : "Start Quiz") 
                                                                : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mid Exams */}
                                {quizzes.filter((q: any) => q.assessmentType === "mid-exam").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-orange-600" />
                                            Mid-Term Exams
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "mid-exam").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                                                    <FaTasks size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>{quiz.questions?.length || 0} Questions</span>
                                                            {quiz.timeLimit && <span>{quiz.timeLimit} mins</span>}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="warning" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={quiz.status !== "published"}
                                                            onPress={() => quiz.status === "published" && router.push(`/quiz/${quiz._id}`)}
                                                        >
                                                            {quiz.status === "published" ? 
                                                                (typeof window !== 'undefined' && localStorage.getItem(`quiz_attempt_${quiz._id}`) ? "View Results" : "Start Mid-Term") 
                                                                : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Final Exams */}
                                {quizzes.filter((q: any) => q.assessmentType === "final-exam").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaCheckCircle className="text-purple-600" />
                                            Final Exams
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "final-exam").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                                    <FaCheckCircle size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>{quiz.questions?.length || 0} Questions</span>
                                                            {quiz.timeLimit && <span>{quiz.timeLimit} mins</span>}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="secondary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={quiz.status !== "published"}
                                                            onPress={() => quiz.status === "published" && router.push(`/quiz/${quiz._id}`)}
                                                        >
                                                            {quiz.status === "published" ? 
                                                                (typeof window !== 'undefined' && localStorage.getItem(`quiz_attempt_${quiz._id}`) ? "View Results" : "Start Final Exam") 
                                                                : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        );
    }

    function renderAssignmentsTab() {
        return (
            <div className="py-6">
                <Card className="shadow-lg">
                    <CardBody className="p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FaTasks className="text-purple-600" />
                            Assignments & Projects
                        </h2>
                        
                        {assignmentsLoading ? (
                            <div className="text-center py-8">
                                <Spinner size="lg" label="Loading assignments..." />
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FaTasks className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg">No assignments or projects available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Regular Assignments */}
                                {assignments.filter((a: any) => a.assessmentType === "assignment").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-blue-600" />
                                            Regular Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "assignment").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                                    <FaTasks size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>Max Score: {assignment.maxScore || 100}</span>
                                                            {assignment.dueDate && (
                                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="primary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={assignment.status !== "published"}
                                                            onPress={() => assignment.status === "published" && router.push(`/assignment/${assignment._id}`)}
                                                        >
                                                            {assignment.status === "published" ? "Start Assignment" : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mid-Term Assignments */}
                                {assignments.filter((a: any) => a.assessmentType === "mid-term").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-orange-600" />
                                            Mid-Term Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "mid-term").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                                                    <FaTasks size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>Max Score: {assignment.maxScore || 100}</span>
                                                            {assignment.dueDate && (
                                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="warning" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={assignment.status !== "published"}
                                                            onPress={() => assignment.status === "published" && router.push(`/assignment/${assignment._id}`)}
                                                        >
                                                            {assignment.status === "published" ? "Start Mid-Term" : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Final Assignments */}
                                {assignments.filter((a: any) => a.assessmentType === "final").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaCheckCircle className="text-purple-600" />
                                            Final Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "final").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                                    <FaCheckCircle size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>Max Score: {assignment.maxScore || 100}</span>
                                                            {assignment.dueDate && (
                                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="secondary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={assignment.status !== "published"}
                                                            onPress={() => assignment.status === "published" && router.push(`/student/assignment/${assignment._id}`)}
                                                        >
                                                            {assignment.status === "published" ? "Start Final Assignment" : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {assignments.filter((a: any) => a.assessmentType === "project").length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaBook className="text-green-600" />
                                            Projects
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "project").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                                                    <FaBook size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                            <span>Max Score: {assignment.maxScore || 100}</span>
                                                            {assignment.dueDate && (
                                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            color="success" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay />}
                                                            isDisabled={assignment.status !== "published"}
                                                            onPress={() => assignment.status === "published" && router.push(`/assignment/${assignment._id}`)}
                                                        >
                                                            {assignment.status === "published" ? "Start Project" : "Not Available"}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        );
    }
}
