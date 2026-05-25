import type {
  ExecutableTool,
  ExecutableToolContext,
  ExecutableToolResult,
  ToolExecution,
} from '../../../src/loop';
import { PathSecurityError } from '../../../src/tools/policies/path-access';

export type TestExecutableToolContext<Input> = ExecutableToolContext & {
  readonly args: Input;
};

export async function executeTool<Input>(
  tool: ExecutableTool<Input>,
  context: TestExecutableToolContext<Input>,
): Promise<ExecutableToolResult> {
  const { args, ...executionContext } = context;
  let execution: ToolExecution;
  try {
    execution = await tool.resolveExecution(args);
  } catch (error) {
    const output =
      error instanceof PathSecurityError
        ? error.message
        : `Tool "${tool.name}" failed to resolve execution: ${
            error instanceof Error ? error.message : String(error)
          }`;
    return Promise.resolve({ isError: true, output });
  }
  if (execution.isError === true) return Promise.resolve(execution);
  return execution.execute(executionContext);
}
