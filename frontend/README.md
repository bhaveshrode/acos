# ACOS Admin Frontend

The frontend workspace hosts the client-side Admin Control Panel code. It governs layout rendering, real-time message notifications, user session states, themes, analytics consent tracking, and route-protection guards.

---

## 🎨 Layout & Architecture Map

-   **[src/configuration](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/configuration)**: Setup configuration providers, endpoints, and client environment flags.
-   **[src/themes](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/themes)**: Standard theme management resolvers (Dark Mode, Light Mode, and System Default detection).
-   **[src/authentication](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/authentication)**: Secure client-side session handlers, memory cookie stores, and session expiration monitors.
-   **[src/routing](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/routing)**: Client-side routing engines, path matching registries, navigation pipelines, and route guards.
-   **[src/state](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/state)**: Local reactive stores managing active components and page variables.
-   **[src/validation](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/validation)**: Declarative form validation schemas (e.g., checking mandatory parameter rules).
-   **[src/websocket](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/websocket)**: Keeps websocket channels alive (Heartbeats) and buffers offline messages for synchronization.
-   **[src/notifications](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/notifications)**: Enqueues dynamic alerts and toasts to notify administrators of invoice lifecycle transitions.
-   **[src/analytics](file:///d:/Blockchain_Projects/Autonomous%20Commerce%20OS%20%28ACOS%29/frontend/src/analytics)**: Standard client telemetry tracking, backing consent management logic (e.g., compliance policies).

---

## ⚙️ How It Works

1.  **Bootstrap**: Resolves client configuration and activates the selected theme (falling back to system settings).
2.  **Navigation**: The `NavigationManager` intercepts path modifications, runs authentication checks (verifying claims permissions), and forwards the request to route renderers.
3.  **Real-Time Subscriptions**: When an administrator connects, websocket message channels register subscription pipes to update analytics graphs in real-time upon receiving outbox confirmations.
4.  **Local Buffering**: If the system detects network degradation, websocket message buffers queue outbound calls locally and synchronizes once connectivity status returns.

---

## 🧪 Testing

The frontend automated suite uses **Vitest** to run E2E layouts, state mutations, route validation guards, theme resolutions, and WebSocket buffering scenarios:

```bash
# Run tests
npm test
```
