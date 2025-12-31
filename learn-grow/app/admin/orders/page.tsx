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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useGetAllOrdersQuery, useApproveOrderMutation, useRejectOrderMutation } from "@/redux/api/orderApi";
import { FaArrowLeft, FaEye } from "react-icons/fa";

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
  planType: "single" | "quarterly" | "kit" | "school";
  courseId?: { _id: string; title: string };
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
  single: "একক কোর্স | Single Course",
  quarterly: "ত্রৈমাসিক | Quarterly",
  kit: "শুধু কিট | Kit Only",
  school: "স্কুল প্ল্যান | School Plan",
};

const STATUS_COLOR_MAP: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function OrdersAdminPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // Get user role
  const [userRole, setUserRole] = React.useState<string>("");
  
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

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleApprove = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      await approveOrderMutation(selectedOrder._id).unwrap();
      
      // Send approval email with invoice to backend
      const emailData = {
        to: selectedOrder.userId.email,
        subject: "Order Approved - Learn Grow Academy",
        type: "approval",
        orderDetails: {
          orderId: selectedOrder._id,
          userName: selectedOrder.userId.name,
          userEmail: selectedOrder.userId.email,
          planType: PLAN_LABELS[selectedOrder.planType],
          price: selectedOrder.price,
          courseTitle: selectedOrder.courseId?.title || "All Courses Access",
          transactionId: selectedOrder.transactionId,
          paymentMethod: selectedOrder.paymentMethodId.name,
          approvalDate: new Date().toLocaleDateString("bn-BD"),
        }
      };

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/orders/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      }).catch(err => console.log("Email send initiated (non-blocking)"));

      toast.success("✅ Order approved & email sent!");
      refetch();
      onOpenChange();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error.data?.message || "Failed to approve order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      await rejectOrderMutation({ id: selectedOrder._id }).unwrap();

      // Send rejection email to backend
      const emailData = {
        to: selectedOrder.userId.email,
        subject: "Order Rejected - Learn Grow Academy",
        type: "rejection",
        orderDetails: {
          orderId: selectedOrder._id,
          userName: selectedOrder.userId.name,
          transactionId: selectedOrder.transactionId,
          price: selectedOrder.price,
        }
      };

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      await fetch(`${backendUrl}/orders/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      }).catch(err => console.log("Email send initiated (non-blocking)"));

      toast.success("❌ Order rejected & notification sent!");
      refetch();
      onOpenChange();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error(error.data?.message || "Failed to reject order");
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
      order.userId.name.toLowerCase().includes(searchLower) ||
      order.userId.email.toLowerCase().includes(searchLower) ||
      order.transactionId.toLowerCase().includes(searchLower)
    );
  });

  // Use server pagination from API, fallback to client-side for search
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const displayStart = filteredOrders.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
  const displayEnd = Math.min(currentPage * itemsPerPage, pagination?.total || filteredOrders.length);
  const paginatedOrders = searchTerm ? filteredOrders : orders;

  // Reset page if out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="light" 
            startContent={<FaArrowLeft />}
            onPress={() => router.push(userRole === "manager" ? "/manager" : "/admin")}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">অর্ডার ম্যানেজমেন্ট | Order Management</h1>
        </div>
        <p className="text-gray-600">পেন্ডিং অর্ডার অনুমোদন করুন এবং পরিচালনা করুন</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <Select
          label="স্ট্যাটাস ফিল্টার"
          selectedKeys={[filterStatus]}
          onSelectionChange={(keys) => {
            setFilterStatus((Array.from(keys)[0] as string) as any);
          }}
          className="max-w-xs"
        >
          <SelectItem key="all">সমস্ত | All</SelectItem>
          <SelectItem key="pending">পেন্ডিং | Pending</SelectItem>
          <SelectItem key="approved">অনুমোদিত | Approved</SelectItem>
          <SelectItem key="rejected">প্রত্যাখ্যাত | Rejected</SelectItem>
        </Select>

        <Input
          placeholder="নাম/ইমেইল/ট্রানজ্যাকশন আইডি দিয়ে খুঁজুন"
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">মোট অর্ডার</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">পেন্ডিং</p>
              <p className="text-2xl font-bold text-warning">
                {orders.filter((o) => o.paymentStatus === "pending").length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">অনুমোদিত</p>
              <p className="text-2xl font-bold text-success">
                {orders.filter((o) => o.paymentStatus === "approved").length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardBody>
          <Table aria-label="Orders table" className="overflow-auto">
            <TableHeader>
              <TableColumn>ব্যবহারকারী</TableColumn>
              <TableColumn>প্ল্যান</TableColumn>
              <TableColumn>কোর্স/কিট</TableColumn>
              <TableColumn>মূল্য</TableColumn>
              <TableColumn>অ্যাক্সেস সময়</TableColumn>
              <TableColumn>স্ট্যাটাস</TableColumn>
              <TableColumn>অর্ডার তারিখ</TableColumn>
              <TableColumn>অ্যাকশন</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                filteredOrders.length === 0 ? "কোনো অর্ডার নেই | No orders found" : undefined
              }
            >
              {paginatedOrders.map((order) => (
                <TableRow key={order._id} className="hover:bg-blue-50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-gray-900">{order.userId.name}</p>
                      <p className="text-xs text-gray-500">{order.userId.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-sm text-gray-800">{PLAN_LABELS[order.planType]}</p>
                      {order.planType === "kit" && (
                        <p className="text-xs text-gray-500">🤖 রোবোটিক্স কিট</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.courseId ? (
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-sm text-gray-800">{order.courseId.title}</p>
                        <p className="text-xs text-gray-500">ID: {order.courseId._id.slice(-6)}</p>
                      </div>
                    ) : order.planType === "kit" ? (
                      <p className="text-sm text-gray-600">📦 ডেলিভারি প্রয়োজন</p>
                    ) : (
                      <p className="text-sm text-gray-500">সব কোর্স অ্যাক্সেস</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">৳{order.price.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {order.startDate && order.endDate ? (
                      <div className="text-xs space-y-0.5">
                        <p className="text-gray-500">শুরু: <span className="font-semibold text-gray-800">{new Date(order.startDate).toLocaleDateString("bn-BD")}</span></p>
                        <p className="text-gray-500">শেষ: <span className="font-semibold text-gray-800">{new Date(order.endDate).toLocaleDateString("bn-BD")}</span></p>
                        {order.isActive && new Date(order.endDate) > new Date() && (
                          <Chip size="sm" color="success" variant="flat" className="mt-1">সক্রিয়</Chip>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">পেন্ডিং</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={STATUS_COLOR_MAP[order.paymentStatus]}
                      variant="solid"
                      size="sm"
                      className="font-semibold"
                    >
                      {order.paymentStatus === "pending" && "⏳ পেন্ডিং"}
                      {order.paymentStatus === "approved" && "✅ অনুমোদিত"}
                      {order.paymentStatus === "rejected" && "❌ প্রত্যাখ্যাত"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      variant="light"
                      size="sm"
                      startContent={<FaEye className="text-lg" />}
                      className="font-semibold"
                      onPress={() => openOrderDetails(order)}
                    >
                      বিস্তারিত
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
          <Button
            size="sm"
            isDisabled={currentPage === 1}
            variant="flat"
            className="text-sm font-semibold px-4"
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            ← Previous
          </Button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const startPage = Math.max(1, currentPage - 2);
              return startPage + i;
            }).map((page) => (
              <Button
                key={page}
                size="sm"
                color={currentPage === page ? "primary" : "default"}
                variant={currentPage === page ? "solid" : "flat"}
                className="text-sm font-semibold px-3 min-w-fit"
                onPress={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            isDisabled={currentPage === totalPages}
            variant="flat"
            className="text-sm font-semibold px-4"
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-center text-sm text-gray-600 font-medium mt-4">
        Showing {displayStart}-{displayEnd} of {pagination?.total || filteredOrders.length} orders | Page {currentPage} of {totalPages}
      </div>

      {/* Order Details Modal */}
      <Modal
        size="lg"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base">অর্ডার বিস্তারিত | Order Details</ModalHeader>
              <ModalBody className="space-y-3 text-sm">
                {selectedOrder && (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">ব্যবহারকারীর তথ্য</h3>
                      <p className="text-xs">
                        <span className="text-gray-600">নাম:</span> <span className="font-medium">{selectedOrder.userId.name}</span>
                      </p>
                      <p className="text-xs">
                        <span className="text-gray-600">ইমেইল:</span> <span className="font-medium line-clamp-1">{selectedOrder.userId.email}</span>
                      </p>
                    </div>

                    {/* Order Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                      <h3 className="font-semibold mb-2 text-sm flex items-center gap-1">
                        📋 অর্ডার তথ্য
                      </h3>
                      <div className="space-y-1.5 text-xs">
                        <div className="line-clamp-1">
                          <span className="text-gray-600 font-medium">ID:</span>
                          <code className="ml-1 bg-white px-1 py-0.5 rounded text-xs">{selectedOrder._id.slice(-8)}</code>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">প্ল্যান:</span>
                          <Chip size="xs" color="primary" variant="flat" className="ml-1">
                            {PLAN_LABELS[selectedOrder.planType]}
                          </Chip>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">মূল্য:</span>
                          <span className="ml-1 font-bold text-primary">৳{selectedOrder.price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">তারিখ:</span>
                          <span className="ml-1">{new Date(selectedOrder.createdAt).toLocaleDateString("bn-BD")}</span>
                          <span className="text-xs text-gray-500 ml-1">({new Date(selectedOrder.createdAt).toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' })})</span>
                        </div>
                      </div>
                    </div>

                    {/* Course/Kit Info */}
                    {selectedOrder.courseId && (
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-3 rounded-lg border border-green-200">
                        <h3 className="font-semibold mb-2 text-sm flex items-center gap-1">
                          📚 কোর্স
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          <p className="line-clamp-2">
                            <span className="text-gray-600 font-medium">নাম:</span>
                            <span className="ml-1 font-semibold text-green-900">{selectedOrder.courseId.title}</span>
                          </p>
                          <p className="line-clamp-1">
                            <span className="text-gray-600 font-medium">ID:</span>
                            <code className="ml-1 bg-white px-1 py-0.5 rounded text-xs">{selectedOrder.courseId._id.slice(-6)}</code>
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.planType === "kit" && (
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                        <h3 className="font-semibold mb-2 text-sm flex items-center gap-1">
                          🤖 কিট
                        </h3>
                        <p className="text-xs text-gray-700 mb-1">
                          ডেলিভারি প্রয়োজন
                        </p>
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-600">Arduino, Sensors, Motors, Components</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold mb-2 text-sm">পেমেন্ট তথ্য</h3>
                      <div className="space-y-1 text-xs">
                        <p className="line-clamp-1">
                          <span className="text-gray-600">পদ্ধতি:</span> <span className="font-medium">{selectedOrder.paymentMethodId.name}</span>
                        </p>
                        <p className="line-clamp-1">
                          <span className="text-gray-600">অ্যাকাউন্ট:</span> <span className="font-medium">{selectedOrder.paymentMethodId.accountNumber}</span>
                        </p>
                        <p className="line-clamp-1">
                          <span className="text-gray-600">ট্রানজ্যাকশন:</span> <span className="font-medium">{selectedOrder.transactionId.slice(-8)}</span>
                        </p>
                        <p className="line-clamp-1">
                          <span className="text-gray-600">সেন্ডার:</span> <span className="font-medium">{selectedOrder.senderNumber}</span>
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {selectedOrder.deliveryAddress && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h3 className="font-semibold mb-2 text-sm">ডেলিভারি ঠিকানা</h3>
                        <div className="space-y-1 text-xs">
                          <p className="line-clamp-1">
                            <span className="text-gray-600">নাম:</span> {selectedOrder.deliveryAddress.name}
                          </p>
                          <p className="line-clamp-1">
                            <span className="text-gray-600">ফোন:</span> {selectedOrder.deliveryAddress.phone}
                          </p>
                          <p className="line-clamp-2">
                            <span className="text-gray-600">ঠিকানা:</span> {selectedOrder.deliveryAddress.fullAddress}, {selectedOrder.deliveryAddress.city}-{selectedOrder.deliveryAddress.postalCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status & Access Time Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                      <h3 className="font-semibold mb-2 text-sm flex items-center gap-1">
                        ⏰ স্ট্যাটাস
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 font-medium text-xs">পেমেন্ট:</span>
                          <Chip
                            color={STATUS_COLOR_MAP[selectedOrder.paymentStatus]}
                            variant="solid"
                            size="sm"
                            className="text-xs"
                          >
                            {selectedOrder.paymentStatus === "pending" && "⏳ পেন্ডিং"}
                            {selectedOrder.paymentStatus === "approved" && "✅ অনুমোদিত"}
                            {selectedOrder.paymentStatus === "rejected" && "❌ প্রত্যাখ্যাত"}
                          </Chip>
                        </div>

                        {selectedOrder.startDate && selectedOrder.endDate && (
                          <div className="bg-white p-2 rounded space-y-1 text-xs">
                            <div className="flex justify-between items-center gap-1">
                              <div>
                                <p className="text-xs text-gray-500">শুরু</p>
                                <p className="font-semibold text-green-700 text-xs">
                                  {new Date(selectedOrder.startDate).toLocaleDateString("bn-BD")}
                                </p>
                              </div>
                              <div>→</div>
                              <div>
                                <p className="text-xs text-gray-500">শেষ</p>
                                <p className="font-semibold text-red-700 text-xs">
                                  {new Date(selectedOrder.endDate).toLocaleDateString("bn-BD")}
                                </p>
                              </div>
                            </div>

                            <div className="pt-1 border-t border-gray-200 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">সময়কাল:</span>
                                <span className="font-semibold">৯০ দিন</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">স্ট্যাটাস:</span>
                                {selectedOrder.isActive && new Date(selectedOrder.endDate) > new Date() ? (
                                  <Chip size="xs" color="success" variant="flat" className="text-xs">সক্রিয়</Chip>
                                ) : (
                                  <Chip size="xs" color="default" variant="flat" className="text-xs">মেয়াদ শেষ</Chip>
                                )}
                              </div>
                              {selectedOrder.isActive && new Date(selectedOrder.endDate) > new Date() && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">বাকি:</span>
                                  <span className="font-semibold text-primary">
                                    {Math.ceil((new Date(selectedOrder.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!selectedOrder.startDate && selectedOrder.paymentStatus === "pending" && (
                          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-800">
                              অনুমোদনের পরে অ্যাক্সেস সময় নির্ধারিত হবে
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="gap-3 bg-gray-50 border-t border-gray-200">
                {selectedOrder?.paymentStatus === "pending" && (
                  <>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={handleReject}
                      isLoading={isProcessing}
                      isDisabled={isProcessing}
                      className="font-semibold"
                    >
                      ❌ প্রত্যাখ্যান করুন
                    </Button>
                    <Button
                      color="success"
                      onPress={handleApprove}
                      isLoading={isProcessing}
                      isDisabled={isProcessing}
                      className="font-semibold"
                    >
                      ✅ অনুমোদন করুন
                    </Button>
                  </>
                )}
                {selectedOrder?.paymentStatus === "approved" && (
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={handleReject}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    className="font-semibold"
                  >
                    ❌ প্রত্যাখ্যান করুন
                  </Button>
                )}
                {selectedOrder?.paymentStatus === "rejected" && (
                  <Button
                    color="success"
                    onPress={handleApprove}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    className="font-semibold"
                  >
                    ✅ অনুমোদন করুন
                  </Button>
                )}
                <Button 
                  color="default" 
                  variant="light"
                  onPress={onClose}
                  className="font-semibold"
                >
                  বন্ধ করুন
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
