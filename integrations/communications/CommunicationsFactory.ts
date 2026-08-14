import { SendGridAdapter } from "./SendGridAdapter.js";
import { TwilioAdapter } from "./TwilioAdapter.js";
import { ICommunicationProvider } from "./ICommunicationProvider.js";

/**
 * CommunicationsFactory constructing email/SMS providers.
 */
export class CommunicationsFactory {
  public static createSendGridAdapter(): ICommunicationProvider {
    return new SendGridAdapter();
  }

  public static createTwilioAdapter(): ICommunicationProvider {
    return new TwilioAdapter();
  }

  public createSendGridAdapter(): ICommunicationProvider {
    return CommunicationsFactory.createSendGridAdapter();
  }

  public createTwilioAdapter(): ICommunicationProvider {
    return CommunicationsFactory.createTwilioAdapter();
  }
}
