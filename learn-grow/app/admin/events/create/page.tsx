"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Switch,
  DatePicker,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCreateEventMutation } from "@/redux/api/eventApi";
import { useGetAllGuestsQuery } from "@/redux/api/eventApi";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { parseDate } from "@internationalized/date";

export default function CreateEventPage() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const { data: guestsResponse, isLoading: loadingGuests } = useGetAllGuestsQuery({ limit: 1000 });
  const guests: any[] = guestsResponse?.data || [];
  const allowedPlatformTypes = ["Zoom", "Google Meet", "Microsoft Teams", "Custom"];
  const guestsMap = React.useMemo(() => {
    return guests.reduce((acc: Record<string, any>, g: any) => {
      acc[g._id] = g;
      return acc;
    }, {});
  }, [guests]);

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
    maxSeats: 50,
    isRegistrationOpen: true,
    status: "Upcoming",
    hosts: [""], // Start with one empty host select; filtered on submit
  });

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

    if (selectedHosts.length === 0) {
      toast.error("Please select at least one host");
      return;
    }

    try {
      const safePlatformType = allowedPlatformTypes.includes(formData.platformType)
        ? formData.platformType
        : "Zoom";

      await createEvent({
        ...formData,
        platformType: safePlatformType,
        hosts: selectedHosts,
        guests: selectedHosts,
      }).unwrap();
      toast.success("Event created successfully");
      router.push("/admin/events");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create event");
    }
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

      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

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
                        {(guestsResponse?.data || []).map((guest: any) => (
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

                {/* Selected hosts preview */}
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
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Create Event
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => router.push("/admin/events")}
                  isDisabled={isLoading}
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
