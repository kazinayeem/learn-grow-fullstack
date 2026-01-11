"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Switch,
} from "@nextui-org/react";
import { useCreateJobMutation, useUpdateJobMutation } from "@/redux/api/jobApi";
import { FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaCalendar, FaCheckCircle, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  editJob?: any;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];

const initialFormData = {
  title: "",
  department: "",
  location: "",
  jobType: "Full-time",
  salaryRange: {
    min: "",
    max: "",
    currency: "USD",
  },
  description: "",
  requirements: "",
  isRemote: false,
  isPublished: false,
  expiresAt: "",
};

export default function CreateJobModal({
  isOpen,
  onClose,
  editJob,
}: CreateJobModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  /* ---------------- sync edit data ---------------- */
  useEffect(() => {
    if (isOpen) {
      if (editJob) {
        setFormData({
          title: editJob.title || "",
          department: editJob.department || "",
          location: editJob.location || "",
          jobType: editJob.jobType || "Full-time",
          salaryRange: {
            min: editJob.salaryRange?.min?.toString() || "",
            max: editJob.salaryRange?.max?.toString() || "",
            currency: editJob.salaryRange?.currency || "USD",
          },
          description: editJob.description || "",
          requirements: Array.isArray(editJob.requirements)
            ? editJob.requirements.join("\n")
            : editJob.requirements || "",
          isRemote: editJob.isRemote || false,
          isPublished: editJob.isPublished || false,
          expiresAt: editJob.expiresAt ? new Date(editJob.expiresAt).toISOString().split('T')[0] : "",
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, editJob]);

  const isSubmitting = isCreating || isUpdating;

  /* ---------------- handlers ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested salaryRange fields
    if (name.startsWith("salaryRange.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        salaryRange: {
          ...prev.salaryRange,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepare payload matching backend schema
      const payload: any = {
        title: formData.title,
        jobType: formData.jobType,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        requirements: typeof formData.requirements === 'string'
          ? formData.requirements.split('\n').filter(r => r.trim())
          : formData.requirements,
        isRemote: formData.isRemote,
        isPublished: formData.isPublished,
      };

      // Add salaryRange only if min or max is provided
      if (formData.salaryRange.min || formData.salaryRange.max) {
        payload.salaryRange = {
          currency: formData.salaryRange.currency || "USD",
        };
        if (formData.salaryRange.min) {
          payload.salaryRange.min = Number(formData.salaryRange.min);
        }
        if (formData.salaryRange.max) {
          payload.salaryRange.max = Number(formData.salaryRange.max);
        }
      }

      // Add expiresAt if provided
      if (formData.expiresAt) {
        payload.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      if (editJob) {
        await updateJob({
          id: editJob._id || editJob.id,
          ...payload,
        }).unwrap();
        toast.success("Job updated successfully!");
      } else {
        await createJob(payload).unwrap();
        toast.success("Job created successfully!");
      }
      setFormData(initialFormData);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => { } : onClose}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setFormData(initialFormData);
          onClose();
        }
      }}
      size="3xl"
      scrollBehavior="inside"
      placement="center"
      isDismissable={!isSubmitting}
      hideCloseButton={isSubmitting}
      classNames={{
        base: "bg-white max-h-[95vh]",
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        {/* Header with Gradient */}
        <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaBriefcase className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {editJob ? "Edit Job" : "Create Job"}
              </h2>
              <p className="text-sm text-white/90 font-normal">
                Fill all required information carefully
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-6 sm:p-8 space-y-6">
          {/* BASIC INFO */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaBriefcase className="text-teal-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  isRequired
                  variant="bordered"
                  size="lg"
                  placeholder="e.g., Senior Full Stack Developer"
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                  }}
                />
              </div>

              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                isRequired
                variant="bordered"
                size="lg"
                placeholder="e.g., Engineering"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                }}
              />

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                isRequired
                variant="bordered"
                size="lg"
                placeholder="e.g., New York, NY"
                startContent={<FaMapMarkerAlt className="text-teal-500" />}
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                }}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Employment Type <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      jobType: e.target.value,
                    }));
                  }}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-teal-400 focus:border-teal-500 focus:outline-none transition-all duration-300 bg-white text-base"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SALARY RANGE */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaDollarSign className="text-teal-500" />
              Salary Range (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Minimum"
                name="salaryRange.min"
                type="number"
                value={formData.salaryRange.min}
                onChange={handleChange}
                variant="bordered"
                size="lg"
                placeholder="e.g., 100000"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                }
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                }}
              />

              <Input
                label="Maximum"
                name="salaryRange.max"
                type="number"
                value={formData.salaryRange.max}
                onChange={handleChange}
                variant="bordered"
                size="lg"
                placeholder="e.g., 150000"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                }
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                }}
              />

              <Input
                label="Currency"
                name="salaryRange.currency"
                value={formData.salaryRange.currency}
                onChange={handleChange}
                variant="bordered"
                size="lg"
                placeholder="USD"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
                }}
              />
            </div>
          </div>

          {/* EXPIRATION DATE */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaCalendar className="text-teal-500" />
              Expiration Date (Optional)
            </h3>
            <Input
              type="date"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              variant="bordered"
              size="lg"
              description="When this job posting should expire"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
              }}
            />
          </div>

          {/* TEXT AREAS */}
          <div className="space-y-4">
            <Textarea
              label="Job Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              minRows={4}
              variant="bordered"
              isRequired
              placeholder="Detailed description of the role, responsibilities, and what makes this opportunity unique..."
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
              }}
            />

            <Textarea
              label="Requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              minRows={5}
              variant="bordered"
              isRequired
              placeholder="Enter each requirement on a new line:
• 5+ years of experience in web development
• Strong proficiency in React and Node.js
• Experience with MongoDB and TypeScript"
              description="Enter each requirement on a new line"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300",
              }}
            />
          </div>

          {/* SWITCHES */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
            <div className="flex flex-col sm:flex-row gap-6">
              <Switch
                isSelected={formData.isRemote}
                onValueChange={(v) => setFormData((p) => ({ ...p, isRemote: v }))}
                size="lg"
                color="success"
              >
                <span className="font-semibold">Remote Job</span>
              </Switch>

              <Switch
                isSelected={formData.isPublished}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, isPublished: v }))
                }
                size="lg"
                color="success"
              >
                <span className="font-semibold">Publish Immediately</span>
              </Switch>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 p-6 bg-gray-50">
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={isSubmitting}
            size="lg"
            className="min-h-[48px] font-semibold"
            startContent={<FaTimes />}
          >
            Cancel
          </Button>

          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            size="lg"
            className="min-h-[48px] font-bold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            startContent={!isSubmitting && <FaCheckCircle />}
          >
            {editJob ? "Update Job" : "Create Job"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
