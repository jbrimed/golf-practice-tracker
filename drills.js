// ===============================================
// drills.js — Complete Replacement
// ===============================================

// ---------- DRIVER DRILLS ----------
export const DRIVER_DRILLS = [
  {
    id: "drv_corridor_150",
    skill: ["driver_pattern", "driver_dontleft", "driver_startline"],
    name: "Fairway Corridor (150 yd)",
    description: "Pick a target. Full intent. Ball must finish within 40 yards total width.",
    scoring: "Out of 10: +1 for any ball finishing in corridor. Track % in play.",
    intent: "Full send, stabilize face & path"
  },
  {
    id: "drv_corridor_250",
    skill: ["driver_pattern", "driver_startline"],
    name: "Fairway Corridor (250 yd)",
    description: "Same corridor, but measured at where your drives actually finish.",
    scoring: "Score = % finishing in corridor & miss bias (left vs right).",
    intent: "Game-speed drivers"
  },
  {
    id: "drv_dont_go_left",
    skill: ["driver_dontleft"],
    name: "No Left Allowed",
    description: "Any ball finishing left of target is automatic failure.",
    scoring: "10-ball set: Score = balls finishing right + distance gain.",
    intent: "Manage closure rate w/ speed"
  },
  {
    id: "drv_speed_floor",
    skill: ["driver_speed"],
    name: "Speed Floor Test",
    description: "Track club speed for every shot. Goal is maintaining swing speed at playable accuracy.",
    scoring: "Log avg + peak speed along with dispersion.",
    intent: "High-intent while stable"
  }
];

// ---------- IRON DRILLS ----------
export const IRON_DRILLS = [
  {
    id: "ir_start_10balls",
    skill: ["appr_startline"],
    name: "Start Line 10-Ball Test",
    description: "Pick alignment stick target. Ball must start within a 3-yard window.",
    scoring: "Score = (# starting in window) / 10",
    intent: "Face/path control"
  },
  {
    id: "ir_5yard_ladder",
    skill: ["appr_distance"],
    name: "5-Yard Ladder",
    description: "Pick a baseline distance (~155). Hit increments: +5, +10, +15, -5, -10.",
    scoring: "Point for each ball landing ±3 yds of intended distance.",
    intent: "Precision distance control"
  },
  {
    id: "ir_dispersion_circle",
    skill: ["appr_dispersion"],
    name: "Dispersion Circle",
    description: "Pick 155 target. Track all shots and circle radius needed to contain 80% of shots.",
    scoring: "Record radius value (smaller = improvement).",
    intent: "Tighten pattern"
  }
];

// ---------- WEDGE DRILLS ----------
export const WEDGE_DRILLS = [
  {
    id: "wed_clock_3",
    skill: ["wed_distance"],
    name: "Clock System 3 Distances",
    description: "Three swing lengths (9:00, 10:00, 11:00) w/ one wedge.",
    scoring: "Track avg carry and std dev for each length.",
    intent: "System building"
  },
  {
    id: "wed_low_skip",
    skill: ["wed_trajectory"],
    name: "Low Skip & Stop",
    description: "Face slightly open, shaft neutral. Ball must launch low and stop quickly.",
    scoring: "Score based on stopping distance vs landing point.",
    intent: "Trajectory + spin control"
  },
  {
    id: "wed_scoring_5ball",
    skill: ["wed_pressure"],
    name: "Pressure 5-Ball Challenge",
    description: "Randomize lies & distances. Score each ball relative to hole/outcome.",
    scoring: "Up-and-down % across days.",
    intent: "Translate mechanics > scoring"
  }
];

// ---------- SHORT GAME DRILLS ----------
export const SHORT_GAME_DRILLS = [
  {
    id: "sg_landing_grid",
    skill: ["sg_landing"],
    name: "Landing Spot Grid",
    description: "Draw 3 landing zones. Must land in zone called before swing.",
    scoring: "Score % that land in correct zone.",
    intent: "Precision contact"
  },
  {
    id: "sg_random_lies",
    skill: ["sg_random"],
    name: "Random Lies Circuit",
    description: "Shuffle between tight, rough, uphill, downhill.",
    scoring: "Rating system 1–5 per lie.",
    intent: "Adaptability"
  },
  {
    id: "sg_updown",
    skill: ["sg_updown"],
    name: "Up & Down Test",
    description: "10 random spots around green.",
    scoring: "Score = up-and-down %.",
    intent: "Performance under pressure"
  }
];

// ---------- PUTTING DRILLS ----------
export const PUTTING_DRILLS = [
  {
    id: "put_yardstick",
    skill: ["put_start", "put_indoor"],
    name: "Yardstick Start-Line",
    description: "Putt along ruler/rail. Must roll entire stick clean.",
    scoring: "Score = streak + total makes.",
    intent: "Start line"
  },
  {
    id: "put_short_comp",
    skill: ["put_short"],
    name: "Short Putt Competition",
    description: "4', 6', 8' ladder. Must make each station twice before moving on.",
    scoring: "Record level reached + total makes.",
    intent: "Pressure short putts"
  },
  {
    id: "put_lag_3zones",
    skill: ["put_lag", "put_pace"],
    name: "Lag Zone Challenge",
    description: "Create 3 distance zones (20, 35, 50 ft).",
    scoring: "Score based on leaving within 3-ft circle.",
    intent: "Speed + leave"
  }
];

// ---------- AGGREGATE EXPORT ----------
export const DRILLS = [
  ...DRIVER_DRILLS,
  ...IRON_DRILLS,
  ...WEDGE_DRILLS,
  ...SHORT_GAME_DRILLS,
  ...PUTTING_DRILLS,
];
