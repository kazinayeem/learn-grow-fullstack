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
    ScrollShadow,
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
    FaExpand,
    FaCompress,
    FaBars,
    FaTimes,
    FaChevronRight,
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

                if (!token || !userStr) {
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
                    setIsAuthorized(true);
                    setAuthChecked(true);
                } catch (parseErr) {
                    toast.error("Session invalid. Please login again.");
                    setIsAuthorized(false);
                    setAuthChecked(true);
                    
                    const timer = setTimeout(() => {
                        router.replace("/login");
                    }, 500);
                    
                    return () => clearTimeout(timer);
                }
            } catch (err) {
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
            setActiveTab("lessons"); // Switch to lessons tab to show preview
        } else {
            toast.info("No content available for this lesson yet");
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderLessonContent = () => {
        if (!currentLesson) {
            return (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg">
                    <div className="text-center p-8">
                        <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-lg text-gray-500 mb-2">Select a lesson to begin</p>
                        <p className="text-sm text-gray-400">Choose from the curriculum on the left</p>
                    </div>
                </div>
            );
        }

        if (currentLesson.type === "video") {
            // Check if YouTube or Google Drive or other video URL
            const isYouTube = currentLesson.contentUrl?.includes("youtube.com") || currentLesson.contentUrl?.includes("youtu.be");
            const isGoogleDrive = currentLesson.contentUrl?.includes("drive.google.com");
            
            if (isYouTube) {
                // Extract YouTube video ID
                let videoId = "";
                const url = currentLesson.contentUrl || "";
                if (url.includes("youtube.com/watch?v=")) {
                    videoId = url.split("v=")[1]?.split("&")[0] || "";
                } else if (url.includes("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
                } else if (url.includes("youtube.com/embed/")) {
                    videoId = url.split("embed/")[1]?.split("?")[0] || "";
                }

                return (
                    <div className="h-full w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                            title={currentLesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            } else if (isGoogleDrive) {
                // Convert Google Drive view link to preview link
                let embedUrl = currentLesson.contentUrl || "";
                if (embedUrl.includes("/file/d/")) {
                    const fileId = embedUrl.split("/file/d/")[1]?.split("/")[0];
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                } else if (embedUrl.includes("open?id=")) {
                    const fileId = embedUrl.split("open?id=")[1]?.split("&")[0];
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                }

                return (
                    <div className="h-full w-full bg-black rounded-lg overflow-hidden">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="autoplay; fullscreen"
                            frameBorder="0"
                        ></iframe>
                    </div>
                );
            } else {
                // Direct video link
                return (
                    <div className="h-full w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
                        <video
                            controls
                            controlsList="nodownload"
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
                } else if (embedUrl.includes("open?id=")) {
                    const fileId = embedUrl.split("open?id=")[1]?.split("&")[0];
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                }

                return (
                    <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="autoplay"
                            frameBorder="0"
                        ></iframe>
                    </div>
                );
            } else if (currentLesson.contentUrl?.endsWith('.pdf')) {
                // Direct PDF link
                return (
                    <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={currentLesson.contentUrl}
                            className="w-full h-full"
                            title={currentLesson.title}
                            frameBorder="0"
                        ></iframe>
                    </div>
                );
            } else {
                return (
                    <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg">
                        <div className="text-center">
                            <FaFileAlt className="text-6xl text-blue-400 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-4">{currentLesson.title}</p>
                            {currentLesson.description && (
                                <p className="text-sm text-gray-600 mb-6 max-w-md">{currentLesson.description}</p>
                            )}
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<FaExternalLinkAlt />}
                                onPress={() => window.open(currentLesson.contentUrl, "_blank")}
                            >
                                Open Document in New Tab
                            </Button>
                        </div>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
            {/* Modern Header with Course Info */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
                <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 md:py-4">
                    {/* Back Button */}
                    <Button
                        variant="light"
                        size="sm"
                        startContent={<FaArrowLeft className="text-sm" />}
                        onPress={() => router.push("/student/my-courses")}
                        className="mb-2 md:mb-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                    >
                        <span className="hidden sm:inline">Back to My Courses</span>
                        <span className="sm:hidden">Back</span>
                    </Button>

                    {/* Course Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 md:gap-5">
                        {/* Left: Course Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                                <Avatar
                                    src={courseData.instructorId?.avatar}
                                    name={courseData.instructorId?.name}
                                    size="lg"
                                    className="flex-shrink-0 ring-2 ring-blue-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                                        {courseData.title}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                                        <FaGraduationCap className="text-blue-600 flex-shrink-0 text-sm" />
                                        <span className="truncate font-medium">{courseData.instructorId?.name || "Unknown"}</span>
                                    </p>
                                    {courseData.description && (
                                        <div 
                                            className="text-xs sm:text-sm text-gray-500 line-clamp-2 prose prose-sm max-w-none hidden md:block"
                                            dangerouslySetInnerHTML={{ __html: courseData.description }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Chip
                                    color={isCompleted ? "success" : "primary"}
                                    variant="flat"
                                    startContent={isCompleted ? <FaCheckCircle className="text-sm" /> : <FaClock className="text-sm" />}
                                    size="sm"
                                    className="font-semibold"
                                >
                                    {isCompleted ? "✓ Completed" : "In Progress"}
                                </Chip>
                                <Divider orientation="vertical" className="h-4 hidden sm:block" />
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                    {completedLessons} / {totalLessons} lessons
                                </span>
                            </div>
                        </div>

                        {/* Right: Progress Card */}
                        <Card className="w-full lg:w-80 shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                            <CardBody className="p-4 md:p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Progress</p>
                                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {progressPercentage}%
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">of course completed</p>
                                    </div>
                                    <CircularProgress
                                        value={progressPercentage}
                                        size="lg"
                                        color={progressPercentage === 100 ? "success" : "primary"}
                                        showValueLabel={false}
                                        strokeWidth={5}
                                        classNames={{
                                            svg: "drop-shadow-md",
                                            track: "stroke-gray-200",
                                        }}
                                    />
                                </div>
                                <Progress
                                    value={progressPercentage}
                                    color={progressPercentage === 100 ? "success" : "primary"}
                                    size="md"
                                    className="mb-4"
                                    classNames={{
                                        indicator: "bg-gradient-to-r from-blue-500 to-indigo-600",
                                    }}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:scale-105 transition-transform cursor-default">
                                        <FaBook className="text-blue-600 mx-auto mb-1 text-sm" />
                                        <p className="text-xs text-gray-600 font-medium">Modules</p>
                                        <p className="text-lg font-bold text-blue-600">{modules.length}</p>
                                    </div>
                                    <div className="text-center p-2.5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:scale-105 transition-transform cursor-default">
                                        <FaClipboardList className="text-green-600 mx-auto mb-1 text-sm" />
                                        <p className="text-xs text-gray-600 font-medium">Quizzes</p>
                                        <p className="text-lg font-bold text-green-600">{quizzes.length}</p>
                                    </div>
                                    <div className="text-center p-2.5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:scale-105 transition-transform cursor-default">
                                        <FaTasks className="text-purple-600 mx-auto mb-1 text-sm" />
                                        <p className="text-xs text-gray-600 font-medium">Tasks</p>
                                        <p className="text-lg font-bold text-purple-600">{assignments.length}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6">
                <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    size="lg"
                    variant="underlined"
                    classNames={{
                        base: "w-full",
                        tabList: "gap-2 sm:gap-3 md:gap-6 w-full relative rounded-none p-0 border-b-2 border-gray-200 bg-white/80 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 shadow-sm overflow-x-auto flex-nowrap scrollbar-hide",
                        cursor: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-0.5",
                        tab: "max-w-fit px-3 sm:px-4 md:px-5 h-11 sm:h-12 md:h-14 font-semibold whitespace-nowrap min-w-fit hover:bg-blue-50/50 data-[selected=true]:text-blue-600 transition-all",
                        tabContent: "group-data-[selected=true]:text-blue-600 group-data-[selected=true]:font-bold text-gray-600 text-xs sm:text-sm md:text-base"
                    }}
                >
                    {/* Overview Tab */}
                    <Tab
                        key="overview"
                        title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <FaChartLine className="text-base sm:text-lg" />
                                <span>Overview</span>
                            </div>
                        }
                    >
                        {renderOverviewTab()}
                    </Tab>

                    {/* Lessons Tab */}
                    <Tab
                        key="lessons"
                        title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <FaBook className="text-base sm:text-lg" />
                                <span>Lessons</span>
                            </div>
                        }
                    >
                        {renderLessonsTab()}
                    </Tab>

                    {/* Quizzes Tab */}
                    <Tab
                        key="quizzes"
                        title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <FaClipboardList className="text-base sm:text-lg" />
                                <span>Quizzes</span>
                            </div>
                        }
                    >
                        {renderQuizzesTab()}
                    </Tab>

                    {/* Assignments Tab */}
                    <Tab
                        key="assignments"
                        title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <FaTasks className="text-base sm:text-lg" />
                                <span>Assignments</span>
                            </div>
                        }
                    >
                        {renderAssignmentsTab()}
                    </Tab>
                </Tabs>

                {/* Course Completion Banner */}
                {isCompleted && !certificate && (
                    <Card className="mt-6 md:mt-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-green-300 shadow-2xl overflow-hidden relative">
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(5,150,105,0.1),transparent_50%)]" />
                        
                        <CardBody className="p-6 md:p-10 text-center relative z-10">
                            <div className="inline-flex p-4 md:p-5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4 md:mb-5 shadow-lg ring-4 ring-green-200/50">
                                <FaAward className="text-4xl md:text-6xl text-green-600" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 mb-3">
                                🎉 Congratulations!
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-green-800 font-semibold mb-2">
                                You've Successfully Completed This Course
                            </p>
                            <p className="text-sm text-green-700/80 mb-6 md:mb-8 max-w-md mx-auto">
                                Celebrate your achievement by generating your certificate
                            </p>
                            <Button
                                color="success"
                                size="lg"
                                startContent={generatingCertificate ? <Spinner size="sm" color="white" /> : <FaAward className="text-lg" />}
                                className="font-bold text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-105"
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
                                {generatingCertificate ? "Generating Your Certificate..." : "Generate My Certificate"}
                            </Button>
                        </CardBody>
                    </Card>
                )}

                {/* Certificate Display */}
                {isCompleted && certificate && (
                    <div className="mt-6 md:mt-8">
                        <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-xl mb-6 overflow-hidden relative">
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.15),transparent_50%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(245,158,11,0.15),transparent_50%)]" />
                            
                            <CardBody className="p-5 md:p-7 text-center relative z-10">
                                <div className="inline-flex p-3 md:p-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mb-3 md:mb-4 shadow-md ring-4 ring-amber-200/50">
                                    <FaAward className="text-3xl md:text-5xl text-amber-600" />
                                </div>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-orange-600 mb-2">
                                    🏆 Your Certificate is Ready!
                                </h2>
                                <p className="text-sm md:text-base text-amber-800 font-semibold mb-1">
                                    Download and share your achievement
                                </p>
                                <p className="text-xs md:text-sm text-amber-700/70 max-w-lg mx-auto">
                                    Show the world what you've learned and accomplished
                                </p>
                            </CardBody>
                        </Card>
                        <div className="px-2 sm:px-0 w-full">
                            <CertificateComponent certificate={certificate} />
                        </div>
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
            <div className="space-y-5 md:space-y-6 py-4 md:py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50/30">
                        <CardBody className="p-3 md:p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Total Lessons</p>
                                        <p className="text-2xl md:text-3xl font-black text-blue-600">{totalLessons}</p>
                                    </div>
                                    <div className="p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                                        <FaBook className="text-lg md:text-2xl text-blue-600" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-blue-100">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaCheckCircle className="text-blue-500 text-xs" />
                                        <span>{completedLessons} completed</span>
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-br from-white to-green-50/30">
                        <CardBody className="p-3 md:p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Quizzes</p>
                                        <p className="text-2xl md:text-3xl font-black text-green-600">{quizzes.length}</p>
                                    </div>
                                    <div className="p-2 md:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-sm">
                                        <FaClipboardList className="text-lg md:text-2xl text-green-600" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-green-100">
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaCheckCircle className="text-green-500 text-xs" />
                                        <span>{quizzes.filter((q: any) => localStorage.getItem(`quiz_attempt_${q._id}`)).length} completed</span>
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-purple-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50/30">
                        <CardBody className="p-3 md:p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Assignments</p>
                                        <p className="text-2xl md:text-3xl font-black text-purple-600">{assignments.length}</p>
                                    </div>
                                    <div className="p-2 md:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-sm">
                                        <FaTasks className="text-lg md:text-2xl text-purple-600" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-purple-100">
                                    <p className="text-xs text-gray-500">View all tasks</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50/30">
                        <CardBody className="p-3 md:p-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Progress</p>
                                        <p className="text-2xl md:text-3xl font-black text-orange-600">{progressPercentage}%</p>
                                    </div>
                                    <div className="p-2 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-sm">
                                        <FaChartLine className="text-lg md:text-2xl text-orange-600" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-orange-100">
                                    <p className="text-xs text-gray-500 font-medium">Keep going!</p>
                                </div>
                            </div>
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
            <div className="py-4 sm:py-6">
                {/* Mobile: Toggle Sidebar Button */}
                <div className="lg:hidden mb-4">
                    <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={isSidebarOpen ? <FaTimes /> : <FaBars />}
                        onPress={toggleSidebar}
                        className="w-full"
                    >
                        {isSidebarOpen ? "Hide" : "Show"} Curriculum
                    </Button>
                </div>

                {/* Sidebar + Preview Layout */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[600px] md:min-h-[700px]">
                    {/* Sidebar: Course Curriculum */}
                    <div className={`
                        ${isSidebarOpen ? 'block' : 'hidden lg:block'}
                        w-full lg:w-1/3 xl:w-1/4
                    `}>
                        <Card className="shadow-lg h-full">
                            <CardBody className="p-3 md:p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                                        <FaBook className="text-blue-600" />
                                        <span className="hidden sm:inline">Curriculum</span>
                                    </h2>
                                    <Chip size="sm" variant="flat">
                                        {completedLessons}/{totalLessons}
                                    </Chip>
                                </div>

                                {modules.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">No modules yet</p>
                                    </div>
                                ) : (
                                    <ScrollShadow className="h-[calc(100vh-400px)] md:h-[calc(100vh-350px)]">
                                        <Accordion 
                                            variant="splitted" 
                                            selectionMode="multiple"
                                            defaultExpandedKeys={modules.length > 0 ? [modules[0].id] : []}
                                            className="px-0"
                                        >
                                            {modules.map((module, moduleIndex) => (
                                                <AccordionItem
                                                    key={module.id}
                                                    aria-label={module.title}
                                                    title={
                                                        <div className="flex items-start justify-between w-full gap-2">
                                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                                    module.isCompleted ? "bg-green-100 text-green-600" :
                                                                    module.isLocked ? "bg-gray-100 text-gray-400" :
                                                                    "bg-blue-100 text-blue-600"
                                                                }`}>
                                                                    {moduleIndex + 1}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-sm line-clamp-2">{module.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        {module.lessons.filter(l => l.isCompleted).length}/{module.lessons.length} lessons
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {module.isCompleted && (
                                                                <FaCheckCircle className="text-green-600 text-sm flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    }
                                                    className={module.isLocked ? "opacity-60" : ""}
                                                >
                                                    <div className="space-y-1 py-2">
                                                        {module.isLocked ? (
                                                            <div className="text-center py-6 text-gray-500">
                                                                <FaLock className="text-3xl mx-auto mb-2 text-gray-300" />
                                                                <p className="text-xs">{module.lockReason || "Locked"}</p>
                                                            </div>
                                                        ) : (
                                                            module.lessons.map((lesson) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    className={`
                                                                        flex items-center gap-2 p-2 rounded-lg border transition-all
                                                                        ${lesson.isLocked 
                                                                            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60" 
                                                                            : lesson.isCompleted
                                                                            ? "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer"
                                                                            : currentLesson?.id === lesson.id
                                                                            ? "bg-blue-100 border-blue-400 shadow-sm"
                                                                            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                                                                        }
                                                                    `}
                                                                    onClick={() => handleLessonClick(lesson)}
                                                                >
                                                                    <div className={`p-1.5 rounded ${
                                                                        lesson.isCompleted ? "bg-green-200 text-green-700" :
                                                                        lesson.isLocked ? "bg-gray-200 text-gray-500" :
                                                                        "bg-blue-100 text-blue-600"
                                                                    }`}>
                                                                        {lesson.isLocked ? <FaLock size={12} /> : getLessonIcon(lesson.type)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium line-clamp-1">{lesson.title}</p>
                                                                        {lesson.duration && (
                                                                            <p className="text-xs text-gray-400">{lesson.duration} min</p>
                                                                        )}
                                                                    </div>
                                                                    {lesson.isCompleted && (
                                                                        <FaCheckCircle className="text-green-600 text-xs flex-shrink-0" />
                                                                    )}
                                                                    {!lesson.isLocked && !lesson.isCompleted && currentLesson?.id !== lesson.id && (
                                                                        <FaChevronRight className="text-gray-400 text-xs flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </ScrollShadow>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 min-w-0">
                        <Card className="shadow-lg h-full">
                            <CardBody className="p-0 h-full flex flex-col">
                                {/* Preview Header */}
                                {currentLesson && (
                                    <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-lg font-bold mb-1 line-clamp-1">
                                                    {currentLesson.title}
                                                </h3>
                                                {currentLesson.description && (
                                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                                        {currentLesson.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <Chip size="sm" variant="flat" className="capitalize">
                                                        {currentLesson.type}
                                                    </Chip>
                                                    {currentLesson.duration && (
                                                        <Chip size="sm" variant="flat" startContent={<FaClock />}>
                                                            {currentLesson.duration} min
                                                        </Chip>
                                                    )}
                                                    {currentLesson.isCompleted && (
                                                        <Chip size="sm" color="success" variant="flat" startContent={<FaCheckCircle />}>
                                                            Completed
                                                        </Chip>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {!currentLesson.isCompleted && (
                                                    <Button
                                                        size="sm"
                                                        color="success"
                                                        variant="flat"
                                                        isIconOnly
                                                        className="hidden md:flex"
                                                        onPress={async () => {
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
                                                                    refetch();
                                                                } else {
                                                                    const error = await response.json();
                                                                    toast.error(error.message || "Failed to mark lesson as complete");
                                                                }
                                                            } catch (error) {
                                                                console.error("Error marking lesson complete:", error);
                                                                toast.error("Failed to mark lesson as complete");
                                                            }
                                                        }}
                                                    >
                                                        <FaCheckCircle />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    color="default"
                                                    variant="flat"
                                                    isIconOnly
                                                    onPress={toggleFullscreen}
                                                >
                                                    <FaExpand />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Mobile Mark Complete Button */}
                                        {!currentLesson.isCompleted && (
                                            <Button
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                                fullWidth
                                                className="mt-3 md:hidden"
                                                startContent={<FaCheckCircle />}
                                                onPress={async () => {
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
                                                            refetch();
                                                        } else {
                                                            const error = await response.json();
                                                            toast.error(error.message || "Failed to mark lesson as complete");
                                                        }
                                                    } catch (error) {
                                                        console.error("Error marking lesson complete:", error);
                                                        toast.error("Failed to mark lesson as complete");
                                                    }
                                                }}
                                            >
                                                Mark as Complete
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Preview Content */}
                                <div className="flex-1 p-3 md:p-4 overflow-hidden">
                                    <div className="h-full rounded-lg overflow-hidden">
                                        {renderLessonContent()}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    function renderQuizzesTab() {
        return (
            <div className="py-4 sm:py-6">
                <Card className="shadow-lg w-full overflow-hidden">
                    <CardBody className="p-3 sm:p-4 md:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                            <FaClipboardList className="text-blue-600 text-lg sm:text-xl" />
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaClipboardList className="text-blue-600 text-sm sm:text-base" />
                                            Regular Quizzes
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "quiz").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="w-full shadow-xl border border-blue-200/70 bg-gradient-to-br from-white to-blue-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0 shadow-inner">
                                                                    <FaClipboardList className="text-sm sm:text-lg" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaClipboardList className="text-blue-600" />
                                                                <span className="font-medium">{quiz.questions?.length || 0} Questions</span>
                                                            </div>
                                                            {quiz.timeLimit && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaClock className="text-blue-600" />
                                                                    <span className="font-medium">{quiz.timeLimit} mins</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="primary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-orange-600 text-sm sm:text-base" />
                                            Mid-Term Exams
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "mid-exam").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="w-full shadow-xl border border-orange-200/70 bg-gradient-to-br from-white to-orange-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-100 text-orange-700 flex-shrink-0 shadow-inner">
                                                                    <FaTasks size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaTasks className="text-orange-600" />
                                                                <span className="font-medium">{quiz.questions?.length || 0} Questions</span>
                                                            </div>
                                                            {quiz.timeLimit && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaClock className="text-orange-600" />
                                                                    <span className="font-medium">{quiz.timeLimit} mins</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="warning" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaCheckCircle className="text-purple-600 text-sm sm:text-base" />
                                            Final Exams
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {quizzes.filter((q: any) => q.assessmentType === "final-exam").map((quiz: any) => (
                                                <Card 
                                                    key={quiz._id}
                                                    className="w-full shadow-xl border border-purple-200/70 bg-gradient-to-br from-white to-purple-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-100 text-purple-700 flex-shrink-0 shadow-inner">
                                                                    <FaCheckCircle size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{quiz.title}</h4>
                                                                </div>
                                                            </div>
                                                            {quiz.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {quiz.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{quiz.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaCheckCircle className="text-purple-600" />
                                                                <span className="font-medium">{quiz.questions?.length || 0} Questions</span>
                                                            </div>
                                                            {quiz.timeLimit && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaClock className="text-purple-600" />
                                                                    <span className="font-medium">{quiz.timeLimit} mins</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="secondary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
            <div className="py-4 sm:py-6">
                <Card className="shadow-lg w-full overflow-hidden">
                    <CardBody className="p-3 sm:p-4 md:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                            <FaTasks className="text-purple-600 text-lg sm:text-xl" />
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-blue-600 text-sm sm:text-base" />
                                            Regular Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "assignment").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="w-full shadow-xl border border-blue-200/70 bg-gradient-to-br from-white to-blue-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0 shadow-inner">
                                                                    <FaTasks size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaTasks className="text-blue-600" />
                                                                <span className="font-medium">Max Score: {assignment.maxScore || 100}</span>
                                                            </div>
                                                            {assignment.dueDate && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaCalendar className="text-blue-600" />
                                                                    <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="primary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaTasks className="text-orange-600 text-sm sm:text-base" />
                                            Mid-Term Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "mid-term").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="w-full shadow-xl border border-orange-200/70 bg-gradient-to-br from-white to-orange-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-orange-100 text-orange-700 flex-shrink-0 shadow-inner">
                                                                    <FaTasks size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaTasks className="text-orange-600" />
                                                                <span className="font-medium">Max Score: {assignment.maxScore || 100}</span>
                                                            </div>
                                                            {assignment.dueDate && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaCalendar className="text-orange-600" />
                                                                    <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="warning" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaCheckCircle className="text-purple-600 text-sm sm:text-base" />
                                            Final Assignments
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "final").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="w-full shadow-xl border border-purple-200/70 bg-gradient-to-br from-white to-purple-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-100 text-purple-700 flex-shrink-0 shadow-inner">
                                                                    <FaCheckCircle size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaCheckCircle className="text-purple-600" />
                                                                <span className="font-medium">Max Score: {assignment.maxScore || 100}</span>
                                                            </div>
                                                            {assignment.dueDate && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaCalendar className="text-purple-600" />
                                                                    <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="secondary" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
                                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FaBook className="text-green-600 text-sm sm:text-base" />
                                            Projects
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            {assignments.filter((a: any) => a.assessmentType === "project").map((assignment: any) => (
                                                <Card 
                                                    key={assignment._id}
                                                    className="w-full shadow-xl border border-green-200/70 bg-gradient-to-br from-white to-green-50/40 hover:shadow-2xl transition-all hover:-translate-y-0.5"
                                                >
                                                    <CardBody className="p-3 sm:p-5 space-y-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <div className="p-2 sm:p-2.5 rounded-xl bg-green-100 text-green-700 flex-shrink-0 shadow-inner">
                                                                    <FaBook size={16} className="sm:w-5 sm:h-5" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900">{assignment.title}</h4>
                                                                </div>
                                                            </div>
                                                            {assignment.status === "published" ? (
                                                                <Chip size="sm" color="success" variant="flat" className="font-semibold">Published</Chip>
                                                            ) : (
                                                                <Chip size="sm" color="warning" variant="flat" className="font-semibold">Draft</Chip>
                                                            )}
                                                        </div>
                                                        {assignment.description && (
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 line-clamp-2">{assignment.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-600 mb-2">
                                                            <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                <FaBook className="text-green-600" />
                                                                <span className="font-medium">Max Score: {assignment.maxScore || 100}</span>
                                                            </div>
                                                            {assignment.dueDate && (
                                                                <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-lg">
                                                                    <FaCalendar className="text-green-600" />
                                                                    <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button 
                                                            size="md" 
                                                            color="success" 
                                                            variant="flat"
                                                            fullWidth
                                                            startContent={<FaPlay className="text-sm" />}
                                                            className="font-semibold h-11"
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
