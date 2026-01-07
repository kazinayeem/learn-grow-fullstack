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
  Ticket,
  TicketReply,
} from "@/redux/features/ticketApi";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

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

export default function StudentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  // Get user role from localStorage
  const [userRole, setUserRole] = useState<string>("");
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserRole(user.role || "");
        } catch (e) {
          console.error("Failed to parse user:", e);
        }
      }
    }
  }, []);

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId);
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();

  const [replyMessage, setReplyMessage] = useState("");
  
  // Determine back route based on user role
  const getBackRoute = () => {
    if (userRole === "instructor") return "/instructor/tickets";
    return "/student/tickets";
  };

  const ticket: Ticket | undefined = data?.data;

  const handleAddReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await addReply({
        id: ticketId,
        message: replyMessage,
      }).unwrap();
      toast.success("Reply added successfully");
      setReplyMessage("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add reply");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-40 rounded-lg mb-6" />
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
          </CardHeader>
          <CardBody>
            <Skeleton className="h-32 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl text-center">
        <p className="text-danger">Failed to load ticket</p>
        <Button onPress={() => router.push(getBackRoute())} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button
        startContent={<FaArrowLeft />}
        onPress={() => router.push(getBackRoute())}
        variant="light"
        className="mb-6"
      >
        Back to My Tickets
      </Button>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col items-start gap-3 pb-0">
          <div className="flex items-start justify-between w-full">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <div className="flex gap-2">
              <Chip
                size="lg"
                color={statusInfo.color}
                variant="flat"
                startContent={<StatusIcon />}
              >
                {statusInfo.label}
              </Chip>
              <Chip
                size="lg"
                color={priorityConfig[ticket.priority as keyof typeof priorityConfig].color}
                variant="flat"
              >
                {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
              </Chip>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={ticket.createdBy.profileImage}
              name={ticket.createdBy.name}
              size="md"
              fallback={<FaUser />}
            />
            <div>
              <p className="font-semibold text-gray-900">
                {ticket.createdBy.name}
              </p>
              <p className="text-sm text-gray-500">
                Created on {formatDate(ticket.createdAt)}
              </p>
            </div>
          </div>
          <Divider className="my-4" />
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: ticket.description }}
          />
        </CardBody>
      </Card>

      {/* Replies */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold">
            Replies ({ticket.replies.length})
          </h2>
        </CardHeader>
        <CardBody>
          {ticket.replies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No replies yet</p>
          ) : (
            <div className="space-y-4">
              {ticket.replies.map((reply: TicketReply, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar
                      src={reply.userId.profileImage}
                      name={reply.userId.name}
                      size="sm"
                      fallback={<FaUser />}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {reply.userId.name}
                        </p>
                        <Chip size="sm" variant="flat">
                          {reply.userRole}
                        </Chip>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(reply.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: reply.message }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Reply */}
      {ticket.status !== "closed" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Add Reply</h2>
          </CardHeader>
          <CardBody>
            <ReactQuill
              theme="snow"
              value={replyMessage}
              onChange={setReplyMessage}
              modules={modules}
              formats={formats}
              placeholder="Type your reply..."
              className="bg-white mb-12"
              style={{ height: "200px" }}
            />
            <div className="flex justify-end pt-4">
              <Button
                color="primary"
                startContent={<FaPaperPlane />}
                onPress={handleAddReply}
                isLoading={isAddingReply}
                isDisabled={!replyMessage.trim()}
              >
                Send Reply
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
