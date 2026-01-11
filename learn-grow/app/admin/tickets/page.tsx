"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  useDisclosure,
} from "@nextui-org/react";
import {
  FaPlus,
  FaTicketAlt,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  useGetAllTicketsQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
} from "@/redux/features/ticketApi";
import TicketCard from "@/components/admin/TicketCard";
import CreateTicketModal from "@/components/admin/CreateTicketModal";
import { toast } from "react-hot-toast";

export default function TicketsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: statsData, isLoading: statsLoading } = useGetTicketStatsQuery(undefined);
  const { data: ticketsData, isLoading: ticketsLoading } =
    useGetAllTicketsQuery({
      status: selectedStatus === "all" ? undefined : selectedStatus,
    });
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();

  const stats = statsData?.data;
  const tickets = ticketsData?.data || [];

  const handleCreateTicket = async (data: any) => {
    try {
      await createTicket(data).unwrap();
      toast.success("Ticket created successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
            Support Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track support tickets
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardBody className="p-4 sm:p-5 lg:p-6">
                <Skeleton className="h-16 sm:h-20 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Open</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">
                    {stats?.open || 0}
                  </p>
                </div>
                <div className="bg-primary-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <FaClock className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">In Progress</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warning-600">
                    {stats?.inProgress || 0}
                  </p>
                </div>
                <div className="bg-warning-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <FaExclamationCircle className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-success-200 bg-gradient-to-br from-success-50 to-emerald-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Solved</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-success-600">
                    {stats?.solved || 0}
                  </p>
                </div>
                <div className="bg-success-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <FaCheckCircle className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Closed</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-600">
                    {stats?.closed || 0}
                  </p>
                </div>
                <div className="bg-gray-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <FaTimesCircle className="text-lg sm:text-xl lg:text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-5 sm:mb-6 shadow-md hover:shadow-lg transition-shadow">
        <CardBody className="p-3 sm:p-4 overflow-x-auto">
          <Tabs
            selectedKey={selectedStatus}
            onSelectionChange={(key) => setSelectedStatus(key as string)}
            variant="underlined"
            color="primary"
            classNames={{
              tabList: "gap-4 sm:gap-6 w-full",
              cursor: "w-full",
              tab: "min-h-[44px] px-3 sm:px-4",
              tabContent: "text-sm sm:text-base font-medium"
            }}
          >
            <Tab key="all" title="All Tickets" />
            <Tab key="open" title="Open" />
            <Tab key="in_progress" title="In Progress" />
            <Tab key="solved" title="Solved" />
            <Tab key="closed" title="Closed" />
          </Tabs>
        </CardBody>
      </Card>

      {/* Tickets List */}
      {ticketsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardBody className="p-4 sm:p-5">
                <Skeleton className="h-32 sm:h-36 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="shadow-lg border border-gray-100">
          <CardBody className="text-center py-10 sm:py-12 lg:py-16 px-4">
            <FaTicketAlt className="text-5xl sm:text-6xl lg:text-7xl text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">
              No tickets found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
              {selectedStatus === "all"
                ? "Create your first ticket to get started"
                : `No tickets with status: ${selectedStatus}`}
            </p>
            <Button
              color="primary"
              startContent={<FaPlus />}
              onPress={onOpen}
              size="md"
              className="min-h-[44px] font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              Create Ticket
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {tickets.map((ticket: any) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateTicket}
        isLoading={isCreating}
      />
    </div>
  );
}
