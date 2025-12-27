"use client";
import React from "react";
import { BiRevision } from "react-icons/bi";
import { PiCertificateFill } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

const PlatformFeaturesSection = () => {
  const features = [
    {
      icon: <BiRevision />,
      title: "7 Day",
      subtitle: "রিফান্ড",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: <PiCertificateFill />,
      title: "100%",
      subtitle: "সার্টিফিকেট",
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Live",
      subtitle: "ক্লাস",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      icon: <MdPayment />,
      title: "Easy",
      subtitle: "পেমেন্ট",
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <section className="py-10 border-b border-gray-100 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {features.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform duration-300">
              {/* Icon Box */}
              <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                {item.icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-gray-500 font-medium font-siliguri">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeaturesSection;
