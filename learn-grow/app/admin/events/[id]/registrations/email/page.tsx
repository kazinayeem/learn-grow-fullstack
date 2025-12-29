"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetEventByIdQuery,
  useGetEventRegistrationsQuery,
  useSendRegistrationEmailsMutation,
} from "@/redux/api/eventApi";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-10">
      <Spinner label="Loading editor..." />
    </div>
  ),
});

export default function SendRegistrationEmailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { data: eventResponse } = useGetEventByIdQuery(eventId, { skip: !eventId });
  const { data: registrationsResponse, isLoading } = useGetEventRegistrationsQuery(
    { eventId, page: 1, limit: 1000 },
    { skip: !eventId }
  );

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<p>Dear attendee,</p><p>Thank you for registering. Here are the latest updates.</p>");
  const [sendEmails, { isLoading: sending }] = useSendRegistrationEmailsMutation();

  const registrations: any[] = registrationsResponse?.data || [];
  const recipientIds = useMemo(() => registrations.map((r) => r._id), [registrations]);

  const templates = [
    {
      name: "Invitation",
      subject: "You're invited: {{event}}",
      body: `<p>Dear attendee,</p><p>You're invited to <strong>{{event}}</strong>. We can't wait to see you there.</p><p>Date: {{date}}</p><p>Location/Platform: {{location}}</p>`
    },
    {
      name: "Class/Workshop Link",
      subject: "Your class access for {{event}}",
      body: `<p>Hello,</p><p>Here is your access info for <strong>{{event}}</strong>.</p><p>Meeting link: {{link}}</p><p>Starts at: {{time}}</p>`
    },
    {
      name: "Seminar Reminder",
      subject: "Reminder: {{event}} starts soon",
      body: `<p>Hi there,</p><p>This is a reminder that <strong>{{event}}</strong> starts soon.</p><p>Date: {{date}}</p><p>Join link: {{link}}</p>`
    },
    {
      name: "Marketing Promo",
      subject: "Special updates for {{event}}",
      body: `<p>Greetings,</p><p>We're excited to share special updates about <strong>{{event}}</strong>.</p><p>Highlights: {{highlights}}</p>`
    },
    {
      name: "General Update",
      subject: "Latest info: {{event}}",
      body: `<p>Dear attendee,</p><p>Here's the latest information for <strong>{{event}}</strong>.</p><p>Details: {{details}}</p>`
    },
  ];

  const applyTemplate = (tpl: { name: string; subject: string; body: string }) => {
    const title = eventResponse?.data?.title || "the event";
    const date = eventResponse?.data?.eventDate
      ? new Date(eventResponse.data.eventDate).toLocaleDateString()
      : "the scheduled date";
    const link = eventResponse?.data?.meetingLink || "(add link)";
    const time = eventResponse?.data?.startTime ? `${eventResponse.data.startTime}` : "(time)";
    const location = eventResponse?.data?.mode === "Offline"
      ? eventResponse?.data?.venueName || "venue"
      : eventResponse?.data?.platformType || "online";

    setSubject(tpl.subject.replace("{{event}}", title));
    setContent(
      tpl.body
        .replace(/{{event}}/g, title)
        .replace(/{{date}}/g, date)
        .replace(/{{link}}/g, link)
        .replace(/{{time}}/g, time)
        .replace(/{{location}}/g, location)
        .replace(/{{highlights}}/g, "Key updates")
        .replace(/{{details}}/g, "Important details inside")
    );
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!content || content.trim() === "<p><br></p>") {
      toast.error("Email body is required");
      return;
    }
    if (recipientIds.length === 0) {
      toast.error("No registrations to email");
      return;
    }

    try {
      await sendEmails({ eventId, subject: subject.trim(), content, registrationIds: recipientIds }).unwrap();
      toast.success(`Emails sent to ${recipientIds.length} registrants`);
      router.push(`/admin/events/${eventId}/registrations`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push(`/admin/events/${eventId}/registrations`)}
        >
          Back to Registrations
        </Button>
        <h1 className="text-2xl font-bold">Email All Registrants</h1>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">Event</span>
            <span className="text-lg font-semibold">{eventResponse?.data?.title || "Event"}</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
            <Chip variant="flat" color="primary">
              {registrations.length} recipient{registrations.length === 1 ? "" : "s"}
            </Chip>
            {sending && <Chip color="warning" variant="flat">Sending...</Chip>}
          </div>

          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <Button
                key={tpl.name}
                size="sm"
                variant="flat"
                onPress={() => applyTemplate(tpl)}
                isDisabled={sending}
              >
                Use {tpl.name}
              </Button>
            ))}
          </div>

          <Input
            label="Subject"
            placeholder="Enter email subject"
            value={subject}
            onValueChange={setSubject}
            isRequired
            variant="bordered"
          />

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner label="Loading recipients..." />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Message</label>
              <ReactQuill theme="snow" value={content} onChange={setContent} />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<FaEnvelope />}
              onPress={handleSend}
              isLoading={sending}
              isDisabled={sending || isLoading}
            >
              Send to All
            </Button>
            <Button variant="bordered" onPress={() => router.push(`/admin/events/${eventId}/registrations`)}>
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
