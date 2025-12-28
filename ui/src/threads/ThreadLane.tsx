import { Instruction } from "core/ir/Instruction";
import { DroppedInstruction } from "./DroppedInstruction";

type UiThread = {
  id: number;
  instructions: Instruction[];
};

type Props = {
  thread: UiThread;
  current: any;
  onDropInstruction: (ins: Instruction) => void;
  onRemoveInstruction: (index: number) => void;
  onReorderInstruction: (from: number, to: number) => void;
};

export function ThreadLane({
  thread,
  current,
  onDropInstruction,
  onRemoveInstruction,
  onReorderInstruction
}: Props) {
  return (
    <div
      className="thread-lane"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain");
        if (!raw) return;

        const data = JSON.parse(raw);

        // Case 1: from palette → append
        if (data.kind === "palette") {
          onDropInstruction(data.instruction);
          return;
        }

        // Case 2: reordering within thread → move to end
        if (data.kind === "thread") {
          onReorderInstruction(data.fromIndex, thread.instructions.length - 1);
        }
      }}
    >
      <h3>Thread {thread.id}</h3>

      {thread.instructions.map((ins, i) => {
        const active =
          current &&
          current.threadId === thread.id &&
          current.type === ins.type &&
          ((current.lock && current.lock === (ins as any).lock) ||
           (current.variable && current.variable === (ins as any).variable));

        return (
          <div
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const raw = e.dataTransfer.getData("text/plain");
              if (!raw) return;

              const data = JSON.parse(raw);

              if (data.kind === "thread") {
                onReorderInstruction(data.fromIndex, i);
              }

              if (data.kind === "palette") {
                onReorderInstruction(
                  thread.instructions.length, // treat palette insert as move-from-end
                  i
                );
                onDropInstruction(data.instruction);
              }
            }}
          >
            <DroppedInstruction
              instruction={ins}
              active={active}
              threadId={thread.id}
              index={i}
              onRemove={() => onRemoveInstruction(i)}
            />
          </div>
        );
      })}
    </div>
  );
}