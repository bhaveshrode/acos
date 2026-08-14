import { Entity } from "../../../foundation/core/Entity.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { OrganizationRole } from "../enums/OrganizationRole.js";
import { MemberStatus } from "../enums/MemberStatus.js";

export interface MemberProps {
  role: OrganizationRole;
  joinedAt: Date;
  status: MemberStatus;
}

/**
 * Child Entity representing a User's membership details inside an Organization.
 * Uses UserId as its unique entity identity.
 */
export class Member extends Entity<UserId> {
  private props: MemberProps;

  constructor(id: UserId, props: MemberProps) {
    super(id);
    this.props = props;
  }

  public get userId(): UserId {
    return this.id;
  }

  public get role(): OrganizationRole { return this.props.role; }
  public get joinedAt(): Date { return this.props.joinedAt; }
  public get status(): MemberStatus { return this.props.status; }

  /**
   * Updates the member's administrative role.
   */
  public updateRole(role: OrganizationRole): void {
    this.props.role = role;
  }

  /**
   * Updates the membership status.
   */
  public updateStatus(status: MemberStatus): void {
    this.props.status = status;
  }
}
