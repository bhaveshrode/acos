/**
 * ContainerImage representing cataloged image names and tags.
 */
export class ContainerImage {
  constructor(
    public readonly name: string,
    public readonly tag: string = "latest"
  ) {
    Object.freeze(this);
  }
}
