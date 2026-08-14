import { describe, it, expect } from "vitest";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { NotificationId } from "../value-objects/NotificationId.js";
import { NotificationReference } from "../value-objects/NotificationReference.js";
import { NotificationSubject } from "../value-objects/NotificationSubject.js";
import { NotificationBody } from "../value-objects/NotificationBody.js";
import { NotificationChannel } from "../value-objects/NotificationChannel.js";
import { RecipientAddress } from "../value-objects/RecipientAddress.js";
import { ScheduledTime } from "../value-objects/ScheduledTime.js";
import { RetryPolicy } from "../value-objects/RetryPolicy.js";
import { DeliveryMetadata } from "../value-objects/DeliveryMetadata.js";
import { NotificationPriority } from "../value-objects/NotificationPriority.js";

import { Recipient } from "../entities/Recipient.js";
import { DeliveryAttempt } from "../entities/DeliveryAttempt.js";
import { NotificationAttachment } from "../entities/NotificationAttachment.js";
import { ReadReceipt } from "../entities/ReadReceipt.js";

import { Notification } from "../aggregates/Notification.js";

import { NotificationStatus } from "../enums/NotificationStatus.js";
import { ChannelType } from "../enums/ChannelType.js";
import { Priority } from "../enums/Priority.js";
import { DeliveryResult } from "../enums/DeliveryResult.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

import { NotificationReferenceGenerator } from "../services/NotificationReferenceGenerator.js";
import { DeliveryPolicy } from "../services/DeliveryPolicy.js";
import { NotificationTemplatePolicy } from "../services/NotificationTemplatePolicy.js";
import { RecipientPreferencePolicy } from "../services/RecipientPreferencePolicy.js";

import { NotificationCanBeSent } from "../specifications/NotificationCanBeSent.js";

