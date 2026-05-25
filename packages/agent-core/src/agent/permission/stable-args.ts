import { createHash } from 'node:crypto';

export function stableToolArgsKey(toolName: string, args: unknown): string {
  const hash = createHash('sha256').update(stableSerialize(args)).digest('hex');
  return `${toolName}:${hash}`;
}

export function stableSerialize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).toSorted(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
      .join(',')}}`;
  }
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (typeof value === 'symbol') return JSON.stringify(value.description ?? '');
  return JSON.stringify('[function]');
}
