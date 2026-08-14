import { BaseController, IMediator } from "./BaseController.js";

/**
 * InvoiceController coordinating invoice registration, issuing, and cancellations.
 */
export class InvoiceController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async createInvoice(body: any): Promise<any> {
    return this.execute({ type: "CreateInvoiceCommand", body });
  }

  public async getInvoiceById(id: string): Promise<any> {
    return this.execute({ type: "GetInvoiceByIdQuery", id });
  }

  public async issueInvoice(id: string): Promise<any> {
    return this.execute({ type: "IssueInvoiceCommand", id });
  }

  public async cancelInvoice(id: string): Promise<any> {
    return this.execute({ type: "CancelInvoiceCommand", id });
  }
}
