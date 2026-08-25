/**
 * Formats the current date for injection into agent system prompts.
 * e.g., "Tuesday, August 25, 2026"
 */
export function getCurrentDateFormatted(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