describe("Notification Bounded Context Unit Tests", () => {
  const orgId = OrganizationId.generate();
  const notifId = NotificationId.generate();
  const ntfRef = NotificationReference.create("NTF-2027-000001").value;
  const subject = NotificationSubject.create("Invoice Alert").value;
  const body = NotificationBody.create("Your invoice is ready.").value;
  const priority = NotificationPriority.create(Priority.NORMAL).value;
  const retryPolicy = RetryPolicy.create(3, 10).value;

  const createValidRecipient = () => {
    return new Recipient(new UniqueEntityID(), {
      userId: UserId.generate(),
      email: RecipientAddress.create("test@example.com").value,
      phone: RecipientAddress.create("+12345").value,
      channelPreferences: [ChannelType.EMAIL, ChannelType.SMS]
    });
  };

  describe("Value Objects", () => {
    it("should validate NotificationReference patterns", () => {
      expect(NotificationReference.create("NTF-2027-000001").isSuccess).toBe(true);
      expect(NotificationReference.create("BAD-01").isFailure).toBe(true);
    });

    it("should validate subject line length bounds", () => {
      expect(NotificationSubject.create("Valid Title").isSuccess).toBe(true);
      expect(NotificationSubject.create("a".repeat(201)).isFailure).toBe(true);
    });

    it("should validate RetryPolicy non-negative limits", () => {
      expect(RetryPolicy.create(3, 10).isSuccess).toBe(true);
      expect(RetryPolicy.create(-1, 10).isFailure).toBe(true);
      expect(RetryPolicy.create(3, -5).isFailure).toBe(true);
    });

    it("should validate RecipientAddress non-empty", () => {
      expect(RecipientAddress.create("0xaddress").isSuccess).toBe(true);
      expect(RecipientAddress.create("   ").isFailure).toBe(true);
    });
  });

  describe("Notification Aggregate & Invariants", () => {
    it("should initialize notification in DRAFT or SCHEDULED status", () => {
      const now = new Date();
      const schedTime = ScheduledTime.create(now).value;
      const recipient = createValidRecipient();

      const notif = Notification.create(
        notifId,
        orgId,
        ntfRef,
        subject,
        body,
        priority,
        schedTime,
        retryPolicy,
        [recipient]
      ).value;

      expect(notif.status).toBe(NotificationStatus.DRAFT);
      expect(notif.recipients).toHaveLength(1);
      expect(notif.domainEvents[0].eventName).toBe("NotificationCreated");
    });

    it("should reject creation if no recipients or channels exist", () => {
      const now = new Date();
      const schedTime = ScheduledTime.create(now).value;

      // No recipients
      const res1 = Notification.create(
        notifId,
        orgId,
        ntfRef,
        subject,
        body,
        priority,
        schedTime,
        retryPolicy,
        []
      );
      expect(res1.isFailure).toBe(true);

      // No channels
      const badRecipient = new Recipient(new UniqueEntityID(), {
        userId: UserId.generate(),
        email: null,
        phone: null,
        channelPreferences: []
      });
      const res2 = Notification.create(
        notifId,
        orgId,
        ntfRef,
        subject,
        body,
        priority,
        schedTime,
        retryPolicy,
        [badRecipient]
      );
      expect(res2.isFailure).toBe(true);
    });

    it("should transition through schedule, queue, and sending states", () => {
      const recipient = createValidRecipient();
      const schedTime = ScheduledTime.create(new Date()).value;
      const notif = Notification.create(notifId, orgId, ntfRef, subject, body, priority, schedTime, retryPolicy, [recipient]).value;

      // Schedule in future
      const futureTime = ScheduledTime.create(new Date(Date.now() + 60000)).value;
      expect(notif.schedule(futureTime).isSuccess).toBe(true);
      expect(notif.status).toBe(NotificationStatus.SCHEDULED);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationScheduled");

      // Queue
      expect(notif.queue().isSuccess).toBe(true);
      expect(notif.status).toBe(NotificationStatus.QUEUED);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationQueued");

      // Start sending
      expect(notif.startSending(ChannelType.EMAIL).isSuccess).toBe(true);
      expect(notif.status).toBe(NotificationStatus.SENDING);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationSending");
    });

    it("should track delivery success and block edits once delivered", () => {
      const recipient = createValidRecipient();
      const notif = Notification.create(notifId, orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, retryPolicy, [recipient]).value;
      const policy = new DeliveryPolicy();

      notif.queue();
      notif.startSending(ChannelType.EMAIL);

      // Log success attempt
      const res = notif.logAttempt(
        new UniqueEntityID(),
        ChannelType.EMAIL,
        DeliveryResult.SUCCESS,
        "Delivered",
        DeliveryMetadata.create().value,
        policy
      );

      expect(res.isSuccess).toBe(true);
      expect(notif.status).toBe(NotificationStatus.DELIVERED);
      expect(notif.deliveryAttempts).toHaveLength(1);
      expect(notif.deliveryAttempts[0].status).toBe(DeliveryResult.SUCCESS);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationDelivered");

      // Attempt modification should fail
      const badSched = notif.schedule(ScheduledTime.create(new Date(Date.now() + 100000)).value);
      expect(badSched.isFailure).toBe(true);
    });

    it("should process retries and set status failed on limit breach", () => {
      const recipient = createValidRecipient();
      const tightPolicy = RetryPolicy.create(1, 5).value; // Max 1 retry
      const notif = Notification.create(notifId, orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, tightPolicy, [recipient]).value;
      const policy = new DeliveryPolicy();

      notif.queue();
      notif.startSending(ChannelType.EMAIL);

      // Attempt 1: Temporary Failure (Retry count = 0)
      const res1 = notif.logAttempt(new UniqueEntityID(), ChannelType.EMAIL, DeliveryResult.TEMPORARY_FAILURE, "Timeout", DeliveryMetadata.create().value, policy);
      expect(res1.isSuccess).toBe(true);
      expect(notif.deliveryAttempts[0].status).toBe(DeliveryResult.TEMPORARY_FAILURE);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationRetried");

      // Attempt 2: Temporary Failure (Retry count = 1 -> exceeds max 1, converts to permanent failure)
      const res2 = notif.logAttempt(new UniqueEntityID(), ChannelType.EMAIL, DeliveryResult.TEMPORARY_FAILURE, "Timeout 2", DeliveryMetadata.create().value, policy);
      expect(res2.isSuccess).toBe(true);
      expect(notif.deliveryAttempts[1].status).toBe(DeliveryResult.PERMANENT_FAILURE);
      expect(notif.status).toBe(NotificationStatus.FAILED);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationFailed");
    });

    it("should allow read receipts after delivery", () => {
      const recipient = createValidRecipient();
      const notif = Notification.create(notifId, orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, retryPolicy, [recipient]).value;
      const policy = new DeliveryPolicy();

      // Read receipt before delivery fails
      const badRead = notif.recordRead(new UniqueEntityID(), ChannelType.EMAIL, UserId.generate());
      expect(badRead.isFailure).toBe(true);

      // Deliver
      notif.logAttempt(new UniqueEntityID(), ChannelType.EMAIL, DeliveryResult.SUCCESS, "OK", DeliveryMetadata.create().value, policy);

      // Read receipt now succeeds
      const res = notif.recordRead(new UniqueEntityID(), ChannelType.EMAIL, UserId.generate());
      expect(res.isSuccess).toBe(true);
      expect(notif.status).toBe(NotificationStatus.READ);
      expect(notif.readReceipts).toHaveLength(1);
      expect(notif.domainEvents.map(e => e.eventName)).toContain("NotificationRead");
    });

    it("should support cancel and expire actions", () => {
      const recipient = createValidRecipient();
      const notif1 = Notification.create(notifId, orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, retryPolicy, [recipient]).value;
      const notif2 = Notification.create(NotificationId.generate(), orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, retryPolicy, [recipient]).value;

      // Cancel
      expect(notif1.cancel().isSuccess).toBe(true);
      expect(notif1.status).toBe(NotificationStatus.CANCELLED);
      expect(notif1.domainEvents.map(e => e.eventName)).toContain("NotificationCancelled");

      // Expire
      expect(notif2.expire().isSuccess).toBe(true);
      expect(notif2.status).toBe(NotificationStatus.EXPIRED);
      expect(notif2.domainEvents.map(e => e.eventName)).toContain("NotificationExpired");
    });
  });

  describe("Domain Services & Specifications", () => {
    it("NotificationReferenceGenerator should yield sequential references", () => {
      const gen = new NotificationReferenceGenerator();
      const ref = gen.generate(2027, 45).value;
      expect(ref.value).toBe("NTF-2027-000045");
    });

    it("DeliveryPolicy calculateNextRetryInterval should compute exponential delay", () => {
      const policy = new DeliveryPolicy();
      expect(policy.calculateNextRetryInterval(0, 10)).toBe(10);  // 10 * 2^0
      expect(policy.calculateNextRetryInterval(1, 10)).toBe(20);  // 10 * 2^1
      expect(policy.calculateNextRetryInterval(3, 10)).toBe(80);  // 10 * 2^3
    });

    it("DeliveryPolicy isExpired should evaluate TTL thresholds", () => {
      const policy = new DeliveryPolicy();
      const createdAt = new Date("2026-07-23T12:00:00Z");
      const current1 = new Date("2026-07-23T12:01:00Z"); // 60s later
      const current2 = new Date("2026-07-23T12:05:00Z"); // 300s later

      expect(policy.isExpired(createdAt, 120, current1)).toBe(false); // 60s < 120s
      expect(policy.isExpired(createdAt, 120, current2)).toBe(true);  // 300s > 120s
    });

    it("NotificationTemplatePolicy resolveTemplate should replace tags", () => {
      const policy = new NotificationTemplatePolicy();
      const template = "Hello {{ name }}, your balance is {{ balance }} USDC.";
      const vars = { name: "Alice", balance: "150" };

      expect(policy.resolveTemplate(template, vars)).toBe("Hello Alice, your balance is 150 USDC.");
    });

    it("RecipientPreferencePolicy filterPreferredChannels should filter channels", () => {
      const policy = new RecipientPreferencePolicy();
      const preferences = [ChannelType.EMAIL, ChannelType.SMS, ChannelType.PUSH];
      const allowed = [ChannelType.EMAIL, ChannelType.WEBHOOK];

      const res = policy.filterPreferredChannels(preferences, allowed);
      expect(res).toEqual([ChannelType.EMAIL]);
    });

    it("NotificationCanBeSent spec should validate statuses", () => {
      const spec = new NotificationCanBeSent();
      const recipient = createValidRecipient();
      const notif = Notification.create(notifId, orgId, ntfRef, subject, body, priority, ScheduledTime.create(new Date()).value, retryPolicy, [recipient]).value;

      expect(spec.isSatisfiedBy(notif)).toBe(true); // DRAFT

      notif.queue();
      expect(spec.isSatisfiedBy(notif)).toBe(true); // QUEUED

      notif.cancel();
      expect(spec.isSatisfiedBy(notif)).toBe(false); // CANCELLED
    });
  });
});
