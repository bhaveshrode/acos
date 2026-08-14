import { IRouteGuard } from "./IRouteGuard.js";
import { RouteContext } from "./RouteContext.js";
import { GuardResult } from "./GuardResult.js";

/**
 * GuardPipeline sequentially executing registered guards, returning a composite GuardResult.
 */
export class GuardPipeline {
  public async execute(guards: IRouteGuard[], context: RouteContext): Promise<GuardResult> {
    for (const guard of guards) {
      const result = await guard.canActivate(context);
      if (!result.allowed) {
        return result;
      }
    }
    return GuardResult.allow();
  }
}
