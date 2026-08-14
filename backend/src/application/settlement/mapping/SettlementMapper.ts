import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Settlement } from "../../../business/settlement/aggregates/Settlement.js";
import { SettlementResponseDto } from "../dto/SettlementResponseDto.js";

/**
 * Mapper helper converting Settlement entities into presentation SettlementResponseDto models.
 */
export class SettlementMapper implements IMapper<Settlement, SettlementResponseDto> {
  public map(source: Settlement): SettlementResponseDto {
    return {
      id: source.id.value,
      organizationId: source.organizationId.value,
      paymentId: source.paymentId.value,
      reference: source.reference.value,
      amount: source.amount.amount,
      currency: source.amount.currency,
      status: source.status,
      method: source.method,
      confirmationThreshold: source.confirmationThreshold.value,
      createdAt: source.createdAt.toISOString()
    };
  }
}
