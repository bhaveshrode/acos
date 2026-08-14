/**
 * DTO representing detailed Workflow properties.
 */
export interface WorkflowResponseDto {
  id: string;
  organizationId: string;
  reference: string;
  name: string;
  status: string;
  priority: string;
  deadline: string;
  tasks: Array<{
    id: string;
    title: string;
    assignee: string | null;
    dueDate: string | null;
    status: string;
    required: boolean;
  }>;
  createdAt: string;
}
