"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Switch,
    Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaBriefcase, FaSave } from "react-icons/fa";

export default function CreateJobPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        type: "Full-time",
        department: "",
        salaryRange: "",
        description: "",
        requirements: "",
        isRemote: false,
        isActive: true,
    });

    const jobTypes = [
        { label: "Full-time", value: "Full-time" },
        { label: "Part-time", value: "Part-time" },
        { label: "Contract", value: "Contract" },
        { label: "Internship", value: "Internship" },
        { label: "Freelance", value: "Freelance" },
    ];

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Job data:", formData);
        setIsLoading(false);
        router.push("/admin/jobs");
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push("/admin")}
                className="mb-4"
            >
                Back to Jobs
            </Button>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <FaBriefcase className="text-primary" /> Post New Job
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="px-6 pt-6 pb-0">
                            <h3 className="text-xl font-bold">Job Details</h3>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            <Input
                                label="Job Title"
                                placeholder="e.g. Senior Software Engineer"
                                variant="bordered"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                isRequired
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Job Type"
                                    placeholder="Select a type"
                                    variant="bordered"
                                    selectedKeys={[formData.type]}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {jobTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    label="Department"
                                    placeholder="e.g. Engineering"
                                    variant="bordered"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Location"
                                    placeholder="e.g. Dhaka, Bangladesh"
                                    variant="bordered"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    isDisabled={formData.isRemote}
                                />
                                <Input
                                    label="Salary Range (Optional)"
                                    placeholder="e.g. 50k - 80k BDT"
                                    variant="bordered"
                                    value={formData.salaryRange}
                                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                                />
                            </div>

                            <Textarea
                                label="Job Description"
                                placeholder="Describe the role and responsibilities..."
                                variant="bordered"
                                minRows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                isRequired
                            />

                            <Textarea
                                label="Requirements"
                                placeholder="List skills and qualifications..."
                                variant="bordered"
                                minRows={6}
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            />
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="px-6 pt-6 pb-0">
                            <h3 className="text-lg font-bold">Settings</h3>
                        </CardHeader>
                        <CardBody className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Remote Position</p>
                                    <p className="text-xs text-gray-500">Is this a fully remote role?</p>
                                </div>
                                <Switch
                                    isSelected={formData.isRemote}
                                    onValueChange={(val) => setFormData({ ...formData, isRemote: val, location: val ? "Remote" : "" })}
                                />
                            </div>
                            <Divider />
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Publish Immediately</p>
                                    <p className="text-xs text-gray-500">Make job visible to applicants</p>
                                </div>
                                <Switch
                                    isSelected={formData.isActive}
                                    onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                                    color="success"
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Button
                        color="primary"
                        size="lg"
                        className="w-full font-bold shadow-lg"
                        startContent={<FaSave />}
                        isLoading={isLoading}
                        onPress={handleSave}
                    >
                        Post Job
                    </Button>
                </div>
            </div>
        </div>
    );
}
