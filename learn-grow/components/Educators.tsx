"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/bundle";
import { PiCertificateFill } from "react-icons/pi";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { BiLogoReact } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@nextui-org/react";

import { useGetHomeTeamMembersQuery } from "@/redux/api/teamApi";

type TeamMember = {
    image: string;
    name: string;
    role: string;
    bio?: string;
    linkedIn?: string;
    twitter?: string;
};

const Educators: React.FC = () => {
    // Query team members that are visible on home
    const { data: teamData, isLoading } = useGetHomeTeamMembersQuery();
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter only instructors
    const teamMembers = ((teamData?.data || []) as TeamMember[]).filter(
        (member) => member.role.toLowerCase() === "instructor"
    );

    const handleMemberClick = (member: TeamMember) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    if (isLoading) return null; // Or skeleton

    return (
        <section className="py-10 px-6 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">
                        The Team
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                        Our Experts
                    </h2>
                </div>

                {/* Educators Slider */}
                <Swiper
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 40,
                        },
                    }}
                    className="!pb-10"
                    loop={teamMembers.length > 3}
                    modules={[Autoplay]}
                    slidesPerView={1}
                    spaceBetween={30}
                >
                    {teamMembers.length > 0 ? (
                        teamMembers.map((member: TeamMember, index: number) => {
                            // Get first word of name for fallback
                            const firstName = member.name.split(' ')[0];
                            // Check if image is available
                            const hasImage = member.image && member.image.trim() !== '';

                            return (
                                <SwiperSlide key={index} className="h-full">
                                    <div 
                                        onClick={() => handleMemberClick(member)}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 h-96 flex flex-col items-center justify-between cursor-pointer transform hover:scale-105 hover:-translate-y-2"
                                    >
                                        {/* Profile Image or Name with Logo */}
                                        <div className="flex justify-center mb-6 h-32 flex-shrink-0">
                                            {hasImage ? (
                                                <Image
                                                    alt={`${member.name}'s profile`}
                                                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                                                    height={128}
                                                    src={member.image}
                                                    width={128}
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-4 border-primary-100 flex flex-col items-center justify-center text-white">
                                                    <BiLogoReact className="text-4xl mb-2" />
                                                    <span className="text-sm font-bold text-center px-2 line-clamp-2">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="text-center space-y-3 flex-grow flex flex-col items-center w-full justify-center">
                                            {/* Name */}
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                                                {member.name}
                                            </h3>

                                            {/* Bio if available */}
                                            {member.bio && (
                                                <p className="text-gray-600 text-xs line-clamp-2">{member.bio}</p>
                                            )}

                                            {/* Designation Badge */}
                                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                <PiCertificateFill className="text-sm" />
                                                <span>{member.role}</span>
                                            </div>
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex justify-center gap-3 pt-4 flex-shrink-0">
                                            {member.linkedIn && (
                                                <Link
                                                    aria-label="LinkedIn"
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition-all duration-300"
                                                    href={member.linkedIn}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FaLinkedin className="text-lg" />
                                                </Link>
                                            )}
                                            {member.twitter && (
                                                <Link
                                                    aria-label="Twitter"
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-400 hover:text-white transition-all duration-300"
                                                    href={member.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FaTwitter className="text-lg" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600">No team members to display</p>
                        </div>
                    )}
                </Swiper>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="lg"
                backdrop="blur"
                classNames={{
                    backdrop: "bg-black/50 backdrop-opacity-40",
                    wrapper: "overflow-y-auto",
                    base: "m-2 sm:m-4 max-w-2xl",
                    header: "border-b border-gray-200",
                    body: "py-4 sm:py-6",
                    closeButton: "text-gray-500 hover:text-gray-700 active:scale-90 transition-transform",
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: 50,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    },
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-xl sm:text-2xl font-bold text-gray-900">
                                {selectedMember?.name}
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Profile Section */}
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
                                        {/* Image */}
                                        <div className="flex-shrink-0">
                                            {selectedMember?.image && selectedMember.image.trim() !== '' ? (
                                                <Image
                                                    alt={selectedMember.name}
                                                    src={selectedMember.image}
                                                    width={150}
                                                    height={150}
                                                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-primary-200 shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-4 border-primary-200 flex items-center justify-center text-white shadow-lg">
                                                    <BiLogoReact className="text-6xl" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 text-center sm:text-left space-y-2">
                                            {/* Role Badge */}
                                            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold text-sm mx-auto sm:mx-0">
                                                <PiCertificateFill className="text-lg" />
                                                <span>{selectedMember?.role}</span>
                                            </div>

                                            {/* Bio */}
                                            {selectedMember?.bio && (
                                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                                                    {selectedMember.bio}
                                                </p>
                                            )}

                                            {/* Social Links */}
                                            <div className="flex justify-center sm:justify-start gap-3 pt-2">
                                                {selectedMember?.linkedIn && (
                                                    <Link
                                                        aria-label="LinkedIn"
                                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                                                        href={selectedMember.linkedIn}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FaLinkedin className="text-xl" />
                                                    </Link>
                                                )}
                                                {selectedMember?.twitter && (
                                                    <Link
                                                        aria-label="Twitter"
                                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-100 hover:bg-sky-500 text-sky-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                                                        href={selectedMember.twitter}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <FaTwitter className="text-xl" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                    {/* Additional Info */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
                                        <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide">About</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {selectedMember?.bio ||
                                                "A dedicated instructor committed to delivering excellence in education and helping students achieve their goals."}
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="primary"
                                    size="lg"
                                    onPress={onClose}
                                    className="w-full sm:w-auto font-semibold"
                                    radius="lg"
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
};

export default Educators;
