import { BaseController, IMediator } from "./BaseController.js";

/**
 * CustomerController coordinating customer CRUD command mappings.
 */
export class CustomerController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async createCustomer(body: any): Promise<any> {
    return this.execute({ type: "CreateCustomerCommand", body });
  }

  public async getCustomerById(id: string): Promise<any> {
    return this.execute({ type: "GetCustomerByIdQuery", id });
  }

  public async updateCustomer(id: string, body: any): Promise<any> {
    return this.execute({ type: "UpdateCustomerCommand", id, body });
  }

  public async deleteCustomer(id: string): Promise<any> {
    return this.execute({ type: "DeleteCustomerCommand", id });
  }
}
