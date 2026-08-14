import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { RecordReceivableRequestDto } from "../dto/RecordReceivableRequestDto.js";
import { ReceivableResponseDto } from "../dto/ReceivableResponseDto.js";

/**
 * Command to request recording of an Invoice obligation under Accounts Receivable.
 */
export class RecordReceivableCommand
  implements ICommand<ApplicationResult<ReceivableResponseDto>>
{
  readonly requestType?: ApplicationResult<ReceivableResponseDto>;
  constructor(public readonly dto: RecordReceivableRequestDto) {}
}
