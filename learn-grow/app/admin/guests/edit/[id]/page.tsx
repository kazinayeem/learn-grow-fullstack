"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Spinner,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetGuestByIdQuery,
  useUpdateGuestMutation,
} from "@/redux/api/eventApi";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaImage,
  FaSave,
  FaTimes,
  FaEdit
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function EditGuestPage() {
  const router = useRouter();
  const params = useParams();
  const guestId = params.id as string;

  const { data: response, isLoading: loading } = useGetGuestByIdQuery(guestId, {
    skip: !guestId,
  });
  const [updateGuest, { isLoading: updating }] = useUpdateGuestMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "Guest",
    organization: "",
    designation: "",
    bio: "",
    profileImage: "",
    linkedinUrl: "",
    twitterUrl: "",
    websiteUrl: "",
  });

  const guest = response?.data;

  useEffect(() => {
    if (guest) {
      setFormData({
        fullName: guest.fullName || "",
        email: guest.email || "",
        phoneNumber: guest.phoneNumber || "",
        role: guest.role || "Guest",
        organization: guest.organization || "",
        designation: guest.designation || "",
        bio: guest.bio || "",
        profileImage: guest.profileImage || "",
        linkedinUrl: guest.linkedinUrl || "",
        twitterUrl: guest.twitterUrl || "",
        websiteUrl: guest.websiteUrl || "",
      });
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.role) {
      toast.error("Full name and role are required");
      return;
    }

    try {
      await updateGuest({ id: guestId, ...formData }).unwrap();
      toast.success("Guest updated successfully");
      router.push("/admin/guests");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update guest");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Spinner size="lg" label="Loading guest details..." color="primary" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Card className="border-2 border-red-500 max-w-lg w-full shadow-xl">
          <CardBody className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaArrowLeft size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Guest Not Found</h2>
            <p className="text-gray-500 mb-6">The guest you are looking for does not exist or has been deleted.</p>
            <Button color="primary" onPress={() => router.push("/admin/guests")} size="lg">
              Return to Guests
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      {/* Modern Header */}
      <div className="mb-8 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin/guests")}
            className="mb-4 text-white/90 hover:bg-white/20"
          >
            Back to Guests
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <FaEdit className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Guest</h1>
              <p className="text-cyan-100 mt-1">Updating details for {guest.fullName}</p>
            </div>
          </div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Essential Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaUser className="text-cyan-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Dr. Sarah Smith"
                  value={formData.fullName}
                  onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                  isRequired
                  variant="bordered"
                  startContent={<FaUser className="text-gray-400" />}
                  className="md:col-span-2"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onValueChange={(val) => setFormData({ ...formData, email: val })}
                  variant="bordered"
                  startContent={<FaEnvelope className="text-gray-400" />}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phoneNumber}
                  onValueChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                  variant="bordered"
                  startContent={<FaPhone className="text-gray-400" />}
                />
                <Select
                  label="Role"
                  placeholder="Select role"
                  selectedKeys={[formData.role]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, role: Array.from(keys)[0] as string })
                  }
                  isRequired
                  variant="bordered"
                  startContent={<FaBriefcase className="text-gray-400" />}
                  className="md:col-span-2"
                >
                  <SelectItem key="Guest" startContent={<FaUser className="text-gray-500" />}>Guest</SelectItem>
                  <SelectItem key="Host" startContent={<FaUser className="text-blue-500" />}>Host</SelectItem>
                  <SelectItem key="Speaker" startContent={<FaUser className="text-purple-500" />}>Speaker</SelectItem>
                  <SelectItem key="Mentor" startContent={<FaUser className="text-green-500" />}>Mentor</SelectItem>
                  <SelectItem key="Judge" startContent={<FaUser className="text-amber-500" />}>Judge</SelectItem>
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaBriefcase className="text-teal-600" />
                Professional Details
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    placeholder="Company or Institution name"
                    value={formData.organization}
                    onValueChange={(val) => setFormData({ ...formData, organization: val })}
                    variant="bordered"
                    startContent={<FaBuilding className="text-gray-400" />}
                  />
                  <Input
                    label="Designation"
                    placeholder="e.g. Senior Lecturer"
                    value={formData.designation}
                    onValueChange={(val) => setFormData({ ...formData, designation: val })}
                    variant="bordered"
                    startContent={<FaBriefcase className="text-gray-400" />}
                  />
                </div>
                <Textarea
                  label="Bio"
                  placeholder="Write a brief professional biography..."
                  value={formData.bio}
                  onValueChange={(val) => setFormData({ ...formData, bio: val })}
                  variant="bordered"
                  minRows={4}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Social & Image */}
        <div className="space-y-6">
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaImage className="text-emerald-600" />
                Profile Image
              </h2>

              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mb-4 bg-gray-50 flex items-center justify-center">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-4xl text-gray-300" />
                  )}
                </div>
              </div>

              <Input
                label="Image URL"
                placeholder="https://..."
                value={formData.profileImage}
                onValueChange={(val) => setFormData({ ...formData, profileImage: val })}
                variant="bordered"
                startContent={<FaGlobe className="text-gray-400" />}
                description="Enter a direct image URL."
              />
            </CardBody>
          </Card>

          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaGlobe className="text-blue-500" />
                Social Links
              </h2>
              <div className="space-y-4">
                <Input
                  label="LinkedIn"
                  placeholder="LinkedIn Profile URL"
                  value={formData.linkedinUrl}
                  onValueChange={(val) => setFormData({ ...formData, linkedinUrl: val })}
                  variant="bordered"
                  startContent={<FaLinkedin className="text-blue-700" />}
                />
                <Input
                  label="Twitter"
                  placeholder="Twitter Profile URL"
                  value={formData.twitterUrl}
                  onValueChange={(val) => setFormData({ ...formData, twitterUrl: val })}
                  variant="bordered"
                  startContent={<FaTwitter className="text-sky-500" />}
                />
                <Input
                  label="Website"
                  placeholder="Personal Website URL"
                  value={formData.websiteUrl}
                  onValueChange={(val) => setFormData({ ...formData, websiteUrl: val })}
                  variant="bordered"
                  startContent={<FaGlobe className="text-gray-600" />}
                />
              </div>
            </CardBody>
          </Card>

          {/* Sticky Actions */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 sticky bottom-4 z-20">
            <Button
              color="primary"
              type="submit"
              size="lg"
              isLoading={updating}
              className="w-full mb-3 font-bold text-lg shadow-lg bg-gradient-to-r from-cyan-600 to-teal-600 border-none"
              startContent={<FaSave />}
            >
              Update Changes
            </Button>
            <Button
              variant="flat"
              color="danger"
              size="lg"
              onPress={() => router.push("/admin/guests")}
              isDisabled={updating}
              className="w-full font-medium"
              startContent={<FaTimes />}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
