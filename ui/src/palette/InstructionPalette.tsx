import { Instruction } from "core/ir/Instruction";
import { InstructionBlock } from "./InstructionBlock";

const PALETTE: Instruction[] = [
  { type: "LOCK", lock: "" },
  { type: "UNLOCK", lock: "" },
  { type: "READ", variable: "" },
  { type: "WRITE", variable: "" }
];

export function InstructionPalette() {
  return (
    <div className="palette">
      <h3>Instructions</h3>
      {PALETTE.map((ins, i) => (
        <InstructionBlock key={i} instruction={ins} />
      ))}
    </div>
  );
}
