import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * IdentityApi executing user registers/logins actions using EndpointDescriptor.
 */
export class IdentityApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async register(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Identity.Register)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }

  public async login(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Identity.Login)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
