import { Program } from "core/ir/Program";

type Props = {
  program: Program;
  onChange: (p: Program) => void;
};

export function ProgramEditor({ program }: Props) {
  return (
    <div>
      <h3>Threads</h3>
      {program.threads.map(t => (
        <div key={t.id}>
          <b>Thread {t.id}</b>
          <pre>{JSON.stringify(t.instructions, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
