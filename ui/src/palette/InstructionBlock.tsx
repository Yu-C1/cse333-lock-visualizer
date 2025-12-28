import { Instruction } from "core/ir/Instruction";

export function InstructionBlock({ instruction }: { instruction: Instruction }) {
  return (
    <div
      className="instruction-block"
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            kind: "palette",
            instruction
          })
        );
      }}
    >
      {renderLabel(instruction)}
    </div>
  );
}

function renderLabel(ins: Instruction) {
  switch (ins.type) {
    case "LOCK":
      return `lock(${ins.lock})`;
    case "UNLOCK":
      return `unlock(${ins.lock})`;
    case "READ":
      return `read(${ins.variable})`;
    case "WRITE":
      return `write(${ins.variable})`;
  }
}