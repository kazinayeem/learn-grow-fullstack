/**
 * Access Control Utility Functions
 * Handles access duration calculation and validation
 */

export type AccessDuration = "1-month" | "2-months" | "3-months" | "lifetime";

/**
 * Calculate access end date based on duration
 */
export const calculateAccessEndDate = (
  duration: AccessDuration,
  startDate?: Date
): Date | null => {
  if (duration === "lifetime") return null;

  const start = startDate || new Date();
  const months = parseInt(duration.split("-")[0]);
  const endDate = new Date(start);
  endDate.setMonth(endDate.getMonth() + months);
  return endDate;
};

/**
 * Check if user has valid access to a course
 */
export const hasValidAccess = (accessEndDate: Date | null): boolean => {
  // If no end date, it's lifetime access
  if (accessEndDate === null) return true;

  // Check if access has expired
  const now = new Date();
  return accessEndDate > now;
};

/**
 * Get remaining days of access
 */
export const getRemainingDays = (accessEndDate: Date | null): number | null => {
  if (accessEndDate === null) return null; // Lifetime

  const now = new Date();
  if (accessEndDate <= now) return 0; // Already expired

  const diffTime = accessEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format remaining access days for display
 */
export const formatRemainingAccess = (accessEndDate: Date | null): string => {
  if (accessEndDate === null) return "Lifetime access";

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
export const isExpiringsoon = (accessEndDate: Date | null): boolean => {
  const remainingDays = getRemainingDays(accessEndDate);
  return remainingDays !== null && remainingDays <= 7 && remainingDays > 0;
};

/**
 * Get access status object
 */
export const getAccessStatus = (accessEndDate: Date | null) => {
  const hasAccess = hasValidAccess(accessEndDate);
  const remainingDays = getRemainingDays(accessEndDate);
  const isExpiringSoon = remainingDays !== null && remainingDays <= 7 && remainingDays > 0;

  return {
    hasAccess,
    remainingDays,
    isExpiringSoon,
    isExpired: remainingDays === 0,
    isLifetime: accessEndDate === null,
    formattedAccess: formatRemainingAccess(accessEndDate),
  };
};
