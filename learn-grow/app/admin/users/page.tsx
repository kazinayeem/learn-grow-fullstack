"use client";

import React, { useMemo, useState, useEffect } from "react";
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
    Card,
    CardBody,
    Avatar,
    Skeleton,
} from "@nextui-org/react";
import { useGetUsersAdminQuery, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from "@/redux/api/userApi";
import { FaPlus, FaTrash, FaEdit, FaEllipsisV, FaSearch, FaArrowLeft, FaUsers, FaUserGraduate, FaChalkboardTeacher, FaUserShield } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [roleFilter, setRoleFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUserRole, setCurrentUserRole] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserRole(user.role || "");
            }
        }
    }, []);

    // Auto-open modal if openModal=true in URL
    useEffect(() => {
        const shouldOpenModal = searchParams.get("openModal");
        const roleFromUrl = searchParams.get("role");
        if (shouldOpenModal === "true") {
            if (roleFromUrl) {
                setNewUser(prev => ({ ...prev, role: roleFromUrl }));
            }
            onOpen();
            // Clean up URL after opening modal
            router.replace("/admin/users", { scroll: false });
        }
    }, [searchParams, onOpen, router]);

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
            case "manager":
                return "success";
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
        { key: "manager", label: "Manager" },
    ], []);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
            {/* Header with Gradient */}
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="light"
                            startContent={<FaArrowLeft />}
                            onPress={() => router.push(currentUserRole === "manager" ? "/manager" : "/admin")}
                            className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
                            size="lg"
                        >
                            Back to Dashboard
                        </Button>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                                <FaUsers className="text-3xl sm:text-4xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                    User Management
                                </h1>
                                <p className="text-sm sm:text-base text-white/90 mt-1">
                                    Manage all platform users
                                </p>
                            </div>
                        </div>
                    </div>
                    {currentUserRole === "admin" && (
                        <Button
                            color="default"
                            startContent={<FaPlus />}
                            onPress={onOpen}
                            size="lg"
                            className="w-full sm:w-auto min-h-[44px] bg-white text-blue-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Add New User
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="shadow-md">
                            <CardBody className="p-4 sm:p-5 lg:p-6">
                                <Skeleton className="h-20 w-full rounded-lg" />
                            </CardBody>
                        </Card>
                    ))
                ) : (
                    <>
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
                            <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Users</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{counts.totalUsers}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                        <FaUsers className="text-2xl sm:text-3xl lg:text-4xl" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
                            <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Students</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{counts.students}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                        <FaUserGraduate className="text-2xl sm:text-3xl lg:text-4xl" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
                            <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Instructors</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{counts.instructors}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                        <FaChalkboardTeacher className="text-2xl sm:text-3xl lg:text-4xl" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-200">
                            <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Admins</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{counts.admins}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                                        <FaUserShield className="text-2xl sm:text-3xl lg:text-4xl" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </>
                )}
            </div>

            {/* Filters */}
            <Card className="mb-5 sm:mb-6 shadow-lg border border-gray-200">
                <CardBody className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Search"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            startContent={<FaSearch className="text-primary-500" />}
                            size="lg"
                            variant="bordered"
                            classNames={{
                                input: "text-sm sm:text-base",
                                inputWrapper: "min-h-[44px] border-2 hover:border-primary-400 transition-colors",
                            }}
                        />
                        <Select
                            label="Role"
                            selectedKeys={[roleFilter]}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                            size="lg"
                            variant="bordered"
                            classNames={{
                                trigger: "min-h-[44px]",
                            }}
                        >
                            {roleOptions.map((opt) => (
                                <SelectItem key={opt.key}>{opt.label}</SelectItem>
                            ))}
                        </Select>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Rows per page</label>
                            <select
                                value={String(limit)}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:outline-none transition-all duration-300 bg-white text-base"
                            >
                                {[10, 20, 50, 100].map((n) => (
                                    <option key={n} value={String(n)}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Users Table/Cards */}
            <Card className="shadow-xl">
                <CardBody className="p-0 sm:p-4 lg:p-6">
                    {isLoading ? (
                        <div className="space-y-3 sm:space-y-4 p-4">
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
                            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUsers className="text-4xl sm:text-5xl text-blue-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                                No users found
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                                {searchQuery ? "Try adjusting your search or filter criteria" : "Add your first user to get started"}
                            </p>
                            {currentUserRole === "admin" && (
                                <Button
                                    color="primary"
                                    startContent={<FaPlus />}
                                    onPress={onOpen}
                                    size="lg"
                                    className="min-h-[44px] font-semibold shadow-lg"
                                >
                                    Add New User
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table aria-label="Users table" classNames={{ wrapper: "shadow-none" }} removeWrapper>
                                    <TableHeader>
                                        <TableColumn>NAME</TableColumn>
                                        <TableColumn>EMAIL</TableColumn>
                                        <TableColumn>ROLE</TableColumn>
                                        <TableColumn>JOINED</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No users found" isLoading={isFetching} loadingContent={<Spinner label="Loading..." />}>
                                        {users.map((user: any) => (
                                            <TableRow key={user._id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={user.profileImage}
                                                            name={user.name}
                                                            size="sm"
                                                            fallback={
                                                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center text-white text-sm font-bold">
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            }
                                                        />
                                                        <div className="font-medium">{user.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-gray-600 truncate max-w-xs">{user.email || user.phone || "-"}</div>
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
                                                    {currentUserRole === "admin" ? (
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
                                                    ) : (
                                                        <span className="text-sm text-gray-400">View Only</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile/Tablet Card View */}
                            <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                                {users.map((user: any) => (
                                    <Card
                                        key={user._id}
                                        className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                                    >
                                        <CardBody className="p-4 sm:p-5">
                                            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <Avatar
                                                    src={user.profileImage}
                                                    name={user.name}
                                                    size="lg"
                                                    fallback={
                                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    }
                                                    className="flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                                                        {user.name}
                                                    </h3>
                                                    <Chip
                                                        color={getRoleBadgeColor(user.role)}
                                                        variant="flat"
                                                        size="sm"
                                                    >
                                                        {user.role?.toUpperCase()}
                                                    </Chip>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Email:</span>
                                                    <span className="text-gray-700 ml-2 truncate block">{user.email || user.phone || "-"}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Joined:</span>
                                                    <span className="text-gray-700 ml-2">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                                    </span>
                                                </div>
                                            </div>

                                            {currentUserRole === "admin" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="md"
                                                        color="primary"
                                                        variant="flat"
                                                        className="flex-1 min-h-[44px] font-semibold"
                                                        startContent={<FaEdit />}
                                                        onPress={() => handleOpenEditModal(user)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="md"
                                                        color="danger"
                                                        variant="flat"
                                                        className="flex-1 min-h-[44px] font-semibold"
                                                        startContent={<FaTrash />}
                                                        onPress={() => handleDeleteUser(user._id, user.name)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
                                <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                    Page <span className="font-bold text-primary-600">{meta.page}</span> of <span className="font-bold">{meta.totalPages}</span> • Total: <span className="font-bold text-primary-600">{meta.total}</span> users
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        isDisabled={page <= 1}
                                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                                        variant="flat"
                                        size="md"
                                        className="min-h-[44px] font-semibold"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        isDisabled={page >= meta.totalPages}
                                        onPress={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                        variant="flat"
                                        size="md"
                                        className="min-h-[44px] font-semibold"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Add User Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <FaPlus className="text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Add New User</h2>
                                        <p className="text-sm text-white/90 font-normal">Create a new user account</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6">
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
                                        variant="bordered"
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
                                        variant="bordered"
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
                                        variant="bordered"
                                    />
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">
                                            Role
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["student", "instructor", "admin", "manager"].map((role) => (
                                                <Button
                                                    key={role}
                                                    color={newUser.role === role ? "primary" : "default"}
                                                    variant={newUser.role === role ? "solid" : "bordered"}
                                                    onPress={() => setNewUser({ ...newUser, role })}
                                                    className="min-h-[44px]"
                                                >
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200 p-6">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    size="lg"
                                    className="min-h-[44px] font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleCreateUser}
                                    size="lg"
                                    className="min-h-[44px] font-semibold shadow-lg"
                                >
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
                            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <FaEdit className="text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Edit User</h2>
                                        <p className="text-sm text-white/90 font-normal">Update user information</p>
                                    </div>
                                </div>
                            </ModalHeader>
                            <ModalBody className="p-6">
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
                                        variant="bordered"
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
                                        variant="bordered"
                                    />
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">
                                            Role
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {["student", "instructor", "admin", "guardian", "manager"].map((role) => (
                                                <Button
                                                    key={role}
                                                    color={editForm.role === role ? "primary" : "default"}
                                                    variant={editForm.role === role ? "solid" : "bordered"}
                                                    onPress={() => setEditForm({ ...editForm, role })}
                                                    className="min-h-[44px]"
                                                >
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-200 p-6">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    size="lg"
                                    className="min-h-[44px] font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleEditUser}
                                    size="lg"
                                    className="min-h-[44px] font-semibold shadow-lg"
                                >
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
