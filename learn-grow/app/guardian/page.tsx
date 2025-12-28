"use client";

import React, { useState, useEffect } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import { getProfile } from "@/lib/auth";
import {
    Card,
    CardBody,
    Button,
    Progress,
    Spinner,
    Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    FaChild,
} from "react-icons/fa";

function GuardianDashboardContent() {
    const router = useRouter();
    const [guardian, setGuardian] = useState<any>(null);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGuardianProfile();
    }, []);

    const loadGuardianProfile = async () => {
        try {
            setLoading(true);
            const result = await getProfile();
            
            if (result.success && result.data) {
                const user = result.data.user;
                setGuardian(user);
                
                // Load linked student from relations
                const linkedStudent = result.data.relations?.student;
                if (linkedStudent) {
                    setStudent({
                        id: linkedStudent._id,
                        name: linkedStudent.name,
                        email: linkedStudent.email,
                        phone: linkedStudent.phone,
                        role: linkedStudent.role,
                        isVerified: linkedStudent.isVerified,
                    });
                } else {
                    toast.info("No student linked to your account yet.");
                }
            }
        } catch (error: any) {
            console.error("Failed to load profile:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const studentStats = student ? {
        courses: 0,
        progress: Math.floor(Math.random() * 100),
        upcomingClasses: 0,
        lastActive: "Just now",
    } : null;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading guardian profile..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Guardian Dashboard 👨‍👩‍👧</h1>
                <p className="text-gray-600">Welcome, {guardian?.name || "Guardian"}. Monitor your student's progress.</p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Linked Student Info */}
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardBody className="p-8">
                            {student ? (
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                                                <p className="text-gray-600 text-sm">Student ID: {student.id.substring(0, 8)}...</p>
                                            </div>
                                            <div className="p-4 bg-blue-100 rounded-full">
                                                <FaChild className="text-4xl text-blue-600" />
                                            </div>
                                        </div>
                                        <Divider className="my-4" />
                                    </div>

                                    {/* Student Contact Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Email</p>
                                            <p className="font-semibold text-gray-900">{student.email || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                                            <p className="font-semibold text-gray-900">{student.phone || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Status</p>
                                            <p className={`font-semibold ${student.isVerified ? "text-green-600" : "text-orange-600"}`}>
                                                {student.isVerified ? "Verified" : "Pending Verification"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Role</p>
                                            <p className="font-semibold text-gray-900 capitalize">{student.role}</p>
                                        </div>
                                    </div>

                                    <Divider />

                                    {/* Student Statistics */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">Enrolled Courses</p>
                                            <p className="text-2xl font-bold text-blue-600">{studentStats?.courses || 0}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">Progress</p>
                                            <p className="text-2xl font-bold text-green-600">{studentStats?.progress || 0}%</p>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">Upcoming Classes</p>
                                            <p className="text-2xl font-bold text-orange-600">{studentStats?.upcomingClasses || 0}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                            <span className="text-sm font-bold text-primary">{studentStats?.progress || 0}%</span>
                                        </div>
                                        <Progress
                                            value={studentStats?.progress || 0}
                                            color={(studentStats?.progress || 0) > 70 ? "success" : "warning"}
                                            size="lg"
                                        />
                                    </div>

                                    <Divider />

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            color="primary"
                                            onPress={() => router.push(`/guardian/student/${student.id}`)}
                                        >
                                            View Full Profile
                                        </Button>
                                        <Button
                                            variant="bordered"
                                            onPress={() => router.push("/guardian/settings")}
                                        >
                                            Account Settings
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaChild className="text-6xl mx-auto mb-4 opacity-20" />
                                    <p className="text-xl font-semibold text-gray-700 mb-2">No Student Linked</p>
                                    <p className="text-gray-600 mb-4">Your auto-created student should appear here.</p>
                                    <p className="text-sm text-gray-500">If you don't see a student linked, please contact support.</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Right Column: Quick Stats & Info */}
                <div className="space-y-6">
                    {/* Guardian Account Info */}
                    <Card className="shadow-lg">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-lg mb-4">Your Account</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Name</p>
                                    <p className="font-semibold text-gray-900">{guardian?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Email</p>
                                    <p className="font-semibold text-gray-900 text-sm break-all">{guardian?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                                    <p className="font-semibold text-gray-900">{guardian?.phone || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Status</p>
                                    <p className={`font-semibold text-sm ${guardian?.isVerified ? "text-green-600" : "text-orange-600"}`}>
                                        {guardian?.isVerified ? "Verified" : "Pending Verification"}
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="shadow-lg">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button
                                    fullWidth
                                    variant="light"
                                    className="justify-start"
                                    onPress={() => router.push("/guardian/payments")}
                                >
                                    💳 View Payments
                                </Button>
                                <Button
                                    fullWidth
                                    variant="light"
                                    className="justify-start"
                                    onPress={() => router.push("/guardian/reports")}
                                >
                                    📊 Download Reports
                                </Button>
                                <Button
                                    fullWidth
                                    variant="light"
                                    className="justify-start"
                                    onPress={() => router.push("/guardian/settings")}
                                >
                                    ⚙️ Settings
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-blue-50 border border-blue-200">
                        <CardBody className="p-6">
                            <h3 className="font-bold text-blue-900 mb-2">ℹ️ 1:1 Relationship</h3>
                            <p className="text-sm text-blue-800">
                                Each guardian account is linked to exactly one student. Your student was auto-created during registration.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function GuardianDashboard() {
    return (
        <RequireAuth allowedRoles={["guardian"]}>
            <GuardianDashboardContent />
        </RequireAuth>
    );
}
