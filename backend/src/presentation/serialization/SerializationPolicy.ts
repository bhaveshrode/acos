/**
 * SerializationPolicy defines supported formats and behaviors.
 */
export class SerializationPolicy {
  constructor(
    public readonly supportedMediaTypes: string[] = ["application/json", "application/xml"],
    public readonly defaultMediaType: string = "application/json"
  ) {}
}
