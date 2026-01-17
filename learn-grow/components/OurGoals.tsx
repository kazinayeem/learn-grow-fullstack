"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { FaRocket, FaBrain, FaHandsHelping, FaGlobe } from "react-icons/fa";

export default function OurGoals() {
  const goals = [
    {
      icon: <FaBrain className="text-4xl" />,
      title: "শিক্ষার মান উন্নয়ন",
      description: "আধুনিক প্রযুক্তি এবং রোবটিক্স শিক্ষার মাধ্যমে শিক্ষার্থীদের দক্ষতা বৃদ্ধি করা এবং তাদের ভবিষ্যৎ ক্যারিয়ারের জন্য প্রস্তুত করা।",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <FaRocket className="text-4xl" />,
      title: "উদ্ভাবনী চিন্তাভাবনা",
      description: "শিক্ষার্থীদের মধ্যে সৃজনশীলতা এবং সমস্যা সমাধানের দক্ষতা গড়ে তোলা, যাতে তারা ভবিষ্যতের চ্যালেঞ্জ মোকাবেলা করতে পারে।",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <FaHandsHelping className="text-4xl" />,
      title: "সবার জন্য শিক্ষা",
      description: "দেশের প্রতিটি কোণে মানসম্পন্ন রোবটিক্স এবং STEM শিক্ষা পৌঁছে দেওয়া এবং সবার জন্য শেখার সুযোগ সৃষ্টি করা।",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <FaGlobe className="text-4xl" />,
      title: "আন্তর্জাতিক মানের শিক্ষা",
      description: "বাংলাদেশের শিক্ষার্থীদের বিশ্বমানের শিক্ষা প্রদান করা এবং তাদের আন্তর্জাতিক প্রতিযোগিতায় সক্ষম করে তোলা।",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            আমাদের লক্ষ্য
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            আমরা প্রতিশ্রুতিবদ্ধ বাংলাদেশের শিক্ষার্থীদের জন্য মানসম্পন্ন রোবটিক্স এবং প্রযুক্তি শিক্ষা নিশ্চিত করতে
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {goals.map((goal, index) => (
            <Card 
              key={index}
              className="border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardBody className="p-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {goal.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {goal.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {goal.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-semibold">
              একসাথে গড়ব আগামীর বাংলাদেশ 🇧🇩
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
