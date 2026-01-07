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
  Chip,
  Avatar,
  Button,
  Input,
  Skeleton,
  Pagination,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { FaSearch, FaUserTie, FaEnvelope, FaPhone, FaBan, FaCheck, FaPlus, FaTicketAlt, FaUserShield } from "react-icons/fa";
import { useGetUsersAdminQuery, useGetAdminDashboardStatsQuery, useUpdateUserMutation } from "@/redux/api/userApi";
import { toast } from "react-hot-toast";

export default function ManagersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const limit = 20;

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Fetch dashboard stats for total count
  const { data: statsData } = useGetAdminDashboardStatsQuery(undefined);

  const { data, isLoading } = useGetUsersAdminQuery({
    page,
    limit,
    role: "manager",
    search: searchQuery
  });

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const managers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalManagers = statsData?.data?.managers || 0;

  const handleCreateManager = async () => {
    // Implement manager creation logic here
    toast.success("Manager creation feature coming soon!");
    onClose();
  };

  const handleStatusToggle = async (userId: string, isBlocked: boolean) => {
    try {
      await updateUser({ id: userId, isBlocked: !isBlocked }).unwrap();
      toast.success(!isBlocked ? "Manager blocked" : "Manager unblocked");
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
              <FaUserShield className="text-3xl sm:text-4xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Managers Management
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-1">
                Manage support managers and their permissions
              </p>
            </div>
          </div>
          <Button
            color="default"
            startContent={<FaPlus />}
            onPress={onOpen}
            size="lg"
            className="w-full sm:w-auto min-h-[44px] bg-white text-purple-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Add Manager
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Managers</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg bg-white/20" />
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{totalManagers}</p>
                )}
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaUserTie className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Active Managers</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {managers.filter((m: any) => !m.isBlocked).length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheck className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200 xs:col-span-2 lg:col-span-1">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Assigned Tickets</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">0</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaTicketAlt className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
        <CardBody className="p-4 sm:p-5">
          <Input
            placeholder="Search managers by name or email..."
            startContent={<FaSearch className="text-primary-500 text-base sm:text-lg" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="bordered"
            size="lg"
            isClearable
            onClear={() => setSearchQuery("")}
            classNames={{
              input: "text-sm sm:text-base",
              inputWrapper: "min-h-[44px] border-2 hover:border-primary-400 transition-colors",
            }}
          />
        </CardBody>
      </Card>

      {/* Managers Table/Cards */}
      <Card className="shadow-xl">
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : managers.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUserTie className="text-4xl sm:text-5xl text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                No managers found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery ? "Try adjusting your search query" : "Add your first manager to handle support tickets"}
              </p>
              <Button
                color="primary"
                startContent={<FaPlus />}
                onPress={onOpen}
                size="lg"
                className="min-h-[44px] font-semibold shadow-lg"
              >
                Add Manager
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Managers table" classNames={{ wrapper: "shadow-none" }}>
                  <TableHeader>
                    <TableColumn>MANAGER</TableColumn>
                    <TableColumn>CONTACT</TableColumn>
                    <TableColumn>JOINED DATE</TableColumn>
                    <TableColumn>ASSIGNED TICKETS</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {managers.map((manager: any) => (
                      <TableRow key={manager._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={manager.profileImage}
                              name={manager.name}
                              size="md"
                              fallback={
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-full h-full flex items-center justify-center text-white text-lg font-bold">
                                  {manager.name?.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{manager.name}</p>
                              <p className="text-sm text-gray-500 capitalize">{manager.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FaEnvelope className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{manager.email}</span>
                            </div>
                            {manager.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <FaPhone className="text-gray-400 flex-shrink-0" />
                                <span>{manager.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(manager.createdAt).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Chip color="primary" variant="flat" size="sm">
                            0 tickets
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={manager.isBlocked ? "danger" : "success"}
                            variant="flat"
                            size="sm"
                          >
                            {manager.isBlocked ? "Blocked" : "Active"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color={manager.isBlocked ? "success" : "danger"}
                            variant="flat"
                            onPress={() => handleStatusToggle(manager._id, manager.isBlocked)}
                          >
                            {manager.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {managers.map((manager: any) => (
                  <Card
                    key={manager._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <Avatar
                          src={manager.profileImage}
                          name={manager.name}
                          size="lg"
                          fallback={
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-full h-full flex items-center justify-center text-white text-xl font-bold">
                              {manager.name?.charAt(0).toUpperCase()}
                            </div>
                          }
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {manager.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Chip
                              color={manager.isBlocked ? "danger" : "success"}
                              variant="flat"
                              size="sm"
                            >
                              {manager.isBlocked ? "Blocked" : "Active"}
                            </Chip>
                            <Chip color="primary" variant="flat" size="sm">
                              0 tickets
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FaEnvelope className="text-primary-500 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{manager.email}</span>
                        </div>
                        {manager.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="text-primary-500 flex-shrink-0" />
                            <span className="text-gray-700">{manager.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Joined:</span>
                          <span className="text-gray-700">
                            {new Date(manager.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="md"
                        color={manager.isBlocked ? "success" : "danger"}
                        variant="flat"
                        className="w-full min-h-[44px] font-semibold"
                        onPress={() => handleStatusToggle(manager._id, manager.isBlocked)}
                      >
                        {manager.isBlocked ? "Unblock Manager" : "Block Manager"}
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 px-4 pb-4">
                  <Pagination
                    total={totalPages}
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

      {/* Add Manager Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaUserTie className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add New Manager</h2>
                    <p className="text-sm text-white/90 font-normal">Create a new manager account</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter manager name"
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "font-semibold",
                    }}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="manager@example.com"
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "font-semibold",
                    }}
                  />
                  <Input
                    label="Phone"
                    placeholder="+880..."
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "font-semibold",
                    }}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Temporary password"
                    variant="bordered"
                    size="lg"
                    classNames={{
                      label: "font-semibold",
                    }}
                  />
                </div>
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
                  color="primary"
                  onPress={handleCreateManager}
                  size="lg"
                  className="min-h-[44px] font-semibold shadow-lg"
                >
                  Add Manager
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
