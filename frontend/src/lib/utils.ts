/**
 * Tiny className merger — replaces shadcn's cn() from lib/utils.
 * Filters falsy values and joins the rest with a space.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
