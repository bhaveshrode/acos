/**
 * EvidenceRequirement detailing validation rules.
 */
export class EvidenceRequirement {
  constructor(
    public readonly code: string,
    public readonly description: string
  ) {
    Object.freeze(this);
  }
}
