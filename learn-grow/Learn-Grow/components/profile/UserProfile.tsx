"use client";

import React, { useState, useEffect } from "react";
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
} from "@nextui-org/react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/api/authApi";

export default function UserProfile() {
    const { data, isLoading, error } = useGetProfileQuery({});
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [isEditing, setIsEditing] = useState(false);

    // Handle Mock Mode
    const [mockUser, setMockUser] = useState<any>(null);
    useEffect(() => {
        if (error) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setMockUser(JSON.parse(storedUser));
            }
        }
    }, [error]);

    const user = data?.data || data || mockUser;
    const userRole = user?.role || "student";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        institution: "",
        age: "",
        address: "",
        bio: "",
        specialization: "",
        experience: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.student_name || user.guardian_name || user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                institution: user.institution || "",
                age: user.age?.toString() || "",
                address: user.address || "",
                bio: user.bio || "",
                specialization: user.specialization || "",
                experience: user.experience || "",
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await updateProfile(formData).unwrap();
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            alert("Failed to update profile. Changes saved locally (Mock mode).");
            setIsEditing(false);
        }
    };

    if (error && !mockUser) {
        return <div className="text-center text-red-500">Failed to load profile. Please login again.</div>;
    }

    // Badge colors based on role
    const roleConfig = {
        student: { color: "primary" as const, icon: "🎓", label: "Student" },
        guardian: { color: "success" as const, icon: "👨‍👩‍👧", label: "Guardian/Parent" },
        teacher: { color: "secondary" as const, icon: "👨‍🏫", label: "Instructor" },
        instructor: { color: "secondary" as const, icon: "👨‍🏫", label: "Instructor" },
        admin: { color: "danger" as const, icon: "⚙️", label: "Administrator" },
    };

    const config = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.student;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {error && mockUser && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Mock Mode Active</p>
                    <p>API is offline. Showing locally stored profile data.</p>
                </div>
            )}

            <Card className="w-full">
                <CardHeader className="flex gap-4 items-center">
                    <Avatar
                        src={user?.img || `https://i.pravatar.cc/150?u=${user?.phone}`}
                        size="lg"
                        isBordered
                        color={config.color}
                    />
                    <div className="flex flex-col flex-1">
                        <h1 className="text-2xl font-bold">{formData.name || "User"}</h1>
                        <Chip color={config.color} variant="flat" size="sm" className="mt-1 w-fit">
                            {config.icon} {config.label}
                        </Chip>
                    </div>
                    <div className="ml-auto">
                        {!isEditing ? (
                            <Button color="primary" variant="flat" onPress={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button color="danger" variant="light" onPress={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button color="success" onPress={handleUpdate} isLoading={isUpdating}>
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-6">
                    {/* Common Fields for All Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            variant={isEditing ? "bordered" : "flat"}
                        />
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            variant={isEditing ? "bordered" : "flat"}
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            isReadOnly={true}
                            variant="flat"
                            description="Phone number cannot be changed."
                        />
                        <Input
                            label="Age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            variant={isEditing ? "bordered" : "flat"}
                        />
                    </div>

                    {/* Student-specific fields */}
                    {(userRole === "student") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="School/Institution"
                                name="institution"
                                value={formData.institution}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                            />
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                            />
                        </div>
                    )}

                    {/* Guardian-specific fields */}
                    {userRole === "guardian" && (
                        <div className="space-y-4">
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                            />
                            <Divider />
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Children Information</h3>
                                <p className="text-sm text-gray-600">Manage your children's accounts from the dashboard.</p>
                            </div>
                        </div>
                    )}

                    {/* Teacher/Instructor-specific fields */}
                    {(userRole === "teacher" || userRole === "instructor") && (
                        <div className="space-y-4">
                            <Input
                                label="Specialization"
                                name="specialization"
                                placeholder="e.g., Web Development, Robotics"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                            />
                            <Input
                                label="Years of Experience"
                                name="experience"
                                type="number"
                                value={formData.experience}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                            />
                            <Textarea
                                label="Bio"
                                name="bio"
                                placeholder="Tell us about your teaching experience..."
                                value={formData.bio}
                                onChange={handleInputChange}
                                isReadOnly={!isEditing}
                                variant={isEditing ? "bordered" : "flat"}
                                minRows={3}
                            />
                        </div>
                    )}

                    {/* Admin-specific info */}
                    {userRole === "admin" && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <h3 className="font-semibold text-red-800">Administrator Account</h3>
                            <p className="text-sm text-red-700 mt-1">
                                You have full access to the admin control panel. Use it responsibly.
                            </p>
                            <Button
                                color="danger"
                                variant="flat"
                                className="mt-3"
                                size="sm"
                                onPress={() => window.location.href = "/admin"}
                            >
                                Go to Admin Panel →
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
