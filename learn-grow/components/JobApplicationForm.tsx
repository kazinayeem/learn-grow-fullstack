
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
  Textarea,
  Spinner,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@nextui-org/react";
import { useApplyForJobMutation } from "@/redux/api/jobApi";
import { useRef } from "react";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}: JobApplicationFormProps) {
  const [applyForJob, { isLoading }] = useApplyForJobMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formStep, setFormStep] = useState<"confirm" | "form">("confirm");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedinProfile: "",
    resumeLink: "",
    additionalInfo: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          resume: "File size must be less than 5MB",
        }));
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          resume: "Only PDF and DOC files are allowed",
        }));
        return;
      }

      setResumeFile(file);
      if (errors.resume) {
        setErrors((prev) => ({
          ...prev,
          resume: "",
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    
    // Check if resume link is provided
    if (!formData.resumeLink.trim()) {
      newErrors.resumeLink = "Please provide a resume link";
    } else if (!/^https?:\/\/.+/.test(formData.resumeLink)) {
      newErrors.resumeLink = "Please provide a valid URL (starting with http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Use the provided resume link
      const resumeUrl = formData.resumeLink;

      await applyForJob({
        jobId,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        resumeUrl,
        linkedinProfile: formData.linkedinProfile || undefined,
        additionalInfo: formData.additionalInfo || undefined,
      }).unwrap();

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedinProfile: "",
        resumeLink: "",
        additionalInfo: "",
      });
      setErrors({});
      setFormStep("confirm");

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to submit application. Please try again.";
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    }
  };

  const handleClose = () => {
    setFormStep("confirm");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      linkedinProfile: "",
      resumeLink: "",
      additionalInfo: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" backdrop="blur">
      <ModalContent>
        {/* STEP 1: Confirmation */}
        {formStep === "confirm" && (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <p>Ready to Apply?</p>
              <p className="text-sm font-normal text-gray-600">{jobTitle}</p>
            </ModalHeader>

            <ModalBody className="space-y-4">
              <Card className="bg-blue-50 border border-blue-200">
                <CardBody className="space-y-3 p-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">📝</div>
                    <div>
                      <p className="font-semibold text-sm">No login required!</p>
                      <p className="text-sm text-gray-600">
                        We'll collect your information through a quick form.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Divider />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">What we'll ask for:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      1
                    </Chip>
                    <span className="text-sm">Your contact information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      2
                    </Chip>
                    <span className="text-sm">Upload your resume (PDF or DOC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      3
                    </Chip>
                    <span className="text-sm">
                      Optional LinkedIn profile & additional info
                    </span>
                  </div>
                </div>
              </div>

              <Divider />

              <p className="text-xs text-gray-500 text-center">
                Your information will be securely submitted to our hiring team.
              </p>
            </ModalBody>

            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => setFormStep("form")}
              >
                Continue to Form
              </Button>
            </ModalFooter>
          </>
        )}

        {/* STEP 2: Application Form */}
        {formStep === "form" && (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <p>Apply for Position</p>
              <p className="text-sm font-normal text-gray-600">{jobTitle}</p>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.submit}
                </div>
              )}

              <Input
                label="Full Name *"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                isInvalid={!!errors.fullName}
                errorMessage={errors.fullName}
              />

              <Input
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              />

              <Input
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
              />

              <Input
                label="LinkedIn Profile (Optional)"
                name="linkedinProfile"
                type="url"
                value={formData.linkedinProfile}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/johndoe"
              />

              <Input
                label="Resume / CV Link *"
                name="resumeLink"
                type="url"
                value={formData.resumeLink}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/file/d/your-resume.pdf"
                isInvalid={!!errors.resumeLink}
                errorMessage={errors.resumeLink}
                description="Paste a direct link to your resume (Google Drive, Dropbox, etc.)"
              />

              <Textarea
                label="Additional Information (Optional)"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Tell us why you're interested in this position..."
                minRows={3}
                maxLength={2000}
              />

              <p className="text-xs text-gray-500">
                * Required fields must be filled to submit your application
              </p>
            </ModalBody>

            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={() => setFormStep("confirm")}
              >
                Back
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
