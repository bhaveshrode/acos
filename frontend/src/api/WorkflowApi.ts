import { IRequestExecutor } from "./IRequestExecutor.js";
import { RequestBuilder } from "./RequestBuilder.js";
import { ApiResponse } from "./ApiResponse.js";
import { EndpointDescriptor } from "./EndpointDescriptor.js";

/**
 * WorkflowApi executing workflow states checking operations using EndpointDescriptor.
 */
export class WorkflowApi {
  constructor(private readonly executor: IRequestExecutor) {}

  public async getWorkflow(id: string): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("GET")
      .setUrl(EndpointDescriptor.Workflow.Get(id))
      .build();
    return this.executor.execute(request);
  }

  public async triggerWorkflowAction(id: string, payload: any): Promise<ApiResponse<any>> {
    const request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(EndpointDescriptor.Workflow.TriggerAction(id))
      .setBody(payload)
      .build();
    return this.executor.execute(request);
  }
}
