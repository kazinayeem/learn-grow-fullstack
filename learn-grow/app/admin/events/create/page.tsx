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
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCreateEventMutation } from "@/redux/api/eventApi";
import { useGetAllGuestsQuery } from "@/redux/api/eventApi";
import { FaArrowLeft, FaCalendar, FaClock, FaMapMarkerAlt, FaUsers, FaCheckCircle, FaTimes, FaPlus, FaTrash, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";

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
    hosts: [""],
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin/events")}
          className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
          size="lg"
        >
          Back to Events
        </Button>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
            <FaCalendar className="text-3xl sm:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Create New Event
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Fill in the details to create a new event
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-xl border-2 border-gray-100">
        <CardBody className="p-6 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                <FaInfoCircle className="text-indigo-500" />
                Basic Information
              </h2>

              <Input
                label="Event Title"
                placeholder="Enter event title"
                value={formData.title}
                onValueChange={(val) => setFormData({ ...formData, title: val })}
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                }}
              />

              <Select
                label="Event Type"
                selectedKeys={[formData.type]}
                onSelectionChange={(keys) =>
                  setFormData({ ...formData, type: Array.from(keys)[0] as string })
                }
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  trigger: "border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300",
                }}
              >
                <SelectItem key="Workshop">🛠️ Workshop</SelectItem>
                <SelectItem key="Seminar">📚 Seminar</SelectItem>
                <SelectItem key="Webinar">💻 Webinar</SelectItem>
                <SelectItem key="Conference">🎤 Conference</SelectItem>
                <SelectItem key="Competition">🏆 Competition</SelectItem>
                <SelectItem key="Meetup">🤝 Meetup</SelectItem>
                <SelectItem key="Other">📅 Other</SelectItem>
              </Select>

              <Textarea
                label="Short Description"
                placeholder="Brief description (1-2 sentences)"
                value={formData.shortDescription}
                onValueChange={(val) => setFormData({ ...formData, shortDescription: val })}
                variant="bordered"
                minRows={2}
                maxRows={4}
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                }}
              />

              <Textarea
                label="Detailed Description"
                placeholder="Full event description with details..."
                value={formData.detailedDescription}
                onValueChange={(val) => setFormData({ ...formData, detailedDescription: val })}
                variant="bordered"
                minRows={5}
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                }}
              />

              <Input
                label="Banner Image URL"
                placeholder="https://example.com/banner.jpg"
                value={formData.bannerImage}
                onValueChange={(val) => setFormData({ ...formData, bannerImage: val })}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                }}
              />
            </div>

            {/* Event Hosts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUsers className="text-indigo-500" />
                  Event Hosts
                </h2>
                <Button
                  size="md"
                  variant="flat"
                  color="primary"
                  startContent={<FaPlus />}
                  onPress={() => setFormData({ ...formData, hosts: [...formData.hosts, ""] })}
                  className="min-h-[44px] font-semibold"
                >
                  Add Host
                </Button>
              </div>

              {loadingGuests ? (
                <div className="flex justify-center p-8">
                  <Spinner size="lg" label="Loading hosts..." />
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.hosts.map((hostId, index) => (
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
                        size="lg"
                        className="flex-1"
                        classNames={{
                          trigger: "border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300",
                        }}
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
                          variant="flat"
                          size="lg"
                          onPress={() => {
                            const newHosts = formData.hosts.filter((_, i) => i !== index);
                            setFormData({ ...formData, hosts: newHosts });
                          }}
                          className="min-h-[48px]"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected hosts preview */}
              {formData.hosts.some((h) => h) && (
                <div className="flex flex-wrap gap-2 bg-gradient-to-br from-indigo-50 to-blue-100 p-4 rounded-xl border-2 border-indigo-200">
                  {formData.hosts
                    .filter((h) => h)
                    .map((h, idx) => (
                      <span key={`${h}-${idx}`} className="px-3 py-2 rounded-lg bg-white text-indigo-700 border-2 border-indigo-300 font-semibold text-sm">
                        {guestsMap[h]?.fullName || "Selected host"} ({guestsMap[h]?.role || "Host"})
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                <FaClock className="text-indigo-500" />
                Date & Time
              </h2>

              <Input
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onValueChange={(val) => setFormData({ ...formData, eventDate: val })}
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onValueChange={(val) => setFormData({ ...formData, startTime: val })}
                  isRequired
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                  }}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onValueChange={(val) => setFormData({ ...formData, endTime: val })}
                  isRequired
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                  }}
                />
              </div>
            </div>

            {/* Event Mode */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                <FaMapMarkerAlt className="text-indigo-500" />
                Event Mode
              </h2>

              <Select
                label="Mode"
                selectedKeys={[formData.mode]}
                onSelectionChange={(keys) =>
                  setFormData({ ...formData, mode: Array.from(keys)[0] as string })
                }
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  trigger: "border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300",
                }}
              >
                <SelectItem key="Online">💻 Online</SelectItem>
                <SelectItem key="Offline">🏢 Offline</SelectItem>
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
                    size="lg"
                    classNames={{
                      input: "text-sm sm:text-base",
                      inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                    }}
                  />
                  <Textarea
                    label="Venue Address"
                    placeholder="Full address with city, state, zip"
                    value={formData.venueAddress}
                    onValueChange={(val) => setFormData({ ...formData, venueAddress: val })}
                    variant="bordered"
                    minRows={2}
                    classNames={{
                      input: "text-sm sm:text-base",
                      inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                    }}
                  />
                  <Input
                    label="Google Maps Link"
                    placeholder="https://maps.google.com/..."
                    value={formData.googleMapLink}
                    onValueChange={(val) => setFormData({ ...formData, googleMapLink: val })}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-sm sm:text-base",
                      inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                    }}
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
                  size="lg"
                  classNames={{
                    trigger: "border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300",
                  }}
                >
                  <SelectItem key="Zoom">📹 Zoom</SelectItem>
                  <SelectItem key="Google Meet">🎥 Google Meet</SelectItem>
                  <SelectItem key="Microsoft Teams">💼 Microsoft Teams</SelectItem>
                  <SelectItem key="Custom">🎬 Custom</SelectItem>
                </Select>
              )}
            </div>

            {/* Registration Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-indigo-200">
                <FaCheckCircle className="text-indigo-500" />
                Registration Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Maximum Seats"
                  type="number"
                  value={formData.maxSeats.toString()}
                  onValueChange={(val) => setFormData({ ...formData, maxSeats: parseInt(val) || 0 })}
                  isRequired
                  variant="bordered"
                  size="lg"
                  min={1}
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-indigo-400 focus-within:border-indigo-500 transition-all duration-300",
                  }}
                />

                <Select
                  label="Status"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, status: Array.from(keys)[0] as string })
                  }
                  variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-all duration-300",
                  }}
                >
                  <SelectItem key="Upcoming">Upcoming</SelectItem>
                  <SelectItem key="Ongoing">Ongoing</SelectItem>
                  <SelectItem key="Completed">Completed</SelectItem>
                </Select>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
                <Switch
                  isSelected={formData.isRegistrationOpen}
                  onValueChange={(val) => setFormData({ ...formData, isRegistrationOpen: val })}
                  size="lg"
                  color="success"
                >
                  <span className="font-semibold">Registration Open</span>
                </Switch>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t-2 border-gray-200">
              <Button
                color="primary"
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="flex-1 min-h-[48px] font-bold bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                startContent={!isLoading && <FaCheckCircle />}
              >
                Create Event
              </Button>
              <Button
                variant="flat"
                size="lg"
                onPress={() => router.push("/admin/events")}
                isDisabled={isLoading}
                className="flex-1 sm:flex-initial min-h-[48px] font-semibold"
                startContent={<FaTimes />}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
