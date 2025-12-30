"use client";

import React, { useMemo } from "react";
import { Card, CardBody, CardHeader, Button, Progress, Chip, Avatar, Spinner, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { FaBook, FaCheckCircle, FaClock, FaTrophy, FaRocket, FaCalendar, FaShoppingCart } from "react-icons/fa";

export default function StudentDashboard() {
    const router = useRouter();
    const { data: ordersData, isLoading: ordersLoading } = useGetMyOrdersQuery();
    const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({ skip: 0, limit: 100 });

    const [user, setUser] = React.useState<any>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const coursesPerPage = 6;

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const orders = ordersData?.orders || [];
    const allCourses = coursesData?.data || coursesData?.courses || [];

    // Check if user has active quarterly (all access) subscription
    const hasAllAccess = useMemo(() => {
        const now = new Date();
        return orders.some(
            order =>
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive &&
                order.endDate &&
                new Date(order.endDate) > now
        );
    }, [orders]);

    // Get purchased courses
    const purchasedCourses = useMemo(() => {
        console.log('=== Course Access Debug ===');
        console.log('Has All Access:', hasAllAccess);
        console.log('All Courses:', allCourses);
        console.log('Orders:', orders);

        if (hasAllAccess) {
            // If has all access, return all published courses
            const filtered = allCourses.filter(course => course.isPublished && course.isAdminApproved);
            console.log('Premium Access - Showing all courses:', filtered.length);
            return filtered;
        } else {
            // Get specific courses from single purchases
            const approvedOrders = orders.filter(
                order =>
                    order.planType === "single" &&
                    order.paymentStatus === "approved" &&
                    order.isActive &&
                    order.courseId
            );

            console.log('Single Purchase Orders:', approvedOrders);

            if (approvedOrders.length === 0) {
                console.log('No approved single purchase orders');
                return [];
            }

            const courseIds = approvedOrders.map(order => {
                // Handle both object and string courseId
                const id = typeof order.courseId === 'object' ? order.courseId._id : order.courseId;
                console.log('Extracted course ID:', id);
                return id;
            });

            console.log('Looking for course IDs:', courseIds);

            // Only return courses that match the purchased course IDs
            const matched = allCourses.filter(course => {
                const matches = courseIds.includes(course._id) &&
                    course.isPublished &&
                    course.isAdminApproved;
                if (matches) {
                    console.log('Matched course:', course.title, course._id);
                }
                return matches;
            });

            console.log('Final matched courses:', matched.length);
            return matched;
        }
    }, [hasAllAccess, orders, allCourses]);

    // Get active subscription info
    const activeSubscription = useMemo(() => {
        if (!hasAllAccess) return null;

        const quarterlyOrder = orders.find(
            order =>
                order.planType === "quarterly" &&
                order.paymentStatus === "approved" &&
                order.isActive
        );

        if (!quarterlyOrder || !quarterlyOrder.endDate) return null;

        const now = new Date();
        const end = new Date(quarterlyOrder.endDate);
        const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            startDate: quarterlyOrder.startDate,
            endDate: quarterlyOrder.endDate,
            daysRemaining,
        };
    }, [hasAllAccess, orders]);

    // Pagination logic
    const totalPages = Math.ceil(purchasedCourses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const displayedCourses = purchasedCourses.slice(startIndex, endIndex);

    const stats = [
        { label: "Purchased Courses", value: purchasedCourses.length, color: "bg-blue-500", icon: <FaBook /> },
        { label: "Total Orders", value: orders.filter(o => o.paymentStatus === "approved").length, color: "bg-green-500", icon: <FaCheckCircle />, clickable: true, onClick: () => router.push("/student/orders") },
        { label: "Pending Orders", value: orders.filter(o => o.paymentStatus === "pending").length, color: "bg-orange-500", icon: <FaClock /> },
        { label: hasAllAccess ? "All Access" : "Single Access", value: hasAllAccess ? "✓" : purchasedCourses.length, color: hasAllAccess ? "bg-purple-500" : "bg-gray-500", icon: <FaTrophy /> },
    ];

    if (ordersLoading || coursesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center gap-6">
                        <Avatar
                            src={user?.img}
                            name={user?.name || user?.student_name || "Student"}
                            className="w-20 h-20 text-large"
                            isBordered
                            color="success"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, {user?.name || user?.student_name || "Student"}!</h1>
                            <p className="text-blue-100 mt-2">
                                {hasAllAccess ? "🎉 You have All Access to all courses!" : "Continue your learning journey"}
                            </p>
                            <div className="flex gap-2 mt-3">
                                <Chip color="warning" variant="flat">
                                    🎓 Student
                                </Chip>
                                {hasAllAccess && (
                                    <Chip color="success" variant="solid">
                                        ⭐ Premium Member
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 -mt-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            className={`shadow-md ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                            isPressable={stat.clickable}
                            onPress={stat.onClick}
                        >
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Subscription Info & Purchased Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Subscription Status */}
                        {activeSubscription && (
                            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">🎉 Premium All Access</h3>
                                            <p className="text-sm opacity-90 mb-1">
                                                Access to ALL courses until{" "}
                                                {new Date(activeSubscription.endDate).toLocaleDateString()}
                                            </p>
                                            <Chip color="warning" variant="solid" size="sm">
                                                {activeSubscription.daysRemaining} days remaining
                                            </Chip>
                                        </div>
                                        <div className="text-5xl">⭐</div>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {/* Purchased Courses */}
                        <Card>
                            <CardHeader className="flex justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {hasAllAccess ? "All Courses" : "My Purchased Courses"}
                                    </h2>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span>
                                            {purchasedCourses.length} course{purchasedCourses.length !== 1 ? "s" : ""} available
                                        </span>
                                        {hasAllAccess && <Chip size="sm" color="success" variant="flat">Premium</Chip>}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    onPress={() => router.push("/courses")}
                                    startContent={<FaRocket />}
                                >
                                    Explore More
                                </Button>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                {purchasedCourses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📚</div>
                                        {hasAllAccess ? (
                                            <>
                                                <p className="text-gray-600 mb-2 font-semibold">No courses available yet</p>
                                                <p className="text-sm text-gray-500 mb-6">
                                                    The platform is being set up. Check back soon for amazing courses!
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-600 mb-2 font-semibold">No courses purchased yet</p>
                                                <p className="text-sm text-gray-500 mb-6">
                                                    Start learning by purchasing your first course or get All Access subscription
                                                </p>
                                                <div className="flex gap-3 justify-center">
                                                    <Button color="primary" onPress={() => router.push("/courses")}>
                                                        Browse Courses
                                                    </Button>
                                                    <Button color="secondary" variant="flat" onPress={() => router.push("/checkout?plan=quarterly")}>
                                                        Get All Access
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                            {displayedCourses.map((course) => (
                                                <Card
                                                    key={course._id}
                                                    isPressable
                                                    onPress={() => router.push(`/courses/${course._id}`)}
                                                    className="hover:scale-[1.02] transition-all border border-divider hover:border-primary"
                                                >
                                                    <CardBody className="p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-base truncate mb-1">
                                                                    {course.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-xs text-default-500">
                                                                    <span>📚 {course.level || "Beginner"}</span>
                                                                    <span>•</span>
                                                                    <span className="truncate">
                                                                        {course.instructorId?.name || "Instructor"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-primary text-xl">
                                                                <FaRocket />
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between pt-4 border-t">
                                                <p className="text-sm text-gray-600">
                                                    Showing {startIndex + 1}-{Math.min(endIndex, purchasedCourses.length)} of {purchasedCourses.length}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        isDisabled={currentPage === 1}
                                                        onPress={() => setCurrentPage(currentPage - 1)}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                            <Button
                                                                key={page}
                                                                size="sm"
                                                                variant={currentPage === page ? "solid" : "flat"}
                                                                color={currentPage === page ? "primary" : "default"}
                                                                onPress={() => setCurrentPage(page)}
                                                            >
                                                                {page}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        isDisabled={currentPage === totalPages}
                                                        onPress={() => setCurrentPage(currentPage + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right Column - Quick Actions & Recent Orders */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Quick Actions</h3>
                            </CardHeader>
                            <CardBody className="grid grid-cols-2 gap-3">
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="primary"
                                    onPress={() => router.push("/profile")}
                                >
                                    <span className="text-2xl mb-1">👤</span>
                                    <span className="text-xs">My Profile</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="success"
                                    onPress={() => router.push("/courses")}
                                >
                                    <span className="text-2xl mb-1">📚</span>
                                    <span className="text-xs">All Courses</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="secondary"
                                    onPress={() => router.push("/student/orders")}
                                >
                                    <span className="text-2xl mb-1">📦</span>
                                    <span className="text-xs">My Orders</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="warning"
                                    onPress={() => router.push("/blog/create")}
                                >
                                    <span className="text-2xl mb-1">📝</span>
                                    <span className="text-xs">Write Blog</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="danger"
                                    onPress={() => router.push("/checkout?plan=quarterly")}
                                >
                                    <span className="text-2xl mb-1">⭐</span>
                                    <span className="text-xs">Get Premium</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="default"
                                    onPress={() => router.push("/student/blogs")}
                                >
                                    <span className="text-2xl mb-1">📄</span>
                                    <span className="text-xs">My Blogs</span>
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader className="flex justify-between items-center">
                                <h3 className="font-bold">Recent Orders</h3>
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={() => router.push("/student/orders")}
                                >
                                    View All
                                </Button>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                {orders.length === 0 ? (
                                    <div className="text-center py-6">
                                        <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No orders yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.slice(0, 3).map((order) => (
                                            <div key={order._id} className="border-b last:border-b-0 pb-3 last:pb-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">
                                                            {order.planType === "single" && order.courseId
                                                                ? order.courseId.title
                                                                : order.planType === "quarterly"
                                                                    ? "Quarterly All Access"
                                                                    : "Robotics Kit"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Chip
                                                        size="sm"
                                                        color={
                                                            order.paymentStatus === "approved"
                                                                ? "success"
                                                                : order.paymentStatus === "pending"
                                                                    ? "warning"
                                                                    : "danger"
                                                        }
                                                        variant="flat"
                                                    >
                                                        {order.paymentStatus}
                                                    </Chip>
                                                </div>
                                                <p className="text-sm font-semibold text-primary">
                                                    ৳{order.price.toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Call to Action */}
                        {!hasAllAccess && purchasedCourses.length > 0 && (
                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <CardBody className="text-center p-6">
                                    <div className="text-4xl mb-3">🚀</div>
                                    <h4 className="font-bold text-lg mb-2">Upgrade to Premium!</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Get unlimited access to ALL courses for only ৳9,999
                                    </p>
                                    <Button
                                        color="secondary"
                                        className="w-full"
                                        onPress={() => router.push("/checkout?plan=quarterly")}
                                    >
                                        Upgrade Now
                                    </Button>
                                </CardBody>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
