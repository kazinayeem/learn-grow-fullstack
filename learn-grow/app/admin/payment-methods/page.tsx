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
  Input,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Tooltip,
  Switch,
  Card,
  CardBody,
  Skeleton,
} from "@nextui-org/react";
import {
  useGetAllPaymentMethodsQuery,
  useDeletePaymentMethodMutation,
  useTogglePaymentMethodMutation,
} from "@/redux/api/paymentApi";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaCreditCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminPaymentMethodsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: response, isLoading } = useGetAllPaymentMethodsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [deletePaymentMethod, { isLoading: deleting }] = useDeletePaymentMethodMutation();
  const [togglePaymentMethod, { isLoading: toggling }] = useTogglePaymentMethodMutation();

  const paymentMethods = response?.data || [];
  const pagination = response?.pagination;
  const totalMethods = pagination?.total || paymentMethods.length;
  const activeMethods = paymentMethods.filter((m: any) => m.isActive).length;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deletePaymentMethod(deleteId).unwrap();
      toast.success("Payment method deleted successfully");
      onClose();
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete payment method");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await togglePaymentMethod(id).unwrap();
      toast.success("Payment method status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onOpen();
  };

  const getPaymentIcon = (name: string) => {
    if (!name) return "💵";
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bkash")) return "💳";
    if (lowerName.includes("nagad")) return "💰";
    if (lowerName.includes("rocket")) return "🚀";
    if (lowerName.includes("bank")) return "🏦";
    return "💵";
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="light"
              startContent={<FaArrowLeft />}
              onPress={() => router.push("/admin")}
              className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <FaCreditCard className="text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Payment Methods
                </h1>
                <p className="text-sm sm:text-base text-white/90 mt-1">
                  Manage payment options for users
                </p>
              </div>
            </div>
          </div>
          <Button
            color="default"
            startContent={<FaPlus />}
            onPress={() => router.push("/admin/payment-methods/create")}
            size="lg"
            className="w-full sm:w-auto min-h-[44px] bg-white text-violet-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-violet-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Methods</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-lg bg-white/20" />
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalMethods}</p>
                )}
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCreditCard className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Active Methods</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-lg bg-white/20" />
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{activeMethods}</p>
                )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</label>
            <Input
              placeholder="Payment name or account number..."
              startContent={<FaSearch className="text-violet-500" />}
              value={search}
              onValueChange={setSearch}
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-violet-400 focus-within:border-violet-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Items per page</label>
            <Select
              placeholder="Select limit"
              selectedKeys={[limit.toString()]}
              onSelectionChange={(keys) => {
                setLimit(Number(Array.from(keys)[0]));
                setPage(1);
              }}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "min-h-[48px] border-2 border-gray-200 hover:border-violet-400 focus:border-violet-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
              }}
            >
              <SelectItem key="10">10 per page</SelectItem>
              <SelectItem key="20">20 per page</SelectItem>
              <SelectItem key="50">50 per page</SelectItem>
              <SelectItem key="100">100 per page</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* Payment Methods Table/Cards */}
      <Card className="shadow-xl">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-violet-100 to-purple-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCreditCard className="text-4xl sm:text-5xl text-violet-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No payment methods found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {search ? "Try adjusting your search criteria" : "Add your first payment method to get started"}
              </p>
              <Button
                color="primary"
                startContent={<FaPlus />}
                onPress={() => router.push("/admin/payment-methods/create")}
                size="lg"
                className="min-h-[44px] font-semibold shadow-lg"
              >
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Payment methods table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
                  <TableHeader>
                    <TableColumn>PAYMENT NAME</TableColumn>
                    <TableColumn>ACCOUNT NUMBER</TableColumn>
                    <TableColumn>PAYMENT NOTE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method: any) => (
                      <TableRow key={method._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getPaymentIcon(method.name)}</span>
                            <span className="font-semibold text-gray-900">{method.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-lg text-sm font-mono border border-gray-300">
                            {method.accountNumber}
                          </code>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 max-w-xs line-clamp-2">
                            {method.paymentNote}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={method.isActive ? "success" : "danger"}
                              startContent={method.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                            >
                              {method.isActive ? "Active" : "Inactive"}
                            </Chip>
                            <Switch
                              size="sm"
                              isSelected={method.isActive}
                              onValueChange={() => handleToggle(method._id)}
                              isDisabled={toggling}
                              color="success"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip content="Edit Payment Method">
                              <Button
                                isIconOnly
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() =>
                                  router.push(`/admin/payment-methods/edit/${method._id}`)
                                }
                              >
                                <FaEdit />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete Payment Method">
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => openDeleteModal(method._id)}
                              >
                                <FaTrash />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {paymentMethods.map((method: any) => (
                  <Card
                    key={method._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-4xl flex-shrink-0">{getPaymentIcon(method.name)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {method.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={method.isActive ? "success" : "danger"}
                              startContent={method.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                            >
                              {method.isActive ? "Active" : "Inactive"}
                            </Chip>
                            <Switch
                              size="sm"
                              isSelected={method.isActive}
                              onValueChange={() => handleToggle(method._id)}
                              isDisabled={toggling}
                              color="success"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500 font-medium">Account Number:</span>
                          <code className="block mt-1 bg-white px-3 py-1.5 rounded-lg text-sm font-mono border border-gray-300">
                            {method.accountNumber}
                          </code>
                        </div>
                        {method.paymentNote && (
                          <div className="text-sm">
                            <span className="text-gray-500 font-medium">Note:</span>
                            <p className="text-gray-700 mt-1">{method.paymentNote}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="md"
                          color="primary"
                          variant="flat"
                          className="flex-1 min-h-[44px] font-semibold"
                          startContent={<FaEdit />}
                          onPress={() => router.push(`/admin/payment-methods/edit/${method._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="md"
                          color="danger"
                          variant="flat"
                          className="flex-1 min-h-[44px] font-semibold"
                          startContent={<FaTrash />}
                          onPress={() => openDeleteModal(method._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6 px-4 pb-4">
                  <Pagination
                    total={pagination.totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="primary"
                    size="lg"
                    classNames={{
                      cursor: "min-w-[44px] min-h-[44px]",
                      item: "min-w-[44px] min-h-[44px]",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaTrash className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Delete Payment Method</h2>
                    <p className="text-sm text-white/90 font-normal">Confirm deletion</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <p className="text-gray-700">Are you sure you want to delete this payment method?</p>
                <p className="text-sm text-danger font-medium mt-2">
                  This action cannot be undone. Users will no longer see this payment option.
                </p>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 p-6">
                <Button
                  variant="light"
                  onPress={onClose}
                  size="lg"
                  className="min-h-[44px] font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={deleting}
                  size="lg"
                  className="min-h-[44px] font-semibold shadow-lg"
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
