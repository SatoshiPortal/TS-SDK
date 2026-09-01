import type { AuthProvider } from './index';

export class ApiKeyAuth implements AuthProvider {
  constructor(private apiKey: string) {}

  getHeaders(): Record<string, string> {
    return { 'X-API-Key': this.apiKey };
  }
}
