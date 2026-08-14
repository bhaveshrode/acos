import { BaseController, IMediator } from "./BaseController.js";

/**
 * SettlementController coordinating asset settlements and confirmations.
 */
export class SettlementController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async initiateSettlement(body: any): Promise<any> {
    return this.execute({ type: "InitiateSettlementCommand", body });
  }

  public async getSettlementById(id: string): Promise<any> {
    return this.execute({ type: "GetSettlementByIdQuery", id });
  }

  public async completeSettlement(id: string): Promise<any> {
    return this.execute({ type: "CompleteSettlementCommand", id });
  }
}
