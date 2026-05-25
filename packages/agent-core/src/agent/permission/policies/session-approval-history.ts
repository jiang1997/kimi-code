import type { Agent } from '../..';
import type { PermissionPolicy, PermissionPolicyContext, PermissionPolicyResult } from '../policy';
import { stableToolArgsKey } from '../stable-args';

export class SessionApprovalHistoryPermissionPolicy implements PermissionPolicy {
  readonly name = 'session-approval-history';

  constructor(private readonly agent: Agent) {}

  evaluate(context: PermissionPolicyContext): PermissionPolicyResult | undefined {
    const key = stableToolArgsKey(context.toolCall.function.name, context.args);
    if (!this.agent.permission.hasSessionApprovedKey(key)) return undefined;
    return {
      kind: 'approve',
    };
  }
}
