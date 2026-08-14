import { RequestMetadata } from "./RequestMetadata.js";

/**
 * RequestContext carrying raw HTTP references and metrics metadata.
 */
export class RequestContext {
  constructor(
    public readonly request: any,
    public readonly metadata: RequestMetadata
  ) {}
}
