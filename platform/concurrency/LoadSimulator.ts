import { PlatformIdempotency } from "../consistency/PlatformIdempotency.js";

export class LoadSimulator {
  public async runConcurrentPayments(
    mediator: any,
    commands: Array<{ idempotencyKey: string; payload: any }>,
    idempotency: PlatformIdempotency
  ): Promise<{ succeeded: number; failed: number; bypassed: number; results: any[] }> {
    let succeeded = 0;
    let failed = 0;
    
    // We execute in parallel to simulate concurrent HTTP thread pools
    const results = await Promise.all(
      commands.map(async (cmd) => {
        try {
          const res = await idempotency.execute(cmd.idempotencyKey, async () => {
            const response = await mediator.send(cmd.payload);
            if (!response.isSuccess) {
              throw new Error(response.error);
            }
            succeeded++;
            return response.value;
          });
          return { success: true, data: res };
        } catch (err: any) {
          failed++;
          return { success: false, error: err.message || String(err) };
        }
      })
    );

    const successfulResultsCount = results.filter((r) => r.success).length;
    const bypassed = successfulResultsCount - succeeded;

    return {
      succeeded,
      failed,
      bypassed,
      results
    };
  }
}
