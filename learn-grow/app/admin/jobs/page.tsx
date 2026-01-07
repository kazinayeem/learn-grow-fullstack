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
import { FaArrowLeft, FaBriefcase, FaCheckCircle, FaGlobe, FaFileAlt, FaSearch, FaPlus, FaClipboardList } from "react-icons/fa";

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
  const draftJobs = allJobs.filter((job: any) => !job.isPublished).length;

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="light"
              startContent={<FaArrowLeft />}
              onPress={() => router.push("/admin")}
              className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
              size="lg"
            >
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <FaBriefcase className="text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Job Management
                </h1>
                <p className="text-sm sm:text-base text-white/90 mt-1">
                  Manage job postings and applications
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto flex-col sm:flex-row">
            <Button
              as="a"
              href="/admin/jobs/applications"
              color="default"
              size="lg"
              startContent={<FaClipboardList />}
              className="min-h-[44px] bg-white text-teal-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="hidden sm:inline">View Applications</span>
              <span className="sm:hidden">Applications</span>
            </Button>
            <Button
              color="default"
              size="lg"
              onPress={() => setIsModalOpen(true)}
              startContent={<FaPlus />}
              className="min-h-[44px] bg-white text-teal-600 font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="hidden sm:inline">Create New Job</span>
              <span className="sm:hidden">New Job</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-teal-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Total Jobs</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{allJobs.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaBriefcase className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Published</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{publishedJobs.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheckCircle className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Remote Jobs</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{remoteJobs.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaGlobe className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
          <CardBody className="p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 mb-1 truncate font-medium">Draft</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{draftJobs}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full flex-shrink-0 ml-2">
                <FaFileAlt className="text-2xl sm:text-3xl lg:text-4xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-xl border-2 border-gray-100">
        <CardBody className="p-4 sm:p-6 lg:p-8">
          {/* Search and Job Count */}
          <div className="mb-5 sm:mb-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:flex-1 sm:max-w-md space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search Jobs</label>
                <Input
                  placeholder="Search by title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="bordered"
                  size="lg"
                  startContent={<FaSearch className="text-teal-500" />}
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-teal-400 focus-within:border-teal-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md",
                  }}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <Chip
                  color="primary"
                  variant="flat"
                  size="lg"
                  className="font-bold"
                  startContent={<FaBriefcase />}
                >
                  {getJobCount()} Jobs
                </Chip>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5 sm:mb-6">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              variant="underlined"
              size="lg"
              classNames={{
                tabList: "gap-4 sm:gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-teal-500",
                tab: "max-w-fit px-4 h-12 font-semibold",
                tabContent: "group-data-[selected=true]:text-teal-600"
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <FaBriefcase />
                    <span>All Jobs</span>
                  </div>
                }
              />
              <Tab
                key="published"
                title={
                  <div className="flex items-center gap-2">
                    <FaCheckCircle />
                    <span>Published</span>
                  </div>
                }
              />
              <Tab
                key="remote"
                title={
                  <div className="flex items-center gap-2">
                    <FaGlobe />
                    <span>Remote</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          {/* Jobs Table */}
          <JobsTable />
        </CardBody>
      </Card>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
