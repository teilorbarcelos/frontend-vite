import { format } from 'date-fns';

/**
 * Safely gets permissions from a role object.
 * This helps with V8 branch coverage by isolating the fallback logic.
 */
export const getRolePermissions = (role: { permissions?: unknown[] } | null | undefined): unknown[] => {
  if (!role) return [];
  return role.permissions ? (role.permissions as unknown[]) : [];
};

/**
 * Validates if a page number is within the valid range.
 * This helps with V8 branch coverage by isolating boundary checks.
 */
export const isPageInRange = (page: number, totalPages: number): boolean => {
  if (page < 0) return false;
  if (page >= totalPages) return false;
  return true;
};

/**
 * Formats date range for filter submission.
 */
export const formatDateRange = (name: string, from: Date, to?: Date | null): Record<string, string> => {
  const result: Record<string, string> = {};
  result[`${name}_start`] = format(from, 'yyyy-MM-dd');
  
  // If to is missing, use from (covers the || branch)
  const endDate = to ?? from;
  result[`${name}_end`] = format(endDate, 'yyyy-MM-dd');
  
  return result;
};

/**
 * Checks if toast removal should be triggered.
 */
export const shouldTriggerToastRemoval = (isOpen: boolean): boolean => {
  return !isOpen;
};
