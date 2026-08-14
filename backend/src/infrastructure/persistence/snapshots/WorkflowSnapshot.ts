/**
 * Infrastructure snapshot model for the Workflow aggregate.
 */
export interface WorkflowSnapshot {
  id: string;
  organizationId: string;
  reference: string;
  name: string;
  status: string;
  priority: string;
  deadline: Date;
  escalationLevel: string;
  escalationPolicy: {
    level1: number;
    level2: number;
    level3: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    assignee: string | null;
    dueDate: Date | null;
    status: string;
    required: boolean;
    completedAt: Date | null;
    rejectionReason: string | null;
  }>;
  history: Array<{
    id: string;
    action: string;
    actor: string | null;
    timestamp: Date;
  }>;
  assignments: Array<{
    id: string;
    assignee: string;
    assignedAt: Date;
  }>;
  comments: Array<{
    id: string;
    content: string;
    actor: string;
    createdAt: Date;
  }>;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
