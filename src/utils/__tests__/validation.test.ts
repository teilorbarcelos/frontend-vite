import { describe, it, expect } from 'vitest';
import { getRolePermissions, isPageInRange, formatDateRange, shouldTriggerToastRemoval } from '../validation';

describe('Validation Utilities Coverage', () => {
  describe('getRolePermissions', () => {
    it('returns empty array for null/undefined role', () => {
      expect(getRolePermissions(null)).toEqual([]);
      expect(getRolePermissions(undefined)).toEqual([]);
    });

    it('returns empty array when permissions is missing/null', () => {
      expect(getRolePermissions({})).toEqual([]);
      expect(getRolePermissions({ permissions: null })).toEqual([]);
    });

    it('returns permissions when present', () => {
      const perms = [{ feature: 'test' }];
      expect(getRolePermissions({ permissions: perms })).toEqual(perms);
    });
  });

  describe('isPageInRange', () => {
    it('returns false for page < 0', () => {
      expect(isPageInRange(-1, 5)).toBe(false);
    });

    it('returns false for page >= totalPages', () => {
      expect(isPageInRange(5, 5)).toBe(false);
      expect(isPageInRange(6, 5)).toBe(false);
    });

    it('returns true for valid page', () => {
      expect(isPageInRange(0, 5)).toBe(true);
      expect(isPageInRange(4, 5)).toBe(true);
    });
  });

  describe('formatDateRange', () => {
    it('uses "from" as fallback for "to"', () => {
      const date = new Date(2023, 0, 1); // Jan 1st
      const result = formatDateRange('date', date, null);
      expect(result.date_end).toBe('2023-01-01');
    });

    it('uses "to" when present', () => {
      const from = new Date(2023, 0, 1);
      const to = new Date(2023, 0, 2);
      const result = formatDateRange('date', from, to);
      expect(result.date_end).toBe('2023-01-02');
    });
  });

  describe('shouldTriggerToastRemoval', () => {
    it('returns true when isOpen is false', () => {
      expect(shouldTriggerToastRemoval(false)).toBe(true);
    });

    it('returns false when isOpen is true', () => {
      expect(shouldTriggerToastRemoval(true)).toBe(false);
    });
  });
});
