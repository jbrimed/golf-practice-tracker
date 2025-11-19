// SKILL DEFINITIONS
export const SKILLS = [
  {
    id: "start_line",
    label: "Start Line & Face",
    description: "Control where the ball starts relative to target via face angle."
  },
  {
    id: "face_contact",
    label: "Face Contact",
    description: "Strike pattern on the face (heel/center/toe)."
  },
  {
    id: "low_point",
    label: "Low Point / Ground",
    description: "Entry into turf/ground, especially with irons and wedges."
  },
  {
    id: "shape_control",
    label: "Shape Control",
    description: "Fade/draw intention and matching the curve you called."
  },
  {
    id: "driver_pattern",
    label: "Driver Patterning",
    description: "Anti-left pattern, launch windows, spin axis stability."
  },
  {
    id: "distance_control",
    label: "Distance Control",
    description: "Carry consistency for wedges and irons."
  },
  {
    id: "short_game",
    label: "Short Game Landing",
    description: "Landing spot control and rollout planning."
  },
  {
    id: "putt_pace",
    label: "Putt Pace",
    description: "Lag putting and die-in speed control."
  },
  {
    id: "putt_start",
    label: "Putt Start Line",
    description: "Start line through a narrow gate."
  }
];

// DRILL DEFINITIONS
// club: driver | long_irons | irons | wedges | short_game | putter
// environment: net | range | sim | green | home

