import { ChannelType } from "../enums/ChannelType.js";

/**
 * Domain Service evaluating and filtering recipient channel routing rules.
 */
export class RecipientPreferencePolicy {
  /**
   * Filters a recipient's preferred channels based on organization capabilities.
   */
  public filterPreferredChannels(
    preferences: ChannelType[],
    allowedChannels: ChannelType[]
  ): ChannelType[] {
    return preferences.filter((p) => allowedChannels.includes(p));
  }
}
