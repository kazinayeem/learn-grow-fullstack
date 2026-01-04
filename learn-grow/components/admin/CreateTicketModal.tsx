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
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

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
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-2xl font-bold">
          Create Support Ticket
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Ticket Title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="bordered"
              isRequired
              maxLength={200}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                placeholder="Select priority"
                selectedKeys={[priority]}
                onChange={(e) => setPriority(e.target.value)}
                variant="bordered"
              >
                <SelectItem key="low" value="low">
                  Low
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  Medium
                </SelectItem>
                <SelectItem key="high" value="high">
                  High
                </SelectItem>
                <SelectItem key="urgent" value="urgent">
                  Urgent
                </SelectItem>
              </Select>

              <Select
                label="Category"
                placeholder="Select category"
                selectedKeys={[category]}
                onChange={(e) => setCategory(e.target.value)}
                variant="bordered"
              >
                <SelectItem key="technical" value="technical">
                  Technical Issue
                </SelectItem>
                <SelectItem key="billing" value="billing">
                  Billing & Payments
                </SelectItem>
                <SelectItem key="course" value="course">
                  Course Related
                </SelectItem>
                <SelectItem key="account" value="account">
                  Account Issues
                </SelectItem>
                <SelectItem key="other" value="other">
                  Other
                </SelectItem>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description *
              </label>
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={modules}
                formats={formats}
                placeholder="Describe your issue in detail..."
                className="bg-white"
                style={{ height: "200px", marginBottom: "50px" }}
              />
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Attach Media (URL only)
              </h4>
              <Input
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                variant="bordered"
                description="Paste the URL of an image to include"
              />
              <Input
                label="Video URL"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                variant="bordered"
                description="Paste YouTube or Vimeo URL"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isValid}
            isLoading={isLoading}
          >
            Create Ticket
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
