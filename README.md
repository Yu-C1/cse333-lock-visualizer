# Lock Visualizer – Concurrency Visualizer

An interactive web-based tool for **building, visualizing, and analyzing concurrent thread programs**.  
This project helps users understand **locks, data races, and deadlocks** through drag-and-drop execution modeling and step-by-step analysis.

**Live Demo:** https://yu-c1.github.io/cse332-lock-visualizer/
*(GitHub Pages deployment)*

---

## Motivation

Concurrency bugs such as **data races** and **deadlocks** are notoriously difficult to debug.  
This project aims to make these issues visual, interactive, and intuitive.

---

## Features

### Drag-and-Drop Thread Construction
- Build concurrent programs by dragging instructions into **Thread 1** and **Thread 2**
- Supported operations:
  - `lock()`
  - `unlock()`
  - `read()`
  - `write()`

### Static Concurrency Analysis
Before execution, the program is statically validated to detect common concurrency errors. These include undeclared locks or variables, unlocking a lock without holding it, locking the same lock twice without unlocking, exiting a thread while still holding locks, and duplicate declarations. Any detected issues are reported with clear error messages explaining the problem.

- Detects:
  - **Data races** (unsynchronized reads/writes)
  - **Invalid lock usage** (unlock without ownership, exit without unlock .etc)
  - **Deadlock potential**
- Provides clear explanations of why an issue is dangerous
- Suggests concrete fixes (e.g., wrapping reads/writes with the same lock)

### Execution Timeline Visualization
- Displays a timeline of:
  - Lock acquisition
  - Reads / Writes
  - Releases
- Helps users reason about interleavings and shared state access

---

## Tech Stack

- **Frontend:** React + TypeScript
- **UI:** Custom dark-mode interface with visual feedback
- **Deployment:** GitHub Pages

---

## Intended Audience
This tool is intended for computer science students learning concurrency, or teaching assistants/instructors who want a visual teaching aid, and those that want an intuitive way to understand synchronization bugs.

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
```
### Incorrect Synchronization
```text
Thread 1:
  lock(A)
  read(x)
  unlock(A)

Thread 2:
  lock(B)
  write(x)
  unlock(B)

  DATA RACE!!
  ```

## How It Works Internally

The Lock Visualizer models concurrent programs using a structured and data-driven representation rather than executing real threads. Each thread is represented as an ordered list of instructions (lock, unlock, read, write), allowing the system to deterministically simulate execution interleavings. This allows static detection of data races, deadlocks, and invalid lock usage without relying on OS-level concurrency. 
---

### Program Representation

Each thread is represented as an **ordered list of instructions**, where every instruction has:
- a **type** (`LOCK`, `UNLOCK`, `READ`, `WRITE`)
- an optional **resource** (`A`, `B`, or `x`)
- an associated **thread ID**
