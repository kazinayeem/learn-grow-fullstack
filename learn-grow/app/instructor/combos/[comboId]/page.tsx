/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@nextui-org/react";
import { FaEdit, FaArrowLeft, FaBook, FaTags, FaPercent } from "react-icons/fa";
import { useGetComboByIdQuery } from "@/redux/api/comboApi";

export default function ComboDetailsPage() {
  const router = useRouter();
  const { comboId } = useParams();
  const { data: comboData, isLoading, error } = useGetComboByIdQuery(comboId as string);

  const combo = comboData?.data;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner label="Loading combo details..." />
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="w-full p-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
          className="mb-4"
        >
          Go Back
        </Button>
        <Card className="border-red-500">
          <CardBody className="text-red-600">
            Failed to load combo details. Please try again.
          </CardBody>
        </Card>
      </div>
    );
  }

  const totalOriginalPrice = (combo.courses || []).reduce(
    (sum: number, course: any) => sum + (course.price || 0),
    0
  );
  const discountAmount = Math.round(totalOriginalPrice * (combo.discountPercentage / 100));
  const totalComboPrice = totalOriginalPrice - discountAmount;

  return (
    <div className="w-full p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{combo.name}</h1>
          <p className="text-gray-600">{combo.description}</p>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Edit combo">
            <Button
              isIconOnly
              color="warning"
              variant="flat"
              onPress={() => router.push(`/instructor/combos/${combo._id}/edit`)}
            >
              <FaEdit />
            </Button>
          </Tooltip>
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardBody>
            <div className="flex items-center gap-3">
              <FaBook className="text-3xl text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{combo.courses?.length || 0}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardBody>
            <div className="flex items-center gap-3">
              <FaPercent className="text-3xl text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Discount</p>
                <p className="text-2xl font-bold">{combo.discountPercentage}%</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardBody>
            <div className="flex items-center gap-3">
              <FaTags className="text-3xl text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Chip
                  size="sm"
                  variant="flat"
                  color={combo.isActive ? "success" : "warning"}
                  className="mt-1"
                >
                  {combo.isActive ? "Active" : "Inactive"}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pricing Summary */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original Total Price:</span>
              <span className="font-medium">৳{totalOriginalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount ({combo.discountPercentage}%):</span>
              <span className="font-medium text-red-600">-৳{discountAmount.toLocaleString()}</span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Combo Price:</span>
              <span className="text-xl font-bold text-green-600">
                ৳{totalComboPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Courses in Combo */}
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4">Courses in This Combo</h3>
          {combo.courses && combo.courses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                aria-label="Courses in combo"
                color="default"
                selectionMode="none"
              >
                <TableHeader>
                  <TableColumn>COURSE</TableColumn>
                  <TableColumn>LEVEL</TableColumn>
                  <TableColumn>ORIGINAL PRICE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                </TableHeader>
                <TableBody>
                  {combo.courses.map((course: any) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-sm text-gray-500">
                            {course.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {course.level}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">৳{course.price}</span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={course.type === "live" ? "warning" : "success"}
                        >
                          {course.type === "live" ? "Live" : "Recorded"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No courses in this combo yet
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
