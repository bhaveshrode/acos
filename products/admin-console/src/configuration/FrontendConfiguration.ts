/**
 * FrontendConfiguration defining runtime client-side settings.
 */
export interface FrontendConfiguration {
  api: {
    baseUrl: string;
    timeoutMs: number;
  };
  ws: {
    url: string;
    reconnectIntervalMs: number;
  };
  features: {
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  theme: {
    defaultMode: "light" | "dark";
  };
}
