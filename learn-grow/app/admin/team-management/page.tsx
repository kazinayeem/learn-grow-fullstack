"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Tabs,
    Tab,
    Image,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Checkbox,
    Select,
    SelectItem,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import {
    FaTrash,
    FaEdit,
    FaDownload,
    FaEye,
    FaEyeSlash,
    FaUsers,
    FaPlus,
    FaUserTie,
    FaLinkedin,
    FaTwitter,
    FaArrowLeft,
    FaUpload,
    FaGripVertical,
    FaTags,
} from "react-icons/fa";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
    useGetAllTeamMembersQuery,
    useCreateTeamMemberMutation,
    useUpdateTeamMemberMutation,
    useDeleteTeamMemberMutation,
    useToggleShowHomeMutation,
    useReorderMembersMutation,
    useGetApprovedInstructorsForImportQuery,
    useImportInstructorsMutation,
    useGetAllRolesQuery,
    useCreateRoleMutation,
    useReorderRolesMutation,
    useDeleteRoleMutation,
    useSeedDefaultRolesMutation,
} from "@/redux/api/teamApi";
import SweetAlert2 from "sweetalert2";
import { useRouter } from "next/navigation";

interface Role {
    _id: string;
    name: string;
    position: number;
    isActive: boolean;
}

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    image: string;
    profileImage?: string; // optional external image when imported
    imageSize: number;
    linkedIn?: string;
    twitter?: string;
    bio?: string;
    showOnHome: boolean;
    userId?: string;
    position: number;
}

interface Instructor {
    _id: string;
    name: string;
    profileImage?: string;
}

// Sortable Role Item Component
function SortableRoleItem({ role, onDelete }: { role: Role; onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: role._id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <FaGripVertical className="text-gray-400" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{role.name}</p>
                <p className="text-xs text-gray-500">Position: {role.position}</p>
            </div>
            <Button
                size="sm"
                color="danger"
                variant="flat"
                isIconOnly
                onClick={() => onDelete(role._id)}
            >
                <FaTrash className="text-sm" />
            </Button>
        </div>
    );
}

