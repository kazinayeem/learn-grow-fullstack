"use client";

import React from "react";
import { Card, CardBody, Spinner, Chip } from "@nextui-org/react";
import { useParams } from "next/navigation";
import { useVerifyCertificateQuery } from "@/redux/api/certificateApi";
import { FaCheckCircle, FaTimesCircle, FaCertificate, FaCalendar, FaUser, FaBook } from "react-icons/fa";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const { data, isLoading, error } = useVerifyCertificateQuery(certificateId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-12">
          <CardBody className="text-center">
            <Spinner size="lg" color="primary" className="mb-4" />
            <p className="text-lg text-gray-600">Verifying certificate...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isValid = data?.data?.isValid || false;
  const certificate = data?.data?.certificate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaCertificate className="text-6xl text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">Learn & Grow Platform</p>
        </div>

        {/* Verification Result */}
        <Card className="shadow-2xl">
          <CardBody className="p-8 sm:p-12">
            {isValid && certificate ? (
              <div>
                {/* Success Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="bg-green-100 p-4 rounded-full">
                    <FaCheckCircle className="text-5xl text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-green-800">Valid Certificate</h2>
                    <Chip color="success" variant="flat" size="lg" className="mt-2">
                      ✓ Verified
                    </Chip>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-8"></div>

                {/* Certificate Details */}
                <div className="space-y-6">
                  {/* Student Name */}
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FaUser className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Student Name</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {certificate.studentName}
                      </p>
                    </div>
                  </div>

                  {/* Course Name */}
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FaBook className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Course Name</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {certificate.courseName}
                      </p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <FaUser className="text-2xl text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Course Instructor</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {certificate.courseInstructor}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FaCalendar className="text-2xl text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completion Date</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(certificate.completionDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-cyan-100 p-3 rounded-lg">
                        <FaCertificate className="text-2xl text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Issued On</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-800">
                      {certificate.certificateId}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-8"></div>

                {/* Footer */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    This certificate has been verified and is authentic.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Issued by Learn & Grow Platform
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Error Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="bg-red-100 p-4 rounded-full">
                    <FaTimesCircle className="text-5xl text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-red-800">Invalid Certificate</h2>
                    <Chip color="danger" variant="flat" size="lg" className="mt-2">
                      ✗ Not Verified
                    </Chip>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-8"></div>

                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    {data?.message || "Certificate not found or has been rejectedd."}
                  </p>
                  <p className="text-sm text-gray-600">
                    Please verify the certificate ID and try again.
                  </p>
                  {certificateId && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 inline-block">
                      <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                      <p className="text-lg font-mono font-semibold text-gray-800">
                        {certificateId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Learn & Grow - Online Learning Platform</p>
          <p className="mt-2">For any queries, please contact support@learnandgrow.io</p>
        </div>
      </div>
    </div>
  );
}
