// =======================================================
// wedges.js — Distance + Strike + Flight Control
// =======================================================
//
// Philosophy:
// - Wedges = carry control, flight bias, strike consistency
// - Always performance based, not technical
// - No "high floater" drills unless added later
//

export const WEDGE_DRILLS = [

  // ============================
  // LEVEL 1 — Baseline Control
  // ============================

  {
    id: "wedges-distance-baseline-l1",
    name: "Carry Distance Baseline — L1",
    category: "wedges",
    level: 1,
    duration: 20,
    tags: ["distance", "strike", "trajectory"],

    yardageMode: {
      type: "dynamic",
      count: 2,          // logic-based: fewer targets, tighter windows
      spacing: 8
    },

    windows: {
      depth: 5,          // ±5 yards from intended carry
      leftRight: 6       // ±6 yards offline
    },

    scoring: {
      metric: "score",
      attemptsPerTarget: 10,
      award: { make: 1, miss: 0 },
      pass: 12
    },

    description:
      "Pick two distances in your wedge band. Track carry variance with low flight bias. No babying—normal swing intent."
  },

  {
    id: "wedges-strike-cluster-l1",
    name: "Strike Cluster Mapping — L1",
    category: "wedges",
    level: 1,
    duration: 15,
    tags: ["strike", "face_control"],

    yardageMode: {
      type: "dynamic",
      count: 1
    },

    windows: {
      depth: 6,
      leftRight: 6
    },

    strikeTracking: true,

    scoring: {
      metric: "percent_center",
      attempts: 15,
      pass: 65
    },

    description:
      "One distance. Track heel/toe/low/high clustering. Focus on consistent strike *bias*, not perfection."
  },

  // ============================
  // LEVEL 2 — Randomization / Adaptation
  // ============================

  {
    id: "wedges-random-yards-l2",
    name: "Random Yardage Recalibration — L2",
    category: "wedges",
    level: 2,
    duration: 20,
    tags: ["random", "distance", "strike", "trajectory"],

    yardageMode: {
      type: "dynamic",
      count: 4,
      spacing: 7,
      randomEachSwing: true
    },

    windows: {
      depth: 4,
      leftRight: 6
    },

    scoring: {
      metric: "score",
      attempts: 20,
      pass: 13
    },

    description:
      "Each swing gets a new target randomly generated. Forces recalibration rather than groove training."
  },

  {
    id: "wedges-flight-bias-l2",
    name: "Low Flight Bias — L2",
    category: "wedges",
    level: 2,
    duration: 15,
    tags: ["trajectory", "distance", "strike"],

    yardageMode: {
      type: "dynamic",
      count: 2,
      spacing: 10
    },

    windows: {
      depth: 4,
      leftRight: 6
    },

    scoring: {
      metric: "score",
      attemptsPerTarget: 8,
      pass: 10
    },

    description:
      "Hit lower-launch wedge flights (your stock bias). No floaters. This is your scoring window pattern."
  },

  // ============================
  // LEVEL 3 — Pressure + Restart
  // ============================

  {
    id: "wedges-ladder-pressure-l3",
    name: "Distance Ladder Restart — L3",
    category: "wedges",
    level: 3,
    duration: 25,
    tags: ["pressure", "distance", "strike"],

    yardageMode: {
      type: "dynamic",
      count: 3,
      spacing: 10
    },

    windows: {
      depth: 3,
      leftRight: 5
    },

    scoring: {
      metric: "streak",
      resetOnFail: true,
      targetStreak: 6
    },

    description:
      "Hit distances in ascending order. Any miss resets the ladder. Forces pressure and scoring awareness."
  },

  {
    id: "wedges-three-mode-l3",
    name: "Three-Mode Distance Alternation — L3",
    category: "wedges",
    level: 3,
    duration: 30,
    tags: ["distance", "trajectory", "strike", "pressure"],

    yardageMode: {
      type: "dynamic",
      count: 3,
      spacing: 8
    },

    windows: {
      depth: 3,
      leftRight: 5
    },

    variation: {
      modes: ["low spin", "stock", "flighted low"],
      order: "cycle"
    },

    scoring: {
      metric: "score",
      attemptsPerMode: 6,
      pass: 12
    },

    description:
      "Alternate between 3 wedge identities: stock, low spinny bullet, and flighted choke-down. Forces intent-driven control."
  }

];