export const DRILLS = [
  // ----- DRIVER -----
  {
    id: "driver_fade_window",
    name: "Driver Fade Window Challenge",
    club: "driver",
    skills: ["start_line", "shape_control", "driver_pattern"],
    environment: ["net", "range", "sim"],
    duration: 15,
    summary: "Start left, finish right, score based on pattern purity.",
    description: "You’re only judged on start direction and finish direction, not distance. Pure fade pattern: start slightly left, finish right of target.",
    scoring: { type: "points" },
    instructions: [
      "Mark 3 lanes on your net/screen (left / center / right).",
      "Hit 15 balls with full intent.",
      "Score each ball: +2 start-left-finish-right, +1 center-fade, 0 right-start, -2 finish-left.",
      "Total your points and log the score."
    ]
  },
  {
    id: "driver_no_left_game",
    name: "Don’t-Go-Left Game",
    club: "driver",
    skills: ["driver_pattern", "start_line"],
    environment: ["net", "range", "sim"],
    duration: 10,
    summary: "Any ball finishing left kills your score.",
    description: "Reinforces an anti-left pattern where the big miss is punished severely.",
    scoring: { type: "points" },
    instructions: [
      "Hit 10 drivers.",
      "Score +1 for any ball finishing right or on target, 0 for right-start fade that stays safe, -3 for any ball finishing left of target corridor.",
      "Try to finish ≥5 points."
    ]
  },
  {
    id: "driver_bunt_fade",
    name: "Low-Launch Bunt Fade Ladder",
    club: "driver",
    skills: ["driver_pattern", "shape_control"],
    environment: ["net", "range", "sim"],
    duration: 15,
    summary: "Super stable, lower-speed fade pattern.",
    description: "Use 70–80% speed to reduce closure and exaggerate a controllable bunt fade pattern.",
    scoring: { type: "percentCorrect" },
    instructions: [
      "Hit 12 balls at ~75% speed.",
      "Goal: start slightly left, finish right or at target, with visibly lower launch than normal.",
      "Count how many matched the intention and compute %."
    ]
  },
  {
    id: "driver_gear_effect_grid",
    name: "Driver Strike Grid Game",
    club: "driver",
    skills: ["face_contact", "driver_pattern"],
    environment: ["net", "range", "sim"],
    duration: 15,
    summary: "Learn what each strike location does to ball flight.",
    description: "Overlay a 3×3 grid on the face with impact tape/spray and intentionally hit different grid cells.",
    scoring: { type: "points" },
    instructions: [
      "Mark a 3×3 grid on your driver face using reference lines.",
      "Call a cell (e.g., heel-mid, center-high) before each of 9 shots.",
      "Score +2 if you hit called cell, +1 if adjacent, 0 otherwise.",
      "Track how strike location changed curvature."
    ]
  },

  // ----- LONG IRONS / IRONS -----
  {
    id: "irons_lane_start",
    name: "Intermediate Target Start-Line Game",
    club: "irons",
    skills: ["start_line"],
    environment: ["net", "range", "sim"],
    duration: 15,
    summary: "Hit through a vertical lane, ignore curve.",
    description: "You only care about the first 1–2m of ball flight through a start-line gate.",
    scoring: { type: "percentCorrect" },
    instructions: [
      "Put a vertical alignment stick / tape strip as your start line.",
      "Hit 20 balls with mixed irons.",
      "Ball must pass through a narrow window (e.g., within a clubhead either side).",
      "Score % of balls that passed through the gate."
    ]
  },
  {
    id: "irons_three_length",
    name: "Three-Length Start Calibration",
    club: "irons",
    skills: ["start_line"],
    environment: ["net", "range", "sim"],
    duration: 15,
    summary: "Compare start line across three swing sizes.",
    description: "See if your start line drifts as you go from half to full swings.",
    scoring: { type: "points" },
    instructions: [
      "Pick one mid-iron.",
      "Hit 5 half swings, 5 rib-high swings, 5 full swings.",
      "For each set, count how many started in your intended window.",
      "Score each set out of 5; compare between sizes."
    ]
  },
  {
    id: "irons_shape_switch",
    name: "Draw-to-Fade Switch Game",
    club: "irons",
    skills: ["shape_control", "start_line"],
    environment: ["range", "sim", "net"],
    duration: 20,
    summary: "Alternate draw and fade on command.",
    description: "One ball draw, next ball fade, same start line commitment.",
    scoring: { type: "points" },
    instructions: [
      "Pick a 7–8 iron.",
      "Hit 12 balls: pattern = draw, fade, draw, fade, ...",
      "Score +2 if shape matches the call and starts in the intended window, +1 if shape is correct but start line off, 0 if shape wrong.",
      "Track total score and note which direction is weaker."
    ]
  },

  // ----- LOW POINT / CONTACT -----
  {
    id: "lowpoint_gate",
    name: "Low Point Gate Drill",
    club: "irons",
    skills: ["low_point"],
    environment: ["range", "net"],
    duration: 15,
    summary: "Ball then divot consistency using a line or towel.",
    description: "Use a chalk line / spray line and track where club first contacts ground relative to ball.",
    scoring: { type: "percentCorrect" },
    instructions: [
      "Draw a line on the mat/ground just ahead of the ball position.",
      "Hit 15 shots with a mid-iron.",
      "Ball must be struck before the line and ground contact must start on or just after the line.",
      "Score % of shots with correct low point."
    ]
  },

  // ----- WEDGES / DISTANCE -----
  {
    id: "wedges_distance_system",
    name: "Wedge Distance System Game",
    club: "wedges",
    skills: ["distance_control", "face_contact"],
    environment: ["range", "sim"],
    duration: 20,
    summary: "Half, 3/4, full wedges with tight carry bands.",
    description: "Define 3 stock motions (half, 3/4, full) and evaluate carry variance.",
    scoring: { type: "accuracyDistance" },
    instructions: [
      "Pick one wedge and 3 stock motions: half, 3/4, full.",
      "Hit 10 balls with each motion at a consistent target.",
      "Record carry distances and compute range (max-min).",
      "Your score is smaller range = better; log range in yards or meters."
    ]
  },
  {
    id: "wedges_exact_number",
    name: "Exact Number Challenge",
    club: "wedges",
    skills: ["distance_control"],
    environment: ["range", "sim"],
    duration: 15,
    summary: "Hit one exact yardage repeatedly.",
    description: "Pick a non-round number (e.g., 62y) and see how tight you can group around it.",
    scoring: { type: "accuracyDistance" },
    instructions: [
      "Pick a specific carry (e.g., 62y).",
      "Hit 10 balls with the same motion.",
      "Measure absolute error from target for each shot.",
      "Average error is your score (lower is better)."
    ]
  },

  // ----- SHORT GAME / CHIPPING -----
  {
    id: "chip_random_lies",
    name: "Random Lie One-Ball Test",
    club: "short_game",
    skills: ["short_game"],
    environment: ["green"],
    duration: 15,
    summary: "Drop, hit, move on. No re-dos.",
    description: "Simulate real golf: one ball, new lie every time, no fixing.",
    scoring: { type: "strokesToTarget" },
    instructions: [
      "Choose a chipping area with at least 3 different lies (tight, rough, downhill/uphill).",
      "Drop a ball, choose a landing spot, hit and then move to a new spot.",
      "Play each ball out to the hole or assign a stroke-based score (e.g., 1 = tap-in, 2 = makeable, 3+ = poor).",
      "Track average strokes or up-and-down % over 10–15 chips."
    ]
  },
  {
    id: "chip_landing_ladder",
    name: "Landing Spot Ladder",
    club: "short_game",
    skills: ["short_game", "distance_control"],
    environment: ["green"],
    duration: 15,
    summary: "Land the ball in progressively farther zones.",
    description: "Three landing zones at increasing distances, hitting a sequence every time.",
    scoring: { type: "points" },
    instructions: [
      "Mark 3 landing spots at increasing distances from you.",
      "Hit in a 3–3–4 pattern (3 to zone 1, 3 to zone 2, 4 to zone 3).",
      "Score +2 if ball lands within 1ft of target zone, +1 within 3ft, 0 otherwise.",
      "Total your score each time you run the ladder."
    ]
  },

  // ----- PUTTING -----
  {
    id: "putt_short_gate",
    name: "Short-Path Gate Test",
    club: "putter",
    skills: ["putt_start"],
    environment: ["green", "home"],
    duration: 10,
    summary: "Start-line gate for short putts.",
    description: "Gate is just wider than the ball, set 1–3 feet in front.",
    scoring: { type: "percentCorrect" },
    instructions: [
      "Set up a gate with tees or books ~1–3ft in front of the ball.",
      "Hit 20 putts.",
      "Count how many pass cleanly through the gate.",
      "Score is % through the gate."
    ]
  },
  {
    id: "lag_putt_ladder",
    name: "Lag Putts Ladder Game",
    club: "putter",
    skills: ["putt_pace"],
    environment: ["green"],
    duration: 20,
    summary: "Control capture speed from multiple distances.",
    description: "Putts must finish inside a 'parking zone' around the hole, ideally dying at the front edge.",
    scoring: { type: "points" },
    instructions: [
      "Set 3 distances (e.g., 20, 30, 40 ft).",
      "Create a 3ft circle around the hole (or rough approximation).",
      "Hit 3 putts from each distance.",
      "Score +2 if ball dies at front edge or finishes within 1ft past, +1 within the circle, 0 outside or short of front edge.",
      "Total score and track which distance is weakest."
    ]
  }
];
