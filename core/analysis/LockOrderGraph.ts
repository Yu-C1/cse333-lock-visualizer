import { Program } from "../ir/Program";

export function hasDeadlock(program: Program): boolean {
  const graph = new Map<string, Set<string>>();
  for (const lock of program.locks) {
    graph.set(lock, new Set());
  }

  for (const thread of program.threads) {
    const busyLocks = new Set<string>();

    for (const ins of thread.instructions) {
      if (ins.type === "LOCK") {
        for (const busy of busyLocks) {
          graph.get(busy)!.add(ins.lock);
        }
        busyLocks.add(ins.lock);
      } else if (ins.type === "UNLOCK") {
        busyLocks.delete(ins.lock);
      }
    }
  }
  return hasCycle(graph);
}

function hasCycle(graph: Map<string, Set<string>>): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      return true;
    }
    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    stack.add(node);

    for (const next of graph.get(node) ?? []) {
      if (dfs(next)) {
        return true;
      }
    }
    stack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) {
      return true;
    }
  }

  return false;
}