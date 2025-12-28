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
} from "@nextui-org/react";
import { useGetEventRegistrationsQuery, useGetEventByIdQuery } from "@/redux/api/eventApi";
import { FaArrowLeft, FaSearch, FaDownload, FaEnvelope, FaPhone } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";

export default function EventRegistrationsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");

  const { data: eventResponse } = useGetEventByIdQuery(eventId, { skip: !eventId });
  const { data: response, isLoading } = useGetEventRegistrationsQuery(
    { eventId, page, limit, search: search || undefined },
    { skip: !eventId }
  );

  const event = eventResponse?.data;
  const registrations = response?.data?.registrations || [];
  const pagination = response?.data?.pagination;

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
        <Button
          color="success"
          startContent={<FaDownload />}
          onPress={exportToCSV}
          isDisabled={registrations.length === 0}
        >
          Export to CSV
        </Button>
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
                    <Chip
                      size="sm"
                      variant="flat"
                      color={registration.notificationSent ? "success" : "warning"}
                    >
                      {registration.notificationSent ? "Sent" : "Pending"}
                    </Chip>
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
    </div>
  );
}
