import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerDeserializer } from "../deserializers/CustomerDeserializer.js";
/**
 * Reconstructs the complete Customer aggregate root from historical snapshot state.
 */
export class CustomerHydrator {
    static hydrate(snapshot) {
        const props = CustomerDeserializer.deserialize(snapshot);
        const id = new CustomerId(snapshot.id);
        return new Customer(id, props);
    }
}
