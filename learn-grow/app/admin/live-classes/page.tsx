"use client";

import React, { useMemo, useState } from "react";
import { Card, CardBody, Button, Input, Chip, Spinner, Skeleton, Select, SelectItem } from "@nextui-org/react";
import { FaVideo, FaClock, FaCalendar, FaCheckCircle, FaBan, FaArrowLeft, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
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
    const scheduledCount = classes.filter((c: any) => c.status === "Scheduled").length;

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

    const handlerejected = async (id: string, title: string) => {
        if (confirm(`rejected approval for: "${title}"?`)) {
            try {
                await updateLiveClass({ id, isApproved: false }).unwrap();
                toast.success("Approval rejectedd.");
                refetch();
            } catch (error: any) {
                toast.error(error?.data?.message || "Failed to rejected live class");
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

    const getPlatformIcon = (platform: string) => {
        const lower = platform?.toLowerCase();
        if (lower?.includes("zoom")) return "📹";
        if (lower?.includes("meet")) return "🎥";
        if (lower?.includes("teams")) return "💼";
        return "🎬";
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setPlatformFilter("all");
        setApprovalFilter("all");
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter !== "all" || platformFilter !== "all" || approvalFilter !== "all";

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                <div className="mb-6 sm:mb-8">
                    <Skeleton className="h-32 sm:h-40 w-full rounded-2xl mb-6" />
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-48 w-full rounded-2xl mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            {/* Header with Gradient */}
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <Button
                    variant="light"
                    startContent={<FaArrowLeft />}
                    onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
                    className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
                    size="lg"
                >
                    Back to Dashboard
                </Button>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                        <FaVideo className="text-3xl sm:text-4xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                            Pending Live Classes 🎥
                        </h1>
                        <p className="text-sm sm:text-base text-white/90 mt-1">
                            Review and approve instructor live class requests
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending Approval</p>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{pendingCount}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                                <FaClock className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Scheduled</p>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{scheduledCount}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                <FaCalendar className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Approved Classes</p>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{approvedCount}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
                    <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Classes</p>
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalCount}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                <FaVideo className="text-2xl sm:text-3xl lg:text-4xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters - Modern Design */}
            <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-4 sm:p-6 backdrop-blur-sm">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</label>
                        <Input
                            placeholder="Search by title, course, or instructor..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            size="lg"
                            startContent={<FaSearch className="text-rose-500" />}
                            classNames={{
                                input: "text-sm sm:text-base",
                                inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-rose-400 focus-within:border-rose-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Approval Status</label>
                            <Select
                                placeholder="Select status"
                                selectedKeys={[approvalFilter]}
                                onSelectionChange={(keys) => { setApprovalFilter(Array.from(keys)[0] as string); setCurrentPage(1); }}
                                size="lg"
                                variant="bordered"
                                classNames={{
                                    trigger: "min-h-[48px] border-2 border-gray-200 hover:border-rose-400 focus:border-rose-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                                }}
                            >
                                <SelectItem key="all">All Approval Status</SelectItem>
                                <SelectItem key="pending">Pending</SelectItem>
                                <SelectItem key="approved">Approved</SelectItem>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Class Status</label>
                            <Select
                                placeholder="Select status"
                                selectedKeys={[statusFilter]}
                                onSelectionChange={(keys) => { setStatusFilter(Array.from(keys)[0] as string); setCurrentPage(1); }}
                                size="lg"
                                variant="bordered"
                                classNames={{
                                    trigger: "min-h-[48px] border-2 border-gray-200 hover:border-rose-400 focus:border-rose-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                                }}
                            >
                                <SelectItem key="all">All Status</SelectItem>
                                <SelectItem key="scheduled">Scheduled</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
                                <SelectItem key="cancelled">Cancelled</SelectItem>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Platform</label>
                            <Select
                                placeholder="Select platform"
                                selectedKeys={[platformFilter]}
                                onSelectionChange={(keys) => { setPlatformFilter(Array.from(keys)[0] as string); setCurrentPage(1); }}
                                size="lg"
                                variant="bordered"
                                classNames={{
                                    trigger: "min-h-[48px] border-2 border-gray-200 hover:border-rose-400 focus:border-rose-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                                }}
                            >
                                <SelectItem key="all">All Platforms</SelectItem>
                                <SelectItem key="zoom">📹 Zoom</SelectItem>
                                <SelectItem key="meet">🎥 Meet</SelectItem>
                                <SelectItem key="teams">💼 Teams</SelectItem>
                            </Select>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                color="default"
                                variant="flat"
                                size="lg"
                                onPress={clearFilters}
                                startContent={<FaTimes />}
                                className="min-h-[48px] font-semibold"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Classes List */}
            {paginatedClasses.length === 0 ? (
                <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle className="text-4xl sm:text-5xl text-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                        All Caught Up!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                        {classes.length === 0
                            ? "No pending live classes to review."
                            : "No classes match your search criteria."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedClasses.map((cls: any) => (
                        <Card key={cls._id} className="hover:shadow-xl transition-all duration-300 border border-gray-200">
                            <CardBody className="p-4 sm:p-5 lg:p-6">
                                <div className="flex flex-col gap-4">
                                    {/* Title and Chips */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 truncate">{cls.title}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Chip color={getStatusColor(cls.status) as any} size="sm" variant="flat">
                                                    {cls.status?.toUpperCase()}
                                                </Chip>
                                                <Chip size="sm" variant="flat" color="warning">
                                                    {getPlatformIcon(cls.platform)} {cls.platform}
                                                </Chip>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={cls.isApproved ? "success" : "danger"}
                                                    startContent={cls.isApproved ? <FaCheckCircle /> : <FaClock />}
                                                >
                                                    {cls.isApproved ? "APPROVED" : "PENDING"}
                                                </Chip>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course and Instructor Info */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">
                                            <span className="font-semibold">Course:</span> {typeof cls.courseId === 'object' ? cls.courseId?.title : 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Instructor:</span> {typeof cls.instructorId === 'object' ? cls.instructorId?.name : 'N/A'}
                                        </p>
                                    </div>

                                    {/* Date and Duration */}
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <p className="text-xs text-blue-900 font-semibold mb-1 flex items-center gap-1">
                                                <FaCalendar /> Scheduled
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {new Date(cls.scheduledAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(cls.scheduledAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                            <p className="text-xs text-purple-900 font-semibold mb-1 flex items-center gap-1">
                                                <FaClock /> Duration
                                            </p>
                                            <p className="text-2xl font-bold text-purple-600">{cls.duration}</p>
                                            <p className="text-sm text-gray-600">minutes</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        {!cls.isApproved ? (
                                            <Button
                                                size="md"
                                                color="success"
                                                variant="flat"
                                                startContent={<FaCheckCircle />}
                                                onPress={() => handleApprove(cls._id, cls.title)}
                                                className="flex-1 min-h-[44px] font-semibold"
                                            >
                                                Approve Class
                                            </Button>
                                        ) : (
                                            <Button
                                                size="md"
                                                color="warning"
                                                variant="flat"
                                                startContent={<FaBan />}
                                                onPress={() => handlerejected(cls._id, cls.title)}
                                                className="flex-1 min-h-[44px] font-semibold"
                                            >
                                                rejected Approval
                                            </Button>
                                        )}
                                        <Button
                                            size="md"
                                            color="danger"
                                            variant="flat"
                                            startContent={<FaTrash />}
                                            onPress={() => handleDelete(cls._id, cls.title)}
                                            className="flex-1 sm:flex-initial min-h-[44px] font-semibold"
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
                <Card className="mt-6 shadow-lg border border-gray-200">
                    <CardBody className="p-4 sm:p-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <Button
                                    size="md"
                                    isDisabled={currentPage === 1}
                                    variant="flat"
                                    className="min-h-[44px] font-semibold"
                                    onPress={() => setCurrentPage(currentPage - 1)}
                                >
                                    ← Previous
                                </Button>

                                <div className="hidden sm:flex gap-1.5">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        const startPage = Math.max(1, currentPage - 2);
                                        return startPage + i;
                                    }).map((page) => (
                                        <Button
                                            key={page}
                                            size="md"
                                            color={currentPage === page ? "primary" : "default"}
                                            variant={currentPage === page ? "solid" : "flat"}
                                            className={`min-w-[44px] min-h-[44px] font-semibold ${currentPage === page ? "shadow-lg" : ""}`}
                                            onPress={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    size="md"
                                    isDisabled={currentPage === totalPages}
                                    variant="flat"
                                    className="min-h-[44px] font-semibold"
                                    onPress={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next →
                                </Button>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center bg-gray-50 px-4 py-2 rounded-full">
                                Page <span className="font-bold text-rose-600">{currentPage}</span> of <span className="font-bold">{totalPages}</span> • Total: <span className="font-bold text-rose-600">{totalCount}</span> classes
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
