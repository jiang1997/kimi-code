import type { PermissionPolicy, PermissionPolicyContext, PermissionPolicyResult } from '../policy';

export class PlanModeToolApprovePermissionPolicy implements PermissionPolicy {
  readonly name = 'plan-mode-tool-approve';

  evaluate(context: PermissionPolicyContext): PermissionPolicyResult | undefined {
    const toolName = context.toolCall.function.name;
    if (toolName === 'EnterPlanMode') {
      return {
        kind: 'approve',
      };
    }

    if (toolName !== 'ExitPlanMode') return undefined;
    if (context.execution.display?.kind !== 'plan_review') {
      return {
        kind: 'approve',
      };
    }
    if (context.execution.display.plan.trim().length > 0) return undefined;
    return {
      kind: 'approve',
    };
  }
}
