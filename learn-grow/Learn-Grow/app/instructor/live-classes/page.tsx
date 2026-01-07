"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    CardFooter,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Select,
    SelectItem,
    Textarea,
    Chip,
} from "@nextui-org/react";
import { FaPlus, FaVideo, FaClock, FaCalendar, FaUsers, FaTrash } from "react-icons/fa";

export default function InstructorLiveClassesPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [classes, setClasses] = useState([
        {
            id: "1",
            title: "React Hooks Deep Dive",
            course: "Web Development Bootcamp",
            date: "2026-12-15",
            time: "18:00",
            duration: "90",
            platform: "zoom",
            status: "scheduled",
            participants: 45,
            meetingLink: "https://zoom.us/j/123456789",
        },
        {
            id: "2",
            title: "Q&A Session",
            course: "Web Development Bootcamp",
            date: "2026-12-12",
            time: "17:00",
            duration: "45",
            platform: "zoom",
            status: "completed",
            participants: 38,
            meetingLink: "https://zoom.us/j/987654321",
        },
    ]);

    const [newClass, setNewClass] = useState({
        title: "",
        course: "",
        date: "",
        time: "",
        duration: "60",
        platform: "zoom",
        meetingLink: "",
    });

    const handleScheduleClass = () => {
        if (!newClass.title || !newClass.course || !newClass.date || !newClass.time || !newClass.meetingLink) {
            alert("Please fill in all required fields including meeting link");
            return;
        }

        const classData = {
            id: Date.now().toString(),
            ...newClass,
            status: "scheduled",
            participants: 0,
        };

        setClasses([classData, ...classes]);
        setNewClass({
            title: "",
            course: "",
            date: "",
            time: "",
            duration: "60",
            platform: "zoom",
            meetingLink: "",
        });
        onClose();
        alert("Live class scheduled successfully!");
    };

    const handleDelete = (id: string) => {
        if (confirm("Cancel this class?")) {
            setClasses(classes.filter((c) => c.id !== id));
            alert("Class cancelled");
        }
    };

    const getStatusColor = (status: string) => {
        return status === "scheduled" ? "primary" : "default";
    };

    const upcomingClasses = classes.filter((c) => c.status === "scheduled");
    const completedClasses = classes.filter((c) => c.status === "completed");

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Live Classes 🎥</h1>
                    <p className="text-gray-600">Schedule and manage live sessions with your students</p>
                </div>
                <Button
                    color="primary"
                    size="lg"
                    startContent={<FaPlus />}
                    onPress={onOpen}
                >
                    Schedule New Class
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaCalendar className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Upcoming Classes</p>
                                <p className="text-3xl font-bold">{upcomingClasses.length}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaVideo className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold">{completedClasses.length}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaUsers className="text-2xl text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Attendees</p>
                                <p className="text-3xl font-bold">
                                    {classes.reduce((sum, c) => sum + c.participants, 0)}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Upcoming Classes */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Upcoming Classes</h2>
                {upcomingClasses.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <FaVideo className="text-4xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No upcoming classes scheduled</p>
                            <Button color="primary" className="mt-4" onPress={onOpen}>
                                Schedule Your First Class
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingClasses.map((classItem) => (
                            <Card key={classItem.id} className="hover:shadow-xl transition-shadow">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <Chip color={getStatusColor(classItem.status) as any} size="sm" variant="flat">
                                            {classItem.status.toUpperCase()}
                                        </Chip>
                                        <Chip size="sm" variant="flat">
                                            {classItem.platform === "zoom" ? "Zoom" : "Google Meet"}
                                        </Chip>
                                    </div>

                                    <h3 className="font-bold text-xl mb-2 line-clamp-2">{classItem.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{classItem.course}</p>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaCalendar />
                                            <span>{new Date(classItem.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaClock />
                                            <span>{classItem.time} ({classItem.duration} mins)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FaUsers />
                                            <span>{classItem.participants} registered</span>
                                        </div>
                                    </div>
                                </CardBody>

                                <CardFooter className="p-6 pt-0 flex gap-2">
                                    <Button
                                        color="primary"
                                        className="flex-1"
                                        startContent={<FaVideo />}
                                        onPress={() => window.open(classItem.meetingLink, "_blank")}
                                    >
                                        Start Class
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="bordered"
                                        isIconOnly
                                        onPress={() => handleDelete(classItem.id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Classes */}
            {completedClasses.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Previous Classes</h2>
                    <div className="space-y-3">
                        {completedClasses.map((classItem) => (
                            <Card key={classItem.id}>
                                <CardBody className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{classItem.title}</h3>
                                            <p className="text-sm text-gray-600">{classItem.course}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p>{new Date(classItem.date).toLocaleDateString()}</p>
                                            <p className="text-gray-600">{classItem.participants} attended</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Schedule Live Class</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Class Title"
                                        placeholder="e.g., Introduction to React Hooks"
                                        value={newClass.title}
                                        onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                                        isRequired
                                    />

                                    <Select
                                        label="Course"
                                        placeholder="Select a course"
                                        selectedKeys={newClass.course ? [newClass.course] : []}
                                        onSelectionChange={(keys) => setNewClass({ ...newClass, course: Array.from(keys)[0] as string })}
                                        isRequired
                                    >
                                        <SelectItem key="Web Development Bootcamp" value="Web Development Bootcamp">Web Development Bootcamp</SelectItem>
                                        <SelectItem key="Python for Beginners" value="Python for Beginners">Python for Beginners</SelectItem>
                                        <SelectItem key="React Advanced" value="React Advanced">React Advanced</SelectItem>
                                        <SelectItem key="Digital Marketing Masterclass" value="Digital Marketing Masterclass">Digital Marketing Masterclass</SelectItem>
                                    </Select>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="date"
                                            label="Date"
                                            value={newClass.date}
                                            onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                                            isRequired
                                        />
                                        <Input
                                            type="time"
                                            label="Time"
                                            value={newClass.time}
                                            onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                                            isRequired
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Duration (minutes)"
                                            selectedKeys={[newClass.duration]}
                                            onSelectionChange={(keys) => setNewClass({ ...newClass, duration: Array.from(keys)[0] as string })}
                                        >
                                            <SelectItem key="30" value="30">30 minutes</SelectItem>
                                            <SelectItem key="45" value="45">45 minutes</SelectItem>
                                            <SelectItem key="60" value="60">1 hour</SelectItem>
                                            <SelectItem key="90" value="90">1.5 hours</SelectItem>
                                            <SelectItem key="120" value="120">2 hours</SelectItem>
                                        </Select>

                                        <Select
                                            label="Platform"
                                            selectedKeys={[newClass.platform]}
                                            onSelectionChange={(keys) => setNewClass({ ...newClass, platform: Array.from(keys)[0] as string })}
                                        >
                                            <SelectItem key="zoom" value="zoom">Zoom</SelectItem>
                                            <SelectItem key="meet" value="meet">Google Meet</SelectItem>
                                        </Select>
                                    </div>

                                    <Input
                                        label={`${newClass.platform === "zoom" ? "Zoom" : "Google Meet"} Meeting Link`}
                                        placeholder={newClass.platform === "zoom" ? "https://zoom.us/j/123456789" : "https://meet.google.com/abc-defg-hij"}
                                        value={newClass.meetingLink}
                                        onChange={(e) => setNewClass({ ...newClass, meetingLink: e.target.value })}
                                        description={newClass.platform === "zoom" ? "Enter your Zoom meeting URL or ID" : "Enter your Google Meet link"}
                                        isRequired
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleScheduleClass}>
                                    Schedule Class
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
