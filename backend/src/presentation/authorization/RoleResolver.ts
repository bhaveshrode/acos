/**
 * RoleResolver mapping userId properties to assigned roles collections.
 */
export class RoleResolver {
  public resolveRoles(userId: string): string[] {
    if (userId === "user-admin") return ["admin"];
    if (userId === "user-editor") return ["editor"];
    return ["user"];
  }
}
