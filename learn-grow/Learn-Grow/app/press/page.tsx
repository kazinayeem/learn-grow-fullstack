"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Button, Chip, Spinner } from "@nextui-org/react";
import { defaultPressData } from "@/lib/pressData";
import { FaNewspaper, FaDownload } from "react-icons/fa";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function PressPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("press");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultPressData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Press Data..." /></div>;
    }

    const { hero, featured, assets } = data;

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

            <div className="container mx-auto max-w-7xl px-6 py-12">
                {/* Featured News */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <FaNewspaper className="text-primary" />
                        In The News
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featured.map((item, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardBody className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Chip size="sm" color="primary" variant="flat">{item.source}</Chip>
                                        <span className="text-sm text-gray-500">{item.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600 mb-6">{item.summary}</p>
                                    <Button
                                        as="a"
                                        href={item.link}
                                        variant="bordered"
                                        color="primary"
                                        size="sm"
                                    >
                                        Read Article
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Media Kit */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Media Kit & Brand Assets</h2>
                            <p className="text-gray-600">Download our official logos, brand guidelines, and leadership photos.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button color="secondary" startContent={<FaDownload />}>
                                Download Logo Pack
                            </Button>
                            <Button variant="bordered" startContent={<FaDownload />}>
                                Brand Guidelines
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
