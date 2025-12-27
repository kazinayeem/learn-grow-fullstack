"use client";

import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { useGetPublishedJobsQuery } from "@/redux/api/jobApi";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";
import Link from "next/link";

export default function CareersPage() {
  const { data: cmsData } = useGetSiteContentQuery("careers");
  const { data: jobsData, isLoading } = useGetPublishedJobsQuery({});
  const hero = cmsData?.data?.content?.hero ?? {
    tag: "Careers",
    title: "Join Our Team",
    subtitle: "Build your future with us",
  };

  const jobs = jobsData?.data ?? [];

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

      {/* JOB LIST */}
      <div className="grid gap-6">
        {jobs.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No open positions at the moment.
          </div>
        )}

        {jobs.map((job: any) => (
          <Card key={job._id} className="hover:shadow-md transition-shadow">
            <CardBody className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
              {/* LEFT */}
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-xl font-bold">{job.title}</h3>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start text-sm text-gray-500">
                  <span>{job.department}</span>
                  <span>•</span>
                  <span>{job.jobType}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                  {job.isRemote && (
                    <>
                      <span>•</span>
                      <span className="text-purple-600 font-medium">
                        Remote
                      </span>
                    </>
                  )}
                </div>

                {job.salaryRange && (
                  <p className="text-sm text-gray-600">
                    Salary: {job.salaryRange.currency}{" "}
                    {job.salaryRange.min.toLocaleString()} –{" "}
                    {job.salaryRange.max.toLocaleString()}
                  </p>
                )}
              </div>

              {/* RIGHT */}
              <Button
                as={Link}
                href={`/careers/${job._id}`}
                color="primary"
                radius="full"
                variant="ghost"
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
