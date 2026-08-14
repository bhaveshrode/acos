/**
 * Contract representing an application request that returns a response of type TResponse.
 */
export interface IRequest<TResponse> {
  // Structural branding property to assist TypeScript compile-time checks
  readonly requestType?: TResponse;
}
