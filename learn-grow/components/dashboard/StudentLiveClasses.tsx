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

    const upcomingClasses = accessibleClasses.filter((c: any) => 
        c.status === "Scheduled"
    );

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
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FaVideo className="text-lg text-primary" />
                    <h3 className="font-bold">Upcoming Live Classes</h3>
                </div>
                <div className="flex items-center gap-2">
                    {upcomingClasses.length > 0 && (
                        <Chip size="sm" color="primary" variant="flat">
                            {upcomingClasses.length} upcoming
                        </Chip>
                    )}
                    <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => router.push("/student/all-live-classes")}
                    >
                        View All Classes
                    </Button>
                </div>
            </CardHeader>

            <CardBody className="space-y-3">
                {upcomingClasses.length === 0 ? (
                    <div className="text-center py-8">
                        <FaVideo className="text-4xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No live classes scheduled yet</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Your instructors will schedule classes here
                        </p>
                    </div>
                ) : (
                    <>
                        {upcomingClasses.slice(0, 5).map((cls: any) => {
                            const classDate = new Date(cls.scheduledAt);
                            const courseName = typeof cls.courseId === "object" ? cls.courseId.title : "Course";
                            const instructorName = typeof cls.instructorId === "object" ? cls.instructorId.name : "Instructor";
                            const timeStatus = getTimeStatus(cls.scheduledAt);

                            return (
                                <div key={cls._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm mb-1">{cls.title}</h4>
                                            <p className="text-xs text-gray-600">{courseName}</p>
                                        </div>
                                        <Chip size="sm" variant="flat" color="success">
                                            {cls.platform}
                                        </Chip>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <FaCalendar className="text-primary" />
                                            <span>{classDate.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaClock className="text-primary" />
                                            <span>{classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                    </div>

                                    {/* Countdown/Status Display */}
                                    <div className="mb-3 p-2 rounded-lg bg-gray-100">
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={timeStatus.color as any}
                                            className="font-bold"
                                        >
                                            {timeStatus.status === "ended" ? "⏰ Over" : `⏱️ ${timeStatus.display}`}
                                        </Chip>
                                    </div>

                                    <div className="flex gap-2">
                                        {timeStatus.status === "ended" ? (
                                            <Button
                                                size="sm"
                                                color="default"
                                                className="flex-1"
                                                isDisabled
                                            >
                                                Class Over
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                color="primary"
                                                className="flex-1"
                                                startContent={<FaVideo />}
                                                onPress={() => window.open(cls.meetingLink, "_blank")}
                                            >
                                                Join Class
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="flat"
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
                    </>
                )}
            </CardBody>
        </Card>
    );
}
