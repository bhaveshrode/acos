import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

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

import { NotificationStatus } from "../enums/NotificationStatus.js";
import { ChannelType } from "../enums/ChannelType.js";
import { DeliveryResult } from "../enums/DeliveryResult.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

import { NotificationCreated } from "../events/NotificationCreated.js";
import { NotificationScheduled } from "../events/NotificationScheduled.js";
import { NotificationQueued } from "../events/NotificationQueued.js";
import { NotificationSending } from "../events/NotificationSending.js";
import { NotificationDelivered } from "../events/NotificationDelivered.js";
import { NotificationRead } from "../events/NotificationRead.js";
import { NotificationFailed } from "../events/NotificationFailed.js";
import { NotificationRetried } from "../events/NotificationRetried.js";
import { NotificationCancelled } from "../events/NotificationCancelled.js";
import { NotificationExpired } from "../events/NotificationExpired.js";

import { DeliveryPolicy } from "../services/DeliveryPolicy.js";

export interface NotificationProps {
  organizationId: OrganizationId;
  reference: NotificationReference;
  subject: NotificationSubject;
  body: NotificationBody;
  priority: NotificationPriority;
  status: NotificationStatus;
  scheduledTime: ScheduledTime;
  retryPolicy: RetryPolicy;
  recipients: Recipient[];
  attachments: NotificationAttachment[];
  deliveryAttempts: DeliveryAttempt[];
  readReceipts: ReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root representing the communication dispatch and its delivery attempts lifecycle.
 */
export class Notification extends AggregateRoot<NotificationId> {
  private readonly props: NotificationProps;

  private constructor(id: NotificationId, props: NotificationProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory constructor to initialize a Notification in DRAFT or SCHEDULED status.
   */
  public static create(
    id: NotificationId,
    organizationId: OrganizationId,
    reference: NotificationReference,
    subject: NotificationSubject,
    body: NotificationBody,
    priority: NotificationPriority,
    scheduledTime: ScheduledTime,
    retryPolicy: RetryPolicy,
    recipients: Recipient[],
    optional?: {
      attachments?: NotificationAttachment[];
      deliveryAttempts?: DeliveryAttempt[];
      readReceipts?: ReadReceipt[];
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<Notification> {
    // Invariants
    if (recipients.length === 0) {
      return Result.fail(ResultError.validation("Notification must have at least one recipient."));
    }

    const hasChannels = recipients.some((r) => r.channelPreferences.length > 0);
    if (!hasChannels) {
      return Result.fail(ResultError.validation("Notification must have at least one delivery channel preference."));
    }

    // Past time check: allow a small 1-minute grace window for clock drifts
    if (scheduledTime.value.getTime() < Date.now() - 60000) {
      return Result.fail(ResultError.validation("Scheduled time cannot be in the past."));
    }

    const isFutureScheduled = scheduledTime.value.getTime() > Date.now() + 5000;
    const initialStatus = isFutureScheduled ? NotificationStatus.SCHEDULED : NotificationStatus.DRAFT;

    const notification = new Notification(id, {
      organizationId,
      reference,
      subject,
      body,
      priority,
      status: initialStatus,
      scheduledTime,
      retryPolicy,
      recipients,
      attachments: optional?.attachments || [],
      deliveryAttempts: optional?.deliveryAttempts || [],
      readReceipts: optional?.readReceipts || [],
      createdAt: optional?.createdAt || new Date(),
      updatedAt: optional?.updatedAt || new Date()
    });

    notification.addDomainEvent(new NotificationCreated(id.value, organizationId));
    if (initialStatus === NotificationStatus.SCHEDULED) {
      notification.addDomainEvent(new NotificationScheduled(id.value, scheduledTime.value));
    }

    return Result.ok(notification);
  }

  // Getters
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get reference(): NotificationReference { return this.props.reference; }
  public get subject(): NotificationSubject { return this.props.subject; }
  public get body(): NotificationBody { return this.props.body; }
  public get priority(): NotificationPriority { return this.props.priority; }
  public get status(): NotificationStatus { return this.props.status; }
  public get scheduledTime(): ScheduledTime { return this.props.scheduledTime; }
  public get retryPolicy(): RetryPolicy { return this.props.retryPolicy; }
  public get recipients(): readonly Recipient[] { return Object.freeze([...this.props.recipients]); }
  public get attachments(): readonly NotificationAttachment[] { return Object.freeze([...this.props.attachments]); }
  public get deliveryAttempts(): readonly DeliveryAttempt[] { return Object.freeze([...this.props.deliveryAttempts]); }
  public get readReceipts(): readonly ReadReceipt[] { return Object.freeze([...this.props.readReceipts]); }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  private ensureMutable(): Result<void> {
    if (
      this.status === NotificationStatus.DELIVERED ||
      this.status === NotificationStatus.READ
    ) {
      return Result.fail(ResultError.conflict("Delivered notifications are immutable."));
    }
    if (this.status === NotificationStatus.CANCELLED) {
      return Result.fail(ResultError.conflict("Cancelled notifications are locked."));
    }
    if (this.status === NotificationStatus.EXPIRED) {
      return Result.fail(ResultError.conflict("Expired notifications are locked."));
    }
    return Result.ok();
  }

  /**
   * Updates scheduled delivery details.
   */
  public schedule(newTime: ScheduledTime): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    if (newTime.value.getTime() < Date.now() - 60000) {
      return Result.fail(ResultError.validation("New scheduled time cannot be in the past."));
    }

    this.props.scheduledTime = newTime;
    this.props.status = NotificationStatus.SCHEDULED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationScheduled(this.id.value, newTime.value));
    return Result.ok();
  }

  /**
   * Queues the message for execution.
   */
  public queue(): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.status = NotificationStatus.QUEUED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationQueued(this.id.value));
    return Result.ok();
  }

