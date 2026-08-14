import { AccountsReceivable } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { ReceivableSnapshot } from "../snapshots/ReceivableSnapshot.js";
import { ReceivableDeserializer } from "../deserializers/ReceivableDeserializer.js";

/**
 * Reconstructs the complete AccountsReceivable aggregate root from historical snapshot state.
 */
export class ReceivableHydrator {
  public static hydrate(snapshot: ReceivableSnapshot): AccountsReceivable {
    const props = ReceivableDeserializer.deserialize(snapshot);
    const id = new ReceivableAccountId(snapshot.id);
    return new (AccountsReceivable as any)(id, props) as AccountsReceivable;
  }
}
