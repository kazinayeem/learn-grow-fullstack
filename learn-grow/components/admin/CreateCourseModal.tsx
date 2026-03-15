"use client";

import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
} from "@nextui-org/react";
import { useCreateCourseMutation } from "@/redux/api/courseApi";

interface CreateCourseModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
}

export default function CreateCourseModal({ isOpen, onOpenChange }: CreateCourseModalProps) {
    const [createCourse, { isLoading }] = useCreateCourseMutation();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        level: "Beginner",
        img: "",
        category: "65685d0d8269781845686868", // Default ID or fetch categories if available
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectionChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (onClose: () => void) => {
        try {
            await createCourse({
                ...formData,
                price: Number(formData.price), // Ensure price is a number
            }).unwrap();
            alert("Course created successfully!");
            onClose();
            // Reset form
            setFormData({
                title: "",
                description: "",
                price: "",
                level: "Beginner",
                img: "",
                category: "65685d0d8269781845686868",
            });
        } catch (error) {
            alert("Failed to create course");
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Add New Course</ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    autoFocus
                                    label="Course Title"
                                    placeholder="Enter course title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                />
                                <Input
                                    label="Price"
                                    placeholder="0.00"
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">$</span>
                                        </div>
                                    }
                                    variant="bordered"
                                />
                                <Select
                                    label="Level"
                                    placeholder="Select level"
                                    selectedKeys={[formData.level]}
                                    onChange={(e) => handleSelectionChange("level", e.target.value)}
                                    variant="bordered"
                                >
                                    <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                                    <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
                                </Select>
                                <Input
                                    label="Image URL"
                                    placeholder="https://..."
                                    name="img"
                                    value={formData.img}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                />
                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Description"
                                        placeholder="Enter course description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        variant="bordered"
                                        minRows={3}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={isLoading}>
                                Create Course
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
