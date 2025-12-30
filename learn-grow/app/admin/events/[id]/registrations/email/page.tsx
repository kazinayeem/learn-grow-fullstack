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
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetEventByIdQuery,
  useGetEventRegistrationsQuery,
  useSendRegistrationEmailsMutation,
  useGetEventEmailHistoryQuery,
} from "@/redux/api/eventApi";
import { FaArrowLeft, FaEnvelope, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
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

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<p>Dear attendee,</p><p>Thank you for registering. Here are the latest updates.</p>");
  const [signature, setSignature] = useState("Learn & Grow Team");
  const [sendEmails, { isLoading: sending }] = useSendRegistrationEmailsMutation();
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [selectedEmailHistory, setSelectedEmailHistory] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { data: eventResponse } = useGetEventByIdQuery(eventId, { skip: !eventId });
  const { data: registrationsResponse, isLoading } = useGetEventRegistrationsQuery(
    { eventId, page: 1, limit: 1000 },
    { skip: !eventId }
  );
  const { data: historyResponse, isLoading: loadingHistory } = useGetEventEmailHistoryQuery(
    { eventId, page: historyPage, limit: 10, search: historySearch || undefined },
    { skip: !eventId }
  );

  const registrations: any[] = registrationsResponse?.data || [];
  const recipientIds = useMemo(() => registrations.map((r) => r._id), [registrations]);
  const emailHistory: any[] = historyResponse?.data || [];
  const historyPagination = historyResponse?.pagination;

  const templates = [
    {
      name: "🎉 Event Invitation",
      subject: "You're Invited: {{event}}",
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">You're Invited!</h2>
          <p>Dear Valued Attendee,</p>
          <p>We are delighted to invite you to <strong style="color: #2563eb;">{{event}}</strong>. Your participation would mean a lot to us, and we can't wait to see you there!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">📅 Event Details</h3>
            <p style="margin: 8px 0;"><strong>Date:</strong> {{date}}</p>
            <p style="margin: 8px 0;"><strong>Location/Platform:</strong> {{location}}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> {{time}}</p>
          </div>
          
          <p>Please mark your calendar and join us for an enriching experience. We look forward to seeing you!</p>
        </div>
      `
    },
    {
      name: "🔗 Class/Workshop Access",
      subject: "Your Access Link: {{event}}",
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #059669; margin-bottom: 20px;">Your Class Access is Ready!</h2>
          <p>Hello,</p>
          <p>Thank you for registering for <strong style="color: #059669;">{{event}}</strong>. Here's everything you need to join:</p>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #065f46; margin-top: 0;">🎓 Access Information</h3>
            <p style="margin: 8px 0;"><strong>Meeting Link:</strong> <a href="{{link}}" style="color: #059669;">{{link}}</a></p>
            <p style="margin: 8px 0;"><strong>Start Time:</strong> {{time}}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> {{date}}</p>
          </div>
          
          <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>💡 Pro Tip:</strong> Join 5-10 minutes early to test your audio and video setup.
          </p>
        </div>
      `
    },
    {
      name: "⏰ Event Reminder",
      subject: "Reminder: {{event}} Starts Soon!",
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">⏰ Don't Forget!</h2>
          <p>Hi there,</p>
          <p>This is a friendly reminder that <strong style="color: #dc2626;">{{event}}</strong> is coming up soon!</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">📍 Quick Details</h3>
            <p style="margin: 8px 0;"><strong>Date:</strong> {{date}}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> {{time}}</p>
            <p style="margin: 8px 0;"><strong>Join Link:</strong> <a href="{{link}}" style="color: #dc2626;">Click here to join</a></p>
          </div>
          
          <p>We're excited to have you join us. See you soon!</p>
        </div>
      `
    },
    {
      name: "📢 Marketing Update",
      subject: "Exciting Updates: {{event}}",
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">📢 Special Updates!</h2>
          <p>Greetings,</p>
          <p>We're thrilled to share some exciting updates about <strong style="color: #7c3aed;">{{event}}</strong>!</p>
          
          <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="color: #5b21b6; margin-top: 0;">✨ Highlights</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Enhanced learning materials and resources</li>
              <li>Interactive sessions with industry experts</li>
              <li>Networking opportunities with fellow attendees</li>
              <li>Certificate of completion</li>
            </ul>
          </div>
          
          <p>Don't miss out on this amazing opportunity. We look forward to your participation!</p>
        </div>
      `
    },
    {
      name: "📋 General Information",
      subject: "Important Information: {{event}}",
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0891b2; margin-bottom: 20px;">📋 Latest Information</h2>
          <p>Dear Attendee,</p>
          <p>Here's the latest information regarding <strong style="color: #0891b2;">{{event}}</strong>:</p>
          
          <div style="background: #ecfeff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
            <h3 style="color: #155e75; margin-top: 0;">📌 Key Information</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> {{date}}</p>
            <p style="margin: 8px 0;"><strong>Start Time:</strong> {{time}}</p>
            <p style="margin: 8px 0;"><strong>Venue:</strong> {{location}}</p>
          </div>
          
          <p>Should you have any questions or require additional information, please don't hesitate to reach out to us.</p>
          <p>We appreciate your interest and look forward to your attendance!</p>
        </div>
      `
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

    let processedBody = tpl.body
      .replace(/{{event}}/g, title)
      .replace(/{{date}}/g, date)
      .replace(/{{link}}/g, link)
      .replace(/{{time}}/g, time)
      .replace(/{{location}}/g, location)
      .replace(/{{highlights}}/g, "Key updates")
      .replace(/{{details}}/g, "Important details inside");

    // Add signature with logo
    const logoUrl = (document.getElementById('logoUrl') as HTMLInputElement)?.value || '';
    let signatureHtml = `<br/><br/><hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;"/>`;
    
    if (logoUrl) {
      signatureHtml += `<div style="margin-top: 20px; text-align: left;">`;
      signatureHtml += `<img src="${logoUrl}" alt="Logo" style="max-width: 150px; max-height: 60px; margin-bottom: 10px;" />`;
      signatureHtml += `<p style="color: #666; font-size: 14px; margin: 0;">Best regards,<br/><strong style="color: #333;">${signature}</strong></p>`;
      signatureHtml += `</div>`;
    } else {
      signatureHtml += `<p style="color: #666; font-size: 14px; margin-top: 20px;">Best regards,<br/><strong style="color: #333;">${signature}</strong></p>`;
    }
    
    processedBody += signatureHtml;

    setSubject(tpl.subject.replace("{{event}}", title));
    setContent(processedBody);
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

    // Add signature with logo to content if not already there
    let finalContent = content;
    if (!content.includes("Best regards")) {
      const logoUrl = (document.getElementById('logoUrl') as HTMLInputElement)?.value || '';
      let signatureHtml = `<br/><br/><hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;"/>`;
      
      if (logoUrl) {
        signatureHtml += `<div style="margin-top: 20px; text-align: left;">`;
        signatureHtml += `<img src="${logoUrl}" alt="Logo" style="max-width: 150px; max-height: 60px; margin-bottom: 10px;" />`;
        signatureHtml += `<p style="color: #666; font-size: 14px; margin: 0;">Best regards,<br/><strong style="color: #333;">${signature}</strong></p>`;
        signatureHtml += `</div>`;
      } else {
        signatureHtml += `<p style="color: #666; font-size: 14px; margin-top: 20px;">Best regards,<br/><strong style="color: #333;">${signature}</strong></p>`;
      }
      
      finalContent += signatureHtml;
    }

    try {
      await sendEmails({ eventId, subject: subject.trim(), content: finalContent, registrationIds: recipientIds }).unwrap();
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
        <h1 className="text-2xl font-bold">Email Management</h1>
      </div>

      <Tabs aria-label="Email Options" color="primary">
        {/* Send Email Tab */}
        <Tab key="send" title={<div className="flex items-center gap-2"><FaEnvelope /> Send Emails</div>}>
          <Card className="mt-4">
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

              {/* Template Selection Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">📋 Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((tpl) => (
                    <Button
                      key={tpl.name}
                      size="lg"
                      variant="bordered"
                      onPress={() => applyTemplate(tpl)}
                      isDisabled={sending}
                      className="h-auto py-4 flex flex-col items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="font-semibold text-center">{tpl.name}</span>
                      <span className="text-xs text-gray-500 mt-1">Click to apply</span>
                    </Button>
                  ))}
                </div>
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
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ color: [] }, { background: [] }],
                        ["blockquote", "code-block"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ script: "sub" }, { script: "super" }],
                        [{ indent: "-1" }, { indent: "+1" }],
                        ["link", "image", "video"],
                        ["clean"],
                      ],
                    }}
                  />
                </div>
              )}

              {/* Signature Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">✍️ Email Signature</h3>
                <p className="text-sm text-gray-600 mb-4">This signature will be automatically added to the bottom of every email</p>
                
                <div className="space-y-3">
                  <Input
                    label="Signature Text"
                    placeholder="e.g., Learn & Grow Team, John Smith, Admin Team"
                    value={signature}
                    onValueChange={setSignature}
                    variant="bordered"
                  />
                  
                  <Input
                    id="logoUrl"
                    label="Logo URL (Optional)"
                    placeholder="e.g., https://example.com/logo.png"
                    variant="bordered"
                    description="Add your organization's logo image URL"
                  />
                </div>
                
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 mt-4 border-2 border-dashed border-blue-200">
                  <CardBody className="space-y-3">
                    <p className="text-gray-700 font-semibold flex items-center gap-2">
                      <span className="text-lg">👁️</span> Signature Preview:
                    </p>
                    <hr className="border-gray-300" />
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="space-y-2">
                        {(document.getElementById('logoUrl') as HTMLInputElement)?.value && (
                          <img 
                            src={(document.getElementById('logoUrl') as HTMLInputElement)?.value} 
                            alt="Logo" 
                            className="max-w-[150px] max-h-[60px] mb-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <p className="text-gray-600 text-sm">Best regards,</p>
                        <p className="font-bold text-gray-800">{signature || "Your Signature"}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

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
        </Tab>

        {/* Email History Tab */}
        <Tab key="history" title={<div className="flex items-center gap-2"><FaHistory /> Email History</div>}>
          <Card className="mt-4">
            <CardBody className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-600">Event</span>
                <span className="text-lg font-semibold">{eventResponse?.data?.title || "Event"}</span>
              </div>

              <Input
                placeholder="Search by name or email..."
                value={historySearch}
                onValueChange={setHistorySearch}
                variant="bordered"
              />

              {loadingHistory ? (
                <div className="flex justify-center py-10">
                  <Spinner label="Loading email history..." />
                </div>
              ) : emailHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-lg">No email history yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Emails sent to registrants will appear here
                  </p>
                </div>
              ) : (
                <>
                  <Table aria-label="Email history table">
                    <TableHeader>
                      <TableColumn>NAME</TableColumn>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>LAST EMAIL SENT</TableColumn>
                      <TableColumn>TOTAL EMAILS</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {emailHistory.map((record: any) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            <p className="font-semibold">{record.fullName}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-gray-400" />
                              <span>{record.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.emailHistory && record.emailHistory.length > 0 ? (
                              <div className="text-sm">
                                <p>{new Date(record.emailHistory[record.emailHistory.length - 1].sentAt).toLocaleDateString()}</p>
                                <p className="text-gray-500">
                                  {new Date(record.emailHistory[record.emailHistory.length - 1].sentAt).toLocaleTimeString()}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip variant="flat" color="success" size="sm">
                              {record.emailHistory?.length || 0} email{(record.emailHistory?.length || 0) !== 1 ? "s" : ""}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => {
                                setSelectedEmailHistory(record);
                                onOpen();
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {historyPagination && historyPagination.totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        total={historyPagination.totalPages}
                        page={historyPage}
                        onChange={setHistoryPage}
                        showControls
                      />
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Email Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Email History Details</h3>
                {selectedEmailHistory && (
                  <div className="text-sm font-normal text-gray-600">
                    <p><strong>Name:</strong> {selectedEmailHistory.fullName}</p>
                    <p><strong>Email:</strong> {selectedEmailHistory.email}</p>
                    <p><strong>Total Emails:</strong> {selectedEmailHistory.emailHistory?.length || 0}</p>
                  </div>
                )}
              </ModalHeader>
              <ModalBody>
                {selectedEmailHistory && selectedEmailHistory.emailHistory && selectedEmailHistory.emailHistory.length > 0 ? (
                  <div className="space-y-4">
                    {[...selectedEmailHistory.emailHistory].reverse().map((email: any, index: number) => (
                      <Card 
                        key={index} 
                        className={`${
                          email.status === "success" 
                            ? "bg-green-50 border-l-4 border-green-500" 
                            : "bg-red-50 border-l-4 border-red-500"
                        }`}
                      >
                        <CardBody className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {email.status === "success" ? (
                                <FaCheckCircle className="text-green-600 text-lg" />
                              ) : (
                                <FaTimesCircle className="text-red-600 text-lg" />
                              )}
                              <span className={`font-semibold ${email.status === "success" ? "text-green-700" : "text-red-700"}`}>
                                {email.status === "success" ? "Successfully Sent" : "Failed to Send"}
                              </span>
                            </div>
                            <Chip 
                              size="sm" 
                              variant="flat" 
                              startContent={<FaClock />}
                              color={email.status === "success" ? "success" : "danger"}
                            >
                              {new Date(email.sentAt).toLocaleString()}
                            </Chip>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700">Subject:</p>
                            <p className="text-sm text-gray-600">{email.subject}</p>
                          </div>

                          {email.status === "failed" && email.failureReason && (
                            <div className="mt-2 p-3 bg-red-100 rounded-lg">
                              <p className="text-sm font-semibold text-red-700">Error Message:</p>
                              <p className="text-sm text-red-600">{email.failureReason}</p>
                            </div>
                          )}

                          <div className="mt-2">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Message Preview:</p>
                            <div 
                              className="text-sm text-gray-600 p-3 bg-white rounded border max-h-40 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: email.content.substring(0, 300) + (email.content.length > 300 ? "..." : "") }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No email history available</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
