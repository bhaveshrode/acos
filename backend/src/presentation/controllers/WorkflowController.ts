import { BaseController, IMediator } from "./BaseController.js";

/**
 * WorkflowController coordinating transition tasks and step executions.
 */
export class WorkflowController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async initiateWorkflow(body: any): Promise<any> {
    return this.execute({ type: "InitiateWorkflowCommand", body });
  }

  public async getWorkflowById(id: string): Promise<any> {
    return this.execute({ type: "GetWorkflowByIdQuery", id });
  }
}
