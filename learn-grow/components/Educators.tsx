"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/bundle";
import { PiCertificateFill } from "react-icons/pi";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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

    const teamMembers = (teamData?.data || []) as TeamMember[];

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
                        teamMembers.map((member: TeamMember, index: number) => (
                            <SwiperSlide key={index} className="h-auto">
                                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100 h-full flex flex-col items-center">
                                    {/* Profile Image */}
                                    <div className="flex justify-center mb-6">
                                        <Image
                                            alt={`${member.name}'s profile`}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                                            height={120}
                                            src={`data:image/jpeg;base64,${member.image}`}
                                            width={120}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="text-center space-y-4 flex-grow flex flex-col items-center w-full">
                                        {/* Name */}
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {member.name}
                                        </h3>

                                        {/* Bio if available */}
                                        {member.bio && (
                                            <p className="text-gray-600 text-sm">{member.bio}</p>
                                        )}

                                        {/* Designation Badge */}
                                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                                            <PiCertificateFill className="text-lg" />
                                            <span>{member.role}</span>
                                        </div>

                                        {/* Social Links */}
                                        <div className="flex justify-center gap-3 pt-4 mt-auto">
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
                                </div>
                            </SwiperSlide>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600">No team members to display</p>
                        </div>
                    )}
                </Swiper>
            </div>
        </section>
    );
};

export default Educators;
