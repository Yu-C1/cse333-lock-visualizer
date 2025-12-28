import { Program } from "../ir/Program";

/* This function detects the following cases before the program execution:
  - undeclared lock
  - undeclared variable
  - unlock without holding
  - double lock
  - thread exits holding lock
  - duplicate declarations 
*/ 

export function validateProgram(program: Program): string[] {
  const errorMessage: string[] = [];  // error message to be returned, if any

  const lockSet = new Set<string>();
  for (const lock of program.locks) {
    if (lockSet.has(lock)) {
      errorMessage.push(`Duplicate lock declaration '${lock}'`);
    }
    lockSet.add(lock);
  }

  const varSet = new Set<string>();
  for (const v of program.variables) {
    if (varSet.has(v)) {
      errorMessage.push(`Duplicate variable declaration '${v}'`);
    }
    varSet.add(v);
  }

  for (const thread of program.threads) {
    const busyLocks = new Set<string>();
    for (const ins of thread.instructions) {
      if (!ins) {
        continue;
      }
      if (ins.type === "LOCK") {
        if (busyLocks.has(ins.lock)) {
          errorMessage.push(`Thread ${thread.id} locks '${ins.lock}' twice without unlocking`);
        } else if (busyLocks.has(ins.lock)) {
          errorMessage.push(`Thread ${thread.id} locks '${ins.lock}' twice without unlocking`);
        } else {
          busyLocks.add(ins.lock);
        } 
      } else if (ins.type === "UNLOCK") {
        if (!lockSet.has(ins.lock)) {
          errorMessage.push(
            `Thread ${thread.id} uses undeclared lock '${ins.lock}'`
          );
        } else if (!busyLocks.has(ins.lock)) {
          errorMessage.push(
            `Thread ${thread.id} unlocks '${ins.lock}' without holding it`
          );
        } else {
          busyLocks.delete(ins.lock);
        }
      } else if (ins.type === "READ") {
        if (!varSet.has(ins.variable)) {
          errorMessage.push(`Thread ${thread.id} reads undeclared variable '${ins.variable}'`);
        }
      } else if (ins.type === "WRITE") {
        if (!varSet.has(ins.variable)) {
          errorMessage.push(`Thread ${thread.id} writes undeclared variable '${ins.variable}'`);
        }
      }
    }
    if (busyLocks.size > 0) {
      errorMessage.push(`Thread ${thread.id} exits while holding locks: ${[...busyLocks].join(", ")}`);
    }
  }
  
  return errorMessage;
}