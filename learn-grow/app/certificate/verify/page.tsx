"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Input, Spinner, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaCertificate, FaSearch, FaCheckCircle, FaTimesCircle, FaCalendar, FaUser, FaBook } from "react-icons/fa";
import { useVerifyCertificateQuery } from "@/redux/api/certificateApi";

export default function CertificateVerificationPage() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [manualCertificateId, setManualCertificateId] = useState("");

  // Query when search is submitted
  const { data, isLoading, error, refetch } = useVerifyCertificateQuery(
    searchSubmitted ? manualCertificateId : "",
    { skip: !searchSubmitted }
  );

  const isValid = data?.data?.isValid || false;
  const certificate = data?.data?.certificate;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCertificateId.trim()) {
      setSearchSubmitted(true);
    }
  };

  const handleNewSearch = () => {
    setSearchSubmitted(false);
    setManualCertificateId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FaCertificate className="text-6xl text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">Learn & Grow Platform - Verify Your Achievement</p>
        </div>

        {/* Search Form or Results */}
        {!searchSubmitted ? (
          // Search Form
          <Card className="shadow-2xl">
            <CardBody className="p-8 sm:p-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Search Your Certificate
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Enter your certificate ID to verify its authenticity
              </p>

              <form onSubmit={handleSearch} className="space-y-4">
                <Input
                  classNames={{
                    base: "h-full",
                    input: "text-base",
                    inputWrapper: "h-12",
                  }}
                  description="Certificate ID format: CERT-XXXXXXXXXX"
                  placeholder="Enter Certificate ID (e.g., CERT-abc123def456)"
                  size="lg"
                  startContent={<FaSearch className="text-default-400" />}
                  type="text"
                  value={manualCertificateId}
                  onChange={(e) => setManualCertificateId(e.target.value)}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    color="primary"
                    size="lg"
                    className="flex-1 font-semibold"
                    type="submit"
                    isDisabled={!manualCertificateId.trim()}
                  >
                    <FaSearch className="mr-2" />
                    Verify Certificate
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Not sure about your certificate ID?</strong><br />
                  Check your email confirmation or visit your student dashboard to find your certificate ID.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          // Results Card
          <Card className="shadow-2xl">
            <CardBody className="p-8 sm:p-12">
              {isLoading ? (
                <div className="text-center py-12">
                  <Spinner size="lg" color="primary" className="mb-4 mx-auto" />
                  <p className="text-lg text-gray-600">Verifying certificate...</p>
                </div>
              ) : isValid && certificate ? (
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

                  {/* Footer & New Search Button */}
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      This certificate has been verified and is authentic.
                    </p>
                    <p className="text-xs text-gray-500">
                      Issued by Learn & Grow Platform
                    </p>
                    <Button
                      color="primary"
                      variant="bordered"
                      size="lg"
                      className="mt-6 font-semibold"
                      onPress={handleNewSearch}
                    >
                      <FaSearch className="mr-2" />
                      Search Another Certificate
                    </Button>
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

                  <div className="text-center space-y-4">
                    <p className="text-lg text-gray-700">
                      {data?.message || "Certificate not found or has been rejected."}
                    </p>
                    <p className="text-sm text-gray-600">
                      Please verify the certificate ID and try again.
                    </p>
                    {manualCertificateId && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 inline-block">
                        <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                        <p className="text-lg font-mono font-semibold text-gray-800">
                          {manualCertificateId}
                        </p>
                      </div>
                    )}
                    <Button
                      color="primary"
                      variant="bordered"
                      size="lg"
                      className="mt-6 font-semibold"
                      onPress={handleNewSearch}
                    >
                      <FaSearch className="mr-2" />
                      Try Another Certificate
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Learn & Grow - Online Learning Platform</p>
          <p className="mt-2">For any queries, please contact support@learnandgrow.io</p>
        </div>
      </div>
    </div>
  );
}
