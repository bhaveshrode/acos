import { BaseController, IMediator } from "./BaseController.js";

/**
 * PaymentController coordinating payment initiates and confirmations.
 */
export class PaymentController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async initiatePayment(body: any): Promise<any> {
    return this.execute({ type: "InitiatePaymentCommand", body });
  }

  public async getPaymentById(id: string): Promise<any> {
    return this.execute({ type: "GetPaymentByIdQuery", id });
  }

  public async confirmPayment(id: string): Promise<any> {
    return this.execute({ type: "ConfirmPaymentCommand", id });
  }
}
