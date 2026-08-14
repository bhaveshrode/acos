import { ApiOptions } from "./ApiOptions.js";
import { ITokenProvider } from "./TokenProvider.js";

/**
 * ApiContext holding active options and security token providers references.
 */
export class ApiContext {
  constructor(
    public readonly options: ApiOptions,
    public readonly tokenProvider?: ITokenProvider
  ) {
    Object.freeze(this);
  }
}
