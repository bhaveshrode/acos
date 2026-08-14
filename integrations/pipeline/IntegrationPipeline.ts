import { ResiliencePolicy } from "../resilience/ResiliencePolicy.js";

/**
 * IntegrationPipeline routing payload mappings through custom resilience policies.
 */
export class IntegrationPipeline {
  constructor(public readonly policy: ResiliencePolicy = new ResiliencePolicy()) {}

  public async sendRequest<TIn, TOut>(
    payload: TIn,
    serialize: (input: TIn) => string,
    call: (raw: string) => Promise<string>,
    deserialize: (rawOut: string) => TOut
  ): Promise<TOut> {
    const rawRequest = serialize(payload);
    const rawResponse = await this.policy.execute(async () => {
      return await call(rawRequest);
    });
    return deserialize(rawResponse);
  }
}
