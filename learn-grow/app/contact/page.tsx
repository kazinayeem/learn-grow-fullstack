"use client";

import React, { useEffect, useState } from "react";
import { Input, Textarea, Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { defaultContactData } from "@/lib/contactData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function ContactPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("contact");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultContactData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Contact Info..." /></div>;
    }

    const { hero, info, form } = data;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your message! We will get back to you soon.");
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
                    <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">
                        {hero.tag}
                    </Chip>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        {hero.title}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {hero.subtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
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
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-6 md:p-8">
                            <h2 className="text-2xl font-bold mb-6">{form.title}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="First Name" placeholder="John" variant="bordered" isRequired />
                                    <Input label="Last Name" placeholder="Doe" variant="bordered" isRequired />
                                </div>
                                <Input type="email" label="Email Address" placeholder="john@example.com" variant="bordered" isRequired />
                                <Input label="Subject" placeholder="How can we help?" variant="bordered" isRequired />
                                <Textarea label="Message" placeholder="Write your message here..." minRows={4} variant="bordered" isRequired />

                                <Button type="submit" color="primary" size="lg" className="w-full md:w-auto px-12 font-semibold shadow-lg">
                                    {form.btnText}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
