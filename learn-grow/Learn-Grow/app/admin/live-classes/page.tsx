"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Input, Chip } from "@nextui-org/react";
import { FaVideo, FaClock, FaCalendar, FaUsers, FaCheckCircle, FaBan, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AdminLiveClassesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const [classes, setClasses] = useState([
        {
            id: "1",
            title: "React Hooks Deep Dive",
            course: "Web Development Bootcamp",
            instructor: "Jane Smith",
            date: "2026-12-15",
            time: "18:00",
            duration: "90",
            platform: "zoom",
            status: "scheduled",
            participants: 45,
            maxParticipants: 50,
        },
        {
            id: "2",
            title: "Python Data Structures",
            course: "Python for Beginners",
            instructor: "John Doe",
            date: "2026-12-16",
            time: "19:00",
            duration: "60",
            platform: "meet",
            status: "scheduled",
            participants: 32,
            maxParticipants: 40,
        },
        {
            id: "3",
            title: "Q&A Session - Web Dev",
            course: "Web Development Bootcamp",
            instructor: "Jane Smith",
            date: "2026-12-12",
            time: "17:00",
            duration: "45",
            platform: "zoom",
            status: "completed",
            participants: 38,
            maxParticipants: 50,
        },
    ]);

    const filteredClasses = classes.filter((cls) =>
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleApprove = (id: string) => {
        alert("Class approved!");
    };

    const handleCancel = (id: string, title: string) => {
        if (confirm(`Cancel class: "${title}"?`)) {
            setClasses(classes.map((c) => c.id === id ? { ...c, status: "cancelled" } : c));
            alert("Class cancelled!");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "primary";
            case "completed":
                return "success";
            case "cancelled":
                return "danger";
            default:
                return "default";
        }
    };

    const stats = {
        total: classes.length,
        scheduled: classes.filter((c) => c.status === "scheduled").length,
        completed: classes.filter((c) => c.status === "completed").length,
        totalParticipants: classes.reduce((sum, c) => sum + c.participants, 0),
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Live Classes Management 🎥</h1>
                    <p className="text-gray-600">Monitor and manage all platform live classes</p>
                </div>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaPlus />}
                    onPress={() => router.push("/admin/live-classes/create")}
                >
                    Schedule Class
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Classes</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <FaVideo className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Scheduled</p>
                                <p className="text-3xl font-bold mt-1">{stats.scheduled}</p>
                            </div>
                            <FaCalendar className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Completed</p>
                                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
                            </div>
                            <FaCheckCircle className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Participants</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalParticipants}</p>
                            </div>
                            <FaUsers className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-6">
                <Input
                    placeholder="Search classes by title, course, or instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="lg"
                    startContent={<FaVideo />}
                />
            </div>

            {/* Classes List */}
            <div className="space-y-4">
                {filteredClasses.map((cls) => (
                    <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                        <CardBody className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-xl">{cls.title}</h3>
                                        <Chip color={getStatusColor(cls.status) as any} size="sm" variant="flat">
                                            {cls.status.toUpperCase()}
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            {cls.platform === "zoom" ? "Zoom" : "Google Meet"}
                                        </Chip>
                                    </div>
                                    <p className="text-gray-600 mb-1">Course: {cls.course}</p>
                                    <p className="text-sm text-gray-500">Instructor: {cls.instructor}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Date & Time</p>
                                        <p className="font-semibold">{new Date(cls.date).toLocaleDateString()}</p>
                                        <p className="text-sm">{cls.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="text-xl font-bold">{cls.duration}m</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Participants</p>
                                        <p className="text-xl font-bold">
                                            {cls.participants}/{cls.maxParticipants}
                                        </p>
                                    </div>
                                </div>

                                {cls.status === "scheduled" && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            color="success"
                                            variant="bordered"
                                            startContent={<FaCheckCircle />}
                                            onPress={() => handleApprove(cls.id)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="bordered"
                                            startContent={<FaBan />}
                                            onPress={() => handleCancel(cls.id, cls.title)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
