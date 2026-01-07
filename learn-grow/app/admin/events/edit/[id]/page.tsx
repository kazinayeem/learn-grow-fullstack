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
  Chip,
  Divider,
} from "@nextui-org/react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useGetAllGuestsQuery,
} from "@/redux/api/eventApi";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaUsers,
  FaImage,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaGlobe,
  FaLink,
  FaBuilding
} from "react-icons/fa";
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
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Spinner size="lg" label="Loading event details..." color="secondary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Card className="border-2 border-red-500 max-w-lg w-full shadow-xl">
          <CardBody className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaArrowLeft size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
            <p className="text-gray-500 mb-6">The event you are looking for does not exist or has been deleted.</p>
            <Button color="primary" onPress={() => router.push("/admin/events")} size="lg">
              Return to Events
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      {/* Modern Header */}
      <div className="mb-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin/events")}
            className="mb-4 text-white/90 hover:bg-white/20"
          >
            Back to Events
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <FaCalendarAlt className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Event</h1>
              <p className="text-violet-100 mt-1">Updating details for "{event.title}"</p>
            </div>
          </div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"></div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaInfoCircle className="text-violet-600" />
                Basic Information
              </h2>
              <div className="space-y-5">
                <Input
                  label="Event Title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onValueChange={(val) => setFormData({ ...formData, title: val })}
                  isRequired
                  variant="bordered"
                  startContent={<FaCalendarAlt className="text-gray-400" />}
                />

                <Select
                  label="Event Type"
                  selectedKeys={[formData.type]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, type: Array.from(keys)[0] as string })
                  }
                  isRequired
                  variant="bordered"
                  startContent={<FaInfoCircle className="text-gray-400" />}
                >
                  <SelectItem key="Workshop" startContent={<span className="text-xl">🛠️</span>}>Workshop</SelectItem>
                  <SelectItem key="Seminar" startContent={<span className="text-xl">📚</span>}>Seminar</SelectItem>
                  <SelectItem key="Webinar" startContent={<span className="text-xl">💻</span>}>Webinar</SelectItem>
                  <SelectItem key="Conference" startContent={<span className="text-xl">🎤</span>}>Conference</SelectItem>
                  <SelectItem key="Competition" startContent={<span className="text-xl">🏆</span>}>Competition</SelectItem>
                  <SelectItem key="Meetup" startContent={<span className="text-xl">🤝</span>}>Meetup</SelectItem>
                  <SelectItem key="Other" startContent={<span className="text-xl">📅</span>}>Other</SelectItem>
                </Select>

                <Textarea
                  label="Short Description"
                  placeholder="Brief description (1-2 sentences)"
                  value={formData.shortDescription}
                  onValueChange={(val) => setFormData({ ...formData, shortDescription: val })}
                  variant="bordered"
                  minRows={2}
                  description="Displayed on cards and previews."
                />

                <Textarea
                  label="Detailed Description"
                  placeholder="Full event description..."
                  value={formData.detailedDescription}
                  onValueChange={(val) => setFormData({ ...formData, detailedDescription: val })}
                  variant="bordered"
                  minRows={6}
                />
              </div>
            </CardBody>
          </Card>

          {/* Date, Time & Venue Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaClock className="text-pink-600" />
                Date, Time & Venue
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Event Date"
                  type="date"
                  value={formData.eventDate}
                  onValueChange={(val) => setFormData({ ...formData, eventDate: val })}
                  isRequired
                  variant="bordered"
                />
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

              <Divider className="my-4" />

              <div className="mb-4">
                <Select
                  label="Event Mode"
                  selectedKeys={[formData.mode]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, mode: Array.from(keys)[0] as string })
                  }
                  isRequired
                  variant="bordered"
                  startContent={formData.mode === "Online" ? <FaVideo className="text-blue-500" /> : <FaBuilding className="text-orange-500" />}
                >
                  <SelectItem key="Online" startContent={<FaVideo className="text-blue-500" />}>Online</SelectItem>
                  <SelectItem key="Offline" startContent={<FaBuilding className="text-orange-500" />}>Offline</SelectItem>
                </Select>
              </div>

              {formData.mode === "Offline" ? (
                <div className="space-y-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <Input
                    label="Venue Name"
                    placeholder="e.g. Grand Conference Hall"
                    value={formData.venueName}
                    onValueChange={(val) => setFormData({ ...formData, venueName: val })}
                    isRequired
                    variant="bordered"
                    startContent={<FaBuilding className="text-orange-400" />}
                  />
                  <Textarea
                    label="Venue Address"
                    placeholder="Full address..."
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
                    startContent={<FaMapMarkerAlt className="text-red-500" />}
                  />
                </div>
              ) : (
                <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Platform"
                      selectedKeys={formData.platformType ? new Set([formData.platformType]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string | undefined;
                        setFormData({
                          ...formData,
                          platformType: selected && allowedPlatformTypes.includes(selected) ? selected : "Zoom",
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
                      placeholder="https://..."
                      value={formData.meetingLink}
                      onValueChange={(val) => setFormData({ ...formData, meetingLink: val })}
                      variant="bordered"
                      startContent={<FaLink className="text-blue-400" />}
                    />
                  </div>
                  <Textarea
                    label="Joining Instructions"
                    placeholder="Passcode, waiting room details..."
                    value={formData.platformInstructions}
                    onValueChange={(val) => setFormData({ ...formData, platformInstructions: val })}
                    variant="bordered"
                    minRows={2}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Event Hosts Card */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaUsers className="text-indigo-600" />
                  Event Hosts
                </h2>
                <Button
                  size="sm"
                  color="secondary"
                  variant="flat"
                  onPress={() => setFormData({ ...formData, hosts: [...formData.hosts, ""] })}
                >
                  + Add New Host
                </Button>
              </div>

              <div className="space-y-3">
                {formData.hosts.map((hostId, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select
                      label={`Host #${index + 1}`}
                      placeholder="Select Type"
                      selectedKeys={hostId ? new Set([hostId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const newHosts = [...formData.hosts];
                        const selected = Array.from(keys)[0] as string | undefined;
                        newHosts[index] = selected || "";
                        setFormData({ ...formData, hosts: newHosts });
                      }}
                      variant="bordered"
                      className="flex-1"
                      isLoading={loadingGuests}
                    >
                      {guests.map((guest: any) => (
                        <SelectItem key={guest._id} textValue={guest.fullName}>
                          <div className="flex flex-col">
                            <span className="text-small font-bold">{guest.fullName}</span>
                            <span className="text-tiny text-default-500">{guest.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => {
                        const newHosts = formData.hosts.filter((_, i) => i !== index);
                        setFormData({ ...formData, hosts: newHosts });
                      }}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                ))}
              </div>

              {formData.hosts.some(h => h) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.hosts.filter(h => h).map((h, i) => (
                    <Chip key={i} color="secondary" variant="flat" avatar={
                      guestsMap[h]?.profileImage ? <UsersAvatar src={guestsMap[h].profileImage} /> : undefined
                    }>
                      {guestsMap[h]?.fullName || "Host"}
                    </Chip>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

        </div>

        {/* Right Column: Media, Settings, Actions */}
        <div className="space-y-6">

          {/* Banner Image */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaImage className="text-purple-600" />
                Event Banner
              </h2>

              {formData.bannerImage ? (
                <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-200 mb-4 bg-gray-50 relative group">
                  <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                    Preview
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 rounded-xl border border-dashed border-gray-300 mb-4 bg-gray-50 flex items-center justify-center text-gray-400 flex-col gap-2">
                  <FaImage size={32} />
                  <span className="text-xs">No image provided</span>
                </div>
              )}

              <Input
                label="Banner URL"
                placeholder="https://..."
                value={formData.bannerImage}
                onValueChange={(val) => setFormData({ ...formData, bannerImage: val })}
                variant="bordered"
                startContent={<FaGlobe className="text-gray-400" />}
              />
            </CardBody>
          </Card>

          {/* Registration Settings */}
          <Card className="shadow-md border border-gray-100">
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Registration
              </h2>

              <div className="space-y-4">
                <Input
                  label="Max Seats"
                  type="number"
                  value={formData.maxSeats.toString()}
                  onValueChange={(val) => setFormData({ ...formData, maxSeats: parseInt(val) || 0 })}
                  isRequired
                  variant="bordered"
                  startContent={<FaUsers className="text-gray-400" />}
                />

                <Select
                  label="Event Status"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) =>
                    setFormData({ ...formData, status: Array.from(keys)[0] as string })
                  }
                  variant="bordered"
                >
                  <SelectItem key="Upcoming" startContent={<span className="w-2 h-2 rounded-full bg-blue-500"></span>}>Upcoming</SelectItem>
                  <SelectItem key="Ongoing" startContent={<span className="w-2 h-2 rounded-full bg-green-500"></span>}>Ongoing</SelectItem>
                  <SelectItem key="Completed" startContent={<span className="w-2 h-2 rounded-full bg-gray-500"></span>}>Completed</SelectItem>
                </Select>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Open Registration</span>
                  <Switch
                    isSelected={formData.isRegistrationOpen}
                    onValueChange={(val) => setFormData({ ...formData, isRegistrationOpen: val })}
                    color="success"
                    size="sm"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sticky Actions */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 sticky bottom-4 z-20">
            <Button
              color="primary"
              type="submit"
              size="lg"
              isLoading={updating}
              className="w-full mb-3 font-bold text-lg shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 border-none"
              startContent={<FaSave />}
            >
              Update Event
            </Button>
            <Button
              variant="flat"
              color="danger"
              size="lg"
              onPress={() => router.push("/admin/events")}
              isDisabled={updating}
              className="w-full font-medium"
              startContent={<FaTimes />}
            >
              Cancel
            </Button>
          </div>

        </div>

      </form>
    </div>
  );
}

// Helper for avatar in chips since Chip 'avatar' prop expects a React element
const UsersAvatar = ({ src }: { src: string }) => (
  <span className="w-5 h-5 rounded-full overflow-hidden mr-1 inline-block">
    <img src={src} alt="avatar" className="w-full h-full object-cover" />
  </span>
);
