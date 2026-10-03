// Every problem the visualizer offers, in dropdown order. Problems with the
// same `set` are grouped together. To add one, copy _template.js, fill it
// in, and import it here (see docs/visualizer.md).
import mystery from "./pset1-1-mystery.js";
import extremes from "./pset1-4-extremes.js";
import goodPairs from "./pset1-5-good-pairs.js";
import strassen from "./pset2-1-strassen.js";
import tournament from "./pset2-2-tournament.js";
import matrixChain from "./pset2-3-matrix-chain.js";
import lis from "./pset2-4-lis.js";
import knapsack from "./pset2-5-knapsack.js";

export const problems = [
  mystery,
  extremes,
  goodPairs,
  strassen,
  tournament,
  matrixChain,
  lis,
  knapsack,
];
