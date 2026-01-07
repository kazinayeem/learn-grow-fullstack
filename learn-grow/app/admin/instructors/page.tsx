"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Input, Tabs, Tab, Skeleton, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { FaCheckCircle, FaTimesCircle, FaUserCheck, FaUserClock, FaArrowLeft, FaSearch, FaChalkboardTeacher, FaEnvelope, FaPhone, FaIdCard, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
    useGetAllInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
    useGetAdminDashboardStatsQuery,
    useDeleteUserMutation,
} from "@/redux/api/userApi";

export default function InstructorApprovalPage() {
    const router = useRouter();

    // Get user role
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role || "admin");
        }
    }, []);

    // Pagination and search state
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
    const [page, setPage] = useState(1);
    const limit = 12;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch dashboard stats for total count
    const { data: statsData } = useGetAdminDashboardStatsQuery(undefined);

    const { data, isLoading, refetch } = useGetAllInstructorsQuery({
        page,
        limit,
        search: debouncedSearch,
        status: filterStatus === "all" ? undefined : filterStatus,
    });

    const [approveInstructor, { isLoading: isApproving }] = useApproveInstructorMutation();
    const [rejectInstructor, { isLoading: isRejecting }] = useRejectInstructorMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [processingId, setProcessingId] = React.useState<string | null>(null);

    // Delete modal state
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [instructorToDelete, setInstructorToDelete] = useState<any>(null);

    const handleApprove = async (instructorId: string) => {
        if (confirm("Are you sure you want to approve this instructor?")) {
            try {
                setProcessingId(instructorId);
                await approveInstructor(instructorId).unwrap();
                alert("Instructor approved successfully! An email has been sent to notify them.");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to approve instructor");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleReject = async (instructorId: string) => {
        if (confirm("Are you sure you want to reject/rejected approval for this instructor?")) {
            try {
                setProcessingId(instructorId);
                await rejectInstructor(instructorId).unwrap();
                alert("Instructor approval rejectedd! A notification email has been sent.");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to reject instructor");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const openDeleteModal = (instructor: any) => {
        setInstructorToDelete(instructor);
        setDeleteConfirmText("");
        onOpen();
    };

    const handleDelete = async () => {
        if (deleteConfirmText !== "delete") {
            alert("Please type 'delete' exactly to confirm deletion.");
            return;
        }

        try {
            setProcessingId(instructorToDelete._id);
            await deleteUser(instructorToDelete._id).unwrap();
            alert("Instructor deleted successfully!");
            setInstructorToDelete(null);
            setDeleteConfirmText("");
            onOpenChange();
            refetch();
        } catch (error: any) {
            alert(error?.data?.message || "Failed to delete instructor");
        } finally {
            setProcessingId(null);
        }
    };

    const instructorList = data?.data || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;
    const totalInstructors = statsData?.data?.instructors || 0;

    // Get counts from current data
    const pending = instructorList.filter((i: any) => !i.isApproved);
    const approved = instructorList.filter((i: any) => i.isApproved);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            {/* Back Button */}
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
                className="mb-5 sm:mb-6 min-h-[44px] hover:bg-gray-100 transition-colors"
                size="lg"
            >
                Back to Dashboard
            </Button>

            {/* Header with Gradient */}
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                        <FaChalkboardTeacher className="text-3xl sm:text-4xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                            Instructor Management
                        </h1>
                        <p className="text-sm sm:text-base text-white/90 mt-1">
                            Approve or reject instructor applications
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards with Enhanced Design */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Instructors</p>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20 rounded-lg bg-white/20" />
                                ) : (
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalInstructors}</p>
                                )}
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                <FaChalkboardTeacher className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending Approval</p>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20 rounded-lg bg-white/20" />
                                ) : (
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pending.length}</p>
                                )}
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                                <FaUserClock className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 xs:col-span-2 lg:col-span-1">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Approved</p>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20 rounded-lg bg-white/20" />
                                ) : (
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{approved.length}</p>
                                )}
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Search with Enhanced Styling */}
            <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
                <CardBody className="p-4 sm:p-5">
                    <Input
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="lg"
                        startContent={<FaSearch className="text-primary-500 text-base sm:text-lg" />}
                        variant="bordered"
                        isClearable
                        onClear={() => setSearchTerm("")}
                        classNames={{
                            input: "text-sm sm:text-base",
                            inputWrapper: "min-h-[44px] border-2 hover:border-primary-400 transition-colors",
                        }}
                    />
                </CardBody>
            </Card>

            {/* Filter Tabs with Better Design */}
            <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
                <CardBody className="p-3 sm:p-4 overflow-x-auto">
                    <Tabs
                        selectedKey={filterStatus}
                        onSelectionChange={(key) => {
                            setFilterStatus(key as "all" | "pending" | "approved");
                            setPage(1);
                        }}
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-4 sm:gap-6 w-full",
                            cursor: "w-full bg-gradient-to-r from-primary-500 to-blue-500",
                            tab: "min-h-[44px] px-3 sm:px-4",
                            tabContent: "text-sm sm:text-base font-semibold"
                        }}
                    >
                        <Tab key="all" title={`All (${totalInstructors})`} />
                        <Tab key="pending" title={`Pending (${pending.length})`} />
                        <Tab key="approved" title={`Approved (${approved.length})`} />
                    </Tabs>
                </CardBody>
            </Card>

            {/* Instructors Grid with Enhanced Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="shadow-md">
                            <CardBody className="p-4 sm:p-5 lg:p-6">
                                <Skeleton className="h-40 sm:h-44 w-full rounded-lg" />
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : instructorList.length === 0 ? (
                <Card className="shadow-xl border-2 border-gray-200">
                    <CardBody className="p-10 sm:p-12 lg:p-16 text-center">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaChalkboardTeacher className="text-4xl sm:text-5xl text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                            No instructors found
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                            Try adjusting your search or filter criteria to find instructors
                        </p>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6">
                    {instructorList.map((instructor: any) => (
                        <Card
                            key={instructor._id}
                            className={`shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${instructor.isApproved
                                    ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                                    : "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
                                }`}
                        >
                            <CardBody className="p-4 sm:p-5 lg:p-6">
                                {/* Header with Avatar */}
                                <div className="flex items-start gap-3 mb-4">
                                    <Avatar
                                        src={instructor.profileImage}
                                        name={instructor.name}
                                        size="lg"
                                        className="flex-shrink-0"
                                        fallback={
                                            <div className="bg-gradient-to-br from-primary-500 to-blue-600 w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                                {instructor.name?.charAt(0).toUpperCase()}
                                            </div>
                                        }
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">
                                            {instructor.name}
                                        </h3>
                                        <Chip
                                            color={instructor.isApproved ? "success" : "warning"}
                                            size="sm"
                                            variant="flat"
                                            className="font-semibold"
                                            startContent={
                                                instructor.isApproved ?
                                                    <FaCheckCircle className="text-xs" /> :
                                                    <FaUserClock className="text-xs" />
                                            }
                                        >
                                            {instructor.isApproved ? "Approved" : "Pending"}
                                        </Chip>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-2 mb-4 bg-white/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                                        <FaEnvelope className="text-primary-500 flex-shrink-0" />
                                        <span className="text-gray-700 truncate">{instructor.email}</span>
                                    </div>
                                    {instructor.phone && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                                            <FaPhone className="text-primary-500 flex-shrink-0" />
                                            <span className="text-gray-700">{instructor.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                        <FaIdCard className="text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-500 truncate font-mono">ID: {instructor._id}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        {!instructor.isApproved ? (
                                            <>
                                                <Button
                                                    color="success"
                                                    size="md"
                                                    className="flex-1 min-h-[44px] font-semibold shadow-md hover:shadow-lg transition-shadow"
                                                    startContent={<FaCheckCircle />}
                                                    onPress={() => handleApprove(instructor._id)}
                                                    isLoading={processingId === instructor._id && isApproving}
                                                    isDisabled={processingId !== null}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="md"
                                                    className="flex-1 min-h-[44px] font-semibold"
                                                    variant="flat"
                                                    startContent={<FaTimesCircle />}
                                                    onPress={() => handleReject(instructor._id)}
                                                    isLoading={processingId === instructor._id && isRejecting}
                                                    isDisabled={processingId !== null}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                color="warning"
                                                size="md"
                                                className="w-full min-h-[44px] font-semibold shadow-md hover:shadow-lg transition-shadow"
                                                startContent={<FaTimesCircle />}
                                                onPress={() => handleReject(instructor._id)}
                                                isLoading={processingId === instructor._id && isRejecting}
                                                isDisabled={processingId !== null}
                                            >
                                                rejected Approval
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        color="danger"
                                        size="md"
                                        className="w-full min-h-[44px] font-semibold"
                                        variant="flat"
                                        startContent={<FaTrash />}
                                        onPress={() => openDeleteModal(instructor)}
                                        isDisabled={processingId !== null}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <Card className="shadow-lg border border-gray-200">
                    <CardBody className="p-4 sm:p-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <Button
                                    size="md"
                                    isDisabled={page === 1}
                                    variant="flat"
                                    className="text-sm sm:text-base font-semibold px-4 min-h-[44px] hover:bg-primary-50 transition-colors"
                                    onPress={() => setPage(Math.max(1, page - 1))}
                                >
                                    ← Previous
                                </Button>

                                <div className="hidden sm:flex gap-1.5 flex-wrap justify-center">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        let pageNum;

                                        if (totalPages <= 7) {
                                            pageNum = i + 1;
                                        } else {
                                            const startPage = Math.max(1, Math.min(page - 3, totalPages - 6));
                                            pageNum = startPage + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                size="md"
                                                color={page === pageNum ? "primary" : "default"}
                                                variant={page === pageNum ? "solid" : "flat"}
                                                className={`text-sm font-semibold px-3 min-w-[44px] min-h-[44px] ${page === pageNum ? "shadow-lg" : ""
                                                    }`}
                                                onPress={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    size="md"
                                    isDisabled={page === totalPages}
                                    variant="flat"
                                    className="text-sm sm:text-base font-semibold px-4 min-h-[44px] hover:bg-primary-50 transition-colors"
                                    onPress={() => setPage(Math.min(totalPages, page + 1))}
                                >
                                    Next →
                                </Button>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center bg-gray-50 px-4 py-2 rounded-full">
                                Page <span className="font-bold text-primary-600">{page}</span> of <span className="font-bold">{totalPages}</span> • Total: <span className="font-bold text-primary-600">{totalInstructors}</span> instructors
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="md">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger">
                                <div className="flex items-center gap-2">
                                    <FaTrash className="text-lg" />
                                    Delete Instructor
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Warning: This action cannot be undone!</p>
                                        <p className="text-sm text-red-700">
                                            You are about to permanently delete <span className="font-bold">{instructorToDelete?.name}</span> and all their associated data.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 mb-3">
                                            To confirm deletion, type the word <span className="font-bold bg-yellow-100 px-2 py-1 rounded">delete</span> in the field below:
                                        </p>
                                        <Input
                                            placeholder='Type "delete" to confirm'
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            variant="bordered"
                                            size="lg"
                                            isClearable
                                            onClear={() => setDeleteConfirmText("")}
                                            classNames={{
                                                input: "text-sm font-mono",
                                                inputWrapper: "min-h-[44px]",
                                            }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="default"
                                    variant="light"
                                    onPress={onClose}
                                    size="md"
                                    className="min-h-[44px] font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleDelete}
                                    isDisabled={deleteConfirmText !== "delete"}
                                    isLoading={processingId === instructorToDelete?._id && isDeleting}
                                    size="md"
                                    className="min-h-[44px] font-semibold"
                                    startContent={<FaTrash />}
                                >
                                    Delete Permanently
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
