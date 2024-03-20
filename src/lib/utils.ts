
/**
 * Transform a cookies.getAll() to 'classic' string
 */
export function cookiesToString(cookiesArray: { name: string, value: string }[]): string {
  return cookiesArray.map(({ name, value }) => `${name}=${value}`).join('; ');
}