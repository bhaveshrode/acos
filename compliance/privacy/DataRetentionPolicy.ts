import { DataClassification } from "./DataClassification.js";

/**
 * DataRetentionPolicy defining duration rules.
 */
export class DataRetentionPolicy {
  constructor(
    public readonly classification: DataClassification,
    public readonly retentionYears: number
  ) {
    Object.freeze(this);
  }
}
