"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link as NextUILink,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import {
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
  useSendApplicationEmailMutation,
  useGetLatestEmailQuery,
} from "@/redux/api/jobApi";
import SendEmailModal from "@/components/SendEmailModal";

const statusColors: Record<string, any> = {
  pending: "warning",
  reviewed: "info",
  shortlisted: "secondary",
  rejected: "danger",
  accepted: "success",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedForEmail, setSelectedForEmail] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEmailOpen, onOpen: onEmailOpen, onClose: onEmailClose } = useDisclosure();

  const { data: applicationsData, isLoading, refetch } = useGetApplicationsQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  const [sendEmail, { isLoading: isSendingEmail }] = useSendApplicationEmailMutation();

  const applications = applicationsData?.data || [];

  const filteredApplications = applications.filter((app: any) =>
    app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.jobId?.title && app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await updateStatus({ id: appId, status: newStatus }).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      await deleteApplication(appId).unwrap();
      refetch();
      onClose();
    } catch (error: any) {
      console.error("Failed to delete application:", error);
    }
  };

  const openDetails = (app: any) => {
    setSelectedApplication(app);
    onOpen();
  };

  const handleSendEmail = async (data: { subject: string; message: string }) => {
    try {
      await sendEmail({
        applicationId: selectedForEmail._id,
        recipientEmail: selectedForEmail.email,
        recipientName: selectedForEmail.fullName,
        subject: data.subject,
        message: data.message,
      }).unwrap();

      // Show success message
      alert("Email sent successfully!");
      refetch();
      onEmailClose();
      setSelectedForEmail(null);
    } catch (error: any) {
      console.error("Failed to send email:", error);
      throw error;
    }
  };

  const openEmailModal = (app: any) => {
    setSelectedForEmail(app);
    onEmailOpen();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>

        {/* Header Section */}
        <Card className="bg-white shadow-lg border border-gray-200 mb-4 md:mb-6">
          <CardHeader className="flex flex-col gap-4 p-4 md:p-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Job Applications
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Manage and review job applications
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Filters Section */}
        <Card className="bg-white shadow-lg border border-gray-200 mb-4 md:mb-6">
          <CardBody className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                isClearable
              />

              <Select
                label="Filter by Status"
                selectedKeys={[statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectItem key="all" value="all">
                  All Applications
                </SelectItem>
                <SelectItem key="pending" value="pending">
                  Pending Review
                </SelectItem>
                <SelectItem key="reviewed" value="reviewed">
                  Reviewed
                </SelectItem>
                <SelectItem key="shortlisted" value="shortlisted">
                  Shortlisted
                </SelectItem>
                <SelectItem key="rejected" value="rejected">
                  Rejected
                </SelectItem>
                <SelectItem key="accepted" value="accepted">
                  Accepted
                </SelectItem>
              </Select>

              <Button
                isLoading={isLoading}
                onPress={() => refetch()}
                variant="bordered"
              >
                Refresh
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Applications Table */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner label="Loading applications..." />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table aria-label="Job Applications Table">
                  <TableHeader>
                    <TableColumn>Applicant</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Position</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Applied</TableColumn>
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: any) => (
                      <TableRow key={app._id}>
                        <TableCell className="font-medium">
                          {app.fullName}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${app.email}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {app.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {app.jobId?.title || "Position Deleted"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={statusColors[app.status]}
                            variant="flat"
                          >
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => openDetails(app)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              onPress={() => openEmailModal(app)}
                            >
                              Email
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => handleDelete(app._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Application Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <p>Application Details</p>
            <p className="text-sm font-normal text-gray-600">
              {selectedApplication?.fullName}
            </p>
          </ModalHeader>

          <ModalBody className="space-y-4">
            {selectedApplication && (
              <>
                {/* Basic Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedApplication.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Applied Date</p>
                      <p className="font-medium">
                        {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Position Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Position</h4>
                  <div className="text-sm">
                    <p className="text-gray-600">Job Title</p>
                    <p className="font-medium">
                      {selectedApplication.jobId?.title || "Position Deleted"}
                    </p>
                  </div>
                </div>

                {/* LinkedIn Profile */}
                {selectedApplication.linkedinProfile && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">LinkedIn</h4>
                    <NextUILink
                      href={selectedApplication.linkedinProfile}
                      isExternal
                      className="text-blue-600 text-sm"
                    >
                      View LinkedIn Profile
                    </NextUILink>
                  </div>
                )}

                {/* Resume */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Resume</h4>
                  <Button
                    as="a"
                    href={selectedApplication.resumeUrl}
                    target="_blank"
                    variant="bordered"
                    size="sm"
                  >
                    Download Resume
                  </Button>
                </div>

                {/* Additional Info */}
                {selectedApplication.additionalInfo && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Additional Information</h4>
                    <p className="text-sm text-gray-700">
                      {selectedApplication.additionalInfo}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Update Status</h4>
                  <Select
                    selectedKeys={[selectedApplication.status]}
                    onChange={(e) => {
                      handleStatusChange(
                        selectedApplication._id,
                        e.target.value
                      );
                      setSelectedApplication({
                        ...selectedApplication,
                        status: e.target.value,
                      });
                    }}
                    isDisabled={isUpdating}
                  >
                    <SelectItem key="pending" value="pending">
                      Pending Review
                    </SelectItem>
                    <SelectItem key="reviewed" value="reviewed">
                      Reviewed
                    </SelectItem>
                    <SelectItem key="shortlisted" value="shortlisted">
                      Shortlisted
                    </SelectItem>
                    <SelectItem key="rejected" value="rejected">
                      Rejected
                    </SelectItem>
                    <SelectItem key="accepted" value="accepted">
                      Accepted
                    </SelectItem>
                  </Select>
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailOpen}
        onClose={onEmailClose}
        applicantEmail={selectedForEmail?.email || ""}
        applicantName={selectedForEmail?.fullName || ""}
        onSendEmail={handleSendEmail}
        isSending={isSendingEmail}
      />
    </div>
  );
}
