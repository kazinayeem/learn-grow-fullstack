"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Progress,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaChild,
    FaChartLine,
    FaTrophy,
    FaBell,
    FaCalendar,
    FaPlus,
    FaLink,
    FaUserCheck
} from "react-icons/fa";

export default function GuardianDashboard() {
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // State for mock children data
    const [children, setChildren] = useState([
        {
            id: "1",
            name: "Ayesha Khan",
            age: 12,
            studentId: "STU-2026-001",
            enrolledCourses: 3,
            averageProgress: 75,
            lastActive: "2 hours ago",
            upcomingClasses: 2,
        },
        {
            id: "2",
            name: "Rafi Ahmed",
            age: 10,
            studentId: "STU-2026-002",
            enrolledCourses: 2,
            averageProgress: 60,
            lastActive: "5 hours ago",
            upcomingClasses: 1,
        }
    ]);

    const [connectStep, setConnectStep] = useState(1); // 1: Search, 2: Confirm
    const [searchQuery, setSearchQuery] = useState("");
    const [foundStudent, setFoundStudent] = useState<any>(null);

    const notifications = [
        { message: "Ayesha completed Python Basics course", time: "1 day ago", type: "success" },
        { message: "Rafi has a live class tomorrow at 4 PM", time: "2 hours ago", type: "info" },
        { message: "Payment due for Web Development course", time: "3 days ago", type: "warning" },
    ];

    const handleSearchStudent = () => {
        // Mock search logic
        if (searchQuery.length > 3) {
            // Simulate finding a student
            setFoundStudent({
                id: Date.now().toString(),
                name: "New Student (Demo)",
                age: 11,
                studentId: searchQuery,
                enrolledCourses: 0,
                averageProgress: 0,
                lastActive: "Just now",
                upcomingClasses: 0
            });
            setConnectStep(2);
        } else {
            alert("Please enter a valid Student ID or Phone Number");
        }
    };

    const handleConnectStudent = (onClose: () => void) => {
        if (foundStudent) {
            setChildren([...children, foundStudent]);
            setConnectStep(1);
            setSearchQuery("");
            setFoundStudent(null);
            onClose();
            alert("Student connected successfully!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Guardian Dashboard 👨‍👩‍👧‍👦</h1>
                    <p className="text-gray-600">Monitor your children's learning progress</p>
                </div>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaLink />}
                    onPress={onOpen}
                    className="shadow-lg"
                >
                    Connect Child
                </Button>
            </div>

            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Children</p>
                                <p className="text-3xl font-bold mt-1">{children.length}</p>
                            </div>
                            <FaChild className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Courses</p>
                                <p className="text-3xl font-bold mt-1">
                                    {children.reduce((sum, child) => sum + child.enrolledCourses, 0)}
                                </p>
                            </div>
                            <FaChartLine className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg. Progress</p>
                                <p className="text-3xl font-bold mt-1">
                                    {children.length > 0 ? Math.round(children.reduce((sum, child) => sum + child.averageProgress, 0) / children.length) : 0}%
                                </p>
                            </div>
                            <FaTrophy className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Upcoming Classes</p>
                                <p className="text-3xl font-bold mt-1">
                                    {children.reduce((sum, child) => sum + child.upcomingClasses, 0)}
                                </p>
                            </div>
                            <FaCalendar className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Children Progress Cards */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Children's Progress</h2>
                {children.length === 0 ? (
                    <Card>
                        <CardBody className="p-8 text-center text-gray-500">
                            <FaChild className="text-6xl mx-auto mb-4 opacity-20" />
                            <p className="text-xl">No children connected yet.</p>
                            <Button variant="light" color="primary" onPress={onOpen} className="mt-2">
                                Connect your first child
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {children.map((child) => (
                            <Card key={child.id} className="hover:shadow-xl transition-shadow border border-gray-100">
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-xl mb-1">{child.name}</h3>
                                            <p className="text-sm text-gray-600">ID: {child.studentId} • Age: {child.age}</p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <FaChild className="text-2xl text-blue-600" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Enrolled Courses:</span>
                                            <span className="font-semibold">{child.enrolledCourses}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Last Active:</span>
                                            <span className="font-semibold text-green-600">{child.lastActive}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Upcoming Classes:</span>
                                            <span className="font-semibold text-orange-600">{child.upcomingClasses}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Average Progress</span>
                                            <span className="font-semibold text-primary">{child.averageProgress}%</span>
                                        </div>
                                        <Progress
                                            value={child.averageProgress}
                                            color={child.averageProgress > 70 ? "success" : "warning"}
                                            size="lg"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            color="primary"
                                            className="flex-1"
                                            onPress={() => router.push(`/guardian/child/${child.id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="bordered"
                                            onPress={() => router.push(`/guardian/child/${child.id}/schedule`)}
                                        >
                                            Schedule
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notifications */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Recent Updates</h2>
                    <Card>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                {notifications.map((notification, index) => (
                                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                                        <div className={`p-3 rounded-lg ${notification.type === "success" ? "bg-green-100" :
                                            notification.type === "info" ? "bg-blue-100" : "bg-orange-100"
                                            }`}>
                                            <FaBell className={`text-xl ${notification.type === "success" ? "text-green-600" :
                                                notification.type === "info" ? "text-blue-600" : "text-orange-600"
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{notification.message}</p>
                                            <p className="text-sm text-gray-500">{notification.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <Card>
                        <CardBody className="p-6 space-y-3">
                            <Button
                                color="primary"
                                className="w-full"
                                onPress={onOpen}
                                startContent={<FaPlus />}
                            >
                                Connect New Child
                            </Button>
                            <Button
                                variant="bordered"
                                className="w-full"
                                onPress={() => router.push("/guardian/payments")}
                            >
                                View Payments
                            </Button>
                            <Button
                                variant="bordered"
                                className="w-full"
                                onPress={() => router.push("/guardian/reports")}
                            >
                                Download Reports
                            </Button>
                            <Button
                                variant="bordered"
                                className="w-full"
                                onPress={() => router.push("/guardian/settings")}
                            >
                                Settings
                            </Button>
                        </CardBody>
                    </Card>

                    <Card className="mt-6 bg-blue-50">
                        <CardBody className="p-6">
                            <h3 className="font-bold mb-2">💡 Tip</h3>
                            <p className="text-sm text-gray-700">
                                Regular monitoring helps children stay motivated. Check their progress weekly!
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Connect Child Modal */}
            <Modal isOpen={isOpen} onOpenChange={(open) => {
                if (!open) {
                    setConnectStep(1);
                    setSearchQuery("");
                    setFoundStudent(null);
                }
                onOpenChange(open);
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {connectStep === 1 ? "Connect Student" : "Confirm Connection"}
                            </ModalHeader>
                            <ModalBody>
                                {connectStep === 1 ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">
                                            Enter the Student ID or registered Mobile Number of your child.
                                        </p>
                                        <Input
                                            autoFocus
                                            label="Student ID or Phone"
                                            placeholder="e.g. STU-2026-001 or 017..."
                                            variant="bordered"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <div className="p-4 bg-green-100 rounded-full">
                                            <FaUserCheck className="text-4xl text-green-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{foundStudent?.name}</p>
                                            <p className="text-gray-500">ID: {foundStudent?.studentId}</p>
                                            <p className="text-sm text-gray-400 mt-2">Is this your child?</p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                {connectStep === 1 ? (
                                    <Button color="primary" onPress={handleSearchStudent}>
                                        Search
                                    </Button>
                                ) : (
                                    <Button color="primary" onPress={() => handleConnectStudent(onClose)}>
                                        Confirm & Connect
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
