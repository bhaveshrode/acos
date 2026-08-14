import { IWorkflowRepository } from "../../../business/workflow/repositories/IWorkflowRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowId } from "../../../business/workflow/value-objects/WorkflowId.js";
import { WorkflowReference } from "../../../business/workflow/value-objects/WorkflowReference.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { AssignmentReference } from "../../../business/workflow/value-objects/AssignmentReference.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { WorkflowExtractor } from "../../persistence/extractors/WorkflowExtractor.js";
import { WorkflowHydrator } from "../../persistence/hydrators/WorkflowHydrator.js";

/**
 * Concrete infrastructure repository implementing Workflow persistence operations.
 */
export class WorkflowRepository extends BaseRepository implements IWorkflowRepository {
  public async findById(id: WorkflowId): Promise<Result<Workflow>> {
    try {
      const row = await (this.prisma as any).workflow.findUnique({
        where: { id: id.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Workflow with ID ${id.value} not found.`));
      }

      const tasks = await (this.prisma as any).workflowTask.findMany({
        where: { workflowId: id.value }
      });
      const history = await (this.prisma as any).workflowHistory.findMany({
        where: { workflowId: id.value }
      });
      const assignments = await (this.prisma as any).workflowAssignment.findMany({
        where: { workflowId: id.value }
      });
      const comments = await (this.prisma as any).workflowComment.findMany({
        where: { workflowId: id.value }
      });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        reference: row.reference,
        name: row.name,
        status: row.status,
        priority: row.priority,
        deadline: row.deadline,
        escalationLevel: row.escalationLevel,
        escalationPolicy: {
          level1: row.level1Threshold,
          level2: row.level2Threshold,
          level3: row.level3Threshold
        },
        tasks: tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee,
          dueDate: t.dueDate,
          status: t.status,
          required: t.required,
          completedAt: t.completedAt,
          rejectionReason: t.rejectionReason
        })),
        history: history.map((h: any) => ({
          id: h.id,
          action: h.action,
          actor: h.actor,
          timestamp: h.timestamp
        })),
        assignments: assignments.map((a: any) => ({
          id: a.id,
          assignee: a.assignee,
          assignedAt: a.assignedAt
        })),
        comments: comments.map((c: any) => ({
          id: c.id,
          content: c.content,
          actor: c.actor,
          createdAt: c.createdAt
        })),
        metadata: row.metadata,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = WorkflowHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByReference(orgId: OrganizationId, ref: WorkflowReference): Promise<Result<Workflow>> {
    try {
      const row = await (this.prisma as any).workflow.findFirst({
        where: {
          organizationId: orgId.value,
          reference: ref.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Workflow with reference ${ref.value} under organization ${orgId.value} not found.`
          )
        );
      }

      return this.findById(new WorkflowId(row.id));
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findRunning(orgId: OrganizationId): Promise<Result<Workflow[]>> {
    try {
      const rows = await (this.prisma as any).workflow.findMany({
        where: {
          organizationId: orgId.value,
          status: "RUNNING"
        }
      });

      const aggregates: Workflow[] = [];
      for (const row of rows) {
        const res = await this.findById(new WorkflowId(row.id));
        if (res.isSuccess) {
          aggregates.push(res.value);
        }
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByAssignee(orgId: OrganizationId, assignee: AssignmentReference): Promise<Result<Workflow[]>> {
    try {
      const taskRows = await (this.prisma as any).workflowTask.findMany({
        where: { assignee: assignee.value }
      });

      const workflowIds = Array.from(new Set(taskRows.map((t: any) => t.workflowId)));
      const aggregates: Workflow[] = [];

      for (const wid of workflowIds) {
        const res = await this.findById(new WorkflowId(wid));
        if (res.isSuccess && res.value.organizationId.value === orgId.value) {
          aggregates.push(res.value);
        }
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(workflow: Workflow): Promise<Result<void>> {
    try {
      const {
        workflow: workflowRow,
        tasks,
        history,
        assignments,
        comments
      } = WorkflowExtractor.extract(workflow);

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.workflow.upsert({
          where: { id: workflowRow.id },
          create: workflowRow,
          update: workflowRow
        });

        // Sync tasks
        await txPrisma.workflowTask.deleteMany({ where: { workflowId: workflowRow.id } });
        if (tasks.length > 0) {
          await txPrisma.workflowTask.createMany({ data: tasks });
        }

        // Sync history
        await txPrisma.workflowHistory.deleteMany({ where: { workflowId: workflowRow.id } });
        if (history.length > 0) {
          await txPrisma.workflowHistory.createMany({ data: history });
        }

        // Sync assignments
        await txPrisma.workflowAssignment.deleteMany({ where: { workflowId: workflowRow.id } });
        if (assignments.length > 0) {
          await txPrisma.workflowAssignment.createMany({ data: assignments });
        }

        // Sync comments
        await txPrisma.workflowComment.deleteMany({ where: { workflowId: workflowRow.id } });
        if (comments.length > 0) {
          await txPrisma.workflowComment.createMany({ data: comments });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: WorkflowId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.workflowTask.deleteMany({ where: { workflowId: id.value } });
        await txPrisma.workflowHistory.deleteMany({ where: { workflowId: id.value } });
        await txPrisma.workflowAssignment.deleteMany({ where: { workflowId: id.value } });
        await txPrisma.workflowComment.deleteMany({ where: { workflowId: id.value } });
        await txPrisma.workflow.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
