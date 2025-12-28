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
} from "@nextui-org/react";
import {
  useGetAllPaymentMethodsQuery,
  useDeletePaymentMethodMutation,
  useTogglePaymentMethodMutation,
} from "@/redux/api/paymentApi";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-gray-600 mt-1">
            Manage payment options for users
          </p>
        </div>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => router.push("/admin/payment-methods/create")}
        >
          Add Payment Method
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search by payment name or account number..."
          startContent={<FaSearch />}
          value={search}
          onValueChange={setSearch}
          variant="bordered"
        />
        <Select
          placeholder="Items per page"
          selectedKeys={[limit.toString()]}
          onSelectionChange={(keys) => {
            setLimit(Number(Array.from(keys)[0]));
            setPage(1);
          }}
          variant="bordered"
        >
          <SelectItem key="10">10 per page</SelectItem>
          <SelectItem key="20">20 per page</SelectItem>
          <SelectItem key="50">50 per page</SelectItem>
          <SelectItem key="100">100 per page</SelectItem>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" label="Loading payment methods..." />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No payment methods found</p>
          <Button
            color="primary"
            className="mt-4"
            onPress={() => router.push("/admin/payment-methods/create")}
          >
            Add Your First Payment Method
          </Button>
        </div>
      ) : (
        <>
          <Table aria-label="Payment methods table" className="mb-6">
            <TableHeader>
              <TableColumn>PAYMENT NAME</TableColumn>
              <TableColumn>ACCOUNT NUMBER</TableColumn>
              <TableColumn>PAYMENT NOTE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((method: any) => (
                <TableRow key={method._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{method.name}</span>
                      {method.name === "bKash" && (
                        <span className="text-pink-600">💳</span>
                      )}
                      {method.name === "Nagad" && (
                        <span className="text-orange-600">💰</span>
                      )}
                      {method.name === "Rocket" && (
                        <span className="text-purple-600">🚀</span>
                      )}
                      {method.name === "Bank Transfer" && (
                        <span className="text-blue-600">🏦</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {method.accountNumber}
                    </code>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 max-w-xs">
                      {method.paymentNote}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={method.isActive ? "success" : "danger"}
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </Chip>
                      <Switch
                        size="sm"
                        isSelected={method.isActive}
                        onValueChange={() => handleToggle(method._id)}
                        isDisabled={toggling}
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
                          variant="light"
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
                          variant="light"
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={pagination.totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Delete Payment Method</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this payment method?</p>
            <p className="text-sm text-danger">
              This action cannot be undone. Users will no longer see this payment option.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
