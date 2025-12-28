import { useState } from "react";
import { Program } from "core/ir/Program";
import { validateProgram } from "core/validation/Validator";
import { findFailingExecution } from "core/simulator/Simulator";
import { InstructionPalette } from "../palette/InstructionPalette";
import { ThreadLane } from "../threads/ThreadLane";
import { Timeline } from "../timeline/Timeline";

type CurrentExec = {
  threadId: number;
  type: string;
  lock?: string;
  variable?: string;
} | null;

function getCurrentExecution(events: any[], step: number): CurrentExec {
  if (step === 0 || step > events.length) return null;
  const e = events[step - 1];
  if (["ACQUIRE", "RELEASE", "READ", "WRITE"].includes(e.type)) {
    return e;
  }
  return null;
}

function Diagnostics({ events }: { events: any[] }) {
  const races = events.filter(e => e.type === "RACE");
  const deadlocks = events.filter(e => e.type === "DEADLOCK");

  if (races.length === 0 && deadlocks.length === 0) {
    return (
      <div className="diagnostics-success">
        <div className="success-badge">
          <span className="success-icon">✓</span>
          <div className="success-content">
            <h3>Great Job! No Issues Detected</h3>
            <p>Your program is free from data races and deadlocks. Both threads can execute safely.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnostics-panel">
      <h3 className="diagnostics-title"> Analysis Results</h3>

      {deadlocks.map((_, i) => (
        <div key={i} className="issue-card deadlock-card">
          <div className="issue-header">
            <span className="issue-icon">🔒</span>
            <h4>Deadlock Detected</h4>
          </div>
          <div className="issue-body">
            <p className="issue-description">
              Threads are waiting on locks held by each other, creating a circular dependency. 
              No thread can proceed.
            </p>
            <div className="issue-explanation">
              <strong>What's happening:</strong>
              <ul>
                <li>Thread 1 holds Lock A and waits for Lock B</li>
                <li>Thread 2 holds Lock B and waits for Lock A</li>
                <li>Result: Both threads are stuck forever ⏸️</li>
              </ul>
            </div>
            <div className="issue-tip">
              <strong>💡 Fix:</strong> Ensure all threads acquire locks in the same order (e.g., always Lock A before Lock B)
            </div>
          </div>
        </div>
      ))}

      {races.map((r, i) => (
        <div key={i} className="issue-card race-card">
          <div className="issue-header">
            <span className="issue-icon">⚡</span>
            <h4>Data Race on Variable <code className="var-code">{r.variable}</code></h4>
          </div>
          <div className="issue-body">
            <p className="issue-description">
              Thread {r.t1} and Thread {r.t2} access <code className="var-code">{r.variable}</code> at 
              the same time without proper synchronization.
            </p>
            <div className="issue-explanation">
              <strong>Why this is dangerous:</strong>
              <ul>
                <li>One thread reads while another writes → unpredictable values</li>
                <li>Both threads write → lost updates</li>
                <li>Race conditions lead to hard-to-debug bugs</li>
              </ul>
            </div>
            <div className="issue-tip">
              <strong>💡 Fix:</strong> Wrap both READ and WRITE operations with the same lock (e.g., both use Lock A)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Workspace() {
  const [program, setProgram] = useState<Program>({
    locks: ["A", "B"],
    variables: ["x"],
    threads: [
      { id: 1, instructions: [] },
      { id: 2, instructions: [] }
    ]
  });

  const [events, setEvents] = useState<any[] | null>(null);
  const [step, setStep] = useState(0);

  const current = events ? getCurrentExecution(events, step) : null;

  function analyze() {
    const errors = validateProgram(program);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
    const trace = findFailingExecution(program);
    setEvents(trace.events);
    setStep(0);
  }

  function resetProgram() {
    setProgram(p => ({
      ...p,
      threads: p.threads.map(t => ({ ...t, instructions: [] }))
    }));
    setEvents(null);
    setStep(0);
  }

  return (
    <div className="workspace-container">
      {/* Header */}
      <div className="workspace-header">
        <h1>🧵 Concurrency Visualizer</h1>
        <p className="workspace-subtitle">
          Build thread programs and discover race conditions & deadlocks
        </p>
      </div>

      {/* Editor */}
      <div className="workspace-layout">
        <InstructionPalette />

        <div className="threads-container">
          <div className="threads-header">
            <h2>Thread Programs</h2>
            <p>Drag instructions from the palette to build your concurrent program</p>
          </div>
          <div className="threads">
            {program.threads.map(t => (
              <ThreadLane
                key={t.id}
                thread={t}
                current={current}
                onDropInstruction={(ins) => {
                  setProgram(p => ({
                    ...p,
                    threads: p.threads.map(th =>
                      th.id === t.id
                        ? { ...th, instructions: [...th.instructions, ins] }
                        : th
                    )
                  }));
                }}
                onRemoveInstruction={(index) => {
                  setProgram(p => ({
                    ...p,
                    threads: p.threads.map(th =>
                      th.id === t.id
                        ? {
                            ...th,
                            instructions: th.instructions.filter((_, i) => i !== index)
                          }
                        : th
                    )
                  }));
                }}
                onReorderInstruction={(from, to) => {
                  setProgram(p => ({
                    ...p,
                    threads: p.threads.map(th => {
                      if (th.id !== t.id) return th;
                      if (to < 0 || to >= th.instructions.length) return th;

                      const copy = [...th.instructions];
                      const [item] = copy.splice(from, 1);
                      copy.splice(to, 0, item);
                      return { ...th, instructions: copy };
                    })
                  }));
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="control-panel">
        <button className="btn-primary" onClick={analyze}>
          Analyze Program
        </button>

        {events && (
          <div className="playback-controls">
            <button className="btn-secondary" onClick={resetProgram}>
              ↻ Reset
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setStep(s => Math.min(s + 1, events.length))}
              disabled={step >= events.length}
            >
              Next →
            </button>
            <span className="step-indicator">
              Step <strong>{step}</strong> of <strong>{events.length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Timeline */}
      {events && (
        <div className="timeline-section">
          <h3>Execution Timeline</h3>
          <Timeline events={events} step={step} />
        </div>
      )}

      {/* Diagnostics */}
      {events && <Diagnostics events={events} />}
    </div>
  );
}