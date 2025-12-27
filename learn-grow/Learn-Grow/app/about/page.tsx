"use client";
import React from "react";
import { Card, CardBody, Image, Spinner } from "@nextui-org/react";
import { defaultAboutData } from "@/lib/aboutData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function AboutPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("about");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultAboutData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading About..." /></div>;
    }

    const { hero, mission, features } = data;

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {hero.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    {hero.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div>
                    <Image
                        src={mission.image}
                        alt="Team working together"
                        className="rounded-2xl shadow-2xl"
                    />
                </div>
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800">{mission.title}</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {mission.p1}
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {mission.p2}
                    </p>
                </div>
            </div>

            <div className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((item: any, index: number) => (
                        <Card key={index} className="p-6 hover:-translate-y-2 transition-transform duration-300">
                            <CardBody className="text-center">
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
