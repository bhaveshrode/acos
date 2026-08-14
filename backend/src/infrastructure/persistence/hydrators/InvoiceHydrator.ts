import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { InvoiceSnapshot } from "../snapshots/InvoiceSnapshot.js";
import { InvoiceDeserializer } from "../deserializers/InvoiceDeserializer.js";

/**
 * Reconstructs the complete Invoice aggregate root from historical snapshot state.
 */
export class InvoiceHydrator {
  public static hydrate(snapshot: InvoiceSnapshot): Invoice {
    const props = InvoiceDeserializer.deserialize(snapshot);
    const id = new InvoiceId(snapshot.id);
    return new (Invoice as any)(id, props) as Invoice;
  }
}
