import picomatch from 'picomatch';

import type { RunnableToolExecution } from '../../loop/types';
import { matchesRuleSubject } from '../../tools/support/rule-match';
import { parsePattern } from './parse-pattern';
import { stableSerialize } from './stable-args';
import type { PermissionRule } from './types';

export interface PermissionRuleMatchExecution {
  readonly matchesRule?: RunnableToolExecution['matchesRule'];
  readonly cwd?: unknown;
  readonly pathClass?: unknown;
}

export type PermissionRuleMatchStrategy =
  | 'tool_name_only'
  | 'matches_rule'
  | 'stable_args_fallback'
  | 'single_field_fallback';

export interface PermissionRuleMatch {
  readonly rule: PermissionRule;
  readonly strategy: PermissionRuleMatchStrategy;
  readonly hasRuleArgs: boolean;
}

export interface PermissionRuleMatchInput {
  readonly rule: PermissionRule;
  readonly toolName: string;
  readonly args: unknown;
  readonly execution: PermissionRuleMatchExecution;
}

export function matchPermissionRule({
  rule,
  toolName,
  args,
  execution,
}: PermissionRuleMatchInput): PermissionRuleMatch | undefined {
  let parsed;
  try {
    parsed = parsePattern(rule.pattern);
  } catch {
    return undefined;
  }

  if (parsed.toolName !== '*' && !picomatch.isMatch(toolName, parsed.toolName)) {
    return undefined;
  }

  if (parsed.argPattern === undefined) {
    return { rule, strategy: 'tool_name_only', hasRuleArgs: false };
  }

  if (execution.matchesRule !== undefined) {
    return execution.matchesRule(parsed.argPattern)
      ? { rule, strategy: 'matches_rule', hasRuleArgs: true }
      : undefined;
  }

  if (matchesRuleSubject(parsed.argPattern, stableSerialize(args))) {
    return { rule, strategy: 'stable_args_fallback', hasRuleArgs: true };
  }

  const singleField = singleActualFieldValue(args);
  if (
    singleField !== undefined &&
    matchesRuleSubject(parsed.argPattern, singleFieldSubject(singleField))
  ) {
    return { rule, strategy: 'single_field_fallback', hasRuleArgs: true };
  }

  return undefined;
}

export function matchesRule(
  rule: PermissionRule,
  toolName: string,
  args: unknown,
  execution: PermissionRuleMatchExecution = {},
): boolean {
  return matchPermissionRule({ rule, toolName, args, execution }) !== undefined;
}

function singleActualFieldValue(args: unknown): unknown {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) return undefined;
  const entries = Object.entries(args as Record<string, unknown>).filter(
    ([, value]) => typeof value !== 'undefined',
  );
  return entries.length === 1 ? entries[0]![1] : undefined;
}

function singleFieldSubject(value: unknown): string {
  return typeof value === 'string' ? value : stableSerialize(value);
}
