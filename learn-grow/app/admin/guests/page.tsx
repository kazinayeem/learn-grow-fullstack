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
  Avatar,
  Tooltip,
} from "@nextui-org/react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
} from "@/redux/api/eventApi";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminGuestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: response, isLoading } = useGetAllGuestsQuery({
    page,
    limit,
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const [deleteGuest, { isLoading: deleting }] = useDeleteGuestMutation();

  const guests = response?.data || [];
  const pagination = response?.pagination;

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteGuest(deleteId).unwrap();
      toast.success("Guest deleted successfully");
      onClose();
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete guest");
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onOpen();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="light" onPress={() => router.push("/admin")}>
            ← Back to Admin
          </Button>
          <h1 className="text-3xl font-bold">Guest Management</h1>
        </div>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={() => router.push("/admin/guests/create")}
        >
          Add Guest
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Search guests..."
          startContent={<FaSearch />}
          value={search}
          onValueChange={setSearch}
          variant="bordered"
        />
        <Select
          placeholder="Filter by Role"
          selectedKeys={roleFilter ? [roleFilter] : []}
          onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] as string || "")}
          variant="bordered"
        >
          <SelectItem key="">All Roles</SelectItem>
          <SelectItem key="Guest">Guest</SelectItem>
          <SelectItem key="Host">Host</SelectItem>
          <SelectItem key="Speaker">Speaker</SelectItem>
          <SelectItem key="Mentor">Mentor</SelectItem>
          <SelectItem key="Judge">Judge</SelectItem>
        </Select>
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
          <Spinner size="lg" label="Loading guests..." />
        </div>
      ) : guests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No guests found</p>
          <Button
            color="primary"
            className="mt-4"
            onPress={() => router.push("/admin/guests/create")}
          >
            Add Your First Guest
          </Button>
        </div>
      ) : (
        <>
          <Table aria-label="Guests table" className="mb-6">
            <TableHeader>
              <TableColumn>GUEST</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>ORGANIZATION</TableColumn>
              <TableColumn>DESIGNATION</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {guests.map((guest: any) => (
                <TableRow key={guest._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={guest.profileImage}
                        name={guest.fullName}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold">{guest.fullName}</p>
                        {guest.bio && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {guest.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {guest.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {guest.organization || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    {guest.designation || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {guest.email && <p>{guest.email}</p>}
                      {guest.phoneNumber && <p className="text-gray-500">{guest.phoneNumber}</p>}
                      {!guest.email && !guest.phoneNumber && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Tooltip content="Edit Guest">
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="light"
                          onPress={() => router.push(`/admin/guests/edit/${guest._id}`)}
                        >
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete Guest">
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => openDeleteModal(guest._id)}
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
          <ModalHeader>Delete Guest</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this guest?</p>
            <p className="text-sm text-danger">
              This action cannot be undone. The guest will be removed from all events.
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
