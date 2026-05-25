import type { PrepareToolExecutionResult, ResolvedToolExecutionHookContext } from '../../loop';
import type { ExecutableToolResult } from '../../loop/types';
import type { ApprovalResponse } from './types';

export type PermissionDecision = 'approve' | 'deny' | 'ask';

export type PermissionReasonValue = string | number | boolean | null;

export type PermissionDecisionReason = Readonly<Record<string, PermissionReasonValue>>;

export type PermissionPolicyResolution =
  | PermissionPolicyResult
  | ({ readonly kind: 'result' } & PrepareToolExecutionResult);

export interface PermissionPolicyContext extends ResolvedToolExecutionHookContext {}

export type PermissionPolicyResult =
  | {
      readonly kind: 'approve';
      readonly reason?: PermissionDecisionReason;
      readonly executionMetadata?: unknown;
    }
  | {
      readonly kind: 'deny';
      readonly reason?: PermissionDecisionReason;
      readonly message?: string;
    }
  | {
      readonly kind: 'ask';
      readonly reason?: PermissionDecisionReason;
      readonly resolveApproval?: (
        result: ApprovalResponse,
      ) => PermissionPolicyResolution | undefined;
      readonly resolveError?: (error: unknown) => PermissionPolicyResolution | undefined;
    };

export interface PermissionPolicy {
  readonly name: string;
  evaluate(
    context: PermissionPolicyContext,
  ): PermissionPolicyResult | undefined | Promise<PermissionPolicyResult | undefined>;
}

export function syntheticResult(result: ExecutableToolResult): PermissionPolicyResolution {
  return { kind: 'result', syntheticResult: result };
}
