"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import {
  useGetAllJobsQuery,
  useDeleteJobMutation,
  usePublishJobMutation,
  useUnpublishJobMutation,
} from "@/redux/api/jobApi";
import CreateJobModal from "./CreateJobModal";

export default function JobsTable() {
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: jobsData,
    isLoading,
    refetch,
  } = useGetAllJobsQuery({ page, limit });
  const [deleteJob] = useDeleteJobMutation();
  const [publishJob] = usePublishJobMutation();
  const [unpublishJob] = useUnpublishJobMutation();

  const jobs = jobsData?.data || [];
  const pagination = jobsData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id).unwrap();
        alert("Job deleted successfully!");
        refetch();
      } catch (error: any) {
        alert(`Error: ${error?.data?.message || "Failed to delete job"}`);
      }
    }
  };

  const handleTogglePublish = async (job: any) => {
    try {
      const jobId = job._id || job.id;
      if (job.isPublished) {
        await unpublishJob(jobId).unwrap();
        alert("Job unpublished successfully!");
      } else {
        await publishJob(jobId).unwrap();
        alert("Job published successfully!");
      }
      refetch();
    } catch (error: any) {
      alert(
        `Error: ${error?.data?.message || "Failed to toggle publish status"}`
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table
          aria-label="Jobs table"
          removeWrapper
          classNames={{
            th: "bg-gray-50 text-gray-600 text-xs font-semibold",
            td: "py-4",
          }}
        >
          <TableHeader>
            <TableColumn>JOB</TableColumn>
            <TableColumn className="hidden md:table-cell">
              DEPARTMENT
            </TableColumn>
            <TableColumn className="hidden lg:table-cell">LOCATION</TableColumn>
            <TableColumn className="hidden md:table-cell">TYPE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn className="hidden lg:table-cell">REMOTE</TableColumn>
            <TableColumn align="end">ACTIONS</TableColumn>
          </TableHeader>

          <TableBody emptyContent="No jobs found">
            {jobs.map((job: any) => (
              <TableRow
                key={job._id || job.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* JOB */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">
                      {job?.title}
                    </span>
                    {job.salaryRange &&
                      (job.salaryRange.min || job.salaryRange.max) && (
                        <span className="text-xs text-gray-500">
                          {job.salaryRange.min &&
                            `$${job.salaryRange.min.toLocaleString()}`}
                          {job.salaryRange.min && job.salaryRange.max && " - "}
                          {job.salaryRange.max &&
                            `$${job.salaryRange.max.toLocaleString()}`}
                          {job.salaryRange.currency &&
                            job.salaryRange.currency !== "USD" &&
                            ` ${job.salaryRange.currency}`}
                        </span>
                      )}
                    <span className="md:hidden text-xs text-gray-400">
                      {job.department}
                    </span>
                  </div>
                </TableCell>

                {/* DEPARTMENT */}
                <TableCell className="hidden md:table-cell">
                  <span className="text-gray-700">{job.department}</span>
                </TableCell>

                {/* LOCATION */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-gray-600">{job.location}</span>
                </TableCell>

                {/* TYPE */}
                <TableCell className="hidden md:table-cell">
                  <Chip size="sm" variant="flat" color="primary">
                    {job.jobType}
                  </Chip>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={job.isPublished ? "success" : "warning"}
                  >
                    {job.isPublished ? "Published" : "Draft"}
                  </Chip>
                </TableCell>

                {/* REMOTE */}
                <TableCell className="hidden lg:table-cell">
                  {job.isRemote ? (
                    <Chip size="sm" variant="flat" color="secondary">
                      Remote
                    </Chip>
                  ) : (
                    <span className="text-gray-500 text-sm">On-site</span>
                  )}
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="left">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-500 hover:text-gray-900"
                      >
                        ⋮
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key="edit" onClick={() => handleEdit(job)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="publish"
                        onClick={() => handleTogglePublish(job)}
                      >
                        {job.isPublished ? "Unpublish" : "Publish"}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        color="danger"
                        className="text-danger"
                        onClick={() => handleDelete(job._id || job.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>

          <Pagination
            total={pagination.totalPages}
            page={pagination.page}
            onChange={setPage}
            showControls
            color="primary"
          />
        </div>
      )}

      <CreateJobModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editJob={editingJob}
      />
    </>
  );
}
