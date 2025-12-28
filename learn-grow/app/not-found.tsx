"use client";

import Link from "next/link";
import { Button } from "@nextui-org/react";
import { FaArrowLeft, FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </div>
          <div className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</div>
          <p className="text-gray-600 mt-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8 text-6xl">
          <svg
            className="w-full h-64 mb-4"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#E0E7FF" />
            <circle cx="75" cy="85" r="8" fill="#1F2937" />
            <circle cx="125" cy="85" r="8" fill="#1F2937" />
            <path d="M 75 120 Q 100 135 125 120" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 60 100 L 140 100" stroke="#C7D2FE" strokeWidth="2" strokeDasharray="5,5" />
            <text x="100" y="160" textAnchor="middle" className="text-xl font-bold fill-gray-400">
              Lost in Space
            </text>
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Link href="/" className="flex-1">
            <Button
              color="primary"
              size="lg"
              className="w-full font-semibold"
              startContent={<FaHome />}
            >
              Back to Home
            </Button>
          </Link>
          <Button
            variant="bordered"
            size="lg"
            onClick={() => window.history.back()}
            startContent={<FaArrowLeft />}
            className="flex-1"
          >
            Go Back
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-10 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Need help? Try these:</p>
          <div className="space-y-2">
            <Link href="/courses" className="block text-blue-600 hover:underline text-sm">
              → Browse Courses
            </Link>
            <Link href="/contact" className="block text-blue-600 hover:underline text-sm">
              → Contact Support
            </Link>
            <Link href="/dashboard" className="block text-blue-600 hover:underline text-sm">
              → Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
