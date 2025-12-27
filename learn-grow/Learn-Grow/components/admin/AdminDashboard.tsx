"use client";

import React, { useState } from "react";
import {
    Tabs,
    Tab,
    Card,
    CardHeader,
    Button,
} from "@nextui-org/react";
import { PlusIcon } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [selected, setSelected] = useState("overview");
    const router = useRouter();

    return (
        <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Manage all aspects of your platform
                    </p>
                </div>
            </div>

            <Tabs
                aria-label="Admin Options"
                selectedKey={selected}
                onSelectionChange={(key) => setSelected(key as string)}
                color="primary"
                variant="underlined"
                size="lg"
                className="mb-6"
            >
                <Tab key="overview" title="📊 Overview">
                    <OverviewTab />
                </Tab>
                <Tab key="users" title="👥 Users">
                    <UsersTab />
                </Tab>
                <Tab key="courses" title="📚 Courses">
                    <CoursesTab />
                </Tab>
                <Tab key="quizzes" title="📝 Quizzes">
                    <QuizzesTab />
                </Tab>
                <Tab key="live-classes" title="🎥 Live Classes">
                    <LiveClassesTab />
                </Tab>
                <Tab key="content" title="📄 Pages">
                    <ContentTab />
                </Tab>
            </Tabs>
        </div>
    );
}

function OverviewTab() {
    const router = useRouter();

    const stats = [
        { label: "Total Users", value: "0", color: "bg-blue-500", link: "/admin" },
        { label: "Total Courses", value: "3", color: "bg-green-500", link: "/admin" },
        { label: "Active Quizzes", value: "2", color: "bg-purple-500", link: "/admin" },
        { label: "Live Classes", value: "0", color: "bg-orange-500", link: "/admin" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} isPressable onPress={() => router.push(stat.link)}>
                    <CardHeader className="flex-col items-start p-6">
                        <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                            <span className="text-white text-2xl font-bold">{stat.value}</span>
                        </div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

function UsersTab() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex justify-between p-6">
                <h3 className="text-xl font-bold">User Management</h3>
                <Button
                    color="primary"
                    startContent={<PlusIcon />}
                    onPress={() => router.push("/admin/users/create")}
                >
                    Add User
                </Button>
            </CardHeader>
        </Card>
    );
}

function CoursesTab() {
    const router = useRouter();
    const [courseData, setCourseData] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Import courses data
        import("@/lib/coursesData").then((module) => {
            setCourseData(module.courses);
        });
    }, []);

    return (
        <Card>
            <CardHeader className="flex justify-between p-6">
                <div>
                    <h3 className="text-xl font-bold">Course Management</h3>
                    <p className="text-gray-600 text-sm mt-1">
                        {courseData.length} courses available
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        color="secondary"
                        variant="bordered"
                        onPress={() => router.push("/admin/courses")}
                    >
                        Manage All Courses
                    </Button>
                    <Button
                        color="primary"
                        startContent={<PlusIcon />}
                        onPress={() => router.push("/admin/courses/create")}
                    >
                        Create Course
                    </Button>
                </div>
            </CardHeader>
            {/* Course List Preview */}
            <div className="px-6 pb-6 space-y-3">
                {courseData.slice(0, 3).map((course) => (
                    <Card
                        key={course.id}
                        isPressable
                        onPress={() => router.push("/admin/courses")}
                        className="bg-gray-50 hover:bg-gray-100"
                    >
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{course.icon}</span>
                                <div>
                                    <p className="font-semibold">{course.en.title}</p>
                                    <p className="text-sm text-gray-600">
                                        {course.category} • {course.duration} • {course.ageRange}
                                    </p>
                                </div>
                            </div>
                            <span className="text-gray-400">→</span>
                        </div>
                    </Card>
                ))}
                {courseData.length > 3 && (
                    <Button
                        variant="light"
                        className="w-full"
                        onPress={() => router.push("/admin/courses")}
                    >
                        View All {courseData.length} Courses →
                    </Button>
                )}
            </div>
        </Card>
    );
}

function QuizzesTab() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex justify-between p-6">
                <h3 className="text-xl font-bold">Quiz Management</h3>
                <Button
                    color="primary"
                    startContent={<PlusIcon />}
                    onPress={() => router.push("/admin/quizzes/create")}
                >
                    Create Quiz
                </Button>
            </CardHeader>
        </Card>
    );
}

function LiveClassesTab() {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex justify-between p-6">
                <h3 className="text-xl font-bold">Live Class Management</h3>
                <Button
                    color="primary"
                    startContent={<PlusIcon />}
                    onPress={() => router.push("/admin/live-classes/create")}
                >
                    Schedule Live Class
                </Button>
            </CardHeader>
        </Card>
    );
}

function ContentTab() {
    const router = useRouter();

    const pages = [
        { name: "About Us", path: "/about" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact", path: "/contact" },
        { name: "Careers", path: "/careers" },
        { name: "Press & Media", path: "/press" },
    ];

    return (
        <Card>
            <CardHeader className="flex-col items-start p-6">
                <h3 className="text-xl font-bold mb-4">Website Pages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {pages.map((page) => (
                        <Button
                            key={page.path}
                            variant="bordered"
                            className="justify-between"
                            endContent={<span>Edit →</span>}
                            onPress={() => router.push(`/admin/pages${page.path}`)}
                        >
                            {page.name}
                        </Button>
                    ))}
                </div>
            </CardHeader>
        </Card>
    );
}
