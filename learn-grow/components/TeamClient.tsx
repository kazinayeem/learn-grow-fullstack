"use client";

import React from "react";
import { Card, CardBody, Image, Chip } from "@nextui-org/react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";

interface TeamClientProps {
    content: any;
}

export default function TeamClient({ content }: TeamClientProps) {
    // Handle loading state
    if (!content) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Content loading...</p>
            </div>
        );
    }

    const { hero = {}, leadership = {}, instructors = [], executives = [] } = content;
    const { cLevel = [], teamLeads = [] } = leadership;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 sm:py-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-6xl text-center">
                    {hero.tag && (
                        <Chip className="mb-4 bg-white/20 text-white border border-white/30" variant="flat">
                            {hero.tag}
                        </Chip>
                    )}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                        {hero.title || "Meet Our Team"}
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
                        {hero.subtitle || "A talented team dedicated to transforming education"}
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
                {/* Leadership Section */}
                {(cLevel.length > 0 || teamLeads.length > 0) && (
                    <section className="mb-16 sm:mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                Leadership
                            </h2>
                            <p className="text-gray-600">Executive team and department heads</p>
                        </div>

                        {/* C-Level */}
                        {cLevel.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 text-center">
                                    Executive Leadership
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {cLevel.map((member: any, index: number) => (
                                        <Card key={index} className="hover:shadow-lg transition-shadow">
                                            <CardBody className="p-6 text-center">
                                                {member.img && (
                                                    <div className="mb-4 flex justify-center">
                                                        <Image
                                                            src={member.img}
                                                            alt={member.name}
                                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-200"
                                                        />
                                                    </div>
                                                )}
                                                {member.name && (
                                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                                        {member.name}
                                                    </h4>
                                                )}
                                                {member.role && (
                                                    <p className="text-blue-600 font-semibold mb-3 text-sm sm:text-base">
                                                        {member.role}
                                                    </p>
                                                )}
                                                {member.bio && (
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        {member.bio}
                                                    </p>
                                                )}
                                                {(member.linkedin || member.twitter) && (
                                                    <div className="flex justify-center gap-3 mt-4">
                                                        {member.linkedin && member.linkedin !== "#" && (
                                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-lg">
                                                                <FaLinkedin />
                                                            </a>
                                                        )}
                                                        {member.twitter && member.twitter !== "#" && (
                                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 text-lg">
                                                                <FaTwitter />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Leads */}
                        {teamLeads.length > 0 && (
                            <div>
                                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 text-center">
                                    Team Leads
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {teamLeads.map((member: any, index: number) => (
                                        <Card key={index} className="hover:shadow-lg transition-shadow border border-blue-100">
                                            <CardBody className="p-6 text-center">
                                                {member.img && (
                                                    <div className="mb-4 flex justify-center">
                                                        <Image
                                                            src={member.img}
                                                            alt={member.name}
                                                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-200"
                                                        />
                                                    </div>
                                                )}
                                                {member.name && (
                                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                                        {member.name}
                                                    </h4>
                                                )}
                                                {member.role && (
                                                    <p className="text-indigo-600 font-semibold mb-3 text-sm sm:text-base">
                                                        {member.role}
                                                    </p>
                                                )}
                                                {member.bio && (
                                                    <p className="text-gray-600 text-sm mb-4">
                                                        {member.bio}
                                                    </p>
                                                )}
                                                {(member.linkedin || member.twitter) && (
                                                    <div className="flex justify-center gap-3 mt-4">
                                                        {member.linkedin && member.linkedin !== "#" && (
                                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-lg">
                                                                <FaLinkedin />
                                                            </a>
                                                        )}
                                                        {member.twitter && member.twitter !== "#" && (
                                                            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 text-lg">
                                                                <FaTwitter />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Instructors Section */}
                {instructors.length > 0 && (
                    <section className="mb-16 sm:mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                Instructors
                            </h2>
                            <p className="text-gray-600">Expert educators and course creators</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {instructors.map((instructor: any, index: number) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardBody className="p-6 text-center">
                                        {instructor.img && (
                                            <div className="mb-4 flex justify-center">
                                                <Image
                                                    src={instructor.img}
                                                    alt={instructor.name}
                                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-green-200"
                                                />
                                            </div>
                                        )}
                                        {instructor.name && (
                                            <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                                {instructor.name}
                                            </h4>
                                        )}
                                        {instructor.role && (
                                            <p className="text-green-600 font-semibold mb-3 text-sm sm:text-base">
                                                {instructor.role}
                                            </p>
                                        )}
                                        {instructor.specialization && (
                                            <p className="text-gray-600 text-sm mb-2">
                                                <span className="font-semibold">Specialization:</span> {instructor.specialization}
                                            </p>
                                        )}
                                        {instructor.students && (
                                            <p className="text-gray-600 text-sm mb-4">
                                                <span className="font-semibold">{instructor.students}+</span> Students Taught
                                            </p>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Executives Section */}
                {executives.length > 0 && (
                    <section>
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                Executives
                            </h2>
                            <p className="text-gray-600">Department heads and key personnel</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {executives.map((executive: any, index: number) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardBody className="p-6 text-center">
                                        {executive.img && (
                                            <div className="mb-4 flex justify-center">
                                                <Image
                                                    src={executive.img}
                                                    alt={executive.name}
                                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-purple-200"
                                                />
                                            </div>
                                        )}
                                        {executive.name && (
                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                                {executive.name}
                                            </h4>
                                        )}
                                        {executive.role && (
                                            <p className="text-purple-600 font-semibold mb-2 text-sm">
                                                {executive.role}
                                            </p>
                                        )}
                                        {executive.department && (
                                            <p className="text-gray-600 text-xs mb-3 bg-gray-100 px-3 py-1 rounded-full inline-block">
                                                {executive.department}
                                            </p>
                                        )}
                                        {executive.linkedin && executive.linkedin !== "#" && (
                                            <a href={executive.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-lg mt-2 inline-block">
                                                <FaLinkedin />
                                            </a>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
