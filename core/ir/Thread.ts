import { Instruction } from "./Instruction";

export type Thread = {
   id: number;
   instructions: Instruction[]; 
}