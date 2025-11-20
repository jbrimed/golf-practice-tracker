// drills.js
// Master drill list for the golf practice tracker

export const DRILLS = [
  // ===== DRIVER =====
  {
    id: "driver_fade_window_l1",
    name: "Driver Fade Window - L1",
    category: "driver",
    skills: ["driver_face", "driver_startline", "driver_pattern"],
    duration: 15,
    description:
      "Hit drivers into a 40-yard wide corridor. Every ball must finish right of center. Score points for balls finishing in the corridor."
  },
  {
    id: "driver_dont_go_left_l1",
    name: "Don’t Go Left - Safety Game",
    category: "driver",
    skills: ["driver_pattern", "driver_dontleft"],
    duration: 10,
    description:
      "Hit 10 drives. +1 point if the ball finishes right or on target, -2 points if it finishes left of the target line."
  },
  {
    id: "driver_speed_bursts",
    name: "Speed Bursts",
    category: "driver",
    skills: ["driver_speed"],
    duration: 10,
    description:
      "Alternate 3 normal-speed drives with 3 max-intent drives. Track ball speed or carry for the max swings."
  },

  // ===== APPROACH / IRONS =====
  {
    id: "approach_3_targets",
    name: "3-Target Distance Ladder",
    category: "approach",
    skills: ["appr_distance", "appr_dispersion"],
    duration: 20,
    description:
      "Pick three yardages within your session range (e.g. 135, 145, 155). Hit 3 balls to each, scoring how many finish within ±5 yards."
  },
  {
    id: "approach_startline_grid",
    name: "Start Line Grid",
    category: "approach",
    skills: ["appr_startline"],
    duration: 15,
    description:
      "Use an intermediate target and net lanes. Hit 15 shots trying to start each ball inside your chosen lane."
  },
  {
    id: "approach_trajectory_mix",
    name: "Trajectory Mix",
    category: "approach",
    skills: ["appr_trajectory"],
    duration: 15,
    description:
      "At a single yardage, alternate: low flight, stock, higher flight. 3 balls per trajectory, focus on hitting your intended window."
  },

  // ===== WEDGES =====
  {
    id: "wedges_clock_system",
    name: "Clock System Calibration",
    category: "wedges",
    skills: ["wed_distance"],
    duration: 20,
    description:
      "Pick one wedge and hit 10 balls each with half, three-quarter, and full swings. Note average carry for each length."
  },
  {
    id: "wedges_window_game",
    name: "Wedge Window Game",
    category: "wedges",
    skills: ["wed_trajectory", "wed_distance"],
    duration: 15,
    description:
      "Pick a 60–90 yard shot. Hit 10 balls trying to keep launch and peak height consistent while landing within ±5 yards."
  },
  {
    id: "wedges_pressure_line",
    name: "Pressure Wedge Line",
    category: "wedges",
    skills: ["wed_pressure"],
    duration: 15,
    description:
      "Choose a single wedge distance. Hit balls one at a time. Any shot outside your distance window loses a point, inside gains a point."
  },

  // ===== SHORT GAME =====
  {
    id: "sg_random_lies",
    name: "Random Lies One-Ball",
    category: "shortgame",
    skills: ["sg_landing", "sg_random"],
    duration: 15,
    description:
      "Drop a ball in a new lie each time (rough, fairway, tight). One ball per spot, focusing on clean contact and landing spot."
  },
  {
    id: "sg_landing_ladder",
    name: "Landing Spot Ladder",
    category: "shortgame",
    skills: ["sg_landing"],
    duration: 20,
    description:
      "Mark three landing spots between you and the hole. Hit 3–4 chips to each spot, scoring success if you land within ~2 feet."
  },
  {
    id: "sg_updown_race",
    name: "Up & Down Race",
    category: "shortgame",
    skills: ["sg_updown", "sg_random"],
    duration: 15,
    description:
      "Play 9 random chip-and-putt holes. Track how many times you get up-and-down (2 strokes or less)."
  },

  // ===== PUTTING =====
  {
    id: "putt_short_line",
    name: "Short Line Control",
    category: "putting",
    skills: ["put_short", "put_start"],
    duration: 10,
    description:
      "From 4–6 feet on a straight putt, hit 20 balls focusing on starting the ball on line. Track makes out of 20."
  },
  {
    id: "putt_lag_circle",
    name: "Lag Circle Drill",
    category: "putting",
    skills: ["put_lag", "put_pace"],
    duration: 15,
    description:
      "From 20–40 feet, roll putts trying to finish inside a 3-foot circle around the hole. Score your percentage inside the circle."
  },
  {
    id: "putt_indoor_mat_game",
    name: "Indoor Mat Challenge",
    category: "putting",
    skills: ["put_indoor", "put_pace"],
    duration: 15,
    description:
      "On your indoor mat, pick a target distance and try to stop the ball within 1 foot past the target. Track makes out of 20."
  }
];
