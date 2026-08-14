import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { SettlementResponseDto } from "../dto/SettlementResponseDto.js";

/**
 * Query to request loading Settlement details by ID.
 */
export class GetSettlementByIdQuery
  implements IQuery<ApplicationResult<SettlementResponseDto>>
{
  constructor(public readonly id: string) {}
}
