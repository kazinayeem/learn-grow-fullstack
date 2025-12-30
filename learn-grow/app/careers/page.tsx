"use client";

import { Button, Card, CardBody, Chip, Spinner, Input, Pagination } from "@nextui-org/react";
import { useGetPublishedJobsQuery } from "@/redux/api/jobApi";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";
import Link from "next/link";
import { useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";

const JOBS_PER_PAGE = 6;

export default function CareersPage() {
  const { data: cmsData } = useGetSiteContentQuery("careers");
  const { data: jobsData, isLoading } = useGetPublishedJobsQuery({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const hero = cmsData?.data?.content?.hero ?? {
    tag: "Careers",
    title: "Join Our Team",
    subtitle: "Build your future with us",
  };

  const allJobs = jobsData?.data ?? [];

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job: any) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allJobs, searchTerm]);

  // Paginate jobs
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading jobs..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 max-w-5xl">
      {/* HERO */}
      <div className="text-center mb-16 space-y-4">
        <Chip color="secondary" variant="flat">
          {hero.tag}
        </Chip>

        <h1 className="text-4xl md:text-5xl font-bold">{hero.title}</h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {hero.subtitle}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8">
        <Input
          isClearable
          fullWidth
          placeholder="Search by title, department, location..."
          startContent={<FaSearch className="text-gray-400" />}
          value={searchTerm}
          onValueChange={handleSearch}
          className="mb-4"
        />
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>
            Found <span className="font-semibold">{filteredJobs.length}</span> position{filteredJobs.length !== 1 ? "s" : ""}
          </p>
          {searchTerm && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleSearch("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      </div>

      {/* JOB LIST */}
      <div className="grid gap-6">
        {paginatedJobs.length === 0 && (
          <div className="text-center text-gray-500 py-12 col-span-full">
            {searchTerm ? "No jobs match your search. Try different keywords." : "No open positions at the moment."}
          </div>
        )}

        {paginatedJobs.map((job: any) => (
          <Card key={job._id} className="hover:shadow-md transition-shadow">
            <CardBody className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
              {/* LEFT */}
              <div className="text-left space-y-2 flex-1">
                <h3 className="text-xl font-bold hover:text-blue-600 transition-colors">{job.title}</h3>

                <div className="flex flex-wrap gap-2 text-sm">
                  {job.department && <Chip size="sm" variant="flat">{job.department}</Chip>}
                  {job.jobType && <Chip size="sm" variant="flat">{job.jobType}</Chip>}
                  {job.location && <Chip size="sm" variant="flat">{job.location}</Chip>}
                  {job.isRemote && <Chip size="sm" color="success" variant="flat">Remote</Chip>}
                </div>

                {job.salaryRange && (
                  <p className="text-sm text-gray-700 font-medium">
                    💰 {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} – {job.salaryRange.max.toLocaleString()}
                  </p>
                )}
              </div>

              {/* RIGHT */}
              <Button
                as={Link}
                href={`/careers/${job._id}`}
                color="primary"
                radius="full"
                variant="flat"
              >
                View Details
              </Button>
            </CardBody>
          </Card>
        ))}

        {/* FALLBACK CTA */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <h3 className="text-xl font-semibold mb-2">
            Don’t see a perfect fit?
          </h3>
          <p className="text-gray-600 mb-6">
            We’re always open to great talent. Send us your resume!
          </p>
          <Button
            as="a"
            href="mailto:careers@learnandgrow.io"
            color="secondary"
          >
            Email Us
          </Button>
        </div>
      </div>
    </div>
  );
}
