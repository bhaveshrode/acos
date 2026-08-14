/**
 * ProductOperationsDashboard exposing system queues and telemetry counts.
 */
export class ProductOperationsDashboard {
  constructor(
    public readonly systemHealthStatus: string,
    public readonly webSocketConnectionCount: number,
    public readonly activeQueueDepth: number,
    public readonly failedWorkflowCount: number,
    public readonly failedPaymentCount: number
  ) {
    Object.freeze(this);
  }
}
