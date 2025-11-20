// =======================================================
// driver.js — Pattern-based Driver Drills (Fade-biased)
// =======================================================
//
// RULES ENFORCED:
// - Required finish = right
// - Preferred start = left; right-start acceptable
// - Scoring is outcome-based, LM optional
// - No yardage constraints
// - Speed only in { play, max }
// - Leveling increases: tighter corridors + streaks + shot variety
//

export const DRIVER_DRILLS = [

  // ============================
  // LEVEL 1 — FOUNDATION PATTERN
  // ============================

  {
    id: "driver-fade-foundation-l1",
    name: "Fade Window Foundations — L1",
    category: "driver",
    level: 1,
    duration: 20,
    tags: ["start_line", "curvature", "dispersion", "face_control"],
    speedMode: "play",

    lanes: {
      corridor: 40,         // total width in yards
      requiredFinish: "right",
      preferredStart: "left"
    },

    strikeTracking: true,
    launchMonitor: { optional: true },

    description:
      "Start left when possible, finish right. Wide corridor. Focus on stable face delivery, not curve size.",

    scoring: {
      metric: "score",
      attempts: 20,
      award: {
        optimal: 2,      // left → right
        good: 1,         // center → right
        acceptable: 0.5, // right → right
        miss: -1,        // finishes left but inside 20y
        fail: -3         // finishes left outside corridor
      },
      pass: 12
    }
  },

  {
    id: "driver-contact-baseline-l1",
    name: "Strike Cluster Baseline — L1",
    category: "driver",
    level: 1,
    duration: 15,
    tags: ["strike", "face_control", "dispersion"],
    speedMode: "play",

    lanes: {
      requiredFinish: "right",
      corridor: 45
    },

    strikeTracking: true,

    description:
      "Face spray. Focus on keeping cluster consistent across 15 swings. No speed agenda, just locate strike bias.",

    scoring: {
      metric: "percent_center",
      attempts: 15,
      pass: 50  // % of strikes should be center-ish
    }
  },

  // ============================
  // LEVEL 2 — TIGHTER PATTERN + RANDOMNESS
  // ============================

  {
    id: "driver-fade-tighten-l2",
    name: "Fade Window Tighten — L2",
    category: "driver",
    level: 2,
    duration: 20,
    tags: ["dispersion", "face_control", "start_line"],

    speedMode: "play",

    lanes: {
      corridor: 30,
      requiredFinish: "right",
      preferredStart: "left"
    },

    scoring: {
      metric: "score",
      attempts: 20,
      award: {
        optimal: 2,
        good: 1,
        acceptable: 0.25,
        miss: -1,
        fail: -3
      },
      pass: 14
    },

    description:
      "Tighter corridor. Track strike as fatigue sets in. Focus on controlled start direction."
  },

  {
    id: "driver-random-start-lines-l2",
    name: "Start-Line Awareness Shuffle — L2",
    category: "driver",
    level: 2,
    duration: 20,
    tags: ["start_line", "random", "face_control", "curvature"],

    speedMode: "play",

    lanes: {
      corridor: 35,
      requiredFinish: "right"
    },

    variation: {
      patterns: ["left-start", "center-start", "right-start"],
      mode: "random"
    },

    description:
      "For each ball, UI/randomizer tells you the intended start line. Fade remains required; right-start shots are judged on finish only."
  },

  {
    id: "driver-max-send-baseline-l2",
    name: "Max Intent Baseline — L2",
    category: "driver",
    level: 2,
    duration: 18,
    tags: ["speed", "face_control", "dispersion"],
    speedMode: "max",

    lanes: {
      corridor: 45,
      requiredFinish: "right"
    },

    scoring: {
      metric: "score",
      attempts: 12,
      award: {
        optimal: 1,
        acceptable: 0.5,
        fail: -2
      },
      pass: 6
    },

    description:
      "First block of max-intent swings. Not scored by LB data, only finish pattern. Good for speed days when dispersion shouldn't collapse."
  },

  // ============================
  // LEVEL 3 — PRESSURE + COMPLEXITY
  // ============================

  {
    id: "driver-pressure-streak-l3",
    name: "Fade Streak Pressure — L3",
    category: "driver",
    level: 3,
    duration: 25,
    tags: ["pressure", "dispersion", "face_control", "curvature"],

    speedMode: "play",

    lanes: {
      corridor: 25,
      requiredFinish: "right"
    },

    scoring: {
      metric: "streak",
      targetStreak: 6,
      resetOnFail: true
    },

    description:
      "Must complete 6 successful fades in a row. Restart on any left finish. Forces tournament-like intent."
  },

  {
    id: "driver-shape-variation-l3",
    name: "Fade Profiles Variation — L3",
    category: "driver",
    level: 3,
    duration: 30,
    tags: ["trajectory", "curvature", "start_line", "pressure"],

    speedMode: "play",

    lanes: {
      corridor: 28,
      requiredFinish: "right"
    },

    variation: {
      patterns: ["stock fade", "low fade", "high hold-off fade"],
      order: "cycle"
    },

    scoring: {
      metric: "score",
      attempts: 18,
      pass: 11
    },

    description:
      "Alternate through 3 fade variants. Tests delivery adaptability rather than raw repeatability."
  },

  {
    id: "driver-max-intent-pressure-l3",
    name: "Max Intent Under Pressure — L3",
    category: "driver",
    level: 3,
    duration: 20,
    tags: ["speed", "pressure", "dispersion", "face_control"],
    speedMode: "max",

    lanes: {
      corridor: 35,
      requiredFinish: "right"
    },

    scoring: {
      metric: "streak",
      targetStreak: 4,
      resetOnFail: true
    },

    description:
      "Full-send swings must still finish right. Streak format forces discipline at high intent."
  }

];
