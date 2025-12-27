"use client";

import React from "react";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaCertificate, FaDownload, FaShare, FaCheck } from "react-icons/fa";

export default function CertificatesPage() {
    const enrolledCourses = useSelector((state: RootState) => state.enrollment.enrolledCourses);

    // Get completed courses (eligible for certificates)
    const completedCourses = enrolledCourses.filter((c: any) => c.progress === 100);

    const handleDownload = (courseId: string, courseName: string) => {
        // Mock download function
        alert(`Downloading certificate for: ${courseName}`);
        // In production, this would generate/download a PDF certificate
    };

    const handleShare = (courseId: string, courseName: string) => {
        // Mock share function
        if (navigator.share) {
            navigator.share({
                title: `Certificate - ${courseName}`,
                text: `I completed ${courseName} on Learn & Grow!`,
                url: window.location.href,
            });
        } else {
            alert("Certificate sharing coming soon!");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Certificates 🎓</h1>
                <p className="text-gray-600">Download and share your course completion certificates</p>
            </div>

            {/* Statistics */}
            <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600">
                <CardBody className="p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Total Certificates Earned</h2>
                            <p className="text-white/90">Keep completing courses to earn more!</p>
                        </div>
                        <div className="text-6xl font-bold">{completedCourses.length}</div>
                    </div>
                </CardBody>
            </Card>

            {/* Certificates Grid */}
            {completedCourses.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-16">
                        <FaCertificate className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No Certificates Yet</h3>
                        <p className="text-gray-500 mb-6">
                            Complete courses to earn certificates and showcase your achievements!
                        </p>
                        <Button
                            color="primary"
                            size="lg"
                            onPress={() => window.location.href = "/dashboard/my-courses"}
                        >
                            Go to My Courses
                        </Button>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course: any) => (
                        <Card
                            key={course.courseId}
                            className="hover:shadow-xl transition-all hover:scale-105"
                        >
                            <CardBody className="p-6">
                                {/* Certificate Badge */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                                            <FaCertificate className="text-5xl text-white" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                                            <FaCheck className="text-white text-xl" />
                                        </div>
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="text-center mb-4">
                                    <Chip color="success" size="sm" variant="flat" className="mb-2">
                                        Completed
                                    </Chip>
                                    <h3 className="font-bold text-lg mb-1 line-clamp-2">
                                        {course.courseName || `Course ${course.courseId}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Completed: {new Date(course.enrolledAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Certificate Details */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Certificate ID:</span>
                                        <span className="font-mono font-semibold">
                                            {`CERT-${course.courseId.slice(0, 8).toUpperCase()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Progress:</span>
                                        <span className="font-semibold text-green-600">100%</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        color="primary"
                                        className="flex-1"
                                        startContent={<FaDownload />}
                                        onPress={() => handleDownload(course.courseId, course.courseName)}
                                    >
                                        Download
                                    </Button>
                                    <Button
                                        color="secondary"
                                        variant="bordered"
                                        isIconOnly
                                        onPress={() => handleShare(course.courseId, course.courseName)}
                                    >
                                        <FaShare />
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info Section */}
            <Card className="mt-8">
                <CardBody className="p-6">
                    <h3 className="font-bold text-lg mb-3">About Certificates</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                            <span>Certificates are automatically generated when you complete 100% of a course</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                            <span>Download certificates as PDF to share on LinkedIn or your resume</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                            <span>Each certificate has a unique verification ID</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                            <span>Certificates are permanently stored in your account</span>
                        </li>
                    </ul>
                </CardBody>
            </Card>
        </div>
    );
}
