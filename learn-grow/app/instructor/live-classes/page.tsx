"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Select,
    SelectItem,
    Textarea,
    Chip,
    Spinner,
} from "@nextui-org/react";
import { FaPlus, FaVideo, FaClock, FaCalendar, FaUsers, FaTrash, FaExclamationTriangle, FaLink, FaEdit, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import {
    useGetInstructorLiveClassesQuery,
    useCreateLiveClassMutation,
    useDeleteLiveClassMutation,
    useUpdateRecordedLinkMutation,
    useUpdateLiveClassMutation,
} from "@/redux/api/liveClassApi";
import RequireAuth from "@/components/Auth/RequireAuth";

export default function InstructorLiveClassesPage() {
    const router = useRouter();
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [isAuthed, setIsAuthed] = React.useState(false);
    const [instructorId, setInstructorId] = React.useState<string | null>(null);
    const [formError, setFormError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("token") || (require("js-cookie")).default.get("accessToken");
        setIsAuthed(!!token);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                const id = parsed?._id || parsed?.id;
                if (id) setInstructorId(id as string);
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
    }, []);

    // Update current time every second for countdown
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [newClass, setNewClass] = useState({
        title: "",
        courseId: "",
        date: "",
        time: "",
        duration: "60",
        platform: "Zoom",
        meetingLink: "",
    });

    // Pagination and filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [recordedLink, setRecordedLink] = useState("");
    const [editingClassId, setEditingClassId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        title: "",
        courseId: "",
        date: "",
        time: "",
        duration: "60",
        platform: "Zoom",
        meetingLink: "",
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const itemsPerPage = 12;

    // API Queries - skip until authenticated
    const { data: coursesData, isLoading: coursesLoading } = useGetInstructorCoursesQuery(
        { instructorId: instructorId as string, page: 1, limit: 100 },
        {
            skip: !isAuthed || !instructorId,
        }
    );

    const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== "all" ? (statusFilter === "scheduled" ? "Scheduled" : "Completed") : undefined,
        platform: platformFilter !== "all" ? platformFilter : undefined,
        isApproved: approvalFilter === "approved" ? true : approvalFilter === "pending" ? false : undefined,
        search: searchQuery || undefined,
    } as const;

    const { data: classesData, isLoading: classesLoading, refetch } = useGetInstructorLiveClassesQuery(queryParams, {
        skip: !isAuthed,
    });
    const [createLiveClass, { isLoading: createLoading }] = useCreateLiveClassMutation();
    const [deleteLiveClass, { isLoading: deleteLoading }] = useDeleteLiveClassMutation();
    const [updateRecordedLink, { isLoading: recordingLoading }] = useUpdateRecordedLinkMutation();
    const [updateLiveClass] = useUpdateLiveClassMutation();

    const instructorCourses = coursesData?.data || coursesData?.courses || [];
    const liveClasses = classesData?.data || [];
    const totalClasses = classesData?.pagination?.total ?? liveClasses.length;

    const handleScheduleClass = async () => {
        setFormError(null);

        if (!newClass.title || !newClass.courseId || !newClass.date || !newClass.time || !newClass.meetingLink) {
            setFormError("Please fill in all required fields.");
            return;
        }

        // Basic URL validation to avoid backend 422 for invalid meeting links
        try {
            const url = new URL(newClass.meetingLink);
            if (!url.protocol.startsWith("http")) {
                throw new Error("Invalid protocol");
            }
        } catch (e) {
            setFormError("Please enter a valid meeting link (include http/https).");
            return;
        }

        try {
            // Combine date and time into ISO datetime (properly handles local to UTC)
            const localDateTime = new Date(`${newClass.date}T${newClass.time}`);
            const scheduledAt = localDateTime.toISOString();

            await createLiveClass({
                title: newClass.title,
                courseId: newClass.courseId,
                scheduledAt,
                duration: parseInt(newClass.duration),
                platform: newClass.platform,
                meetingLink: newClass.meetingLink,
            }).unwrap();

            setNewClass({
                title: "",
                courseId: "",
                date: "",
                time: "",
                duration: "60",
                platform: "Zoom",
                meetingLink: "",
            });
            onClose();
            refetch();
            setFormError(null);
        } catch (error: any) {
            console.error("Error scheduling class:", error);
            const apiMessage = (error as any)?.data?.message || (error as any)?.error || "Failed to schedule class";
            const fieldErrors = (error as any)?.data?.errors;
            const fieldText = Array.isArray(fieldErrors)
                ? fieldErrors.map((e: any) => `${e.field?.replace("body.", "") || "field"}: ${e.message}`).join("; ")
                : null;
            setFormError(fieldText ? `${apiMessage}. ${fieldText}` : apiMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to cancel this class?")) {
            try {
                await deleteLiveClass(id).unwrap();
                refetch();
                alert("Class cancelled successfully");
            } catch (error) {
                alert("Failed to cancel class");
            }
        }
    };

    const handleMarkAsDone = async (classId: string) => {
        if (confirm("Mark this class as completed? You'll then be able to add the recorded link.")) {
            try {
                await updateLiveClass({
                    id: classId,
                    status: "Completed",
                }).unwrap();
                refetch();
                alert("Class marked as completed");
            } catch (error: any) {
                alert("Failed to mark class as done: " + (error?.data?.message || "Unknown error"));
            }
        }
    };

    const handleSaveRecordedLink = async (classId: string) => {
        if (!recordedLink.trim()) {
            alert("Please enter a recorded link");
            return;
        }

        try {
            await updateRecordedLink({ id: classId, recordedLink }).unwrap();
            setEditingLinkId(null);
            setRecordedLink("");
            refetch();
            alert("Recorded link added successfully");
        } catch (error: any) {
            alert("Failed to save recorded link: " + (error?.data?.message || "Unknown error"));
        }
    };

    const handleEditClass = (classItem: any) => {
        setEditingClassId(classItem._id);
        // Convert UTC to local time for editing
        const date = new Date(classItem.scheduledAt);
        const localDate = date.toISOString().split("T")[0];
        const localTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        setEditForm({
            title: classItem.title,
            courseId: typeof classItem.courseId === "object" ? classItem.courseId._id : classItem.courseId,
            date: localDate,
            time: localTime,
            duration: classItem.duration.toString(),
            platform: classItem.platform,
            meetingLink: classItem.meetingLink,
        });
    };

    const handleSaveEdit = async () => {
        if (!editForm.title || !editForm.courseId || !editForm.date || !editForm.time || !editForm.meetingLink) {
            alert("Please fill in all fields");
            return;
        }

        try {
            // Combine date and time into ISO datetime (properly handles local to UTC)
            const localDateTime = new Date(`${editForm.date}T${editForm.time}`);
            const scheduledAt = localDateTime.toISOString();
            
            await updateLiveClass({
                id: editingClassId,
                title: editForm.title,
                courseId: editForm.courseId,
                scheduledAt,
                duration: parseInt(editForm.duration),
                platform: editForm.platform,
                meetingLink: editForm.meetingLink,
            }).unwrap();
            setEditingClassId(null);
            refetch();
            alert("Class updated successfully");
        } catch (error: any) {
            alert("Failed to update class: " + (error?.data?.message || "Unknown error"));
        }
    };

    const getTimeRemaining = (scheduledAt: string) => {
        const classTime = new Date(scheduledAt);
        const diffMs = classTime.getTime() - currentTime.getTime();
        
        if (diffMs < 0) {
            return null;
        }

        const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const mins = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((diffMs % (60 * 1000)) / 1000);

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const getStatusColor = (status: string) => {
        return status === "Scheduled" ? "primary" : status === "Completed" ? "success" : "danger";
    };

    const getCourseTitle = (courseId: any) => {
        const id = typeof courseId === "string" ? courseId : courseId?._id;
        const course = instructorCourses.find((c: any) => c._id === id);
        return course?.title || "Unknown Course";
    };

    const upcomingClasses = liveClasses.filter((c: any) => c.status === "Scheduled");
    const completedClasses = liveClasses.filter((c: any) => c.status === "Completed");

    const apiTotalPages = classesData?.pagination?.totalPages;
    const computedTotalPages = Math.ceil(totalClasses / itemsPerPage) || 1;
    const totalPages = Math.max(1, apiTotalPages ?? computedTotalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClasses = liveClasses;
    const displayStart = totalClasses === 0 ? 0 : startIndex + 1;
    const displayEnd = totalClasses === 0 ? 0 : Math.min(startIndex + paginatedClasses.length, totalClasses);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages || 1);
        }
    }, [currentPage, totalPages]);

    const pageNumbers = useMemo(() => {
        const maxButtons = 7;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push("left-ellipsis");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push("right-ellipsis");
        pages.push(totalPages);

        return pages;
    }, [currentPage, totalPages]);

    if (!isAuthed) {
        return (
            <RequireAuth allowedRoles={["instructor"]}>
                <div className="flex justify-center items-center min-h-screen">
                    <Spinner size="lg" label="Checking authentication..." />
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth allowedRoles={["instructor"]}>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => router.push("/instructor")}
                            className="text-gray-600"
                        >
                            <FaArrowLeft className="text-lg" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Live Classes 🎥</h1>
                            <p className="text-gray-600">Schedule and manage live sessions with your students</p>
                        </div>
                    </div>
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<FaPlus />}
                        onPress={onOpen}
                        isDisabled={instructorCourses.length === 0}
                    >
                        Schedule New Class
                    </Button>
                </div>

                {/* Search and Filters */}
                {instructorCourses.length > 0 && (
                    <div className="mb-6 space-y-4">
                        <Input
                            placeholder="Search by title or course..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="max-w-md"
                        />
                        
                        <div className="flex flex-wrap gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                            </select>

                            <select
                                value={platformFilter}
                                onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Platforms</option>
                                <option value="zoom">Zoom</option>
                                <option value="meet">Meet</option>
                                <option value="other">Other</option>
                            </select>

                            <select
                                value={approvalFilter}
                                onChange={(e) => { setApprovalFilter(e.target.value); setCurrentPage(1); }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Approval Status</option>
                                <option value="pending">Pending Approval</option>
                                <option value="approved">Approved</option>
                            </select>

                            {(searchQuery || statusFilter !== "all" || platformFilter !== "all" || approvalFilter !== "all") && (
                                <Button
                                    size="sm"
                                    color="default"
                                    variant="flat"
                                    onPress={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setPlatformFilter("all");
                                        setApprovalFilter("all");
                                        setCurrentPage(1);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Courses Check */}
                {instructorCourses.length === 0 && (
                    <Card className="mb-6 bg-yellow-50 border-yellow-200">
                        <CardBody className="p-6 flex-row gap-4">
                            <FaExclamationTriangle className="text-2xl text-yellow-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-yellow-800 mb-2">No Courses Yet</p>
                                <p className="text-yellow-700 text-sm">
                                    You need to create or have courses before scheduling live classes.
                                </p>
                                <Button
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    className="mt-3"
                                    onPress={() => router.push("/instructor/courses")}
                                >
                                    Go to Courses
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Statistics */}
                {instructorCourses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FaCalendar className="text-2xl text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Upcoming Classes</p>
                                        <div className="text-3xl font-bold">
                                            {classesLoading ? <Spinner size="sm" /> : upcomingClasses.length}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <FaVideo className="text-2xl text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <div className="text-3xl font-bold">
                                            {classesLoading ? <Spinner size="sm" /> : completedClasses.length}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FaUsers className="text-2xl text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Classes</p>
                                        <div className="text-3xl font-bold">
                                            {classesLoading ? <Spinner size="sm" /> : liveClasses.length}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {/* All Classes with Pagination */}
                {instructorCourses.length > 0 && totalClasses > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">All Classes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {paginatedClasses.map((classItem: any) => (
                                <Card key={classItem._id} className="hover:shadow-xl transition-shadow">
                                    <CardBody className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-2 flex-wrap">
                                                <Chip color={getStatusColor(classItem.status) as any} size="sm" variant="flat">
                                                    {classItem.status}
                                                </Chip>
                                                <Chip 
                                                    color={classItem.isApproved ? "success" : "warning"} 
                                                    size="sm" 
                                                    variant="flat"
                                                >
                                                    {classItem.isApproved ? "Approved" : "Waiting for Approval"}
                                                </Chip>
                                            </div>
                                            <Chip size="sm" variant="flat">
                                                {classItem.platform}
                                            </Chip>
                                        </div>

                                        <h3 className="font-bold text-xl mb-2 line-clamp-2">{classItem.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{getCourseTitle(classItem.courseId)}</p>

                                        <div className="space-y-2 text-sm mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaCalendar />
                                                <span>{new Date(classItem.scheduledAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaClock />
                                                <span>{new Date(classItem.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({classItem.duration} mins)</span>
                                            </div>
                                        </div>

                                        {/* Time Remaining - Show for scheduled classes */}
                                        {classItem.status === "Scheduled" && getTimeRemaining(classItem.scheduledAt) && (
                                            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-xs font-semibold text-gray-700 mb-1">⏱️ Time Remaining</p>
                                                <p className="text-lg font-bold text-orange-600">{getTimeRemaining(classItem.scheduledAt)}</p>
                                            </div>
                                        )}

                                        {/* Recorded Link Section - Show for completed classes */}
                                        {classItem.status === "Completed" && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                {editingLinkId === classItem._id ? (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-700">Add Recorded Video Link</label>
                                                        <Input
                                                            size="sm"
                                                            placeholder="https://..."
                                                            value={recordedLink}
                                                            onValueChange={setRecordedLink}
                                                            className="text-sm"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                color="primary"
                                                                className="flex-1"
                                                                onPress={() => handleSaveRecordedLink(classItem._id)}
                                                                isLoading={recordingLoading}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                className="flex-1"
                                                                onPress={() => {
                                                                    setEditingLinkId(null);
                                                                    setRecordedLink("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            {classItem.recordedLink ? (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-700 mb-1">📹 Recording Available</p>
                                                                    <a
                                                                        href={classItem.recordedLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 hover:underline truncate"
                                                                    >
                                                                        {classItem.recordedLink}
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-600">No recorded link added yet</p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() => {
                                                                setEditingLinkId(classItem._id);
                                                                setRecordedLink(classItem.recordedLink || "");
                                                            }}
                                                        >
                                                            <FaEdit className="text-blue-600" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardBody>

                                    <CardFooter className="p-6 pt-0 flex gap-2 flex-wrap">
                                        {classItem.status === "Scheduled" ? (
                                            <>
                                                <Button
                                                    color="primary"
                                                    className="flex-1 min-w-fit"
                                                    size="sm"
                                                    startContent={<FaVideo />}
                                                    onPress={() => window.open(classItem.meetingLink, "_blank")}
                                                >
                                                    Start Class
                                                </Button>
                                                <Button
                                                    color="warning"
                                                    className="flex-1 min-w-fit"
                                                    size="sm"
                                                    startContent={<FaVideo />}
                                                    onPress={() => handleMarkAsDone(classItem._id)}
                                                >
                                                    Mark as Done
                                                </Button>
                                                <Button
                                                    color="default"
                                                    variant="flat"
                                                    className="flex-1 min-w-fit"
                                                    size="sm"
                                                    startContent={<FaEdit />}
                                                    onPress={() => handleEditClass(classItem)}
                                                >
                                                    Edit
                                                </Button>
                                            </>
                                        ) : classItem.status === "Completed" ? (
                                            <Button
                                                color="success"
                                                className="flex-1"
                                                startContent={<FaLink />}
                                                onPress={() => classItem.recordedLink && window.open(classItem.recordedLink, "_blank")}
                                                isDisabled={!classItem.recordedLink}
                                            >
                                                View Recording
                                            </Button>
                                        ) : null}
                                        <Button
                                            color="danger"
                                            variant="bordered"
                                            isIconOnly
                                            isLoading={deleteLoading}
                                            onPress={() => handleDelete(classItem._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                                <Button
                                    size="sm"
                                    isDisabled={currentPage === 1}
                                    onPress={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </Button>

                                <div className="flex gap-2 flex-wrap justify-center">
                                    {pageNumbers.map((page, idx) =>
                                        typeof page === "number" ? (
                                            <Button
                                                key={page}
                                                size="sm"
                                                color={currentPage === page ? "primary" : "default"}
                                                variant={currentPage === page ? "solid" : "flat"}
                                                onPress={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        ) : (
                                            <Button key={`${page}-${idx}`} size="sm" isDisabled variant="light">
                                                ...
                                            </Button>
                                        )
                                    )}
                                </div>

                                <Button
                                    size="sm"
                                    isDisabled={currentPage === totalPages}
                                    onPress={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center text-sm text-gray-600 mb-8">
                            Showing {displayStart} to {displayEnd} of {totalClasses} classes
                        </div>
                    </div>
                )}

                {/* No Classes Message */}
                {instructorCourses.length > 0 && totalClasses === 0 && (
                    <Card>
                        <CardBody className="text-center py-12">
                            <FaVideo className="text-4xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">{searchQuery || statusFilter !== "all" || platformFilter !== "all" || approvalFilter !== "all" ? "No classes match your filters" : "No live classes scheduled yet"}</p>
                            {instructorCourses.length > 0 && !(searchQuery || statusFilter !== "all" || platformFilter !== "all" || approvalFilter !== "all") && (
                                <Button color="primary" className="mt-4" onPress={onOpen}>
                                    Schedule Your First Class
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Schedule Modal */}
                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    onClose={onClose}
                    size="2xl"
                    isDismissable={false}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Schedule Live Class</ModalHeader>
                                <ModalBody>
                                    <div className="space-y-4">
                                        {formError && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                                                {formError}
                                            </div>
                                        )}

                                        <Input
                                            label="Class Title"
                                            placeholder="e.g., Introduction to React Hooks"
                                            value={newClass.title}
                                            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                                            isRequired
                                        />

                                        <Select
                                            label="Course"
                                            placeholder="Select a course"
                                            selectedKeys={newClass.courseId ? [newClass.courseId] : []}
                                            onSelectionChange={(keys) =>
                                                setNewClass({ ...newClass, courseId: Array.from(keys)[0] as string })
                                            }
                                            isRequired
                                            isLoading={coursesLoading}
                                        >
                                            {instructorCourses.map((course: any) => (
                                                <SelectItem key={course._id} value={course._id}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                type="date"
                                                label="Date"
                                                value={newClass.date}
                                                onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                                                isRequired
                                            />
                                            <Input
                                                type="time"
                                                label="Time"
                                                value={newClass.time}
                                                onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                                                isRequired
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                label="Duration (minutes)"
                                                selectedKeys={[newClass.duration]}
                                                onSelectionChange={(keys) =>
                                                    setNewClass({ ...newClass, duration: Array.from(keys)[0] as string })
                                                }
                                            >
                                                <SelectItem key="15" value="15">15 minutes</SelectItem>
                                                <SelectItem key="30" value="30">30 minutes</SelectItem>
                                                <SelectItem key="45" value="45">45 minutes</SelectItem>
                                                <SelectItem key="60" value="60">1 hour</SelectItem>
                                                <SelectItem key="90" value="90">1.5 hours</SelectItem>
                                                <SelectItem key="120" value="120">2 hours</SelectItem>
                                            </Select>

                                            <Select
                                                label="Platform"
                                                selectedKeys={[newClass.platform]}
                                                onSelectionChange={(keys) =>
                                                    setNewClass({ ...newClass, platform: Array.from(keys)[0] as string })
                                                }
                                            >
                                                <SelectItem key="Zoom" value="Zoom">Zoom</SelectItem>
                                                <SelectItem key="Meet" value="Meet">Google Meet</SelectItem>
                                                <SelectItem key="Other" value="Other">Other</SelectItem>
                                            </Select>
                                        </div>

                                        <Input
                                            label={`${newClass.platform} Meeting Link`}
                                            placeholder={
                                                newClass.platform === "Zoom"
                                                    ? "https://zoom.us/j/123456789"
                                                    : "https://meet.google.com/abc-defg-hij"
                                            }
                                            value={newClass.meetingLink}
                                            onChange={(e) => setNewClass({ ...newClass, meetingLink: e.target.value })}
                                            description={
                                                newClass.platform === "Zoom"
                                                    ? "Enter your Zoom meeting URL or ID"
                                                    : "Enter your meeting link"
                                            }
                                            isRequired
                                        />
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onPress={handleScheduleClass}
                                        isLoading={createLoading}
                                    >
                                        Schedule Class
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* Edit Class Modal */}
                <Modal isOpen={editingClassId !== null} onOpenChange={(open) => !open && setEditingClassId(null)}>
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">Edit Live Class</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Class Title"
                                placeholder="e.g., Advanced JavaScript Tutorial"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                isRequired
                            />

                            <Select
                                label="Course"
                                selectedKeys={editForm.courseId ? [editForm.courseId] : []}
                                onSelectionChange={(keys) =>
                                    setEditForm({ ...editForm, courseId: Array.from(keys)[0] as string })
                                }
                                isRequired
                                isLoading={coursesLoading}
                            >
                                {instructorCourses.map((course: any) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </Select>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="date"
                                    label="Date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    isRequired
                                />
                                <Input
                                    type="time"
                                    label="Time"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                                    isRequired
                                />
                            </div>

                            <Input
                                type="number"
                                label="Duration (minutes)"
                                placeholder="60"
                                value={editForm.duration}
                                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                isRequired
                            />

                            <Select
                                label="Platform"
                                selectedKeys={[editForm.platform]}
                                onSelectionChange={(keys) =>
                                    setEditForm({ ...editForm, platform: Array.from(keys)[0] as string })
                                }
                                isRequired
                            >
                                <SelectItem key="Zoom" value="Zoom">
                                    Zoom
                                </SelectItem>
                                <SelectItem key="Meet" value="Meet">
                                    Google Meet
                                </SelectItem>
                                <SelectItem key="Other" value="Other">
                                    Other
                                </SelectItem>
                            </Select>

                            <Input
                                label="Meeting Link"
                                placeholder="https://zoom.us/j/..."
                                value={editForm.meetingLink}
                                onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                isRequired
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="light"
                                onPress={() => setEditingClassId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSaveEdit}
                            >
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </RequireAuth>
    );
}
