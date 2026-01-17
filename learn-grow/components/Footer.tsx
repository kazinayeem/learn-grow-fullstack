"use client";
import React from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";
import Image from "next/image";
import NextLink from "next/link";
import Link from "next/link";

import Logo from "@/public/logo.png";
import { siteConfig } from "@/config/site";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-gray-700">
          {/* Column 1: Logo & Description */}
          <div className="lg:col-span-1 space-y-4">
            <NextLink className="flex items-center gap-2 group" href="/">
              <Image
                alt="Learn and Grow logo"
                className="w-10 h-10"
                src={Logo}
              />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </NextLink>
            <p className="text-sm text-gray-400">
              Empowering students with quality education in Programming, Robotics, Math, and Science.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/courses"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/faq"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              About
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/about"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/team"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/careers"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/press"
                >
                  Press & Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Legal & Policies
            </h3>
            <ul className="space-y-3 text-sm">
               <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/certificate/verify"
                >
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/privacy-policy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/terms-of-use"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-400 transition-colors"
                  href="/refund-policy"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MdLocationOn className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                <p className="text-gray-400">
                  Level-4, 34, Green Road, Dhanmondi, Dhaka
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MdEmail className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Email:</p>
                  <a
                    href="mailto:info@learnandgrow.io"
                    className="hover:text-blue-400 transition-colors"
                  >
                    info@learnandgrow.io
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MdPhone className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Phone:</p>
                  <a
                    href="tel:+8801706274644"
                    className="hover:text-blue-400 transition-colors"
                  >
                    +880-1706274644
                  </a>
                </div>
              </div>
            </div>
            {/* Social Media Icons */}
            <div className="flex gap-3 pt-2">
              <Link
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                href={siteConfig.links.facebook}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaFacebookF className="text-lg" />
              </Link>
              <Link
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                href={siteConfig.links.linkedin}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaLinkedinIn className="text-lg" />
              </Link>
              <Link
                aria-label="Instagram"
                className="text-gray-400 hover:text-pink-400 transition-colors"
                href={siteConfig.links.instagram}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaInstagram className="text-lg" />
              </Link>
              <Link
                aria-label="YouTube"
                className="text-gray-400 hover:text-red-500 transition-colors"
                href={siteConfig.links.youtube}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaYoutube className="text-lg" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section - Compact */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          {/* Copyright */}
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>

          {/* Built By Credit */}
          <p>
            Built by{" "}
            <Link
              className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              href="https://bornosoftnr.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bornosoftnr
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