// Sortable Member Item Component
function SortableMemberItem({
    member,
    onEdit,
    onDelete,
    onToggleShow,
}: {
    member: TeamMember;
    onEdit: (member: TeamMember) => void;
    onDelete: (id: string, name: string) => void;
    onToggleShow: (id: string, currentValue: boolean) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: member._id,
    });

    const displayImage = member.image || member.profileImage || "";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-lg bg-white"
        >
            <Card className="shadow-none">
                <CardBody className="p-0">
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {displayImage && displayImage !== "placeholder" ? (
                            <Image
                                src={
                                    displayImage.startsWith("http")
                                        ? displayImage
                                        : `data:image/jpeg;base64,${displayImage}`
                                }
                                alt={member.name}
                                width="100%"
                                height="100%"
                                classNames={{
                                    img: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                                }}
                                radius="none"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <FaUserTie size={48} />
                            </div>
                        )}
                        <div className="absolute top-3 left-3 z-10 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                            <div className="bg-white/90 p-2 rounded-full shadow-md">
                                <FaGripVertical className="text-gray-600" />
                            </div>
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                            <Chip
                                startContent={member.showOnHome ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                                variant="solid"
                                color={member.showOnHome ? "success" : "default"}
                                size="sm"
                                className="shadow-md"
                            >
                                {member.showOnHome ? "Visible" : "Hidden"}
                            </Chip>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 md:p-5">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">{member.name}</h3>
                        <p className="text-xs sm:text-sm text-emerald-600 font-medium mb-2 truncate">{member.role}</p>

                        {member.bio && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{member.bio}</p>
                        )}

                        <div className="flex gap-2 mb-4">
                            {member.linkedIn && (
                                <a
                                    href={member.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                    <FaLinkedin />
                                </a>
                            )}
                            {member.twitter && (
                                <a
                                    href={member.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors"
                                >
                                    <FaTwitter />
                                </a>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-gray-100">
                            <Button
                                size="sm"
                                variant="flat"
                                color={member.showOnHome ? "default" : "success"}
                                onClick={() => onToggleShow(member._id, member.showOnHome)}
                                className="w-full min-h-[36px] text-xs px-1"
                            >
                                {member.showOnHome ? "Hide" : "Show"}
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                onClick={() => onEdit(member)}
                                isIconOnly
                                className="w-full min-h-[36px]"
                            >
                                <FaEdit className="text-sm" />
                            </Button>
                            <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                onClick={() => onDelete(member._id, member.name)}
                                isIconOnly
                                className="w-full min-h-[36px]"
                            >
                                <FaTrash className="text-sm" />
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default function TeamManagementPage() {
    const router = useRouter();

    // Queries and Mutations
    const { data: teamData, isLoading: teamLoading, refetch } = useGetAllTeamMembersQuery(undefined);
    const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery(undefined);
    const { data: instructorsData, isLoading: instructorsLoading } =
        useGetApprovedInstructorsForImportQuery(undefined);

    const [createTeamMember, { isLoading: createLoading }] = useCreateTeamMemberMutation();
    const [updateTeamMember, { isLoading: updateLoading }] = useUpdateTeamMemberMutation();
    const [deleteTeamMember] = useDeleteTeamMemberMutation();
    const [toggleShowHome] = useToggleShowHomeMutation();
    const [reorderMembers] = useReorderMembersMutation();
    const [importInstructors, { isLoading: importLoading }] = useImportInstructorsMutation();

    const [createRole] = useCreateRoleMutation();
    const [reorderRoles] = useReorderRolesMutation();
    const [deleteRole] = useDeleteRoleMutation();
    const [seedDefaultRoles, { isLoading: seedingRoles }] = useSeedDefaultRolesMutation();

    // State
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [localRoles, setLocalRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("");

    // Add Member Form
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        linkedIn: "",
        twitter: "",
        bio: "",
    });
    const [imageUrl, setImageUrl] = useState<string>("");

    const teamMembers = (teamData?.data || []) as TeamMember[];
    const roles = (rolesData?.data || []) as Role[];
    const instructors = (instructorsData?.data || []) as Instructor[];

    // Update local roles when data changes
    useEffect(() => {
        if (roles.length > 0) {
            setLocalRoles([...roles]);
        }
    }, [roles]);

    // Drag and drop sensors for roles
    const roleSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Drag and drop sensors for members
    const memberSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle role drag end
    const handleRoleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localRoles.findIndex((r) => r._id === active.id);
            const newIndex = localRoles.findIndex((r) => r._id === over.id);

            const newRoles = arrayMove(localRoles, oldIndex, newIndex);
            setLocalRoles(newRoles);

            // Update positions in backend
            const roleOrders = newRoles.map((role, index) => ({
                id: role._id,
                position: index + 1,
            }));

            try {
                await reorderRoles(roleOrders).unwrap();
                toast.success("Roles reordered successfully!");
            } catch (error) {
                toast.error("Failed to reorder roles");
                setLocalRoles([...roles]); // Revert on error
            }
        }
    };

    // Handle member drag end within a role
    const handleMemberDragEnd = async (event: DragEndEvent, roleMembers: TeamMember[]) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = roleMembers.findIndex((m) => m._id === active.id);
            const newIndex = roleMembers.findIndex((m) => m._id === over.id);

            const newMembers = arrayMove(roleMembers, oldIndex, newIndex);

            // Update positions in backend
            const memberOrders = newMembers.map((member, index) => ({
                id: member._id,
                position: index + 1,
            }));

            try {
                await reorderMembers(memberOrders).unwrap();
                toast.success("Members reordered successfully!");
                refetch();
            } catch (error) {
                toast.error("Failed to reorder members");
            }
        }
    };

    // Handle Add Role
    const handleAddRole = async () => {
        if (!newRoleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            await createRole({ name: newRoleName }).unwrap();
            toast.success("Role added successfully!");
            setNewRoleName("");
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to add role");
        }
    };

    // Handle Delete Role
    const handleDeleteRole = async (id: string) => {
        const result = await SweetAlert2.fire({
            title: "Delete Role",
            text: "Are you sure you want to delete this role?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Delete",
        });

        if (result.isConfirmed) {
            try {
                await deleteRole(id).unwrap();
                toast.success("Role deleted successfully!");
            } catch (error) {
                toast.error((error as any)?.data?.message || "Failed to delete role");
            }
        }
    };

    // Handle Seed Default Roles
    const handleSeedRoles = async () => {
        try {
            await seedDefaultRoles({} as any).unwrap();
            toast.success("Default roles seeded successfully!");
        } catch (error) {
            toast.error("Failed to seed roles");
        }
    };

    // Handle Add Member
    const handleAddMember = async () => {
        if (!formData.name || !formData.role || !imageUrl) {
            toast.error("Name, Role, and Image URL are required");
            return;
        }

        try {
            await createTeamMember({
                name: formData.name,
                role: formData.role,
                image: imageUrl,
                linkedIn: formData.linkedIn,
                twitter: formData.twitter,
                bio: formData.bio,
            }).unwrap();

            toast.success("Team member added successfully!");
            setFormData({ name: "", role: "", linkedIn: "", twitter: "", bio: "" });
            setImageUrl("");
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to add member");
        }
    };

    // Handle Update Member
    const handleUpdateMember = async () => {
        if (!editingMember) return;

        try {
            await updateTeamMember({
                id: editingMember._id,
                ...editingMember,
            }).unwrap();

            toast.success("Team member updated successfully!");
            setIsEditOpen(false);
            setEditingMember(null);
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to update member");
        }
    };

    // Handle Delete Member
    const handleDeleteMember = async (id: string, name: string) => {
        const result = await SweetAlert2.fire({
            title: "Delete Team Member",
            text: `Are you sure you want to delete ${name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Delete",
        });

        if (result.isConfirmed) {
            try {
                await deleteTeamMember(id).unwrap();
                toast.success("Team member deleted successfully!");
                refetch();
            } catch (error) {
                toast.error("Failed to delete member");
            }
        }
    };

    // Handle Toggle Show Home
    const handleToggleShowHome = async (id: string, currentValue: boolean) => {
        try {
            await toggleShowHome({ id, showOnHome: !currentValue }).unwrap();
            toast.success("Visibility updated!");
            refetch();
        } catch (error) {
            toast.error("Failed to update visibility");
        }
    };

    // Handle Import Instructors
    const handleImportInstructors = async () => {
        if (selectedInstructors.length === 0) {
            toast.error("Select at least one instructor");
            return;
        }

        try {
            await importInstructors(selectedInstructors).unwrap();
            toast.success("Instructors imported successfully!");
            setSelectedInstructors([]);
            refetch();
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to import instructors");
        }
    };

    // Group members by role
    const membersByRole = teamMembers.reduce((acc: Record<string, TeamMember[]>, member) => {
        if (!acc[member.role]) {
            acc[member.role] = [];
        }
        acc[member.role].push(member);
        return acc;
    }, {});

    // Sort members within each role by position
    Object.keys(membersByRole).forEach((role) => {
        membersByRole[role].sort((a, b) => a.position - b.position);
    });

    // Filter members by selected role
    const filteredMembers = selectedRole
        ? teamMembers.filter((m) => m.role === selectedRole).sort((a, b) => a.position - b.position)
        : [];

    return (
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl">
            {/* Header with Gradient */}
            <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl">
                <Button
                    variant="light"
                    startContent={<FaArrowLeft className="text-sm sm:text-base" />}
                    onPress={() => router.push("/admin")}
                    className="mb-2 sm:mb-3 md:mb-4 text-white hover:bg-white/20 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
                    size="sm"
                >
                    <span className="hidden xs:inline">Back to Dashboard</span>
                    <span className="xs:hidden">Back</span>
                </Button>
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm">
                        <FaUsers className="text-2xl sm:text-3xl md:text-4xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold truncate">
                            Team Management
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-white/90 mt-0.5 sm:mt-1 line-clamp-2">
                            Manage roles, members, and their display positions
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px] sm:min-h-[600px]">
                <Tabs
                    aria-label="Team Management Tabs"
                    color="primary"
                    variant="underlined"
                    classNames={{
                        tabList:
                            "gap-2 sm:gap-4 md:gap-6 w-full relative rounded-none p-0 border-b border-divider px-2 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-4 overflow-x-auto",
                        cursor: "w-full bg-emerald-600",
                        tab: "max-w-fit px-2 sm:px-3 md:px-4 h-12 sm:h-14 min-w-fit whitespace-nowrap",
                        tabContent:
                            "group-data-[selected=true]:text-emerald-600 font-bold text-xs sm:text-sm md:text-base lg:text-lg",
                    }}
                >
                    {/* Manage Roles Tab */}
                    <Tab
                        key="roles"
                        title={
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <FaTags className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Manage Roles</span>
                                <span className="sm:hidden">Roles</span>
                            </div>
                        }
                    >
                        <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
                            <Card className="shadow-lg border border-gray-100 mb-6">
                                <CardHeader className="flex gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-0">
                                    <div className="p-2 sm:p-3 bg-purple-100 text-purple-600 rounded-lg sm:rounded-xl">
                                        <FaTags size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                                            Add New Role
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                            Create custom roles for team members
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardBody className="space-y-4 p-3 sm:p-4 md:p-6">
                                    <div className="flex gap-3">
                                        <Input
                                            label="Role Name"
                                            placeholder="e.g. Senior Developer"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                            variant="bordered"
                                            className="flex-1"
                                        />
                                        <Button
                                            color="primary"
                                            onPress={handleAddRole}
                                            startContent={<FaPlus />}
                                            className="min-w-[120px]"
                                        >
                                            Add Role
                                        </Button>
                                    </div>
                                  
                                </CardBody>
                            </Card>

                            <Card className="shadow-lg border border-gray-100">
                                <CardHeader className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-4">
                                    <p className="text-base sm:text-lg font-bold text-gray-800">
                                        All Roles ({localRoles.length})
                                    </p>
                                    <p className="text-xs text-gray-500 ml-2">Drag to reorder</p>
                                </CardHeader>
                                <CardBody className="p-3 sm:p-4 md:p-6">
                                    {rolesLoading ? (
                                        <div className="h-40 flex items-center justify-center">
                                            <Spinner size="lg" label="Loading roles..." />
                                        </div>
                                    ) : localRoles.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 font-medium">
                                                No roles available. Add or seed roles.
                                            </p>
                                        </div>
                                    ) : (
                                        <DndContext
                                            sensors={roleSensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleRoleDragEnd}
                                        >
                                            <SortableContext
                                                items={localRoles.map((r) => r._id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {localRoles.map((role) => (
                                                        <SortableRoleItem
                                                            key={role._id}
                                                            role={role}
                                                            onDelete={handleDeleteRole}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    {/* Add Member Tab */}
                    <Tab
                        key="add"
                        title={
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <FaPlus className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Add New Member</span>
                                <span className="sm:hidden">Add</span>
                            </div>
                        }
                    >
                        <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
                            <Card className="shadow-lg border border-gray-100">
                                <CardHeader className="flex gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-0">
                                    <div className="p-2 sm:p-3 bg-emerald-100 text-emerald-600 rounded-lg sm:rounded-xl">
                                        <FaUserTie size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                                            New Team Member
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                            Add details manually for a custom team member.
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardBody className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Name"
                                            placeholder="e.g. Sarah Smith"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            variant="bordered"
                                            isRequired
                                        />
                                        <Select
                                            label="Role"
                                            placeholder="Select a role"
                                            selectedKeys={formData.role ? [formData.role] : []}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            variant="bordered"
                                            isRequired
                                        >
                                            {roles.map((role) => (
                                                <SelectItem key={role.name} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="LinkedIn (Optional)"
                                            placeholder="https://linkedin.com/in/..."
                                            value={formData.linkedIn}
                                            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                                            startContent={<FaLinkedin className="text-blue-600" />}
                                            variant="bordered"
                                        />
                                        <Input
                                            label="Twitter (Optional)"
                                            placeholder="https://twitter.com/..."
                                            value={formData.twitter}
                                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                            startContent={<FaTwitter className="text-sky-500" />}
                                            variant="bordered"
                                        />
                                    </div>
                                    <Input
                                        label="Bio (Optional)"
                                        placeholder="Brief professional description"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        variant="bordered"
                                    />

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                        <p className="text-sm font-semibold text-gray-600">Profile Picture URL *</p>
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            variant="bordered"
                                        />
                                        {imageUrl && (
                                            <Image
                                                src={imageUrl}
                                                alt="Preview"
                                                width={160}
                                                height={160}
                                                className="rounded-xl border"
                                            />
                                        )}
                                    </div>

                                    <Button
                                        size="lg"
                                        onPress={handleAddMember}
                                        isLoading={createLoading}
                                        className="w-full font-bold text-white shadow-lg bg-gradient-to-r from-emerald-500 to-green-600 min-h-[44px] text-sm sm:text-base"
                                        startContent={<FaPlus />}
                                    >
                                        Add Member
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    {/* Import Instructors Tab */}
                    <Tab
                        key="import"
                        title={
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <FaDownload className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Import Instructors</span>
                                <span className="sm:hidden">Import</span>
                            </div>
                        }
                    >
                        <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
                            <Card className="shadow-lg border border-gray-100">
                                <CardHeader className="flex gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 pb-0">
                                    <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl">
                                        <FaUpload size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                                            Import Approved Instructors
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                                            Quickly add existing instructors to your team showcase.
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-3 sm:p-4 md:p-6">
                                    {instructorsLoading ? (
                                        <div className="h-60 flex items-center justify-center">
                                            <Spinner size="lg" label="Loading instructors..." color="primary" />
                                        </div>
                                    ) : instructors.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 font-medium">
                                                No approved instructors available to import.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-gray-200 rounded-xl p-2 mb-4 bg-gray-50/50">
                                                {instructors.map((instructor) => (
                                                    <div
                                                        key={instructor._id}
                                                        className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer ${
                                                            selectedInstructors.includes(instructor._id)
                                                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                                                : "bg-white hover:bg-gray-50 border-gray-100"
                                                        }`}
                                                        onClick={() => {
                                                            if (selectedInstructors.includes(instructor._id)) {
                                                                setSelectedInstructors(
                                                                    selectedInstructors.filter((id) => id !== instructor._id)
                                                                );
                                                            } else {
                                                                setSelectedInstructors([
                                                                    ...selectedInstructors,
                                                                    instructor._id,
                                                                ]);
                                                            }
                                                        }}
                                                    >
                                                        <Checkbox
                                                            isSelected={selectedInstructors.includes(instructor._id)}
                                                            onValueChange={() => {}}
                                                            size="lg"
                                                            radius="full"
                                                        />
                                                        {instructor.profileImage ? (
                                                            <Image
                                                                src={instructor.profileImage.startsWith("http")
                                                                    ? instructor.profileImage
                                                                    : `data:image/jpeg;base64,${instructor.profileImage}`}
                                                                alt={instructor.name}
                                                                width={48}
                                                                height={48}
                                                                className="rounded-full border-2 border-white shadow-sm object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                                <FaUserTie />
                                                            </div>
                                                        )}
                                                        <span className="flex-1 font-semibold text-gray-800">
                                                            {instructor.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                size="lg"
                                                color="primary"
                                                onClick={handleImportInstructors}
                                                isLoading={importLoading}
                                                className="w-full font-bold shadow-lg min-h-[44px] text-sm sm:text-base"
                                                isDisabled={selectedInstructors.length === 0}
                                                startContent={<FaDownload />}
                                            >
                                                Import Selected ({selectedInstructors.length})
                                            </Button>
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </Tab>

                    {/* Team Members List Tab - Organized by Role */}
                    <Tab
                        key="list"
                        title={
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <FaUsers className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">All Members ({teamMembers.length})</span>
                                <span className="sm:hidden">List ({teamMembers.length})</span>
                            </div>
                        }
                    >
                        <div className="p-2 sm:p-4 md:p-6 lg:p-8">
                            {teamLoading ? (
                                <div className="h-60 flex items-center justify-center">
                                    <Spinner size="lg" label="Loading team..." color="primary" />
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-700">No team members yet</h3>
                                    <p className="text-gray-500 mt-2">Add or import members to display them here.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Select role to manage */}
                                    <Card className="shadow-lg border border-gray-100">
                                        <CardBody className="p-4">
                                            <Select
                                                label="Select Role to Manage"
                                                placeholder="Choose a role"
                                                selectedKeys={selectedRole ? [selectedRole] : []}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                variant="bordered"
                                            >
                                                {roles.map((role) => (
                                                    <SelectItem key={role.name} value={role.name}>
                                                        {role.name} ({membersByRole[role.name]?.length || 0} members)
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </CardBody>
                                    </Card>

                                    {selectedRole && filteredMembers.length > 0 && (
                                        <Card className="shadow-lg border border-gray-100">
                                            <CardHeader className="px-4 pt-4 pb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{selectedRole}</h3>
                                                <p className="text-sm text-gray-500 ml-2">Drag to reorder members</p>
                                            </CardHeader>
                                            <CardBody className="p-4">
                                                <DndContext
                                                    sensors={memberSensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={(event) => handleMemberDragEnd(event, filteredMembers)}
                                                >
                                                    <SortableContext
                                                        items={filteredMembers.map((m) => m._id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                            {filteredMembers.map((member) => (
                                                                <SortableMemberItem
                                                                    key={member._id}
                                                                    member={member}
                                                                    onEdit={setEditingMember}
                                                                    onDelete={handleDeleteMember}
                                                                    onToggleShow={handleToggleShowHome}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {selectedRole && filteredMembers.length === 0 && (
                                        <Card className="shadow-lg border border-gray-100">
                                            <CardBody className="text-center p-10">
                                                <p className="text-gray-500">No members found for this role.</p>
                                            </CardBody>
                                        </Card>
                                    )}

                                    {!selectedRole && (
                                        <Card className="shadow-lg border border-gray-100">
                                            <CardBody className="text-center p-10">
                                                <p className="text-gray-500">Select a role to view and manage members.</p>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditOpen || !!editingMember}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) setEditingMember(null);
                }}
                size="lg"
                scrollBehavior="inside"
                classNames={{
                    backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
                    wrapper: "overflow-y-auto",
                    base: "m-2 sm:m-4",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gray-50 border-b border-gray-100 text-base sm:text-lg">
                                Edit Team Member
                            </ModalHeader>
                            <ModalBody className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                                {editingMember && (
                                    <>
                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2">
                                            {(editingMember.image || editingMember.profileImage) && (
                                                <Image
                                                    src={(editingMember.image || editingMember.profileImage || "").startsWith("http")
                                                        ? (editingMember.image || editingMember.profileImage || "")
                                                        : `data:image/jpeg;base64,${editingMember.image || editingMember.profileImage}`}
                                                    alt={editingMember.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full shadow-sm border-2 border-white sm:w-16 sm:h-16 object-cover"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base sm:text-lg truncate">
                                                    {editingMember.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Updating profile details</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <Input
                                                label="Name"
                                                value={editingMember.name}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, name: e.target.value })
                                                }
                                                variant="bordered"
                                            />
                                            <Select
                                                label="Role"
                                                selectedKeys={[editingMember.role]}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, role: e.target.value })
                                                }
                                                variant="bordered"
                                            >
                                                {roles.map((role) => (
                                                    <SelectItem key={role.name} value={role.name}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                        <Input
                                            label="Bio"
                                            value={editingMember.bio || ""}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, bio: e.target.value })
                                            }
                                            variant="bordered"
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <Input
                                                label="LinkedIn URL"
                                                value={editingMember.linkedIn || ""}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, linkedIn: e.target.value })
                                                }
                                                variant="bordered"
                                                startContent={<FaLinkedin className="text-blue-600" />}
                                            />
                                            <Input
                                                label="Twitter URL"
                                                value={editingMember.twitter || ""}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, twitter: e.target.value })
                                                }
                                                variant="bordered"
                                                startContent={<FaTwitter className="text-sky-500" />}
                                            />
                                        </div>
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter className="bg-gray-50 border-t border-gray-100">
                                <Button color="default" variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleUpdateMember}
                                    isLoading={updateLoading}
                                    className="font-semibold shadow-md"
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
