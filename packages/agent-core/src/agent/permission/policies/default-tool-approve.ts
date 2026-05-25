import type { PermissionPolicy, PermissionPolicyContext, PermissionPolicyResult } from '../policy';

const DEFAULT_APPROVE_TOOLS = new Set([
  'Read',
  'Grep',
  'Glob',
  'ReadMediaFile',
  'Think',
  'SetTodoList',
  'TodoList',
  'TaskList',
  'TaskOutput',
  'WebSearch',
  'FetchURL',
  'Agent',
  'AskUserQuestion',
  'Skill',
]);

export class DefaultToolApprovePermissionPolicy implements PermissionPolicy {
  readonly name = 'default-tool-approve';

  evaluate(context: PermissionPolicyContext): PermissionPolicyResult | undefined {
    if (!DEFAULT_APPROVE_TOOLS.has(context.toolCall.function.name)) return undefined;
    return {
      kind: 'approve',
    };
  }
}
