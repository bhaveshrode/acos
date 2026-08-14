import { WebSocketContext } from "./WebSocketContext.js";
import { ConnectionState } from "./ConnectionState.js";

/**
 * WebSocketAuthenticator validating identity tokens.
 */
export class WebSocketAuthenticator {
  constructor(private readonly tokenProvider?: { validateToken(token: string): Promise<any> }) {}

  /**
   * Validates tokens and updates context properties.
   */
  public async authenticate(context: WebSocketContext, token: string): Promise<boolean> {
    try {
      if (this.tokenProvider) {
        const payload = await this.tokenProvider.validateToken(token);
        if (payload) {
          (context.props as any).state = ConnectionState.Authenticated;
          (context.props as any).userId = payload.userId;
          (context.props as any).tenantId = payload.tenantId;
          return true;
        }
      } else {
        // Mock fallback check
        if (token === "valid-token") {
          (context.props as any).state = ConnectionState.Authenticated;
          (context.props as any).userId = "user-123";
          (context.props as any).tenantId = "tenant-456";
          return true;
        }
      }
    } catch {
      // Fall through
    }
    return false;
  }
}
