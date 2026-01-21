"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import {
  FaRocket,
  FaGraduationCap,
  FaBuilding,
  FaGlobeAsia,
  FaLightbulb,
  FaUsers,
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";

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
    "এডভান্সড প্রজেক্ট চ্যালেঞ্জ",
    
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white text-gray-900 relative overflow-hidden">
      {/* Animated Background Accents */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-blue-100 backdrop-blur-sm px-4 py-2 rounded-full mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <FaRocket className="text-blue-600" />
            </motion.div>
            <span className="text-sm font-semibold text-blue-900">
              আমাদের ভবিষ্যৎ পরিকল্পনা
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900"
          >
            আমাদের পরবর্তী লক্ষ্য
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto"
          >
            আমরা স্বপ্ন দেখি বাংলাদেশকে প্রযুক্তি শিক্ষায় দক্ষিণ এশিয়ার
            নেতৃত্বে নিয়ে যেতে
          </motion.p>
        </motion.div>

        {/* Targets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {targets.map((target, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <Card className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                <CardBody className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${target.color} flex items-center justify-center text-white mb-4 shadow-lg`}
                  >
                    {target.icon}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-bold text-blue-600 mb-2 tracking-wider"
                  >
                    TARGET {target.year}
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {target.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {target.description}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 mb-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardBody className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                >
                  <FaUsers className="text-2xl text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  আসছে শীঘ্রই...
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    className="flex items-center gap-3 bg-white p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                      <FaCheck className="text-white text-sm" />
                    </motion.div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {feature}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Vision Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-500 via-blue-400 to-purple-600 border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <CardBody className="p-8 sm:p-10 lg:p-12">
              <motion.h3
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                🌟 আমাদের ভিশন 2030 🌟
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white text-base sm:text-lg font-medium mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                বাংলাদেশের প্রতিটি শিক্ষার্থীকে বিশ্বমানের প্রযুক্তি শিক্ষা
                প্রদান করা এবং দেশকে গ্লোবাল টেক হাব হিসেবে গড়ে তোলা। আমরা চাই
                প্রতিটি বাচ্চা যেন রোবটিক্স, এআই এবং প্রোগ্রামিং শিখে নিজের
                স্বপ্ন পূরণ করতে পারে।
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row flex-wrap justify-center gap-4"
              >
                {["🎯 ১ লক্ষ+ শিক্ষার্থী", "🏫 ৫০০+ পার্টনার স্কুল", "🌍 ১০+ দেশ"].map(
                  (stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl font-bold text-base sm:text-lg text-white shadow-lg hover:shadow-xl hover:bg-white/30 transition-all cursor-pointer"
                    >
                      {stat}
                    </motion.div>
                  )
                )}
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <motion.p
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4"
          >
            এই যাত্রায় আমাদের সাথে থাকুন!
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-base sm:text-lg text-gray-700"
          >
            আপনার সাপোর্ট এবং অংশগ্রহণই আমাদের শক্তি
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
