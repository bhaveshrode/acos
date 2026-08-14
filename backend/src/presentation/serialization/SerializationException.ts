/**
 * SerializationException thrown when data encoding or decoding processes fail.
 */
export class SerializationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SerializationException";
  }
}
