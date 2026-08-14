/**
 * DTO carrying parameters for creating a new Workflow.
 */
export interface CreateWorkflowRequestDto {
  organizationId: string;
  reference: string;
  name: string;
  priority: string;
  deadline: string;
  tasks: Array<{
    title: string;
    assignee?: string;
    dueDate?: string;
    required?: boolean;
  }>;
}
