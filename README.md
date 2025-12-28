# Lock Visualizer – Concurrency Visualizer

An interactive web-based tool for **building, visualizing, and analyzing concurrent thread programs**.  
This project helps users understand **locks, data races, and deadlocks** through drag-and-drop execution modeling and step-by-step analysis.

🌐 **Live Demo:** https://yu-c1.github.io/cse332-lock-visualizer/
*(GitHub Pages deployment)*

---

## Motivation

Concurrency bugs such as **data races** and **deadlocks** are notoriously difficult to debug.  
This project aims to make these issues **visual, interactive, and intuitive**.

---

## Features

### Drag-and-Drop Thread Construction
- Build concurrent programs by dragging instructions into **Thread 1** and **Thread 2**
- Supported operations:
  - `lock(A)`, `unlock(A)`
  - `lock(B)`, `unlock(B)`
  - `read(x)`, `write(x)`

### Static Concurrency Analysis
- Detects:
  - **Data races** (unsynchronized reads/writes)
  - **Invalid lock usage** (unlock without ownership, exit without unlock .etc)
  - **Deadlock potential**
- Provides clear explanations of why an issue is dangerous
- Suggests concrete fixes (e.g., wrapping reads/writes with the same lock)

### Execution Timeline Visualization
- Displays a timeline of:
  - Lock acquisition
  - Reads
  - Releases
- Helps users reason about interleavings and shared state access

### Safe Program Detection
- Confirms when a program is free of races and deadlocks
- Provides positive feedback for correct synchronization

---

## Tech Stack

- **Frontend:** React + TypeScript
- **UI:** Custom dark-mode interface with visual feedback
- **Deployment:** GitHub Pages

---

## Example Scenarios

### Correct Synchronization
```text
Thread 1:
  lock(A)
  read(x)
  unlock(A)

Thread 2:
  lock(A)
  write(x)
  unlock(A)

## How It Works Internally

The Lock Visualizer models concurrent execution using a **structured program representation** and a **deterministic analysis pass**, rather than real OS threads. This avoids nondeterminism while allowing precise reasoning about synchronization correctness.

---

### Program Representation

Each thread is represented as an **ordered list of instructions**, where every instruction has:
- a **type** (`LOCK`, `UNLOCK`, `READ`, `WRITE`)
- an optional **resource** (`A`, `B`, or `x`)
- an associated **thread ID**
