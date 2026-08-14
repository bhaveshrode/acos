import { BaseController, IMediator } from "./BaseController.js";

/**
 * IdentityController coordinating registration and authorization user tokens.
 */
export class IdentityController extends BaseController {
  constructor(mediator: IMediator) {
    super(mediator);
  }

  public async register(body: any): Promise<any> {
    return this.execute({ type: "RegisterUserCommand", body });
  }

  public async login(body: any): Promise<any> {
    return this.execute({ type: "LoginUserCommand", body });
  }

  public async logout(body: any): Promise<any> {
    return this.execute({ type: "LogoutUserCommand", body });
  }
}
