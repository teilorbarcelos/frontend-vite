import { describe, it, expect } from 'vitest';
import { getValueByPath } from '../getValueByPath';

describe('getValueByPath', () => {
  it('resolves simple path', () => {
    const obj = { name: 'John' };
    expect(getValueByPath(obj, 'name')).toBe('John');
  });

  it('resolves nested path', () => {
    const obj = { user: { profile: { email: 'test@test.com' } } };
    expect(getValueByPath(obj, 'user.profile.email')).toBe('test@test.com');
  });

  it('returns undefined for non-existent path', () => {
    const obj = { user: {} };
    expect(getValueByPath(obj, 'user.profile.email')).toBeUndefined();
  });

  it('returns undefined if obj is null or undefined', () => {
    expect(getValueByPath(null, 'name')).toBeUndefined();
    expect(getValueByPath(undefined, 'name')).toBeUndefined();
  });

  it('returns undefined if path is empty', () => {
    expect(getValueByPath({ name: 'John' }, '')).toBeUndefined();
  });

  it('handles intermediate null values', () => {
    const obj = { user: null };
    expect(getValueByPath(obj, 'user.profile.email')).toBeUndefined();
  });
});
