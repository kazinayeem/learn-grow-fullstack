"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Select,
  SelectItem,
  Input,
  Card,
  CardBody,
  Skeleton,
  Tabs,
  Tab,
  Avatar,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useGetAllOrdersQuery, useApproveOrderMutation, useRejectOrderMutation } from "@/redux/api/orderApi";
import { FaArrowLeft, FaEye, FaShoppingCart, FaClock, FaCheckCircle, FaTimesCircle, FaSearch, FaSync } from "react-icons/fa";

interface DeliveryAddress {
  name: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  planType: "single" | "quarterly" | "kit" | "school" | "combo";
  courseId?: { _id: string; title: string };
  comboId?: { _id: string; name: string };
  paymentMethodId: {
    _id: string;
    name: string;
    accountNumber: string;
  };
  transactionId: string;
  senderNumber: string;
  paymentStatus: "pending" | "approved" | "rejected";
  deliveryAddress?: DeliveryAddress;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  price: number;
  createdAt: string;
}

const PLAN_LABELS = {
  single: "Single Course",
  quarterly: "Quarterly",
  kit: "Kit Only",
  school: "School Plan",
  combo: "Course Bundle",
};

const STATUS_COLOR_MAP: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function OrdersAdminPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [userRole, setUserRole] = React.useState<string>("");
  const [autoRefreshInterval, setAutoRefreshInterval] = React.useState<number>(0);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role || "admin");
    }
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const itemsPerPage = 10;

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    page: currentPage,
    limit: itemsPerPage,
  });
  const [approveOrderMutation, { isLoading: approving }] = useApproveOrderMutation();
  const [rejectOrderMutation, { isLoading: rejecting }] = useRejectOrderMutation();

  React.useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      refetch();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, refetch]);

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      await approveOrderMutation(selectedOrder._id).unwrap();
      toast.success("✅ Order approved & email sent!");
      refetch();
      onOpenChange();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      await rejectOrderMutation({ id: selectedOrder._id }).unwrap();
      toast.success("❌ Order rejected & notification sent!");
      refetch();
      onOpenChange();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject order");
    } finally {
      setIsProcessing(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.userId?.name?.toLowerCase().includes(searchLower) || false) ||
      (order.userId?.email?.toLowerCase().includes(searchLower) || false) ||
      (order.transactionId?.toLowerCase().includes(searchLower) || false)
    );
  });

  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = searchTerm ? filteredOrders : orders;

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.paymentStatus === "pending").length,
    approved: orders.filter((o) => o.paymentStatus === "approved").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
            className="self-start text-white hover:bg-white/20 min-h-[44px]"
            size="lg"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
              <FaShoppingCart className="text-3xl sm:text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Order Management
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                Approve and manage pending orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Orders</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaShoppingCart className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Pending</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2 animate-pulse">
                <FaClock className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 xs:col-span-2 lg:col-span-1">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Approved</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters - Modern Design */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-4 sm:p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</label>
            <Input
              placeholder="Name, email or transaction ID..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<FaSearch className="text-emerald-500" />}
              size="lg"
              variant="bordered"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-emerald-400 focus-within:border-emerald-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
            <Select
              placeholder="Select status"
              selectedKeys={[filterStatus]}
              onSelectionChange={(keys) => {
                setFilterStatus((Array.from(keys)[0] as string) as any);
              }}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="all">All Orders</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="rejected">Rejected</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Auto Refresh</label>
            <Select
              placeholder="Select interval"
              selectedKeys={[String(autoRefreshInterval)]}
              onSelectionChange={(keys) => {
                setAutoRefreshInterval(Number(Array.from(keys)[0]));
              }}
              size="lg"
              variant="bordered"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="0">Disabled</SelectItem>
              <SelectItem key="5">5 seconds</SelectItem>
              <SelectItem key="10">10 seconds</SelectItem>
              <SelectItem key="30">30 seconds</SelectItem>
              <SelectItem key="60">1 minute</SelectItem>
            </Select>
          </div>
          <Button
            color="primary"
            onPress={() => refetch()}
            isLoading={isLoading}
            size="lg"
            startContent={<FaSync />}
            className="min-h-[48px] font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Table/Cards */}
      <Card className="shadow-xl">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-4xl sm:text-5xl text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No orders found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No orders available yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Orders table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
                  <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>PLAN</TableColumn>
                    <TableColumn>COURSE/BUNDLE</TableColumn>
                    <TableColumn>PRICE</TableColumn>
                    <TableColumn>ACCESS TIME</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ORDER DATE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={order.userId?.name}
                              size="sm"
                              fallback={
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                  {order.userId?.name?.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{order.userId?.name || "Unknown User"}</p>
                              <p className="text-xs text-gray-500 truncate">{order.userId?.email || "N/A"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="primary">
                            {PLAN_LABELS[order.planType]}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          {order.courseId ? (
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate">{order.courseId.title}</p>
                              <p className="text-xs text-gray-500">ID: {order.courseId._id.slice(-6)}</p>
                            </div>
                          ) : order.comboId ? (
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-800 truncate">{order.comboId.name}</p>
                              <p className="text-xs text-gray-500">Bundle</p>
                            </div>
                          ) : order.planType === "kit" ? (
                            <p className="text-sm text-gray-600">📦 Delivery Required</p>
                          ) : (
                            <p className="text-sm text-gray-500">All Courses Access</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">৳{(order.price || 0).toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          {order.startDate && order.endDate ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-emerald-700">{new Date(order.startDate).toLocaleDateString()}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-semibold text-rose-700">{new Date(order.endDate).toLocaleDateString()}</span>
                              </div>
                              {order.isActive && new Date(order.endDate) > new Date() && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs">Active</Chip>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">Pending</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={STATUS_COLOR_MAP[order.paymentStatus]}
                            variant="solid"
                            size="sm"
                            className="font-semibold"
                          >
                            {order.paymentStatus === "pending" && "⏳ Pending"}
                            {order.paymentStatus === "approved" && "✅ Approved"}
                            {order.paymentStatus === "rejected" && "❌ Rejected"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            color="primary"
                            variant="flat"
                            size="sm"
                            startContent={<FaEye />}
                            onPress={() => openOrderDetails(order)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {paginatedOrders.map((order) => (
                  <Card
                    key={order._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <Avatar
                          name={order.userId?.name}
                          size="lg"
                          fallback={
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-full h-full flex items-center justify-center text-white text-xl font-bold">
                              {order.userId?.name?.charAt(0).toUpperCase()}
                            </div>
                          }
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {order.userId?.name || "Unknown User"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate mb-2">{order.userId?.email || "N/A"}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Chip size="sm" variant="flat" color="primary">
                              {PLAN_LABELS[order.planType]}
                            </Chip>
                            <Chip
                              color={STATUS_COLOR_MAP[order.paymentStatus]}
                              variant="solid"
                              size="sm"
                            >
                              {order.paymentStatus === "pending" && "⏳ Pending"}
                              {order.paymentStatus === "approved" && "✅ Approved"}
                              {order.paymentStatus === "rejected" && "❌ Rejected"}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Price:</span>
                          <span className="font-bold text-emerald-600 ml-2">৳{(order.price || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Order Date:</span>
                          <span className="text-gray-700 ml-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        {order.courseId && (
                          <div className="text-sm">
                            <span className="text-gray-500 font-medium">Course:</span>
                            <span className="text-gray-700 ml-2 truncate block">{order.courseId.title}</span>
                          </div>
                        )}
                        {order.comboId && (
                          <div className="text-sm">
                            <span className="text-gray-500 font-medium">Bundle:</span>
                            <span className="text-gray-700 ml-2 truncate block">{order.comboId.name}</span>
                          </div>
                        )}
                        {order.startDate && order.endDate && (
                          <div className="text-sm">
                            <span className="text-gray-500 font-medium">Access:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-emerald-700 text-xs">{new Date(order.startDate).toLocaleDateString()}</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-semibold text-rose-700 text-xs">{new Date(order.endDate).toLocaleDateString()}</span>
                              {order.isActive && new Date(order.endDate) > new Date() && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs ml-1">Active</Chip>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        size="md"
                        color="primary"
                        variant="flat"
                        className="w-full min-h-[44px] font-semibold"
                        startContent={<FaEye />}
                        onPress={() => openOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>

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
                          className="text-sm sm:text-base font-semibold px-4 min-h-[44px]"
                          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                              className={`text-sm font-semibold px-3 min-w-[44px] min-h-[44px] ${currentPage === page ? "shadow-lg" : ""
                                }`}
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
                          className="text-sm sm:text-base font-semibold px-4 min-h-[44px]"
                          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        >
                          Next →
                        </Button>
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600 font-medium text-center bg-gray-50 px-4 py-2 rounded-full">
                        Page <span className="font-bold text-primary-600">{currentPage}</span> of <span className="font-bold">{totalPages}</span> • Total: <span className="font-bold text-primary-600">{pagination?.total || filteredOrders.length}</span> orders
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      <Modal
        size="2xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              {isProcessing && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                  <div className="flex flex-col items-center gap-4 p-6">
                    <Spinner size="lg" color="primary" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800 animate-pulse mb-1">
                        Processing...
                      </p>
                      <p className="text-sm text-gray-600">
                        Please wait
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ModalHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaShoppingCart className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <p className="text-sm text-white/90 font-normal">Review and manage order</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6 space-y-4">
                {selectedOrder && (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        👤 User Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedOrder.userId?.name || "Unknown User"}</span></p>
                        <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedOrder.userId?.email || "N/A"}</span></p>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        📋 Order Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-600">Order ID:</span> <code className="ml-1 bg-white px-2 py-1 rounded text-xs">{selectedOrder._id.slice(-8)}</code></div>
                        <div className="flex items-center gap-1"><span className="text-gray-600">Plan:</span> <Chip size="sm" color="primary" variant="flat" className="ml-1">{PLAN_LABELS[selectedOrder.planType]}</Chip></div>
                        <div><span className="text-gray-600">Price:</span> <span className="ml-1 font-bold text-primary">৳{(selectedOrder.price || 0).toLocaleString()}</span></div>
                        <div><span className="text-gray-600">Date:</span> <span className="ml-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span> <span className="text-xs text-gray-500">({new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span></div>
                      </div>
                    </div>

                    {/* Course/Bundle Info */}
                    {selectedOrder.courseId && (
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                          📚 Course
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Title:</span> <span className="ml-1 font-semibold text-green-900">{selectedOrder.courseId.title}</span></p>
                          <p><span className="text-gray-600">ID:</span> <code className="ml-1 bg-white px-2 py-1 rounded text-xs">{selectedOrder.courseId._id.slice(-6)}</code></p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.comboId && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                          🧩 Bundle
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Name:</span> <span className="ml-1 font-semibold text-purple-900">{selectedOrder.comboId.name}</span></p>
                          <p><span className="text-gray-600">ID:</span> <code className="ml-1 bg-white px-2 py-1 rounded text-xs">{selectedOrder.comboId._id.slice(-6)}</code></p>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 text-sm">💳 Payment Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Method:</span> <span className="font-medium">{selectedOrder.paymentMethodId.name}</span></p>
                        <p><span className="text-gray-600">Account:</span> <span className="font-medium">{selectedOrder.paymentMethodId.accountNumber}</span></p>
                        <p><span className="text-gray-600">Transaction:</span> <span className="font-medium">{selectedOrder.transactionId}</span></p>
                        <p><span className="text-gray-600">Sender:</span> <span className="font-medium">{selectedOrder.senderNumber}</span></p>
                      </div>
                    </div>

                    {/* Delivery Address - Show for Kit and Quarterly */}
                    {selectedOrder.deliveryAddress && (selectedOrder.planType === "kit" || selectedOrder.planType === "quarterly") && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                        <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                          📦 Delivery Address
                        </h3>
                        <div className="space-y-2 text-sm bg-white p-3 rounded">
                          <p><span className="text-gray-600">Name:</span> <span className="ml-1 font-medium">{selectedOrder.deliveryAddress.name}</span></p>
                          <p><span className="text-gray-600">Phone:</span> <span className="ml-1 font-medium">{selectedOrder.deliveryAddress.phone}</span></p>
                          <p><span className="text-gray-600">Address:</span> <span className="ml-1 font-medium block mt-1">{selectedOrder.deliveryAddress.fullAddress}</span></p>
                          <p><span className="text-gray-600">City:</span> <span className="ml-1 font-medium">{selectedOrder.deliveryAddress.city}</span></p>
                          <p><span className="text-gray-600">Postal Code:</span> <span className="ml-1 font-medium">{selectedOrder.deliveryAddress.postalCode}</span></p>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        ⏰ Status
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-600 font-medium text-sm">Payment:</span>
                        <Chip
                          color={STATUS_COLOR_MAP[selectedOrder.paymentStatus]}
                          variant="solid"
                          size="sm"
                        >
                          {selectedOrder.paymentStatus === "pending" && "⏳ Pending"}
                          {selectedOrder.paymentStatus === "approved" && "✅ Approved"}
                          {selectedOrder.paymentStatus === "rejected" && "❌ Rejected"}
                        </Chip>
                      </div>
                      {selectedOrder.startDate && selectedOrder.endDate && (
                        <div className="bg-white p-3 rounded space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500">Start</p>
                              <p className="font-semibold text-green-700">{new Date(selectedOrder.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>→</div>
                            <div>
                              <p className="text-xs text-gray-500">End</p>
                              <p className="font-semibold text-red-700">{new Date(selectedOrder.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {selectedOrder.isActive && new Date(selectedOrder.endDate) > new Date() && (
                            <Chip size="sm" color="success" variant="flat">Active</Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="gap-3 bg-gray-50 border-t border-gray-200 p-6">
                {selectedOrder?.paymentStatus === "pending" && (
                  <>
                    <Button
                      color="success"
                      onPress={handleApprove}
                      isLoading={approving || isProcessing}
                      isDisabled={rejecting || isProcessing}
                      startContent={<FaCheckCircle />}
                      size="lg"
                      className="flex-1 min-h-[44px] font-semibold shadow-lg"
                    >
                      Approve Order
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={handleReject}
                      isLoading={rejecting || isProcessing}
                      isDisabled={approving || isProcessing}
                      startContent={<FaTimesCircle />}
                      size="lg"
                      className="flex-1 min-h-[44px] font-semibold"
                    >
                      Reject Order
                    </Button>
                  </>
                )}
                <Button
                  variant="light"
                  onPress={onClose}
                  size="lg"
                  className="min-h-[44px] font-semibold"
                  isDisabled={isProcessing}
                >
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
