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
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { useCreateJobMutation, useUpdateJobMutation } from "@/redux/api/jobApi";

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
        alert("Job updated successfully!");
      } else {
        await createJob(payload).unwrap();
        alert("Job created successfully!");
      }
      setFormData(initialFormData);
      onClose();
    } catch (error: any) {
      alert(error?.data?.message || "Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
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
        base: "bg-white",
        header: "border-b",
        footer: "border-t sticky bottom-0 bg-white z-10",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div>
            <h2 className="text-xl font-bold">
              {editJob ? "Edit Job" : "Create Job"}
            </h2>
            <p className="text-sm text-gray-500">
              Fill all required information carefully
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isRequired
              variant="bordered"
              placeholder="e.g., Senior Full Stack Developer"
            />

            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              isRequired
              variant="bordered"
              placeholder="e.g., Engineering"
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              isRequired
              variant="bordered"
              placeholder="e.g., New York, NY"
            />

            {/* FIXED SELECT */}
            <Select
              label="Employment Type"
              selectedKeys={formData.jobType ? [formData.jobType] : []}
              onSelectionChange={(keys) => {
                const selectedArray = Array.from(keys);
                if (selectedArray.length > 0) {
                  const value = selectedArray[0] as string;
                  setFormData((prev) => ({
                    ...prev,
                    jobType: value,
                  }));
                }
              }}
              variant="bordered"
              isRequired
              disallowEmptySelection
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* SALARY RANGE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Salary Range (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Minimum"
                name="salaryRange.min"
                type="number"
                value={formData.salaryRange.min}
                onChange={handleChange}
                variant="bordered"
                placeholder="e.g., 100000"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                }
              />

              <Input
                label="Maximum"
                name="salaryRange.max"
                type="number"
                value={formData.salaryRange.max}
                onChange={handleChange}
                variant="bordered"
                placeholder="e.g., 150000"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm">$</span>
                  </div>
                }
              />

              <Input
                label="Currency"
                name="salaryRange.currency"
                value={formData.salaryRange.currency}
                onChange={handleChange}
                variant="bordered"
                placeholder="USD"
              />
            </div>
          </div>

          {/* EXPIRATION DATE */}
          <Input
            label="Expiration Date (Optional)"
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            variant="bordered"
            description="When this job posting should expire"
          />

          {/* TEXT AREAS */}
          <Textarea
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            minRows={4}
            variant="bordered"
            isRequired
            placeholder="Detailed description of the role, responsibilities, and what makes this opportunity unique..."
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
5+ years of experience in web development
Strong proficiency in React and Node.js
Experience with MongoDB and TypeScript"
            description="Enter each requirement on a new line"
          />

          {/* SWITCHES */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Switch
              isSelected={formData.isRemote}
              onValueChange={(v) => setFormData((p) => ({ ...p, isRemote: v }))}
            >
              Remote Job
            </Switch>

            <Switch
              isSelected={formData.isPublished}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, isPublished: v }))
              }
              color="success"
            >
              Publish Immediately
            </Switch>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            {editJob ? "Update Job" : "Create Job"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
