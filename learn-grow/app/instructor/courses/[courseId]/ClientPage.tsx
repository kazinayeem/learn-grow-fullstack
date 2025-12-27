"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Tabs,
    Tab,
    Chip,
    Progress,
    Input,
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Accordion,
    AccordionItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaEdit,
    FaUsers,
    FaBookOpen,
    FaChartLine,
    FaClipboardList,
    FaPlus,
    FaGraduationCap,
    FaEye,
    FaTrash,
    FaVideo,
    FaFileAlt,
    FaEllipsisV,
    FaCheckCircle,
    FaCloudUploadAlt,
    FaLink,
} from "react-icons/fa";
import {
    useGetCourseByIdQuery,
    useCreateModuleMutation,
    useUpdateModuleMutation,
    useDeleteModuleMutation,
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
    usePublishCourseMutation,
    useUnpublishCourseMutation,
    useGetAssessmentsByCourseQuery,
} from "@/redux/api/courseApi";
import { toast } from "react-toastify";

interface Lesson {
    id: string;
    title: string;
    type: "video" | "article" | "quiz";
    description?: string;
    contentUrl?: string;
    isFreePreview?: boolean;
    isPublished?: boolean;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    resources?: string;
    isPublished?: boolean;
}

export default function InstructorCourseDashboardClient({ params }: { params: { courseId: string } }) {
    const router = useRouter();
    const { courseId } = params;
    const [activeTab, setActiveTab] = useState("overview");
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const isAdmin = userRole === "admin";
    const isInstructor = userRole === "instructor";

    // Decode JWT (base64 URL) to extract user id/role as source of truth
    const decodeJwt = (token?: string) => {
        if (!token) return null;
        const parts = token.split(".");
        if (parts.length < 2) return null;
        try {
            const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const decoded = JSON.parse(atob(payload));
            return decoded;
        } catch (e) {
            return null;
        }
    };

    // Basic auth/role guard (instructor-only, must own course). Uses decoded token when available.
    useEffect(() => {
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("accessToken") : null;
            const decoded = decodeJwt(token || undefined);
            const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
            const userFromStorage = userStr ? JSON.parse(userStr) : null;

            const effectiveRole = decoded?.role || userFromStorage?.role;
            const effectiveId = decoded?.userId || decoded?._id || userFromStorage?._id || userFromStorage?.id;

            if (!effectiveRole || !["instructor", "admin"].includes(effectiveRole)) {
                setIsAuthorized(false);
                router.replace("/login");
                return;
            }
            // Store effective user info for later ownership check
            (window as any).__lg_user__ = { id: effectiveId, role: effectiveRole };
            setUserRole(effectiveRole);
        } catch (err) {
            setIsAuthorized(false);
            router.replace("/login");
            return;
        }
        setAuthChecked(true);
    }, [router]);

    // Fetch course data from backend
    const { data: courseResponse, isLoading: courseLoading, error: courseError } = useGetCourseByIdQuery(courseId);
    const courseData = courseResponse?.data || null;

    // Mutations
    const [createModule, { isLoading: moduleCreating }] = useCreateModuleMutation();
    const [updateModule, { isLoading: moduleUpdating }] = useUpdateModuleMutation();
    const [deleteModule, { isLoading: moduleDeleting }] = useDeleteModuleMutation();
    const [createLesson, { isLoading: lessonCreating }] = useCreateLessonMutation();
    const [updateLesson, { isLoading: lessonUpdating }] = useUpdateLessonMutation();
    const [deleteLesson, { isLoading: lessonDeleting }] = useDeleteLessonMutation();
    const [publishCourse, { isLoading: publishingCourse }] = usePublishCourseMutation();
    const [unpublishCourse, { isLoading: unpublishingCourse }] = useUnpublishCourseMutation();

    // Local state for modules and lessons
    const [modules, setModules] = useState<Module[]>([]);

    // Load modules when course data is available
    useEffect(() => {
        if (courseData?.modules) {
            setModules(courseData.modules);
        }
    }, [courseData]);

    // Module management
    const { isOpen: isModuleModalOpen, onOpen: onOpenModuleModal, onClose: onCloseModuleModal } = useDisclosure();
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [newModuleDescription, setNewModuleDescription] = useState("");
    const [newModuleResource, setNewModuleResource] = useState("");
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [moduleErrors, setModuleErrors] = useState<Record<string, string>>({});

    // Lesson management
    const { isOpen: isLessonModalOpen, onOpen: onOpenLessonModal, onClose: onCloseLessonModal } = useDisclosure();
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
    const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ type: "video" });
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

    // Assessments (from backend)
    const { data: assessmentsResp } = useGetAssessmentsByCourseQuery(courseId, { skip: !courseId });
    const assessments: any[] = assessmentsResp?.data || [];

    const getStatusColor = (status: string) => status === "published" || status === "active" ? "success" : "warning";

    // Gracefully format dates from API or fallback fields
    const formatDate = (value?: string) => {
        if (!value) return "Not set";
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? "Not set" : parsed.toLocaleDateString();
    };

    const handleToggleCoursePublish = async () => {
        try {
            if (courseData?.isPublished) {
                await unpublishCourse(courseId).unwrap();
                toast.success("Course unpublished successfully");
            } else {
                await publishCourse(courseId).unwrap();
                toast.success("Course published successfully");
            }
        } catch (err: any) {
            const errorMsg = err?.data?.message || err?.message || "Failed to update publish status";
            toast.error(errorMsg);
        }
    };

    // --- Curriculum Handlers ---

    const handleSaveModule = async () => {
        setModuleErrors({});
        if (!newModuleTitle.trim()) {
            setModuleErrors({ title: "Module title is required" });
            return;
        }

        try {
            if (editingModuleId) {
                await updateModule({
                    id: editingModuleId,
                    title: newModuleTitle,
                    description: newModuleDescription,
                    resources: newModuleResource,
                }).unwrap();
                toast.success("Module updated successfully!");
            } else {
                await createModule({
                    courseId,
                    title: newModuleTitle,
                    description: newModuleDescription,
                    resources: newModuleResource,
                    orderIndex: modules.length, // Set order index based on current module count
                }).unwrap();
                toast.success("Module created successfully!");
            }
            setNewModuleTitle("");
            setNewModuleDescription("");
            setNewModuleResource("");
            setEditingModuleId(null);
            onCloseModuleModal();
        } catch (err: any) {
            const errorMsg = err?.data?.message || "Failed to save module";
            toast.error(errorMsg);
            setModuleErrors({ general: errorMsg });
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (confirm("Are you sure you want to delete this module and all its lessons?")) {
            try {
                await deleteModule(moduleId).unwrap();
                toast.success("Module deleted successfully!");
            } catch (err: any) {
                const errorMsg = err?.data?.message || "Failed to delete module";
                toast.error(errorMsg);
            }
        }
    };

    const handleSaveLesson = async () => {
        setLessonErrors({});
        if (!newLesson.title || !currentModuleId) {
            setLessonErrors({ title: "Lesson title is required" });
            return;
        }

        try {
            if (editingLessonId) {
                await updateLesson({
                    id: editingLessonId,
                    title: newLesson.title,
                    type: newLesson.type,
                    description: newLesson.description,
                    contentUrl: newLesson.contentUrl,
                    isFreePreview: newLesson.isFreePreview,
                }).unwrap();
                toast.success("Lesson updated successfully!");
            } else {
                // Find the current module to get lesson count for orderIndex
                const currentModule = modules.find(m => m.id === currentModuleId);
                const lessonCount = currentModule?.lessons?.length || 0;
                
                await createLesson({
                    moduleId: currentModuleId,
                    title: newLesson.title,
                    type: newLesson.type,
                    description: newLesson.description,
                    contentUrl: newLesson.contentUrl,
                    isFreePreview: newLesson.isFreePreview,
                    orderIndex: lessonCount, // Set order index based on current lesson count
                }).unwrap();
                toast.success("Lesson created successfully!");
            }
            setNewLesson({ type: "video" });
            setEditingLessonId(null);
            onCloseLessonModal();
        } catch (err: any) {
            const errorMsg = err?.data?.message || "Failed to save lesson";
            toast.error(errorMsg);
            setLessonErrors({ general: errorMsg });
        }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if (confirm("Delete this lesson?")) {
            try {
                await deleteLesson(lessonId).unwrap();
                toast.success("Lesson deleted successfully!");
            } catch (err: any) {
                const errorMsg = err?.data?.message || "Failed to delete lesson";
                toast.error(errorMsg);
            }
        }
    };

    // Ownership guard after data loads
    useEffect(() => {
        if (!authChecked || !courseData) return;
        const userInfo = (typeof window !== "undefined" && (window as any).__lg_user__)
            || (() => {
                const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
                const decoded = decodeJwt(token || undefined);
                if (decoded) return { id: decoded.userId || decoded._id, role: decoded.role };
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const u = JSON.parse(userStr);
                    return { id: u._id || u.id, role: u.role };
                }
                return null;
            })();
        if (!userInfo) return;

        const instructorId = typeof courseData.instructorId === "object"
            ? (courseData.instructorId as any)?._id || (courseData.instructorId as any)?.id
            : courseData.instructorId;

        if (!["instructor", "admin"].includes(userInfo.role)) {
            setIsAuthorized(false);
            toast.error("Only instructors or admins can access this page");
            router.replace("/login");
            return;
        }

        if (userInfo.role === "instructor" && instructorId && userInfo.id && userInfo.id !== instructorId) {
            setIsAuthorized(false);
            toast.error("You cannot access this course");
            router.replace("/instructor/courses");
        }
    }, [authChecked, courseData, router]);

    if (!authChecked) {
        return null;
    }

    if (courseLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button
                    variant="light"
                    startContent={<FaArrowLeft />}
                    onPress={() => router.push("/instructor/courses")}
                    className="mb-6"
                >
                    Back to Courses
                </Button>
                <Card className="mb-8">
                    <CardBody className="p-8 text-center">
                        <p className="text-lg text-gray-500">Loading course details...</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Show error/unauthorized state
    if (!isAuthorized || courseError || !courseData) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Button
                    variant="light"
                    startContent={<FaArrowLeft />}
                    onPress={() => router.push("/instructor/courses")}
                    className="mb-6"
                >
                    Back to Courses
                </Button>
                <Card className="mb-8 border-2 border-red-500">
                    <CardBody className="p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-600 mb-2">Course Not Found</h2>
                            <p className="text-gray-600 mb-4">
                                We couldn't find the course you're looking for. The course may have been deleted or you don't have permission to access it.
                            </p>
                            {courseError && (
                                <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded">
                                    Error: {(courseError as any)?.data?.message || (courseError as any)?.message || "Unknown error"}
                                </p>
                            )}
                            <Button color="primary" onPress={() => router.push("/instructor/courses")}>
                                Back to My Courses
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Top Navigation */}
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push("/instructor/courses")}
                className="mb-6"
            >
                Back to Courses
            </Button>
            <Button
                variant="flat"
                onPress={() => router.push("/instructor")}
                className="mb-6 ml-2"
            >
                Back to Dashboard
            </Button>

            {/* Course Header */}
            <Card className="mb-8 border-none shadow-md bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <CardBody className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Chip
                                    color={courseData?.isPublished ? "success" : "warning"}
                                    variant="solid"
                                    className="border border-white/30"
                                >
                                    {courseData?.isPublished ? "PUBLISHED" : "DRAFT"}
                                </Chip>
                                <Chip
                                    color={courseData?.isAdminApproved ? "success" : "warning"}
                                    variant="solid"
                                    className="border border-white/30"
                                >
                                    {courseData?.isAdminApproved ? "ADMIN APPROVED" : "PENDING APPROVAL"}
                                </Chip>
                                <span className="text-blue-100 flex items-center gap-1">
                                    <FaUsers /> {courseData?.enrolled || 0} Enrolled
                                </span>
                                <span className="text-blue-100 flex items-center gap-1">
                                    ⭐ {courseData?.rating || 4.5}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{courseData?.title || "Loading..."}</h1>
                            <p className="text-blue-100 max-w-2xl">{courseData?.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button
                                startContent={<FaCheckCircle />}
                                color={courseData?.isPublished ? "warning" : "success"}
                                className="text-white font-semibold"
                                variant="solid"
                                isLoading={publishingCourse || unpublishingCourse}
                                onPress={handleToggleCoursePublish}
                            >
                                {courseData?.isPublished ? "Unpublish Course" : "Publish Course"}
                            </Button>
                            <Button
                                startContent={<FaEdit />}
                                className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                                onPress={() => {
                                    if (isAdmin) {
                                        router.push(`/admin/courses/edit?id=${courseId}`);
                                    } else {
                                        router.push(`/instructor/courses/edit?id=${courseId}`);
                                    }
                                }}
                            >
                                Edit Details
                            </Button>
                            <Button
                                startContent={<FaEye />}
                                className="bg-white text-blue-900 font-semibold"
                                onPress={() => router.push(`/courses/${courseId}`)}
                            >
                                Preview
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Admin Approval Notice */}
            {!courseData?.isAdminApproved && (
                <Card className="mb-6 border-2 border-warning">
                    <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="text-warning text-2xl">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2 text-warning">Pending Admin Approval</h3>
                                <p className="text-gray-600 mb-2">
                                    Your course is currently under review by our admin team. Once approved, it will be visible to students on the platform.
                                </p>
                                <p className="text-sm text-gray-500">
                                    💡 <strong>Tip:</strong> You can continue to add modules, lessons, and prepare your content while waiting for approval. You'll receive an email notification once your course is approved.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs
                aria-label="Course Options"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-primary font-semibold text-lg"
                }}
            >
                {/* Overview Tab */}
                <Tab
                    key="overview"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaChartLine />
                            <span>Overview</span>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Student Engagement</h3>
                                <div className="text-4xl font-bold mb-4">{courseData?.engagementRate || 87}%</div>
                                <Progress value={courseData?.engagementRate || 87} color="success" className="h-2" />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Completion Rate</h3>
                                <div className="text-4xl font-bold mb-4">{courseData?.completionRate || 12}%</div>
                                <Progress value={courseData?.completionRate || 12} color="warning" className="h-2" />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-gray-500 font-medium mb-2">Total Revenue</h3>
                                <div className="text-4xl font-bold text-green-600">৳ {courseData?.revenue || 0}</div>
                                <p className="text-xs text-gray-400 mt-1">+15% from last month</p>
                            </CardBody>
                        </Card>
                    </div>
                </Tab>

                {/* Curriculum Tab (Complete implementation) */}
                <Tab
                    key="curriculum"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaBookOpen />
                            <span>Curriculum</span>
                        </div>
                    }
                >
                    <div className="mt-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Course Curriculum</h2>
                                <p className="text-gray-600">Organize your course into modules and lessons.</p>
                            </div>
                            <Button
                                color="primary"
                                startContent={<FaPlus />}
                                onPress={() => {
                                    setNewModuleTitle("");
                                    setNewModuleDescription("");
                                    setNewModuleResource("");
                                    setEditingModuleId(null);
                                    onOpenModuleModal();
                                }}
                            >
                                Add Module
                            </Button>
                        </div>

                        {modules.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-300">
                                <CardBody className="p-12 text-center text-gray-500">
                                    <FaBookOpen className="text-4xl mx-auto mb-3 text-gray-300" />
                                    <p className="mb-4">No curriculum content yet. Start by adding a module!</p>
                                    <Button color="primary" variant="flat" onPress={onOpenModuleModal}>Create Module</Button>
                                </CardBody>
                            </Card>
                        ) : (
                            <Accordion variant="splitted" defaultExpandedKeys={["1"]}>
                                {modules.map((module) => (
                                    <AccordionItem
                                        key={module.id}
                                        aria-label={module.title}
                                        title={
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex flex-col flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-lg">{module.title}</span>
                                                        <Chip 
                                                            size="sm" 
                                                            color={module.isPublished ? "success" : "warning"}
                                                            variant="flat"
                                                        >
                                                            {module.isPublished ? "Published" : "Draft"}
                                                        </Chip>
                                                    </div>
                                                    {module.resources && (
                                                        <div className="flex items-center gap-1 text-xs text-primary mt-1">
                                                            <FaLink />
                                                            <span>Resources attached</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-500 mr-2">{module.lessons?.length || 0} lessons</span>
                                            </div>
                                        }
                                        subtitle={
                                            <div className="flex items-center gap-2 mt-1">
                                                {module.description && <span className="text-xs text-gray-400 max-w-sm truncate">{module.description}</span>}
                                            </div>
                                        }
                                        classNames={{
                                            title: "flex-1",
                                        }}
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            {/* Module Actions */}
                                            <div className="flex justify-end gap-2 mb-2 pb-2 border-b">
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    color={module.isPublished ? "warning" : "success"}
                                                    onPress={() => {
                                                        // Toggle publish status
                                                        updateModule({
                                                            id: module.id,
                                                            isPublished: !module.isPublished,
                                                        });
                                                    }}
                                                >
                                                    {module.isPublished ? "Unpublish" : "Publish"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    startContent={<FaEdit />}
                                                    onPress={() => {
                                                        setEditingModuleId(module.id);
                                                        setNewModuleTitle(module.title);
                                                        setNewModuleDescription(module.description || "");
                                                        setNewModuleResource(module.resources || "");
                                                        onOpenModuleModal();
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    color="danger"
                                                    startContent={<FaTrash />}
                                                    onPress={() => handleDeleteModule(module.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>

                                            {/* Lessons */}
                                            {module.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="p-2 bg-white rounded-md shadow-sm text-gray-500">
                                                            {lesson.type === "video" ? <FaVideo /> : <FaFileAlt />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">{lesson.title}</p>
                                                                <Chip 
                                                                    size="sm" 
                                                                    color={lesson.isPublished ? "success" : "default"}
                                                                    variant="flat"
                                                                >
                                                                    {lesson.isPublished ? "Published" : "Draft"}
                                                                </Chip>
                                                                {lesson.isFreePreview && (
                                                                    <Chip size="sm" color="primary" variant="flat">
                                                                        Free Preview
                                                                    </Chip>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                                <span className="capitalize">{lesson.type}</span>
                                                                {lesson.description && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate max-w-[200px]">{lesson.description}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color={lesson.isPublished ? "warning" : "success"}
                                                            onPress={() => {
                                                                updateLesson({
                                                                    id: lesson.id,
                                                                    isPublished: !lesson.isPublished,
                                                                });
                                                            }}
                                                        >
                                                            {lesson.isPublished ? "Unpublish" : "Publish"}
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => {
                                                                setCurrentModuleId(module.id);
                                                                setEditingLessonId(lesson.id);
                                                                setNewLesson(lesson);
                                                                onOpenLessonModal();
                                                            }}
                                                        >
                                                            <FaEdit className="text-gray-500" />
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            onPress={() => handleDeleteLesson(module.id, lesson.id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                className="mt-2"
                                                variant="bordered"
                                                startContent={<FaPlus />}
                                                onPress={() => {
                                                    setCurrentModuleId(module.id);
                                                    setEditingLessonId(null);
                                                    setNewLesson({ type: "video" });
                                                    onOpenLessonModal();
                                                }}
                                            >
                                                Add Lesson
                                            </Button>
                                        </div>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                </Tab>

                {/* Students Tab (Placeholder) */}
                <Tab
                    key="students"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaUsers />
                            <span>Students</span>
                        </div>
                    }
                >
                    <Card className="mt-6">
                        <CardBody className="p-8 text-center text-gray-500">
                            <FaGraduationCap className="text-6xl mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold mb-2">Enrolled Students</h3>
                            <p>View and manage the {courseData.enrolled} students enrolled in this course.</p>
                        </CardBody>
                    </Card>
                </Tab>

                {/* ASSESSMENTS TAB - The user's request */}
                <Tab
                    key="assessments"
                    title={
                        <div className="flex items-center space-x-2">
                            <FaClipboardList />
                            <span>Assessments</span>
                        </div>
                    }
                >
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Course Assessments</h2>
                                <p className="text-gray-600">Manage quizzes, exams, and assignments for this course.</p>
                            </div>
                            {/* Auto-select this course when creating */}
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<FaPlus />}
                                onPress={() => router.push(`/instructor/quizzes/create?courseId=${courseId}&courseTitle=${encodeURIComponent(courseData?.title || '')}`)}
                            >
                                Create Assessment
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {assessments.map((assessment: any) => (
                                <Card key={assessment._id || assessment.id} className="hover:shadow-md transition-shadow">
                                    <CardBody className="p-4 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${assessment.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                                assessment.type === 'mid-exam' ? 'bg-orange-100 text-orange-600' :
                                                    assessment.type === 'final-exam' ? 'bg-red-100 text-red-600' :
                                                        assessment.type === 'project' ? 'bg-green-100 text-green-600' :
                                                            'bg-blue-100 text-blue-600'
                                                }`}>
                                                <FaClipboardList className="text-xl" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg">{assessment.title}</h3>
                                                    <Chip size="sm" variant="flat" color="secondary" className="capitalize">
                                                        {assessment.type.replace("-", " ")}
                                                    </Chip>
                                                    <Chip size="sm" variant="dot" color={getStatusColor(assessment.status) as any}>
                                                        {assessment.status}
                                                    </Chip>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {assessment.type === 'assignment' || assessment.type === 'project'
                                                        ? `Due: ${assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : "N/A"}`
                                                        : `${assessment.questions || 0} Questions`}
                                                    {' • '}
                                                    <span className="font-medium text-primary cursor-pointer hover:underline">
                                                        {assessment.submissionsCount || 0} Submissions
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Submission Button for capable types */}
                                            {(['assignment', 'project', 'mid-exam', 'final-exam'].includes(assessment.type)) && (
                                                <Button size="sm" variant="flat" color="primary">
                                                    View Submissions
                                                </Button>
                                            )}
                                            <Button isIconOnly variant="light" onPress={() => router.push(`/instructor/quizzes/${assessment.id}/edit`)}>
                                                <FaEdit className="text-gray-500" />
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}

                            {assessments.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-4">No assessments created for this course yet.</p>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        onPress={() => router.push(`/instructor/quizzes/create?courseId=${courseId}&courseTitle=${encodeURIComponent(courseData?.title || '')}`)}
                                    >
                                        Create Your First Assessment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>

            {/* Module Modal */}
            <Modal isOpen={isModuleModalOpen} onClose={onCloseModuleModal} size="2xl">
                <ModalContent>
                    <ModalHeader>{editingModuleId ? "Edit Module" : "Add New Module"}</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Module Title"
                            placeholder="e.g., Introduction to CSS"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            isRequired
                        />
                        <Textarea
                            label="Description"
                            placeholder="Brief summary of this module..."
                            minRows={2}
                            className="mt-4"
                            value={newModuleDescription}
                            onChange={(e) => setNewModuleDescription(e.target.value)}
                        />

                        {/* Module Resource Section */}
                        <div className="mt-4">
                            <label className="text-sm font-medium mb-2 block">Module Resources (Optional)</label>
                            <p className="text-xs text-gray-500 mb-3">Upload lecture notes, slides, or source code for this module.</p>
                            <Tabs
                                aria-label="Module Content Source"
                                size="sm"
                                classNames={{
                                    tabList: "w-full",
                                    cursor: "w-full bg-primary",
                                }}
                            >
                                <Tab key="upload" title={
                                    <div className="flex items-center space-x-2">
                                        <FaCloudUploadAlt />
                                        <span>Upload File</span>
                                    </div>
                                }>
                                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-gray-50/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    setNewModuleResource(URL.createObjectURL(file));
                                                    alert(`Resources attached: ${file.name}`);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                                <FaCloudUploadAlt className="text-3xl" />
                                            </div>
                                            <p className="font-semibold">Drop module resources here</p>
                                            <p className="text-xs mt-1">ZIP, PDF, PPTX (Max 50MB)</p>
                                        </div>
                                    </div>
                                    {newModuleResource && newModuleResource.startsWith("blob:") && (
                                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                                            <FaCheckCircle /> File selected
                                        </div>
                                    )}
                                </Tab>
                                <Tab key="url" title={
                                    <div className="flex items-center space-x-2">
                                        <FaLink />
                                        <span>External Link</span>
                                    </div>
                                }>
                                    <Input
                                        className="mt-4"
                                        label="Resource URL"
                                        placeholder={`https://drive.google.com/...`}
                                        startContent={<FaLink className="text-gray-400" />}
                                        value={newModuleResource || ""}
                                        onChange={(e) => setNewModuleResource(e.target.value)}
                                        description="Link to cloud folder, GitHub repo, or slides"
                                    />
                                </Tab>
                            </Tabs>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onCloseModuleModal}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveModule}>Save Module</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Lesson Modal */}
            <Modal isOpen={isLessonModalOpen} onClose={onCloseLessonModal} size="2xl">
                <ModalContent>
                    <ModalHeader>{editingLessonId ? "Edit Lesson" : "Add New Lesson"}</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Lesson Title"
                            placeholder="e.g., CSS Selectors"
                            value={newLesson.title || ""}
                            onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                            isRequired
                        />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Type</label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        color={newLesson.type === "video" ? "primary" : "default"}
                                        variant={newLesson.type === "video" ? "solid" : "bordered"}
                                        onPress={() => setNewLesson({ ...newLesson, type: "video" })}
                                        startContent={<FaVideo />}
                                    >
                                        Video
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={newLesson.type === "article" ? "primary" : "default"}
                                        variant={newLesson.type === "article" ? "solid" : "bordered"}
                                        onPress={() => setNewLesson({ ...newLesson, type: "article" })}
                                        startContent={<FaFileAlt />}
                                    >
                                        Article
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Textarea
                                    label="Description"
                                    placeholder="Enter content details..."
                                    minRows={1}
                                    value={newLesson.description || ""}
                                    onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Content Material Section */}
                        <div className="mt-2">
                            <label className="text-sm font-medium mb-2 block">Content Material</label>
                            <Tabs
                                aria-label="Content Source"
                                size="sm"
                                classNames={{
                                    tabList: "w-full",
                                    cursor: "w-full bg-primary",
                                }}
                            >
                                <Tab key="upload" title={
                                    <div className="flex items-center space-x-2">
                                        <FaCloudUploadAlt />
                                        <span>Upload File</span>
                                    </div>
                                }>
                                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative group bg-gray-50/50">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    // Mock upload behavior
                                                    const file = e.target.files[0];
                                                    setNewLesson({ ...newLesson, contentUrl: URL.createObjectURL(file) });
                                                    alert(`File selected: ${file.name}`);
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                                <FaCloudUploadAlt className="text-3xl" />
                                            </div>
                                            <p className="font-semibold">Click to upload or drag and drop</p>
                                            <p className="text-xs mt-1">
                                                {newLesson.type === "video" ? "MP4, WebM (Max 2GB)" :
                                                    newLesson.type === "article" ? "PDF, DOCX, TXT (Max 10MB)" : "Any file"}
                                            </p>
                                        </div>
                                    </div>
                                    {newLesson.contentUrl && newLesson.contentUrl.startsWith("blob:") && (
                                        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-center gap-2">
                                            <FaCheckCircle /> File selected and ready to upload
                                        </div>
                                    )}
                                </Tab>
                                <Tab key="url" title={
                                    <div className="flex items-center space-x-2">
                                        <FaLink />
                                        <span>External Link</span>
                                    </div>
                                }>
                                    <Input
                                        className="mt-4"
                                        label="External URL"
                                        placeholder={`https://...`}
                                        startContent={<FaLink className="text-gray-400" />}
                                        value={newLesson.contentUrl || ""}
                                        onChange={(e) => setNewLesson({ ...newLesson, contentUrl: e.target.value })}
                                        description="Direct link to video (YouTube/Vimeo) or document"
                                    />
                                </Tab>
                            </Tabs>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="freePreview"
                                checked={newLesson.isFreePreview || false}
                                onChange={(e) => setNewLesson({ ...newLesson, isFreePreview: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <label htmlFor="freePreview" className="text-sm select-none cursor-pointer">Make this lesson free for preview</label>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onCloseLessonModal}>Cancel</Button>
                        <Button color="primary" onPress={handleSaveLesson}>Save Lesson</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div >
    );
}
