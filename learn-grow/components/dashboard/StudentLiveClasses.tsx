"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Spinner, Chip, Avatar } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaVideo, FaClock, FaCalendar, FaUsers } from "react-icons/fa";
import { useGetUpcomingClassesQuery, useGetAllLiveClassesQuery } from "@/redux/api/liveClassApi";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";

export default function StudentLiveClasses() {
    const router = useRouter();
    const { data: classesData, isLoading: classesLoading } = useGetUpcomingClassesQuery(20);
    const { data: ordersData } = useGetMyOrdersQuery();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Update current time every second for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const orders = ordersData?.orders || [];
    const allClasses = classesData?.data || [];

    // Get the courses student has access to
    const accessibleCourseIds = useMemo(() => {
        const now = new Date();
        const courseIds = new Set<string>();

        orders.forEach((order: any) => {
            // Check quarterly all access (including lifetime)
            if (
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
            ) {
                // Has all access - will be handled separately
                return;
            }

            // Check single course purchases
            if (
                order.planType === "single" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.courseId &&
                (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
            ) {
                const courseId = typeof order.courseId === "object" ? order.courseId._id : order.courseId;
                courseIds.add(courseId);
            }

            // Check combo/bundle purchases
            if (
                order.planType === "combo" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.comboId &&
                (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
            ) {
                const combo = typeof order.comboId === "object" ? order.comboId : null;
                if (combo && combo.courses && Array.isArray(combo.courses)) {
                    combo.courses.forEach((course: any) => {
                        const courseId = typeof course === "object" ? course._id : course;
                        if (courseId) courseIds.add(courseId.toString());
                    });
                }
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
                (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
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

    // Filter for next 7 days
    const next7DaysClasses = useMemo(() => {
        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return accessibleClasses.filter((c: any) => {
            const classTime = new Date(c.scheduledAt);
            return classTime >= now && classTime <= sevenDaysLater && c.status === "Scheduled";
        }).sort((a: any, b: any) => {
            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        });
    }, [accessibleClasses]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(next7DaysClasses.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClasses = next7DaysClasses.slice(startIndex, startIndex + itemsPerPage);
    const displayStart = next7DaysClasses.length === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(startIndex + itemsPerPage, next7DaysClasses.length);

    // Reset page if out of bounds
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

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

    if (classesLoading) {
        return (
            <Card>
                <CardBody className="flex justify-center py-12">
                    <Spinner />
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg bg-gradient-to-br from-gray-50 to-white border-1 border-gray-200">
            <CardHeader className="flex justify-between items-center py-4 px-5 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FaVideo className="text-base text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-800">Upcoming Live Classes</h3>
                        <p className="text-xs text-gray-500">Next 7 Days</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {next7DaysClasses.length > 0 && (
                        <Chip size="sm" color="primary" variant="shadow" className="text-xs font-semibold">
                            {next7DaysClasses.length} class{next7DaysClasses.length !== 1 ? 'es' : ''}
                        </Chip>
                    )}
                    <Button
                        size="sm"
                        color="primary"
                        variant="shadow"
                        className="text-xs font-semibold"
                        onPress={() => router.push("/student/all-live-classes")}
                    >
                        View All
                    </Button>
                </div>
            </CardHeader>

            <CardBody className="space-y-3 py-4 px-5">
                {next7DaysClasses.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-lg bg-gradient-to-b from-gray-100 to-gray-50">
                        <div className="p-3 rounded-full bg-gray-300/20 w-fit mx-auto mb-3">
                            <FaVideo className="text-3xl text-gray-400 mx-auto" />
                        </div>
                        <p className="text-gray-700 font-semibold text-sm">No live classes scheduled</p>
                        <p className="text-xs text-gray-500 mt-1">Check back soon or view all classes</p>
                    </div>
                ) : (
                    <>
                        {paginatedClasses.map((cls: any) => {
                            const classDate = new Date(cls.scheduledAt);
                            const courseName = typeof cls.courseId === "object" ? cls.courseId.title : "Course";
                            const instructorName = typeof cls.instructorId === "object" ? cls.instructorId.name : "Instructor";
                            const timeStatus = getTimeStatus(cls.scheduledAt);

                            return (
                                <div key={cls._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-primary/30 transition-all duration-300 bg-white">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-800">{cls.title}</h4>
                                            <p className="text-xs text-gray-600 line-clamp-1">{courseName}</p>
                                        </div>
                                        <Chip size="sm" variant="shadow" color="success" className="text-xs whitespace-nowrap font-semibold">
                                            {cls.platform}
                                        </Chip>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                                        <div className="flex items-center gap-1.5">
                                            <FaCalendar className="text-xs text-blue-500" />
                                            <span className="text-xs font-medium">{classDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FaClock className="text-xs text-orange-500" />
                                            <span className="text-xs font-medium">{classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                    </div>

                                    {/* Countdown/Status Display */}
                                    <div className="mb-3">
                                        <Chip
                                            size="sm"
                                            variant="shadow"
                                            color={timeStatus.color as any}
                                            className="font-bold text-xs w-full justify-center py-1"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {timeStatus.status === "soon" && <div className="animate-pulse w-2 h-2 rounded-full bg-current"></div>}
                                                {timeStatus.status === "ended" ? "Class Over" : `${timeStatus.display}`}
                                            </div>
                                        </Chip>
                                    </div>

                                    <div className="flex gap-2">
                                        {timeStatus.status === "ended" ? (
                                            <Button
                                                size="sm"
                                                color="default"
                                                variant="flat"
                                                className="flex-1 text-xs font-semibold"
                                                isDisabled
                                            >
                                                Session Over
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                className="flex-1 text-xs font-semibold shadow-md"
                                                onPress={() => window.open(cls.meetingLink, "_blank")}
                                            >
                                                Join Now
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="text-xs font-semibold border-primary/20"
                                            onPress={() =>
                                                router.push(
                                                    `/courses/${typeof cls.courseId === "object" ? cls.courseId._id : cls.courseId}`
                                                )
                                            }
                                        >
                                            Course
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap justify-center items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
                                <Button
                                    size="sm"
                                    isDisabled={currentPage === 1}
                                    variant="flat"
                                    className="text-xs font-semibold px-3"
                                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                >
                                    ← Prev
                                </Button>

                                <div className="flex gap-1.5 flex-wrap justify-center">
                                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                        const startPage = Math.max(1, currentPage - 2);
                                        return startPage + i;
                                    }).map((page) => (
                                        <Button
                                            key={page}
                                            size="sm"
                                            color={currentPage === page ? "primary" : "default"}
                                            variant={currentPage === page ? "shadow" : "flat"}
                                            className="text-xs font-semibold px-2.5 min-w-fit"
                                            onPress={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    size="sm"
                                    isDisabled={currentPage === totalPages}
                                    variant="flat"
                                    className="text-xs font-semibold px-3"
                                    onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                >
                                    Next →
                                </Button>
                            </div>
                        )}

                        {/* Pagination Info */}
                        <div className="text-center text-xs text-gray-500 font-medium pt-2">
                            Showing {displayStart}-{displayEnd} of {next7DaysClasses.length} classes
                        </div>
                    </>
                )}
            </CardBody>
        </Card>
    );
}