  /**
   * Flags that delivery processing has started on a channel.
   */
  public startSending(channel: ChannelType): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.status = NotificationStatus.SENDING;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationSending(this.id.value, channel));
    return Result.ok();
  }

  /**
   * Logs a delivery execution outcome and updates tracking status.
   */
  public logAttempt(
    attemptId: UniqueEntityID,
    channel: ChannelType,
    result: DeliveryResult,
    response: string | null,
    metadata: DeliveryMetadata,
    deliveryPolicy: DeliveryPolicy
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    // Calculate current retry count for this channel
    const currentRetryCount = this.props.deliveryAttempts.filter(
      (a) => a.channel === channel && a.status === DeliveryResult.TEMPORARY_FAILURE
    ).length;

    let finalResult = result;
    if (result === DeliveryResult.TEMPORARY_FAILURE) {
      // Invariant: check retry policy bounds
      if (currentRetryCount >= this.props.retryPolicy.maxRetries) {
        finalResult = DeliveryResult.PERMANENT_FAILURE;
      }
    }

    const attempt = new DeliveryAttempt(attemptId, {
      channel,
      timestamp: new Date(),
      providerResponse: response,
      status: finalResult,
      retryCount: currentRetryCount,
      metadata
    });
    this.props.deliveryAttempts.push(attempt);
    this.props.updatedAt = new Date();

    if (finalResult === DeliveryResult.SUCCESS) {
      this.props.status = NotificationStatus.DELIVERED;
      this.addDomainEvent(new NotificationDelivered(this.id.value, channel));
    } else if (finalResult === DeliveryResult.TEMPORARY_FAILURE) {
      this.addDomainEvent(new NotificationRetried(this.id.value, channel, currentRetryCount + 1));
    } else if (finalResult === DeliveryResult.PERMANENT_FAILURE) {
      // If there are no more alternative channel attempts and this fails, mark aggregate as failed
      this.props.status = NotificationStatus.FAILED;
      this.addDomainEvent(new NotificationFailed(this.id.value, channel, response || "Permanent dispatch failure"));
    }

    return Result.ok();
  }

  /**
   * Records read acknowledgment receipts.
   */
  public recordRead(
    receiptId: UniqueEntityID,
    channel: ChannelType,
    readerId: UserId | null
  ): Result<void> {
    if (this.status === NotificationStatus.CANCELLED) {
      return Result.fail(ResultError.conflict("Cannot record read receipts on cancelled notifications."));
    }
    if (this.status === NotificationStatus.EXPIRED) {
      return Result.fail(ResultError.conflict("Cannot record read receipts on expired notifications."));
    }

    // Invariant: Read receipts can only be recorded after successful delivery (aggregate is DELIVERED or READ)
    const delivered = this.props.deliveryAttempts.some((a) => a.status === DeliveryResult.SUCCESS);
    if (!delivered && this.status !== NotificationStatus.DELIVERED && this.status !== NotificationStatus.READ) {
      return Result.fail(
        ResultError.conflict("Read receipts can only be recorded after successful delivery.")
      );
    }

    const receipt = new ReadReceipt(receiptId, {
      readAt: new Date(),
      channel,
      readerId
    });
    this.props.readReceipts.push(receipt);

    this.props.status = NotificationStatus.READ;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationRead(this.id.value, channel, readerId ? readerId.value : null));
    return Result.ok();
  }

  /**
   * Cancels a pending, scheduled, draft, or queued message.
   */
  public cancel(): Result<void> {
    if (
      this.status === NotificationStatus.DELIVERED ||
      this.status === NotificationStatus.READ
    ) {
      return Result.fail(ResultError.conflict("Delivered notifications cannot be cancelled."));
    }
    if (this.status === NotificationStatus.EXPIRED) {
      return Result.fail(ResultError.conflict("Expired notifications cannot be cancelled."));
    }

    this.props.status = NotificationStatus.CANCELLED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationCancelled(this.id.value));
    return Result.ok();
  }

  /**
   * Flags expiration when message remains un-dispatched past TTL boundary.
   */
  public expire(): Result<void> {
    if (
      this.status === NotificationStatus.DELIVERED ||
      this.status === NotificationStatus.READ
    ) {
      return Result.fail(ResultError.conflict("Delivered notifications cannot expire."));
    }
    if (this.status === NotificationStatus.CANCELLED) {
      return Result.fail(ResultError.conflict("Cancelled notifications cannot expire."));
    }

    this.props.status = NotificationStatus.EXPIRED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationExpired(this.id.value));
    return Result.ok();
  }
}
