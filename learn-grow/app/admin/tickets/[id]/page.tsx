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
  Select,
  SelectItem,
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
  useUpdateTicketStatusMutation,
  Ticket,
  TicketReply,
} from "@/redux/features/ticketApi";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

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

type StatusKey = keyof typeof statusConfig;
type PriorityKey = keyof typeof priorityConfig;

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data, isLoading, error } = useGetTicketByIdQuery(ticketId);
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTicketStatusMutation();

  const [replyMessage, setReplyMessage] = useState("");

  const ticket: Ticket | undefined = data?.data;

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ id: ticketId, status }).unwrap();
      toast.success("Status updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-40 rounded-lg mb-6" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl text-center">
        <p className="text-danger">Failed to load ticket</p>
        <Button onPress={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const definedTicket: Ticket = ticket;

  // SAFE CREATOR DATA
  const creatorName = definedTicket?.createdBy?.name || "Unknown User";
  const creatorRole = definedTicket?.createdBy?.role || "User";
  const creatorImage =
    definedTicket?.createdBy?.profileImage || "/logo.png";

  const replies = definedTicket?.replies || [];

  const statusKey = (definedTicket.status || "open") as StatusKey;
  const statusInfo = statusConfig[statusKey] || statusConfig.open;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        startContent={<FaArrowLeft />}
        onPress={() => router.push("/admin/tickets")}
        variant="light"
        className="mb-6"
      >
        Back to Tickets
      </Button>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col items-start gap-3 pb-0">
          <div className="flex items-start justify-between w-full">
            <h1 className="text-2xl font-bold text-gray-900">
              {definedTicket.title}
            </h1>
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
                color={
                  priorityConfig[
                    (definedTicket.priority || "low") as PriorityKey
                  ]?.color
                }
                variant="flat"
              >
                {
                  priorityConfig[
                    (definedTicket.priority || "low") as PriorityKey
                  ]?.label
                }
              </Chip>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={creatorImage}
              name={creatorName}
              size="md"
              fallback={<FaUser />}
            />
            <div>
              <p className="font-semibold text-gray-900">
                {creatorName}
              </p>
              <p className="text-sm text-gray-500">
                {creatorRole} • {formatDate(definedTicket.createdAt)}
              </p>
            </div>
          </div>

          <Divider className="my-4" />

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: definedTicket.description || "",
            }}
          />
        </CardBody>
      </Card>

      {/* Status Update */}
      <Card className="mb-6">
        <CardBody>
          <Select
            label="Update Status"
            onChange={(e) => handleStatusChange(e.target.value)}
            isDisabled={isUpdatingStatus}
            className="max-w-xs"
          >
            <SelectItem key="open" value="open">
              Open
            </SelectItem>
            <SelectItem key="in_progress" value="in_progress">
              In Progress
            </SelectItem>
            <SelectItem key="solved" value="solved">
              Solved
            </SelectItem>
            <SelectItem key="closed" value="closed">
              Closed
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Replies */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold">
            Replies ({replies.length})
          </h2>
        </CardHeader>
        <CardBody>
          {replies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No replies yet
            </p>
          ) : (
            <div className="space-y-4">
              {replies.map((reply: TicketReply, index: number) => {
                const replyUserName =
                  reply?.userId?.name || "Unknown User";
                const replyUserImage =
                  reply?.userId?.profileImage || "/logo.png";

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar
                        src={replyUserImage}
                        name={replyUserName}
                        size="sm"
                        fallback={<FaUser />}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {replyUserName}
                          </p>
                          <Chip size="sm" variant="flat">
                            {reply?.userRole || "User"}
                          </Chip>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(reply?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: reply?.message || "",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Reply */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Add Reply</h2>
        </CardHeader>
        <CardBody>
          <ReactQuill
            theme="snow"
            value={replyMessage}
            onChange={setReplyMessage}
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
    </div>
  );
}
