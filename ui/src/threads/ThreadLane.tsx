import { Instruction } from "core/ir/Instruction";
import { DroppedInstruction } from "./DroppedInstruction";

type UiThread = {
  id: number;
  instructions: Instruction[];
};

type Props = {
  thread: UiThread;
  current: any;
  locks: string[];
  variables: string[];
  onDropInstruction: (ins: Instruction, index: number) => void;
  onRemoveInstruction: (index: number) => void;
  onReorderInstruction: (from: number, to: number) => void;
  onUpdateInstruction: (index: number, ins: Instruction) => void;
};

export function ThreadLane({
  thread,
  current,
  locks,
  variables,
  onDropInstruction,
  onRemoveInstruction,
  onReorderInstruction,
  onUpdateInstruction
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

        if (data.kind === "palette") {
          onDropInstruction(data.instruction, thread.instructions.length);
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
              const raw = e.dataTransfer.getData("text/plain");
              if (!raw) return;

              const data = JSON.parse(raw);
              if (data.kind === "thread" && data.fromIndex !== i) {
                onReorderInstruction(data.fromIndex, i);
              }
            }}
          >
            <DroppedInstruction
              instruction={ins}
              active={active}
              threadId={thread.id}
              index={i}
              locks={locks}
              variables={variables}
              onUpdate={(updated) => onUpdateInstruction(i, updated)}
              onRemove={() => onRemoveInstruction(i)}
            />
          </div>
        );
      })}
    </div>
  );
}
