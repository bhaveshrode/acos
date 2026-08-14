import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { WorkflowId } from "../value-objects/WorkflowId.js";
import { WorkflowReference } from "../value-objects/WorkflowReference.js";
import { WorkflowName } from "../value-objects/WorkflowName.js";
import { TaskTitle } from "../value-objects/TaskTitle.js";
import { DueDate } from "../value-objects/DueDate.js";
import { WorkflowPriority } from "../value-objects/WorkflowPriority.js";
import { WorkflowDeadline } from "../value-objects/WorkflowDeadline.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";
import { EscalationPolicy } from "../value-objects/EscalationPolicy.js";
import { WorkflowTask } from "../entities/WorkflowTask.js";
import { Workflow } from "../aggregates/Workflow.js";
import { WorkflowStatus } from "../enums/WorkflowStatus.js";
import { TaskStatus } from "../enums/TaskStatus.js";
import { EscalationLevel } from "../enums/EscalationLevel.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

import { WorkflowReferenceGenerator } from "../services/WorkflowReferenceGenerator.js";
import { WorkflowPolicy } from "../services/WorkflowPolicy.js";
import { TaskAssignmentPolicy } from "../services/TaskAssignmentPolicy.js";
import { EscalationPolicyService } from "../services/EscalationPolicyService.js";

