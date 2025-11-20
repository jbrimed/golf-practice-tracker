// =======================================================
// shortgame.js — Chipping & Greenside Performance
// =======================================================
//
// Philosophy:
// - Bounce first, soft release
// - One-ball reps, no retries
// - Landing zone control > mechanical constraints
// - Strike quality + confidence
// - No technical drills, no towel drills
//

export const SHORTGAME_DRILLS = [

  // ============================
  // LEVEL 1 — FOUNDATIONS
  // ============================

  {
    id: "chip-landing-baseline-l1",
    name: "Landing Spot Baseline — L1",
    category: "shortgame",
    level: 1,
    duration: 20,
    tags: ["landing", "strike", "confidence"],

    zones: {
      landingTolerance: 3,   // feet radius around spot
      ballOutcomeIgnored: true
    },

    rules: {
      balls: 20,
      oneBallOnly: false
    },

    scoring: {
      metric: "score",
      award: { make: 1, miss: 0 },
      pass: 12
    },

    description:
      "Hit 20 chip shots to the same landing zone. Track consistency to the spot, not where the ball finishes."
  },

  {
    id: "chip-strike-repeat-l1",
    name: "Strike Repeatability — L1",
    category: "shortgame",
    level: 1,
    duration: 15,
    tags: ["strike", "confidence"],

    rules: {
      balls: 15,
      oneBallOnly: true,
      randomLie: true
    },

    scoring: {
      metric: "percent_clean",
      pass: 65
    },

    description:
      "Drop a ball, chip it, move on. No second swings. Track clean vs. thin vs. chunky. Focus on soft-face release."
  },

  // ============================
  // LEVEL 2 — VARIABILITY + RANDOM
  // ============================

  {
    id: "chip-random-lies-l2",
    name: "Random Lie Roulette — L2",
    category: "shortgame",
    level: 2,
    duration: 20,
    tags: ["random", "booking", "confidence", "landing"],

    rules: {
      balls: 18,
      oneBallOnly: true,
      randomLie: true
    },

    zones: {
      landingTolerance: 2
    },

    scoring: {
      metric: "score",
      pass: 10
    },

    description:
      "Randomly drop balls in rough, fairway, sits down, uphill, downhill. Must play what you get—no resets."
  },

  {
    id: "chip-two-zone-switch-l2",
    name: "Two-Zone Alternation — L2",
    category: "shortgame",
    level: 2,
    duration: 20,
    tags: ["landing", "trajectory", "decision"],

    rules: {
      balls: 20,
      alternatingZones: true
    },

    zones: {
      zoneCount: 2,
      landingTolerance: 2
    },

    scoring: {
      metric: "score",
      pass: 14
    },

    description:
      "Alternate between two landing spots each rep: one closer, one mid-green. Trains decision change on command."
  },

  // ============================
  // LEVEL 3 — PRESSURE + CONSEQUENCE
  // ============================

  {
    id: "chip-pressure-ladder-l3",
    name: "Pressure Ladder — L3",
    category: "shortgame",
    level: 3,
    duration: 25,
    tags: ["pressure", "landing", "confidence"],

    rules: {
      oneBallOnly: true,
      randomLie: true
    },

    zones: {
      landingTolerance: 2
    },

    scoring: {
      metric: "streak",
      targetStreak: 6,
      resetOnFail: true
    },

    description:
      "Hit progressively harder lies or farther landing zones. Any miss resets streak to 0. Tournament pressure."
  },

  {
    id: "chip-trajectory-demand-l3",
    name: "Trajectory Control Under Pressure — L3",
    category: "shortgame",
    level: 3,
    duration: 30,
    tags: ["trajectory", "pressure", "strike"],

    variation: {
      modes: ["low skip ‘n check", "stock mid", "slightly lofted"],
      order: "cycle"
    },

    zones: {
      landingTolerance: 2
    },

    scoring: {
      metric: "score",
      attemptsPerMode: 6,
      pass: 12
    },

    description:
      "Cycle through three trajectory windows. No extreme flops—just functional adjustments for real greenside shots."
  }

];
