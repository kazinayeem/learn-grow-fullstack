"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Textarea,
    Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function CreateLiveClassPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        courseId: "",
        instructor: "",
        meetingLink: "",
        scheduledAt: "",
        duration: "60",
        maxParticipants: "100",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const liveClassData = {
            ...formData,
            id: `LC-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        console.log("Scheduling live class:", liveClassData);
        alert("Live class scheduled successfully! (Mock mode)");
        router.push("/admin");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <Button variant="light" onPress={() => router.push("/admin")} className="mb-6">
                ← Back to Admin
            </Button>

            <Card>
                <CardHeader className="flex-col items-start p-6">
                    <h1 className="text-2xl font-bold">Schedule Live Class</h1>
                    <p className="text-gray-600">Create a new live class session</p>
                </CardHeader>
                <CardBody className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Class Title"
                            placeholder="e.g., Introduction to React Hooks"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            isRequired
                            variant="bordered"
                        />

                        <Textarea
                            label="Description"
                            placeholder="What will be covered in this session..."
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            minRows={3}
                            isRequired
                            variant="bordered"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Course ID"
                                placeholder="e.g., SAMPLE"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                isRequired
                                variant="bordered"
                            />

                            <Input
                                label="Instructor Name"
                                placeholder="e.g., John Doe"
                                name="instructor"
                                value={formData.instructor}
                                onChange={handleChange}
                                isRequired
                                variant="bordered"
                            />
                        </div>

                        <Input
                            label="Meeting Link"
                            placeholder="https://meet.google.com/xxx or Zoom link"
                            name="meetingLink"
                            value={formData.meetingLink}
                            onChange={handleChange}
                            isRequired
                            variant="bordered"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                type="datetime-local"
                                label="Scheduled Date & Time"
                                name="scheduledAt"
                                value={formData.scheduledAt}
                                onChange={handleChange}
                                isRequired
                                variant="bordered"
                            />

                            <Input
                                type="number"
                                label="Duration (minutes)"
                                placeholder="60"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                isRequired
                                variant="bordered"
                            />

                            <Input
                                type="number"
                                label="Max Participants"
                                placeholder="100"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                variant="bordered"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" color="primary" size="lg" className="flex-1">
                                Schedule Live Class
                            </Button>
                            <Button type="button" variant="bordered" size="lg" onPress={() => router.push("/admin")}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
