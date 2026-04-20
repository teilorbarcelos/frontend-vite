/**
 * Resolves a value from an object using a dot-notated path string.
 * Example: getValueByPath({ user: { profile: { email: 'a@b.com' } } }, 'user.profile.email') => 'a@b.com'
 */
export function getValueByPath<T>(obj: T, path: string): unknown {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
