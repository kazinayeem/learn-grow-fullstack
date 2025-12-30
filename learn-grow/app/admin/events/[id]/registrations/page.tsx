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
} from "@nextui-org/react";
import { useGetEventRegistrationsQuery, useGetEventByIdQuery, useDeleteRegistrationMutation, useUpdateRegistrationMutation } from "@/redux/api/eventApi";
import { FaArrowLeft, FaSearch, FaDownload, FaEnvelope, FaPhone, FaEdit, FaTrash, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
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
  const [editFormData, setEditFormData] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [selectedEmailHistory, setSelectedEmailHistory] = useState<any>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: historyIsOpen, onOpen: historyOnOpen, onClose: historyOnClose } = useDisclosure();

  const { data: eventResponse } = useGetEventByIdQuery(eventId, { skip: !eventId });
  const { data: response, isLoading } = useGetEventRegistrationsQuery(
    { eventId, page, limit, search: search || undefined },
    { skip: !eventId }
  );
  const [deleteRegistration] = useDeleteRegistrationMutation();
  const [updateRegistration, { isLoading: updating }] = useUpdateRegistrationMutation();

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
    if (!editingId || !editFormData.fullName || !editFormData.email || !editFormData.phoneNumber) {
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

    const headers = ["Full Name", "Email", "Phone Number", "Registered On", "Notification Sent"];
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

  return (
    <div className="p-8">
      <Button
        variant="light"
        startContent={<FaArrowLeft />}
        onPress={() => router.push("/admin/events")}
        className="mb-6"
      >
        Back to Events
      </Button>

      {event && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Chip size="sm" variant="flat" color="primary">
                    {event.type}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={event.mode === "Online" ? "success" : "warning"}
                  >
                    {event.mode}
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </Chip>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{event.registeredCount}</p>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-sm text-gray-500 mt-1">
                  {event.maxSeats - event.registeredCount} seats available
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Registrations</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="flat"
            color="primary"
            startContent={<FaEnvelope />}
            onPress={() => router.push(`/admin/events/${eventId}/registrations/email`)}
            isDisabled={registrations.length === 0}
          >
            Send Email
          </Button>
          <Button
            color="success"
            startContent={<FaDownload />}
            onPress={handleExportCsv}
            isDisabled={registrations.length === 0 || exporting}
            isLoading={exporting}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search by name, email, or phone..."
          startContent={<FaSearch />}
          value={search}
          onValueChange={setSearch}
          variant="bordered"
        />
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
          <Spinner size="lg" label="Loading registrations..." />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No registrations yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Registrations will appear here once users sign up for this event
          </p>
        </div>
      ) : (
        <>
          <Table aria-label="Registrations table" className="mb-6">
            <TableHeader>
              <TableColumn>FULL NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>PHONE NUMBER</TableColumn>
              <TableColumn>REGISTERED ON</TableColumn>
              <TableColumn>NOTIFICATION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {registrations.map((registration: any) => (
                <TableRow key={registration._id}>
                  <TableCell>
                    <p className="font-semibold">{registration.fullName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span>{registration.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      <span>{registration.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(registration.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-500">
                        {new Date(registration.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewEmailHistory(registration)}
                      className="cursor-pointer"
                    >
                      <Chip
                        size="sm"
                        variant="flat"
                        color={registration.notificationSent ? "success" : "warning"}
                        className="cursor-pointer hover:opacity-80"
                      >
                        {registration.notificationSent ? "Sent" : "Pending"}
                      </Chip>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => handleEditClick(registration)}
                        startContent={<FaEdit />}
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(registration._id)}
                        startContent={<FaTrash />}
                      />
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

      {/* Email History Modal */}
      <Modal isOpen={historyIsOpen} onClose={historyOnClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Email History - {selectedEmailHistory?.fullName}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600">Email Address</span>
                <span className="font-semibold">{selectedEmailHistory?.email}</span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaEnvelope /> Email History
                </h3>
                
                {selectedEmailHistory?.emailHistory && selectedEmailHistory.emailHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEmailHistory.emailHistory.map((email: any, index: number) => {
                      const isSuccess = email.status === "success";
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            isSuccess
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {isSuccess ? (
                              <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            ) : (
                              <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm ${
                                isSuccess ? "text-green-700" : "text-red-700"
                              }`}>
                                {isSuccess ? "✅" : "❌"} Email {index + 1} - {isSuccess ? "Sent" : "Failed"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                <strong>Subject:</strong> {email.subject}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                <strong>Sent At:</strong> {new Date(email.sentAt).toLocaleString()}
                              </p>
                              {email.failureReason && (
                                <p className="text-xs text-red-600 mt-1 bg-red-100 px-2 py-1 rounded">
                                  <strong>Error:</strong> {email.failureReason}
                                </p>
                              )}
                              {isSuccess && (
                                <details className="mt-2">
                                  <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                    View Content
                                  </summary>
                                  <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs max-h-40 overflow-auto">
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
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <FaClock className="text-yellow-600" />
                    <span className="text-sm text-yellow-800">No emails sent to this registrant yet</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Successful</p>
                        <p className="text-lg font-bold text-green-600">
                          {selectedEmailHistory?.emailHistory?.filter((e: any) => e.status === "success").length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2">
                      <FaTimesCircle className="text-red-600" />
                      <div>
                        <p className="text-xs text-gray-600">Failed</p>
                        <p className="text-lg font-bold text-red-600">
                          {selectedEmailHistory?.emailHistory?.filter((e: any) => e.status === "failed").length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      selectedEmailHistory?.notificationSent ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm font-semibold">
                    Status: {selectedEmailHistory?.notificationSent ? "At Least One Email Sent" : "Pending"}
                  </span>
                </div>
                {selectedEmailHistory?.emailHistory && selectedEmailHistory.emailHistory.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    Total emails sent: {selectedEmailHistory.emailHistory.length}
                  </p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={historyOnClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Edit Registration</ModalHeader>
          <ModalBody>
            <Input
              label="Full Name"
              placeholder="Enter full name"
              value={editFormData.fullName}
              onValueChange={(value) =>
                setEditFormData({ ...editFormData, fullName: value })
              }
              variant="bordered"
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
            />
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value={editFormData.phoneNumber}
              onValueChange={(value) =>
                setEditFormData({ ...editFormData, phoneNumber: value })
              }
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSaveEdit}
              isLoading={updating}
              disabled={updating}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
