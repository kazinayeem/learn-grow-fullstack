"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader, Button, Spinner, Chip, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaVideo, FaClock, FaCalendar, FaArrowLeft } from "react-icons/fa";
import { useGetAllLiveClassesQuery } from "@/redux/api/liveClassApi";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import RequireAuth from "@/components/Auth/RequireAuth";

export default function StudentLiveClassesPage() {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = React.useState(false);

    React.useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || (require("js-cookie")).default.get("accessToken") : null;
        setIsAuthed(!!token);
    }, []);

    const { data: classesData, isLoading: classesLoading } = useGetAllLiveClassesQuery({ skip: 0, limit: 100 }, { skip: !isAuthed });
    const { data: ordersData } = useGetMyOrdersQuery(undefined, { skip: !isAuthed });

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

    const upcomingClasses = accessibleClasses.filter((c: any) => {
        const classTime = new Date(c.scheduledAt);
        return classTime > new Date() && c.status === "Scheduled";
    });

    const pastClasses = accessibleClasses.filter((c: any) => {
        const classTime = new Date(c.scheduledAt);
        return classTime <= new Date() || c.status === "Completed";
    });

    if (!isAuthed) {
        return (
            <RequireAuth allowedRoles={["student"]}>
                <div className="flex justify-center items-center min-h-screen">
                    <Spinner size="lg" label="Checking authentication..." />
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth allowedRoles={["student"]}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                isIconOnly
                                variant="light"
                                className="text-white"
                                onPress={() => router.push("/student")}
                            >
                                <FaArrowLeft />
                            </Button>
                            <h1 className="text-3xl font-bold">Live Classes</h1>
                        </div>
                        <p className="text-blue-100">Join live sessions with your instructors</p>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto max-w-7xl px-6 py-8">
                    {classesLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Upcoming Classes */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaVideo className="text-lg text-primary" />
                                    <h2 className="text-2xl font-bold">Upcoming Classes ({upcomingClasses.length})</h2>
                                </div>

                                {upcomingClasses.length === 0 ? (
                                    <Card>
                                        <CardBody className="text-center py-12">
                                            <FaVideo className="text-5xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600 font-medium text-lg">No upcoming live classes</p>
                                            <p className="text-gray-500 mt-2">Check back soon for scheduled sessions from your instructors</p>
                                            <Button
                                                color="primary"
                                                className="mt-6"
                                                onPress={() => router.push("/courses")}
                                            >
                                                Browse Courses
                                            </Button>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {upcomingClasses.map((cls: any) => {
                                            const classDate = new Date(cls.scheduledAt);
                                            const courseName = typeof cls.courseId === "object" ? cls.courseId.title : "Course";
                                            const instructorName =
                                                typeof cls.instructorId === "object" ? cls.instructorId.name : "Instructor";

                                            return (
                                                <Card key={cls._id} className="hover:shadow-lg transition-shadow">
                                                    <CardBody className="p-6">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-lg mb-1">{cls.title}</h3>
                                                                <p className="text-sm text-gray-600">{courseName}</p>
                                                            </div>
                                                            <Chip size="sm" color="success" variant="flat">
                                                                {cls.platform}
                                                            </Chip>
                                                        </div>

                                                        <Divider className="my-3" />

                                                        <div className="space-y-2 text-sm mb-4">
                                                            <div className="flex items-center gap-3 text-gray-700">
                                                                <FaCalendar className="text-primary w-4" />
                                                                <span>{classDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-gray-700">
                                                                <FaClock className="text-primary w-4" />
                                                                <span>
                                                                    {classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({cls.duration} mins)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {instructorName && (
                                                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-xs text-gray-500 mb-1">Instructor</p>
                                                                <p className="font-semibold text-sm">{instructorName}</p>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <Button
                                                                color="primary"
                                                                className="flex-1"
                                                                startContent={<FaVideo />}
                                                                onPress={() => window.open(cls.meetingLink, "_blank")}
                                                            >
                                                                Join Now
                                                            </Button>
                                                            <Button
                                                                variant="flat"
                                                                onPress={() =>
                                                                    router.push(
                                                                        `/courses/${
                                                                            typeof cls.courseId === "object" ? cls.courseId._id : cls.courseId
                                                                        }`
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
                            </div>

                            {/* Past Classes */}
                            {pastClasses.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaCalendar className="text-lg text-gray-600" />
                                        <h2 className="text-2xl font-bold">Past Classes ({pastClasses.length})</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {pastClasses.map((cls: any) => {
                                            const classDate = new Date(cls.scheduledAt);
                                            const courseName = typeof cls.courseId === "object" ? cls.courseId.title : "Course";

                                            return (
                                                <Card key={cls._id}>
                                                    <CardBody className="p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold">{cls.title}</h3>
                                                                    <Chip
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color={cls.status === "Completed" ? "success" : "default"}
                                                                    >
                                                                        {cls.status}
                                                                    </Chip>
                                                                </div>
                                                                <p className="text-sm text-gray-600">{courseName}</p>
                                                            </div>
                                                            <div className="text-right text-sm">
                                                                <p className="font-medium">
                                                                    {classDate.toLocaleDateString()}
                                                                </p>
                                                                <p className="text-gray-600 text-xs">
                                                                    {classDate.toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
}
