export interface SerializationOptions {
  contentType?: string;
  prettyPrint?: boolean;
  apiVersion?: string;
}

/**
 * SerializationContext encapsulating current payload settings, content type targets, and api version scopes.
 */
export class SerializationContext {
  constructor(public readonly options: SerializationOptions = {}) {}
}
