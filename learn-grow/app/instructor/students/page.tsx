"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Button,
  Input,
  Skeleton,
  Pagination,
} from "@nextui-org/react";
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaEye, FaBook } from "react-icons/fa";
import { useGetInstructorStudentsQuery } from "@/redux/api/userApi";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/Auth/RequireAuth";

function InstructorStudentsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  // Get instructor's students (backend filters by instructor's courses)
  const { data, isLoading } = useGetInstructorStudentsQuery({ 
    page, 
    limit,
    search: searchQuery 
  });

  const students = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaUser className="text-green-600" />
          My Students
        </h1>
        <p className="text-gray-600">View and manage students enrolled in your courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <p className="text-3xl font-bold text-blue-600">
                    {data?.pagination?.total || 0}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUser className="text-2xl text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Students</p>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter((s: any) => !s.isBlocked).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaBook className="text-2xl text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Page</p>
                <p className="text-3xl font-bold text-purple-600">
                  {students.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaSearch className="text-2xl text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardBody>
          <Input
            placeholder="Search students by name or email..."
            startContent={<FaSearch className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="bordered"
            size="lg"
            isClearable
            onClear={() => setSearchQuery("")}
          />
        </CardBody>
      </Card>

      {/* Students Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? "No students found" : "No students enrolled yet"}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "Students will appear here when they enroll in your courses"}
              </p>
            </div>
          ) : (
            <>
              <Table aria-label="Students table" className="min-h-[400px]">
                <TableHeader>
                  <TableColumn>STUDENT</TableColumn>
                  <TableColumn>CONTACT</TableColumn>
                  <TableColumn>JOINED DATE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {students.map((student: any) => (
                    <TableRow key={student._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.profileImage}
                            name={student.name}
                            size="md"
                            fallback={<FaUser />}
                            className="flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">ID: {student._id.slice(-6)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="text-gray-400" />
                            <span className="truncate max-w-[200px]">{student.email}</span>
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaPhone className="text-gray-400" />
                              <span>{student.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(student.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={student.isBlocked ? "danger" : "success"}
                          variant="flat"
                          size="sm"
                        >
                          {student.isBlocked ? "Blocked" : "Active"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<FaEye />}
                          onPress={() => router.push(`/instructor/students/${student._id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="primary"
                    size="lg"
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function InstructorStudentsPage() {
  return (
    <RequireAuth allowedRoles={["instructor"]}>
      <InstructorStudentsContent />
    </RequireAuth>
  );
}
