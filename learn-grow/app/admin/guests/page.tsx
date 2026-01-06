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
  Card,
  CardBody,
  Skeleton,
} from "@nextui-org/react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
} from "@/redux/api/eventApi";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaUserFriends, FaEnvelope, FaPhone, FaBriefcase, FaBuilding } from "react-icons/fa";
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
  const totalGuests = pagination?.total || 0;

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

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "host":
        return "success";
      case "speaker":
        return "warning";
      case "mentor":
        return "secondary";
      case "judge":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
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
                <FaUserFriends className="text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Guest Management
                </h1>
                <p className="text-sm sm:text-base text-white/90 mt-1">
                  Manage event guests, speakers, and hosts
                </p>
              </div>
            </div>
          </div>
          <Button
            color="default"
            startContent={<FaPlus />}
            onPress={() => router.push("/admin/guests/create")}
            size="lg"
            className="w-full sm:w-auto min-h-[44px] bg-white text-teal-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="mb-5 sm:mb-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-200">
        <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Guests</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20 rounded-lg bg-white/20" />
              ) : (
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalGuests}</p>
              )}
            </div>
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
              <FaUserFriends className="text-2xl sm:text-3xl lg:text-4xl" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
        <CardBody className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search guests..."
              startContent={<FaSearch className="text-primary-500" />}
              value={search}
              onValueChange={setSearch}
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[44px] border-2 hover:border-primary-400 transition-colors",
              }}
            />
            <Select
              placeholder="Filter by Role"
              selectedKeys={roleFilter ? [roleFilter] : []}
              onSelectionChange={(keys) => setRoleFilter(Array.from(keys)[0] as string || "")}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "min-h-[44px]",
              }}
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
              size="lg"
              classNames={{
                trigger: "min-h-[44px]",
              }}
            >
              <SelectItem key="10">10 per page</SelectItem>
              <SelectItem key="20">20 per page</SelectItem>
              <SelectItem key="50">50 per page</SelectItem>
              <SelectItem key="100">100 per page</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Guests Table/Cards */}
      <Card className="shadow-xl">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-teal-100 to-cyan-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserFriends className="text-4xl sm:text-5xl text-teal-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No guests found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {search || roleFilter ? "Try adjusting your search or filter criteria" : "Add your first guest to get started"}
              </p>
              <Button
                color="primary"
                startContent={<FaPlus />}
                onPress={() => router.push("/admin/guests/create")}
                size="lg"
                className="min-h-[44px] font-semibold shadow-lg"
              >
                Add Your First Guest
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Guests table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
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
                      <TableRow key={guest._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={guest.profileImage}
                              name={guest.fullName}
                              size="md"
                              fallback={
                                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-full h-full flex items-center justify-center text-white text-lg font-bold">
                                  {guest.fullName?.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{guest.fullName}</p>
                              {guest.bio && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {guest.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color={getRoleColor(guest.role)}>
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
                          <div className="text-sm space-y-1">
                            {guest.email && (
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-xs">{guest.email}</span>
                              </div>
                            )}
                            {guest.phoneNumber && (
                              <div className="flex items-center gap-2 text-gray-500">
                                <FaPhone className="text-gray-400 flex-shrink-0" />
                                <span>{guest.phoneNumber}</span>
                              </div>
                            )}
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
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {guests.map((guest: any) => (
                  <Card
                    key={guest._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <Avatar
                          src={guest.profileImage}
                          name={guest.fullName}
                          size="lg"
                          fallback={
                            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-full h-full flex items-center justify-center text-white text-xl font-bold">
                              {guest.fullName?.charAt(0).toUpperCase()}
                            </div>
                          }
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {guest.fullName}
                          </h3>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={getRoleColor(guest.role)}
                          >
                            {guest.role}
                          </Chip>
                        </div>
                      </div>

                      {guest.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {guest.bio}
                        </p>
                      )}

                      <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                        {guest.organization && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaBuilding className="text-primary-500 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{guest.organization}</span>
                          </div>
                        )}
                        {guest.designation && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaBriefcase className="text-primary-500 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{guest.designation}</span>
                          </div>
                        )}
                        {guest.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-primary-500 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{guest.email}</span>
                          </div>
                        )}
                        {guest.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="text-primary-500 flex-shrink-0" />
                            <span className="text-gray-700">{guest.phoneNumber}</span>
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
                          onPress={() => router.push(`/admin/guests/edit/${guest._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="md"
                          color="danger"
                          variant="flat"
                          className="flex-1 min-h-[44px] font-semibold"
                          startContent={<FaTrash />}
                          onPress={() => openDeleteModal(guest._id)}
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
                    <h2 className="text-xl font-bold">Delete Guest</h2>
                    <p className="text-sm text-white/90 font-normal">Confirm deletion</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <p className="text-gray-700">Are you sure you want to delete this guest?</p>
                <p className="text-sm text-danger font-medium mt-2">
                  This action cannot be undone. The guest will be removed from all events.
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
