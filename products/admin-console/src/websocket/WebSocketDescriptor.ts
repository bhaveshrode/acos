import { WebSocketMetadata } from "./WebSocketMetadata.js";

/**
 * WebSocketDescriptor encapsulating connection descriptors and channel profiles.
 */
export class WebSocketDescriptor {
  constructor(
    public readonly metadata: WebSocketMetadata,
    public readonly clientClass: any,
    public readonly supportedChannels: string[] = []
  ) {
    Object.freeze(this.supportedChannels);
    Object.freeze(this);
  }
}
