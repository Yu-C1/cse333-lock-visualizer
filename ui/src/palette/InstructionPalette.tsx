import { Instruction } from "core/ir/Instruction";
import { InstructionBlock } from "./InstructionBlock";

const PALETTE: Instruction[] = [
  { type: "LOCK", lock: "A" },
  { type: "UNLOCK", lock: "A" },

  { type: "LOCK", lock: "B" },
  { type: "UNLOCK", lock: "B" },

  { type: "READ", variable: "x" },
  { type: "WRITE", variable: "x" }
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
