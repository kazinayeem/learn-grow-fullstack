"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { FaStar, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function WhyBestCourses() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "কেন আমাদের কোর্স সবচেয়ে ভালো?",
      answer: "আমরা হ্যান্ডস-অন প্রজেক্ট-বেসড লার্নিং পদ্ধতি অনুসরণ করি। প্রতিটি ক্লাসে শিক্ষার্থীরা বাস্তব প্রজেক্ট তৈরি করে যা তাদের দক্ষতা বৃদ্ধি করে। আমাদের কোর্স মডিউলগুলো আন্তর্জাতিক মানসম্পন্ন এবং বাংলাদেশের শিক্ষার্থীদের জন্য বিশেষভাবে ডিজাইন করা।"
    },
    {
      question: "আমাদের শিক্ষকরা কেন বিশেষ?",
      answer: "আমাদের সকল শিক্ষক রোবটিক্স ও প্রোগ্রামিংয়ে অভিজ্ঞ। তারা শুধু পড়ান না, বরং শিক্ষার্থীদের সঙ্গে হাতে-কলমে প্রজেক্টে কাজ করেন এবং শেখার পুরো পথে দিকনির্দেশনা দেন।"
    },
    {
      question: "কোর্সের পরে কী সুবিধা পাবেন?",
      answer: "কোর্স সম্পন্ন করার পরে আপনি পাবেন সার্টিফিকেট, লাইফটাইম কোর্স অ্যাক্সেস, প্রজেক্ট পোর্টফোলিও এবং ক্যারিয়ার সাপোর্ট। এছাড়াও আমাদের কমিউনিটিতে অন্যান্য শিক্ষার্থীদের সাথে নেটওয়ার্কিং এর সুযোগ পাবেন।"
    },
    {
      question: "আমাদের কিট কেন অনন্য?",
      answer: "আমাদের STEM কিটগুলো আন্তর্জাতিক মানের কম্পোনেন্ট দিয়ে তৈরি এবং প্রতিটি কিটের সাথে আসে বাংলা টিউটোরিয়াল, অনলাইন সাপোর্ট এবং প্রজেক্ট গাইড। শিক্ষার্থীরা ঘরে বসেই রোবট তৈরি করতে পারবে।"
    },
    {
      question: "অনলাইন ক্লাস কি লাইভ হয়?",
      answer: "হ্যাঁ! আমাদের সকল ক্লাস লাইভ এবং ইন্টারঅ্যাক্টিভ। শিক্ষার্থীরা সরাসরি প্রশ্ন করতে পারবে এবং ইন্সট্রাক্টরের সাথে প্রজেক্ট তৈরি করতে পারবে। ক্লাস মিস হলে রেকর্ডিং দেখার সুবিধাও আছে।"
    },
    {
      question: "বাচ্চারা কি সহজেই শিখতে পারবে?",
      answer: "অবশ্যই! আমাদের কোর্স মডিউল বয়স অনুযায়ী তৈরি করা। ৬ বছরের বাচ্চা থেকে শুরু করে ১৮+ যে কেউ আমাদের কোর্স করতে পারবে। আমরা খেলার মাধ্যমে শেখানোর পদ্ধতি ব্যবহার করি যা মজার এবং কার্যকর।"
    }
  ];

  const features = [
    "১০০% বাংলা ভাষায় শিক্ষা",
    "লাইভ ইন্টারঅ্যাক্টিভ ক্লাস",
    "আন্তর্জাতিক মানের সার্টিফিকেট",
    "লাইফটাইম কোর্স অ্যাক্সেস",
    "হ্যান্ডস-অন প্রজেক্ট",
    "ক্যারিয়ার গাইডেন্স সাপোর্ট"
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-1 mb-4"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
              >
                <FaStar className="text-yellow-400 text-xl sm:text-2xl" />
              </motion.div>
            ))}
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            কেন আমাদের কোর্স সেরা?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            হাজারো শিক্ষার্থী আমাদের কোর্সের মাধ্যমে তাদের দক্ষতা বৃদ্ধি করেছে এবং সফল ক্যারিয়ার গড়েছে
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* Features Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-blue-200 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 h-full hover:shadow-3xl transition-shadow duration-300">
              <CardBody className="p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">✨</span>
                  বিশেষ সুবিধা
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:from-blue-600 group-hover:to-indigo-700"
                      >
                        <FaCheck className="text-sm" />
                      </motion.div>
                      <p className="text-base sm:text-lg text-gray-700 font-medium">{feature}</p>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">❓</span>
                সাধারণ প্রশ্নাবলী
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full text-left"
                    >
                      <Card
                        className={`border-l-4 bg-gradient-to-r shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                          openIndex === index
                            ? "border-l-indigo-600 from-indigo-50 to-blue-50 bg-gradient-to-r from-indigo-50 to-blue-50"
                            : "border-l-blue-400 from-blue-50 to-indigo-50 hover:border-l-indigo-500"
                        }`}
                      >
                        <CardBody className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-left text-base sm:text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors pr-4">
                              {faq.question}
                            </span>
                            <motion.div
                              animate={{ rotate: openIndex === index ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0 text-indigo-600 text-lg"
                            >
                              ▼
                            </motion.div>
                          </div>
                        </CardBody>
                      </Card>
                    </button>

                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white border-l-4 border-l-indigo-600 p-4 sm:p-5 mt-2 rounded-lg shadow-sm">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <CardBody className="p-6 sm:p-8 lg:p-10">
              <motion.h3
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
              >
                আজই শুরু করুন আপনার শেখার যাত্রা!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 text-base sm:text-lg mb-6"
              >
                আমাদের কোর্সে যোগ দিয়ে নিজের ভবিষ্যৎ গড়ুন
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row flex-wrap justify-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ৭ দিনের মানি-ব্যাক গ্যারান্টি 💯
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  ২৪/৭ সাপোর্ট 🚀
                </motion.div>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
