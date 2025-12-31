"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Input, Select, SelectItem, Pagination, Tabs, Tab } from "@nextui-org/react";
import { FaCheckCircle, FaTimesCircle, FaUserCheck, FaUserClock, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
    useGetAllInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
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
    const [limit, setLimit] = useState(12);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useGetAllInstructorsQuery({
        page,
        limit,
        search: debouncedSearch,
        status: filterStatus === "all" ? undefined : filterStatus,
    });
    
    const [approveInstructor, { isLoading: isApproving }] = useApproveInstructorMutation();
    const [rejectInstructor, { isLoading: isRejecting }] = useRejectInstructorMutation();
    const [processingId, setProcessingId] = React.useState<string | null>(null);

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
        if (confirm("Are you sure you want to reject/revoke approval for this instructor?")) {
            try {
                setProcessingId(instructorId);
                await rejectInstructor(instructorId).unwrap();
                alert("Instructor approval revoked! A notification email has been sent.");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to reject instructor");
            } finally {
                setProcessingId(null);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading instructors...</p>
                </div>
            </div>
        );
    }

    const instructorList = data?.data || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;
    const totalInstructors = pagination?.total || instructorList.length;
    
    // Get counts from current data
    const pending = instructorList.filter((i: any) => !i.isApproved);
    const approved = instructorList.filter((i: any) => i.isApproved);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
                className="mb-6"
            >
                Back to Dashboard
            </Button>
            
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Instructor Management 👨‍🏫</h1>
                <p className="text-gray-600">
                    Approve or reject instructor applications
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Instructors</p>
                                <p className="text-3xl font-bold">{totalInstructors}</p>
                            </div>
                            <FaUserCheck className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Pending Approval</p>
                                <p className="text-3xl font-bold">{pending.length}</p>
                            </div>
                            <FaUserClock className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Approved</p>
                                <p className="text-3xl font-bold">{approved.length}</p>
                            </div>
                            <FaCheckCircle className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    startContent={<span>🔍</span>}
                    variant="bordered"
                    className="flex-1"
                    isClearable
                    onClear={() => setSearchTerm("")}
                />
            </div>

            {/* Filter Tabs */}
            <Tabs
                selectedKey={filterStatus}
                onSelectionChange={(key) => {
                    setFilterStatus(key as "all" | "pending" | "approved");
                    setPage(1);
                }}
                className="mb-6"
                color="primary"
            >
                <Tab key="all" title={`All (${totalInstructors})`} />
                <Tab key="pending" title="Pending" />
                <Tab key="approved" title="Approved" />
            </Tabs>

            {/* Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {instructorList.map((instructor: any) => (
                            <Card key={instructor._id} className={instructor.isApproved ? "border-2 border-green-300" : "border-2 border-yellow-300"}>
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{instructor.name}</h3>
                                            <p className="text-sm text-gray-600">{instructor.email}</p>
                                            {instructor.phone && (
                                                <p className="text-sm text-gray-600">{instructor.phone}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">ID: {instructor._id}</p>
                                        </div>
                                        <Chip color={instructor.isApproved ? "success" : "warning"} size="sm" variant="flat">
                                            {instructor.isApproved ? "Approved" : "Pending"}
                                        </Chip>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        {!instructor.isApproved ? (
                                            <>
                                                <Button
                                                    color="success"
                                                    size="sm"
                                                    fullWidth
                                                    startContent={<FaCheckCircle />}
                                                    onPress={() => handleApprove(instructor._id)}
                                                    isLoading={processingId === instructor._id && isApproving}
                                                    isDisabled={processingId !== null}
                                                >
                                                    {processingId === instructor._id && isApproving ? "Approving..." : "Approve"}
                                                </Button>
                                                <Button
                                                    color="danger"
                                                    size="sm"
                                                    fullWidth
                                                    variant="flat"
                                                    startContent={<FaTimesCircle />}
                                                    onPress={() => handleReject(instructor._id)}
                                                    isLoading={processingId === instructor._id && isRejecting}
                                                    isDisabled={processingId !== null}
                                                >
                                                    {processingId === instructor._id && isRejecting ? "Rejecting..." : "Reject"}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                color="warning"
                                                size="sm"
                                                fullWidth
                                                startContent={<FaTimesCircle />}
                                                onPress={() => handleReject(instructor._id)}
                                                isLoading={processingId === instructor._id && isRejecting}
                                                isDisabled={processingId !== null}
                                            >
                                                {processingId === instructor._id && isRejecting ? "Revoking..." : "Revoke Approval"}
                                            </Button>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8 mb-6">
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button
                            size="sm"
                            isDisabled={page === 1}
                            variant="flat"
                            className="text-sm font-semibold px-4"
                            onPress={() => setPage(Math.max(1, page - 1))}
                        >
                            ← Previous
                        </Button>

                        <div className="flex gap-1.5 flex-wrap justify-center">
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
                                        size="sm"
                                        color={page === pageNum ? "primary" : "default"}
                                        variant={page === pageNum ? "solid" : "flat"}
                                        className="text-sm font-semibold px-3 min-w-[40px]"
                                        onPress={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            size="sm"
                            isDisabled={page === totalPages}
                            variant="flat"
                            className="text-sm font-semibold px-4"
                            onPress={() => setPage(Math.min(totalPages, page + 1))}
                        >
                            Next →
                        </Button>
                    </div>

                    <div className="text-sm text-gray-600 font-medium">
                        Page {page} of {totalPages} | Total Instructors: {totalInstructors}
                    </div>
                </div>
            )}

            {/* No Results */}
            {instructorList.length === 0 && (
                <Card>
                    <CardBody className="p-8 text-center text-gray-500">
                        No instructors found matching your criteria.
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