describe("Workflow Bounded Context Unit Tests (Tasks 19.2 - 19.5)", () => {
  const orgId = OrganizationId.generate();
  const wrkId = WorkflowId.generate();
  const wrkRef = WorkflowReference.create("WRK-2027-000001").value;
  const wrkName = WorkflowName.create("Invoice Verification").value;
  const priority = WorkflowPriority.create("NORMAL").value;
  const deadline = WorkflowDeadline.create(new Date(Date.now() + 86400 * 1000)).value;
  const policy = EscalationPolicy.create(60, 120, 180).value; // 1 min, 2 min, 3 min
  const actor = UserId.generate();

  const createValidTask = (titleText: string, required: boolean = true) => {
    return new WorkflowTask(new UniqueEntityID(), {
      title: TaskTitle.create(titleText).value,
      assignee: null,
      dueDate: DueDate.create(new Date(Date.now() + 3600000)).value,
      status: TaskStatus.PENDING,
      required,
      completedAt: null,
      rejectionReason: null
    });
  };

  describe("Value Objects", () => {
    it("should validate WorkflowReference pattern structure", () => {
      expect(WorkflowReference.create("WRK-2027-000100").isSuccess).toBe(true);
      expect(WorkflowReference.create("BAD-REF").isFailure).toBe(true);
    });

    it("should validate EscalationPolicy ascending thresholds", () => {
      expect(EscalationPolicy.create(10, 20, 30).isSuccess).toBe(true);
      expect(EscalationPolicy.create(20, 10, 30).isFailure).toBe(true);
    });
  });

  describe("Workflow Aggregate & Invariant Protections", () => {
    it("should initialize workflow in DRAFT status and reject empty task rosters", () => {
      const task = createValidTask("Review Invoice");
      const workflow = Workflow.create(
        wrkId,
        orgId,
        wrkRef,
        wrkName,
        priority,
        deadline,
        policy,
        [task]
      ).value;

      expect(workflow.status).toBe(WorkflowStatus.DRAFT);
      expect(workflow.tasks).toHaveLength(1);
      expect(workflow.domainEvents[0].eventName).toBe("WorkflowCreated");

      const badCreate = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, []);
      expect(badCreate.isFailure).toBe(true);
    });

    it("should transition status to RUNNING on start", () => {
      const task = createValidTask("Review Invoice");
      const workflow = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, [task]).value;

      expect(workflow.start(actor).isSuccess).toBe(true);
      expect(workflow.status).toBe(WorkflowStatus.RUNNING);
      expect(workflow.domainEvents.map(e => e.eventName)).toContain("WorkflowStarted");
    });

    it("should log assignments and add WorkflowAssignment records", () => {
      const task = createValidTask("Approve Payment");
      const workflow = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, [task]).value;
      const assigneeRef = AssignmentReference.create("USER-42").value;

      expect(workflow.assignTask(task.id, assigneeRef, actor).isSuccess).toBe(true);
      expect(task.status).toBe(TaskStatus.ASSIGNED);
      expect(workflow.assignments).toHaveLength(1);
      expect(workflow.assignments[0].assignee.value).toBe("USER-42");
    });

    it("should complete a running workflow automatically when all required tasks are completed", () => {
      const t1 = createValidTask("Task 1", true); // Required
      const t2 = createValidTask("Task 2", false); // Optional
      const workflow = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, [t1, t2]).value;

      workflow.start(actor);

      // Complete required Task 1
      expect(workflow.completeTask(t1.id, actor).isSuccess).toBe(true);
      expect(workflow.status).toBe(WorkflowStatus.COMPLETED); // Auto-completes because t2 is optional
    });

    it("should fail the overall workflow if a required task gets rejected", () => {
      const task = createValidTask("Critical Check", true); // Required
      const workflow = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, [task]).value;

      workflow.start(actor);

      const rejectRes = workflow.rejectTask(task.id, "Incorrect details provided", actor);
      expect(rejectRes.isSuccess).toBe(true);
      expect(task.status).toBe(TaskStatus.REJECTED);
      expect(workflow.status).toBe(WorkflowStatus.FAILED);
      expect(workflow.domainEvents.map(e => e.eventName)).toContain("WorkflowFailed");
    });

    it("should enforce ascending escalation progressions", () => {
      const task = createValidTask("Review", true);
      const workflow = Workflow.create(wrkId, orgId, wrkRef, wrkName, priority, deadline, policy, [task]).value;

      workflow.start(actor);
      expect(workflow.escalate(EscalationLevel.LEVEL1).isSuccess).toBe(true);
      expect(workflow.escalate(EscalationLevel.LEVEL2).isSuccess).toBe(true);

      // Level 1 <= Level 2 -> Fail
      expect(workflow.escalate(EscalationLevel.LEVEL1).isFailure).toBe(true);
    });
  });

  describe("Domain Services", () => {
    it("WorkflowReferenceGenerator should yield sequential references", () => {
      const gen = new WorkflowReferenceGenerator();
      const ref = gen.generate(2027, 12).value;
      expect(ref.value).toBe("WRK-2027-000012");
    });

    it("TaskAssignmentPolicy selectNextAssigneeRoundRobin should cycle candidates", () => {
      const policyService = new TaskAssignmentPolicy();
      const cand = [
        AssignmentReference.create("UserA").value,
        AssignmentReference.create("UserB").value
      ];

      const res1 = policyService.selectNextAssigneeRoundRobin(cand, 0);
      expect(res1.assignee.value).toBe("UserB");
      expect(res1.nextIndex).toBe(1);

      const res2 = policyService.selectNextAssigneeRoundRobin(cand, 1);
      expect(res2.assignee.value).toBe("UserA");
      expect(res2.nextIndex).toBe(0);
    });

    it("EscalationPolicyService determineEscalationLevel should resolve correct thresholds", () => {
      const service = new EscalationPolicyService();
      const basePolicy = EscalationPolicy.create(60, 120, 180).value;
      const dueDateVal = new Date("2026-07-23T12:00:00Z");

      // 30 seconds overdue -> None
      const time1 = new Date("2026-07-23T12:00:30Z");
      expect(service.determineEscalationLevel(dueDateVal, time1, basePolicy)).toBe(EscalationLevel.NONE);

      // 70 seconds overdue -> Level 1
      const time2 = new Date("2026-07-23T12:01:10Z");
      expect(service.determineEscalationLevel(dueDateVal, time2, basePolicy)).toBe(EscalationLevel.LEVEL1);

      // 200 seconds overdue -> Level 3
      const time3 = new Date("2026-07-23T12:03:20Z");
      expect(service.determineEscalationLevel(dueDateVal, time3, basePolicy)).toBe(EscalationLevel.LEVEL3);
    });
  });
});
