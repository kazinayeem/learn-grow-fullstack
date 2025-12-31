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
    
    const itemsPerPage = 100;

    // Update current time every second for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const { data: classesData, isLoading: classesLoading } = useGetAllLiveClassesQuery({ skip: 0, limit: 1000 });
    const { data: ordersData } = useGetMyOrdersQuery();

    const orders = ordersData?.orders || [];
    const allClasses = classesData?.data || [];

    // Get the courses student has access to
    const accessibleCourseIds = useMemo(() => {
        const now = new Date();
        const courseIds = new Set<string>();

        orders.forEach((order: any) => {
            // Check quarterly all access
            if (
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.endDate &&
                new Date(order.endDate) > now
            ) {
                // Has all access - will be handled separately
                return;
            }

            // Check single course purchases
            if (
                order.planType === "single" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.courseId
            ) {
                const courseId = typeof order.courseId === "object" ? order.courseId._id : order.courseId;
                courseIds.add(courseId);
            }
        });

        return courseIds;
    }, [orders]);

    // Check if user has all access
    const hasAllAccess = useMemo(() => {
        const now = new Date();
        return orders.some(
            (order: any) =>
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.endDate &&
                new Date(order.endDate) > now
        );
    }, [orders]);

    // Filter classes by accessible courses
    const accessibleClasses = useMemo(() => {
        if (hasAllAccess) {
            return allClasses;
        }

        return allClasses.filter((cls: any) => {
            const courseId = typeof cls.courseId === "object" ? cls.courseId._id : cls.courseId;
            return accessibleCourseIds.has(courseId);
        });
    }, [allClasses, hasAllAccess, accessibleCourseIds]);

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
            (typeof cls.courseId === "object" ? cls.courseId.title : "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort by scheduled date (newest first)
    filteredClasses = filteredClasses.sort((a: any, b: any) => {
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
    });

    // Pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

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
                                                <p className="text-xl font-bold">{filteredClasses.length}</p>
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
                                                {Math.min(startIndex + 1, filteredClasses.length)}-{Math.min(endIndex, filteredClasses.length)} of {filteredClasses.length}
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
                                <div className="space-y-2">
                                    {paginatedClasses.map((cls: any) => {
                                        const classDate = new Date(cls.scheduledAt);
                                        const courseName = typeof cls.courseId === "object" ? cls.courseId.title : "Course";
                                        const instructorName = typeof cls.instructorId === "object" ? cls.instructorId.name : "Instructor";
                                        const timeStatus = getTimeStatus(cls.scheduledAt);
                                        const isUpcoming = classDate > currentTime && cls.status === "Scheduled";

                                        return (
                                            <Card key={cls._id} className="hover:shadow-lg transition-shadow">
                                                <CardBody className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-1 mb-0.5">
                                                                <h3 className="font-bold text-sm">{cls.title}</h3>
                                                                <Chip
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color={isUpcoming ? "warning" : "success"}
                                                                    className="text-xs"
                                                                >
                                                                    {isUpcoming ? "Upcoming" : "Done"}
                                                                </Chip>
                                                            </div>
                                                            <p className="text-xs text-gray-600">{courseName}</p>
                                                        </div>
                                                        <Chip size="sm" color="success" variant="flat" className="text-xs">
                                                            {cls.platform}
                                                        </Chip>
                                                    </div>

                                                    <Divider className="my-1.5" />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <FaCalendar className="text-primary text-xs" />
                                                                <span>{classDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <FaClock className="text-primary text-xs" />
                                                                <span>
                                                                    {classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({cls.duration}m)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isUpcoming && (
                                                            <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 rounded">
                                                                <p className="text-xs text-gray-600 mb-0.5">⏱️ Time</p>
                                                                <Chip
                                                                    size="sm"
                                                                    variant="flat"
                                                                    color={timeStatus.color as any}
                                                                    className="font-bold text-xs"
                                                                >
                                                                    {timeStatus.display}
                                                                </Chip>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {instructorName && (
                                                        <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                                                            <p className="text-gray-500 mb-0.5">Instructor</p>
                                                            <p className="font-semibold">{instructorName}</p>
                                                        </div>
                                                    )}

                                                    {!isUpcoming && cls.recordedLink && (
                                                        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                                            <p className="text-green-700 font-semibold mb-1">📹 Recording Available</p>
                                                            <a
                                                                href={cls.recordedLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:underline text-xs truncate block"
                                                            >
                                                                Watch Recording
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-1">
                                                        {isUpcoming ? (
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                className="flex-1 text-xs"
                                                                startContent={<FaVideo className="text-xs" />}
                                                                onPress={() => window.open(cls.meetingLink, "_blank")}
                                                            >
                                                                Join
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                color="default"
                                                                size="sm"
                                                                className="flex-1 text-xs"
                                                                isDisabled
                                                            >
                                                                Done
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            className="text-xs"
                                                            onPress={() =>
                                                                router.push(
                                                                    `/courses/${typeof cls.courseId === "object" ? cls.courseId._id : cls.courseId}`
                                                                )
                                                            }
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
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        isDisabled={currentPage === 1}
                                        onPress={() => setCurrentPage(currentPage - 1)}
                                        variant="flat"
                                        className="text-xs"
                                    >
                                        Prev
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                            if (totalPages <= 10) return i + 1;
                                            if (i < 5) return i + 1;
                                            if (i === 5) return "...";
                                            return totalPages - (10 - i - 1);
                                        }).map((page, idx) => (
                                            typeof page === "number" ? (
                                                <Button
                                                    key={page}
                                                    isIconOnly
                                                    size="sm"
                                                    color={currentPage === page ? "primary" : "default"}
                                                    variant={currentPage === page ? "flat" : "light"}
                                                    className="h-7 w-7 text-xs"
                                                    onPress={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            ) : (
                                                <span key={idx} className="text-xs px-1">...</span>
                                            )
                                        ))}
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
