"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
    Input,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { FaEye, FaTrash, FaDownload } from "react-icons/fa";
import SweetAlert2 from "sweetalert2";

interface Contact {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    isRead?: boolean;
}

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [searchValue, setSearchValue] = useState("");

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${base.replace(/\/$/, "")}/contact`, {
                headers: {
                    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
                },
            });

            const json = await res.json();

            if (json.success && Array.isArray(json.data)) {
                setContacts(json.data);
            } else {
                setContacts([]);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            toast.error("Failed to fetch contacts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleViewContact = (contact: Contact) => {
        setSelectedContact(contact);
        onOpen();
        // Mark as read
        if (!contact.isRead) {
            markAsRead(contact._id);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${base.replace(/\/$/, "")}/contact/${id}/read`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
                },
            });

            if (res.ok) {
                setContacts(prev =>
                    prev.map(c => c._id === id ? { ...c, isRead: true } : c)
                );
            }
        } catch (error) {
            console.error("Error marking contact as read:", error);
        }
    };

    const handleDeleteContact = async (id: string) => {
        const result = await SweetAlert2.fire({
            title: "Delete Contact?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#f31260",
        });

        if (result.isConfirmed) {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${base.replace(/\/$/, "")}/contact/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
                    },
                });

                if (res.ok) {
                    setContacts(prev => prev.filter(c => c._id !== id));
                    toast.success("Contact deleted successfully");
                } else {
                    toast.error("Failed to delete contact");
                }
            } catch (error) {
                console.error("Error deleting contact:", error);
                toast.error("Failed to delete contact");
            }
        }
    };

    const handleDownloadCSV = () => {
        if (contacts.length === 0) {
            toast.error("No contacts to export");
            return;
        }

        const headers = ["First Name", "Last Name", "Email", "Subject", "Message", "Date"];
        const rows = contacts.map(c => [
            c.firstName,
            c.lastName,
            c.email,
            c.subject,
            c.message.replace(/"/g, '""'),
            new Date(c.createdAt).toLocaleString(),
        ]);

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.subject.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" label="Loading contacts..." />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Contact Submissions</h1>
                        <p className="text-gray-600 mt-1">Manage all contact form submissions</p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<FaDownload />}
                        onClick={handleDownloadCSV}
                    >
                        Export CSV
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <CardBody className="space-y-4">
                    <Input
                        placeholder="Search by name, email, or subject..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        isClearable
                        variant="bordered"
                    />

                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No contacts found</p>
                        </div>
                    ) : (
                        <Table aria-label="Contact submissions">
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>EMAIL</TableColumn>
                                <TableColumn>SUBJECT</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts.map(contact => (
                                    <TableRow key={contact._id}>
                                        <TableCell>
                                            {contact.firstName} {contact.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                                {contact.email}
                                            </a>
                                        </TableCell>
                                        <TableCell>{contact.subject}</TableCell>
                                        <TableCell>
                                            {new Date(contact.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {contact.isRead ? (
                                                <Chip size="sm" variant="flat" color="default">Read</Chip>
                                            ) : (
                                                <Chip size="sm" variant="flat" color="warning">New</Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    startContent={<FaEye />}
                                                    onClick={() => handleViewContact(contact)}
                                                />
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="danger"
                                                    startContent={<FaTrash />}
                                                    onClick={() => handleDeleteContact(contact._id)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Contact Details
                            </ModalHeader>
                            <ModalBody>
                                {selectedContact && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">First Name</label>
                                                <p className="text-gray-900">{selectedContact.firstName}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600">Last Name</label>
                                                <p className="text-gray-900">{selectedContact.lastName}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Email</label>
                                            <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                                                {selectedContact.email}
                                            </a>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Subject</label>
                                            <p className="text-gray-900">{selectedContact.subject}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Message</label>
                                            <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-600">Submitted</label>
                                            <p className="text-gray-900">
                                                {new Date(selectedContact.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
