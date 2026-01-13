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

            <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl">
                    {/* Leadership Section */}
                    {(cLevel.length > 0 || teamLeads.length > 0) && (
                        <section className="mb-16 sm:mb-20">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                    Leadership
                                </h2>
                                <p className="text-gray-600">Executive team and department heads</p>
                            </div>

                            {/* C-Level - Line 1 */}
                            {cLevel.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-8 text-center px-2">
                                        Line 1: CEO, CTO, COO
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                        {cLevel.map((member: any, index: number) => (
                                            <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                                                <CardBody className="p-4 sm:p-6 text-center">
                                                    {(member.image || member.img) && (
                                                        <div className="mb-4 flex justify-center">
                                                            <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                                                                <Image
                                                                    src={member.image || member.img}
                                                                    alt={member.name}
                                                                    className="w-full h-full rounded-full object-cover border-4 border-blue-200"
                                                                    isBlurred
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {member.name && (
                                                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                                            {member.name}
                                                        </h4>
                                                    )}
                                                    {member.role && (
                                                        <p className="text-blue-600 font-semibold mb-3 text-sm sm:text-base">
                                                            {member.role}
                                                        </p>
                                                    )}
                                                    {member.bio && (
                                                        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                                                            {member.bio}
                                                        </p>
                                                    )}
                                                    {(member.linkedIn || member.linkedin || member.twitter) && (
                                                        <div className="flex justify-center gap-3 mt-4">
                                                            {(member.linkedIn || member.linkedin) && (member.linkedIn || member.linkedin) !== "#" && (
                                                                <a href={member.linkedIn || member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-lg">
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

                            {/* Team Leads - Line 2 */}
                            {teamLeads.length > 0 && (
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-8 text-center px-2">
                                        Line 2: Team Leads (Technical Lead, Operation Manager, Marketing Head, etc)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {teamLeads.map((member: any, index: number) => (
                                            <Card key={index} className="hover:shadow-lg transition-shadow border border-blue-100 h-full">
                                                <CardBody className="p-4 sm:p-5 text-center">
                                                    {(member.image || member.img) && (
                                                        <div className="mb-3 flex justify-center">
                                                            <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                                                                <Image
                                                                    src={member.image || member.img}
                                                                    alt={member.name}
                                                                    className="w-full h-full rounded-full object-cover border-4 border-indigo-200"
                                                                    isBlurred
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {member.name && (
                                                        <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1">
                                                            {member.name}
                                                        </h4>
                                                    )}
                                                    {member.role && (
                                                        <p className="text-indigo-600 font-semibold mb-2 text-xs sm:text-sm">
                                                            {member.role}
                                                        </p>
                                                    )}
                                                    {member.bio && (
                                                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                                                            {member.bio}
                                                        </p>
                                                    )}
                                                    {(member.linkedIn || member.linkedin || member.twitter) && (
                                                        <div className="flex justify-center gap-2 mt-2">
                                                            {(member.linkedIn || member.linkedin) && (member.linkedIn || member.linkedin) !== "#" && (
                                                                <a href={member.linkedIn || member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                                                    <FaLinkedin />
                                                                </a>
                                                            )}
                                                            {member.twitter && member.twitter !== "#" && (
                                                                <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 text-sm">
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
                                    Section 2: Instructors
                                </h2>
                                <p className="text-gray-600">Expert educators and course creators</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {instructors.map((instructor: any, index: number) => (
                                    <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                                        <CardBody className="p-4 sm:p-6 text-center">
                                            {(instructor.image || instructor.img) && (
                                                <div className="mb-4 flex justify-center">
                                                    <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                                                        <Image
                                                            src={instructor.image || instructor.img}
                                                            alt={instructor.name}
                                                            className="w-full h-full rounded-full object-cover border-4 border-green-200"
                                                            isBlurred
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {instructor.name && (
                                                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                                                    {instructor.name}
                                                </h4>
                                            )}
                                            {instructor.role && (
                                                <p className="text-green-600 font-semibold mb-3 text-sm sm:text-base">
                                                    {instructor.role}
                                                </p>
                                            )}
                                            {instructor.bio && (
                                                <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                                                    {instructor.bio}
                                                </p>
                                            )}
                                            {(instructor.linkedIn || instructor.linkedin || instructor.twitter) && (
                                                <div className="flex justify-center gap-3 mt-4">
                                                    {(instructor.linkedIn || instructor.linkedin) && (instructor.linkedIn || instructor.linkedin) !== "#" && (
                                                        <a href={instructor.linkedIn || instructor.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-lg">
                                                            <FaLinkedin />
                                                        </a>
                                                    )}
                                                    {instructor.twitter && instructor.twitter !== "#" && (
                                                        <a href={instructor.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 text-lg">
                                                            <FaTwitter />
                                                        </a>
                                                    )}
                                                </div>
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
                                    Section 3: Executives
                                </h2>
                                <p className="text-gray-600">Department heads and key personnel</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {executives.map((executive: any, index: number) => (
                                    <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                                        <CardBody className="p-3 sm:p-4 text-center">
                                            {(executive.image || executive.img) && (
                                                <div className="mb-3 flex justify-center">
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                                        <Image
                                                            src={executive.image || executive.img}
                                                            alt={executive.name}
                                                            className="w-full h-full rounded-full object-cover border-4 border-purple-200"
                                                            isBlurred
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {executive.name && (
                                                <h4 className="text-xs sm:text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                                                    {executive.name}
                                                </h4>
                                            )}
                                            {executive.role && (
                                                <p className="text-purple-600 font-semibold mb-2 text-xs">
                                                    {executive.role}
                                                </p>
                                            )}
                                            {executive.bio && (
                                                <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                                                    {executive.bio}
                                                </p>
                                            )}
                                            {(executive.linkedIn || executive.linkedin) && (executive.linkedIn || executive.linkedin) !== "#" && (
                                                <a href={executive.linkedIn || executive.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-2">
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
        </div>
    );
}
