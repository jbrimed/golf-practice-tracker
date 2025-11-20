// =======================================================
// putting.js — Performance-Based Putting Drills
// =======================================================
//
// Principles:
// - Outcome > mechanics
// - Pace + pressure + start line
// - Indoors acceptable
// - No technical stroke fixes
// - Multiple difficulty levels with scoring
//

export const PUTTING_DRILLS = [

  // ============================
  // LEVEL 1 — FOUNDATIONS
  // ============================

  {
    id: "putt-shortline-l1",
    name: "Short Line Control — L1",
    category: "putting",
    level: 1,
    duration: 15,
    tags: ["short", "start-line", "confidence"],

    rules: {
      distance: 4,  // feet
      attempts: 20,
      gateWidth: 1.5 // inches wider than ball
    },

    scoring: {
      metric: "makes",
      pass: 14
    },

    description:
      "Put from 4 ft through a gate slightly wider than the ball. Focus on starting the ball on line, not dying it in."
  },

  {
    id: "putt-distance-baseline-l1",
    name: "Lag Baseline — L1",
    category: "putting",
    level: 1,
    duration: 20,
    tags: ["pace", "distance"],

    rules: {
      distances: [15, 25, 35],
      attemptsPerDistance: 6,
      circleRadius: 3 // feet
    },

    scoring: {
      metric: "inside_circle",
      pass: 12
    },

    description:
      "Roll putts to long targets and track if ball finishes within 3 ft radius. Ball can stop short or long—just inside circle."
  },

  // ============================
  // LEVEL 2 — PROGRESSION + PRESSURE
  // ============================

  {
    id: "putt-short-streak-l2",
    name: "Short Putts Streak — L2",
    category: "putting",
    level: 2,
    duration: 15,
    tags: ["pressure", "short", "confidence"],

    rules: {
      distance: 6,
      gateWidth: 1.25 // tighter gate
    },

    scoring: {
      metric: "streak",
      targetStreak: 8,
      resetOnMiss: true
    },

    description:
      "Make consecutive putts from 6 ft through a narrow gate. A miss resets streak. Builds tournament resilience."
  },

  {
    id: "putt-die-speed-l2",
    name: "Capture Speed (Die Speed) — L2",
    category: "putting",
    level: 2,
    duration: 20,
    tags: ["pace", "feel"],

    rules: {
      distances: [20, 30],
      attemptsPerDistance: 10,
      mustStopBefore: "back_lip",
      maxPastHoleFt: 1
    },

    scoring: {
      metric: "qualified_putts",
      pass: 12
    },

    description:
      "Putt long putts that must reach the hole *but stop before running more than 1 ft past*. Favours soft capture velocity."
  },

  {
    id: "putt-three-distance-switch-l2",
    name: "Three Distance Alternation — L2",
    category: "putting",
    level: 2,
    duration: 20,
    tags: ["pace", "decision", "adaptation"],

    rules: {
      distances: [6, 20, 35],
      alternating: true,
      order: "random"
    },

    scoring: {
      metric: "distance_accuracy",
      toleranceFt: 1.5,
      pass: 15
    },

    description:
      "Rotate between short, mid, and long putts in random order, training recalibration rather than blocked practice."
  },

  // ============================
  // LEVEL 3 — ELITE PRESSURE
  // ============================

  {
    id: "putt-circle-drill-l3",
    name: "Circle of Death — L3",
    category: "putting",
    level: 3,
    duration: 25,
    tags: ["pressure", "short", "confidence"],

    rules: {
      putts: 24,
      distance: 6,
      circleCount: 8,
      circleSize: 6 // feet radius around hole
    },

    scoring: {
      metric: "makes",
      pass: 18
    },

    description:
      "Place 8 balls around the hole at 6 ft in a circle. Make all 8. Repeat 3 cycles. Very tournament-style pressure."
  },

  {
    id: "putt-staircase-l3",
    name: "Distance Staircase — L3",
    category: "putting",
    level: 3,
    duration: 30,
    tags: ["pace", "pressure"],

    rules: {
      distances: [10, 15, 20, 25, 30, 35],
      toleranceFt: 1.25,
      restartOnFail: true
    },

    scoring: {
      metric: "progress",
      goal: "complete full ladder"
    },

    description:
      "Must land inside tolerance at each distance in sequence. One miss sends you back to the first distance."
  }

];
// =======================================================
// ADDITIONAL INDOOR / STRAIGHT-MAT PUTTING DRILLS
// =======================================================

// ----------------------------
// Precision Start Line (Yardstick) — L2
// ----------------------------
{
  id: "putt-yardstick-l2",
  name: "Yardstick Start Line — L2",
  category: "putting",
  level: 2,
  duration: 15,
  tags: ["start-line", "indoor", "precision"],

  rules: {
    distance: 6,
    tool: "yardstick or metal ruler",
    attempts: 20
  },

  scoring: {
    metric: "makes",
    pass: 15
  },

  description:
    "Roll putts fully down a yardstick without falling off. Track how many stay on the track until the ball touches turf."
},

