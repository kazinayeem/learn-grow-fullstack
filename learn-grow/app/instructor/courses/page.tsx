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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaChartLine } from "react-icons/fa";
import { useGetInstructorCoursesQuery, useCreateCourseMutation, useDeleteCourseMutation } from "@/redux/api/courseApi";
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

    const checkAndRefreshApprovalStatus = async () => {
        // Fetch fresh user data from server
        const freshUser = await refreshUserStatus();
        if (freshUser) {
            const freshApprovalStatus = !!freshUser.isApproved;
            setIsApproved(freshApprovalStatus);
            console.log("Approval status checked. isApproved:", freshApprovalStatus);
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
    const { data: instructorCoursesResp, isLoading } = useGetInstructorCoursesQuery(instructorId as string, {
        skip: !instructorId,
    });

    // Mutations
    const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

    // Mock courses data - replace with API
    // Mock courses data - replace with API
    const [courses, setCourses] = useState<any[]>([]);

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
        level: "Beginner",
        language: "English",
        duration: "",
        thumbnailUrl: "",
    });
    const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});

    // Prefer API data when available
    const hydratedCourses = Array.isArray(instructorCoursesResp?.data)
        ? instructorCoursesResp!.data
        : courses;

    const filteredCourses = hydratedCourses.filter((course: any) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                price: parseInt(newCourse.price),
                level: newCourse.level,
                language: newCourse.language,
                duration: parseInt(newCourse.duration),
                thumbnailUrl: newCourse.thumbnailUrl,
                instructorId: instructorId,
            } as any).then(() => {
                setNewCourse({ title: "", description: "", category: "", price: "", level: "Beginner", language: "English", duration: "", thumbnailUrl: "" });
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
            setNewCourse({ title: "", description: "", category: "", price: "", level: "Beginner", language: "English", duration: "", thumbnailUrl: "" });
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
                        onPress={() => {
                            if (!isApproved) {
                                alert("Please wait for approval. Once we approve you, you can create courses.");
                                return;
                            }
                            onOpen();
                        }}
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
                            {hydratedCourses?.reduce((sum: number, c: any) => sum + (c.studentsEnrolled || c.enrolled || 0), 0) || 0}
                        </p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-6">
                        <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
                        <p className="text-3xl font-bold text-yellow-600">
                            {(
                                hydratedCourses
                                    .filter((c) => c.rating)
                                    .reduce((sum, c) => sum + (c.rating || 0), 0) /
                                hydratedCourses.filter((c) => c.rating).length || 0
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
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaUsers />
                                    <span>{course.enrolled || 0} students</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold text-green-600">{course.price} BDT</span>
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

            {/* Create Course Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={() => {
                    onClose();
                    setCourseErrors({});
                }}
                size="2xl"
                isDismissable={false}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Create New Course</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    {courseErrors.general && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                            {courseErrors.general}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input 
                                            label="Course Title" 
                                            placeholder="Enter course title (min 5 characters)"
                                            value={newCourse.title} 
                                            onChange={(e) => {
                                                setNewCourse({ ...newCourse, title: e.target.value });
                                                if (courseErrors.title) setCourseErrors({ ...courseErrors, title: "" });
                                            }}
                                            variant="bordered" 
                                            isRequired 
                                            isInvalid={!!courseErrors.title}
                                            errorMessage={courseErrors.title}
                                        />
                                        <Input 
                                            label="Category" 
                                            placeholder="e.g., Web Development"
                                            value={newCourse.category} 
                                            onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} 
                                            variant="bordered" 
                                        />
                                        <Input 
                                            label="Thumbnail URL" 
                                            placeholder="Enter thumbnail image URL"
                                            value={newCourse.thumbnailUrl} 
                                            onChange={(e) => {
                                                setNewCourse({ ...newCourse, thumbnailUrl: e.target.value });
                                                if (courseErrors.thumbnailUrl) setCourseErrors({ ...courseErrors, thumbnailUrl: "" });
                                            }}
                                            variant="bordered" 
                                            isRequired 
                                            isInvalid={!!courseErrors.thumbnailUrl}
                                            errorMessage={courseErrors.thumbnailUrl}
                                        />
                                        <Input 
                                            label="Price (BDT)" 
                                            type="number" 
                                            placeholder="Enter price"
                                            value={newCourse.price} 
                                            onChange={(e) => {
                                                setNewCourse({ ...newCourse, price: e.target.value });
                                                if (courseErrors.price) setCourseErrors({ ...courseErrors, price: "" });
                                            }}
                                            variant="bordered" 
                                            isRequired 
                                            isInvalid={!!courseErrors.price}
                                            errorMessage={courseErrors.price}
                                        />
                                        <Input 
                                            label="Duration (hours)" 
                                            type="number" 
                                            placeholder="Enter duration in hours"
                                            value={newCourse.duration} 
                                            onChange={(e) => {
                                                setNewCourse({ ...newCourse, duration: e.target.value });
                                                if (courseErrors.duration) setCourseErrors({ ...courseErrors, duration: "" });
                                            }}
                                            variant="bordered" 
                                            isRequired
                                            isInvalid={!!courseErrors.duration}
                                            errorMessage={courseErrors.duration}
                                        />
                                        <Select
                                            label="Level"
                                            selectedKeys={[newCourse.level]}
                                            onSelectionChange={(keys) => {
                                                const value = Array.from(keys)[0];
                                                setNewCourse({ ...newCourse, level: value as string });
                                                if (courseErrors.level) setCourseErrors({ ...courseErrors, level: "" });
                                            }}
                                            variant="bordered"
                                            isRequired
                                            isInvalid={!!courseErrors.level}
                                            errorMessage={courseErrors.level}
                                        >
                                            {COURSE_LEVELS.map((level) => (
                                                <SelectItem key={level.key} value={level.key}>
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Select
                                            label="Language"
                                            selectedKeys={[newCourse.language]}
                                            onSelectionChange={(keys) => {
                                                const value = Array.from(keys)[0];
                                                setNewCourse({ ...newCourse, language: value as string });
                                                if (courseErrors.language) setCourseErrors({ ...courseErrors, language: "" });
                                            }}
                                            variant="bordered"
                                            isRequired
                                            isInvalid={!!courseErrors.language}
                                            errorMessage={courseErrors.language}
                                        >
                                            {COURSE_LANGUAGES.map((lang) => (
                                                <SelectItem key={lang.key} value={lang.key}>
                                                    {lang.label}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <Textarea 
                                        label="Description" 
                                        placeholder="Enter course description (min 20 characters)"
                                        value={newCourse.description} 
                                        onChange={(e) => {
                                            setNewCourse({ ...newCourse, description: e.target.value });
                                            if (courseErrors.description) setCourseErrors({ ...courseErrors, description: "" });
                                        }}
                                        variant="bordered" 
                                        minRows={4} 
                                        isRequired 
                                        isInvalid={!!courseErrors.description}
                                        errorMessage={courseErrors.description}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button 
                                    variant="light" 
                                    onPress={() => {
                                        onClose();
                                        setCourseErrors({});
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleCreateCourse} isLoading={isCreating}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
