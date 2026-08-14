/**
 * RetentionPolicy containing target resource name and allowed age in years.
 */
export class RetentionPolicy {
  constructor(
    public readonly targetResourceName: string,
    public readonly allowedAgeYears: number
  ) {
    Object.freeze(this);
  }
}
