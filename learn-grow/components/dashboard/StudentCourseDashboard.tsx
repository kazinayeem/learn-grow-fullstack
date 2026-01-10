import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Spinner,
  Empty,
  Badge,
  Divider,
  Button,
  Link,
} from "@nextui-org/react";
import { useGetUserCourseAccessQuery } from "@/redux/api/accessManagementApi";
import AccessStatusDisplay from "@/components/course/AccessStatusDisplay";
import { hasValidAccess, getRemainingDays, isExpiringSoon } from "@/lib/access-control";
import { IEnrollmentAccess } from "@/types/combo.types";

export default function StudentCourseDashboard() {
  const { data: accessData, isLoading, isError } = useGetUserCourseAccessQuery({});

  const accesses = accessData?.data || [];

  // Separate active and expired courses
  const activeCourses = accesses.filter((access: IEnrollmentAccess) => hasValidAccess(access));
  const expiredCourses = accesses.filter((access: IEnrollmentAccess) => !hasValidAccess(access));

  // Sort active courses by remaining days (expiring soon first)
  const sortedActiveCourses = [...activeCourses].sort((a: IEnrollmentAccess, b: IEnrollmentAccess) => {
    const aRemaining = getRemainingDays(a.accessEndDate);
    const bRemaining = getRemainingDays(b.accessEndDate);
    return aRemaining - bRemaining;
  });

  // Separate combo and single courses
  const comboCourses = sortedActiveCourses.filter((a: IEnrollmentAccess) => a.purchaseType === "combo");
  const singleCourses = sortedActiveCourses.filter((a: IEnrollmentAccess) => a.purchaseType === "single");

  // Count expiring soon (within 7 days)
  const expiringCount = sortedActiveCourses.filter((access: IEnrollmentAccess) =>
    isExpiringSoon(access.accessEndDate)
  ).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="Loading your courses..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <p className="text-danger text-lg">Failed to load your courses</p>
        </CardBody>
      </Card>
    );
  }

  if (accesses.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <p className="text-default-600 text-lg mb-4">
            You haven't purchased any courses yet.
          </p>
          <Button
            as={Link}
            href="/student/combos"
            color="primary"
            size="lg"
          >
            Browse Course Combos
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-foreground">{accesses.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">Active Courses</p>
              <p className="text-2xl font-bold text-success">{activeCourses.length}</p>
            </div>
            <div className="text-4xl">✅</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">Expiring Soon</p>
              <p className={`text-2xl font-bold ${expiringCount > 0 ? "text-warning" : "text-default-400"}`}>
                {expiringCount}
              </p>
            </div>
            <div className="text-4xl">⏰</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row justify-between items-center">
            <div>
              <p className="text-default-500 text-sm">Expired Courses</p>
              <p className="text-2xl font-bold text-danger">{expiredCourses.length}</p>
            </div>
            <div className="text-4xl">❌</div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            aria-label="Course Status"
            classNames={{
              tabList: "w-full rounded-none border-b bg-default-50",
              tab: "px-6 py-4",
              tabContent: "group-data-[selected=true]:text-primary font-semibold",
            }}
          >
            {/* All Active Courses */}
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <span>All Active Courses</span>
                  <Badge color="primary" size="sm">
                    {activeCourses.length}
                  </Badge>
                </div>
              }
            >
              <div className="py-6 space-y-4">
                {sortedActiveCourses.length === 0 ? (
                  <p className="text-center text-default-500 py-6">No active courses</p>
                ) : (
                  sortedActiveCourses.map((access: IEnrollmentAccess) => (
                    <AccessStatusDisplay
                      key={access._id}
                      access={access}
                      courseTitle={access.course?.title}
                      showExtendButton={true}
                    />
                  ))
                )}
              </div>
            </Tab>

            {/* Combo Courses */}
            {comboCourses.length > 0 && (
              <Tab
                key="combo"
                title={
                  <div className="flex items-center gap-2">
                    <span>Combo Courses</span>
                    <Badge color="secondary" size="sm">
                      {comboCourses.length}
                    </Badge>
                  </div>
                }
              >
                <div className="py-6 space-y-4">
                  {comboCourses.map((access: IEnrollmentAccess) => (
                    <AccessStatusDisplay
                      key={access._id}
                      access={access}
                      courseTitle={access.course?.title}
                      showExtendButton={true}
                    />
                  ))}
                </div>
              </Tab>
            )}

            {/* Single Courses */}
            {singleCourses.length > 0 && (
              <Tab
                key="single"
                title={
                  <div className="flex items-center gap-2">
                    <span>Single Courses</span>
                    <Badge color="warning" size="sm">
                      {singleCourses.length}
                    </Badge>
                  </div>
                }
              >
                <div className="py-6 space-y-4">
                  {singleCourses.map((access: IEnrollmentAccess) => (
                    <AccessStatusDisplay
                      key={access._id}
                      access={access}
                      courseTitle={access.course?.title}
                      showExtendButton={true}
                    />
                  ))}
                </div>
              </Tab>
            )}

            {/* Expired Courses */}
            {expiredCourses.length > 0 && (
              <Tab
                key="expired"
                title={
                  <div className="flex items-center gap-2">
                    <span>Expired Courses</span>
                    <Badge color="danger" size="sm">
                      {expiredCourses.length}
                    </Badge>
                  </div>
                }
              >
                <div className="py-6 space-y-4">
                  {expiredCourses.map((access: IEnrollmentAccess) => (
                    <AccessStatusDisplay
                      key={access._id}
                      access={access}
                      courseTitle={access.course?.title}
                      showExtendButton={false}
                    />
                  ))}
                </div>
              </Tab>
            )}
          </Tabs>
        </CardBody>
      </Card>

      {/* Call to Action */}
      {expiredCourses.length > 0 && (
        <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning">
          <CardBody className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Renew Access to Expired Courses
                </h3>
                <p className="text-sm text-default-600">
                  You have {expiredCourses.length} expired course{expiredCourses.length !== 1 ? "s" : ""}. Renew them to continue learning.
                </p>
              </div>
              <Button
                as={Link}
                href="/student/combos"
                color="warning"
                className="font-semibold"
              >
                View Combos
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Combo Recommendation */}
      {activeCourses.length > 0 && activeCourses.length < 5 && (
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary">
          <CardBody className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  💡 Learn More with Combos
                </h3>
                <p className="text-sm text-default-600">
                  Save up to 40% when you purchase multiple courses together in a combo bundle.
                </p>
              </div>
              <Button
                as={Link}
                href="/student/combos"
                color="primary"
                className="font-semibold"
              >
                Explore Combos
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
