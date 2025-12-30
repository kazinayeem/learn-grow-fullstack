"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Chip,
  Divider,
  Spinner,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useGetJobByIdQuery } from "@/redux/api/jobApi";
import Link from "next/link";
import JobApplicationForm from "@/components/JobApplicationForm";
import { useState } from "react";

export default function JobDetailsPage() {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data, isLoading, isError } = useGetJobByIdQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading job details..." />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Job not found</p>
        <Button as={Link} href="/careers" className="mt-4">
          Back to Careers
        </Button>
      </div>
    );
  }

  const job = data.data;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      {/* Back */}
      <Button as={Link} href="/careers" variant="light" className="mb-6">
        ← Back to Careers
      </Button>

      <Card className="shadow-md">
        <CardBody className="p-6 space-y-6">
          {/* HEADER */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>

            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span>{job.department}</span>
              <span>•</span>
              <span>{job.jobType}</span>
              <span>•</span>
              <span>{job.location}</span>

              {job.isRemote && (
                <>
                  <span>•</span>
                  <span className="text-purple-600 font-medium">Remote</span>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <Chip color={job.isPublished ? "success" : "warning"}>
                {job.isPublished ? "Open" : "Closed"}
              </Chip>
            </div>
          </div>

          <Divider />

          {/* SALARY */}
          {job.salaryRange && (
            <div>
              <h3 className="font-semibold mb-1">Salary</h3>
              <p className="text-gray-700">
                {job.salaryRange.currency}{" "}
                {job.salaryRange.min.toLocaleString()} –{" "}
                {job.salaryRange.max.toLocaleString()}
              </p>
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <h3 className="font-semibold mb-1">Job Description</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* REQUIREMENTS */}
          {job.requirements?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {job.requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Application Submitted!</p>
              <p className="text-sm">
                Thank you for applying. We'll review your application shortly.
              </p>
            </div>
          )}

          {/* APPLY */}
          <Divider />

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-sm text-gray-500">
              Posted on {new Date(job.createdAt).toLocaleDateString()}
            </p>

            <Button
              color="primary"
              radius="full"
              onPress={onOpen}
              disabled={!job.isPublished}
            >
              Apply Now
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Application Form Modal */}
      <JobApplicationForm
        jobId={job._id}
        jobTitle={job.title}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 5000);
        }}
      />
    </div>
  );
}
