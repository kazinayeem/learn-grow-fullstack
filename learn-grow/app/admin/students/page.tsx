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
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaBan, FaCheck, FaEye, FaUserGraduate } from "react-icons/fa";
import { useGetUsersAdminQuery, useGetAdminDashboardStatsQuery, useUpdateUserMutation } from "@/redux/api/userApi";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const limit = parseInt(pageSize, 10);

  // Reset to page 1 when search changes or page size changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  // Fetch dashboard stats for total count
  const { data: statsData } = useGetAdminDashboardStatsQuery(undefined);

  const { data, isLoading } = useGetUsersAdminQuery({
    page,
    limit,
    role: "student",
    search: searchQuery
  });

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const students = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalStudents = statsData?.data?.students || 0;
  
  // Calculate total pages based on total students and current limit
  const calculatedTotalPages = Math.ceil(totalStudents / limit);

  const handleStatusToggle = async (userId: string, isBlocked: boolean) => {
    try {
      await updateUser({ id: userId, isBlocked: !isBlocked }).unwrap();
      // nothing else; query is cached by RTK; optional UI tweaks could refetch
    } catch (e: any) {
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-gray-900">
          Students Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and monitor student accounts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-5 sm:mb-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md hover:shadow-lg transition-shadow">
          <CardBody className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Students</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">
                    {totalStudents}
                  </p>
                )}
              </div>
              <div className="bg-blue-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <FaUserGraduate className="text-lg sm:text-xl lg:text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-lg transition-shadow">
          <CardBody className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Active Students</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
                  {students.filter((s: any) => !s.isBlocked).length}
                </p>
              </div>
              <div className="bg-green-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <FaCheck className="text-lg sm:text-xl lg:text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-md hover:shadow-lg transition-shadow xs:col-span-2 lg:col-span-1">
          <CardBody className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Blocked Students</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">
                  {students.filter((s: any) => s.isBlocked).length}
                </p>
              </div>
              <div className="bg-red-500 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <FaBan className="text-lg sm:text-xl lg:text-2xl text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Page Size Controls */}
      <Card className="mb-5 sm:mb-6 shadow-md">
        <CardBody className="p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search students by name or email..."
              startContent={<FaSearch className="text-gray-400 text-base sm:text-lg" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="bordered"
              size="lg"
              isClearable
              onClear={() => setSearchQuery("")}
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "min-h-[44px]",
              }}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Items per page:</label>
              <Select
                selectedKeys={[pageSize]}
                onChange={(e) => setPageSize(e.target.value)}
                className="max-w-xs"
                size="md"
                variant="bordered"
              >
                <SelectItem key="10" value="10">
                  10 per page
                </SelectItem>
                <SelectItem key="20" value="20">
                  20 per page
                </SelectItem>
                <SelectItem key="50" value="50">
                  50 per page
                </SelectItem>
                <SelectItem key="100" value="100">
                  100 per page
                </SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Students Table */}
      <Card className="shadow-lg relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-50">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" color="primary" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading students...</p>
            </div>
          </div>
        )}
        <CardBody className="p-0 sm:p-4 lg:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4 p-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-10 sm:py-12 lg:py-16 px-4">
              <FaUserGraduate className="text-5xl sm:text-6xl lg:text-7xl text-gray-300 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">
                No students found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table aria-label="Students table" classNames={{ wrapper: "shadow-none" }}>
                  <TableHeader>
                    <TableColumn>STUDENT</TableColumn>
                    <TableColumn>CONTACT</TableColumn>
                    <TableColumn>JOINED DATE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: any) => (
                      <TableRow key={student._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={student.profileImage}
                              name={student.name}
                              size="md"
                              fallback={<FaUser />}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                              <p className="text-sm text-gray-500 capitalize">{student.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FaEnvelope className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </div>
                            {student.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <FaPhone className="text-gray-400 flex-shrink-0" />
                                <span>{student.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(student.createdAt).toLocaleDateString()}
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              startContent={<FaEye />}
                              onPress={() => router.push(`/admin/students/${student._id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              color={student.isBlocked ? "success" : "danger"}
                              variant="flat"
                              onPress={() => handleStatusToggle(student._id, student.isBlocked)}
                            >
                              {student.isBlocked ? "Unblock" : "Block"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4">
                {students.map((student: any) => (
                  <Card
                    key={student._id}
                    className="border border-gray-200 hover:border-primary-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    <CardBody className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <Avatar
                          src={student.profileImage}
                          name={student.name}
                          size="lg"
                          fallback={<FaUser />}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                            {student.name}
                          </h3>
                          <Chip
                            color={student.isBlocked ? "danger" : "success"}
                            variant="flat"
                            size="sm"
                          >
                            {student.isBlocked ? "Blocked" : "Active"}
                          </Chip>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaEnvelope className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{student.email}</span>
                        </div>
                        {student.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700">{student.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Joined:</span>
                          <span className="text-gray-700">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="md"
                          color="primary"
                          variant="flat"
                          startContent={<FaEye />}
                          className="w-full min-h-[44px] font-semibold"
                          onPress={() => router.push(`/admin/students/${student._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="md"
                          color={student.isBlocked ? "success" : "danger"}
                          variant="flat"
                          className="w-full min-h-[44px] font-semibold"
                          onPress={() => handleStatusToggle(student._id, student.isBlocked)}
                        >
                          {student.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {calculatedTotalPages > 1 && (
                <div className="flex justify-center mt-6 px-4 pb-4">
                  <Pagination
                    total={calculatedTotalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    color="primary"
                    size="lg"
                    classNames={{
                      cursor: "min-w-[44px] min-h-[44px]",
                      item: "min-w-[44px] min-h-[44px]",
                    }}
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
