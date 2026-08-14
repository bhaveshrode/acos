import { WorkflowContext } from "./WorkflowContext.js";

/**
 * WorkflowStep representing executable step components.
 */
export class WorkflowStep {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly executeFn: (context: WorkflowContext) => Promise<any> | any
  ) {}

  public async execute(context: WorkflowContext): Promise<any> {
    return this.executeFn(context);
  }
}
