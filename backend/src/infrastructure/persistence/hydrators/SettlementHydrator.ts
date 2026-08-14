import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";
import { SettlementSnapshot } from "../snapshots/SettlementSnapshot.js";
import { SettlementDeserializer } from "../deserializers/SettlementDeserializer.js";

/**
 * Reconstructs the complete Settlement aggregate root from historical snapshot state.
 */
export class SettlementHydrator {
  public static hydrate(snapshot: SettlementSnapshot): Settlement {
    const props = SettlementDeserializer.deserialize(snapshot);
    const id = new SettlementId(snapshot.id);
    return new (Settlement as any)(id, props) as Settlement;
  }
}
