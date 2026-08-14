import { Readable } from "stream";

/**
 * Stream helper utilities for efficient low-memory file handling.
 */
export class StorageStream {
  /**
   * Convers a Buffer into a Readable stream.
   */
  public static bufferToStream(buffer: Buffer): Readable {
    return Readable.from(buffer);
  }

  /**
   * Aggregates a Readable stream into a single Buffer.
   */
  public static async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: any[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
