import { Payment, PaymentId } from "acos-backend";
import { PaymentSnapshot } from "../snapshots/PaymentSnapshot.js";
import { PaymentDeserializer } from "../deserializers/PaymentDeserializer.js";

/**
 * Reconstructs the complete Payment aggregate root from historical snapshot state.
 */
export class PaymentHydrator {
  public static hydrate(snapshot: PaymentSnapshot): Payment {
    const props = PaymentDeserializer.deserialize(snapshot);
    const id = new PaymentId(snapshot.id);
    return new (Payment as any)(id, props) as Payment;
  }
}
