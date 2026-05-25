export function matchesRuleSubject(ruleArgs: string, subject: string): boolean {
  if (ruleArgs.length === 0) return true;
  try {
    return new RegExp(ruleArgs).test(subject);
  } catch {
    return false;
  }
}

export function matchesAnyRuleSubject(ruleArgs: string, subjects: readonly string[]): boolean {
  return subjects.some((subject) => matchesRuleSubject(ruleArgs, subject));
}
