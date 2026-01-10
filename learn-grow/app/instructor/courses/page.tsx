"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Input,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Textarea,
    Select,
    SelectItem,
    Switch,
    Pagination,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaChartLine } from "react-icons/fa";
import { useGetInstructorCoursesQuery, useCreateCourseMutation, useDeleteCourseMutation } from "@/redux/api/courseApi";
import { useGetInstructorStatsQuery } from "@/redux/api/userApi";
import { refreshUserStatus, getApprovalStatus } from "@/lib/utils/userStatus";

// Course level options
const COURSE_LEVELS = [
    { key: "Beginner", label: "Beginner" },
    { key: "Intermediate", label: "Intermediate" },
    { key: "Advanced", label: "Advanced" },
    { key: "Expert", label: "Expert" },
];

// Popular languages including Bangla
const COURSE_LANGUAGES = [
    { key: "English", label: "English" },
    { key: "Bangla", label: "Bangla (বাংলা)" },
    { key: "Spanish", label: "Spanish" },
    { key: "French", label: "French" },
    { key: "German", label: "German" },
    { key: "Chinese", label: "Chinese (中文)" },
    { key: "Japanese", label: "Japanese (日本語)" },
    { key: "Arabic", label: "Arabic (العربية)" },
    { key: "Hindi", label: "Hindi (हिंदी)" },
    { key: "Portuguese", label: "Portuguese" },
];

