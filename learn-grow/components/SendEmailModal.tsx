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
  Card,
  CardBody,
  Spinner,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  () => import("react-quill-new"),
  { ssr: false }
);

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantEmail: string;
  applicantName: string;
  onSendEmail: (data: { subject: string; message: string }) => Promise<void>;
  isSending?: boolean;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  applicantEmail,
  applicantName,
  onSendEmail,
  isSending = false,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setError("");
    onClose();
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }

    if (!message.trim()) {
      setError("Message is required");
      return;
    }

    try {
      setError("");
      await onSendEmail({ subject, message });
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to send email");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <p>Send Email</p>
          <p className="text-sm font-normal text-gray-600">{applicantName}</p>
          <p className="text-xs text-gray-500">{applicantEmail}</p>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {error && (
            <Card className="bg-red-50 border border-red-200">
              <CardBody className="p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </CardBody>
            </Card>
          )}

          <Input
            label="Subject *"
            placeholder="e.g., Interview Scheduled for Senior Developer Position"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            isDisabled={isSending}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Message *</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden opacity-100">
              <ReactQuill
                value={message}
                onChange={setMessage}
                placeholder="Compose your message here..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    ["blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    ["link", "image", "video"],
                    ["clean"],
                  ],
                }}
                theme="snow"
              />
            </div>
          </div>

          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="p-3 space-y-2">
              <p className="text-xs font-medium text-blue-900">📧 Email Info:</p>
              <p className="text-xs text-blue-800">
                <strong>To:</strong> {applicantEmail}
              </p>
              <p className="text-xs text-blue-800">
                <strong>Name:</strong> {applicantName}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                ✓ This email will be tracked
              </p>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleClose}
            isDisabled={isSending}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSend}
            isLoading={isSending}
            disabled={isSending || !subject.trim() || !message.trim()}
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
