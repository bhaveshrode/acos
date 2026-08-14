import { ContainerState } from "./ContainerState.js";

/**
 * ContainerInstance representing active running container instances.
 */
export class ContainerInstance {
  constructor(
    public readonly instanceId: string,
    public readonly state: ContainerState = ContainerState.Stopped
  ) {
    Object.freeze(this);
  }
}
