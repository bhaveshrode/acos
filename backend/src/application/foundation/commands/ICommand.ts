import { IRequest } from "./IRequest.js";

/**
 * Contract representing an application state modification request (Command).
 */
export interface ICommand<TResponse> extends IRequest<TResponse> {
  // Marker contract for Commands
}
