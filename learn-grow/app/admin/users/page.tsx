"use client";

import React, { useMemo, useState } from "react";
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
    Select,
    SelectItem,
} from "@nextui-org/react";
import { useGetUsersAdminQuery, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from "@/redux/api/userApi";
import { FaPlus, FaTrash, FaEdit, FaEllipsisV, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [roleFilter, setRoleFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, refetch, isFetching } = useGetUsersAdminQuery({ page, limit, search: searchQuery, role: roleFilter });
    const [deleteUser] = useDeleteUserMutation();
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
    });

    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        role: "student",
    });

    const users = data?.data || [];
    const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };
    const counts = data?.counts || { totalUsers: 0, students: 0, instructors: 0, admins: 0, guardians: 0 };

    const handleOpenEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        onEditOpen();
    };

    const handleEditUser = async () => {
        if (!editForm.name || !editForm.email) {
            alert("Please fill in all fields");
            return;
        }

        try {
            await updateUser({
                id: editingUser._id,
                name: editForm.name,
                email: editForm.email,
                role: editForm.role,
            }).unwrap();
            alert("User updated successfully!");
            onEditClose();
            setEditingUser(null);
            refetch();
        } catch (error: any) {
            alert(error?.data?.message || "Failed to update user");
        }
    };

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

    const roleOptions = useMemo(() => [
        { key: "", label: "All" },
        { key: "student", label: "Student" },
        { key: "instructor", label: "Instructor" },
        { key: "guardian", label: "Guardian" },
        { key: "admin", label: "Admin" },
    ], []);


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
                <div className="flex items-center gap-3">
                    <Button
                        variant="light"
                        startContent={<FaArrowLeft />}
                        onPress={() => router.back()}
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-gray-600 mt-1">Manage all platform users</p>
                    </div>
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
                    <p className="text-3xl font-bold">{counts.totalUsers}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Students</p>
                    <p className="text-3xl font-bold">{counts.students}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Instructors</p>
                    <p className="text-3xl font-bold">{counts.instructors}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
                    <p className="text-sm opacity-90">Admins</p>
                    <p className="text-3xl font-bold">{counts.admins}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input
                    label="Search"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    startContent={<FaSearch className="text-gray-400" />}
                    size="lg"
                    classNames={{ input: "text-base" }}
                />
                <Select
                    label="Role"
                    selectedKeys={[roleFilter]}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                >
                    {roleOptions.map((opt) => (
                        <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                </Select>
                <Select
                    label="Rows per page"
                    selectedKeys={[String(limit)]}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                    {[10, 20, 50, 100].map((n) => (
                        <SelectItem key={String(n)}>{n}</SelectItem>
                    ))}
                </Select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Table aria-label="Users table" removeWrapper>
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>EMAIL</TableColumn>
                        <TableColumn>ROLE</TableColumn>
                        <TableColumn>JOINED</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No users found" isLoading={isFetching} loadingContent={<Spinner label="Loading..." />}>
                        {users.map((user: any) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-gray-600">{user.email || user.phone || "-"}</div>
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
                                                key="edit"
                                                startContent={<FaEdit />}
                                                onPress={() => handleOpenEditModal(user)}
                                            >
                                                Edit User
                                            </DropdownItem>
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

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t">
                    <span className="text-sm text-gray-600">
                        Page {meta.page} of {meta.totalPages} — {meta.total} total
                    </span>
                    <div className="flex gap-2">
                        <Button
                            isDisabled={page <= 1}
                            onPress={() => setPage((p) => Math.max(1, p - 1))}
                            variant="flat"
                        >
                            Previous
                        </Button>
                        <Button
                            isDisabled={page >= meta.totalPages}
                            onPress={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                            variant="flat"
                        >
                            Next
                        </Button>
                    </div>
                </div>
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

            {/* Edit User Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Edit User
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter user's full name"
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, name: e.target.value })
                                        }
                                        size="lg"
                                        isRequired
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, email: e.target.value })
                                        }
                                        size="lg"
                                        isRequired
                                    />
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Role
                                        </label>
                                        <div className="flex gap-4">
                                            {["student", "instructor", "admin", "guardian"].map((role) => (
                                                <Button
                                                    key={role}
                                                    color={editForm.role === role ? "primary" : "default"}
                                                    variant={editForm.role === role ? "solid" : "bordered"}
                                                    onPress={() => setEditForm({ ...editForm, role })}
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
                                <Button color="primary" onPress={handleEditUser}>
                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
