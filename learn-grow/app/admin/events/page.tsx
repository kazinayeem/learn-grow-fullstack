"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import {
  useGetAllEventsQuery,
  useDeleteEventMutation,
} from "@/redux/api/eventApi";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: response, isLoading } = useGetAllEventsQuery({
    page,
    limit,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();

  // Handle both array and nested response formats
  const events = Array.isArray(response?.data) ? response?.data : response?.data?.events || [];
  const pagination = response?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteEvent(deleteId).unwrap();
      toast.success("Event deleted successfully");
      onClose();
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete event");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onOpen();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => router.push("/admin/events/create")}
        >
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search events..."
          startContent={<FaSearch />}
          value={search}
          onValueChange={setSearch}
          variant="bordered"
        />
        <Select
          placeholder="Filter by Type"
          selectedKeys={typeFilter ? [typeFilter] : []}
          onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string || "")}
          variant="bordered"
        >
          <SelectItem key="">All Types</SelectItem>
          <SelectItem key="Workshop">Workshop</SelectItem>
          <SelectItem key="Seminar">Seminar</SelectItem>
          <SelectItem key="Webinar">Webinar</SelectItem>
          <SelectItem key="Conference">Conference</SelectItem>
          <SelectItem key="Competition">Competition</SelectItem>
          <SelectItem key="Meetup">Meetup</SelectItem>
          <SelectItem key="Other">Other</SelectItem>
        </Select>
        <Select
          placeholder="Filter by Status"
          selectedKeys={statusFilter ? [statusFilter] : []}
          onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || "")}
          variant="bordered"
        >
          <SelectItem key="">All Statuses</SelectItem>
          <SelectItem key="Upcoming">Upcoming</SelectItem>
          <SelectItem key="Ongoing">Ongoing</SelectItem>
          <SelectItem key="Completed">Completed</SelectItem>
          <SelectItem key="Cancelled">Cancelled</SelectItem>
        </Select>
        <Select
          placeholder="Items per page"
          selectedKeys={[limit.toString()]}
          onSelectionChange={(keys) => {
            setLimit(Number(Array.from(keys)[0]));
            setPage(1);
          }}
          variant="bordered"
        >
          <SelectItem key="10">10 per page</SelectItem>
          <SelectItem key="20">20 per page</SelectItem>
          <SelectItem key="50">50 per page</SelectItem>
          <SelectItem key="100">100 per page</SelectItem>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" label="Loading events..." />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No events found</p>
          <Button
            color="primary"
            className="mt-4"
            onPress={() => router.push("/admin/events/create")}
          >
            Create Your First Event
          </Button>
        </div>
      ) : (
        <>
          <Table aria-label="Events table" className="mb-6">
            <TableHeader>
              <TableColumn>TITLE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>MODE</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>REGISTRATION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {events.map((event: any) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {event.shortDescription}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {event.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={event.mode === "Online" ? "success" : "warning"}
                    >
                      {event.mode}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(event.eventDate).toLocaleDateString()}</p>
                      <p className="text-gray-500">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        event.status === "Upcoming" ? "primary" :
                        event.status === "Ongoing" ? "success" :
                        event.status === "Completed" ? "default" : "danger"
                      }
                    >
                      {event.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-gray-500" />
                      <span className="text-sm">
                        {event.registeredCount} / {event.maxSeats}
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={event.isRegistrationOpen ? "success" : "danger"}
                      >
                        {event.isRegistrationOpen ? "Open" : "Closed"}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Tooltip content="View Details">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => router.push(`/events/${event._id}`)}
                        >
                          <FaEye />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit Event">
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => router.push(`/admin/events/edit/${event._id}`)}
                        >
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Manage Registrations">
                        <Button
                          isIconOnly
                          size="sm"
                          color="success"
                          variant="light"
                          onPress={() => router.push(`/admin/events/${event._id}/registrations`)}
                        >
                          <FaUsers />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete Event">
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => openDeleteModal(event._id)}
                        >
                          <FaTrash />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={pagination.totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this event?</p>
            <p className="text-sm text-danger">
              This action cannot be undone. All registrations will also be deleted.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
