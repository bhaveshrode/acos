/**
 * ServerConfiguration wrapping presentation port, host, timeout, and compression settings.
 */
export class ServerConfiguration {
  constructor(
    public readonly port: number = 3000,
    public readonly host: string = "localhost",
    public readonly httpsEnabled: boolean = false,
    public readonly bodySizeLimit: string = "10mb",
    public readonly requestTimeout: number = 30000,
    public readonly corsEnabled: boolean = true,
    public readonly compressionEnabled: boolean = true,
    public readonly swaggerEnabled: boolean = true
  ) {}
}
