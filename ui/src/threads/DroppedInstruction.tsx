import { Instruction } from "core/ir/Instruction";

type Props = {
  instruction: Instruction;
  active?: boolean;
  onRemove?: () => void;
  onUpdate?: (ins: Instruction) => void;
  locks?: string[];
  variables?: string[];
  threadId?: number;
  index?: number;
};

export function DroppedInstruction({
  instruction,
  active,
  onRemove,
  onUpdate,
  locks = [],
  variables = [],
  threadId,
  index
}: Props) {
  function renderEditor() {
    if (!onUpdate) {
      return <span>{label(instruction)}</span>;
    }

    // LOCK / UNLOCK
    if (instruction.type === "LOCK" || instruction.type === "UNLOCK") {
      return (
        <>
          {instruction.type.toLowerCase()}(
          <select
            className="lock-select"
            value={instruction.lock}
            onChange={(e) =>
              onUpdate({ ...instruction, lock: e.target.value })
            }
          >
            <option value="">select lock</option>
            {locks.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          )
        </>
      );
    }

    // READ / WRITE
    return (
      <>
        {instruction.type.toLowerCase()}(
        <select
          className="var-select"
          value={instruction.variable}
          onChange={(e) =>
            onUpdate({ ...instruction, variable: e.target.value })
          }
        >
          <option value="">select variable</option>
          {variables.map((v) => (
            <option key={v} value={v.toLowerCase()}>
              {v.toLowerCase()}
            </option>
          ))}
        </select>
        )
      </>
    );
  }

  return (
    <div
      className={`dropped-instruction ${active ? "active-instruction" : ""}`}
      draggable
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
      <span className="inst-label">{renderEditor()}</span>

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
