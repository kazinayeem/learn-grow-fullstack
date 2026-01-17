"use client";

import React, { useState } from "react";
import { Card, CardBody, Image, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FaLinkedin, FaTwitter, FaTimes } from "react-icons/fa";

interface TeamClientProps {
    content: any;
}

interface TeamMember {
    _id: string;
    image?: string;
    name: string;
    role: string;
    bio?: string;
    linkedIn?: string;
    linkedin?: string;
    twitter?: string;
}

export default function TeamClient({ content }: TeamClientProps) {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleMemberClick = (member: TeamMember) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const MemberCard = ({ member, color }: { member: TeamMember; color: string }) => {
        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <Card
                isPressable
                onClick={() => handleMemberClick(member)}
                className={`hover:shadow-xl transition-all cursor-pointer h-full w-full sm:w-[280px] flex-shrink-0 hover:scale-105`}
            >
                <CardBody className="p-4 sm:p-6 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                            {member.image ? (
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full rounded-full object-cover border-4"
                                    style={{ borderColor: color }}
                                    isBlurred
                                />
                            ) : (
                                <div
                                    className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-3xl sm:text-4xl border-4"
                                    style={{ backgroundColor: color, borderColor: color }}
                                >
                                    {getInitials(member.name || 'U')}
                                </div>
                            )}
                        </div>
                    </div>
                    {member.name && (
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                            {member.name}
                        </h4>
                    )}
                    {member.role && (
                        <p className="font-semibold mb-3 text-sm sm:text-base" style={{ color }}>
                            {member.role}
                        </p>
                    )}
                    {member.bio && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                            {member.bio}
                        </p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">Click to view details</p>
                </CardBody>
            </Card>
        );
    };

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
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                                    Leadership
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-4 rounded-full"></div>
                                <p className="text-gray-600 text-lg">Guiding vision and strategic direction</p>
                            </div>

                            {/* C-Level - Line 1 */}
                            {cLevel.length > 0 && (
                                <div className="mb-16">
                                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-6xl mx-auto">
                                        {cLevel.map((member: any, index: number) => (
                                            <MemberCard key={index} member={member} color="#0066cc" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team Leads - Line 2 */}
                            {teamLeads.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {teamLeads.map((member: any, index: number) => (
                                            <MemberCard key={index} member={member} color="#6f46c1" />
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
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                                    Instructors
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mb-4 rounded-full"></div>
                                <p className="text-gray-600 text-lg">Expert educators and course creators</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {instructors.map((instructor: any, index: number) => (
                                    <MemberCard key={index} member={instructor} color="#16a34a" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Executives Section */}
                    {executives.length > 0 && (
                        <section>
                            <div className="text-center mb-12">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
                                    Executives
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-4 rounded-full"></div>
                                <p className="text-gray-600 text-lg">Core team members and specialists</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {executives.map((executive: any, index: number) => (
                                    <MemberCard key={index} member={executive} color="#a855f7" />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Member Details Modal */}
            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="lg" backdrop="blur">
                <ModalContent className="max-w-2xl">
                    {(onClose) => {
                        const getInitials = (name: string) => {
                            return name
                                .split(' ')
                                .map(word => word[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);
                        };

                        return (
                            <>
                                <ModalHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                                    <h2 className="text-xl font-bold">Team Member Details</h2>
                                </ModalHeader>
                                <ModalBody className="py-8">
                                    {selectedMember && (
                                        <div className="flex flex-col items-center gap-6">
                                            {/* Profile Image or Initials */}
                                            <div className="flex justify-center">
                                                <div className="w-40 h-40">
                                                    {selectedMember.image ? (
                                                        <Image
                                                            src={selectedMember.image}
                                                            alt={selectedMember.name}
                                                            className="w-full h-full rounded-full object-cover border-4 border-blue-200 shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-5xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-blue-200 shadow-lg">
                                                            {getInitials(selectedMember.name || 'U')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        {/* Name and Role */}
                                        <div className="text-center">
                                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                                {selectedMember.name}
                                            </h3>
                                            <p className="text-lg font-semibold text-blue-600 mb-4">
                                                {selectedMember.role}
                                            </p>
                                        </div>

                                        {/* Bio */}
                                        {selectedMember.bio && (
                                            <div className="w-full bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-700 text-center leading-relaxed">
                                                    {selectedMember.bio}
                                                </p>
                                            </div>
                                        )}

                                        {/* Social Links */}
                                        {(selectedMember.linkedIn || selectedMember.linkedin || selectedMember.twitter) && (
                                            <div className="flex gap-4 mt-4">
                                                {(selectedMember.linkedIn || selectedMember.linkedin) && 
                                                 (selectedMember.linkedIn || selectedMember.linkedin) !== "#" && (
                                                    <a
                                                        href={selectedMember.linkedIn || selectedMember.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors font-semibold"
                                                    >
                                                        <FaLinkedin size={20} />
                                                        <span className="hidden sm:inline">LinkedIn</span>
                                                    </a>
                                                )}
                                                {selectedMember.twitter && selectedMember.twitter !== "#" && (
                                                    <a
                                                        href={selectedMember.twitter}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-600 rounded-lg transition-colors font-semibold"
                                                    >
                                                        <FaTwitter size={20} />
                                                        <span className="hidden sm:inline">Twitter</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="bg-gray-50 rounded-b-lg">
                                <Button color="primary" onClick={onClose} className="w-full sm:w-auto">
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    );
                }}
                </ModalContent>
            </Modal>
        </div>
    );
}
