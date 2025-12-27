"use client";

import React from "react";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { FaCheckCircle, FaTimesCircle, FaUserCheck, FaUserClock } from "react-icons/fa";
import {
    useGetAllInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
} from "@/redux/api/userApi";

export default function InstructorApprovalPage() {
    const { data: instructors, isLoading, refetch } = useGetAllInstructorsQuery(undefined);
    const [approveInstructor, { isLoading: isApproving }] = useApproveInstructorMutation();
    const [rejectInstructor, { isLoading: isRejecting }] = useRejectInstructorMutation();
    const [processingId, setProcessingId] = React.useState<string | null>(null);

    const handleApprove = async (instructorId: string) => {
        if (confirm("Are you sure you want to approve this instructor?")) {
            try {
                setProcessingId(instructorId);
                await approveInstructor(instructorId).unwrap();
                alert("Instructor approved successfully! An email has been sent to notify them.");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to approve instructor");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const handleReject = async (instructorId: string) => {
        if (confirm("Are you sure you want to reject/revoke approval for this instructor?")) {
            try {
                setProcessingId(instructorId);
                await rejectInstructor(instructorId).unwrap();
                alert("Instructor approval revoked! A notification email has been sent.");
                refetch();
            } catch (error: any) {
                alert(error?.data?.message || "Failed to reject instructor");
            } finally {
                setProcessingId(null);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading instructors...</p>
                </div>
            </div>
        );
    }

    const instructorList = instructors?.data || [];
    const pending = instructorList.filter((i: any) => !i.isApproved);
    const approved = instructorList.filter((i: any) => i.isApproved);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Instructor Management 👨‍🏫</h1>
                <p className="text-gray-600">
                    Approve or reject instructor applications
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Instructors</p>
                                <p className="text-3xl font-bold">{instructorList.length}</p>
                            </div>
                            <FaUserCheck className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Pending Approval</p>
                                <p className="text-3xl font-bold">{pending.length}</p>
                            </div>
                            <FaUserClock className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Approved</p>
                                <p className="text-3xl font-bold">{approved.length}</p>
                            </div>
                            <FaCheckCircle className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Pending Approvals */}
            {pending.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Pending Approvals 🕒</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pending.map((instructor: any) => (
                            <Card key={instructor._id} className="border-2 border-yellow-300">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{instructor.name}</h3>
                                            <p className="text-sm text-gray-600">{instructor.email}</p>
                                            {instructor.phone && (
                                                <p className="text-sm text-gray-600">{instructor.phone}</p>
                                            )}
                                        </div>
                                        <Chip color="warning" size="sm" variant="flat">
                                            Pending
                                        </Chip>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            color="success"
                                            size="sm"
                                            fullWidth
                                            startContent={<FaCheckCircle />}
                                            onPress={() => handleApprove(instructor._id)}
                                            isLoading={processingId === instructor._id && isApproving}
                                            isDisabled={processingId !== null}
                                        >
                                            {processingId === instructor._id && isApproving ? "Approving..." : "Approve"}
                                        </Button>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            fullWidth
                                            variant="flat"
                                            startContent={<FaTimesCircle />}
                                            onPress={() => handleReject(instructor._id)}
                                            isLoading={processingId === instructor._id && isRejecting}
                                            isDisabled={processingId !== null}
                                        >
                                            {processingId === instructor._id && isRejecting ? "Rejecting..." : "Reject"}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Approved Instructors */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Approved Instructors ✅</h2>
                {approved.length === 0 ? (
                    <Card>
                        <CardBody className="p-8 text-center text-gray-500">
                            No approved instructors yet.
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approved.map((instructor: any) => (
                            <Card key={instructor._id}>
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{instructor.name}</h3>
                                            <p className="text-sm text-gray-600">{instructor.email}</p>
                                            {instructor.phone && (
                                                <p className="text-sm text-gray-600">{instructor.phone}</p>
                                            )}
                                        </div>
                                        <Chip color="success" size="sm" variant="flat">
                                            Approved
                                        </Chip>
                                    </div>

                                    <Button
                                        color="danger"
                                        size="sm"
                                        fullWidth
                                        variant="flat"
                                        startContent={<FaTimesCircle />}
                                        onPress={() => handleReject(instructor._id)}
                                        isLoading={processingId === instructor._id && isRejecting}
                                        isDisabled={processingId !== null}
                                    >
                                        {processingId === instructor._id && isRejecting ? "Revoking..." : "Revoke Approval"}
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
