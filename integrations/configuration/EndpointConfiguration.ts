/**
 * EndpointConfiguration containing base URLs and versions.
 */
export class EndpointConfiguration {
  constructor(
    public readonly baseUrl: string,
    public readonly version: string = "v1"
  ) {
    Object.freeze(this);
  }
}
