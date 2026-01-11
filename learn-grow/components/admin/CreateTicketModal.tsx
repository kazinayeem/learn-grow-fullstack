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
  Chip,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  FaTicketAlt,
  FaExclamationCircle,
  FaImage,
  FaVideo,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: string;
    category: string;
  }) => void;
  isLoading?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["code-block"],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "code-block",
  "link",
];

const priorityOptions = [
  { key: "low", label: "Low", color: "default" as const },
  { key: "medium", label: "Medium", color: "primary" as const },
  { key: "high", label: "High", color: "warning" as const },
  { key: "urgent", label: "Urgent", color: "danger" as const },
];

const categoryOptions = [
  { key: "technical", label: "Technical Issue", icon: "🔧" },
  { key: "billing", label: "Billing & Payments", icon: "💳" },
  { key: "course", label: "Course Related", icon: "📚" },
  { key: "account", label: "Account Issues", icon: "👤" },
  { key: "other", label: "Other", icon: "📝" },
];

export default function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("other");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = () => {
    let finalDescription = description;

    // Add image if URL provided
    if (imageUrl.trim()) {
      finalDescription += `<p><img src="${imageUrl}" alt="Attached image" style="max-width: 100%; height: auto;" /></p>`;
    }

    // Add video if URL provided
    if (videoUrl.trim()) {
      // Extract video ID from YouTube/Vimeo URLs
      let embedUrl = videoUrl;
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const videoId = videoUrl.split("v=")[1] || videoUrl.split("/").pop();
        embedUrl = `https://www.youtube.com/embed/${videoId?.split("&")[0]}`;
      } else if (videoUrl.includes("vimeo.com")) {
        const videoId = videoUrl.split("/").pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      finalDescription += `<p><iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe></p>`;
    }

    onSubmit({
      title,
      description: finalDescription,
      priority,
      category,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("other");
    setImageUrl("");
    setVideoUrl("");
  };

  const isValid = title.trim() && description.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 bg-gradient-to-r from-primary-500 to-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaTicketAlt className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Create Support Ticket</h2>
                  <p className="text-sm text-white/90 font-normal">
                    Describe your issue and we'll help you resolve it
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              <div className="space-y-6">
                {/* Ticket Title */}
                <div className="space-y-2">
                  <Input
                    label="Ticket Title"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="bordered"
                    isRequired
                    maxLength={200}
                    size="lg"
                    classNames={{
                      input: "text-base",
                      label: "text-sm font-semibold",
                    }}
                    startContent={
                      <FaExclamationCircle className="text-gray-400" />
                    }
                  />
                  <p className="text-xs text-gray-500 ml-1">
                    {title.length}/200 characters
                  </p>
                </div>

                {/* Priority and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Priority Level"
                    placeholder="Select priority"
                    selectedKeys={[priority]}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      // Auto-close if both priority and category are selected
                      if (category !== "other") {
                        setTimeout(() => onClose(), 150);
                      }
                    }}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "text-sm font-semibold",
                    }}
                  >
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color={option.color} variant="flat">
                            {option.label}
                          </Chip>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Category"
                    placeholder="Select category"
                    selectedKeys={[category]}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      // Auto-close if both priority and category are selected
                      if (priority !== "") {
                        setTimeout(() => onClose(), 150);
                      }
                    }}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "text-sm font-semibold",
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Description <span className="text-danger">*</span>
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors">
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      modules={modules}
                      formats={formats}
                      placeholder="Describe your issue in detail... Include steps to reproduce, error messages, or any relevant information."
                      className="bg-white"
                      style={{ height: "200px", marginBottom: "50px" }}
                    />
                  </div>
                </div>

                {/* Media Attachments */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <FaImage className="text-white text-sm" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-700">
                      Attach Media (Optional)
                    </h4>
                  </div>

                  <Input
                    label="Image URL"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    variant="bordered"
                    description="Paste the URL of an image to include"
                    startContent={<FaImage className="text-gray-400" />}
                    classNames={{
                      label: "text-sm font-medium",
                    }}
                  />

                  <Input
                    label="Video URL"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    variant="bordered"
                    description="Paste YouTube or Vimeo URL"
                    startContent={<FaVideo className="text-gray-400" />}
                    classNames={{
                      label: "text-sm font-medium",
                    }}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-gray-200 p-6">
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                size="lg"
                startContent={<FaTimes />}
                className="font-semibold"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isDisabled={!isValid}
                isLoading={isLoading}
                size="lg"
                startContent={!isLoading && <FaCheck />}
                className="font-semibold shadow-lg"
              >
                {isLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
