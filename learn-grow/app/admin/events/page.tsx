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
  Card,
  CardBody,
  Skeleton,
  Avatar,
} from "@nextui-org/react";
import {
  useGetAllEventsQuery,
  useDeleteEventMutation,
} from "@/redux/api/eventApi";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaEye, FaArrowLeft, FaCalendar, FaCheckCircle, FaClock, FaTimes } from "react-icons/fa";
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

  const events = Array.isArray(response?.data) ? response?.data : response?.data?.events || [];
  const pagination = response?.pagination;
  const totalEvents = pagination?.total || events.length;
  const upcomingEvents = events.filter((e: any) => e.status === "Upcoming").length;
  const ongoingEvents = events.filter((e: any) => e.status === "Ongoing").length;
  const totalRegistrations = events.reduce((sum: number, e: any) => sum + (e.registeredCount || 0), 0);

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

  const getEventIcon = (type: string) => {
    const lower = type?.toLowerCase();
    if (lower?.includes("workshop")) return "🛠️";
    if (lower?.includes("seminar")) return "📚";
    if (lower?.includes("webinar")) return "💻";
    if (lower?.includes("conference")) return "🎤";
    if (lower?.includes("competition")) return "🏆";
    if (lower?.includes("meetup")) return "🤝";
    return "📅";
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const hasActiveFilters = search || typeFilter || statusFilter;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <Skeleton className="h-32 sm:h-40 w-full rounded-2xl mb-6" />
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="light"
              startContent={<FaArrowLeft />}
              onPress={() => {
                const userStr = localStorage.getItem("user");
                const user = userStr ? JSON.parse(userStr) : null;
                router.push(user?.role === "manager" ? "/manager" : "/admin");
              }}
              className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <FaCalendar className="text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Event Management
                </h1>
                <p className="text-sm sm:text-base text-white/90 mt-1">
                  Create and manage events for your community
                </p>
              </div>
            </div>
          </div>
          <Button
            color="default"
            startContent={<FaPlus />}
            onPress={() => router.push("/admin/events/create")}
            size="lg"
            className="w-full sm:w-auto min-h-[44px] bg-white text-indigo-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Events</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalEvents}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCalendar className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Upcoming</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{upcomingEvents}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                <FaClock className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Ongoing</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{ongoingEvents}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Registrations</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalRegistrations}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaUsers className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters - Modern Design */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-4 sm:p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</label>
            <Input
              placeholder="Search events..."
              startContent={<FaSearch className="text-indigo-500" />}
              value={search}
              onValueChange={setSearch}
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Event Type</label>
            <Select
              placeholder="All Types"
              selectedKeys={typeFilter ? [typeFilter] : []}
              onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string || "")}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="">All Types</SelectItem>
              <SelectItem key="Workshop">🛠️ Workshop</SelectItem>
              <SelectItem key="Seminar">📚 Seminar</SelectItem>
              <SelectItem key="Webinar">💻 Webinar</SelectItem>
              <SelectItem key="Conference">🎤 Conference</SelectItem>
              <SelectItem key="Competition">🏆 Competition</SelectItem>
              <SelectItem key="Meetup">🤝 Meetup</SelectItem>
              <SelectItem key="Other">📅 Other</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
            <Select
              placeholder="All Statuses"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string || "")}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="">All Statuses</SelectItem>
              <SelectItem key="Upcoming">Upcoming</SelectItem>
              <SelectItem key="Ongoing">Ongoing</SelectItem>
              <SelectItem key="Completed">Completed</SelectItem>
              <SelectItem key="Cancelled">Cancelled</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Items per page</label>
            <Select
              placeholder="Select limit"
              selectedKeys={[limit.toString()]}
              onSelectionChange={(keys) => {
                setLimit(Number(Array.from(keys)[0]));
                setPage(1);
              }}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="10">10 per page</SelectItem>
              <SelectItem key="20">20 per page</SelectItem>
              <SelectItem key="50">50 per page</SelectItem>
              <SelectItem key="100">100 per page</SelectItem>
            </Select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-4">
            <Button
              color="default"
              variant="flat"
              size="lg"
              onPress={clearFilters}
              startContent={<FaTimes />}
              className="min-h-[48px] font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Events Table/Cards */}
      <Card className="shadow-xl">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {events.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendar className="text-4xl sm:text-5xl text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No events found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {hasActiveFilters ? "Try adjusting your filters" : "Create your first event to get started"}
              </p>
              <Button
                color="primary"
                startContent={<FaPlus />}
                onPress={() => router.push("/admin/events/create")}
                size="lg"
                className="min-h-[44px] font-semibold shadow-lg"
              >
                Create Your First Event
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Events table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
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
                      <TableRow key={event._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {event.shortDescription}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="primary">
                            {getEventIcon(event.type)} {event.type}
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
                            <p className="font-semibold">{new Date(event.eventDate).toLocaleDateString()}</p>
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
                            <FaUsers className="text-indigo-500 flex-shrink-0" />
                            <span className="text-sm font-bold text-gray-900">
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
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {events.map((event: any) => (
                  <Card
                    key={event._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-4xl flex-shrink-0">{getEventIcon(event.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{event.shortDescription}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Chip size="sm" variant="flat" color="primary">
                              {event.type}
                            </Chip>
                            <Chip size="sm" variant="flat" color={event.mode === "Online" ? "success" : "warning"}>
                              {event.mode}
                            </Chip>
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
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Date:</span>
                          <span className="text-gray-700 ml-2 font-semibold">{new Date(event.eventDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Time:</span>
                          <span className="text-gray-700 ml-2">{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-indigo-500 flex-shrink-0 text-lg" />
                          <span className="font-bold text-gray-900">{event.registeredCount} / {event.maxSeats}</span>
                          <Chip size="sm" variant="flat" color={event.isRegistrationOpen ? "success" : "danger"}>
                            {event.isRegistrationOpen ? "Open" : "Closed"}
                          </Chip>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="md"
                          variant="flat"
                          className="min-h-[44px] font-semibold"
                          startContent={<FaEye />}
                          onPress={() => router.push(`/events/${event._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="md"
                          color="primary"
                          variant="flat"
                          className="min-h-[44px] font-semibold"
                          startContent={<FaEdit />}
                          onPress={() => router.push(`/admin/events/edit/${event._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="md"
                          color="success"
                          variant="flat"
                          className="min-h-[44px] font-semibold"
                          startContent={<FaUsers />}
                          onPress={() => router.push(`/admin/events/${event._id}/registrations`)}
                        >
                          Registrations
                        </Button>
                        <Button
                          size="md"
                          color="danger"
                          variant="flat"
                          className="min-h-[44px] font-semibold"
                          startContent={<FaTrash />}
                          onPress={() => openDeleteModal(event._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 px-4 pb-4">
                  <Pagination
                    total={pagination.totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="primary"
                    size="lg"
                    classNames={{
                      cursor: "min-w-[44px] min-h-[44px]",
                      item: "min-w-[44px] min-h-[44px]",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaTrash className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delete Event</h2>
                    <p className="text-sm text-white/90 font-normal">Confirm deletion</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <p className="text-gray-700">Are you sure you want to delete this event?</p>
                <p className="text-sm text-danger font-medium mt-2">
                  This action cannot be undone. All registrations will also be deleted.
                </p>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 p-6">
                <Button
                  variant="light"
                  onPress={onClose}
                  size="lg"
                  className="min-h-[44px] font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={deleting}
                  size="lg"
                  className="min-h-[44px] font-semibold shadow-lg"
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
