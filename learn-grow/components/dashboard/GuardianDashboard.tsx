"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Avatar, Chip, Progress } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function GuardianDashboard() {
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Mock data for children/students
    const children = [
        {
            id: "1",
            name: "Ahmed Khan",
            grade: "Class 8",
            enrolledCourses: 2,
            progress: 65,
            img: "https://i.pravatar.cc/150?u=child1"
        },
        {
            id: "2",
            name: "Fatima Khan",
            grade: "Class 5",
            enrolledCourses: 1,
            progress: 80,
            img: "https://i.pravatar.cc/150?u=child2"
        }
    ];

    const stats = [
        { label: "Total Children", value: children.length, color: "bg-blue-500", icon: "👨‍👩‍👧" },
        { label: "Active Courses", value: 3, color: "bg-green-500", icon: "📚" },
        { label: "Upcoming Classes", value: 2, color: "bg-orange-500", icon: "🎥" },
        { label: "Pending Payments", value: 0, color: "bg-purple-500", icon: "💳" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center gap-6">
                        <Avatar
                            src={user?.img}
                            name={user?.guardian_name || user?.name || "Guardian"}
                            className="w-20 h-20 text-large"
                            isBordered
                            color="success"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">Welcome, {user?.guardian_name || user?.name || "Guardian"}!</h1>
                            <p className="text-green-100 mt-2">Monitor your children's learning progress</p>
                            <Chip className="mt-2" color="success" variant="flat">
                                👨‍👩‍👧 Guardian/Parent
                            </Chip>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 -mt-8">
                {/* Stats */}
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Children Progress */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex justify-between">
                                <h2 className="text-xl font-bold">My Children</h2>
                                <Button size="sm" color="primary" variant="flat">
                                    Add Child
                                </Button>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                {children.map((child) => (
                                    <Card key={child.id} className="bg-gray-50">
                                        <CardBody>
                                            <div className="flex items-center gap-4 mb-4">
                                                <Avatar src={child.img} name={child.name} size="lg" />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">{child.name}</h3>
                                                    <p className="text-sm text-gray-600">{child.grade}</p>
                                                </div>
                                                <Button size="sm" variant="bordered">
                                                    View Details
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="bg-white p-3 rounded-lg">
                                                    <p className="text-xs text-gray-600">Enrolled Courses</p>
                                                    <p className="text-xl font-bold text-primary">{child.enrolledCourses}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg">
                                                    <p className="text-xs text-gray-600">Avg. Progress</p>
                                                    <p className="text-xl font-bold text-success">{child.progress}%</p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Overall Progress</span>
                                                    <span className="font-semibold">{child.progress}%</span>
                                                </div>
                                                <Progress value={child.progress} color="success" size="sm" />
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </CardBody>
                        </Card>

                        {/* Payment History */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Payment History</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No payment history
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Quick Actions</h3>
                            </CardHeader>
                            <CardBody className="grid grid-cols-2 gap-3">
                                <Button className="h-20 flex-col" variant="flat" color="primary" onPress={() => router.push("/profile")}>
                                    <span className="text-2xl mb-1">👤</span>
                                    <span className="text-xs">My Profile</span>
                                </Button>
                                <Button className="h-20 flex-col" variant="flat" color="success" onPress={() => router.push("/courses")}>
                                    <span className="text-2xl mb-1">📚</span>
                                    <span className="text-xs">Browse Courses</span>
                                </Button>
                                <Button className="h-20 flex-col" variant="flat" color="warning">
                                    <span className="text-2xl mb-1">💳</span>
                                    <span className="text-xs">Payments</span>
                                </Button>
                                <Button className="h-20 flex-col" variant="flat" color="secondary">
                                    <span className="text-2xl mb-1">📊</span>
                                    <span className="text-xs">Reports</span>
                                </Button>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Upcoming Events</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-blue-600 font-semibold">Tomorrow, 4:00 PM</p>
                                        <p className="text-sm font-medium mt-1">Parent-Teacher Meeting</p>
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <p className="text-xs text-purple-600 font-semibold">Dec 15, 2026</p>
                                        <p className="text-sm font-medium mt-1">Progress Report Available</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-bold">Announcements</h3>
                            </CardHeader>
                            <CardBody>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>• New robotics course launching soon!</p>
                                    <p>• Holiday schedule updated</p>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
