"use client";

import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import {
  FaRocket,
  FaGraduationCap,
  FaBuilding,
  FaGlobeAsia,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";

export default function NextTarget() {
  const targets = [
    {
      icon: <FaGraduationCap className="text-3xl" />,
      title: "১০,০০০+ শিক্ষার্থী",
      description:
        "২০২৬ সালের মধ্যে ১০,০০০+ শিক্ষার্থীকে রোবটিক্স এবং প্রোগ্রামিং শিক্ষা প্রদান",
      color: "from-blue-500 to-cyan-500",
      year: "2026",
    },
    {
      icon: <FaBuilding className="text-3xl" />,
      title: "১০০+ স্কুল পার্টনারশিপ",
      description: "দেশের সকল জেলায় স্কুল এবং প্রতিষ্ঠানের সাথে কোলাবরেশন",
      color: "from-purple-500 to-pink-500",
      year: "2027",
    },
    {
      icon: <FaGlobeAsia className="text-3xl" />,
      title: "আন্তর্জাতিক সম্প্রসারণ",
      description: "দক্ষিণ এশিয়ার অন্যান্য দেশে আমাদের কোর্স পৌঁছে দেওয়া",
      color: "from-green-500 to-emerald-500",
      year: "2028",
    },
    {
      icon: <FaLightbulb className="text-3xl" />,
      title: "এআই এবং মেশিন লার্নিং",
      description:
        "নতুন কোর্স: আর্টিফিশিয়াল ইন্টেলিজেন্স এবং মেশিন লার্নিং বাংলায়",
      color: "from-orange-500 to-red-500",
      year: "2026",
    },
  ];

  const upcomingFeatures = [
    "মোবাইল অ্যাপ লঞ্চ (iOS & Android)",
    "ইন্টারঅ্যাক্টিভ AR/VR লার্নিং",
    "গ্লোবাল রোবটিক্স কম্পিটিশন",
    "কর্পোরেট ট্রেনিং প্রোগ্রাম",
    "ফ্রি কমিউনিটি ওয়ার্কশপ",
    "অফলাইন লার্নিং সেন্টার",
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white text-gray-900 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <FaRocket className="text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              আমাদের ভবিষ্যৎ পরিকল্পনা
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            আমাদের পরবর্তী লক্ষ্য
          </h2>
          <p className="text-lg text-white max-w-3xl mx-auto">
            আমরা স্বপ্ন দেখি বাংলাদেশকে প্রযুক্তি শিক্ষায় দক্ষিণ এশিয়ার
            নেতৃত্বে নিয়ে যেতে
          </p>
        </div>

        {/* Targets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {targets.map((target, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <CardBody className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${target.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                >
                  {target.icon}
                </div>
                <div className="text-xs font-bold text-yellow-400 mb-2">
                  TARGET {target.year}
                </div>
                <h3 className="text-lg font-bold mb-3">{target.title}</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {target.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Upcoming Features */}
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 mb-12">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <FaUsers className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold">আসছে শীঘ্রই...</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <p className="font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Vision Statement */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 border-0 shadow-2xl">
            <CardBody className="p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                🌟 আমাদের ভিশন 2030 🌟
              </h3>
              <p className="text-white text-lg font-medium mb-6 max-w-3xl mx-auto leading-relaxed">
                বাংলাদেশের প্রতিটি শিক্ষার্থীকে বিশ্বমানের প্রযুক্তি শিক্ষা
                প্রদান করা এবং দেশকে গ্লোবাল টেক হাব হিসেবে গড়ে তোলা। আমরা চাই
                প্রতিটি বাচ্চা যেন রোবটিক্স, এআই এবং প্রোগ্রামিং শিখে নিজের
                স্বপ্ন পূরণ করতে পারে।
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-lg">
                  🎯 ১ লক্ষ+ শিক্ষার্থী
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-lg">
                  🏫 ৫০০+ পার্টনার স্কুল
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-lg">
                  🌍 ১০+ দেশ
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-xl font-semibold mb-4">
            এই যাত্রায় আমাদের সাথে থাকুন!
          </p>
          <p className="text-blue-200 mb-6">
            আপনার সাপোর্ট এবং অংশগ্রহণই আমাদের শক্তি
          </p>
        </div>
      </div>
    </section>
  );
}
