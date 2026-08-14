/**
 * Physical database schema mapping interface for workflow records.
 */
export interface WorkflowTable {
  id: string;
  organizationId: string;
  reference: string;
  name: string;
  status: string;
  priority: string;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Physical database schema mapping interface for workflow task records.
 */
export interface WorkflowTaskTable {
  id: string;
  workflowId: string;
  title: string;
  assignee: string | null;
  dueDate: Date | null;
  status: string;
  required: boolean;
  completedAt: Date | null;
  rejectionReason: string | null;
}
