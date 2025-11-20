// ===========================================
// approach.js — Dynamic Yardage Iron + Hybrid Drills
// ===========================================
//
// These drills assume a *user-defined yardage range* for the session,
// NOT fixed distances. The session UI should collect:
//   e.g., minYardage = 140, maxYardage = 170
//
// Each drill specifies:
//  - number of targets inside the range
//  - spacing between targets
//  - scoring rules
//  - difficulty scaling
//

export const APPROACH_DRILLS = [

  // -------------------------------------------
  // LEVEL 1 — FOUNDATIONS
  // -------------------------------------------

  {
    id: "approach-dispersion-l1",
    name: "Dynamic Dispersion Challenge — L1",
    category: "approach",
    level: 1,
    duration: 20,
    tags: ["dispersion", "start_line", "face_control"],
    
    yardageMode: {
      type: "dynamic",
      count: 2,
      spacing: 10
    },

    windows: {
      leftRight: 15,  // yards offline allowed
      depth: 12
    },

    description:
      "Pick 2 random targets in your defined yardage range. Hit 10 balls per target. Score based on staying inside the dispersion window.",
    
    scoring: {
      metric: "score",
      attemptsPerTarget: 10,
      pointCondition: "inside_window", // logic handled in UI
      pass: 10
    }
  },

  // -------------------------------------------
  {
    id: "approach-contact-l1",
    name: "Strike Stability — L1",
    category: "approach",
    level: 1,
    duration: 15,
    tags: ["strike", "face_control", "start_line"],
    
    yardageMode: {
      type: "dynamic",
      count: 1
    },

    windows: {
      leftRight: 18,
      depth: 15
    },

    description:
      "Choose 1 yardage in range. Use face spray + tee line reference. Track heel/center/toe distribution across 15 balls.",
    
    scoring: {
      metric: "percent_center",
      attempts: 15,
      pass: 60
    }
  },

  // -------------------------------------------
  // LEVEL 2 — HIGHER CONSISTENCY
  // -------------------------------------------

  {
    id: "approach-dispersion-l2",
    name: "Dynamic Dispersion — L2",
    category: "approach",
    level: 2,
    duration: 25,
    tags: ["dispersion", "face_control", "start_line", "pressure"],

    yardageMode: {
      type: "dynamic",
      count: 3,
      spacing: 12
    },

    windows: {
      leftRight: 12,
      depth: 10
    },

    description:
      "Three target distances spaced across your range. Tighter dispersion requirements and more total shots than L1.",
    
    scoring: {
      metric: "score",
      attemptsPerTarget: 10,
      pass: 18
    }
  },

  // -------------------------------------------
  {
    id: "approach-random-switch-l2",
    name: "Random Yardage Switch — L2",
    category: "approach",
    level: 2,
    duration: 20,
    tags: ["random", "distance", "start_line", "face_control"],

    yardageMode: {
      type: "dynamic",
      count: 5,
      spacing: 8
    },

    windows: {
      leftRight: 13,
      depth: 10
    },

    description:
      "UI randomly selects yardage before each swing. No repeated shots. Forces recalibration between swings.",
    
    scoring: {
      metric: "score",
      attempts: 20,
      pass: 12
    }
  },

  // -------------------------------------------
  // LEVEL 3 — PRESSURE + COURSE TRANSFER
  // -------------------------------------------

  {
    id: "approach-consequence-l3",
    name: "Pressure Consequence Challenge — L3",
    category: "approach",
    level: 3,
    duration: 30,
    tags: ["pressure", "dispersion", "start_line", "face_control", "random"],

    yardageMode: {
      type: "dynamic",
      count: 3,
      spacing: 15
    },

    windows: {
      leftRight: 10,
      depth: 8
    },

    description:
      "Three yardages. If you miss the window three shots in a row, restart the ladder. Mimics on-course tension.",
    
    scoring: {
      metric: "streak",
      targetStreak: 5,
      pass: 5 // must complete streak once
    }
  },

  // -------------------------------------------

  {
    id: "approach-shape-demand-l3",
    name: "Intent Shape Mode — L3",
    category: "approach",
    level: 3,
    duration: 25,
    tags: ["curvature", "start_line", "face_control", "trajectory"],

    yardageMode: {
      type: "dynamic",
      count: 2,
      spacing: 15
    },

    windows: {
      leftRight: 12,
      depth: 10
    },

    description:
      "Two yardages. One must be hit as a fade window, the other as a draw window, alternating shots.",
    
    scoring: {
      metric: "score",
      attemptsPerTarget: 8,
      pass: 10
    }
  }

];
