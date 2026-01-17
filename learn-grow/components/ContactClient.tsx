"use client";

import React, { useState } from "react";
import { Input, Textarea, Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import toast from "react-hot-toast";

interface ContactClientProps {
    content: any;
}

export default function ContactClient({ content }: ContactClientProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
    });

    // Handle loading state
    if (!content) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading Contact Info..." />
            </div>
        );
    }

    const { hero = {}, info = {}, form = {} } = content;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${base.replace(/\/$/, "")}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const json = await res.json();

            if (json.success) {
                toast.success("Thank you for your message! We will get back to you soon.");
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    subject: "",
                    message: "",
                });
            } else {
                toast.error(json.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Error submitting contact form:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <div
                className="text-white py-20 px-6"
                style={{
                    background: 'linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)'
                }}
            >
                <div className="container mx-auto max-w-7xl text-center">
                    {hero.tag && (
                        <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">
                            {hero.tag}
                        </Chip>
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        {hero.title || "Contact Us"}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {hero.subtitle || "We're here to help. Get in touch with us today."}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        {info.email && (
                            <Card className="p-4 bg-primary-50 hover:shadow-md transition-shadow">
                                <CardBody className="flex flex-row items-center gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-primary text-2xl">
                                        <MdEmail />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Email Us</h3>
                                        <p className="text-primary font-medium">{info.email}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {info.phone && (
                            <Card className="p-4 bg-secondary-50 hover:shadow-md transition-shadow">
                                <CardBody className="flex flex-row items-center gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-secondary text-2xl">
                                        <MdPhone />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Call Us</h3>
                                        <p className="text-secondary font-medium">{info.phone}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}

                        {info.address && (
                            <Card className="p-4 bg-success-50 hover:shadow-md transition-shadow">
                                <CardBody className="flex flex-row items-center gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-success text-2xl">
                                        <MdLocationOn />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Visit Us</h3>
                                        <p className="text-success-700 font-medium">{info.address}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-6">{form.title || "Send us a Message"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="First Name" 
                                        placeholder="John" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        isRequired
                                        size="lg"
                                        variant="bordered"
                                    />
                                    <Input 
                                        label="Last Name" 
                                        placeholder="Doe" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        isRequired
                                        size="lg"
                                        variant="bordered"
                                    />
                                </div>

                                <Input 
                                    label="Email" 
                                    placeholder="john@example.com" 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    isRequired
                                    size="lg"
                                    variant="bordered"
                                />

                                <Input 
                                    label="Subject" 
                                    placeholder="What's this about?" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    isRequired
                                    size="lg"
                                    variant="bordered"
                                />

                                <Textarea 
                                    label="Message" 
                                    placeholder="Tell us more about your inquiry..." 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    isRequired
                                    minRows={6}
                                    variant="bordered"
                                />

                                <Button 
                                    color="primary" 
                                    size="lg" 
                                    className="w-full font-semibold"
                                    type="submit"
                                    isLoading={isSubmitting}
                                    isDisabled={isSubmitting}
                                >
                                    {form.btnText || "Send Message"}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
