"use client";

import React, { useState } from "react";
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
    Switch,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
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
    FaCheck,
    FaUpload
} from "react-icons/fa";
// Removed base64 image uploader in favor of URL input
const TEAM_ROLES = [
    "Founder & CEO",
    "Co-Founder",
    "Head of Content",
    "Lead Instructor",
    "Senior Instructor",
    "Instructor",
    "Course Developer",
    "Technical Lead",
    "Operations Manager",
    "Support Manager"
];

import {
    useGetAllTeamMembersQuery,
    useCreateTeamMemberMutation,
    useUpdateTeamMemberMutation,
    useDeleteTeamMemberMutation,
    useToggleShowHomeMutation,
    useGetApprovedInstructorsForImportQuery,
    useImportInstructorsMutation,
} from "@/redux/api/teamApi";
import SweetAlert2 from "sweetalert2";
import { useRouter } from "next/navigation";

interface TeamMember {
    _id: string;
    name: string;
    role: string;
    image: string;
    imageSize: number;
    linkedIn?: string;
    twitter?: string;
    bio?: string;
    showOnHome: boolean;
    userId?: string;
}

interface Instructor {
    _id: string;
    name: string;
    profileImage?: string;
}

export default function TeamManagementPage() {
    const router = useRouter();
    // Queries and Mutations
    const { data: teamData, isLoading: teamLoading, refetch } = useGetAllTeamMembersQuery(undefined);
    const { data: instructorsData, isLoading: instructorsLoading } = useGetApprovedInstructorsForImportQuery(undefined);

    const [createTeamMember, { isLoading: createLoading }] = useCreateTeamMemberMutation();
    const [updateTeamMember, { isLoading: updateLoading }] = useUpdateTeamMemberMutation();
    const [deleteTeamMember] = useDeleteTeamMemberMutation();
    const [toggleShowHome] = useToggleShowHomeMutation();
    const [importInstructors, { isLoading: importLoading }] = useImportInstructorsMutation();

    // State
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

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
    const instructors = (instructorsData?.data || []) as Instructor[];

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
                            Manage "Our Experts" section displayed on home page
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
                        tabList: "gap-2 sm:gap-4 md:gap-6 w-full relative rounded-none p-0 border-b border-divider px-2 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-4 overflow-x-auto",
                        cursor: "w-full bg-emerald-600",
                        tab: "max-w-fit px-2 sm:px-3 md:px-4 h-12 sm:h-14 min-w-fit whitespace-nowrap",
                        tabContent: "group-data-[selected=true]:text-emerald-600 font-bold text-xs sm:text-sm md:text-base lg:text-lg"
                    }}
                >
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
                                        <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">New Team Member</p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Add details manually for a custom team member.</p>
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
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            variant="bordered"
                                            isRequired
                                        >
                                            {TEAM_ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
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
                                        <p className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Import Approved Instructors</p>
                                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">Quickly add existing instructors to your team showcase.</p>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-3 sm:p-4 md:p-6">
                                    {instructorsLoading ? (
                                        <div className="h-60 flex items-center justify-center">
                                            <Spinner size="lg" label="Loading instructors..." color="primary" />
                                        </div>
                                    ) : instructors.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 font-medium">No approved instructors available to import.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-gray-200 rounded-xl p-2 mb-4 bg-gray-50/50">
                                                {instructors.map((instructor) => (
                                                    <div
                                                        key={instructor._id}
                                                        className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer ${selectedInstructors.includes(instructor._id)
                                                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                                                : "bg-white hover:bg-gray-50 border-gray-100"
                                                            }`}
                                                        onClick={() => {
                                                            if (selectedInstructors.includes(instructor._id)) {
                                                                setSelectedInstructors(selectedInstructors.filter(id => id !== instructor._id));
                                                            } else {
                                                                setSelectedInstructors([...selectedInstructors, instructor._id]);
                                                            }
                                                        }}
                                                    >
                                                        <Checkbox
                                                            isSelected={selectedInstructors.includes(instructor._id)}
                                                            pointerEvents="none"
                                                            size="lg"
                                                            radius="full"
                                                        />
                                                        {instructor.profileImage ? (
                                                            <Image
                                                                src={`data:image/jpeg;base64,${instructor.profileImage}`}
                                                                alt={instructor.name}
                                                                width={48}
                                                                height={48}
                                                                className="rounded-full border-2 border-white shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                                <FaUserTie />
                                                            </div>
                                                        )}
                                                        <span className="flex-1 font-semibold text-gray-800">{instructor.name}</span>
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

                    {/* Team Members List Tab */}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                    {teamMembers.map((member) => (
                                        <Card key={member._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-100">
                                            <CardBody className="p-0">
                                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                                    {member.image ? (
                                                        <Image
                                                            src={member.image.startsWith("http") ? member.image : `data:image/jpeg;base64,${member.image}`}
                                                            alt={member.name}
                                                            width="100%"
                                                            height="100%"
                                                            classNames={{
                                                                img: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            }}
                                                            radius="none"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                            <FaUserTie size={48} />
                                                        </div>
                                                    )}
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
                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">
                                                            {member.bio}
                                                        </p>
                                                    )}

                                                    <div className="flex gap-2 mb-4">
                                                        {member.linkedIn && (
                                                            <a href={member.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                                                <FaLinkedin />
                                                            </a>
                                                        )}
                                                        {member.twitter && (
                                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors">
                                                                <FaTwitter />
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-gray-100">
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color={member.showOnHome ? "default" : "success"}
                                                            onClick={() => handleToggleShowHome(member._id, member.showOnHome)}
                                                            className="w-full min-h-[36px] text-xs px-1"
                                                        >
                                                            {member.showOnHome ? "Hide" : "Show"}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color="primary"
                                                            onClick={() => {
                                                                setEditingMember(member);
                                                                setIsEditOpen(true);
                                                            }}
                                                            isIconOnly
                                                            className="w-full min-h-[36px]"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color="danger"
                                                            onClick={() => handleDeleteMember(member._id, member.name)}
                                                            isIconOnly
                                                            className="w-full min-h-[36px]"
                                                        >
                                                            <FaTrash className="text-sm" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                size="lg"
                scrollBehavior="inside"
                classNames={{
                    backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
                    wrapper: "overflow-y-auto",
                    base: "m-2 sm:m-4"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="bg-gray-50 border-b border-gray-100 text-base sm:text-lg">Edit Team Member</ModalHeader>
                            <ModalBody className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                                {editingMember && (
                                    <>
                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2">
                                            {editingMember.image && (
                                                <Image
                                                    src={editingMember.image.startsWith("http") ? editingMember.image : `data:image/jpeg;base64,${editingMember.image}`}
                                                    alt={editingMember.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full shadow-sm border-2 border-white sm:w-16 sm:h-16"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-base sm:text-lg truncate">{editingMember.name}</p>
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
                                                value={editingMember.role}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, role: e.target.value })
                                                }
                                                variant="bordered"
                                            >
                                                {TEAM_ROLES.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
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
