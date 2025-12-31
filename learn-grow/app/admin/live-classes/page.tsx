"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Input, Chip, Spinner } from "@nextui-org/react";
import { FaVideo, FaClock, FaCalendar, FaCheckCircle, FaBan, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    useGetPendingLiveClassesQuery,
    useApproveLiveClassMutation,
    useRejectLiveClassMutation,
    useDeleteLiveClassMutation,
} from "@/redux/api/liveClassApi";

export default function AdminLiveClassesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");
    const itemsPerPage = 10;

    const { data: pendingData, isLoading, refetch } = useGetPendingLiveClassesQuery(undefined);
    const [approveLiveClass] = useApproveLiveClassMutation();
    const [rejectLiveClass] = useRejectLiveClassMutation();
    const [deleteLiveClass] = useDeleteLiveClassMutation();

    const classes = pendingData?.data || [];

    // Filter classes
    let filteredClasses = classes.filter((cls: any) => {
        const matchesSearch = 
            cls.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.courseId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.instructorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || cls.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesPlatform = platformFilter === "all" || cls.platform?.toLowerCase() === platformFilter.toLowerCase();
        const matchesApproval = approvalFilter === "all" || 
            (approvalFilter === "approved" && cls.isApproved) ||
            (approvalFilter === "pending" && !cls.isApproved);
        
        return matchesSearch && matchesStatus && matchesPlatform && matchesApproval;
    });

    // Count approved and pending
    const approvedCount = classes.filter((cls: any) => cls.isApproved).length;
    const pendingCount = classes.filter((cls: any) => !cls.isApproved).length;

    // Pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

    const handleApprove = async (id: string, title: string) => {
        if (confirm(`Approve live class: "${title}"?`)) {
            try {
                await approveLiveClass(id).unwrap();
                toast.success("Live class approved successfully!");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to approve live class");
            }
        }
    };

    const handleReject = async (id: string, title: string) => {
        if (confirm(`Reject and delete live class: "${title}"?`)) {
            try {
                await rejectLiveClass(id).unwrap();
                toast.success("Live class rejected and deleted!");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to reject live class");
            }
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Delete live class: "${title}"? This action cannot be undone.`)) {
            try {
                await deleteLiveClass(id).unwrap();
                toast.success("Live class deleted successfully!");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to delete live class");
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "scheduled":
                return "primary";
            case "completed":
                return "success";
            case "cancelled":
                return "danger";
            default:
                return "default";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading live classes..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button 
                            variant="light" 
                            startContent={<FaArrowLeft />}
                            onPress={() => router.push("/admin")}
                        >
                            Back
                        </Button>
                        <h1 className="text-4xl font-bold">Pending Live Classes 🎥</h1>
                    </div>
                    <p className="text-gray-600">Review and approve instructor live class requests</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Pending Approval</p>
                                <p className="text-3xl font-bold mt-1">{pendingCount}</p>
                            </div>
                            <FaClock className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Scheduled</p>
                                <p className="text-3xl font-bold mt-1">
                                    {classes.filter((c: any) => c.status === "Scheduled").length}
                                </p>
                            </div>
                            <FaCalendar className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Approved Classes</p>
                                <p className="text-3xl font-bold mt-1">{approvedCount}</p>
                            </div>
                            <FaCheckCircle className="text-4xl opacity-80" />
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Classes</p>
                                <p className="text-3xl font-bold mt-1">{classes.length}</p>
                            </div>
                            <FaVideo className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <Input
                    placeholder="Search classes by title, course, or instructor..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    size="lg"
                    startContent={<FaVideo />}
                />
                
                <div className="flex flex-wrap gap-4">
                    <select
                        value={approvalFilter}
                        onChange={(e) => { setApprovalFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Approval Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={platformFilter}
                        onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Platforms</option>
                        <option value="zoom">Zoom</option>
                        <option value="meet">Meet</option>
                        <option value="teams">Teams</option>
                    </select>

                    {(searchQuery || statusFilter !== "all" || platformFilter !== "all" || approvalFilter !== "all") && (
                        <Button
                            size="sm"
                            color="default"
                            variant="flat"
                            onPress={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                                setPlatformFilter("all");
                                setApprovalFilter("all");
                                setCurrentPage(1);
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Classes List */}
            {paginatedClasses.length === 0 ? (
                <Card>
                    <CardBody className="p-12 text-center">
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
                        <p className="text-gray-600">
                            {classes.length === 0
                                ? "No pending live classes to review."
                                : "No classes match your search criteria."}
                        </p>
                    </CardBody>
                </Card>
            ) : (
                <div className="space-y-4">
                    {paginatedClasses.map((cls: any) => (
                        <Card key={cls._id} className="hover:shadow-lg transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-xl">{cls.title}</h3>
                                            <Chip color={getStatusColor(cls.status) as any} size="sm" variant="flat">
                                                {cls.status?.toUpperCase()}
                                            </Chip>
                                            <Chip size="sm" variant="flat" color="warning">
                                                {cls.platform}
                                            </Chip>
                                            <Chip 
                                                size="sm" 
                                                variant="flat" 
                                                color={cls.isApproved ? "success" : "danger"}
                                            >
                                                {cls.isApproved ? "APPROVED" : "PENDING APPROVAL"}
                                            </Chip>
                                        </div>
                                        <p className="text-gray-600 mb-1">
                                            Course: {typeof cls.courseId === 'object' ? cls.courseId?.title : 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Instructor: {typeof cls.instructorId === 'object' ? cls.instructorId?.name : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-sm text-gray-600">Scheduled Date</p>
                                            <p className="font-semibold">
                                                {new Date(cls.scheduledAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm">
                                                {new Date(cls.scheduledAt).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Duration</p>
                                            <p className="text-xl font-bold">{cls.duration} min</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {!cls.isApproved && (
                                            <Button
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                                startContent={<FaCheckCircle />}
                                                onPress={() => handleApprove(cls._id, cls.title)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            startContent={<FaBan />}
                                            onPress={() => handleReject(cls._id, cls.title)}
                                        >
                                            {cls.isApproved ? "Revoke" : "Reject"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            startContent={<FaTrash />}
                                            onPress={() => handleDelete(cls._id, cls.title)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <Button
                        size="sm"
                        isDisabled={currentPage === 1}
                        onPress={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                size="sm"
                                color={currentPage === page ? "primary" : "default"}
                                variant={currentPage === page ? "solid" : "flat"}
                                onPress={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                    
                    <Button
                        size="sm"
                        isDisabled={currentPage === totalPages}
                        onPress={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Pagination Info */}
            {filteredClasses.length > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClasses.length)} of {filteredClasses.length} classes
                </div>
            )}
        </div>
    );
}
