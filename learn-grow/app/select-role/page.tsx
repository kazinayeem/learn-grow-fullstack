"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { getDashboardUrl } from "@/lib/utils/dashboard";
import { FaUser, FaChalkboardTeacher, FaUserShield, FaUsers } from "react-icons/fa";

export default function RoleSelectorPage() {
    const router = useRouter();
    const [currentRole, setCurrentRole] = useState<string>("student");

    useEffect(() => {
        const role = localStorage.getItem("userRole") || "student";
        setCurrentRole(role);
    }, []);

    const selectRole = (role: string) => {
        localStorage.setItem("userRole", role);
        setCurrentRole(role);
        alert(`Role set to: ${role}\n\nNow when you click on your profile or dashboard links, you'll be redirected to the ${role} dashboard!`);
    };

    const goToDashboard = () => {
        const url = getDashboardUrl(currentRole);
        router.push(url);
    };

    const roles = [
        {
            id: "student",
            name: "Student",
            icon: <FaUser className="text-4xl" />,
            color: "primary",
            dashboard: "/dashboard",
            description: "Access student courses, progress, and certificates"
        },
        {
            id: "instructor",
            name: "Instructor",
            icon: <FaChalkboardTeacher className="text-4xl" />,
            color: "secondary",
            dashboard: "/instructor",
            description: "Manage courses, students, and analytics"
        },
        {
            id: "admin",
            name: "Administrator",
            icon: <FaUserShield className="text-4xl" />,
            color: "danger",
            dashboard: "/admin",
            description: "Full platform control and user management"
        },
        {
            id: "guardian",
            name: "Guardian/Parent",
            icon: <FaUsers className="text-4xl" />,
            color: "success",
            dashboard: "/guardian",
            description: "Monitor children's learning progress"
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-3">Select Your Role 🎭</h1>
                <p className="text-gray-600 mb-4">
                    Choose your role to test role-based dashboard redirect
                </p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">Current Role:</span>
                    <Chip color="primary" variant="flat" size="lg">
                        {currentRole.toUpperCase()}
                    </Chip>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {roles.map((role) => (
                    <Card
                        key={role.id}
                        isPressable
                        onPress={() => selectRole(role.id)}
                        className={`transition-all ${currentRole === role.id
                                ? "border-4 border-primary scale-105"
                                : "hover:scale-105"
                            }`}
                    >
                        <CardBody className="text-center p-6">
                            <div className={`mb-4 text-${role.color}`}>{role.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{role.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {role.dashboard}
                            </code>
                            {currentRole === role.id && (
                                <Chip color="success" size="sm" className="mt-3">
                                    ✓ Active
                                </Chip>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card className="bg-blue-50">
                <CardBody className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-lg mb-2">Test Dashboard Redirect</h3>
                            <p className="text-sm text-gray-700">
                                Current role: <strong>{currentRole}</strong>
                                <br />
                                Will redirect to: <code className="bg-white px-2 py-1 rounded text-primary">
                                    {getDashboardUrl(currentRole)}
                                </code>
                            </p>
                        </div>
                        <Button
                            color="primary"
                            size="lg"
                            onPress={goToDashboard}
                        >
                            Go to My Dashboard →
                        </Button>
                    </div>
                </CardBody>
            </Card>

            <div className="mt-8 space-y-4">
                <Card>
                    <CardBody className="p-6">
                        <h3 className="font-bold mb-3">📝 How to Fix Your Issue:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Select your role above (Admin, Instructor, Guardian, or Student)</li>
                            <li>Click "Go to My Dashboard" to verify it goes to the correct dashboard</li>
                            <li>Now go to your profile page - it should redirect to the correct dashboard too!</li>
                            <li>Update any navbar or profile links to use <code className="bg-gray-100 px-1">getDashboardUrl()</code></li>
                        </ol>
                    </CardBody>
                </Card>

                <Card className="border-2 border-orange-500">
                    <CardBody className="p-6">
                        <h3 className="font-bold text-orange-700 mb-3">⚠️ Important Notes:</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-orange-900">
                            <li>The role is stored in <code className="bg-orange-100 px-1">localStorage.getItem('userRole')</code></li>
                            <li>Make sure your authentication system sets this when user logs in</li>
                            <li>All dashboard links should use <code className="bg-orange-100 px-1">getDashboardUrl()</code> utility</li>
                            <li>The utility automatically reads the role from localStorage</li>
                        </ul>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
