"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
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
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaClipboardList, FaSearch, FaSync, FaEye, FaEnvelope, FaTrash, FaUser, FaPhone, FaBriefcase, FaLinkedin, FaFileDownload, FaTimes } from "react-icons/fa";
import {
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
  useSendApplicationEmailMutation,
} from "@/redux/api/jobApi";
import SendEmailModal from "@/components/SendEmailModal";
import toast from "react-hot-toast";

const statusColors: Record<string, any> = {
  pending: "warning",
  reviewed: "primary",
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

  const totalApplications = applications.length;
  const pendingCount = applications.filter((app: any) => app.status === "pending").length;
  const shortlistedCount = applications.filter((app: any) => app.status === "shortlisted").length;
  const acceptedCount = applications.filter((app: any) => app.status === "accepted").length;

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await updateStatus({ id: appId, status: newStatus }).unwrap();
      toast.success("Status updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (appId: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await deleteApplication(appId).unwrap();
        toast.success("Application deleted successfully");
        refetch();
        onClose();
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete application");
      }
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

      toast.success("Email sent successfully!");
      refetch();
      onEmailClose();
      setSelectedForEmail(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send email");
      throw error;
    }
  };

  const openEmailModal = (app: any) => {
    setSelectedForEmail(app);
    onEmailOpen();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin/jobs")}
          className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
          size="lg"
        >
          Back to Jobs
        </Button>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
            <FaClipboardList className="text-3xl sm:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Job Applications
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Manage and review job applications
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Applications</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalApplications}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaClipboardList className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pendingCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                <FaClipboardList className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Shortlisted</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{shortlistedCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaUser className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Accepted</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{acceptedCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaBriefcase className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</label>
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isClearable
              size="lg"
              startContent={<FaSearch className="text-purple-500" />}
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-purple-400 focus-within:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filter by Status</label>
            <Select
              selectedKeys={[statusFilter]}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="all" value="all">All Applications</SelectItem>
              <SelectItem key="pending" value="pending">Pending Review</SelectItem>
              <SelectItem key="reviewed" value="reviewed">Reviewed</SelectItem>
              <SelectItem key="shortlisted" value="shortlisted">Shortlisted</SelectItem>
              <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
              <SelectItem key="accepted" value="accepted">Accepted</SelectItem>
            </Select>
          </div>

          <Button
            isLoading={isLoading}
            onPress={() => refetch()}
            variant="flat"
            size="lg"
            startContent={<FaSync />}
            className="min-h-[48px] font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Applications Table/Cards */}
      <Card className="shadow-xl border-2 border-gray-100">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" label="Loading applications..." />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClipboardList className="text-4xl sm:text-5xl text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No applications found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "No applications have been submitted yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Job Applications Table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
                  <TableHeader>
                    <TableColumn>APPLICANT</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>POSITION</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>APPLIED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: any) => (
                      <TableRow key={app._id} className="hover:bg-gray-50">
                        <TableCell className="font-semibold text-gray-900">{app.fullName}</TableCell>
                        <TableCell>
                          <a href={`mailto:${app.email}`} className="text-purple-600 hover:underline text-sm">
                            {app.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{app.jobId?.title || "Position Deleted"}</span>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" color={statusColors[app.status]} variant="flat">
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Chip>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="flat" onPress={() => openDetails(app)} startContent={<FaEye />}>
                              View
                            </Button>
                            <Button size="sm" color="primary" variant="flat" onPress={() => openEmailModal(app)} startContent={<FaEnvelope />}>
                              Email
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onPress={() => handleDelete(app._id)} startContent={<FaTrash />}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Cards */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {filteredApplications.map((app: any) => (
                  <Card key={app._id} className="border border-gray-200 hover:border-purple-300 transition-colors shadow-sm hover:shadow-md">
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">{app.fullName}</h3>
                          <a href={`mailto:${app.email}`} className="text-xs text-purple-600 hover:underline block truncate">
                            {app.email}
                          </a>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Chip size="sm" color={statusColors[app.status]} variant="flat">
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Position:</span>
                          <span className="text-gray-700 ml-2 font-semibold">{app.jobId?.title || "Position Deleted"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Applied:</span>
                          <span className="text-gray-700 ml-2">{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button size="md" variant="flat" className="min-h-[44px] font-semibold" startContent={<FaEye />} onPress={() => openDetails(app)}>
                          View
                        </Button>
                        <Button size="md" color="primary" variant="flat" className="min-h-[44px] font-semibold" startContent={<FaEnvelope />} onPress={() => openEmailModal(app)}>
                          Email
                        </Button>
                        <Button size="md" color="danger" variant="flat" className="min-h-[44px] font-semibold" startContent={<FaTrash />} onPress={() => handleDelete(app._id)}>
                          Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Application Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaUser className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Application Details</h2>
                <p className="text-sm text-white/90 font-normal">{selectedApplication?.fullName}</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-6 space-y-6">
            {selectedApplication && (
              <>
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-purple-200">
                    <FaUser className="text-purple-500" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{selectedApplication.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedApplication.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Applied Date</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-purple-200">
                    <FaBriefcase className="text-purple-500" />
                    Position
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">Job Title</p>
                    <p className="font-semibold text-gray-900">{selectedApplication.jobId?.title || "Position Deleted"}</p>
                  </div>
                </div>

                {/* LinkedIn */}
                {selectedApplication.linkedinProfile && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-purple-200">
                      <FaLinkedin className="text-purple-500" />
                      LinkedIn
                    </h4>
                    <NextUILink href={selectedApplication.linkedinProfile} isExternal className="text-purple-600 text-sm flex items-center gap-2">
                      <FaLinkedin /> View LinkedIn Profile
                    </NextUILink>
                  </div>
                )}

                {/* Resume */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b-2 border-purple-200">
                    <FaFileDownload className="text-purple-500" />
                    Resume
                  </h4>
                  <Button as="a" href={selectedApplication.resumeUrl} target="_blank" variant="flat" size="lg" startContent={<FaFileDownload />} className="min-h-[44px] font-semibold">
                    Download Resume
                  </Button>
                </div>

                {/* Additional Info */}
                {selectedApplication.additionalInfo && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 pb-2 border-b-2 border-purple-200">Additional Information</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedApplication.additionalInfo}</p>
                  </div>
                )}

                {/* Status Update */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 pb-2 border-b-2 border-purple-200">Update Status</h4>
                  <Select
                    selectedKeys={[selectedApplication.status]}
                    onChange={(e) => {
                      handleStatusChange(selectedApplication._id, e.target.value);
                      setSelectedApplication({ ...selectedApplication, status: e.target.value });
                    }}
                    isDisabled={isUpdating}
                    size="lg"
                    variant="bordered"
                    classNames={{
                      trigger: "min-h-[48px] border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-all duration-300",
                    }}
                  >
                    <SelectItem key="pending" value="pending">Pending Review</SelectItem>
                    <SelectItem key="reviewed" value="reviewed">Reviewed</SelectItem>
                    <SelectItem key="shortlisted" value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                    <SelectItem key="accepted" value="accepted">Accepted</SelectItem>
                  </Select>
                </div>
              </>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-gray-200 p-6">
            <Button color="default" variant="flat" onPress={onClose} size="lg" className="min-h-[48px] font-semibold" startContent={<FaTimes />}>
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
