"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Divider,
  Textarea,
} from "@nextui-org/react";
import {
  FaArrowLeft,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaPaperPlane,
} from "react-icons/fa";
import {
  useGetTicketByIdQuery,
  useAddReplyMutation,
} from "@/redux/features/ticketApi";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import RequireAuth from "@/components/Auth/RequireAuth";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const statusConfig = {
  open: { color: "primary" as const, icon: FaClock, label: "Open" },
  in_progress: {
    color: "warning" as const,
    icon: FaExclamationCircle,
    label: "In Progress",
  },
  solved: { color: "success" as const, icon: FaCheckCircle, label: "Solved" },
  closed: { color: "default" as const, icon: FaTimesCircle, label: "Closed" },
};

const priorityConfig = {
  low: { color: "default" as const, label: "Low" },
  medium: { color: "primary" as const, label: "Medium" },
  high: { color: "warning" as const, label: "High" },
  urgent: { color: "danger" as const, label: "Urgent" },
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = ["header", "bold", "italic", "underline", "list", "code-block", "link"];

function InstructorTicketDetailContent() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [replyContent, setReplyContent] = useState("");

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId);
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();

  const ticket = data?.data;

  const handleAddReply = async () => {
    if (!replyContent.trim() || replyContent === "<p><br></p>") {
      toast.error("Please enter a reply");
      return;
    }

    try {
      await addReply({ id: ticketId, message: replyContent }).unwrap();
      toast.success("Reply added successfully");
      setReplyContent("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add reply");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-12 w-48 mb-8 rounded-lg" />
        <Card>
          <CardBody className="p-8">
            <Skeleton className="h-64 rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardBody className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Ticket not found</h3>
            <p className="text-gray-600 mb-6">
              The ticket you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button color="primary" onPress={() => router.push("/instructor/tickets")}>
              Back to Tickets
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[ticket.status].icon;
  const isClosed = ticket.status === "closed";

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button
        startContent={<FaArrowLeft />}
        variant="light"
        onPress={() => router.push("/instructor/tickets")}
        className="mb-6"
      >
        Back to Tickets
      </Button>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col items-start gap-4 p-6">
          <div className="w-full flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3">{ticket.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  color={statusConfig[ticket.status].color}
                  variant="flat"
                  startContent={<StatusIcon className="text-sm" />}
                >
                  {statusConfig[ticket.status].label}
                </Chip>
                <Chip
                  color={priorityConfig[ticket.priority].color}
                  variant="flat"
                >
                  {priorityConfig[ticket.priority].label} Priority
                </Chip>
                <Chip variant="flat">{ticket.category}</Chip>
              </div>
            </div>
          </div>

          <Divider />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={ticket.createdBy.profileImage}
                name={ticket.createdBy.name}
                size="sm"
                fallback={<FaUser />}
              />
              <div>
                <p className="font-semibold">{ticket.createdBy.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ticket Content */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <h3 className="font-semibold text-lg mb-3">Description</h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />
        </CardBody>
      </Card>

      {/* Replies */}
      {ticket.replies && ticket.replies.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold text-lg">
              Replies ({ticket.replies.length})
            </h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <div className="space-y-6">
              {ticket.replies.map((reply: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <Avatar
                    src={reply.userId?.profileImage}
                    name={reply.userId?.name || "User"}
                    size="sm"
                    fallback={<FaUser />}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{reply.userId?.name || "User"}</p>
                      <Chip size="sm" variant="flat">
                        {reply.userRole || "user"}
                      </Chip>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className="prose max-w-none bg-gray-50 p-4 rounded-lg"
                      dangerouslySetInnerHTML={{ __html: reply.message }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add Reply */}
      {!isClosed && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg">Add Reply</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <ReactQuill
              theme="snow"
              value={replyContent}
              onChange={setReplyContent}
              modules={quillModules}
              formats={formats}
              placeholder="Write your reply here..."
              className="bg-white mb-12"
              style={{ height: "200px" }}
            />
            <div className="flex justify-end pt-4">
              <Button
                color="primary"
                startContent={<FaPaperPlane />}
                onPress={handleAddReply}
                isLoading={isAddingReply}
                isDisabled={!replyContent.trim() || replyContent === "<p><br></p>"}
              >
                Send Reply
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Closed Ticket Message */}
      {isClosed && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg">Ticket Closed</h3>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <p className="text-gray-600">
              This ticket is closed. No new replies can be added.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function InstructorTicketDetailPage() {
  return (
    <RequireAuth allowedRoles={["instructor"]}>
      <InstructorTicketDetailContent />
    </RequireAuth>
  );
}
