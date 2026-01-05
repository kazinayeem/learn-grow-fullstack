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
import { FiCamera, FiEdit2, FiCheck, FiX, FiLock, FiPhone } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import {
    useSendPasswordChangeOtpMutation,
    useVerifyPasswordChangeOtpMutation,
    useUpdatePhoneNumberMutation
} from "@/redux/api/userApi";

export default function UserProfile() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onOpenChange: onPasswordModalOpenChange } = useDisclosure();
    const { isOpen: isPhoneModalOpen, onOpen: onPhoneModalOpen, onOpenChange: onPhoneModalOpenChange } = useDisclosure();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profilePhoto, setProfilePhoto] = useState<string>("");

    // Password change states
    const [passwordOtpSent, setPasswordOtpSent] = useState(false);
    const [passwordOtp, setPasswordOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Phone update states
    const [newPhone, setNewPhone] = useState("");

    const [sendPasswordOtp, { isLoading: sendingOtp }] = useSendPasswordChangeOtpMutation();
    const [verifyPasswordOtp, { isLoading: verifyingPassword }] = useVerifyPasswordChangeOtpMutation();
    const [updatePhone, { isLoading: updatingPhone }] = useUpdatePhoneNumberMutation();

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
                const token = Cookies.get("accessToken") || localStorage.getItem("token");
                
                if (!token) {
                    throw new Error("No token found");
                }
                
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userData = response.data.data.user;
                
                // Update localStorage with latest data
                if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(userData));
                }
                
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
                
                // Fallback to localStorage data if API fails
                const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
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
                        toast.warning("Using cached profile data");
                    } catch (parseError) {
                        console.error("Failed to parse stored user data:", parseError);
                        toast.error("Failed to load profile");
                    }
                } else {
                    toast.error("Failed to load profile");
                }
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

    // Handle image URL input
    const [imageUrlInput, setImageUrlInput] = useState("");
    const { isOpen: isImageModalOpen, onOpen: onImageModalOpen, onOpenChange: onImageModalOpenChange } = useDisclosure();

    const handlePhotoUpload = async (imageUrl: string) => {
        if (!imageUrl || imageUrl.trim() === "") {
            toast.error("Please enter a valid image URL");
            return;
        }

        // Basic URL validation
        try {
            new URL(imageUrl);
        } catch {
            toast.error("Please enter a valid URL");
            return;
        }

        try {
            setIsUploadingPhoto(true);
            setProfilePhoto(imageUrl);

            // Upload to backend
            const token = Cookies.get("accessToken");
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile/photo`,
                { profileImage: imageUrl },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Profile photo updated successfully");
            setImageUrlInput("");
            onImageModalOpenChange();
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
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile`,
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
        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
            <Card className="w-full">
                {/* Header with Photo and Profile Info */}
                <CardHeader className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8">
                    <div className="relative flex-shrink-0">
                        <Avatar
                            src={profilePhoto || undefined}
                            name={formData.name || formData.email || "User"}
                            size="lg"
                            isBordered
                            color={config.color}
                            className="w-20 h-20 sm:w-24 sm:h-24"
                        />
                        {/* Camera icon for instructors only */}
                        {userRole === "instructor" && (
                            <button
                                onClick={onImageModalOpen}
                                disabled={isUploadingPhoto}
                                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2 rounded-full transition-colors disabled:opacity-50"
                                title="Change profile photo"
                            >
                                {isUploadingPhoto ? (
                                    <Spinner size="sm" color="white" />
                                ) : (
                                    <FiCamera size={14} className="sm:w-4 sm:h-4" />
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                            <h1 className="text-xl sm:text-2xl font-bold truncate max-w-full">{formData.name || "User"}</h1>
                            <Chip color={config.color} variant="flat" size="sm" className="text-xs">
                                {config.icon} {config.label}
                            </Chip>
                        </div>

                        {/* Profile Completion */}
                        <div className="mt-3 sm:mt-4 space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Profile Completion</span>
                                <span className="font-semibold text-gray-900">{completionPercentage}%</span>
                            </div>
                            <Progress value={completionPercentage} className="w-full" color="success" size="sm" />
                        </div>
                    </div>

                    {/* Edit/Save/Cancel Buttons */}
                    <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-2 sm:mt-0">
                        {!isEditing ? (
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<FiEdit2 />}
                                onPress={() => setIsEditing(true)}
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
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
                                    size="sm"
                                >
                                    <FiX size={18} />
                                </Button>
                                <Button
                                    color="success"
                                    startContent={<FiCheck />}
                                    onPress={handleUpdate}
                                    isLoading={isSaving}
                                    size="sm"
                                    className="flex-1 sm:flex-initial"
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <Divider />

                {/* Profile Content */}
                <CardBody className="gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                            📧 Contact Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
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
                                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                    🎯 Professional Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 sm:p-6 rounded">
                                <h3 className="font-semibold text-red-800 text-base sm:text-lg">🔐 Administrator Account</h3>
                                <p className="text-xs sm:text-sm text-red-700 mt-2">
                                    You have full access to the admin control panel. Use it responsibly.
                                </p>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    className="mt-3 sm:mt-4 w-full sm:w-auto"
                                    size="sm"
                                    onPress={() => window.location.href = "/admin"}
                                >
                                    Go to Admin Panel →
                                </Button>
                            </div>
                        </>
                    )}

                    <Divider />

                    {/* Security Settings */}
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                            🔐 Security Settings
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                color="warning"
                                variant="flat"
                                startContent={<FiLock />}
                                onPress={onPasswordModalOpen}
                                size="sm"
                                className="w-full"
                            >
                                Change Password
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<FiPhone />}
                                onPress={onPhoneModalOpen}
                                size="sm"
                                className="w-full"
                            >
                                Update Phone Number
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Password Change Modal */}
            <Modal 
                isOpen={isPasswordModalOpen} 
                onOpenChange={onPasswordModalOpenChange} 
                size="md"
                scrollBehavior="inside"
                classNames={{
                    base: "mx-4 sm:mx-0",
                    body: "py-4 sm:py-6",
                    header: "text-base sm:text-lg"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-base sm:text-lg">Change Password</ModalHeader>
                            <ModalBody>
                                {!passwordOtpSent ? (
                                    <div className="space-y-3 sm:space-y-4">
                                        <p className="text-sm text-gray-600">
                                            We'll send an OTP to your {user?.email ? "email" : "phone"} to verify it's you.
                                        </p>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-800">
                                                {user?.email ? `📧 ${user.email}` : `📱 ${user?.phone}`}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
                                        <Input
                                            label="Enter OTP"
                                            placeholder="6-digit OTP"
                                            value={passwordOtp}
                                            onChange={(e) => setPasswordOtp(e.target.value)}
                                            maxLength={6}
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Input
                                            label="New Password"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            variant="bordered"
                                            size="sm"
                                        />
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            variant="bordered"
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="flex-col sm:flex-row gap-2">
                                <Button
                                    variant="light"
                                    onPress={() => {
                                        onClose();
                                        setPasswordOtpSent(false);
                                        setPasswordOtp("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                {!passwordOtpSent ? (
                                    <Button
                                        color="primary"
                                        onPress={async () => {
                                            try {
                                                const data: any = {};
                                                if (user.email) data.email = user.email;
                                                if (user.phone) data.phone = user.phone;

                                                const result = await sendPasswordOtp(data).unwrap();
                                                toast.success(result.message || "OTP sent successfully");
                                                setPasswordOtpSent(true);
                                            } catch (error: any) {
                                                toast.error(error?.data?.message || "Failed to send OTP");
                                            }
                                        }}
                                        isLoading={sendingOtp}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Send OTP
                                    </Button>
                                ) : (
                                    <Button
                                        color="success"
                                        onPress={async () => {
                                            if (newPassword !== confirmPassword) {
                                                toast.error("Passwords do not match");
                                                return;
                                            }

                                            if (newPassword.length < 6) {
                                                toast.error("Password must be at least 6 characters");
                                                return;
                                            }

                                            try {
                                                const data: any = {
                                                    otp: passwordOtp,
                                                    newPassword,
                                                };
                                                if (user.email) data.email = user.email;
                                                if (user.phone) data.phone = user.phone;

                                                const result = await verifyPasswordOtp(data).unwrap();
                                                toast.success(result.message || "Password changed successfully");
                                                onClose();
                                                setPasswordOtpSent(false);
                                                setPasswordOtp("");
                                                setNewPassword("");
                                                setConfirmPassword("");
                                            } catch (error: any) {
                                                toast.error(error?.data?.message || "Failed to change password");
                                            }
                                        }}
                                        isLoading={verifyingPassword}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Change Password
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Phone Update Modal */}
            <Modal 
                isOpen={isPhoneModalOpen} 
                onOpenChange={onPhoneModalOpenChange} 
                size="md"
                scrollBehavior="inside"
                classNames={{
                    base: "mx-4 sm:mx-0",
                    body: "py-4 sm:py-6",
                    header: "text-base sm:text-lg"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="text-base sm:text-lg">Update Phone Number</ModalHeader>
                            <ModalBody>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs sm:text-sm text-gray-600">Current Phone:</p>
                                        <p className="font-semibold text-sm sm:text-base">{user?.phone || "Not set"}</p>
                                    </div>
                                    <Input
                                        label="New Phone Number"
                                        placeholder="e.g., +8801712345678"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        variant="bordered"
                                        description="Enter your new phone number with country code"
                                        size="sm"
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex-col sm:flex-row gap-2">
                                <Button
                                    variant="light"
                                    onPress={() => {
                                        onClose();
                                        setNewPhone("");
                                    }}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={async () => {
                                        if (!newPhone || newPhone.length < 10) {
                                            toast.error("Please enter a valid phone number");
                                            return;
                                        }

                                        try {
                                            const result = await updatePhone({ newPhone }).unwrap();
                                            toast.success(result.message || "Phone number updated successfully");
                                            setUser({ ...user, phone: newPhone });
                                            setFormData({ ...formData, phone: newPhone });
                                            onClose();
                                            setNewPhone("");
                                        } catch (error: any) {
                                            toast.error(error?.data?.message || "Failed to update phone number");
                                        }
                                    }}
                                    isLoading={updatingPhone}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Update Phone
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Image URL Modal */}
            <Modal 
                isOpen={isImageModalOpen} 
                onOpenChange={onImageModalOpenChange}
                scrollBehavior="inside"
                classNames={{
                    base: "mx-4 sm:mx-0",
                    body: "py-4 sm:py-6",
                    header: "text-base sm:text-lg"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-base sm:text-lg">Update Profile Photo</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Image URL"
                                    placeholder="https://example.com/your-image.jpg"
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    description="Enter a direct link to your profile image"
                                    size="sm"
                                />
                            </ModalBody>
                            <ModalFooter className="flex-col sm:flex-row gap-2">
                                <Button 
                                    color="danger" 
                                    variant="light" 
                                    onPress={onClose}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    color="primary" 
                                    onPress={() => handlePhotoUpload(imageUrlInput)}
                                    isLoading={isUploadingPhoto}
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    Update Photo
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
