import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Progress,
  Divider,
  Button,
  Link,
  Tooltip,
} from "@nextui-org/react";
import {
  hasValidAccess,
  getRemainingDays,
  formatDate,
  formatRemainingAccess,
  isExpiringSoon,
  getAccessStatus,
  getAccessStatusColor,
} from "@/lib/access-control";
import { IEnrollmentAccess } from "@/types/combo.types";

interface AccessStatusDisplayProps {
  access: IEnrollmentAccess;
  courseTitle?: string;
  showExtendButton?: boolean;
  onExtend?: () => void;
}

export default function AccessStatusDisplay({
  access,
  courseTitle,
  showExtendButton = false,
  onExtend,
}: AccessStatusDisplayProps) {
  const isValid = hasValidAccess(access);
  const remaining = getRemainingDays(access.accessEndDate);
  const expiringIn7Days = isExpiringSoon(access.accessEndDate);
  const statusColor = getAccessStatusColor(access);
  const statusText = getAccessStatus(access);

  // Calculate progress
  let progress = 0;
  if (access.accessDuration && access.accessEndDate) {
    const start = new Date(access.accessStartDate).getTime();
    const end = new Date(access.accessEndDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return (
    <Card className={`border ${statusColor === "success" ? "border-success" : statusColor === "warning" ? "border-warning" : "border-danger"}`}>
      <CardHeader className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {courseTitle && (
            <p className="text-lg font-semibold text-foreground">{courseTitle}</p>
          )}
          <div className="flex gap-2 mt-1">
            <Badge color={statusColor}>
              {statusText}
            </Badge>
            {access.purchaseType === "combo" && (
              <Badge variant="flat" color="primary">
                Combo Access
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* Access Duration Info */}
        {access.accessEndDate ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-default-600">
                  Time Remaining
                </span>
                <span className="text-sm font-bold text-foreground">
                  {remaining} day{remaining !== 1 ? "s" : ""}
                </span>
              </div>
              <Progress
                value={progress}
                color={statusColor as any}
                className="h-2"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-default-500 font-semibold">Started</p>
                <p className="text-foreground">
                  {formatDate(new Date(access.accessStartDate))}
                </p>
              </div>
              <div>
                <p className="text-default-500 font-semibold">Expires</p>
                <p className={`${expiringIn7Days ? "text-warning font-bold" : "text-foreground"}`}>
                  {formatDate(new Date(access.accessEndDate))}
                </p>
              </div>
            </div>

            {/* Warning if expiring soon */}
            {expiringIn7Days && isValid && (
              <div className="bg-warning-50 border border-warning rounded-lg p-3">
                <p className="text-sm text-warning font-semibold">
                  ⚠️ Access expiring in {remaining} day{remaining !== 1 ? "s" : ""}
                </p>
                {showExtendButton && (
                  <Button
                    size="sm"
                    color="warning"
                    variant="light"
                    onClick={onExtend}
                    className="mt-2 font-semibold"
                  >
                    Extend Access Now
                  </Button>
                )}
              </div>
            )}

            {/* Expired message */}
            {!isValid && (
              <div className="bg-danger-50 border border-danger rounded-lg p-3">
                <p className="text-sm text-danger font-semibold">
                  ❌ Access Expired on {formatDate(new Date(access.accessEndDate))}
                </p>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  as={Link}
                  href={`/courses/${access.course._id || ""}`}
                  className="mt-2 font-semibold"
                >
                  Renew Access
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Lifetime Access */
          <div className="bg-success-50 border border-success rounded-lg p-3">
            <p className="text-success font-semibold">
              ✅ Lifetime Access
            </p>
            <p className="text-sm text-default-600 mt-1">
              You have permanent access to this course
            </p>
          </div>
        )}

        {/* Action Button */}
        {isValid && (
          <Button
            as={Link}
            href={`/courses/${access.course._id || ""}`}
            color="primary"
            variant="flat"
            fullWidth
          >
            Continue Learning
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
