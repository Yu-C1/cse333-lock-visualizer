import { Program } from "../ir/Program";

type Access = {
  threadId: number;
  isWrite: boolean;
  lockSet: Set<string>;
};

// This function detect data race by checking if a variable that is
// access by two different threads with no common locks, and at least one
// of the operation is WRITE.
// Return true if there is data race.
export function hasDataRace(program: Program): boolean {
  const varAccess = new Map<string, Access[]>();

  for (const thread of program.threads) {
    const busyLocks = new Set<string>();

    for (const ins of thread.instructions) {
      if (ins.type === "LOCK") {
        busyLocks.add(ins.lock);
      } else if (ins.type === "UNLOCK") {
        busyLocks.delete(ins.lock);
      } else if (ins.type === "READ" || ins.type === "WRITE") {
        const access: Access = {
          threadId: thread.id,
          isWrite: ins.type === "WRITE",
          lockSet: new Set(busyLocks)
        };
      
        if (!varAccess.has(ins.variable)) {
          varAccess.set(ins.variable, []);
        }
        varAccess.get(ins.variable)!.push(access);
      }
    }
  }

  for (const access of varAccess.values()) {
    for (let i = 0; i < access.length; i++) {
      for (let j = i + 1; j < access.length; j++) {
        const a = access[i]!;
        const b = access[j]!;
        if (a.threadId !== b.threadId &&
            (a.isWrite || b.isWrite) &&
            !hasCommonLock(a.lockSet, b.lockSet)) {
              return true;
            }
      }
    }
  }
  return false;
}


// helper function to detect if lockSet a and b shares any lock
function hasCommonLock(a: Set<string>, b: Set<string>): boolean {

  for (const lock of a) {
    if (b.has(lock)) {
      return true;
    }
  }
  return false;
}