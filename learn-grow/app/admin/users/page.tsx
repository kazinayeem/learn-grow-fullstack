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
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Spinner,
} from "@nextui-org/react";
import { useGetAllUsersQuery, useDeleteUserMutation, useCreateUserMutation } from "@/redux/api/userApi";
import { FaPlus, FaTrash, FaEllipsisV, FaSearch } from "react-icons/fa";

export default function UserManagementPage() {
    const { data, isLoading, refetch } = useGetAllUsersQuery({});
    const [deleteUser] = useDeleteUserMutation();
    const [createUser] = useCreateUserMutation();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState("");
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
    });

    const users = data?.data || [];
    const filteredUsers = users.filter((user: any) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                await deleteUser(userId).unwrap();
                alert("User deleted successfully!");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to delete user");
            }
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            await createUser(newUser).unwrap();
            alert("User created successfully!");
            setNewUser({ name: "", email: "", password: "", role: "student" });
            onClose();
            refetch();
        } catch (error: any) {
            alert(error?.data?.message || "Failed to create user");
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "danger";
            case "instructor":
                return "warning";
            default:
                return "primary";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Loading users..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage all platform users</p>
                </div>
                <Button
                    color="primary"
                    startContent={<FaPlus />}
                    onPress={onOpen}
                    size="lg"
                >
                    Add New User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Students</p>
                    <p className="text-3xl font-bold">
                        {users.filter((u: any) => u.role === "student").length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Instructors</p>
                    <p className="text-3xl font-bold">
                        {users.filter((u: any) => u.role === "instructor").length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Admins</p>
                    <p className="text-3xl font-bold">
                        {users.filter((u: any) => u.role === "admin").length}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<FaSearch className="text-gray-400" />}
                    size="lg"
                    classNames={{
                        input: "text-base",
                    }}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Table aria-label="Users table">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>EMAIL</TableColumn>
                        <TableColumn>ROLE</TableColumn>
                        <TableColumn>JOINED</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No users found">
                        {filteredUsers.map((user: any) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-gray-600">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        color={getRoleBadgeColor(user.role)}
                                        variant="flat"
                                        size="sm"
                                    >
                                        {user.role?.toUpperCase()}
                                    </Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-500">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString()
                                            : "N/A"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                isIconOnly
                                            >
                                                <FaEllipsisV />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="User actions">
                                            <DropdownItem
                                                key="delete"
                                                className="text-danger"
                                                color="danger"
                                                startContent={<FaTrash />}
                                                onPress={() => handleDeleteUser(user._id, user.name)}
                                            >
                                                Delete User
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Add User Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Add New User
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter user's full name"
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, name: e.target.value })
                                        }
                                        size="lg"
                                        isRequired
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, email: e.target.value })
                                        }
                                        size="lg"
                                        isRequired
                                    />
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, password: e.target.value })
                                        }
                                        size="lg"
                                        isRequired
                                    />
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Role
                                        </label>
                                        <div className="flex gap-4">
                                            {["student", "instructor", "admin"].map((role) => (
                                                <Button
                                                    key={role}
                                                    color={newUser.role === role ? "primary" : "default"}
                                                    variant={newUser.role === role ? "solid" : "bordered"}
                                                    onPress={() => setNewUser({ ...newUser, role })}
                                                >
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleCreateUser}>
                                    Create User
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
