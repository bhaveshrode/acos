import { APIExplorer } from "./APIExplorer.js";
import { WebhookSimulator } from "./WebhookSimulator.js";
import { OAuthPlayground } from "./OAuthPlayground.js";
import { EventSimulator } from "./EventSimulator.js";

export class PlaygroundManager {
  public readonly explorer = new APIExplorer();
  public readonly webhookSimulator = new WebhookSimulator();
  public readonly oauthPlayground = new OAuthPlayground();
  public readonly eventSimulator = new EventSimulator();
}
