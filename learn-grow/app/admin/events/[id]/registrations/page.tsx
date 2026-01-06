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
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  User,
  Tooltip,
} from "@nextui-org/react";
import {
  useGetEventRegistrationsQuery,
  useGetEventByIdQuery,
  useDeleteRegistrationMutation,
  useUpdateRegistrationMutation,
} from "@/redux/api/eventApi";
import {
  FaArrowLeft,
  FaSearch,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUserFriends,
  FaCalendarAlt,
  FaTicketAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function EventRegistrationsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [selectedEmailHistory, setSelectedEmailHistory] = useState<any>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: historyIsOpen,
    onOpen: historyOnOpen,
    onClose: historyOnClose,
  } = useDisclosure();

  const { data: eventResponse, isLoading: eventLoading } = useGetEventByIdQuery(
    eventId,
    { skip: !eventId }
  );
  const { data: response, isLoading } = useGetEventRegistrationsQuery(
    { eventId, page, limit, search: search || undefined },
    { skip: !eventId }
  );
  const [deleteRegistration] = useDeleteRegistrationMutation();
  const [updateRegistration, { isLoading: updating }] =
    useUpdateRegistrationMutation();

  const event = eventResponse?.data;
  const registrations = response?.data || [];
  const pagination = response?.pagination || response?.data?.pagination;

  const handleExportCsv = () => {
    setExporting(true);
    exportToCSV();
    setExporting(false);
  };

  const handleDelete = async (registrationId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this registration!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteRegistration(registrationId).unwrap();
        toast.success("Registration deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete registration");
      }
    }
  };

  const handleEditClick = (registration: any) => {
    setEditingId(registration._id);
    setEditFormData({
      fullName: registration.fullName,
      email: registration.email,
      phoneNumber: registration.phoneNumber,
    });
    onOpen();
  };

  const handleSaveEdit = async () => {
    if (
      !editingId ||
      !editFormData.fullName ||
      !editFormData.email ||
      !editFormData.phoneNumber
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await updateRegistration({
        id: editingId,
        ...editFormData,
      }).unwrap();
      toast.success("Registration updated successfully");
      onClose();
      setEditingId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update registration");
    }
  };

  const handleViewEmailHistory = (registration: any) => {
    setSelectedEmailHistory(registration);
    historyOnOpen();
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      "Full Name",
      "Email",
      "Phone Number",
      "Registered On",
      "Notification Sent",
    ];
    const csvContent = [
      headers.join(","),
      ...registrations.map((reg: any) =>
        [
          `"${reg.fullName}"`,
          `"${reg.email}"`,
          `"${reg.phoneNumber}"`,
          `"${new Date(reg.createdAt).toLocaleString()}"`,
          reg.notificationSent ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event?.title}_registrations.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" label="Loading event details..." color="secondary" />
      </div>
    );
  }

  if (!event && !eventLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Card className="border-2 border-red-500 max-w-lg w-full shadow-xl">
          <CardBody className="p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Event Not Found
            </h2>
            <Button
              color="primary"
              onPress={() => router.push("/admin/events")}
              size="lg"
            >
              Return to Events
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      {/* Premium Header */}
      <div className="mb-8 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin/events")}
            className="mb-4 text-white/90 hover:bg-white/20"
          >
            Back to Events
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Chip
                  color="warning"
                  variant="solid"
                  className="text-white font-bold uppercase tracking-wider"
                  size="sm"
                >
                  {event.type}
                </Chip>
                <Chip
                  color={event.mode === "Online" ? "success" : "default"}
                  variant="flat"
                  className="text-white bg-white/20 border border-white/30 backdrop-blur-md"
                  startContent={
                    event.mode === "Online" ? (
                      <span className="w-2 h-2 rounded-full bg-green-400 ml-1 animate-pulse"></span>
                    ) : (
                      <FaMapMarkerAlt className="ml-1 text-white" />
                    )
                  }
                >
                  {event.mode}
                </Chip>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                {event.title}
              </h1>
              <div className="flex items-center gap-6 text-violet-100 text-sm md:text-base">
                <span className="flex items-center gap-2">
                  <FaCalendarAlt />{" "}
                  {new Date(event.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock /> {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            {/* Quick Stats in Header */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px] text-center">
                <p className="text-3xl font-bold">{event.registeredCount}</p>
                <p className="text-xs uppercase tracking-wider opacity-80">
                  Registered
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px] text-center">
                <p className="text-3xl font-bold">
                  {Math.max(0, event.maxSeats - event.registeredCount)}
                </p>
                <p className="text-xs uppercase tracking-wider opacity-80">
                  Seats Left
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-white opacity-10 blur-3xl"></div>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-lg border border-gray-100">
        <CardBody className="p-6">

          {/* Actions & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <FaUserFriends />
              </span>
              Registrations List
            </h2>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Button
                color="secondary"
                variant="flat"
                startContent={<FaEnvelope />}
                onPress={() =>
                  router.push(`/admin/events/${eventId}/registrations/email`)
                }
                isDisabled={registrations.length === 0}
                className="font-medium"
              >
                Send Email
              </Button>
              <Button
                color="success"
                className="text-white font-medium bg-gradient-to-r from-emerald-500 to-teal-500 border-none"
                startContent={<FaDownload />}
                onPress={handleExportCsv}
                isDisabled={registrations.length === 0 || exporting}
                isLoading={exporting}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Search & Pagination Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-5 lg:col-span-4">
              <Input
                placeholder="Search attendee..."
                startContent={<FaSearch className="text-gray-400" />}
                value={search}
                onValueChange={setSearch}
                variant="bordered"
                size="lg"
                classNames={{
                  inputWrapper:
                    "border-1 border-gray-200 hover:border-gray-300 focus-within:border-violet-500",
                }}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-2">
              <Select
                label="Per page"
                selectedKeys={[limit.toString()]}
                onSelectionChange={(keys) => {
                  setLimit(Number(Array.from(keys)[0]));
                  setPage(1);
                }}
                variant="bordered"
                size="sm"
                className="max-w-xs"
              >
                <SelectItem key="10">10 Rows</SelectItem>
                <SelectItem key="20">20 Rows</SelectItem>
                <SelectItem key="50">50 Rows</SelectItem>
                <SelectItem key="100">100 Rows</SelectItem>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" label="Loading registrations..." color="secondary" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="mb-4 inline-flex p-4 bg-gray-100 rounded-full text-gray-400">
                <FaUserFriends size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-700">No Registrations Yet</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                Registrations will appear here once students or users sign up for this event.
              </p>
            </div>
          ) : (
            <>
              <Table
                aria-label="Registrations table"
                className="mb-6"
                selectionMode="none"
                removeWrapper
                classNames={{
                  th: "bg-gray-50 text-gray-600 font-bold uppercase text-xs p-4",
                  td: "p-4 border-b border-gray-50",
                  table: "min-w-full"
                }}
              >
                <TableHeader>
                  <TableColumn>ATTENDEE</TableColumn>
                  <TableColumn>CONTACT INFO</TableColumn>
                  <TableColumn>REGISTERED DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn align="center">ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration: any) => (
                    <TableRow key={registration._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <User
                          name={registration.fullName}
                          description={registration.role || "Detail N/A"}
                          avatarProps={{
                            size: "sm",
                            color: "secondary",
                            name: registration.fullName?.charAt(0).toUpperCase(),
                            src: registration.profileImage // Assuming image might exist, fallback to initial
                          }}
                          classNames={{
                            name: "font-semibold text-gray-800",
                            description: "text-gray-500 text-xs"
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaEnvelope className="text-gray-400 text-xs" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaPhone className="text-gray-400 text-xs" />
                            {registration.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(registration.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Click to view email history">
                          <button
                            onClick={() => handleViewEmailHistory(registration)}
                            className="focus:outline-none"
                          >
                            <Chip
                              size="sm"
                              variant="flat"
                              color={registration.notificationSent ? "success" : "warning"}
                              startContent={registration.notificationSent ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                              className="capitalize cursor-pointer hover:scale-105 transition-transform"
                            >
                              {registration.notificationSent ? "Notified" : "Pending"}
                            </Chip>
                          </button>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip content="Edit Details">
                            <Button
                              isIconOnly
                              size="sm"
                              color="secondary"
                              variant="light"
                              onPress={() => handleEditClick(registration)}
                            >
                              <FaEdit className="text-lg" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete Registration" color="danger">
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => handleDelete(registration._id)}
                            >
                              <FaTrash className="text-lg" />
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
                <div className="flex justify-center mt-6 border-t border-gray-100 pt-6">
                  <Pagination
                    total={pagination.totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="secondary"
                    variant="flat"
                    size="lg"
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Email History Modal */}
      <Modal
        isOpen={historyIsOpen}
        onClose={historyOnClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          header: "border-b border-gray-100",
          footer: "border-t border-gray-100"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-secondary-100 text-secondary-600 rounded-lg">
                <FaEnvelope />
              </div>
              <div>
                <h3 className="text-lg font-bold">Email History</h3>
                <p className="text-xs text-gray-500 font-normal">History for {selectedEmailHistory?.fullName}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="space-y-6">

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-semibold uppercase">Successful</p>
                    <p className="text-2xl font-bold text-green-700">
                      {selectedEmailHistory?.emailHistory?.filter((e: any) => e.status === "success").length || 0}
                    </p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-200" />
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-semibold uppercase">Failed</p>
                    <p className="text-2xl font-bold text-red-700">
                      {selectedEmailHistory?.emailHistory?.filter((e: any) => e.status === "failed").length || 0}
                    </p>
                  </div>
                  <FaTimesCircle className="text-3xl text-red-200" />
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${selectedEmailHistory?.notificationSent ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                <span className="font-medium text-gray-700">
                  Current Notification Status: <span className={selectedEmailHistory?.notificationSent ? "text-green-600" : "text-yellow-600"}>{selectedEmailHistory?.notificationSent ? "Sent" : "Pending"}</span>
                </span>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <FaClock className="text-gray-400" /> Timeline
                </h4>

                {selectedEmailHistory?.emailHistory && selectedEmailHistory.emailHistory.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                    {selectedEmailHistory.emailHistory.map((email: any, index: number) => {
                      const isSuccess = email.status === "success";
                      return (
                        <div key={index} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[29px] top-1 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isSuccess ? "bg-green-500" : "bg-red-500"}`}>
                            {isSuccess ? <FaCheckCircle className="text-white text-[10px]" /> : <FaTimesCircle className="text-white text-[10px]" />}
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <p className={`font-bold text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                                {isSuccess ? "Email Sent Successfully" : "Email Delivery Failed"}
                              </p>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(email.sentAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-500 font-medium">Subject:</span> <span className="text-gray-800">{email.subject}</span>
                              </div>

                              {email.failureReason && (
                                <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex gap-2 items-start">
                                  <FaTimesCircle className="mt-0.5" />
                                  <span>{email.failureReason}</span>
                                </div>
                              )}

                              {isSuccess && (
                                <details className="group">
                                  <summary className="text-xs text-secondary-600 cursor-pointer hover:text-secondary-700 font-medium flex items-center gap-1 select-none">
                                    <span>View Email Content</span>
                                  </summary>
                                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 max-h-60 overflow-y-auto prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: email.content }} />
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaEnvelope />
                    </div>
                    <p className="text-gray-500 text-sm">No emails have been sent to this user yet.</p>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={historyOnClose}>
              Close Log
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-gray-800">
            Edit Registration
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={editFormData.fullName}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, fullName: value })
                }
                variant="bordered"
                startContent={<FaUserFriends className="text-gray-400" />}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={editFormData.email}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, email: value })
                }
                variant="bordered"
                startContent={<FaEnvelope className="text-gray-400" />}
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={editFormData.phoneNumber}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, phoneNumber: value })
                }
                variant="bordered"
                startContent={<FaPhone className="text-gray-400" />}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveEdit}
              isLoading={updating}
              disabled={updating}
              className="font-bold"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
