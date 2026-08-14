import { BaseController, IMediator } from "./BaseController.js";

/**
 * AccountsReceivableController coordinating receivable entries and writeoffs.
 */
export class AccountsReceivableController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async createReceivable(body: any): Promise<any> {
    return this.execute({ type: "CreateReceivableCommand", body });
  }

  public async getReceivableById(id: string): Promise<any> {
    return this.execute({ type: "GetReceivableByIdQuery", id });
  }

  public async writeoffReceivable(id: string): Promise<any> {
    return this.execute({ type: "WriteoffReceivableCommand", id });
  }
}
