"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Avatar, Chip, Spinner } from "@nextui-org/react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { defaultTeamData } from "@/lib/teamData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function TeamPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("team");

    // Use API data if available, otherwise default
    const data = (apiData?.data?.content && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultTeamData;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" label="Loading Team..." /></div>;
    }

    const { hero, leadership, instructors, operations } = data;

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
                    <Chip className="mb-4 bg-white/10 text-white border border-white/20" variant="flat">{hero.tag}</Chip>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        {hero.title}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        {hero.subtitle}
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 py-12">
                {/* Leadership */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">Leadership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {leadership.map((member, index) => (
                            <Card key={index} className="shadow-lg h-full">
                                <CardBody className="p-8 text-center flex flex-col items-center h-full">
                                    <Avatar
                                        src={member.img}
                                        className="w-32 h-32 mx-auto mb-6"
                                        isBordered
                                        color="primary"
                                    />
                                    <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                                    <div className="mb-4 flex justify-center w-full">
                                        <Chip color="primary" variant="flat">
                                            {member.role}
                                        </Chip>
                                    </div>
                                    <p className="text-gray-600 mb-6 flex-grow">{member.bio}</p>
                                    <div className="flex justify-center gap-4 mt-auto">
                                        <a href={member.linkedin} className="text-blue-600 hover:text-blue-800 text-2xl">
                                            <FaLinkedin />
                                        </a>
                                        <a href={member.twitter} className="text-blue-400 hover:text-blue-600 text-2xl">
                                            <FaTwitter />
                                        </a>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Instructors */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">Our Instructors</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {instructors.map((instructor, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                                <CardBody className="text-center p-6 flex flex-col items-center h-full">
                                    <Avatar
                                        src={instructor.img}
                                        className="w-24 h-24 mx-auto mb-4"
                                        isBordered
                                        color="success"
                                    />
                                    <h3 className="font-bold text-lg mb-1">{instructor.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{instructor.role}</p>
                                    <div className="flex justify-center w-full mb-3">
                                        <Chip size="sm" color="secondary" variant="flat">
                                            {instructor.specialization}
                                        </Chip>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 mt-auto w-full">
                                        <p className="text-xs text-gray-600">Students Taught</p>
                                        <p className="text-2xl font-bold text-primary">{instructor.students}+</p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Operations Team */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">Operations & Support</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {operations.map((member, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardBody className="flex flex-row items-center gap-4 p-6">
                                    <Avatar
                                        src={member.img}
                                        className="w-20 h-20"
                                        isBordered
                                        color="warning"
                                    />
                                    <div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <p className="text-gray-600">{member.role}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Join Team CTA */}
                <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <CardBody className="p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">Want to Join Our Team?</h2>
                        <p className="text-xl mb-8 text-purple-100">
                            We're always looking for passionate educators and tech enthusiasts.
                        </p>
                        <a
                            href="/careers"
                            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            View Open Positions →
                        </a>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
