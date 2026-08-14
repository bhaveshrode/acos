import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { ProcessSettlementRequestDto } from "../dto/ProcessSettlementRequestDto.js";
import { SettlementResponseDto } from "../dto/SettlementResponseDto.js";

/**
 * Command to request processing of a Settlement transaction.
 */
export class ProcessSettlementCommand
  implements ICommand<ApplicationResult<SettlementResponseDto>>
{
  constructor(public readonly dto: ProcessSettlementRequestDto) {}
}
