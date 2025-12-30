"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
} from "@nextui-org/react";
import {
  useGetAllJobsQuery,
  useGetPublishedJobsQuery,
  useGetRemoteJobsQuery,
} from "@/redux/api/jobApi";
import JobsTable from "@/components/admin/JobsTable";
import CreateJobModal from "@/components/admin/CreateJobModal";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function JobsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: allJobsData, isLoading: loadingAll } = useGetAllJobsQuery({});
  const { data: publishedJobsData, isLoading: loadingPublished } =
    useGetPublishedJobsQuery({});
  const { data: remoteJobsData, isLoading: loadingRemote } =
    useGetRemoteJobsQuery({});

  const allJobs = allJobsData?.data || [];
  const publishedJobs = publishedJobsData?.data || [];
  const remoteJobs = remoteJobsData?.data || [];

  const getJobCount = () => {
    switch (activeTab) {
      case "all":
        return allJobs.length;
      case "published":
        return publishedJobs.length;
      case "remote":
        return remoteJobs.length;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="bg-white shadow-lg border border-gray-200 mb-4 md:mb-6">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-6">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <Button 
                  variant="light" 
                  startContent={<FaArrowLeft />}
                  onPress={() => router.back()}
                  size="sm"
                >
                  Back
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Job Management
                </h1>
              </div>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Manage job postings and applications
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <Button
                as="a"
                href="/admin/jobs/applications"
                color="secondary"
                size="md"
                className="font-semibold"
                startContent={
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              >
                <span className="hidden sm:inline">View Applications</span>
                <span className="sm:hidden">Applications</span>
              </Button>
              <Button
                color="primary"
                size="md"
                onPress={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 font-semibold w-full sm:w-auto"
                startContent={
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                <span className="hidden sm:inline">Create New Job</span>
                <span className="sm:hidden">New Job</span>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-none shadow-lg">
            <CardBody className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs md:text-sm">Total Jobs</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {allJobs.length}
                  </h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 border-none shadow-lg">
            <CardBody className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs md:text-sm">Published</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {publishedJobs.length}
                  </h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-none shadow-lg">
            <CardBody className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs md:text-sm">
                    Remote Jobs
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {remoteJobs.length}
                  </h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 border-none shadow-lg">
            <CardBody className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs md:text-sm">Draft</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">
                    {allJobs.filter((job: any) => !job.isPublished).length}
                  </h3>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardBody className="p-4 md:p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="bordered"
                className="w-full sm:max-w-md"
                classNames={{
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300 bg-white",
                }}
                startContent={
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />

              <Chip
                color="primary"
                variant="flat"
                size="md"
                className="w-full sm:w-auto justify-center"
              >
                {getJobCount()} Jobs
              </Chip>
            </div>

            {/* Tabs */}
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              variant="underlined"
              classNames={{
                tabList: "border-b border-gray-300",
                tab: "text-gray-600",
                cursor: "bg-blue-600",
              }}
              className="mb-4 md:mb-6"
              fullWidth
            >
              <Tab key="all" title="All Jobs" />
              <Tab key="published" title="Published" />
              <Tab key="remote" title="Remote" />
            </Tabs>

            {/* Jobs Table */}
            <JobsTable />
          </CardBody>
        </Card>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
