"use client";
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Divider,
  Spinner,
  Alert,
  Tooltip,
} from "@nextui-org/react";
import {
  useSetAccessDurationMutation,
  useExtendAccessMutation,
  useReduceAccessMutation,
  useGetUserCourseAccessQuery,
} from "@/redux/api/accessManagementApi";
import { hasValidAccess, getRemainingDays, formatDate, getAccessStatus } from "@/lib/access-control";
import toast from "react-hot-toast";

export default function AccessDurationManager() {
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState<"1-month" | "2-months" | "3-months" | "lifetime">("lifetime");
  const [daysToAdd, setDaysToAdd] = useState("0");
  const [daysToReduce, setDaysToReduce] = useState("0");

  const [setAccessDuration] = useSetAccessDurationMutation();
  const [extendAccess] = useExtendAccessMutation();
  const [reduceAccess] = useReduceAccessMutation();

  const { data: accessData, isLoading } = useGetUserCourseAccessQuery(
    { userId },
    { skip: !userId }
  );

  const accesses = accessData?.data || [];

  const handleSetDuration = async () => {
    if (!userId.trim() || !courseId.trim()) {
      toast.error("Please select user and course");
      return;
    }

    try {
      await setAccessDuration({
        userId,
        courseId,
        duration,
      }).unwrap();
      toast.success("Access duration set!");
      setCourseId("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to set access");
    }
  };

  const handleExtend = async () => {
    if (!userId.trim() || !courseId.trim() || !daysToAdd || parseInt(daysToAdd) <= 0) {
      toast.error("Please fill in all fields with valid numbers");
      return;
    }

    try {
      await extendAccess({
        userId,
        courseId,
        days: parseInt(daysToAdd),
      }).unwrap();
      toast.success(`Extended access by ${daysToAdd} days!`);
      setDaysToAdd("0");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to extend access");
    }
  };

  const handleReduce = async () => {
    if (!userId.trim() || !courseId.trim() || !daysToReduce || parseInt(daysToReduce) <= 0) {
      toast.error("Please fill in all fields with valid numbers");
      return;
    }

    try {
      await reduceAccess({
        userId,
        courseId,
        days: parseInt(daysToReduce),
      }).unwrap();
      toast.success(`Reduced access by ${daysToReduce} days!`);
      setDaysToReduce("0");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reduce access");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Access Duration Manager</h1>
        <p className="text-default-500 mt-1">Manage student course access duration</p>
      </div>

      {/* User Selection Card */}
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-foreground">Search User</p>
            <p className="text-sm text-default-500">Enter user ID to view their course access</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <Input
            placeholder="Enter user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            isClearable
          />
        </CardBody>
      </Card>

      {/* Access Management Cards */}
      {userId && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner label="Loading user's course access..." />
            </div>
          ) : (
            <>
              {accesses.length === 0 ? (
                <Alert color="warning">
                  No course access found for this user
                </Alert>
              ) : (
                <>
                  {/* User's Current Access */}
                  <Card>
                    <CardHeader>
                      <p className="text-lg font-semibold text-foreground">
                        {accesses.length} Course{accesses.length !== 1 ? "s" : ""} Found
                      </p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <Table>
                        <TableHeader>
                          <TableColumn>COURSE</TableColumn>
                          <TableColumn>STATUS</TableColumn>
                          <TableColumn>REMAINING DAYS</TableColumn>
                          <TableColumn>END DATE</TableColumn>
                          <TableColumn>PURCHASE TYPE</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {accesses.map((access: any) => {
                            const isValid = hasValidAccess(access);
                            const remaining = getRemainingDays(access.accessEndDate);

                            return (
                              <TableRow key={access._id}>
                                <TableCell>
                                  <p className="font-semibold text-foreground">
                                    {access.course?.title || "Unknown Course"}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <Badge color={isValid ? "success" : "danger"}>
                                    {isValid ? "Active" : "Expired"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <p className="font-semibold">
                                    {access.accessEndDate ? remaining : "∞"}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm">
                                    {access.accessEndDate
                                      ? formatDate(new Date(access.accessEndDate))
                                      : "Lifetime"}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="flat">
                                    {access.purchaseType === "combo"
                                      ? "Combo"
                                      : "Single Course"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>

                  {/* Management Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Set Access Duration */}
                    <Card>
                      <CardHeader>
                        <p className="font-semibold text-foreground">Set Access Duration</p>
                      </CardHeader>
                      <Divider />
                      <CardBody className="gap-4">
                        <Select
                          label="Select Course"
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                        >
                          {accesses.map((access: any) => (
                            <SelectItem key={access.course._id} value={access.course._id}>
                              {access.course.title}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          label="Duration"
                          value={duration}
                          onChange={(e) =>
                            setDuration(e.target.value as any)
                          }
                        >
                          <SelectItem key="1-month" value="1-month">
                            1 Month
                          </SelectItem>
                          <SelectItem key="2-months" value="2-months">
                            2 Months
                          </SelectItem>
                          <SelectItem key="3-months" value="3-months">
                            3 Months
                          </SelectItem>
                          <SelectItem key="lifetime" value="lifetime">
                            Lifetime
                          </SelectItem>
                        </Select>

                        <Button
                          color="primary"
                          onClick={handleSetDuration}
                          fullWidth
                        >
                          Set Duration
                        </Button>
                      </CardBody>
                    </Card>

                    {/* Extend Access */}
                    <Card>
                      <CardHeader>
                        <p className="font-semibold text-foreground">Extend Access</p>
                      </CardHeader>
                      <Divider />
                      <CardBody className="gap-4">
                        <Select
                          label="Select Course"
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                        >
                          {accesses.map((access: any) => (
                            <SelectItem key={access.course._id} value={access.course._id}>
                              {access.course.title}
                            </SelectItem>
                          ))}
                        </Select>

                        <Input
                          type="number"
                          label="Days to Add"
                          placeholder="e.g., 30"
                          value={daysToAdd}
                          onChange={(e) => setDaysToAdd(e.target.value)}
                          min="1"
                        />

                        <Button
                          color="success"
                          onClick={handleExtend}
                          fullWidth
                        >
                          Extend Access
                        </Button>
                      </CardBody>
                    </Card>

                    {/* Reduce Access */}
                    <Card>
                      <CardHeader>
                        <p className="font-semibold text-foreground">Reduce Access</p>
                      </CardHeader>
                      <Divider />
                      <CardBody className="gap-4">
                        <Select
                          label="Select Course"
                          value={courseId}
                          onChange={(e) => setCourseId(e.target.value)}
                        >
                          {accesses.map((access: any) => (
                            <SelectItem key={access.course._id} value={access.course._id}>
                              {access.course.title}
                            </SelectItem>
                          ))}
                        </Select>

                        <Input
                          type="number"
                          label="Days to Remove"
                          placeholder="e.g., 7"
                          value={daysToReduce}
                          onChange={(e) => setDaysToReduce(e.target.value)}
                          min="1"
                        />

                        <Button
                          color="danger"
                          onClick={handleReduce}
                          fullWidth
                        >
                          Reduce Access
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