export default function InstructorCoursesPage() {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");
    const [instructorId, setInstructorId] = useState<string | null>(null);
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const checkAndRefreshApprovalStatus = async () => {
        // Fetch fresh user data from server
        const freshUser = await refreshUserStatus();
        if (freshUser) {
            const freshApprovalStatus = !!freshUser.isApproved;
            setIsApproved(freshApprovalStatus);
        }
    };

    // Resolve current instructor id from local storage (client-only)
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (raw) {
                const parsed = JSON.parse(raw);
                setInstructorId(parsed?._id || parsed?.id || null);
                setIsApproved(!!parsed?.isApproved);
            }
        } catch (_) {
            setInstructorId(null);
            setIsApproved(false);
        }
    }, []);

    // Poll for approval status changes every 5 seconds when not approved
    useEffect(() => {
        if (isApproved) return; // Stop polling once approved

        const interval = setInterval(() => {
            checkAndRefreshApprovalStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, [isApproved]);

    // Check approval on page focus
    useEffect(() => {
        const handleFocus = () => {
            checkAndRefreshApprovalStatus();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // Data query for instructor courses (stateless, skips until id ready)
    const { data: instructorCoursesResp, isLoading } = useGetInstructorCoursesQuery(
        { instructorId: instructorId as string, page: currentPage, limit: itemsPerPage },
        { skip: !instructorId }
    );

    // Get instructor stats for accurate totals
    const { data: statsData } = useGetInstructorStatsQuery(
        { instructorId: instructorId as string },
        { skip: !instructorId }
    );
    const stats = statsData?.data;

    // Mutations
    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

    // Mock courses data - replace with API
    // Mock courses data - replace with API
    const [courses, setCourses] = useState<any[]>([]);

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        category: "",
        type: "recorded",
        price: "",
        level: "Beginner",
        language: "English",
        duration: "",
        thumbnailUrl: "",
        isRegistrationOpen: false,
        registrationDeadline: "",
    });
    const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});

    // Prefer API data when available
    const hydratedCourses = Array.isArray(instructorCoursesResp?.data)
        ? instructorCoursesResp!.data
        : courses;

    // Get pagination info from API response
    const totalPages = instructorCoursesResp?.pagination?.totalPages || 1;

    // Filter courses by search (client-side for now)
    const filteredCourses = hydratedCourses.filter((course: any) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleCreateCourse = () => {
        // Reset errors
        setCourseErrors({});
        const errors: Record<string, string> = {};

        // Validation
        if (!newCourse.title || newCourse.title.length < 5) {
            errors.title = "Title must be at least 5 characters";
        }
        if (!newCourse.description || newCourse.description.length < 20) {
            errors.description = "Description must be at least 20 characters";
        }
        if (!newCourse.price) {
            errors.price = "Price is required";
        }
        if (!newCourse.duration) {
            errors.duration = "Duration is required";
        }
        if (!newCourse.level) {
            errors.level = "Level is required";
        }
        if (!newCourse.language) {
            errors.language = "Language is required";
        }
        if (!newCourse.thumbnailUrl) {
            errors.thumbnailUrl = "Thumbnail URL is required";
        }

        if (Object.keys(errors).length > 0) {
            setCourseErrors(errors);
            return;
        }

        const course = {
            id: Date.now().toString(),
            title: newCourse.title,
            students: 0,
            status: "draft",
            price: parseInt(newCourse.price),
            rating: 0,
            lastUpdated: new Date().toISOString().split("T")[0],
        };

        // If API is available, create via mutation; else fallback to local state
        if (instructorId) {
            createCourse({
                title: newCourse.title,
                description: newCourse.description,
                category: newCourse.category,
                type: newCourse.type as any,
                price: parseInt(newCourse.price),
                level: newCourse.level,
                language: newCourse.language,
                duration: parseInt(newCourse.duration),
                thumbnail: newCourse.thumbnailUrl,
                isRegistrationOpen: !!newCourse.isRegistrationOpen,
                registrationDeadline: newCourse.registrationDeadline ? newCourse.registrationDeadline : undefined,
                instructorId: instructorId,
            } as any).then(() => {
                setNewCourse({ title: "", description: "", category: "", type: "recorded", price: "", level: "Beginner", language: "English", duration: "", thumbnailUrl: "", isRegistrationOpen: false, registrationDeadline: "" });
                setCourseErrors({});
                onClose();
                alert("Course created successfully!");
            }).catch((err: any) => {
                // Handle API validation errors
                const apiErrors = err.data?.errors;
                if (Array.isArray(apiErrors)) {
                    const fieldErrors: Record<string, string> = {};
                    apiErrors.forEach((err: any) => {
                        const field = err.field?.split(".").pop() || "general";
                        fieldErrors[field] = err.message;
                    });
                    setCourseErrors(fieldErrors);
                } else {
                    setCourseErrors({ general: "Failed to create course. Please try again." });
                }
            });
        } else {
            setCourses([...courses, course]);
            setNewCourse({
                title: "",
                description: "",
                category: "",
                type: "recorded",
                price: "",
                level: "Beginner",
                language: "English",
                duration: "",
                thumbnailUrl: "",
                isRegistrationOpen: false,
                registrationDeadline: "",
            });
            setCourseErrors({});
            onClose();
            alert("Course created successfully!");
        }
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            setCourses(courses.filter((c) => c.id !== id));
            alert("Course deleted!");
        }
    };

    const getStatusColor = (status: string) => {
        return status === "published" ? "success" : "warning";
    };

    // Gracefully format dates from API or fallback fields
    const formatDate = (value?: string) => {
        if (!value) return "Not set";
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? "Not set" : parsed.toLocaleDateString();
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Courses</h1>
                    <p className="text-gray-600">Manage and create your courses</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button
                        variant="flat"
                        onPress={() => router.push("/instructor")}
                    >
                        Back to Dashboard
                    </Button>
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<FaPlus />}
                        onPress={() => router.push("/instructor/courses/create")}
                        isLoading={isLoading || isCreating}
                        isDisabled={!isApproved}
                    >
                        Create New Course
                    </Button>
                </div>
            </div>

            {!isApproved && (
                <Card className="mb-6 border-2 border-yellow-300">
                    <CardBody className="p-4">
                        <p className="text-yellow-700">
                            Your instructor account is pending approval. You can browse your courses but cannot create new ones yet.
                        </p>
                    </CardBody>
                </Card>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                        <p className="text-3xl font-bold">{hydratedCourses?.length || 0}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Published</p>
                        <p className="text-3xl font-bold text-green-600">
                            {hydratedCourses?.filter((c: any) => c.isPublished)?.length || 0}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Total Students</p>
                        <p className="text-3xl font-bold">
                            {stats?.totalStudents || 0}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {(
                                hydratedCourses
                                    .filter((c: any) => c.rating)
                                    .reduce((sum: number, c: any) => sum + (c.rating || 0), 0) /
                                hydratedCourses.filter((c: any) => c.rating).length || 0
                            ).toFixed(1)} ⭐
                        </p>
                    </CardBody>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="lg"
                    startContent={<FaEdit />}
                />
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course: any, index: number) => (
                    <Card key={course._id || course.id || index} className="hover:shadow-xl transition-shadow">
                        <CardBody className="p-6">
                            {/* Status Badge */}
                            <div className="flex justify-between items-start mb-3">
                                <Chip color={getStatusColor(course.isPublished ? "published" : "draft") as any} size="sm" variant="flat">
                                    {(course.isPublished ? "PUBLISHED" : "DRAFT")}
                                </Chip>
                                {course.rating && (
                                    <span className="text-yellow-600 font-semibold">⭐ {course.rating}</span>
                                )}
                            </div>

                            {/* Course Title */}
                            <h3 className="font-bold text-xl mb-3 line-clamp-2">{course.title}</h3>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-green-600">{course.price || "N/A"} BDT</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-blue-600">
                                      {course.accessDuration === "lifetime" ? "♾️ Lifetime" : `${course.accessDuration || "N/A"} Mo`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                                    <span className="font-semibold">{course.modulesCount ?? course.modules?.length ?? 0}</span>
                                    <span>Modules</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold">{course.lessonsCount ?? 0}</span>
                                    <span>Lessons</span>
                                </div>
                            </div>

                            {/* Last Updated */}
                            <p className="text-xs text-gray-500 mb-4">
                                Updated: {formatDate(course.updatedAt || course.lastUpdated || course.createdAt)}
                            </p>
                        </CardBody>

                        <CardFooter className="p-6 pt-0 flex gap-2">
                            <Button
                                size="sm"
                                variant="bordered"
                                startContent={<FaEye />}
                                className="flex-1"
                                onPress={() => router.push(`/instructor/courses/${course._id || course.id}`)}
                            >
                                View
                            </Button>
                            <Button
                                size="sm"
                                color="primary"
                                variant="bordered"
                                startContent={<FaChartLine />}
                                onPress={() => router.push(`/instructor/courses/${course._id || course.id}`)}
                            >
                                Manage
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                variant="bordered"
                                isIconOnly
                                onPress={() => handleDelete(course._id || course.id, course.title)}
                            >
                                <FaTrash />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination
                        total={totalPages}
                        page={currentPage}
                        onChange={setCurrentPage}
                        showControls
                        color="primary"
                    />
                </div>
            )}

            {/* Modal removed; creation now on /instructor/courses/create */}
        </div>
    );
}
