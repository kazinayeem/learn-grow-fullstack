"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Image,
  Chip,
  Button,
  Input,
  Spinner,
  Divider,
  Avatar,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import { useGetEventByIdQuery, useRegisterForEventMutation } from "@/redux/api/eventApi";
import { FaArrowLeft, FaCalendar, FaClock, FaMapMarkerAlt, FaVideo, FaUsers, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { data: response, isLoading } = useGetEventByIdQuery(eventId, { skip: !eventId });
  const [registerForEvent, { isLoading: registering }] = useRegisterForEventMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const event = response?.data;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await registerForEvent({ eventId, ...formData }).unwrap();
      toast.success("Registration successful! Check your email for confirmation.");
      setFormData({ fullName: "", email: "", phoneNumber: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Registration failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-2 border-red-500">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h2>
            <p className="text-gray-600 mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button color="primary" onPress={() => router.push("/events")}>
              Back to Events
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const seatsAvailable = event.maxSeats - event.registeredCount;
  const isFull = seatsAvailable <= 0;
  const canRegister = event.isRegistrationOpen && !isFull;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/events")}
          className="mb-6"
        >
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Image */}
            {event.bannerImage && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Event Details */}
            <Card>
              <CardBody className="p-8">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Chip color="primary" variant="flat">{event.type}</Chip>
                  <Chip
                    color={event.mode === "Online" ? "success" : "warning"}
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
                    variant="flat"
                  >
                    {event.status}
                  </Chip>
                </div>

                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

                <p className="text-lg text-gray-700 mb-6">{event.shortDescription}</p>

                <Divider className="my-6" />

                <h2 className="text-xl font-bold mb-4">📋 About This Event</h2>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.detailedDescription }}
                />

                <Divider className="my-6" />

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FaCalendar className="text-primary text-xl mt-1" />
                    <div>
                      <p className="font-semibold">Date</p>
                      <p className="text-gray-600">
                        {eventDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaClock className="text-primary text-xl mt-1" />
                    <div>
                      <p className="font-semibold">Time</p>
                      <p className="text-gray-600">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location/Platform */}
                {event.mode === "Offline" ? (
                  <div className="flex items-start gap-3 mb-6">
                    <FaMapMarkerAlt className="text-primary text-xl mt-1" />
                    <div>
                      <p className="font-semibold">Venue</p>
                      <p className="text-gray-600">{event.venueName}</p>
                      <p className="text-gray-600 text-sm">{event.venueAddress}</p>
                      {event.googleMapLink && (
                        <a
                          href={event.googleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                ) : canRegister ? (
                  <div className="flex items-start gap-3 mb-6">
                    <FaVideo className="text-primary text-xl mt-1" />
                    <div>
                      <p className="font-semibold">Online Platform</p>
                      <p className="text-gray-600">{event.platformType || "To be announced"}</p>
                      {event.meetingLink ? (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Meeting link will be sent to registered participants
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            {/* Guests */}
            {event.guests && event.guests.length > 0 && (
              <Card>
                <CardBody className="p-8">
                  <h2 className="text-2xl font-bold mb-6">👥 Featured Guests</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.guests.map((guest: any) => (
                      <div key={guest._id} className="flex gap-4">
                        <Avatar
                          src={guest.profileImage}
                          name={guest.fullName}
                          size="lg"
                          className="flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{guest.fullName}</h3>
                          <Chip size="sm" color="primary" variant="flat" className="mb-2">
                            {guest.role}
                          </Chip>
                          {guest.organization && (
                            <p className="text-sm text-gray-600 mb-1">{guest.organization}</p>
                          )}
                          {guest.designation && (
                            <p className="text-sm text-gray-600 mb-2">{guest.designation}</p>
                          )}
                          {guest.bio && (
                            <p className="text-sm text-gray-700">{guest.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardBody className="p-6">
                {canRegister && (
                  <>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FaUsers className="text-2xl text-primary" />
                        <span className="text-3xl font-bold">{seatsAvailable}</span>
                      </div>
                      <p className="text-gray-600">seats available</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.registeredCount} / {event.maxSeats} registered
                      </p>
                    </div>

                    <Divider className="my-6" />
                  </>
                )}

                {canRegister ? (
                  <>
                    <h3 className="text-xl font-bold mb-4 text-center">Register Now</h3>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                        startContent={<FaUser />}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onValueChange={(val) => setFormData({ ...formData, email: val })}
                        startContent={<FaEnvelope />}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phoneNumber}
                        onValueChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                        startContent={<FaPhone />}
                        isRequired
                        variant="bordered"
                      />
                      <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full"
                        isLoading={registering}
                      >
                        Register for Event
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        No account required. Confirmation will be sent via email.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="text-center">
                    <Chip
                      color={isFull ? "danger" : "warning"}
                      size="lg"
                      variant="flat"
                      className="mb-4"
                    >
                      {isFull ? "Event Full" : "Registration Closed"}
                    </Chip>
                    <p className="text-gray-600 text-sm">
                      {isFull
                        ? "All seats have been taken for this event"
                        : "Registration is currently closed for this event"}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
