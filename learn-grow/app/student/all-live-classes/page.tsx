"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Spinner, Chip, Divider, Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaVideo, FaClock, FaCalendar, FaArrowLeft, FaSearch } from "react-icons/fa";
import { useGetAllLiveClassesQuery } from "@/redux/api/liveClassApi";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import RequireAuth from "@/components/Auth/RequireAuth";

export default function AllLiveClassesPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const itemsPerPage = 16;

    // Get student's orders to filter enrollments
    const { data: ordersData } = useGetMyOrdersQuery();
    const orders = ordersData?.orders || [];

    // Update current time every second for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Calculate skip based on current page
    const skip = (currentPage - 1) * itemsPerPage;
    const { data: classesData, isLoading: classesLoading } = useGetAllLiveClassesQuery({ skip, limit: itemsPerPage });
    const allClasses = (classesData?.data || []).filter((cls: any) => {
        if (!cls) return false;
        if (!cls.courseId) return false;
        // Allow string courseId or object with _id
        if (typeof cls.courseId === "string") return true;
        return Boolean(cls.courseId?._id);
    });
    const totalCount = classesData?.pagination?.total || 0;

    // Filter classes based on student enrollment
    const accessibleClasses = useMemo(() => {
        // Check if student has quarterly (premium) subscription
        const now = new Date();
        const hasQuarterly = orders.some(
            order =>
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.endDate &&
                new Date(order.endDate) > now
        );

        if (hasQuarterly) {
            // Premium: show all classes with valid course reference
            return allClasses.filter((cls: any) => cls && cls.courseId);
        }

        // Get enrolled course IDs from single purchases
        const enrolledCourseIds = orders
            .filter(
                order =>
                    order.planType === "single" &&
                    order.paymentStatus === "approved" &&
                    order.isActive &&
                    order.courseId
            )
            .map(order => {
                const id = typeof order.courseId === "object" && order.courseId ? order.courseId._id : order.courseId;
                return id;
            })
            .filter(id => id != null);

        if (enrolledCourseIds.length === 0) {
            // No enrollment, show no classes
            return [];
        }

        // Filter classes to only those from enrolled courses
        return allClasses.filter((cls: any) => {
            if (!cls || !cls.courseId) return false;
            const courseId = typeof cls.courseId === "object" && cls.courseId ? cls.courseId._id : cls.courseId;
            return courseId && enrolledCourseIds.includes(courseId);
        });
    }, [allClasses, orders]);

    // Separate upcoming and past classes
    const upcomingClasses = accessibleClasses.filter((c: any) => {
        const classTime = new Date(c.scheduledAt);
        return classTime > currentTime && c.status === "Scheduled";
    });

    const pastClasses = accessibleClasses.filter((c: any) => {
        const classTime = new Date(c.scheduledAt);
        return classTime <= currentTime || c.status === "Completed";
    });

    // Combine and filter based on status filter and search
    let filteredClasses = statusFilter === "upcoming" ? upcomingClasses : statusFilter === "past" ? pastClasses : [...upcomingClasses, ...pastClasses];
    
    if (searchQuery) {
        filteredClasses = filteredClasses.filter((cls: any) => 
            cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof cls.courseId === "object" && cls.courseId ? cls.courseId.title : "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort by scheduled date (newest first)
    filteredClasses = filteredClasses.sort((a: any, b: any) => {
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    });

    // Pagination - use FILTERED count, not API total count
    const filteredTotal = filteredClasses.length;
    const totalPages = Math.ceil(filteredTotal / itemsPerPage);
    const paginatedClasses = filteredClasses;
    const displayStart = filteredTotal === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const displayEnd = Math.min(currentPage * itemsPerPage, filteredTotal);

    const pageNumbers = useMemo(() => {
        const maxButtons = 9;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1];
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);

        if (start > 2) pages.push("left-ellipsis");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push("right-ellipsis");
        pages.push(totalPages);

        return pages;
    }, [currentPage, totalPages]);

    // Function to get countdown time
    const getTimeStatus = (scheduledAt: string) => {
        const classTime = new Date(scheduledAt);
        const now = currentTime;
        const diffMs = classTime.getTime() - now.getTime();

        // Class already ended
        if (diffMs < 0) {
            return {
                status: "ended",
                display: "Class time already ended",
                color: "danger",
            };
        }

        const diffSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(diffSecs / (24 * 60 * 60));
        const hours = Math.floor((diffSecs % (24 * 60 * 60)) / (60 * 60));
        const mins = Math.floor((diffSecs % (60 * 60)) / 60);
        const secs = diffSecs % 60;

        // Class starting soon (within 1 hour)
        if (diffSecs < 3600) {
            return {
                status: "soon",
                display: `${mins}m ${secs}s`,
                color: "warning",
            };
        }

        // Class starting today
        if (days === 0) {
            return {
                status: "today",
                display: `${hours}h ${mins}m`,
                color: "primary",
            };
        }

        // Class starting later
        return {
            status: "later",
            display: `${days}d ${hours}h`,
            color: "default",
        };
    };

    return (
        <RequireAuth allowedRoles={["student"]}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex items-center gap-2 mb-1">
                            <Button
                                isIconOnly
                                variant="light"
                                className="text-white"
                                size="sm"
                                onPress={() => router.push("/student")}
                            >
                                <FaArrowLeft />
                            </Button>
                            <h1 className="text-lg font-bold">All Live Classes</h1>
                        </div>
                        <p className="text-xs text-blue-100">View upcoming and completed sessions</p>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto max-w-7xl px-4 py-3">
                    {classesLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                                    <CardBody className="text-white p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs opacity-90">Upcoming</p>
                                                <p className="text-xl font-bold">{upcomingClasses.length}</p>
                                            </div>
                                            <FaVideo className="text-2xl opacity-50" />
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                                    <CardBody className="text-white p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs opacity-90">Completed</p>
                                                <p className="text-xl font-bold">{pastClasses.length}</p>
                                            </div>
                                            <FaCalendar className="text-2xl opacity-50" />
                                        </div>
                                    </CardBody>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                                    <CardBody className="text-white p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs opacity-90">Total</p>
                                                <p className="text-xl font-bold">{accessibleClasses.length}</p>
                                            </div>
                                            <FaVideo className="text-2xl opacity-50" />
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Filters and Search */}
                            <Card>
                                <CardBody className="p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <Input
                                            isClearable
                                            type="text"
                                            size="sm"
                                            placeholder="Search class or course..."
                                            startContent={<FaSearch className="text-gray-400 text-xs" />}
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                            onClear={() => {
                                                setSearchQuery("");
                                                setCurrentPage(1);
                                            }}
                                        />
                                        <Select
                                            label="Status"
                                            size="sm"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <SelectItem key="all" value="all">
                                                All
                                            </SelectItem>
                                            <SelectItem key="upcoming" value="upcoming">
                                                Upcoming
                                            </SelectItem>
                                            <SelectItem key="past" value="past">
                                                Completed
                                            </SelectItem>
                                        </Select>
                                        <div className="flex items-center">
                                            <p className="text-xs text-gray-600">
                                                    {displayStart}-{displayEnd} of {filteredTotal}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Classes List */}
                            {paginatedClasses.length === 0 ? (
                                <Card>
                                    <CardBody className="text-center py-6">
                                        <FaVideo className="text-3xl text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-600 font-medium text-sm">No classes found</p>
                                        <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filters</p>
                                    </CardBody>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {paginatedClasses.map((cls: any) => {
                                        const classDate = new Date(cls.scheduledAt);
                                        const courseName = typeof cls.courseId === "object" && cls.courseId ? cls.courseId.title : "Course";
                                        const instructorName = typeof cls.instructorId === "object" && cls.instructorId ? cls.instructorId.name : "Instructor";
                                        const timeStatus = getTimeStatus(cls.scheduledAt);
                                        const isUpcoming = classDate > currentTime && cls.status === "Scheduled";

                                        return (
                                            <Card key={cls._id} className="hover:shadow-md transition-shadow">
                                                <CardBody className="p-2 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-center gap-1">
                                                                <h3 className="font-semibold text-sm truncate" title={cls.title}>{cls.title}</h3>
                                                                <Chip size="sm" variant="flat" color={isUpcoming ? "warning" : "success"} className="text-[10px]">
                                                                    {isUpcoming ? "Upcoming" : "Done"}
                                                                </Chip>
                                                            </div>
                                                            <p className="text-[11px] text-gray-600 truncate" title={courseName}>{courseName}</p>
                                                        </div>
                                                        <Chip size="sm" color="success" variant="flat" className="text-[11px]">
                                                            {cls.platform}
                                                        </Chip>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] text-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <FaCalendar className="text-primary text-[11px]" />
                                                            <span>{classDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FaClock className="text-primary text-[11px]" />
                                                            <span>{classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({cls.duration}m)</span>
                                                        </div>
                                                    </div>

                                                    {isUpcoming && (
                                                        <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded">
                                                            <div className="text-[11px] text-gray-600 mb-0.5 flex items-center gap-1">⏱️ <span>Time</span></div>
                                                            <Chip size="sm" variant="flat" color={timeStatus.color as any} className="font-bold text-[11px]">
                                                                {timeStatus.display}
                                                            </Chip>
                                                        </div>
                                                    )}

                                                    {!isUpcoming && cls.recordedLink && (
                                                        <div className="p-2 bg-green-50 border border-green-200 rounded text-[11px] space-y-1">
                                                            <p className="text-green-700 font-semibold">📹 Recording</p>
                                                            <a
                                                                href={cls.recordedLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:underline truncate block"
                                                            >
                                                                Watch
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-1">
                                                        {isUpcoming ? (
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                className="flex-1 text-[11px]"
                                                                startContent={<FaVideo className="text-[11px]" />}
                                                                onPress={() => window.open(cls.meetingLink, "_blank")}
                                                            >
                                                                Join
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                color="default"
                                                                size="sm"
                                                                className="flex-1 text-[11px]"
                                                                isDisabled
                                                            >
                                                                Done
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            className="text-[11px]"
                                                            onPress={() => {
                                                                const courseId = typeof cls.courseId === "object" && cls.courseId ? cls.courseId._id : cls.courseId;
                                                                if (courseId) {
                                                                    router.push(`/courses/${courseId}`);
                                                                }
                                                            }}
                                                        >
                                                            Course
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        isDisabled={currentPage === 1}
                                        onPress={() => setCurrentPage(currentPage - 1)}
                                        variant="flat"
                                        className="text-xs"
                                    >
                                        Prev
                                    </Button>

                                    <div className="flex flex-wrap items-center gap-1 justify-center">
                                        {pageNumbers.map((page, idx) =>
                                            typeof page === "number" ? (
                                                <Button
                                                    key={page}
                                                    isIconOnly
                                                    size="sm"
                                                    color={currentPage === page ? "primary" : "default"}
                                                    variant={currentPage === page ? "flat" : "light"}
                                                    className="h-8 w-8 text-xs"
                                                    onPress={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            ) : (
                                                <Button key={`${page}-${idx}`} size="sm" isDisabled variant="light" className="h-8 px-2 text-xxs">
                                                    ...
                                                </Button>
                                            )
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        isDisabled={currentPage === totalPages}
                                        onPress={() => setCurrentPage(currentPage + 1)}
                                        variant="flat"
                                        className="text-xs"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
}
