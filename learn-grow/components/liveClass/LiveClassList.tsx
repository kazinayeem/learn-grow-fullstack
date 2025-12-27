"use client";

import React from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
} from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { recordAttendance } from "@/redux/slices/liveClassSlice";

interface LiveClassListProps {
    courseId: string;
}

export default function LiveClassList({ courseId }: LiveClassListProps) {
    const dispatch = useDispatch();
    const classes = useSelector((state: RootState) =>
        state.liveClass.classes.filter((c) => c.courseId === courseId)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "live":
                return "success";
            case "scheduled":
                return "primary";
            case "completed":
                return "default";
            case "cancelled":
                return "danger";
            default:
                return "default";
        }
    };

    const handleJoinClass = (classItem: any) => {
        // Record attendance
        const attendance = {
            id: `ATT-${Date.now()}`,
            classId: classItem.id,
            userId: localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!)._id
                : "guest",
            joinedAt: new Date().toISOString(),
        };
        dispatch(recordAttendance(attendance));

        // Open meeting link
        window.open(classItem.meetingLink, "_blank");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isUpcoming = (scheduledAt: string) => {
        return new Date(scheduledAt) > new Date();
    };

    if (classes.length === 0) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-default-500">No live classes scheduled for this course yet.</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {classes.map((classItem) => (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{classItem.title}</h3>
                            <p className="text-sm text-default-600">{classItem.description}</p>
                        </div>
                        <Chip
                            color={getStatusColor(classItem.status)}
                            variant="flat"
                            className="ml-4"
                        >
                            {classItem.status.toUpperCase()}
                        </Chip>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-default-500">Instructor</p>
                                <p className="font-semibold">👨‍🏫 {classItem.instructor}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Platform</p>
                                <p className="font-semibold capitalize">
                                    {classItem.platform === "zoom" && "📹 Zoom"}
                                    {classItem.platform === "google-meet" && "📞 Google Meet"}
                                    {classItem.platform === "teams" && "💼 MS Teams"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Scheduled</p>
                                <p className="font-semibold">🕒 {formatDate(classItem.scheduledAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Duration</p>
                                <p className="font-semibold">⏱️ {classItem.duration} minutes</p>
                            </div>
                        </div>

                        {classItem.meetingId && (
                            <div className="bg-default-100 p-3 rounded-lg mb-4">
                                <p className="text-xs text-default-500">Meeting ID</p>
                                <p className="font-mono font-semibold">{classItem.meetingId}</p>
                                {classItem.password && (
                                    <>
                                        <p className="text-xs text-default-500 mt-2">Password</p>
                                        <p className="font-mono font-semibold">{classItem.password}</p>
                                    </>
                                )}
                            </div>
                        )}

                        <Divider className="my-4" />

                        <div className="flex justify-between items-center">
                            {classItem.status === "completed" && classItem.recordingUrl ? (
                                <Button
                                    color="secondary"
                                    variant="flat"
                                    onPress={() => window.open(classItem.recordingUrl, "_blank")}
                                    startContent={<span>📼</span>}
                                >
                                    Watch Recording
                                </Button>
                            ) : classItem.status === "live" ? (
                                <Button
                                    color="success"
                                    size="lg"
                                    onPress={() => handleJoinClass(classItem)}
                                    className="animate-pulse"
                                    startContent={<span>🔴</span>}
                                >
                                    Join Live Class
                                </Button>
                            ) : classItem.status === "scheduled" && isUpcoming(classItem.scheduledAt) ? (
                                <Button
                                    color="primary"
                                    onPress={() => handleJoinClass(classItem)}
                                    startContent={<span>📅</span>}
                                >
                                    Join Class
                                </Button>
                            ) : (
                                <Chip color="default" variant="flat">
                                    {classItem.status === "cancelled" ? "Cancelled" : "Ended"}
                                </Chip>
                            )}
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
