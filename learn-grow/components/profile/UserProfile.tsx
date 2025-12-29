"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Avatar,
    Divider,
    Chip,
    Textarea,
    Progress,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";
import { FiCamera, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export default function UserProfile() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profilePhoto, setProfilePhoto] = useState<string>("");

    const userRole = user?.role || "student";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
        expertise: "",
        qualification: "",
        institution: "",
        yearsOfExperience: "",
    });

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const token = Cookies.get("accessToken");
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userData = response.data.data.user;
                setUser(userData);
                setProfilePhoto(userData.profileImage || "");
                const expertise = Array.isArray(userData.expertise)
                    ? userData.expertise.join(", ")
                    : userData.expertise || "";
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    bio: userData.bio || "",
                    expertise: expertise,
                    qualification: userData.qualification || "",
                    institution: userData.institution || "",
                    yearsOfExperience: userData.yearsOfExperience?.toString() || "",
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Calculate profile completion percentage
    const calculateCompletion = () => {
        let totalFields = 3; // name, email, profileImage
        let completedFields = 0;

        if (formData.name?.trim()) completedFields++;
        if (formData.email?.trim()) completedFields++;
        if (profilePhoto) completedFields++;

        // Add phone and bio for all roles
        totalFields += 2;
        if (formData.phone?.trim()) completedFields++;
        if (formData.bio?.trim()) completedFields++;

        // Add instructor-specific fields
        if (userRole === "instructor") {
            totalFields += 3; // expertise, qualification, yearsOfExperience
            if (formData.expertise?.trim()) completedFields++;
            if (formData.qualification?.trim()) completedFields++;
            if (formData.yearsOfExperience?.trim()) completedFields++;
        }

        return Math.round((completedFields / totalFields) * 100);
    };

    const completionPercentage = calculateCompletion();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Compress image to base64 with max 500KB
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    let quality = 0.9;
                    let result = canvas.toDataURL("image/jpeg", quality);

                    // Reduce quality until size is under 500KB
                    while (result.length > 500 * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        result = canvas.toDataURL("image/jpeg", quality);
                    }

                    if (result.length > 500 * 1024) {
                        reject(new Error("Image too large even after compression"));
                    } else {
                        resolve(result);
                    }
                };
                img.onerror = () => reject(new Error("Failed to load image"));
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
        });
    };

    const handlePhotoUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file");
            return;
        }

        try {
            setIsUploadingPhoto(true);
            const compressedBase64 = await compressImage(file);
            setProfilePhoto(compressedBase64);

            // Upload to backend
            const token = Cookies.get("accessToken");
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/profile/photo`,
                { profileImage: compressedBase64 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Profile photo updated successfully");
        } catch (error) {
            console.error("Failed to upload photo:", error);
            toast.error("Failed to upload photo");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsSaving(true);
            const token = Cookies.get("accessToken");
            const updateData = {
                ...formData,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : undefined,
            };
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Profile updated successfully");
            setIsEditing(false);
            setUser({ ...user, ...updateData });
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    // Badge colors based on role
    const roleConfig = {
        student: { color: "primary" as const, icon: "🎓", label: "Student" },
        guardian: { color: "success" as const, icon: "👨‍👩‍👧", label: "Guardian/Parent" },
        instructor: { color: "secondary" as const, icon: "👨‍🏫", label: "Instructor" },
        admin: { color: "danger" as const, icon: "⚙️", label: "Administrator" },
    };

    const config = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.student;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card className="w-full">
                {/* Header with Photo and Profile Info */}
                <CardHeader className="flex gap-6 items-start py-8 px-8">
                    <div className="relative">
                        <Avatar
                            src={profilePhoto || undefined}
                            name={formData.name || formData.email || "User"}
                            size="lg"
                            isBordered
                            color={config.color}
                            className="w-24 h-24"
                        />
                        {/* Camera icon for instructors only */}
                        {userRole === "instructor" && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingPhoto}
                                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                                title="Change profile photo"
                            >
                                {isUploadingPhoto ? (
                                    <Spinner size="sm" color="white" />
                                ) : (
                                    <FiCamera size={16} />
                                )}
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handlePhotoUpload(e.target.files[0]);
                                }
                            }}
                            className="hidden"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{formData.name || "User"}</h1>
                            <Chip color={config.color} variant="flat" size="sm">
                                {config.icon} {config.label}
                            </Chip>
                        </div>

                        {/* Profile Completion */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Profile Completion</span>
                                <span className="font-semibold text-gray-900">{completionPercentage}%</span>
                            </div>
                            <Progress value={completionPercentage} className="w-full" color="success" />
                        </div>
                    </div>

                    {/* Edit/Save/Cancel Buttons */}
                    <div>
                        {!isEditing ? (
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<FiEdit2 />}
                                onPress={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    color="danger"
                                    variant="light"
                                    isIconOnly
                                    onPress={() => {
                                        setIsEditing(false);
                                        const expertise = Array.isArray(user?.expertise)
                                            ? user.expertise.join(", ")
                                            : user?.expertise || "";
                                        setFormData({
                                            name: user?.name || "",
                                            email: user?.email || "",
                                            phone: user?.phone || "",
                                            bio: user?.bio || "",
                                            expertise: expertise,
                                            qualification: user?.qualification || "",
                                            institution: user?.institution || "",
                                            yearsOfExperience: user?.yearsOfExperience?.toString() || "",
                                        });
                                    }}
                                    title="Cancel changes"
                                >
                                    <FiX size={20} />
                                </Button>
                                <Button
                                    color="success"
                                    startContent={<FiCheck />}
                                    onPress={handleUpdate}
                                    isLoading={isSaving}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <Divider />

                {/* Profile Content */}
                <CardBody className="gap-8 px-8 py-8">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📧 Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                                placeholder="Enter your full name"
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                isReadOnly={true}
                                variant="flat"
                                description="Email cannot be changed"
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                                description={isEditing ? "We will check if this number is already in use" : "Phone cannot be changed"}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Bio Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📝 About You
                        </h2>
                        <Textarea
                            label="Bio"
                            name="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            variant={isEditing ? "bordered" : "flat"}
                            minRows={3}
                        />
                    </div>

                    {/* Instructor-specific fields */}
                    {userRole === "instructor" && (
                        <>
                            <Divider />
                            <div>
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    🎯 Professional Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Area of Expertise"
                                        name="expertise"
                                        placeholder="e.g., Web Development, Data Science"
                                        value={formData.expertise}
                                        onChange={handleInputChange}
                                        isReadOnly={!isEditing}
                                        variant={isEditing ? "bordered" : "flat"}
                                    />
                                    <Input
                                        label="Qualification"
                                        name="qualification"
                                        placeholder="e.g., B.S. Computer Science"
                                        value={formData.qualification}
                                        onChange={handleInputChange}
                                        isReadOnly={!isEditing}
                                        variant={isEditing ? "bordered" : "flat"}
                                    />
                                    <Input
                                        label="Institution/University"
                                        name="institution"
                                        placeholder="Where did you study?"
                                        value={formData.institution}
                                        onChange={handleInputChange}
                                        isReadOnly={!isEditing}
                                        variant={isEditing ? "bordered" : "flat"}
                                    />
                                    <Input
                                        label="Years of Experience"
                                        name="yearsOfExperience"
                                        type="number"
                                        placeholder="e.g., 5"
                                        value={formData.yearsOfExperience}
                                        onChange={handleInputChange}
                                        isReadOnly={!isEditing}
                                        variant={isEditing ? "bordered" : "flat"}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Admin-specific info */}
                    {userRole === "admin" && (
                        <>
                            <Divider />
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                                <h3 className="font-semibold text-red-800 text-lg">🔐 Administrator Account</h3>
                                <p className="text-sm text-red-700 mt-2">
                                    You have full access to the admin control panel. Use it responsibly.
                                </p>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className="mt-4"
                                    onPress={() => window.location.href = "/admin"}
                                >
                                    Go to Admin Panel →
                                </Button>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
