"use client";

import React, { useMemo, useState } from "react";
import { Card, CardBody, Button, Input, Chip, Spinner, Skeleton } from "@nextui-org/react";
import { FaVideo, FaClock, FaCalendar, FaCheckCircle, FaBan, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    useGetPendingLiveClassesQuery,
    useApproveLiveClassMutation,
    useDeleteLiveClassMutation,
    useUpdateLiveClassMutation,
} from "@/redux/api/liveClassApi";

export default function AdminLiveClassesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");
    const itemsPerPage = 10;

    // Get user role from localStorage
    const [userRole, setUserRole] = useState<string>("");

    React.useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role || "admin");
        }
    }, []);

    const { data: pendingData, isLoading, refetch } = useGetPendingLiveClassesQuery({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
        platform: platformFilter !== "all" ? platformFilter : undefined,
        isApproved: approvalFilter === "approved" ? true : approvalFilter === "pending" ? false : undefined,
        search: searchQuery || undefined,
    });
    const [approveLiveClass] = useApproveLiveClassMutation();
    const [deleteLiveClass] = useDeleteLiveClassMutation();
    const [updateLiveClass] = useUpdateLiveClassMutation();

    const classes = pendingData?.data || [];
    const pagination = pendingData?.pagination;
    const totalPages = pagination ? Math.ceil(pagination.total / itemsPerPage) : 1;
    const totalCount = pagination?.total || 0;
    const paginatedClasses = classes;
    const pendingCount = classes.filter((c: any) => !c.isApproved).length;
    const approvedCount = classes.filter((c: any) => c.isApproved).length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + classes.length, totalCount || classes.length);

    const pageNumbers = useMemo(() => {
        const maxButtons = 7;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push("left-ellipsis");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push("right-ellipsis");
        pages.push(totalPages);

        return pages;
    }, [currentPage, totalPages]);

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

    const handleRevoke = async (id: string, title: string) => {
        if (confirm(`Revoke approval for: "${title}"?`)) {
            try {
                await updateLiveClass({ id, isApproved: false }).unwrap();
                toast.success("Approval revoked.");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to revoke live class");
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
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-10 w-32 rounded-lg" />
                            <Skeleton className="h-10 w-64 rounded-lg" />
                        </div>
                        <Skeleton className="h-6 w-96 rounded-lg" />
                    </div>
                </div>

                {/* Statistics Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-32 rounded-lg mb-2" />
                                        <Skeleton className="h-8 w-20 rounded-lg" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Search and Filters Skeleton */}
                <div className="mb-6 space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <div className="flex flex-wrap gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-10 w-40 rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Classes List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                            <CardBody className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <Skeleton className="h-6 w-48 rounded-lg" />
                                            <Skeleton className="h-6 w-20 rounded-lg" />
                                            <Skeleton className="h-6 w-20 rounded-lg" />
                                            <Skeleton className="h-6 w-32 rounded-lg" />
                                        </div>
                                        <Skeleton className="h-4 w-64 rounded-lg mb-2" />
                                        <Skeleton className="h-4 w-56 rounded-lg mb-2" />
                                        <Skeleton className="h-4 w-48 rounded-lg" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-28 rounded-lg" />
                                        <Skeleton className="h-10 w-28 rounded-lg" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Pagination Skeleton */}
                <div className="flex justify-center items-center gap-2 mt-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                    ))}
                </div>
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
                            onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
                        >
                            Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-bold">Pending Live Classes 🎥</h1>
                    </div>
                    <p className="text-gray-600">Review and approve instructor live class requests</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Pending Approval</p>
                                <p className="text-3xl font-bold mt-1">
                                    {isLoading ? <Skeleton className="h-10 w-20 rounded-lg" /> : pendingCount}
                                </p>
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
                                    {isLoading ? <Skeleton className="h-10 w-20 rounded-lg" /> : classes.filter((c: any) => c.status === "Scheduled").length}
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
                                <p className="text-3xl font-bold mt-1">
                                    {isLoading ? <Skeleton className="h-10 w-20 rounded-lg" /> : approvedCount}
                                </p>
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
                                <p className="text-3xl font-bold mt-1">
                                    {isLoading ? <Skeleton className="h-10 w-20 rounded-lg" /> : totalCount}
                                </p>
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
                                        {!cls.isApproved ? (
                                            <Button
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                                startContent={<FaCheckCircle />}
                                                onPress={() => handleApprove(cls._id, cls.title)}
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                color="warning"
                                                variant="flat"
                                                startContent={<FaBan />}
                                                onPress={() => handleRevoke(cls._id, cls.title)}
                                            >
                                                Revoke
                                            </Button>
                                        )}
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
                <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                    <Button
                        size="sm"
                        isDisabled={currentPage === 1}
                        onPress={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2 flex-wrap justify-center">
                        {pageNumbers.map((page, idx) =>
                            typeof page === "number" ? (
                                <Button
                                    key={page}
                                    size="sm"
                                    color={currentPage === page ? "primary" : "default"}
                                    variant={currentPage === page ? "solid" : "flat"}
                                    onPress={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ) : (
                                <Button key={`${page}-${idx}`} size="sm" isDisabled variant="light">
                                    ...
                                </Button>
                            )
                        )}
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
            {totalCount > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                    Showing {startIndex + 1} to {endIndex} of {totalCount} classes
                </div>
            )}
        </div>
    );
}
