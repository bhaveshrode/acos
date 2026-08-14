import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * OrganizationApi executing settings updates and member additions using EndpointDescriptor.
 */
export class OrganizationApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getOrganization(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Organization.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async addMember(id: string, payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Organization.AddMember(id))
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
