import { User } from "../../../business/identity/aggregates/User.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UserSnapshot } from "../snapshots/UserSnapshot.js";
import { UserDeserializer } from "../deserializers/UserDeserializer.js";

/**
 * Reconstructs the complete User aggregate root from historical snapshot state.
 */
export class UserHydrator {
  public static hydrate(snapshot: UserSnapshot): User {
    const props = UserDeserializer.deserialize(snapshot);
    const id = new UserId(snapshot.id);
    return new (User as any)(id, props) as User;
  }
}
