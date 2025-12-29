"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Image,
  Chip,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetAllEventsQuery } from "@/redux/api/eventApi";
import { FaSearch, FaCalendar, FaMapMarkerAlt, FaVideo, FaUsers } from "react-icons/fa";

export default function EventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("");

  const { data: response, isLoading } = useGetAllEventsQuery({
    page,
    limit: 9,
    search: search || undefined,
    type: type || undefined,
    mode: mode || undefined,
    status: status || undefined,
  });

  // Normalize API response
  const events = Array.isArray(response?.data)
    ? response?.data
    : (response as any)?.data?.events || [];
  const pagination = (response as any)?.pagination || (response as any)?.data?.pagination || {};
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil((pagination?.total || events.length) / 9));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading events..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div
        className="text-white py-20 px-6"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Upcoming Events
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Join workshops, seminars, and competitions to enhance your skills
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          <Input
            placeholder="Search events..."
            startContent={<FaSearch />}
            value={search}
            onValueChange={setSearch}
            variant="bordered"
            className="md:col-span-2"
          />
          
          <Select
            label="Event Type"
            placeholder="All Types"
            variant="bordered"
            selectedKeys={type ? [type] : []}
            onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="">All Types</SelectItem>
            <SelectItem key="Workshop">Workshop</SelectItem>
            <SelectItem key="Seminar">Seminar</SelectItem>
            <SelectItem key="Competition">Competition</SelectItem>
            <SelectItem key="Bootcamp">Bootcamp</SelectItem>
            <SelectItem key="Webinar">Webinar</SelectItem>
          </Select>
          
          <Select
            label="Mode"
            placeholder="All Modes"
            variant="bordered"
            selectedKeys={mode ? [mode] : []}
            onSelectionChange={(keys) => setMode(Array.from(keys)[0] as string)}
          >
            <SelectItem key="">All Modes</SelectItem>
            <SelectItem key="Online">Online</SelectItem>
            <SelectItem key="Offline">Offline</SelectItem>
          </Select>
          
          <Select
            label="Status"
            placeholder="All Status"
            variant="bordered"
            selectedKeys={status ? [status] : []}
            onSelectionChange={(keys) => setStatus(Array.from(keys)[0] as string || "")}
          >
            <SelectItem key="">All Status</SelectItem>
            <SelectItem key="Upcoming">Upcoming</SelectItem>
            <SelectItem key="Ongoing">Ongoing</SelectItem>
            <SelectItem key="Completed">Completed</SelectItem>
          </Select>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardBody className="p-12 text-center">
              <p className="text-gray-500 text-lg">No events found</p>
              <p className="text-gray-400 text-sm mt-2">
                Check back later for new events!
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event: any) => {
                const eventDate = new Date(event.eventDate);
                const seatsAvailable = event.maxSeats - event.registeredCount;
                const isFull = seatsAvailable <= 0;

                return (
                  <Card
                    key={event._id}
                    isPressable={false}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/events/${event._id}`)}
                  >
                    {event.bannerImage && (
                      <CardHeader className="p-0">
                        <Image
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                          removeWrapper
                        />
                      </CardHeader>
                    )}
                    <CardBody className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Chip color="primary" size="sm" variant="flat">
                          {event.type}
                        </Chip>
                        <Chip
                          color={event.mode === "Online" ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                          startContent={event.mode === "Online" ? <FaVideo /> : <FaMapMarkerAlt />}
                        >
                          {event.mode}
                        </Chip>
                        <Chip
                          color={
                            event.status === "Upcoming" ? "primary" :
                            event.status === "Ongoing" ? "success" : "default"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {event.status}
                        </Chip>
                        <Chip
                          color={event.isRegistrationOpen ? "success" : "danger"}
                          size="sm"
                          variant="flat"
                        >
                          {event.isRegistrationOpen ? "Registration Open" : "Registration Closed"}
                        </Chip>
                      </div>

                      <h3 className="text-xl font-bold mb-3 line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.shortDescription}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <FaCalendar />
                        <span>
                          {eventDate.toLocaleDateString()} at {event.startTime}
                        </span>
                      </div>

                      {event.guests && event.guests.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <FaUsers />
                          <span className="line-clamp-1">
                            {event.guests.map((g: any) => g.fullName).join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Button
                          color="primary"
                          size="sm"
                          isDisabled={isFull}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/events/${event._id}`);
                          }}
                        >
                          {isFull ? "Sold Out" : "View Details"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  color="primary"
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
