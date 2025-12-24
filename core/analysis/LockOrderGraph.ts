import { Program } from "../ir/Program";

// This function detects deadlock by recording lock orders, and
// checking cycle using dfs helper. 
// Return true when there is a cycle.
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

// Dfs helper to detect cycle
function hasCycle(graph: Map<string, Set<string>>): boolean {
  const visited = new Set<string>();  // explored
  const stack = new Set<string>();  // current path

  function dfs(node: string): boolean {
    // if two same nodes on the same path, it is a cycle
    if (stack.has(node)) {
      return true;
    }
    // skip the node if it has been explored
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
    stack.delete(node);  // clear the current path memory for the next one
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) {
      return true;
    }
  }

  return false;
}