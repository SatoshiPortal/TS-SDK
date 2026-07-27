import type { AuthProvider } from './index';

/**
 * Cookie-based auth for client-side usage.
 * Relies on browser automatically sending cookies with requests.
 * Requires `credentials: 'include'` on fetch calls.
 */
export class CookieAuth implements AuthProvider {
  getHeaders(): Record<string, string> {
    return {};
  }
}
