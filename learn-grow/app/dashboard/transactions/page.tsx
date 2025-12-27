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
    Button,
    Input,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaSearch, FaDownload, FaReceipt, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

export default function TransactionsPage() {
    const payments = useSelector((state: RootState) => state.payment.payments);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredTransactions = payments.filter((payment: any) => {
        const matchesSearch =
            payment.courseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "completed" && payment.status === "completed") ||
            (statusFilter === "pending" && payment.status === "pending") ||
            (statusFilter === "failed" && payment.status === "failed");

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: payments.length,
        completed: payments.filter((p: any) => p.status === "completed").length,
        pending: payments.filter((p: any) => p.status === "pending").length,
        failed: payments.filter((p: any) => p.status === "failed").length,
        totalAmount: payments
            .filter((p: any) => p.status === "completed")
            .reduce((sum: number, p: any) => sum + p.amount, 0),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "pending":
                return "warning";
            case "failed":
                return "danger";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <FaCheckCircle />;
            case "pending":
                return <FaClock />;
            case "failed":
                return <FaTimesCircle />;
            default:
                return null;
        }
    };

    const handleDownloadInvoice = (transactionId: string) => {
        alert(`Downloading invoice for ${transactionId}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
                <p className="text-gray-600">View all your payment transactions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaReceipt className="text-2xl text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaCheckCircle className="text-2xl text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <FaClock className="text-2xl text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <FaTimesCircle className="text-2xl text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Failed</p>
                                <p className="text-2xl font-bold">{stats.failed}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-primary-500 to-purple-500">
                    <CardBody className="p-6 text-white">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Spent</p>
                            <p className="text-2xl font-bold">{stats.totalAmount} BDT</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="mb-6 space-y-4">
                <Input
                    placeholder="Search by transaction ID or course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<FaSearch className="text-gray-400" />}
                    size="lg"
                />

                <Tabs
                    selectedKey={statusFilter}
                    onSelectionChange={(key) => setStatusFilter(key as string)}
                    color="primary"
                    size="lg"
                >
                    <Tab key="all" title={`All (${stats.total})`} />
                    <Tab key="completed" title={`Completed (${stats.completed})`} />
                    <Tab key="pending" title={`Pending (${stats.pending})`} />
                    <Tab key="failed" title={`Failed (${stats.failed})`} />
                </Tabs>
            </div>

            {filteredTransactions.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-16">
                        <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No Transactions Found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? "No transactions match your search"
                                : "You haven't made any payments yet"}
                        </p>
                        {!searchQuery && (
                            <Button
                                color="primary"
                                size="lg"
                                onPress={() => (window.location.href = "/courses")}
                            >
                                Browse Courses
                            </Button>
                        )}
                    </CardBody>
                </Card>
            ) : (
                <Card>
                    <CardBody className="p-0">
                        <Table aria-label="Transactions table" removeWrapper>
                            <TableHeader>
                                <TableColumn>TRANSACTION ID</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>AMOUNT</TableColumn>
                                <TableColumn>METHOD</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-mono font-semibold text-sm">
                                                    {payment.transactionId || payment.id}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Course ID: {payment.courseId.slice(0, 12)}...
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {new Date(payment.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-primary">{payment.amount} BDT</p>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat">
                                                {payment.method?.toUpperCase() || "N/A"}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getStatusColor(payment.status) as any}
                                                variant="flat"
                                                startContent={getStatusIcon(payment.status)}
                                                size="sm"
                                            >
                                                {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {payment.status === "completed" && (
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    startContent={<FaDownload />}
                                                    onPress={() => handleDownloadInvoice(payment.transactionId)}
                                                >
                                                    Invoice
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
