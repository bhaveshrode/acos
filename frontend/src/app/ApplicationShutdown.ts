import { ApplicationContext } from "./ApplicationContext.js";
import { InitState } from "./ApplicationState.js";

/**
 * ApplicationShutdown coordinating cleanup processes (e.g. closing socket connections, releasing sub registers).
 */
export class ApplicationShutdown {
  public async shutdown(context: ApplicationContext): Promise<void> {
    context.state.transitionTo(InitState.Shutdown);
    
    // Simulate cleanup tasks
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}
