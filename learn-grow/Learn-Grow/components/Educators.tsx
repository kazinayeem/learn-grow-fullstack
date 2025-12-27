"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/bundle";
import { PiCertificateFill } from "react-icons/pi";
import { MdEmail } from "react-icons/md";
import { FaGithub, FaDribbble, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

import { defaultTeamData } from "@/lib/teamData";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

type Educator = {
  imageURL: string;
  name: string;
  email: string;
  designation: string;
};

const Educators: React.FC = () => {
  // Query "team" to ensure we get the same data as the Team Page
  const { data: apiData, isLoading } = useGetSiteContentQuery("team");

  let educators: Educator[] = [];

  const content = apiData?.data?.content;

  // Check if we have dynamic data in the expected 'team' structure
  if (content && (content.leadership || content.instructors)) {
    const leadership = content.leadership || [];
    const instructors = content.instructors || [];
    const teamMembers = [...leadership, ...instructors];

    educators = teamMembers.map((member: any) => ({
      imageURL: member.img,
      name: member.name,
      email: member.email || "contact@learnandgrow.io",
      designation: member.role
    }));
  } else {
    // Fallback to static defaultTeamData
    const teamMembers = [...defaultTeamData.leadership, ...defaultTeamData.instructors];
    educators = teamMembers.map(member => ({
      imageURL: member.img,
      name: member.name,
      email: member.email || "contact@learnandgrow.io",
      designation: member.role
    }));
  }

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
          loop={true}
          modules={[Autoplay]}
          slidesPerView={1}
          spaceBetween={30}
        >
          {educators.length > 0 &&
            educators.map((educator: Educator, index: number) => (
              <SwiperSlide key={index} className="h-auto">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100 h-full flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <Image
                      alt={`${educator.name}'s profile`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                      height={120}
                      src={educator.imageURL}
                      width={120}
                    />
                  </div>

                  {/* Info */}
                  <div className="text-center space-y-4 flex-grow flex flex-col items-center w-full">
                    {/* Name */}
                    <h3 className="text-2xl font-bold text-gray-900">
                      {educator.name}
                    </h3>

                    {/* Email */}
                    <p className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                      <MdEmail className="text-primary-500" />
                      {educator.email}
                    </p>

                    {/* Designation Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                      <PiCertificateFill className="text-lg" />
                      <span>{educator.designation}</span>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center gap-3 pt-4 mt-auto">
                      <Link
                        aria-label="GitHub"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300"
                        href="#"
                      >
                        <FaGithub className="text-lg" />
                      </Link>
                      <Link
                        aria-label="Dribbble"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-pink-500 hover:text-white transition-all duration-300"
                        href="#"
                      >
                        <FaDribbble className="text-lg" />
                      </Link>
                      <Link
                        aria-label="Twitter"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-400 hover:text-white transition-all duration-300"
                        href="#"
                      >
                        <FaTwitter className="text-lg" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Educators;
