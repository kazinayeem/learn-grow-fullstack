"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Switch,
  Spinner,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useGetAllGuestsQuery,
} from "@/redux/api/eventApi";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { data: response, isLoading: loading } = useGetEventByIdQuery(eventId, {
    skip: !eventId,
  });
  const { data: guestsResponse, isLoading: loadingGuests } = useGetAllGuestsQuery({ limit: 1000 });
  const guests: any[] = guestsResponse?.data || [];
  const allowedPlatformTypes = ["Zoom", "Google Meet", "Microsoft Teams", "Custom"];
  const guestsMap = React.useMemo(() => {
    return guests.reduce((acc: Record<string, any>, g: any) => {
      acc[g._id] = g;
      return acc;
    }, {});
  }, [guests]);
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();

  const [formData, setFormData] = useState({
    title: "",
    type: "Workshop",
    shortDescription: "",
    detailedDescription: "",
    bannerImage: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    mode: "Online",
    venueName: "",
    venueAddress: "",
    googleMapLink: "",
    platformType: "Zoom",
    meetingLink: "",
    platformInstructions: "",
    maxSeats: 50,
    isRegistrationOpen: true,
    status: "Upcoming",
    hosts: [""],
  });

  const event = response?.data;

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        type: event.type || "Workshop",
        shortDescription: event.shortDescription || "",
        detailedDescription: event.detailedDescription || "",
        bannerImage: event.bannerImage || "",
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        mode: event.mode || "Online",
        venueName: event.venueName || "",
        venueAddress: event.venueAddress || "",
        googleMapLink: event.googleMapLink || "",
        platformType: allowedPlatformTypes.includes(event.platformType) ? event.platformType : "Zoom",
        meetingLink: event.meetingLink || "",
        platformInstructions: event.platformInstructions || "",
        maxSeats: event.maxSeats || 50,
        isRegistrationOpen: event.isRegistrationOpen ?? true,
        status: event.status || "Upcoming",
        hosts: (event.guests || event.hosts || []).map((g: any) => g?._id || g).filter(Boolean),
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.eventDate || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.mode === "Offline" && !formData.venueName) {
      toast.error("Venue name is required for offline events");
      return;
    }

    const selectedHosts = formData.hosts.filter((h) => !!h);

    try {
      const safePlatformType = allowedPlatformTypes.includes(formData.platformType)
        ? formData.platformType
        : "Zoom";

      await updateEvent({
        id: eventId,
        ...formData,
        platformType: safePlatformType,
        hosts: selectedHosts,
        guests: selectedHosts,
      }).unwrap();
      toast.success("Event updated successfully");
      router.push("/admin/events");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update event");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" label="Loading event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8">
        <Card className="border-2 border-red-500">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h2>
            <Button color="primary" onPress={() => router.push("/admin/events")}>
              Back to Events
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

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

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>

        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                <Input
                  label="Event Title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onValueChange={(val) => setFormData({ ...formData, title: val })}
                  isRequired
                  variant="bordered"
                />

                <Select
                  label="Event Type"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, type: Array.from(keys)[0] as string })
                  }
                  isRequired
                  variant="bordered"
                >
                  <SelectItem key="Workshop">Workshop</SelectItem>
                  <SelectItem key="Seminar">Seminar</SelectItem>
                  <SelectItem key="Webinar">Webinar</SelectItem>
                  <SelectItem key="Conference">Conference</SelectItem>
                  <SelectItem key="Competition">Competition</SelectItem>
                  <SelectItem key="Meetup">Meetup</SelectItem>
                  <SelectItem key="Other">Other</SelectItem>
                </Select>

                <Textarea
                  label="Short Description"
                  placeholder="Brief description (1-2 sentences)"
                  value={formData.shortDescription}
                  onValueChange={(val) => setFormData({ ...formData, shortDescription: val })}
                  variant="bordered"
                  minRows={2}
                  maxRows={4}
                />

                <Textarea
                  label="Detailed Description"
                  placeholder="Full event description with details..."
                  value={formData.detailedDescription}
                  onValueChange={(val) => setFormData({ ...formData, detailedDescription: val })}
                  variant="bordered"
                  minRows={5}
                />

                <Input
                  label="Banner Image URL"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.bannerImage}
                  onValueChange={(val) => setFormData({ ...formData, bannerImage: val })}
                  variant="bordered"
                />
              </div>

                {/* Event Hosts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Event Hosts</h2>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => setFormData({ ...formData, hosts: [...formData.hosts, ""] })}
                    >
                      + Add Host
                    </Button>
                  </div>

                  {loadingGuests ? (
                    <Spinner size="sm" label="Loading hosts..." />
                  ) : (
                    formData.hosts.map((hostId, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <Select
                          label={`Host ${index + 1}`}
                          placeholder="Select a host"
                          selectedKeys={hostId ? new Set([hostId]) : new Set()}
                          onSelectionChange={(keys) => {
                            const newHosts = [...formData.hosts];
                            const selected = Array.from(keys)[0] as string | undefined;
                            newHosts[index] = selected || "";
                            setFormData({ ...formData, hosts: newHosts });
                          }}
                          variant="bordered"
                          className="flex-1"
                        >
                          {guests.map((guest: any) => (
                            <SelectItem key={guest._id} value={guest._id}>
                              {guest.fullName} ({guest.role})
                            </SelectItem>
                          ))}
                        </Select>
                        {formData.hosts.length > 1 && (
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            onPress={() => {
                              const newHosts = formData.hosts.filter((_, i) => i !== index);
                              setFormData({ ...formData, hosts: newHosts });
                            }}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))
                  )}

                  {formData.hosts.some((h) => h) && (
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {formData.hosts
                        .filter((h) => h)
                        .map((h, idx) => (
                          <span key={`${h}-${idx}`} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                            {guestsMap[h]?.fullName || "Selected host"} ({guestsMap[h]?.role || "Host"})
                          </span>
                        ))}
                    </div>
                  )}
                </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Date & Time</h2>

                <Input
                  label="Event Date"
                  type="date"
                  value={formData.eventDate}
                  onValueChange={(val) => setFormData({ ...formData, eventDate: val })}
                  isRequired
                  variant="bordered"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onValueChange={(val) => setFormData({ ...formData, startTime: val })}
                    isRequired
                    variant="bordered"
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onValueChange={(val) => setFormData({ ...formData, endTime: val })}
                    isRequired
                    variant="bordered"
                  />
                </div>
              </div>

              {/* Event Mode */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Event Mode</h2>

                <Select
                  label="Mode"
                  selectedKeys={[formData.mode]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, mode: Array.from(keys)[0] as string })
                  }
                  isRequired
                  variant="bordered"
                >
                  <SelectItem key="Online">Online</SelectItem>
                  <SelectItem key="Offline">Offline</SelectItem>
                </Select>

                {formData.mode === "Offline" ? (
                  <>
                    <Input
                      label="Venue Name"
                      placeholder="Conference Hall, Building Name"
                      value={formData.venueName}
                      onValueChange={(val) => setFormData({ ...formData, venueName: val })}
                      isRequired
                      variant="bordered"
                    />
                    <Textarea
                      label="Venue Address"
                      placeholder="Full address with city, state, zip"
                      value={formData.venueAddress}
                      onValueChange={(val) => setFormData({ ...formData, venueAddress: val })}
                      variant="bordered"
                      minRows={2}
                    />
                    <Input
                      label="Google Maps Link"
                      placeholder="https://maps.google.com/..."
                      value={formData.googleMapLink}
                      onValueChange={(val) => setFormData({ ...formData, googleMapLink: val })}
                      variant="bordered"
                    />
                  </>
                ) : (
                  <>
                    <Select
                      label="Platform Type"
                      selectedKeys={formData.platformType ? new Set([formData.platformType]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string | undefined;
                        setFormData({
                          ...formData,
                          platformType: selected && allowedPlatformTypes.includes(selected)
                            ? selected
                            : "Zoom",
                        });
                      }}
                      variant="bordered"
                    >
                      <SelectItem key="Zoom">Zoom</SelectItem>
                      <SelectItem key="Google Meet">Google Meet</SelectItem>
                      <SelectItem key="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem key="Custom">Custom</SelectItem>
                    </Select>
                    <Input
                      label="Meeting Link"
                      placeholder="https://zoom.us/j/..."
                      value={formData.meetingLink}
                      onValueChange={(val) => setFormData({ ...formData, meetingLink: val })}
                      variant="bordered"
                      description="Meeting link will be sent to all registered participants"
                    />
                    <Textarea
                      label="Platform Instructions"
                      placeholder="How to join the meeting, any special instructions..."
                      value={formData.platformInstructions}
                      onValueChange={(val) => setFormData({ ...formData, platformInstructions: val })}
                      variant="bordered"
                      minRows={2}
                    />
                  </>
                )}
              </div>

              {/* Registration Settings */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Registration Settings</h2>

                <Input
                  label="Maximum Seats"
                  type="number"
                  value={formData.maxSeats.toString()}
                  onValueChange={(val) => setFormData({ ...formData, maxSeats: parseInt(val) || 0 })}
                  isRequired
                  variant="bordered"
                  min={1}
                  description={`Currently registered: ${event.registeredCount || 0}`}
                />

                <Select
                  label="Status"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, status: Array.from(keys)[0] as string })
                  }
                  variant="bordered"
                >
                  <SelectItem key="Upcoming">Upcoming</SelectItem>
                  <SelectItem key="Ongoing">Ongoing</SelectItem>
                  <SelectItem key="Completed">Completed</SelectItem>
                </Select>

                <div className="flex items-center gap-4">
                  <Switch
                    isSelected={formData.isRegistrationOpen}
                    onValueChange={(val) => setFormData({ ...formData, isRegistrationOpen: val })}
                  >
                    Registration Open
                  </Switch>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  color="primary"
                  type="submit"
                  size="lg"
                  isLoading={updating}
                  className="flex-1"
                >
                  Update Event
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => router.push("/admin/events")}
                  isDisabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
