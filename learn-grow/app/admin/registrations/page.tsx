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
  Avatar,
} from "@nextui-org/react";
import { useGetAllRegistrationsQuery } from "@/redux/api/eventApi";
import { FaSearch, FaDownload, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AllRegistrationsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useGetAllRegistrationsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const registrations = response?.data?.registrations || [];
  const pagination = response?.data?.pagination;

  // Calculate stats
  const totalRegistrations = pagination?.total || 0;
  const notificationsSent = registrations.filter((r: any) => r.notificationSent).length;

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["Full Name", "Email", "Phone Number", "Event", "Registered On", "Notification"];
    const csvContent = [
      headers.join(","),
      ...registrations.map((reg: any) =>
        [
          `"${reg.fullName}"`,
          `"${reg.email}"`,
          `"${reg.phoneNumber}"`,
          `"${reg.event?.title || 'N/A'}"`,
          `"${new Date(reg.createdAt).toLocaleString()}"`,
          reg.notificationSent ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `all_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Event Registrations</h1>
        <p className="text-gray-600">Manage all event registrations across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-3xl font-bold text-primary">{totalRegistrations}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-primary opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Page</p>
                <p className="text-3xl font-bold text-success">{registrations.length}</p>
              </div>
              <FaEnvelope className="text-4xl text-success opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications Sent</p>
                <p className="text-3xl font-bold text-warning">{notificationsSent}</p>
              </div>
              <FaEnvelope className="text-4xl text-warning opacity-50" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">All Registrations</h2>
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
          placeholder="Search by name, email, phone, or event..."
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
          <p className="text-gray-600 text-lg">No registrations found</p>
          <p className="text-gray-500 text-sm mt-2">
            Registrations will appear here as users sign up for events
          </p>
        </div>
      ) : (
        <>
          <Table aria-label="All registrations table" className="mb-6">
            <TableHeader>
              <TableColumn>PARTICIPANT</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>EVENT</TableColumn>
              <TableColumn>REGISTERED ON</TableColumn>
              <TableColumn>NOTIFICATION</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {registrations.map((registration: any) => (
                <TableRow key={registration._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={registration.fullName} size="sm" />
                      <p className="font-semibold">{registration.fullName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span>{registration.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span>{registration.phoneNumber}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {registration.event ? (
                      <div>
                        <p className="font-semibold line-clamp-1">
                          {registration.event.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Chip size="sm" variant="flat" color="primary">
                            {registration.event.type}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={registration.event.mode === "Online" ? "success" : "warning"}
                          >
                            {registration.event.mode}
                          </Chip>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Event not found</span>
                    )}
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
                  <TableCell>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => router.push(`/admin/events/${registration.event?._id}/registrations`)}
                      isDisabled={!registration.event}
                    >
                      View Event
                    </Button>
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
