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
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { FaTrash, FaEdit, FaDownload, FaEye, FaEyeSlash } from "react-icons/fa";
import ImageUploadBase64 from "@/components/admin/ImageUploadBase64";
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

export default function TeamManagementPage() {
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState(0);

    const teamMembers = (teamData?.data || []) as TeamMember[];
    const instructors = (instructorsData?.data || []) as Instructor[];

    // Handle Add Member
    const handleAddMember = async () => {
        if (!formData.name || !formData.role || !selectedImage) {
            toast.error("Name, Role, and Image are required");
            return;
        }

        try {
            await createTeamMember({
                name: formData.name,
                role: formData.role,
                image: selectedImage,
                linkedIn: formData.linkedIn,
                twitter: formData.twitter,
                bio: formData.bio,
            }).unwrap();

            toast.success("Team member added successfully!");
            setFormData({ name: "", role: "", linkedIn: "", twitter: "", bio: "" });
            setSelectedImage(null);
            setImageSize(0);
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
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold">Team Management</h1>
                <p className="text-gray-600 mt-2">Manage "Our Experts" section displayed on home page</p>
            </div>

            <Tabs color="primary" aria-label="Team Management Tabs">
                {/* Add Member Tab */}
                <Tab key="add" title="Add Manual Member">
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Add New Team Member</p>
                                <p className="text-sm text-gray-600">Add instructor manually with name and image</p>
                            </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input
                                label="Name"
                                placeholder="Enter member name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Role"
                                placeholder="e.g., Senior Instructor, Course Creator"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
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
                                <p className="text-sm font-semibold mb-3">Profile Picture</p>
                                <ImageUploadBase64
                                    onImageSelected={(base64, size) => {
                                        setSelectedImage(base64);
                                        setImageSize(size);
                                    }}
                                    preview={selectedImage ?? undefined}
                                    isLoading={createLoading}
                                />
                                {imageSize > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">Size: {(imageSize / 1024).toFixed(2)} KB</p>
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
                <Tab key="import" title="Import from Instructors">
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Import Approved Instructors</p>
                                <p className="text-sm text-gray-600">Select instructors from your approved instructors list</p>
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
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {instructors.map((instructor) => (
                                            <div
                                                key={instructor._id}
                                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                                            >
                                                <Checkbox
                                                    isSelected={selectedInstructors.includes(instructor._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedInstructors([...selectedInstructors, instructor._id]);
                                                        } else {
                                                            setSelectedInstructors(
                                                                selectedInstructors.filter((id) => id !== instructor._id)
                                                            );
                                                        }
                                                    }}
                                                />
                                                {instructor.profileImage && (
                                                    <Image
                                                        src={`data:image/jpeg;base64,${instructor.profileImage}`}
                                                        alt={instructor.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full"
                                                    />
                                                )}
                                                <span className="flex-1">{instructor.name}</span>
                                            </div>
                                        ))}
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
                <Tab key="list" title={`Team Members (${teamMembers.length})`}>
                    <Card>
                        <CardHeader className="flex gap-3">
                            <div>
                                <p className="text-lg font-semibold">Manage Team Members</p>
                                <p className="text-sm text-gray-600">Edit, delete, or toggle home page visibility</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {teamLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner />
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <p className="text-gray-600">No team members yet. Add one from the "Add Manual Member" tab.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teamMembers.map((member) => (
                                        <Card key={member._id} className="relative">
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

                                                {member.image && (
                                                    <Image
                                                        src={`data:image/jpeg;base64,${member.image}`}
                                                        alt={member.name}
                                                        width="100%"
                                                        height={150}
                                                        className="rounded-lg object-cover"
                                                    />
                                                )}

                                                {member.bio && <p className="text-sm text-gray-600">{member.bio}</p>}

                                                <div className="flex gap-2">
                                                    {member.linkedIn && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            as="a"
                                                            href={member.linkedIn}
                                                            target="_blank"
                                                            variant="light"
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
                                                        >
                                                            𝕏
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 pt-2">
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
                                        <Input
                                            label="Role"
                                            value={editingMember.role}
                                            onChange={(e) =>
                                                setEditingMember({ ...editingMember, role: e.target.value })
                                            }
                                        />
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
                                            <p className="text-sm font-semibold mb-2">Current Image</p>
                                            <Image
                                                src={`data:image/jpeg;base64,${editingMember.image}`}
                                                alt={editingMember.name}
                                                width={100}
                                                height={100}
                                                className="rounded-lg"
                                            />
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
