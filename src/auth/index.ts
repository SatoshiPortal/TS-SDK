export interface AuthProvider {
  getHeaders(): Record<string, string> | Promise<Record<string, string>>;
}
