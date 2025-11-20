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
      "Hit drivers into roughly a 40-yard wide corridor on your simulator/launch monitor. Every ball must finish right of center. Score +1 for each ball that finishes in the corridor and right of center; 0 for safe but outside corridor; -2 if it finishes left."
  },
  {
    id: "driver_fade_window_l2",
    name: "Driver Fade Window - L2 (Tighter)",
    category: "driver",
    skills: ["driver_face", "driver_startline", "driver_pattern", "driver_dispersion"],
    duration: 15,
    description:
      "Narrow the corridor to ~30 yards. Play 15–20 balls trying to start slightly left and finish right. Track how many finish inside the corridor; goal is to beat your previous best."
  },
  {
    id: "driver_dont_go_left_l1",
    name: "Don’t Go Left - Safety Game",
    category: "driver",
    skills: ["driver_pattern", "driver_dontleft"],
    duration: 10,
    description:
      "Hit 10–20 drives. +1 point if the ball finishes right or on target, -2 points if it finishes left of the target line. Track total score and repeat sets, trying to beat your best."
  },
  {
    id: "driver_speed_bursts",
    name: "Driver Speed Bursts",
    category: "driver",
    skills: ["driver_speed"],
    duration: 10,
    description:
      "Alternate 3 normal-speed drivers with 3 max-intent drivers. Track carry or ball speed on the max swings. Goal is to keep the pattern safe (no left missiles) while pushing peak output."
  },
  {
    id: "driver_pattern_ladder",
    name: "Pattern Ladder (Fade Only)",
    category: "driver",
    skills: ["driver_face", "driver_pattern", "driver_dispersion"],
    duration: 15,
    description:
      "Choose a fairway width and hit 10–15 drivers. +2 if it finishes right half of fairway, +1 if left half but still in, 0 if right rough, -2 if left. Keep a running total and try to beat it next session."
  },

  // ===== APPROACH / IRONS =====
  {
    id: "approach_3_targets",
    name: "3-Target Distance Ladder",
    category: "approach",
    skills: ["appr_distance", "appr_dispersion"],
    duration: 20,
    description:
      "Pick three yardages within your session range (e.g. 135, 145, 155). Hit 3–5 balls to each, scoring how many finish within ±5 yards carry. Rotate through the three targets twice."
  },
  {
    id: "approach_startline_grid",
    name: "Start Line Grid",
    category: "approach",
    skills: ["appr_startline"],
    duration: 15,
    description:
      "Use an intermediate target or net lanes. Hit 15–20 shots trying to start each ball inside your chosen lane (center or slightly right/left depending on club). Score % of balls that start in the window."
  },
  {
    id: "approach_trajectory_mix",
    name: "Trajectory Mix",
    category: "approach",
    skills: ["appr_trajectory"],
    duration: 15,
    description:
      "At a single yardage, alternate: low flight, stock, higher flight. Play 3-ball sets for each trajectory. Judge success on window control rather than outcome only."
  },
  {
    id: "approach_zone_scoring",
    name: "Approach Zone Scoring",
    category: "approach",
    skills: ["appr_distance", "appr_dispersion"],
    duration: 20,
    description:
      "Pick one yardage (e.g. 150). Define an on-target zone: ±7 yards long/short and ±10 yards left/right. Hit 10–15 shots. +2 for on-target, +1 for safe miss, 0 for big miss. Track total score."
  },

  // ===== WEDGES =====
  {
    id: "wedges_clock_system",
    name: "Clock System Calibration",
    category: "wedges",
    skills: ["wed_distance"],
    duration: 20,
    description:
      "Pick one wedge and hit 10 balls each with half, three-quarter, and full swings. Record average carry (from launch monitor or best estimate) for each length to map your system."
  },
  {
    id: "wedges_window_game",
    name: "Wedge Window Game",
    category: "wedges",
    skills: ["wed_trajectory", "wed_distance"],
    duration: 15,
    description:
      "Pick a 60–90 yard shot. Hit 10–15 balls trying to keep launch and peak height consistent while landing within ±5 yards. Note any pattern (short/long/right/left)."
  },
  {
    id: "wedges_pressure_line",
    name: "Pressure Wedge Line",
    category: "wedges",
    skills: ["wed_pressure", "wed_distance"],
    duration: 15,
    description:
      "Choose a single wedge distance (e.g. 75 yards). Hit balls one at a time. Any shot outside your distance window loses a point, inside gains a point. Try to reach +5 before -5."
  },
  {
    id: "wedges_three_number_challenge",
    name: "Three-Number Wedge Challenge",
    category: "wedges",
    skills: ["wed_distance", "wed_pressure"],
    duration: 20,
    description:
      "Pick three wedge numbers (e.g. 60, 80, 100). You must hit one ball to each in sequence; it only counts if it lands within ±5 yards. Track how many full successful cycles you complete in 20 balls."
  },

  // ===== SHORT GAME =====
  {
    id: "sg_random_lies",
    name: "Random Lies One-Ball",
    category: "shortgame",
    skills: ["sg_landing", "sg_random"],
    duration: 15,
    description:
      "Drop a ball in a new lie each time (rough, fairway, tight, downhill, uphill). One ball per spot, focusing on clean contact and landing spot. No second tries from the same place."
  },
  {
    id: "sg_landing_ladder",
    name: "Landing Spot Ladder",
    category: "shortgame",
    skills: ["sg_landing"],
    duration: 20,
    description:
      "Mark three landing spots between you and the hole. Hit 3–4 chips to each spot, scoring success if you land within about 2 feet. Move the spots closer or farther based on success."
  },
  {
    id: "sg_updown_race",
    name: "Up & Down Race",
    category: "shortgame",
    skills: ["sg_updown", "sg_random"],
    duration: 15,
    description:
      "Play 6–9 random chip-and-putt holes around the green. Track how many times you get up-and-down (2 strokes or less). Record your % and try to beat it next time."
  },

  // ===== PUTTING =====
  {
    id: "putt_short_line",
    name: "Short Line Control",
    category: "putting",
    skills: ["put_short", "put_start"],
    duration: 10,
    description:
      "From 4–6 feet on a straight putt, hit 20 balls focusing on starting the ball on line. Track makes out of 20. This is about start direction and routine, not hammering speed."
  },
  {
    id: "putt_lag_circle",
    name: "Lag Circle Drill",
    category: "putting",
    skills: ["put_lag", "put_pace"],
    duration: 15,
    description:
      "From 20–40 feet, roll putts trying to finish inside a 3-foot circle around the hole. Hit 20 putts and track your inside-circle %. Great for pace calibration on new greens."
  },
  {
    id: "putt_indoor_mat_target",
    name: "Indoor Mat Target Game",
    category: "putting",
    skills: ["put_indoor", "put_pace"],
    duration: 15,
    description:
      "On your indoor mat, pick a distance and mark a target zone (e.g. a tee or coin). Try to stop the ball within 1 foot past the target. Roll 20 putts and record how many finish in the zone."
  },
  {
    id: "putt_yardstick",
    name: "Yardstick Start Line",
    category: "putting",
    skills: ["put_indoor", "put_start", "put_short"],
    duration: 10,
    description:
      "Place a yardstick or straight edge on your indoor mat. Hit 15–20 short putts trying to keep the ball rolling along the stick the whole way. Track how many clean rolls you get."
  },
  {
    id: "putt_eyes_closed",
    name: "Eyes Closed Start & Feel",
    category: "putting",
    skills: ["put_indoor", "put_pace", "put_short"],
    duration: 10,
    description:
      "From 4–6 feet on a straight putt (mat or green), set up normally, then close your eyes before the stroke. Focus on contact and face feel. Hit 10–15 putts and then open your eyes after each to see result."
  },
  {
    id: "putt_fatigue_clutch",
    name: "Fatigue Clutch Line",
    category: "putting",
    skills: ["put_short", "put_pressure", "put_indoor"],
    duration: 10,
    description:
      "After full practice, finish with a string of 5–10 short putts (4–6 feet) that you must make in a row before you can leave. If you miss, restart the count. Record the highest streak you achieved."
  }
];
