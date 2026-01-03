/**
 * Date utility functions to handle timezone conversions properly
 * This fixes issues where dates appear different on localhost vs deployed servers
 */

/**
 * Convert a local date and time to UTC ISO string for storage
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format (24-hour)
 * @returns ISO string in UTC
 */
export function localDateTimeToUTC(date: string, time: string): string {
  // Create date in local timezone
  const localDate = new Date(`${date}T${time}`);
  return localDate.toISOString();
}

/**
 * Convert UTC ISO string to local date string (YYYY-MM-DD)
 * @param isoString - ISO date string in UTC
 * @returns Date string in YYYY-MM-DD format in local timezone
 */
export function utcToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

/**
 * Convert UTC ISO string to local time string (HH:MM)
 * @param isoString - ISO date string in UTC
 * @returns Time string in HH:MM format (24-hour) in local timezone
 */
export function utcToLocalTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format a date for display with locale consideration
 * @param isoString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(isoString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date and time for display with locale consideration
 * @param isoString - ISO date string
 * @param dateOptions - Options for date formatting
 * @param timeOptions - Options for time formatting
 * @returns Formatted date and time string
 */
export function formatDateTime(
  isoString: string,
  dateOptions?: Intl.DateTimeFormatOptions,
  timeOptions?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(isoString);
  
  const defaultDateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...dateOptions,
  };
  
  const defaultTimeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...timeOptions,
  };
  
  const dateStr = date.toLocaleDateString('en-US', defaultDateOptions);
  const timeStr = date.toLocaleTimeString('en-US', defaultTimeOptions);
  
  return `${dateStr} at ${timeStr}`;
}

/**
 * Get days remaining until a date
 * @param isoString - ISO date string
 * @returns Number of days remaining (can be negative if date has passed)
 */
export function getDaysRemaining(isoString: string): number {
  const targetDate = new Date(isoString);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past
 * @param isoString - ISO date string
 * @returns true if the date has passed
 */
export function isPast(isoString: string): boolean {
  return new Date(isoString) < new Date();
}

/**
 * Check if a date is in the future
 * @param isoString - ISO date string
 * @returns true if the date is yet to come
 */
export function isFuture(isoString: string): boolean {
  return new Date(isoString) > new Date();
}
