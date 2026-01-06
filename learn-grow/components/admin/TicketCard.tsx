"use client";

import React from "react";
import { Card, CardBody, Chip, Avatar, Button } from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

interface Ticket {
  _id: string;
  title: string;
  status: "open" | "in_progress" | "solved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdBy: {
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  createdAt: string;
  replies: any[];
}

interface TicketCardProps {
  ticket: Ticket;
}

const statusConfig = {
  open: { color: "primary" as const, icon: FaClock, label: "Open" },
  in_progress: { color: "warning" as const, icon: FaExclamationCircle, label: "In Progress" },
  solved: { color: "success" as const, icon: FaCheckCircle, label: "Solved" },
  closed: { color: "default" as const, icon: FaTimesCircle, label: "Closed" },
};

const priorityConfig = {
  low: { color: "default" as const, label: "Low" },
  medium: { color: "primary" as const, label: "Medium" },
  high: { color: "warning" as const, label: "High" },
  urgent: { color: "danger" as const, label: "Urgent" },
};

const categoryConfig: Record<string, string> = {
  technical: "Technical",
  billing: "Billing",
  course: "Course",
  account: "Account",
  other: "Other",
};

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const statusInfo = statusConfig[ticket.status];
  const StatusIcon = statusInfo.icon;

  // Determine the base path (admin or student)
  const basePath = pathname.includes("/admin/") ? "/admin/tickets" : "/student/tickets";

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  return (
    <Card
      isPressable
      onPress={() => router.push(`${basePath}/${ticket._id}`)}
      className="hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 cursor-pointer"
    >
      <CardBody className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
              {ticket.title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Chip
                size="sm"
                color={statusInfo.color}
                variant="flat"
                startContent={<StatusIcon className="text-xs" />}
              >
                {statusInfo.label}
              </Chip>
              <Chip
                size="sm"
                color={priorityConfig[ticket.priority].color}
                variant="flat"
              >
                {priorityConfig[ticket.priority].label}
              </Chip>
              <Chip size="sm" variant="flat">
                {categoryConfig[ticket.category] || ticket.category}
              </Chip>
            </div>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar
              src={ticket.createdBy.profileImage}
              name={ticket.createdBy.name}
              size="sm"
              fallback={<FaUser className="text-gray-400" />}
            />
            <div className="text-xs sm:text-sm min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{ticket.createdBy.name}</p>
              <p className="text-gray-500 truncate capitalize">{ticket.createdBy.role}</p>
            </div>
          </div>
          <div className="text-left xs:text-right flex-shrink-0">
            <p className="text-xs sm:text-sm text-gray-500">{timeAgo(ticket.createdAt)}</p>
            {ticket.replies.length > 0 && (
              <p className="text-xs sm:text-sm text-primary-600 font-medium mt-0.5">
                {ticket.replies.length} {ticket.replies.length === 1 ? "reply" : "replies"}
              </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
