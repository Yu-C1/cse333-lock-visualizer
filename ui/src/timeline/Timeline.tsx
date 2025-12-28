import { Event } from "core/model/Event";

export function Timeline({ events, step }: { events: Event[]; step: number }) {
  const actions = events.filter(
    e => e.type !== "RACE" && e.type !== "DEADLOCK"
  );

  return (
    <div className="timeline">
      <div className="event-log">
        {actions.slice(0, step).map((e, i) => (
          <div key={i} className={`event event-${e.type.toLowerCase()}`}>
            {e.type}
          </div>
        ))}
      </div>
    </div>
  );
}
