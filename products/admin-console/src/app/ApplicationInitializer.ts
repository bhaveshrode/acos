import { ApplicationContext } from "./ApplicationContext.js";
import { InitState } from "./ApplicationState.js";

/**
 * ApplicationInitializer running startup tasks and configurations loading.
 */
export class ApplicationInitializer {
  public async initialize(context: ApplicationContext): Promise<void> {
    context.state.transitionTo(InitState.Initializing);
    
    // Simulate configuration fetching or dynamic options loading
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    context.state.transitionTo(InitState.Ready);
  }
}
