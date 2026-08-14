import { BaseController, IMediator } from "./BaseController.js";

/**
 * OrganizationController coordinating memberships and invitations.
 */
export class OrganizationController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async createOrganization(body: any): Promise<any> {
    return this.execute({ type: "CreateOrganizationCommand", body });
  }

  public async getOrganization(id: string): Promise<any> {
    return this.execute({ type: "GetOrganizationQuery", id });
  }
}
