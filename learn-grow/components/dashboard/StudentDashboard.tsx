"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Progress, Chip, Avatar } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export default function StudentDashboard() {
    const router = useRouter();
    const enrolledCourses = useSelector((state: RootState) => state.enrollment.enrolledCourses);

    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const sampleCourses = [
        {
            _id: "1",
            title: "Robotics for Beginners",
            description: "Learn to build and program your first robot.",
            img: "https://images.unsplash.com/photo-1535378433864-ed1c29cee23d?q=80&w=1000&auto=format&fit=crop"
        },
        {
            _id: "2",
            title: "Web Development Bootcamp",
            description: "Master HTML, CSS, and JavaScript from scratch.",
            img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
        }
    ];

    const enrolledCoursesWithDetails = enrolledCourses.map(enrollment => ({
        ...enrollment,
        course: sampleCourses.find(c => c._id === enrollment.courseId) || {
            _id: enrollment.courseId,
            title: "Course",
            description: "Course description"
        }
    }));

    const stats = [
        { label: "Courses Enrolled", value: enrolledCourses.length, color: "bg-blue-500", icon: "📚" },
        { label: "Completed", value: enrolledCourses.filter(c => c.completed).length, color: "bg-green-500", icon: "✅" },
        { label: "In Progress", value: enrolledCourses.filter(c => !c.completed).length, color: "bg-orange-500", icon: "📖" },
        { label: "Quizzes Taken", value: 0, color: "bg-purple-500", icon: "📝" },
    ];

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
                            <p className="text-blue-100 mt-2">Continue your learning journey</p>
                            <Chip className="mt-2" color="warning" variant="flat">
                                🎓 Student
                            </Chip>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 -mt-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="shadow-md">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
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
                    {/* Left Column - My Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex justify-between">
                                <h2 className="text-xl font-bold">My Courses</h2>
                                <Button
                                    size="sm"
                                    color="primary"
                                    variant="flat"
                                    onPress={() => router.push("/courses")}
                                >
                                    Browse All
                                </Button>
                            </CardHeader>
                            <CardBody>
                                {enrolledCoursesWithDetails.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📚</div>
                                        <p className="text-gray-600 mb-6">No courses enrolled yet</p>
                                        <Button color="primary" onPress={() => router.push("/courses")}>
                                            Explore Courses
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {enrolledCoursesWithDetails.map(({ course, progress, completed }) => (
                                            <Card
                                                key={course._id}
                                                isPressable
                                                onPress={() => router.push(`/courses/${course._id}`)}
                                                className="hover:shadow-md transition-shadow"
                                            >
                                                <CardBody className="flex flex-row gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-bold">{course.title}</h3>
                                                            {completed && (
                                                                <Chip color="success" size="sm" variant="flat">
                                                                    ✓ Completed
                                                                </Chip>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span>Progress</span>
                                                                <span className="font-semibold">{progress}%</span>
                                                            </div>
                                                            <Progress value={progress} color={completed ? "success" : "primary"} size="sm" />
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right Column - Quick Actions & Upcoming */}
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
                                    <span className="text-xs">Courses</span>
                                </Button>
                                <Button
                                    className="h-20 flex-col"
                                    variant="flat"
                                    color="secondary"
                                >
                                    <span className="text-2xl mb-1">🎥</span>
                                    <span className="text-xs">Live Classes</span>
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
                                    color="secondary"
                                    onPress={() => router.push("/student/blogs")}
                                >
                                    <span className="text-2xl mb-1">📄</span>
                                    <span className="text-xs">My Blogs</span>
                                </Button>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Upcoming Live Classes</h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                {/* Mock Live Classes linked to enrolled courses */}
                                {[
                                    {
                                        id: "lc-1",
                                        title: "Intro to React Hooks",
                                        course: "Web Development Bootcamp",
                                        time: "Today, 6:00 PM",
                                        platform: "Zoom"
                                    },
                                    {
                                        id: "lc-2",
                                        title: "Python Data Structures",
                                        course: "Python for Beginners",
                                        time: "Tomorrow, 4:00 PM",
                                        platform: "Google Meet"
                                    }
                                ].map((cls) => (
                                    <div key={cls.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                                        <p className="font-semibold text-sm line-clamp-1">{cls.title}</p>
                                        <p className="text-xs text-gray-500 mb-2">{cls.course} • {cls.time}</p>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            className="w-full"
                                            variant="flat"
                                        >
                                            Join {cls.platform}
                                        </Button>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
