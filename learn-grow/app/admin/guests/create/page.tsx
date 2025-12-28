"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCreateGuestMutation } from "@/redux/api/eventApi";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

export default function CreateGuestPage() {
  const router = useRouter();
  const [createGuest, { isLoading }] = useCreateGuestMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.role) {
      toast.error("Full name and role are required");
      return;
    }

    try {
      await createGuest(formData).unwrap();
      toast.success("Guest created successfully");
      router.push("/admin/guests");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create guest");
    }
  };

  return (
    <div className="p-8">
      <Button
        variant="light"
        startContent={<FaArrowLeft />}
        onPress={() => router.push("/admin/guests")}
        className="mb-6"
      >
        Back to Guests
      </Button>

      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create New Guest</h1>

        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                  isRequired
                  variant="bordered"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onValueChange={(val) => setFormData({ ...formData, email: val })}
                  variant="bordered"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phoneNumber}
                  onValueChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                  variant="bordered"
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
                >
                  <SelectItem key="Guest">Guest</SelectItem>
                  <SelectItem key="Host">Host</SelectItem>
                  <SelectItem key="Speaker">Speaker</SelectItem>
                  <SelectItem key="Mentor">Mentor</SelectItem>
                  <SelectItem key="Judge">Judge</SelectItem>
                </Select>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Professional Information</h2>

                <Input
                  label="Organization"
                  placeholder="Company or Institution"
                  value={formData.organization}
                  onValueChange={(val) => setFormData({ ...formData, organization: val })}
                  variant="bordered"
                />

                <Input
                  label="Designation"
                  placeholder="CEO, Professor, Developer, etc."
                  value={formData.designation}
                  onValueChange={(val) => setFormData({ ...formData, designation: val })}
                  variant="bordered"
                />

                <Textarea
                  label="Bio"
                  placeholder="Brief description about the guest..."
                  value={formData.bio}
                  onValueChange={(val) => setFormData({ ...formData, bio: val })}
                  variant="bordered"
                  minRows={4}
                />
              </div>

              {/* Media & Links */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Media & Social Links</h2>

                <Input
                  label="Profile Image URL"
                  placeholder="https://example.com/image.jpg"
                  value={formData.profileImage}
                  onValueChange={(val) => setFormData({ ...formData, profileImage: val })}
                  variant="bordered"
                />

                <Input
                  label="LinkedIn URL"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl}
                  onValueChange={(val) => setFormData({ ...formData, linkedinUrl: val })}
                  variant="bordered"
                />

                <Input
                  label="Twitter URL"
                  placeholder="https://twitter.com/username"
                  value={formData.twitterUrl}
                  onValueChange={(val) => setFormData({ ...formData, twitterUrl: val })}
                  variant="bordered"
                />

                <Input
                  label="Website URL"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onValueChange={(val) => setFormData({ ...formData, websiteUrl: val })}
                  variant="bordered"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  color="primary"
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Create Guest
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => router.push("/admin/guests")}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
