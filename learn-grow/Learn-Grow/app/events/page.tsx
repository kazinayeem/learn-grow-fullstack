"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Chip, Spinner } from "@nextui-org/react";
import { defaultEventsData } from "@/lib/eventsData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function EventsPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("events");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultEventsData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Events..." /></div>;
    }

    const { hero, upcomingEvents, pastEvents } = data;

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
                {/* Upcoming Events */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map((event, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex-col items-start p-6 pb-0">
                                    <Chip color={event.color as any} size="sm" className="mb-3">
                                        {event.type}
                                    </Chip>
                                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                </CardHeader>
                                <CardBody className="pt-4">
                                    <div className="space-y-2 mb-6 text-sm">
                                        <p className="flex items-center">
                                            <span className="text-lg mr-2">📅</span>
                                            <span>{event.date}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <span className="text-lg mr-2">🕐</span>
                                            <span>{event.time}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <span className="text-lg mr-2">📍</span>
                                            <span>{event.location}</span>
                                        </p>
                                    </div>
                                    <Button color="primary" variant="flat" className="w-full">
                                        Register Now
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Past Events */}
                <div>
                    <h2 className="text-3xl font-bold mb-8">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pastEvents.map((event, index) => (
                            <Card key={index} className="bg-gray-50">
                                <CardBody className="flex flex-row items-center justify-between p-6">
                                    <div>
                                        <h3 className="font-bold text-lg">{event.title}</h3>
                                        <p className="text-sm text-gray-600">{event.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Attendees</p>
                                        <p className="text-2xl font-bold text-primary">{event.attendees}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <Card className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardBody className="p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Want to host an event with us?</h2>
                        <p className="text-xl mb-8 text-blue-100">
                            We collaborate with schools, companies, and communities.
                        </p>
                        <Button size="lg" color="default" variant="solid">
                            Contact Us
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
