import { Payment } from "../../../business/payment/aggregates/Payment.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { PaymentDeserializer } from "../deserializers/PaymentDeserializer.js";
/**
 * Reconstructs the complete Payment aggregate root from historical snapshot state.
 */
export class PaymentHydrator {
    static hydrate(snapshot) {
        const props = PaymentDeserializer.deserialize(snapshot);
        const id = new PaymentId(snapshot.id);
        return new Payment(id, props);
    }
}
