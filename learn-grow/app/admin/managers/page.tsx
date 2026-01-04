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
import { FaSearch, FaUserTie, FaEnvelope, FaPhone, FaBan, FaCheck, FaPlus } from "react-icons/fa";
import { useGetUsersAdminQuery } from "@/redux/api/userApi";
import { toast } from "react-hot-toast";

export default function ManagersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const limit = 20;

  const { data, isLoading } = useGetUsersAdminQuery({ 
    page, 
    limit,
    role: "manager",
    search: searchQuery 
  });

  const managers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleCreateManager = async () => {
    // Implement manager creation logic here
    toast.success("Manager creation feature coming soon!");
    onClose();
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    // Implement status toggle logic here
    console.log("Toggle status for manager:", userId, currentStatus);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Managers Management</h1>
          <p className="text-gray-600">Manage support managers and their permissions</p>
        </div>
        <Button
          color="primary"
          startContent={<FaPlus />}
          onPress={onOpen}
          size="lg"
        >
          Add Manager
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Managers</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <p className="text-3xl font-bold text-purple-600">
                    {data?.pagination?.total || 0}
                  </p>
                )}
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <FaUserTie className="text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Managers</p>
                <p className="text-3xl font-bold text-green-600">
                  {managers.filter((m: any) => !m.isBlocked).length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <FaCheck className="text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Assigned Tickets</p>
                <p className="text-3xl font-bold text-orange-600">0</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <FaUserTie className="text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardBody>
          <Input
            placeholder="Search managers by name or email..."
            startContent={<FaSearch className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="bordered"
            size="lg"
          />
        </CardBody>
      </Card>

      {/* Managers Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : managers.length === 0 ? (
            <div className="text-center py-12">
              <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No managers found</h3>
              <p className="text-gray-500 mb-4">Add your first manager to handle support tickets</p>
              <Button color="primary" startContent={<FaPlus />} onPress={onOpen}>
                Add Manager
              </Button>
            </div>
          ) : (
            <>
              <Table aria-label="Managers table">
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
                    <TableRow key={manager._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={manager.profileImage}
                            name={manager.name}
                            size="md"
                            fallback={<FaUserTie />}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{manager.name}</p>
                            <p className="text-sm text-gray-500">{manager.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span>{manager.email}</span>
                          </div>
                          {manager.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaPhone className="text-gray-400" />
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
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            color={manager.isBlocked ? "success" : "danger"}
                            variant="flat"
                            onPress={() => handleStatusToggle(manager._id, manager.isBlocked)}
                          >
                            {manager.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="primary"
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
          <ModalHeader>Add New Manager</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input label="Name" placeholder="Enter manager name" variant="bordered" />
              <Input label="Email" type="email" placeholder="manager@example.com" variant="bordered" />
              <Input label="Phone" placeholder="+880..." variant="bordered" />
              <Input label="Password" type="password" placeholder="Temporary password" variant="bordered" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleCreateManager}>
              Add Manager
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
