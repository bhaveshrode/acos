import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerSnapshot } from "../snapshots/CustomerSnapshot.js";
import { CustomerDeserializer } from "../deserializers/CustomerDeserializer.js";

/**
 * Reconstructs the complete Customer aggregate root from historical snapshot state.
 */
export class CustomerHydrator {
  public static hydrate(snapshot: CustomerSnapshot): Customer {
    const props = CustomerDeserializer.deserialize(snapshot);
    const id = new CustomerId(snapshot.id);
    return new (Customer as any)(id, props) as Customer;
  }
}
