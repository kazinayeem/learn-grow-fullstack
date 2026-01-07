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
  Pagination,
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
import RequireAuth from "@/components/Auth/RequireAuth";

function InstructorTicketsContent() {
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

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FaTicketAlt className="text-primary" />
              Support Tickets
            </h1>
            <p className="text-gray-600">Manage your support requests and get help</p>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6">
                  <Skeleton className="h-20 rounded-lg" />
                </CardBody>
              </Card>
            ))
        ) : (
          <>
            <Card className="border-l-4 border-primary">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FaClock className="text-primary text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Open</p>
                    <p className="text-3xl font-bold">{stats?.open || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-warning">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-warning/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FaExclamationCircle className="text-warning text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-3xl font-bold">{stats?.inProgress || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-success">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="text-success text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Solved</p>
                    <p className="text-3xl font-bold">{stats?.solved || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-default">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-default/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FaTimesCircle className="text-default text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Closed</p>
                    <p className="text-3xl font-bold">{stats?.closed || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-4">
          <Tabs
            selectedKey={selectedStatus}
            onSelectionChange={(key) => setSelectedStatus(key as string)}
            color="primary"
            variant="underlined"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full",
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

      {/* Tickets Grid */}
      {ticketsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardBody className="p-5">
                  <Skeleton className="h-32 rounded-lg" />
                </CardBody>
              </Card>
            ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === "all"
                ? "Create your first support ticket to get help"
                : `No ${selectedStatus.replace("_", " ")} tickets at the moment`}
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
            <div className="flex justify-center mt-8">
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

export default function InstructorTicketsPage() {
  return (
    <RequireAuth allowedRoles={["instructor"]}>
      <InstructorTicketsContent />
    </RequireAuth>
  );
}
