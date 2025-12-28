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
  planType: "single" | "quarterly" | "kit";
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
};

const STATUS_COLOR_MAP: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function OrdersAdminPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  const [approveOrderMutation, { isLoading: approving }] = useApproveOrderMutation();
  const [rejectOrderMutation, { isLoading: rejecting }] = useRejectOrderMutation();

  const orders = data?.orders || [];

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      await approveOrderMutation(selectedOrder._id).unwrap();
      toast.success("Order approved successfully!");
      refetch();
      onOpenChange();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error.data?.message || "Failed to approve order");
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    try {
      await rejectOrderMutation({ id: selectedOrder._id }).unwrap();
      toast.success("Order rejected");
      refetch();
      onOpenChange();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error(error.data?.message || "Failed to reject order");
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">অর্ডার ম্যানেজমেন্ট | Order Management</h1>
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
      <Table aria-label="Orders table">
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
          {filteredOrders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>
                <div>
                  <p className="font-semibold">{order.userId.name}</p>
                  <p className="text-sm text-gray-600">{order.userId.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold">{PLAN_LABELS[order.planType]}</p>
                  {order.planType === "kit" && (
                    <p className="text-xs text-gray-500">🤖 রোবোটিক্স কিট</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {order.courseId ? (
                  <div>
                    <p className="font-semibold text-sm">{order.courseId.title}</p>
                    <p className="text-xs text-gray-500">কোর্স ID: {order.courseId._id.slice(-6)}</p>
                  </div>
                ) : order.planType === "kit" ? (
                  <p className="text-sm text-gray-600">📦 ডেলিভারি প্রয়োজন</p>
                ) : (
                  <p className="text-sm text-gray-500">সব কোর্স অ্যাক্সেস</p>
                )}
              </TableCell>
              <TableCell>৳{order.price.toLocaleString()}</TableCell>
              <TableCell>
                {order.startDate && order.endDate ? (
                  <div className="text-sm">
                    <p className="text-xs text-gray-500">শুরু:</p>
                    <p className="font-semibold">{new Date(order.startDate).toLocaleDateString("bn-BD")}</p>
                    <p className="text-xs text-gray-500 mt-1">শেষ:</p>
                    <p className="font-semibold">{new Date(order.endDate).toLocaleDateString("bn-BD")}</p>
                    {order.isActive && new Date(order.endDate) > new Date() && (
                      <Chip size="sm" color="success" variant="flat" className="mt-1">সক্রিয়</Chip>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">পেন্ডিং</p>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  color={STATUS_COLOR_MAP[order.paymentStatus]}
                  variant="flat"
                  size="sm"
                >
                  {order.paymentStatus === "pending" && "পেন্ডিং"}
                  {order.paymentStatus === "approved" && "অনুমোদিত"}
                  {order.paymentStatus === "rejected" && "প্রত্যাখ্যাত"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  color="primary"
                  variant="light"
                  size="sm"
                  onPress={() => openOrderDetails(order)}
                >
                  বিস্তারিত
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
              <ModalHeader>অর্ডার বিস্তারিত | Order Details</ModalHeader>
              <ModalBody>
                {selectedOrder && (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">ব্যবহারকারীর তথ্য</h3>
                      <p>
                        <span className="text-gray-600">নাম:</span> {selectedOrder.userId.name}
                      </p>
                      <p>
                        <span className="text-gray-600">ইমেইল:</span> {selectedOrder.userId.email}
                      </p>
                    </div>

                    {/* Order Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        📋 অর্ডার তথ্য
                      </h3>
                      <div className="space-y-2">
                        <p>
                          <span className="text-gray-600 font-medium">অর্ডার ID:</span>
                          <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{selectedOrder._id}</code>
                        </p>
                        <p>
                          <span className="text-gray-600 font-medium">প্ল্যান টাইপ:</span>
                          <Chip size="sm" color="primary" variant="flat" className="ml-2">
                            {PLAN_LABELS[selectedOrder.planType]}
                          </Chip>
                        </p>
                        <p>
                          <span className="text-gray-600 font-medium">মূল্য:</span>
                          <span className="ml-2 text-xl font-bold text-primary">৳{selectedOrder.price.toLocaleString()}</span>
                        </p>
                        <p>
                          <span className="text-gray-600 font-medium">অর্ডার তারিখ:</span>
                          <span className="ml-2">{new Date(selectedOrder.createdAt).toLocaleDateString("bn-BD", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <span className="text-sm text-gray-500 ml-2">({new Date(selectedOrder.createdAt).toLocaleTimeString("bn-BD")})</span>
                        </p>
                      </div>
                    </div>

                    {/* Course/Kit Info */}
                    {selectedOrder.courseId && (
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-200">
                        <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                          📚 কোর্স তথ্য
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <span className="text-gray-600 font-medium">কোর্সের নাম:</span>
                            <span className="ml-2 font-semibold text-green-900">{selectedOrder.courseId.title}</span>
                          </p>
                          <p>
                            <span className="text-gray-600 font-medium">কোর্স ID:</span>
                            <code className="ml-2 bg-white px-2 py-1 rounded text-sm">{selectedOrder.courseId._id}</code>
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.planType === "kit" && (
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border-2 border-orange-200">
                        <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                          🤖 রোবোটিক্স কিট তথ্য
                        </h3>
                        <p className="text-gray-700">
                          এই অর্ডারে একটি রোবোটিক্স কিট রয়েছে যা ডেলিভারি করা হবে।
                        </p>
                        <div className="mt-2 bg-white p-3 rounded">
                          <p className="text-sm text-gray-600">কিট কন্টেন্ট: Arduino, Sensors, Motors, Components</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">পেমেন্ট তথ্য</h3>
                      <p>
                        <span className="text-gray-600">পেমেন্ট পদ্ধতি:</span>{" "}
                        {selectedOrder.paymentMethodId.name}
                      </p>
                      <p>
                        <span className="text-gray-600">অ্যাকাউন্ট:</span>{" "}
                        {selectedOrder.paymentMethodId.accountNumber}
                      </p>
                      <p>
                        <span className="text-gray-600">ট্রানজ্যাকশন ID:</span> {selectedOrder.transactionId}
                      </p>
                      <p>
                        <span className="text-gray-600">পাঠানোর নম্বর:</span> {selectedOrder.senderNumber}
                      </p>
                    </div>

                    {/* Delivery Address */}
                    {selectedOrder.deliveryAddress && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">ডেলিভারি ঠিকানা</h3>
                        <p>
                          <span className="text-gray-600">নাম:</span> {selectedOrder.deliveryAddress.name}
                        </p>
                        <p>
                          <span className="text-gray-600">ফোন:</span> {selectedOrder.deliveryAddress.phone}
                        </p>
                        <p>
                          <span className="text-gray-600">ঠিকানা:</span>{" "}
                          {selectedOrder.deliveryAddress.fullAddress}, {selectedOrder.deliveryAddress.city}-
                          {selectedOrder.deliveryAddress.postalCode}
                        </p>
                      </div>
                    )}

                    {/* Status & Access Time Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        ⏰ স্ট্যাটাস ও অ্যাক্সেস সময়
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 font-medium">পেমেন্ট স্ট্যাটাস:</span>
                          <Chip
                            color={STATUS_COLOR_MAP[selectedOrder.paymentStatus]}
                            variant="solid"
                            size="md"
                            className="ml-2"
                          >
                            {selectedOrder.paymentStatus === "pending" && "⏳ পেন্ডিং"}
                            {selectedOrder.paymentStatus === "approved" && "✅ অনুমোদিত"}
                            {selectedOrder.paymentStatus === "rejected" && "❌ প্রত্যাখ্যাত"}
                          </Chip>
                        </div>

                        {selectedOrder.startDate && selectedOrder.endDate && (
                          <div className="bg-white p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs text-gray-500">অ্যাক্সেস শুরু</p>
                                <p className="font-semibold text-green-700">
                                  {new Date(selectedOrder.startDate).toLocaleDateString("bn-BD", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="text-2xl">→</div>
                              <div>
                                <p className="text-xs text-gray-500">অ্যাক্সেস শেষ</p>
                                <p className="font-semibold text-red-700">
                                  {new Date(selectedOrder.endDate).toLocaleDateString("bn-BD", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">মোট সময়কাল:</span>
                                <span className="font-semibold">৯০ দিন (৩ মাস)</span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-600">বর্তমান স্ট্যাটাস:</span>
                                {selectedOrder.isActive && new Date(selectedOrder.endDate) > new Date() ? (
                                  <Chip size="sm" color="success" variant="flat">🟢 সক্রিয়</Chip>
                                ) : (
                                  <Chip size="sm" color="default" variant="flat">⚪ মেয়াদ শেষ</Chip>
                                )}
                              </div>
                              {selectedOrder.isActive && new Date(selectedOrder.endDate) > new Date() && (
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-sm text-gray-600">বাকি সময়:</span>
                                  <span className="font-semibold text-primary">
                                    {Math.ceil((new Date(selectedOrder.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} দিন
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!selectedOrder.startDate && selectedOrder.paymentStatus === "pending" && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              ⏳ অনুমোদনের পরে অ্যাক্সেস সময় নির্ধারিত হবে
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {selectedOrder?.paymentStatus === "pending" && (
                  <>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={handleReject}
                      isLoading={rejecting}
                    >
                      প্রত্যাখ্যান করুন
                    </Button>
                    <Button
                      color="success"
                      onPress={handleApprove}
                      isLoading={approving}
                    >
                      অনুমোদন করুন
                    </Button>
                  </>
                )}
                <Button color="default" onPress={onClose}>
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