// ----------------------------
// Eyes Closed Finish — L2
// ----------------------------
{
  id: "putt-eyes-closed-l2",
  name: "Eyes Closed Finish — L2",
  category: "putting",
  level: 2,
  duration: 15,
  tags: ["feel", "indoor", "pace"],

  rules: {
    distance: 7,
    attempts: 15,
    closeEyesAfterImpact: true
  },

  scoring: {
    metric: "within_distance",
    toleranceFt: 1.25,
    pass: 10
  },

  description:
    "Hit putts with eyes closing immediately post-impact to train tactile + auditory feedback, not visual correction."
},

// ----------------------------
// Small Cup Insert (Reduced Capture Width) — L3
// ----------------------------
{
  id: "putt-small-hole-l3",
  name: "Reduced Cup Capture — L3",
  category: "putting",
  level: 3,
  duration: 20,
  tags: ["pressure", "precision", "short"],

  rules: {
    distance: 6,
    attempts: 24,
    holeReducer: true
  },

  scoring: {
    metric: "makes",
    pass: 16
  },

  description:
    "Use a small hole insert or reducer gate. Builds elite entry precision without mechanical thought."
},

// ----------------------------
// Fatigue + Clutch Test — L3
// ----------------------------
{
  id: "putt-fatigue-challenge-l3",
  name: "Fatigue + Clutch Finish — L3",
  category: "putting",
  level: 3,
  duration: 20,
  tags: ["pressure", "focus", "short"],

  rules: {
    distance: 5,
    attempts: 15,
    preShotMovement: "20 jumping jacks before each rep"
  },

  scoring: {
    metric: "makes",
    pass: 12
  },

  description:
    "Raise heart rate before each putt, then execute a clean stroke under elevated arousal. Simulates late-round pressure."
},

// ----------------------------
// Coin Gate (Micro Start Line) — L2
// ----------------------------
{
  id: "putt-coin-gate-l2",
  name: "Coin Gate Micro Start — L2",
  category: "putting",
  level: 2,
  duration: 15,
  tags: ["start-line", "precision", "indoor"],

  rules: {
    distance: 6,
    gateWidthInches: 0.5,
    attempts: 20
  },

  scoring: {
    metric: "gate_pass",
    pass: 14
  },

  description:
    "Place two coins just wider than the ball 12 inches in front of the start point. Ball must pass cleanly between."
},

// ----------------------------
// Ghost Hole Distance Only — L1
// ----------------------------
{
  id: "putt-ghost-hole-l1",
  name: "Ghost Hole Distance Only — L1",
  category: "putting",
  level: 1,
  duration: 15,
  tags: ["pace", "indoor"],

  rules: {
    distances: [8, 10, 12],
    attemptsPerDistance: 6,
    mustStopWithinFt: 1
  },

  scoring: {
    metric: "inside_zone",
    pass: 12
  },

  description:
    "Put to an invisible target (no cup). Ball must stop within 1 ft past the imaginary hole, reinforcing speed control."
},

// ----------------------------
// Quiet Hands Needle Drill — L3
// ----------------------------
{
  id: "putt-quiet-hands-l3",
  name: "Quiet Hands Needle Drill — L3",
  category: "putting",
  level: 3,
  duration: 20,
  tags: ["feel", "touch", "indoor"],

  rules: {
    distance: 10,
    attempts: 12,
    tempoFocus: true
  },

  scoring: {
    metric: "dispersion",
    toleranceFt: 1,
    pass: 8
  },

  description:
    "Hit long putts focusing on minimal wrist acceleration and consistent tempo. Scored purely on rollout dispersion."
},

// ----------------------------
// Hot Start — L2
// ----------------------------
{
  id: "putt-hot-start-l2",
  name: "Hot Start — L2",
  category: "putting",
  level: 2,
  duration: 10,
  tags: ["pressure", "prep", "confidence"],

  rules: {
    distance: 5,
    attempts: 10
  },

  scoring: {
    metric: "first5",
    pass: 4
  },

  description:
    "Make your first 5 putts of the session. No warm-up strokes before. This simulates walking to the first green."
},

// ----------------------------
// Clutch Finish — L3
// ----------------------------
{
  id: "putt-clutch-finish-l3",
  name: "Clutch Finish — L3",
  category: "putting",
  level: 3,
  duration: 10,
  tags: ["pressure", "mental"],

  rules: {
    distance: 6,
    attempts: 10,
    mustMakeLast: true
  },

  scoring: {
    metric: "finishUnderPressure",
    pass: 1
  },

  description:
    "You must make the last putt to pass the drill, regardless of performance earlier. Trains mental closure."
}
];
