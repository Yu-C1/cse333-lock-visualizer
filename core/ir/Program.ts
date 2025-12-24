import { Thread } from "./Thread";

export type Program = {
    locks: string[];
    variables: string[];
    threads: Thread[];
}