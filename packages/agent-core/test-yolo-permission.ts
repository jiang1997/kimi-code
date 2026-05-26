import { createFakeKaos } from './test/tools/fixtures/fake-kaos';
import { PermissionManager } from './src/agent/permission';
import { ToolAccesses } from './src/loop/tool-access';
import type { PermissionPolicyContext } from './src/agent/permission';
import type { Agent } from './src/agent';
import type { Kaos } from '@moonshot-ai/kaos';
import type { ToolCall } from '@moonshot-ai/kosong';

function makeContext(args: { toolName: string; path: string }): PermissionPolicyContext {
  const toolCall: ToolCall = {
    type: 'function',
    id: 'call_1',
    name: args.toolName,
    arguments: JSON.stringify({ path: args.path }),
  };
  const execution: PermissionPolicyContext['execution'] = {
    description: `Reading ${args.path}`,
    display: { kind: 'file_io', operation: 'read', path: args.path },
    accesses: ToolAccesses.readFile(args.path),
    approvalRule: `Read(${args.path})`,
    execute: async () => ({ output: '' }),
  };
  return {
    turnId: '0',
    stepNumber: 1,
    signal: new AbortController().signal,
    llm: {} as PermissionPolicyContext['llm'],
    toolCall,
    args: { path: args.path },
    execution,
  };
}

async function main() {
  const requestApproval = async () => ({ decision: 'approved' as const });
  const record = () => {};
  const telemetryTrack = () => {};
  const kaos: Kaos = createFakeKaos();

  const agent = {
    type: 'main',
    config: { cwd: '/Users/moonshot/workspace/kimi-code-2' },
    runtime: { kaos },
    emitStatusUpdated: () => {},
    records: { logRecord: record },
    replayBuilder: { push: () => {} },
    rpc: { requestApproval },
    telemetry: { track: telemetryTrack },
    planMode: {
      get isActive() {
        return false;
      },
      get planFilePath() {
        return null;
      },
      data: async () => null,
      exit: () => {},
    },
  } as unknown as Agent;

  const manager = new PermissionManager(agent);
  (agent as any).permission = manager;
  manager.setMode('yolo');

  const ctx = makeContext({ toolName: 'Read', path: '/Users/moonshot/workspace/kimi-code-2/package.json' });
  const result = await manager.beforeToolCall(ctx);

  console.log('mode:', manager.mode);
  console.log('result:', result);
}

main().catch(console.error);
