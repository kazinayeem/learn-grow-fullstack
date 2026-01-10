import { IAccessStatus } from "@/types/combo.types";

/**
 * Check if access is still valid
 */
export const hasValidAccess = (accessEndDate: string | null | undefined): boolean => {
  if (!accessEndDate) return true; // null = lifetime
  const now = new Date();
  return new Date(accessEndDate) > now;
};

/**
 * Get remaining days of access
 */
export const getRemainingDays = (accessEndDate: string | null | undefined): number | null => {
  if (!accessEndDate) return null; // Lifetime

  const now = new Date();
  const endDate = new Date(accessEndDate);

  if (endDate <= now) return 0; // Already expired

  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format remaining access for display
 */
export const formatRemainingAccess = (accessEndDate: string | null | undefined): string => {
  if (!accessEndDate) return "Lifetime access";

  const remainingDays = getRemainingDays(accessEndDate);
  if (remainingDays === null) return "Lifetime access";
  if (remainingDays === 0) return "Expired";
  if (remainingDays === 1) return "1 day left";
  if (remainingDays <= 7) return `${remainingDays} days left`;
  if (remainingDays <= 30) return `${Math.floor(remainingDays / 7)} weeks left`;
  if (remainingDays <= 90) return `${Math.floor(remainingDays / 30)} months left`;

  return `${Math.floor(remainingDays / 365)} years left`;
};

/**
 * Check if access is expiring soon (within 7 days)
 */
export const isExpiringSoon = (accessEndDate: string | null | undefined): boolean => {
  const remainingDays = getRemainingDays(accessEndDate);
  return remainingDays !== null && remainingDays <= 7 && remainingDays > 0;
};

/**
 * Check if access is expired
 */
export const isExpired = (accessEndDate: string | null | undefined): boolean => {
  const remainingDays = getRemainingDays(accessEndDate);
  return remainingDays === 0;
};

/**
 * Get comprehensive access status
 */
export const getAccessStatus = (accessEndDate: string | null | undefined): IAccessStatus => {
  const hasAccess = hasValidAccess(accessEndDate);
  const remainingDays = getRemainingDays(accessEndDate);
  const expiringSoon = remainingDays !== null && remainingDays <= 7 && remainingDays > 0;

  return {
    hasAccess,
    remainingDays,
    isExpiringSoon: expiringSoon,
    isExpired: remainingDays === 0,
    isLifetime: accessEndDate === null || accessEndDate === undefined,
    formattedAccess: formatRemainingAccess(accessEndDate),
  };
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "Lifetime";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get color for access status badge
 */
export const getAccessStatusColor = (accessEndDate: string | null | undefined): string => {
  const status = getAccessStatus(accessEndDate);

  if (status.isLifetime) return "success";
  if (status.isExpired) return "danger";
  if (status.isExpiringSoon) return "warning";
  return "primary";
};

/**
 * Get label for duration option
 */
export const getDurationLabel = (duration: "1-month" | "2-months" | "3-months" | "lifetime"): string => {
  const labels: Record<string, string> = {
    "1-month": "1 Month",
    "2-months": "2 Months",
    "3-months": "3 Months",
    lifetime: "Lifetime",
  };
  return labels[duration] || duration;
};

/**
 * Calculate end date from duration
 */
export const calculateEndDate = (
  duration: "1-month" | "2-months" | "3-months" | "lifetime",
  startDate: Date = new Date()
): Date | null => {
  if (duration === "lifetime") return null;

  const months = parseInt(duration.split("-")[0]);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
};
