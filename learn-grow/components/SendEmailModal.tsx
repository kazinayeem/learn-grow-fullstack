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
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { FaEnvelope, FaUser, FaPaperPlane, FaTimes, FaCheckCircle } from "react-icons/fa";

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        {/* Header with Gradient */}
        <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white rounded-t-lg p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaEnvelope className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Send Email</h2>
              <p className="text-sm text-white/90 font-normal">{applicantName}</p>
              <p className="text-xs text-white/80 font-normal">{applicantEmail}</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300">
              <CardBody className="p-4">
                <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Subject Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" />
              Subject *
            </label>
            <Input
              placeholder="e.g., Interview Scheduled for Senior Developer Position"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              isDisabled={isSending}
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 transition-all duration-300",
              }}
            />
          </div>

          {/* Message Editor */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FaPaperPlane className="text-blue-500" />
              Message *
            </label>
            <div className="border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 rounded-xl overflow-hidden transition-all duration-300">
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

          {/* Email Info Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <CardBody className="p-4 sm:p-5 space-y-3">
              <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <FaEnvelope className="text-lg" />
                Email Info
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-blue-800 min-w-[60px]">To:</span>
                  <span className="text-blue-700">{applicantEmail}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-blue-800 min-w-[60px]">Name:</span>
                  <span className="text-blue-700">{applicantName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-white/50 px-3 py-2 rounded-lg mt-2">
                <FaCheckCircle className="text-green-600" />
                <span className="font-medium">This email will be tracked</span>
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 p-6 bg-gray-50">
          <Button
            color="default"
            variant="flat"
            onPress={handleClose}
            isDisabled={isSending}
            size="lg"
            className="min-h-[48px] font-semibold"
            startContent={<FaTimes />}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSend}
            isLoading={isSending}
            disabled={isSending || !subject.trim() || !message.trim()}
            size="lg"
            className="min-h-[48px] font-bold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            startContent={!isSending && <FaPaperPlane />}
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
