// This is a demo test file

// import { findFailingExecution } from "./Simulator";
// import { Program } from "../ir/Program";

// const program: Program = {
//   locks: ["A", "B"],
//   variables: ["x"],
//   threads: [
//     {
//       id: 1,
//       instructions: [
//         { type: "LOCK", lock: "A" },
//         { type: "LOCK", lock: "B" },
//         { type: "UNLOCK", lock: "B" },
//         { type: "UNLOCK", lock: "A" }
//       ]
//     },
//     {
//       id: 2,
//       instructions: [
//         { type: "LOCK", lock: "B" },
//         { type: "LOCK", lock: "A" },
//         { type: "UNLOCK", lock: "A" },
//         { type: "UNLOCK", lock: "B" }
//       ]
//     }
//   ]
// };

// const res = findFailingExecution(program, { maxAttempts: 200, stepLimit: 1000, seed: 7 });
// console.log(res.status);
// console.log(res.events);
