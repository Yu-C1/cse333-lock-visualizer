import { Instruction } from "core/ir/Instruction";

export function DroppedInstruction({
  instruction,
  active,
  onRemove,
  threadId,
  index
}: {
  instruction?: Instruction;
  active?: boolean;
  onRemove?: () => void;
  threadId?: number;
  index?: number;
}) {
  if (!instruction) {
    return null;
  }

  return (
    <div 
      className={`dropped-instruction ${active ? "active-instruction" : ""}`}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            kind: "thread",
            threadId,
            fromIndex: index
          })
        );
      }}
    >
      <span className="inst-label">{label(instruction)}</span>

      <button className="remove-btn" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

function label(ins: Instruction) {
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