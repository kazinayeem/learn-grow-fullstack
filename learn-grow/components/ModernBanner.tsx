"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/bundle";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "@/styles/banner-fix.css";
import Image from "next/image";

import { content } from "@/lib/content";

const ModernBanner = () => {
  const [language, setLanguage] = useState<"en" | "bn">("bn");
  const heroContent = content.hero[language];

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
      title:
        language === "en"
          ? "Learn Robotics & Arduino"
          : "রোবটিক্স ও Arduino শিখুন",
      highlight: language === "en" ? "Build Real Robots" : "আসল রোবট তৈরি করুন",
      gradient: "from-blue-600/70 via-cyan-600/60 to-transparent",
    },
    {
      image:
        "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2032&auto=format&fit=crop",
      title:
        language === "en" ? "Master Python & AI" : "Python ও AI তে দক্ষ হোন",
      highlight: language === "en" ? "Code the Future" : "ভবিষ্যৎ কোড করুন",
      gradient: "from-green-600/70 via-emerald-600/60 to-transparent",
    },
    {
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
      title: language === "en" ? "STEM Education" : "STEM শিক্ষা",
      highlight:
        language === "en" ? "For Young Innovators" : "তরুণ উদ্ভাবকদের জন্য",
      gradient: "from-purple-600/70 via-pink-600/60 to-transparent",
    },

  ];

  return (
    <div className="relative w-full">
      <Swiper
        autoplay={{
          delay: 50000,
          disableOnInteraction: false,
        }}
        className="h-[120vh]"
        effect="fade"
        loop={true}
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        navigation={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  fill
                  alt={slide.title}
                  className="object-cover"
                  priority={index === 0}
                  src={slide.image}
                />
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
                />
              </div>

              {/* Content */}
              <div className="relative z-20 container mx-auto px-4 md:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                  {/* Animated Badge */}
                  <div className="inline-block mb-10 mt-6 px-2 animate-slideDown">
                    <span className="inline-flex items-center px-4 sm:px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white text-base sm:text-lg font-semibold border border-white/30 whitespace-nowrap">
                      {language === "en"
                        ? "🚀 Future-Ready Education"
                        : "🚀 ভবিষ্যৎমুখী শিক্ষা"}
                    </span>
                  </div>

                  {/* Main Heading */}
                  <h1
                    className={`text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 animate-slideUp ${language === "bn" ? "font-siliguri" : ""}`}
                  >
                    <span className="block mb-2">{slide.title}</span>
                    <span className="block text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                      {slide.highlight}
                    </span>
                  </h1>

                  {/* Description */}
                  <p
                    className={`text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-4xl mx-auto animate-fadeIn ${language === "bn" ? "font-siliguri" : ""}`}
                  >
                    {heroContent.description}
                  </p>

                  {/* CTA Buttons */}
                  <div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scaleIn"
                    style={{ animationDelay: "200ms" }}
                  >
                    <Button
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-8 py-6 text-lg rounded-2xl shadow-glow-primary hover:scale-105 transition-transform"
                      size="lg"
                    >
                      {heroContent.cta.primary} →
                    </Button>
                    <Button
                      className="border-2 border-white text-white font-bold px-8 py-6 text-lg rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all"
                      size="lg"
                      variant="bordered"
                    >
                      {heroContent.cta.secondary}
                    </Button>
                  </div>

                  {/* Stats */}
                  <div
                    className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto animate-fadeIn"
                    style={{ animationDelay: "400ms" }}
                  >
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        500+
                      </div>
                      <div
                        className={`text-sm md:text-base text-white/80 ${language === "bn" ? "font-siliguri" : ""}`}
                      >
                        {language === "en" ? "Students" : "শিক্ষার্থী"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        50+
                      </div>
                      <div
                        className={`text-sm md:text-base text-white/80 ${language === "bn" ? "font-siliguri" : ""}`}
                      >
                        {language === "en" ? "Projects" : "প্রজেক্ট"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        95%
                      </div>
                      <div
                        className={`text-sm md:text-base text-white/80 ${language === "bn" ? "font-siliguri" : ""}`}
                      >
                        {language === "en" ? "Satisfaction" : "সন্তুষ্টি"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl animate-float hidden lg:block" />
              <div
                className="absolute top-20 right-10 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full animate-float hidden lg:block"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ModernBanner;
