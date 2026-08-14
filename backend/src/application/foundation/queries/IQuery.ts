import { IRequest } from "../commands/IRequest.js";

/**
 * Contract representing an application read request (Query).
 */
export interface IQuery<TResponse> extends IRequest<TResponse> {
  // Marker contract for Queries
}
