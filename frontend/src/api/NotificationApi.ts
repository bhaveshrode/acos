import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * NotificationApi executing delivery notification status actions using EndpointDescriptor.
 */
export class NotificationApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getNotification(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Notification.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async sendNotification(payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Notification.Send)
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
