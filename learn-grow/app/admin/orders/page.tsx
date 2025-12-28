"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Textarea,
} from "@nextui-org/react";
import {
  useGetAllOrdersQuery,
  useApproveOrderMutation,
  useRejectOrderMutation,
} from "@/redux/api/orderApi";
import { FaSearch, FaCheckCircle, FaTimes, FaEye, FaBoxOpen } from "react-icons/fa";
import toast from "react-hot-toast";

const PLAN_NAMES = {
  single: "Single Course",
  quarterly: "Quarterly Subscription",
  kit: "Robotics Kit",
  school: "School Partnership",
};

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planTypeFilter, setPlanTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    status: statusFilter || undefined,
    planType: planTypeFilter || undefined,
    page,
    limit,
  });

  const [approveOrder, { isLoading: isApproving }] = useApproveOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleApprove = async (orderId: string) => {
    try {
      await approveOrder(orderId).unwrap();
      toast.success("Order approved successfully!");
      refetch();
      if (selectedOrder?._id === orderId) {
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve order");
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await rejectOrder({ id: orderId, reason: rejectReason }).unwrap();
      toast.success("Order rejected");
      setRejectReason("");
      refetch();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject order");
    }
  };

  const filteredOrders = data?.orders?.filter((order: any) =>
    order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <Button color="primary" onPress={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, email, transaction ID..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<FaSearch />}
              variant="bordered"
            />

            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setStatusFilter(selected || "");
                setPage(1);
              }}
              variant="bordered"
            >
              <SelectItem key="">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="approved">Approved</SelectItem>
              <SelectItem key="rejected">Rejected</SelectItem>
            </Select>

            <Select
              placeholder="Filter by plan"
              selectedKeys={planTypeFilter ? [planTypeFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setPlanTypeFilter(selected || "");
                setPage(1);
              }}
              variant="bordered"
            >
              <SelectItem key="">All Plans</SelectItem>
              <SelectItem key="single">Single Course</SelectItem>
              <SelectItem key="quarterly">Quarterly Subscription</SelectItem>
              <SelectItem key="kit">Robotics Kit</SelectItem>
              <SelectItem key="school">School Partnership</SelectItem>
            </Select>

            <Select
              placeholder="Items per page"
              selectedKeys={[String(limit)]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setLimit(Number(selected));
                setPage(1);
              }}
              variant="bordered"
            >
              <SelectItem key="10">10</SelectItem>
              <SelectItem key="20">20</SelectItem>
              <SelectItem key="50">50</SelectItem>
              <SelectItem key="100">100</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Orders table">
            <TableHeader>
              <TableColumn>ORDER ID</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>PLAN</TableColumn>
              <TableColumn>PRICE</TableColumn>
              <TableColumn>PAYMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={filteredOrders || []}
              isLoading={isLoading}
              emptyContent="No orders found"
            >
              {(order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <code className="text-xs">{order._id.slice(-8)}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{order.userId?.name}</p>
                      <p className="text-xs text-gray-600">{order.userId?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{PLAN_NAMES[order.planType]}</p>
                      {order.courseId && (
                        <p className="text-xs text-gray-600">{order.courseId.title}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">৳{order.price.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-semibold">{order.paymentMethodId?.name}</p>
                      <p className="text-gray-600">TXN: {order.transactionId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={STATUS_COLORS[order.paymentStatus] as any}
                      variant="flat"
                      size="sm"
                    >
                      {order.paymentStatus.toUpperCase()}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => handleViewDetails(order)}
                      >
                        View
                      </Button>
                      {order.paymentStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            isLoading={isApproving}
                            onPress={() => handleApprove(order._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              setSelectedOrder(order);
                              onOpen();
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center p-4">
              <Pagination
                total={data.pagination.totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="font-bold text-lg mb-2">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.userId?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
                  </div>
                </div>

                {/* Plan Info */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Plan Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Plan:</strong> {PLAN_NAMES[((selectedOrder?.planType || "single") as keyof typeof PLAN_NAMES)]}</p>
                    {selectedOrder.courseId && (
                      <p><strong>Course:</strong> {selectedOrder.courseId.title}</p>
                    )}
                    <p><strong>Price:</strong> ৳{selectedOrder.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-bold text-lg mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Method:</strong> {selectedOrder.paymentMethodId?.name}</p>
                    <p><strong>Account:</strong> {selectedOrder.paymentMethodId?.accountNumber}</p>
                    <p><strong>Sender Number:</strong> {selectedOrder.senderNumber}</p>
                    <p><strong>Transaction ID:</strong> <code className="bg-white px-2 py-1 rounded">{selectedOrder.transactionId}</code></p>
                    {selectedOrder.paymentNote && (
                      <p><strong>Note:</strong> {selectedOrder.paymentNote}</p>
                    )}
                    <p>
                      <strong>Status:</strong>{" "}
                      <Chip color={STATUS_COLORS[((selectedOrder?.paymentStatus || "pending") as keyof typeof STATUS_COLORS)] as any} size="sm">
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </Chip>
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedOrder.deliveryAddress && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Delivery Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Name:</strong> {selectedOrder.deliveryAddress.name}</p>
                      <p><strong>Phone:</strong> {selectedOrder.deliveryAddress.phone}</p>
                      <p><strong>Address:</strong> {selectedOrder.deliveryAddress.fullAddress}</p>
                      <p><strong>City:</strong> {selectedOrder.deliveryAddress.city}</p>
                      <p><strong>Postal Code:</strong> {selectedOrder.deliveryAddress.postalCode}</p>
                    </div>
                  </div>
                )}

                {/* Subscription Dates */}
                {selectedOrder.startDate && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Access Period</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Start Date:</strong> {new Date(selectedOrder.startDate).toLocaleDateString()}</p>
                      <p><strong>End Date:</strong> {new Date(selectedOrder.endDate).toLocaleDateString()}</p>
                      <p><strong>Active:</strong> {selectedOrder.isActive ? "Yes" : "No"}</p>
                    </div>
                  </div>
                )}

                {/* Reject Reason Input */}
                {selectedOrder.paymentStatus === "pending" && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Reject Order</h3>
                    <Textarea
                      label="Rejection Reason (Optional)"
                      placeholder="Enter reason for rejection..."
                      value={rejectReason}
                      onValueChange={setRejectReason}
                      variant="bordered"
                      minRows={3}
                    />
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedOrder?.paymentStatus === "pending" && (
              <>
                <Button
                  color="success"
                  onPress={() => handleApprove(selectedOrder._id)}
                  isLoading={isApproving}
                  startContent={<FaCheckCircle />}
                >
                  Approve Order
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => handleReject(selectedOrder._id)}
                  isLoading={isRejecting}
                  startContent={<FaTimes />}
                >
                  Reject Order
                </Button>
              </>
            )}
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
