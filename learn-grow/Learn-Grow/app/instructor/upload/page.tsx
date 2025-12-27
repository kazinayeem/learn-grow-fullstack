"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Select,
    SelectItem,
    Input,
    Textarea,
    Progress,
} from "@nextui-org/react";
import { FaUpload, FaFile, FaVideo, FaImage, FaFilePdf, FaCheckCircle } from "react-icons/fa";

export default function InstructorUploadPage() {
    const [selectedCourse, setSelectedCourse] = useState("");
    const [uploadType, setUploadType] = useState("video");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null as File | null,
    });

    const courses = [
        { id: "1", name: "Web Development Bootcamp" },
        { id: "2", name: "Python for Beginners" },
        { id: "3", name: "React Advanced" },
    ];

    const uploadTypes = [
        { value: "video", label: "Video Lecture", icon: <FaVideo /> },
        { value: "pdf", label: "PDF Document", icon: <FaFilePdf /> },
        { value: "image", label: "Image/Diagram", icon: <FaImage /> },
        { value: "file", label: "Other File", icon: <FaFile /> },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleUpload = async () => {
        if (!selectedCourse || !formData.title || !formData.file) {
            alert("Please fill in all fields and select a file");
            return;
        }

        setUploading(true);

        for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            setUploadProgress(i);
        }

        alert("Material uploaded successfully!");
        setUploading(false);
        setUploadProgress(0);
        setFormData({ title: "", description: "", file: null });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Upload Course Materials 📤</h1>
                <p className="text-gray-600">Add videos, documents, and resources to your courses</p>
            </div>

            <Card>
                <CardBody className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Select Course *</label>
                            <Select
                                placeholder="Choose a course"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                size="lg"
                            >
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Material Type *</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {uploadTypes.map((type) => (
                                    <Card
                                        key={type.value}
                                        isPressable
                                        onPress={() => setUploadType(type.value)}
                                        className={`transition-all ${uploadType === type.value
                                                ? "border-2 border-primary scale-105"
                                                : "border-2 border-transparent"
                                            }`}
                                    >
                                        <CardBody className="p-4 text-center">
                                            <div className="text-3xl mb-2">{type.icon}</div>
                                            <p className="text-sm font-medium">{type.label}</p>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Material Title"
                            placeholder="e.g., Introduction to React Hooks"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            size="lg"
                            isRequired
                        />

                        <Textarea
                            label="Description (Optional)"
                            placeholder="Describe what this material covers..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            minRows={4}
                        />

                        <div>
                            <label className="block text-sm font-semibold mb-2">Upload File *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept={
                                        uploadType === "video"
                                            ? "video/*"
                                            : uploadType === "pdf"
                                                ? ".pdf"
                                                : uploadType === "image"
                                                    ? "image/*"
                                                    : "*"
                                    }
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {formData.file ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <FaCheckCircle className="text-green-500 text-2xl" />
                                            <div>
                                                <p className="font-semibold">{formData.file.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                                            <p className="font-semibold mb-1">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500">
                                                {uploadType === "video" && "MP4, MOV, AVI (max 500MB)"}
                                                {uploadType === "pdf" && "PDF files only"}
                                                {uploadType === "image" && "JPG, PNG, GIF (max 10MB)"}
                                                {uploadType === "file" && "Any file type"}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {uploading && (
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Uploading...</span>
                                    <span className="font-semibold">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} color="primary" size="lg" />
                            </div>
                        )}

                        <Button
                            color="primary"
                            size="lg"
                            className="w-full"
                            startContent={<FaUpload />}
                            onPress={handleUpload}
                            isLoading={uploading}
                            isDisabled={!selectedCourse || !formData.title || !formData.file}
                        >
                            {uploading ? "Uploading..." : "Upload Material"}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            <Card className="mt-8 bg-blue-50">
                <CardBody className="p-6">
                    <h3 className="font-bold text-lg mb-3">Upload Guidelines 📋</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Videos should be in MP4 format for best compatibility (max 500MB)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Use clear, descriptive titles for easy navigation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>PDFs should be optimized and text-searchable when possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Images should be high quality but compressed (max 10MB)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Ensure all materials are original or properly licensed</span>
                        </li>
                    </ul>
                </CardBody>
            </Card>
        </div>
    );
}
