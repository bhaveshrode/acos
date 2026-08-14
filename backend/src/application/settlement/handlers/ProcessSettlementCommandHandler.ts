import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { ProcessSettlementCommand } from "../commands/ProcessSettlementCommand.js";
import { SettlementResponseDto } from "../dto/SettlementResponseDto.js";
import { ISettlementRepository } from "../../../business/settlement/repositories/ISettlementRepository.js";
import { SettlementMapper } from "../mapping/SettlementMapper.js";

// Domain imports
import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementId } from "../../../business/settlement/value-objects/SettlementId.js";
import { SettlementReference } from "../../../business/settlement/value-objects/SettlementReference.js";
import { SettlementAmount } from "../../../business/settlement/value-objects/SettlementAmount.js";
import { SettlementMethod } from "../../../business/settlement/enums/SettlementMethod.js";
import { ConfirmationThreshold } from "../../../business/settlement/value-objects/ConfirmationThreshold.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";

/**
 * Use case handler processing a Settlement.
 */
export class ProcessSettlementCommandHandler
  implements IRequestHandler<ProcessSettlementCommand, ApplicationResult<SettlementResponseDto>>
{
  constructor(
    private readonly repository: ISettlementRepository,
    private readonly mapper: SettlementMapper
  ) {}

  public async handle(
    request: ProcessSettlementCommand
  ): Promise<ApplicationResult<SettlementResponseDto>> {
    const { dto } = request;

    const orgId = OrganizationId.from(dto.organizationId);
    const paymentId = PaymentId.from(dto.paymentId);

    // Validate reference format
    const refRes = SettlementReference.create(dto.reference);
    if (refRes.isFailure) return ApplicationResult.failure(refRes.error.message);

    // Verify reference uniqueness
    const existsRes = await this.repository.findByReference(orgId, refRes.value);
    if (existsRes.isSuccess && existsRes.value) {
      return ApplicationResult.failure(
        `Settlement reference '${dto.reference}' already exists in this organization.`
      );
    }

    // Money instance for Settlement amount
    const moneyRes = Money.create(dto.amount, dto.currency);
    if (moneyRes.isFailure) return ApplicationResult.failure(moneyRes.error.message);

    // SettlementAmount validation
    const amountRes = SettlementAmount.create(moneyRes.value);
    if (amountRes.isFailure) return ApplicationResult.failure(amountRes.error.message);

    // Confirmation threshold value object
    const thresholdRes = ConfirmationThreshold.create(
      dto.confirmationThreshold !== undefined ? dto.confirmationThreshold : 1
    );
    if (thresholdRes.isFailure) return ApplicationResult.failure(thresholdRes.error.message);

    // Create Settlement aggregate in PENDING status
    const settlementRes = Settlement.create(
      SettlementId.generate(),
      orgId,
      paymentId,
      refRes.value,
      amountRes.value,
      dto.method as SettlementMethod,
      thresholdRes.value
    );

    if (settlementRes.isFailure) return ApplicationResult.failure(settlementRes.error.message);
    const settlement = settlementRes.value;

    // Save and commit Settlement aggregate
    const saveRes = await this.repository.save(settlement);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(settlement));
  }
}
