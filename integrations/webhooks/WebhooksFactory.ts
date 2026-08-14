import { WebhookRegistry } from "./WebhookRegistry.js";
import { WebhookReceiver } from "./WebhookReceiver.js";
import { SignatureValidator } from "./SignatureValidator.js";
import { EventParser } from "./EventParser.js";
import { EventRouter } from "./EventRouter.js";
import { EventDispatcher } from "./EventDispatcher.js";

/**
 * WebhooksFactory composing receiver, validator, router, and dispatcher pipelines.
 */
export class WebhooksFactory {
  public static createRegistry(): WebhookRegistry {
    return new WebhookRegistry();
  }

  public static createReceiver(): WebhookReceiver {
    return new WebhookReceiver();
  }

  public static createValidator(): SignatureValidator {
    return new SignatureValidator();
  }

  public static createParser(): EventParser {
    return new EventParser();
  }

  public static createRouter(registry: WebhookRegistry): EventRouter {
    return new EventRouter(registry);
  }

  public static createDispatcher(): EventDispatcher {
    return new EventDispatcher();
  }

  public createRegistry(): WebhookRegistry {
    return WebhooksFactory.createRegistry();
  }

  public createReceiver(): WebhookReceiver {
    return WebhooksFactory.createReceiver();
  }

  public createValidator(): SignatureValidator {
    return WebhooksFactory.createValidator();
  }

  public createParser(): EventParser {
    return WebhooksFactory.createParser();
  }

  public createRouter(registry: WebhookRegistry): EventRouter {
    return WebhooksFactory.createRouter(registry);
  }

  public createDispatcher(): EventDispatcher {
    return WebhooksFactory.createDispatcher();
  }
}
