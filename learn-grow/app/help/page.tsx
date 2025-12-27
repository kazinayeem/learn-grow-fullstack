"use client";
import React from "react";
import { Input, Card, CardBody } from "@nextui-org/react";
import { MdSearch, MdSchool, MdAccountCircle, MdPayment, MdSettings } from "react-icons/md";

export default function HelpPage() {
    const categories = [
        { title: "Courses & Learning", icon: <MdSchool />, desc: "Enrollment, progress, and certificates" },
        { title: "Account & Login", icon: <MdAccountCircle />, desc: "Password reset, profile settings" },
        { title: "Billing & Subscriptions", icon: <MdPayment />, desc: "Invoices, refunds, and pricing" },
        { title: "Technical Support", icon: <MdSettings />, desc: "Bugs, mobile app, and troubleshooting" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-primary-900 text-white py-20 px-6 text-center">
                <h1 className="text-4xl font-bold mb-6">How can we help you?</h1>
                <div className="max-w-2xl mx-auto">
                    <Input
                        startContent={<MdSearch className="text-2xl text-gray-400" />}
                        placeholder="Search for answers..."
                        size="lg"
                        classNames={{
                            inputWrapper: "bg-white text-gray-900"
                        }}
                    />
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <Card key={idx} isPressable className="hover:-translate-y-1 transition-transform">
                            <CardBody className="text-center py-8">
                                <div className="text-4xl text-primary mx-auto mb-4 bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center">
                                    {cat.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                                <p className="text-sm text-gray-500">{cat.desc}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                    <div className="grid gap-4">
                        {["How to reset my password?", "Where do I find my certificate?", "How to contact the instructor?", "App installation guide"].map((article, i) => (
                            <Card key={i} isHoverable isPressable>
                                <CardBody className="flex flex-row justify-between items-center p-4">
                                    <span className="font-medium text-gray-700">{article}</span>
                                    <span className="text-primary">Read &rarr;</span>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
