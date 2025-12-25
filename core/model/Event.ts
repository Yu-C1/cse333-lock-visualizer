export type Event = {type: "ACQUIRE"; thread: number; lock: string}
                  | {type: "RELEASE"; thread: number; lock: string}
                  | {type: "BLOCK"; thread: number; lock: string}
                  | {type: "UNBLOCK"; thread: number; lock: string}
                  | {type: "READ"; thread: number; variable: string}
                  | {type: "WRITE"; thread: number; variable: string}
                  | {type: "DEADLOCK"}
                  | {type: "RACE"; variable: string; t1:number; t2: number};
                  