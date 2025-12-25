import { Program } from "../ir/Program";
import { Event } from "../model/Event";
import { Instruction } from "../ir/Instruction";
import { makeMulberry32, pickRandomIndex, Rng } from "./Rng";

type ThreadState = {
  id: number;
  insIndex: number;  // index of the next instruction
  lockSet: Set<string>;
  blockedLock: string | undefined;  // name of the blocked lock
};

type GlobalState = {
  lockOwner: Map<string, number>;  // lock -> threadId
};

type AccessRecord = {
  threadId: number;
  isWrite: boolean;
  lockSet: Set<string>;
};

export type SimulationResult = {
  events: Event[];
  status: "OK" | "DEADLOCK" | "RACE" | "STEP_LIMIT";
};

// Detect if lockSet a and b shares any lock
function hasCommonLock(a: Set<string>, b: Set<string>): boolean {
  for (const lock of a) {
    if (b.has(lock)) {
      return true;
    }
  }
  return false;
}

// Checks if the thread t is runnable(not held by a lock, 
// and the index of the instruction is within bound)
function isRunnable(t: ThreadState, program: Program): boolean {
  const thread = program.threads.find((x) => x.id === t.id);
  if (!thread) {
    return false;
  }
  return t.blockedLock === undefined && t.insIndex < thread.instructions.length;
}

// Get the next instruction
function getNextInstruction(t: ThreadState, program: Program): Instruction | undefined{
  const thread = program.threads.find((x) => x.id === t.id);
  if (!thread) {
    return undefined;
  }
  return thread.instructions[t.insIndex];
}

// Wake the next thread sequentially that was blocked by the given lock
function wakeWaiterThreads(ts: ThreadState[], lock: string, events: Event[]) {
  for (const t of ts) {
    if (t.blockedLock === lock) {
      t.blockedLock = undefined;
      events.push({type: "UNBLOCK", thread: t.id, lock});
    }
  }
}

// Runs an instruction
function stepOnce(program: Program,
  threads: ThreadState[],
  global: GlobalState,
  events: Event[],
  lastAccessByVar: Map<string, AccessRecord>): "OK" | "RACE" {
    const runnable = threads.filter((t) => isRunnable(t, program));
    if (runnable.length === 0) {
      return "OK";
    }
    const rng = (stepOnce as any)._rng as Rng;
    // Pick a random runnable thread
    const pick = runnable[pickRandomIndex(rng, runnable.length)]!;
    const ins = getNextInstruction(pick, program);
    if (!ins) {
      return "OK";
    }

    switch(ins.type) {
      case "LOCK": {
        const owner = global.lockOwner.get(ins.lock);
        if (owner === undefined) {
          global.lockOwner.set(ins.lock, pick.id);
          pick.lockSet.add(ins.lock);
          events.push({type: "ACQUIRE", thread: pick.id, lock: ins.lock});
          pick.insIndex += 1;
        } else if (owner === pick.id) {
          // Should be prevented by validator(double lock), but just to be safe
          pick.blockedLock = ins.lock;
          events.push({type: "BLOCK", thread: pick.id, lock: ins.lock});
        } else {
          pick.blockedLock = ins.lock;
          events.push({type: "BLOCK", thread: pick.id, lock: ins.lock});
        }
        return "OK";
      }

      case "UNLOCK": {
        // Should be prevented by validator, but just to be safe
        const owner = global.lockOwner.get(ins.lock);
        if (owner === pick.id) {
          global.lockOwner.delete(ins.lock);
          pick.lockSet.delete(ins.lock);
          events.push({type: "RELEASE", thread: pick.id, lock: ins.lock});
          wakeWaiterThreads(threads, ins.lock, events);
        }
        pick.insIndex += 1;
        return "OK";
      }

      case "READ":
      case "WRITE": {
        const isWrite = ins.type === "WRITE";
        events.push({type: ins.type, thread: pick.id, variable: ins.variable});
        // Race detection at run time
        // If last access to the same variable was from another thread,
        // at least one is write, and their locksets has no intersection
        // -> RACE!
        const current: AccessRecord = {
          threadId: pick.id,
          isWrite, 
          lockSet: new Set(pick.lockSet)
        };

        const prev = lastAccessByVar.get(ins.variable);
        if (prev && 
          prev.threadId !== current.threadId &&
          (prev.isWrite || current.isWrite) &&
          !hasCommonLock(prev.lockSet, current.lockSet)
        ) {
          events.push({type: "RACE", variable: ins.variable, t1: prev.threadId, t2: current.threadId});
          return "RACE";
        }
        lastAccessByVar.set(ins.variable, current);
        pick.insIndex += 1;
        return "OK";
      }
    }
  }

// Check if the program is done executing 
// (all thread's instruction index is 'out-of-bound')
function allDone(program: Program, ts: ThreadState[]): boolean {
  for (const t of ts) {
    const thread = program.threads.find((x) => x.id === t.id);
    if (!thread) {
      continue;
    }
    if (t.insIndex < thread.instructions.length) {
      return false;
    }
  }
  return true;
}

// Check if all threads are blocked or the program is done executing
function allBlockedOrDone(program: Program, ts: ThreadState[]): boolean {
  const anyRunnable = ts.some((t) => isRunnable(t, program));
  if (anyRunnable) {
    return false;
  }
  return !allDone(program, ts);
}

// Runs the simulation
export function simulateOnce(program: Program, options?: {seed?: number; stepLimit?: number}): SimulationResult {
  const seed = options?.seed ?? 123456789;
  const stepLimit = options?.stepLimit ?? 50000;
  const rng = makeMulberry32(seed);
  const threads:ThreadState[] = program.threads.map((t) => ({
    id: t.id,
    insIndex: 0,
    lockSet: new Set<string>(),
    blockedLock: undefined
  }));

  const global: GlobalState = {
    lockOwner: new Map<string, number>()
  };

  const events: Event[] = [];
  const lastAccessByVar = new Map<string, AccessRecord>();
  (stepOnce as any)._rng = rng;

  for (let steps = 0; steps < stepLimit; steps++) {
    if (allDone(program, threads)) {
      return {events, status: "OK"};
    }
    if (allBlockedOrDone(program, threads)) {
      events.push({type: "DEADLOCK"});
      return {events, status: "DEADLOCK"};
    }
    const status = stepOnce(program, threads, global, events, lastAccessByVar);
    if (status === "RACE") {
      return {events, status: "RACE"};
    }
  }
  return {events, status: "STEP_LIMIT"};
}

// Function to keep track and reproduce the failed execution path, if any
export function findFailingExecution(
  program: Program,
  options?: {maxAttempts?: number; stepLimit?: number; seed?: number}
): SimulationResult {
  const maxAttempts = options?.maxAttempts ?? 2000;
  const baseSeed = options?.seed ?? 1337;
  const stepLimit = options?.stepLimit ?? 50000;

  let last: SimulationResult = {events: [], status: "OK"};
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const seed = (baseSeed + attempt * 1013904223) >>> 0; // deterministic sequence of seeds
    const res = simulateOnce(program, { seed, stepLimit });
    last = res;
    if (res.status === "DEADLOCK" || res.status === "RACE") {
      return res;
    }
  }
  return last;
}