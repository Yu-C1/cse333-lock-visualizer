export type Event = {type: "ACQUIRE"; thread: number; lock: string}
                  | {type: "RELEASE"; thread: number; lock: string}
                  | {type: "LOCK"; thread: number; lock: string}
                  | {type: "READ"; thread: number; variable: string}
                  | {type: "WRITE"; thread: number; variable: string}
                  