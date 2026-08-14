/**
 * ApiOptions defining client communications configurations parameters.
 */
export interface ApiOptions {
  baseUrl: string;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  withCredentials?: boolean;
}
