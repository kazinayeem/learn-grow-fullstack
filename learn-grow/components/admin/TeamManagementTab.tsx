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
    Checkbox,
    Avatar,
    Select,
    SelectItem,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
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

// Predefined role options
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
    "Support Manager",
];

export default function TeamManagementTab() {
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
        imageUrl: "",
    });

    const teamMembers = (teamData?.data || []) as TeamMember[];
    const instructors = (instructorsData?.data || []) as Instructor[];

    // Handle Add Member
    const handleAddMember = async () => {
        if (!formData.name || !formData.role || !formData.imageUrl) {
            toast.error("Name, Role, and Image URL are required");
            return;
        }

        // Validate URL format
        try {
            new URL(formData.imageUrl);
        } catch {
            toast.error("Please enter a valid image URL");
            return;
        }

        try {
            await createTeamMember({
                name: formData.name,
                role: formData.role,
                image: formData.imageUrl,
                linkedIn: formData.linkedIn,
                twitter: formData.twitter,
                bio: formData.bio,
            }).unwrap();

            toast.success("Team member added successfully!");
            setFormData({ name: "", role: "", linkedIn: "", twitter: "", bio: "", imageUrl: "" });
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
        <div className="space-y-6 py-6">
            <Tabs color="primary" aria-label="Team Management Tabs">
                {/* Add Member Tab */}
                <Tab key="add" title="➕ Add Manual Member">
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Add New Team Member</p>
                                <p className="text-sm text-gray-600">Add instructor manually with name and image (simple form, no rich text)</p>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input
                                label="Name"
                                placeholder="Enter member name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Select
                                label="Role"
                                placeholder="Select a role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                {TEAM_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Input
                                label="LinkedIn URL (Optional)"
                                placeholder="https://linkedin.com/in/..."
                                value={formData.linkedIn}
                                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                            />
                            <Input
                                label="Twitter URL (Optional)"
                                placeholder="https://twitter.com/..."
                                value={formData.twitter}
                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                            />
                            <Input
                                label="Bio (Optional)"
                                placeholder="Brief description"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />

                            <div>
                                <p className="text-sm font-semibold mb-3">Profile Picture URL</p>
                                <Input
                                    label="Image URL"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    description="Enter a direct link to the profile image"
                                />
                                {formData.imageUrl && (
                                    <div className="mt-3">
                                        <Image
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            width={150}
                                            height={150}
                                            className="rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                color="success"
                                onClick={handleAddMember}
                                isLoading={createLoading}
                                className="w-full"
                            >
                                Add Member
                            </Button>
                        </CardBody>
                    </Card>
                </Tab>

                {/* Import Instructors Tab */}
                <Tab key="import" title="📥 Import from Instructors">
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Import Approved Instructors</p>
                                <p className="text-sm text-gray-600">Search and select instructors from your approved list to add to team</p>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            {instructorsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner />
                                </div>
                            ) : instructors.length === 0 ? (
                                <p className="text-gray-600">No approved instructors found</p>
                            ) : (
                                <>
                                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                        {instructors.map((instructor) => {
                                            return (
                                                <div
                                                    key={instructor._id}
                                                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-white bg-gray-50 hover:shadow transition-all cursor-pointer"
                                                    onClick={() => {
                                                        if (selectedInstructors.includes(instructor._id)) {
                                                            setSelectedInstructors(
                                                                selectedInstructors.filter((id) => id !== instructor._id)
                                                            );
                                                        } else {
                                                            setSelectedInstructors([...selectedInstructors, instructor._id]);
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        isSelected={selectedInstructors.includes(instructor._id)}
                                                        onChange={() => {}}
                                                    />
                                                    <Avatar
                                                        src={instructor.profileImage}
                                                        name={instructor.name.charAt(0)}
                                                        size="sm"
                                                        className="flex-shrink-0"
                                                    />
                                                    <span className="flex-1 font-medium">{instructor.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        color="primary"
                                        onClick={handleImportInstructors}
                                        isLoading={importLoading}
                                        className="w-full"
                                    >
                                        Import Selected ({selectedInstructors.length})
                                    </Button>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Tab>

                {/* Team Members List Tab */}
                <Tab key="list" title={`📋 Team Members (${teamMembers.length})`}>
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Manage Team Members</p>
                                <p className="text-sm text-gray-600">Edit, delete, or toggle home page visibility for each member</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {teamLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner />
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <p className="text-gray-600">No team members yet. Add one from the "Add Manual Member" or "Import from Instructors" tab.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teamMembers.map((member) => (
                                        <Card key={member._id} className="relative hover:shadow-lg transition-shadow">
                                            <CardBody className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg">{member.name}</h3>
                                                        <p className="text-sm text-gray-600">{member.role}</p>
                                                    </div>
                                                    <Chip
                                                        startContent={member.showOnHome ? <FaEye /> : <FaEyeSlash />}
                                                        variant="flat"
                                                        color={member.showOnHome ? "success" : "default"}
                                                        size="sm"
                                                    >
                                                        {member.showOnHome ? "Visible" : "Hidden"}
                                                    </Chip>
                                                </div>

                                                {member.image && member.image !== "placeholder" ? (
                                                    <Image
                                                        src={member.image}
                                                        alt={member.name}
                                                        width="100%"
                                                        height={150}
                                                        className="rounded-lg object-cover"
                                                        fallbackSrc="https://via.placeholder.com/150?text=No+Image"
                                                    />
                                                ) : (
                                                    <div className="w-full h-[150px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-6xl font-bold text-gray-400">{member.name.charAt(0)}</span>
                                                    </div>
                                                )}

                                                {member.bio && <p className="text-sm text-gray-600 italic">{member.bio}</p>}

                                                <div className="flex gap-2">
                                                    {member.linkedIn && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            as="a"
                                                            href={member.linkedIn}
                                                            target="_blank"
                                                            variant="light"
                                                            className="text-blue-600"
                                                        >
                                                            in
                                                        </Button>
                                                    )}
                                                    {member.twitter && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            as="a"
                                                            href={member.twitter}
                                                            target="_blank"
                                                            variant="light"
                                                            className="text-black"
                                                        >
                                                            𝕏
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t">
                                                    <Button
                                                        startContent={<FaEye />}
                                                        size="sm"
                                                        variant="flat"
                                                        color={member.showOnHome ? "warning" : "success"}
                                                        onClick={() => handleToggleShowHome(member._id, member.showOnHome)}
                                                    >
                                                        {member.showOnHome ? "Hide" : "Show"}
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        onClick={() => {
                                                            setEditingMember(member);
                                                            setIsEditOpen(true);
                                                        }}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        color="danger"
                                                        onClick={() => handleDeleteMember(member._id, member.name)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Tab>
            </Tabs>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Edit Team Member</ModalHeader>
                            <ModalBody className="space-y-4">
                                {editingMember && (
                                    <>
                                        <Input
                                            label="Name"
                                            value={editingMember.name}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, name: e.target.value })
                                            }
                                        />
                                        <Select
                                            label="Role"
                                            value={editingMember.role}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, role: e.target.value })
                                            }
                                        >
                                            {TEAM_ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Input
                                            label="Bio"
                                            value={editingMember.bio || ""}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, bio: e.target.value })
                                            }
                                        />
                                        <Input
                                            label="LinkedIn URL"
                                            value={editingMember.linkedIn || ""}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, linkedIn: e.target.value })
                                            }
                                        />
                                        <Input
                                            label="Twitter URL"
                                            value={editingMember.twitter || ""}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, twitter: e.target.value })
                                            }
                                        />
                                        <div>
                                            <p className="text-sm font-semibold mb-2">Image URL</p>
                                            <Input
                                                label="Image URL"
                                                placeholder="https://example.com/image.jpg"
                                                value={editingMember.image || ""}
                                                onChange={(e) =>
                                                    setEditingMember({ ...editingMember, image: e.target.value })
                                                }
                                            />
                                            {editingMember.image && (
                                                <div className="mt-3">
                                                    <Image
                                                        src={editingMember.image}
                                                        alt={editingMember.name}
                                                        width={100}
                                                        height={100}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleUpdateMember}
                                    isLoading={updateLoading}
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
