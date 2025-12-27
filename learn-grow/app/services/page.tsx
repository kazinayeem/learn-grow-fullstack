"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function ServicesPage() {
    const router = useRouter();

    const services = [
        {
            title: "Online Courses",
            description: "Self-paced courses with video lectures, quizzes, and certificates.",
            icon: "📚",
            features: ["100+ Courses", "Expert Instructors", "Lifetime Access", "Certificates"],
            color: "bg-blue-500"
        },
        {
            title: "Live Classes",
            description: "Interactive live sessions with instructors and real-time Q&A.",
            icon: "🎥",
            features: ["Interactive Learning", "Small Groups", "Recorded Sessions", "Direct Support"],
            color: "bg-purple-500"
        },
        {
            title: "Coding Bootcamps",
            description: "Intensive programs to master in-demand tech skills quickly.",
            icon: "💻",
            features: ["Job-Ready Skills", "Portfolio Projects", "Career Support", "Industry Mentors"],
            color: "bg-green-500"
        },
        {
            title: "Robotics Workshops",
            description: "Hands-on workshops to build and program real robots.",
            icon: "🤖",
            features: ["Arduino & Raspberry Pi", "Real Hardware", "Team Projects", "Competition Prep"],
            color: "bg-orange-500"
        },
        {
            title: "One-on-One Tutoring",
            description: "Personalized learning sessions tailored to your pace and goals.",
            icon: "👨‍🏫",
            features: ["Custom Curriculum", "Flexible Schedule", "Progress Tracking", "Dedicated Mentor"],
            color: "bg-pink-500"
        },
        {
            title: "Corporate Training",
            description: "Upskill your teams with customized training programs.",
            icon: "🏢",
            features: ["Custom Content", "Group Discounts", "Progress Reports", "Flexible Delivery"],
            color: "bg-teal-500"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div
                className="text-white py-20 px-6"
                style={{
                    background: 'linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)'
                }}
            >
                <div className="container mx-auto max-w-7xl text-center">
                    <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">Our Services</Chip>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Comprehensive Learning Solutions
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        From self-paced courses to intensive bootcamps, we offer flexible learning options for every student.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} className="shadow-lg hover:-translate-y-2 transition-transform duration-300">
                            <CardHeader className="flex-col items-start p-6 pb-0">
                                <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </CardHeader>
                            <CardBody className="pt-4">
                                <ul className="space-y-2 mb-6">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm">
                                            <span className="text-green-500 mr-2">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    color="primary"
                                    variant="flat"
                                    className="w-full"
                                    onPress={() => router.push("/contact")}
                                >
                                    Learn More
                                </Button>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* CTA Section */}
                <Card className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardBody className="p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Not sure which service is right for you?</h2>
                        <p className="text-xl mb-8 text-purple-100">
                            Our team can help you choose the perfect learning path.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                size="lg"
                                color="default"
                                variant="solid"
                                onPress={() => router.push("/contact")}
                            >
                                Contact Us
                            </Button>
                            <Button
                                size="lg"
                                variant="bordered"
                                className="border-white text-white"
                                onPress={() => router.push("/courses")}
                            >
                                Browse Courses
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
