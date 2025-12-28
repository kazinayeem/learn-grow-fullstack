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
    const { data: instructors, isLoading, refetch } = useGetAllInstructorsQuery(undefined);
    const [approveInstructor, { isLoading: isApproving }] = useApproveInstructorMutation();
    const [rejectInstructor, { isLoading: isRejecting }] = useRejectInstructorMutation();
    const [processingId, setProcessingId] = React.useState<string | null>(null);
    
    // Pagination and search state
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const instructorList = instructors?.data || [];
    
    // Filter by search and status
    const filteredInstructors = instructorList.filter((instructor: any) => {
        const matchesSearch = !debouncedSearch || 
            instructor.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            instructor.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            instructor._id?.toLowerCase().includes(debouncedSearch.toLowerCase());
        
        const matchesStatus = 
            filterStatus === "all" ||
            (filterStatus === "pending" && !instructor.isApproved) ||
            (filterStatus === "approved" && instructor.isApproved);
        
        return matchesSearch && matchesStatus;
    });
    
    // Pagination
    const totalPages = Math.ceil(filteredInstructors.length / limit);
    const paginatedInstructors = filteredInstructors.slice((page - 1) * limit, page * limit);
    
    const pending = instructorList.filter((i: any) => !i.isApproved);
    const approved = instructorList.filter((i: any) => i.isApproved);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Button
                variant="light"
                startContent={<FaArrowLeft />}
                onPress={() => router.push("/admin")}
                className="mb-6"
            >
                Back to Admin Dashboard
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
                                <p className="text-3xl font-bold">{instructorList.length}</p>
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
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    startContent={<span>🔍</span>}
                    variant="bordered"
                    className="flex-1"
                    isClearable
                    onClear={() => setSearchTerm("")}
                />
                <Select
                    label="Items per page"
                    selectedKeys={[String(limit)]}
                    onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                    }}
                    className="w-full sm:w-32"
                    size="lg"
                >
                    <SelectItem key="10" value="10">10</SelectItem>
                    <SelectItem key="20" value="20">20</SelectItem>
                    <SelectItem key="50" value="50">50</SelectItem>
                    <SelectItem key="100" value="100">100</SelectItem>
                </Select>
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
                <Tab key="all" title={`All (${filteredInstructors.length})`} />
                <Tab key="pending" title={`Pending (${pending.length})`} />
                <Tab key="approved" title={`Approved (${approved.length})`} />
            </Tabs>

            {/* Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {paginatedInstructors.map((instructor: any) => (
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
                <div className="flex justify-center mt-8 mb-6">
                    <Pagination
                        total={totalPages}
                        page={page}
                        onChange={setPage}
                        showControls
                        color="primary"
                        size="lg"
                    />
                </div>
            )}

            {/* No Results */}
            {filteredInstructors.length === 0 && (
                <Card>
                    <CardBody className="p-8 text-center text-gray-500">
                        No instructors found matching your criteria.
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
