export type Instruction = {type: "LOCK"; lock: string}
                        | {type: "UNLOCK"; lock: string}
                        | {type: "READ"; variable: string}
                        | {type: "WRITE"; variable: string};  