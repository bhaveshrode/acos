import { EndpointDocument } from "./EndpointDocument.js";

/**
 * OperationBuilder creating endpoint operation descriptors.
 */
export class OperationBuilder {
  public createOperation(
    method: string,
    path: string,
    summary: string,
    responses: Record<string, string> = { "200": "Success" }
  ): EndpointDocument {
    return new EndpointDocument(method, path, summary, [], undefined, responses);
  }
}
