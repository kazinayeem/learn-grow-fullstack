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
  Pagination,
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

export default function StudentTicketsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 12;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: statsData, isLoading: statsLoading } = useGetTicketStatsQuery();
  const { data: ticketsData, isLoading: ticketsLoading } =
    useGetAllTicketsQuery({
      status: selectedStatus === "all" ? undefined : selectedStatus,
      page,
      limit,
    });
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();

  const stats = statsData?.data;
  const tickets = ticketsData?.data || [];
  const totalPages = ticketsData?.pagination?.totalPages || 1;

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Support Tickets
          </h1>
          <p className="text-gray-600">
            Create and track your support requests
          </p>
        </div>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={onOpen}
          size="lg"
        >
          Create Ticket
        </Button>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody className="p-6">
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Open</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {stats?.open || 0}
                  </p>
                </div>
                <div className="bg-primary-500 p-3 rounded-full">
                  <FaClock className="text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-orange-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-warning-600">
                    {stats?.inProgress || 0}
                  </p>
                </div>
                <div className="bg-warning-500 p-3 rounded-full">
                  <FaExclamationCircle className="text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-success-200 bg-gradient-to-br from-success-50 to-emerald-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Solved</p>
                  <p className="text-3xl font-bold text-success-600">
                    {stats?.solved || 0}
                  </p>
                </div>
                <div className="bg-success-500 p-3 rounded-full">
                  <FaCheckCircle className="text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Closed</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {stats?.closed || 0}
                  </p>
                </div>
                <div className="bg-gray-500 p-3 rounded-full">
                  <FaTimesCircle className="text-2xl text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <Tabs
            selectedKey={selectedStatus}
            onSelectionChange={(key) => {
              setSelectedStatus(key as string);
              setPage(1); // Reset to first page when changing filter
            }}
            variant="underlined"
            color="primary"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody className="p-5">
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedStatus === "all"
                ? "Create your first ticket to get support"
                : `No tickets with status: ${selectedStatus}`}
            </p>
            <Button color="primary" startContent={<FaPlus />} onPress={onOpen}>
              Create Ticket
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {tickets.map((ticket: any) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
                color="primary"
                size="lg"
              />
            </div>
          )}
        </>
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
