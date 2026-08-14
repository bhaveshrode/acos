export interface ControllerContextProps {
  currentUser?: { id: string; role: string };
  organizationId?: string;
  correlationId: string;
  requestId: string;
  ipAddress?: string;
}

/**
 * ControllerContext wrapping user identities, request context IDs, and IP addresses.
 */
export class ControllerContext {
  constructor(public readonly props: ControllerContextProps) {}
}
