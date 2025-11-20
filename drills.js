// ==============================
// drills.js — Full File
// ==============================

// Top-level drill registry object.
// Each category contains an array of drill objects.
// Other modules (session.js, app.js) import DRILLS to render UI.
export const DRILLS = {

  // ==============================
  // DRIVER DRILLS
  // ==============================
  driver: [
    {
      id: "drv_fade_window_l1",
      name: "Fade Window – Level 1 (40-yd Fairway)",
      skills: ["start_line", "face_control", "pattern", "anti_left"],
      description:
        "Set a 40-yard fairway. +2 ball finishes in right half, +1 if left half, 0 right rough, -2 if left of corridor. 10–15 balls.",
      duration: 15,
      environment: ["net", "range", "sim"],
      scoring: {
        type: "points",
        notes: "Goal: no balls finish left."
      }
    },

    {
      id: "drv_fade_window_l2",
      name: "Fade Window – Level 2 (30-yd Fairway)",
      skills: ["start_line", "face_control", "pattern", "anti_left"],
      description:
        "Shrink corridor to ~30 yards. Maintain fade while tightening dispersion. 10–15 balls.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: {
        type: "points",
        notes: "Compare trend vs Level 1."
      }
    },

    {
      id: "drv_fade_window_l3",
      name: "Fade Window – Level 3 (Tournament Tight)",
      skills: ["start_line", "face_control", "pattern", "anti_left"],
      description:
        "25-yard corridor, full intent only. +2 fairway, -2 any left finish. 8–10 balls.",
      duration: 10,
      environment: ["range", "sim"],
      scoring: {
        type: "points",
        notes: "High intent, short block."
      }
    },

    {
      id: "drv_dont_go_left_baseline",
      name: "Don’t-Go-Left – Baseline",
      skills: ["pattern", "anti_left"],
      description:
        "10–15 drivers. +1 if finishes on/right of target. -2 if left. Pure pattern enforcement.",
      duration: 10,
      environment: ["net", "range", "sim"],
      scoring: {
        type: "points",
        notes: "Use this when left miss returns."
      }
    },

    {
      id: "drv_dont_go_left_speed",
      name: "Don’t-Go-Left – Speed Overlay",
      skills: ["distance", "pattern", "anti_left"],
      description:
        "Alternate stock + max intent. 12 total balls. Same no-left scoring.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: {
        type: "points",
        notes: "Track peak ball speed also."
      }
    },

    {
      id: "drv_start_gate_basic",
      name: "Start Gate – Basic Left Bias",
      skills: ["start_line"],
      description:
        "Gate just left of target, must pass gate + finish on/right. 15 balls.",
      duration: 10,
      environment: ["net", "range", "sim"],
      scoring: {
        type: "make_rate",
        metric: "start_gate_pct"
      }
    },

    {
      id: "drv_start_gate_advanced",
      name: "Start Gate – Advanced (Gate + Fade Finish)",
      skills: ["start_line", "pattern"],
      description:
        "Tighter gate, must start through gate + finish right of target. 10–12 balls.",
      duration: 10,
      environment: ["range", "sim"],
      scoring: {
        type: "make_rate",
        metric: "perfect_pattern_pct"
      }
    },

    {
      id: "drv_speed_clusters",
      name: "Speed Cluster (3 Stock + 3 Full Send)",
      skills: ["distance", "pattern"],
      description:
        "3 stock + 3 full intent, repeat x3 clusters. Track dispersion + ball speed.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: {
        type: "dual_metric",
        metrics: ["peak_speed", "fairway_pct"]
      }
    },

    {
      id: "drv_max_intent_fairway",
      name: "Max Intent Fairway Challenge",
      skills: ["distance", "anti_left", "pressure"],
      description:
        "10 full send tee shots, +2 fairway, +1 playable right, -2 left.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: {
        type: "points",
        notes: "Pressure style game."
      }
    },

    {
      id: "drv_carry_band",
      name: "Carry Band + Fairway",
      skills: ["distance", "trajectory", "pattern"],
      description:
        "Pick a carry range (e.g., 270–285). Score based on matching band + staying right.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: {
        type: "points"
      }
    },

    {
      id: "drv_virtual9",
      name: "Virtual 9-Hole Driver Round",
      skills: ["pressure", "decision_making", "pattern"],
      description:
        "Imagine 9 tee shots on a course. Score like a real round: playable vs unplayable.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: {
        type: "points"
      }
    },

    {
      id: "drv_commit_block",
      name: "Commitment Block (One Shape Only)",
      skills: ["pattern", "decision_making"],
      description:
        "Hit entire set with same visual + commitment. Track left misses + commitment rating.",
      duration: 20,
      environment: ["net", "range", "sim"],
      scoring: {
        type: "subjective",
        metric: "commitment_score"
      }
    }
  ],

 // ==============================
// IRON DRILLS (FULL EXPANDED LIST)
// ==============================
irons: [

  // ────────────────
  // DISTANCE BANDS
  // ────────────────
  {
    id: "ir_100_band",
    name: "100 Yard Band (±5y)",
    subcategory: "distance",
    skills: ["distance", "control"],
    description: "Hit 10 balls to 100 yards. Must land within ±5y. Track score.",
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_120_band",
    name: "120 Yard Band (±5y)",
    subcategory: "distance",
    skills: ["distance", "control"],
    duration: 15,
    environment: ["range", "sim"],
    description: "Same rules, 120 yards.",
    scoring: { type: "points" }
  },
  {
    id: "ir_140_band",
    name: "140 Yard Band (±6y)",
    subcategory: "distance",
    skills: ["distance", "sequencing"],
    duration: 15,
    environment: ["range", "sim"],
    description: "140 yard target, slightly wider band (+/-6 yards).",
    scoring: { type: "points" }
  },
  {
    id: "ir_160_band",
    name: "160 Yard Band (±6y)",
    subcategory: "distance",
    skills: ["distance"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_180_band",
    name: "180 Yard Band (±7y)",
    subcategory: "distance",
    skills: ["distance", "face_control"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_200_band",
    name: "200 Yard Band (±8y)",
    subcategory: "distance",
    skills: ["distance", "trajectory"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // DISTANCE LADDERS
  // ────────────────
  {
    id: "ir_100_140_ladder",
    name: "100→120→140 Ladder (must advance)",
    subcategory: "distance_progression",
    skills: ["distance", "sequencing"],
    description: "Move upward only when previous hit is within ±5y. Miss resets.",
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "ir_140_200_ladder",
    name: "140→160→180→200 Ladder",
    subcategory: "distance_progression",
    skills: ["distance", "decision_making"],
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "ir_ladder_random_start",
    name: "Random Distance Ladder",
    subcategory: "distance_progression",
    skills: ["distance", "adaptability"],
    duration: 20,
    environment: ["range", "sim"],
    description: "Start at random target each rep. Advance ±5 rule.",
    scoring: { type: "streak" }
  },

  // ────────────────
  // START LINE / WINDOWS
  // ────────────────
  {
    id: "ir_center_lane",
    name: "Center Lane Only",
    subcategory: "start_line",
    skills: ["start_line", "face_control"],
    duration: 10,
    environment: ["net", "range", "sim"],
    scoring: { type: "make_rate" }
  },
  {
    id: "ir_left_right_windows",
    name: "Left→Right→Center Windows",
    subcategory: "start_line",
    skills: ["start_line", "face_control", "awareness"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_micro_gate",
    name: "Micro Start Gate",
    subcategory: "start_line",
    skills: ["start_line", "face_control"],
    duration: 10,
    environment: ["net", "range"],
    scoring: { type: "streak" }
  },

  // ────────────────
  // TRAJECTORY CONTROL
  // ────────────────
  {
    id: "ir_low_mid_high",
    name: "Low → Mid → High Cycle",
    subcategory: "trajectory",
    skills: ["trajectory", "awareness"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  },
  {
    id: "ir_two_window_alt",
    name: "Two Window Alternation (Low/High)",
    subcategory: "trajectory",
    skills: ["trajectory", "sequencing"],
    duration: 10,
    environment: ["range", "sim"]
  },
  {
    id: "ir_low_flat_hold",
    name: "Low Flat Hold Drill",
    subcategory: "trajectory",
    skills: ["trajectory", "face_control"],
    duration: 10,
    environment: ["range", "sim"]
  },

  // ────────────────
  // SHOT SHAPE / CURVATURE
  // ────────────────
  {
    id: "ir_hold_fade_150",
    name: "Hold Fade to 150",
    subcategory: "shape",
    skills: ["face_control", "start_line"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_straight_only",
    name: "Straight Ball Only Challenge",
    subcategory: "shape",
    skills: ["face_control"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "ir_three_shot_cycle",
    name: "Fade → Straight → Draw Cycle",
    subcategory: "shape",
    skills: ["face_control", "pattern"],
    duration: 20,
    environment: ["range", "sim"]
  },

  // ────────────────
  // RANDOMIZED TARGETS
  // ────────────────
  {
    id: "ir_rng_5_targets",
    name: "Random 5-Target Circuit",
    subcategory: "random",
    skills: ["decision_making", "adaptability", "distance"],
    duration: 20,
    environment: ["range", "sim"]
  },
  {
    id: "ir_rng_coin_flip",
    name: "Coin Flip Club Randomizer",
    subcategory: "random",
    skills: ["adaptability"],
    duration: 15,
    environment: ["range", "sim"],
    description: "Flip coin each rep: heads = longer club, tails = shorter."
  },
  {
    id: "ir_rng_wheel",
    name: "Wheel Generator Challenge",
    subcategory: "random",
    skills: ["adaptability", "distance"],
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // PRESSURE / GAME FORMATS
  // ────────────────
  {
    id: "ir_ten_ball_test",
    name: "10-Ball Tournament Test",
    subcategory: "pressure",
    skills: ["pressure", "distance", "start_line"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "ir_clutch_3",
    name: "3-Ball Clutch Finish",
    subcategory: "pressure",
    skills: ["pressure", "sequencing"],
    duration: 10,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "ir_moneyball_last",
    name: "Money Ball Last",
    subcategory: "pressure",
    skills: ["pressure", "face_control"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  }
],
// ==============================
// WEDGE DRILLS (FULL EXPANDED LIST)
// ==============================
wedges: [

  // ────────────────
  // DISTANCE CONTROL – FIXED TARGETS
  // ────────────────
  {
    id: "w_50_band",
    name: "50 Yard Band (±4y)",
    subcategory: "distance",
    skills: ["distance", "strike"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" },
    description: "10 balls. Must land within ±4y to score. Lower flight preferred."
  },
  {
    id: "w_75_band",
    name: "75 Yard Band (±5y)",
    subcategory: "distance",
    skills: ["distance", "sequencing"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_90_band",
    name: "90 Yard Band (±5y)",
    subcategory: "distance",
    skills: ["distance", "face_control"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_105_band",
    name: "105 Yard Band (±6y)",
    subcategory: "distance",
    skills: ["distance"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // DISTANCE LADDERS
  // ────────────────
  {
    id: "w_ladder_50_90",
    name: "50 → 65 → 75 → 90 Ladder",
    subcategory: "distance_progression",
    skills: ["distance", "sequencing"],
    duration: 18,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "w_down_ladder",
    name: "90 → 75 → 60 → 50 Down Ladder",
    subcategory: "distance_progression",
    skills: ["distance", "control"],
    duration: 18,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "w_ladder_randomized",
    name: "Randomized Wedge Ladder",
    subcategory: "distance_progression",
    skills: ["adaptability", "distance"],
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // START LINE + STRIKE
  // ────────────────
  {
    id: "w_start_line_center",
    name: "Center Start Gate – Wedges",
    subcategory: "start_line",
    skills: ["start_line", "strike"],
    duration: 10,
    environment: ["net", "range", "sim"],
    scoring: { type: "make_rate" }
  },
  {
    id: "w_start_line_two_windows",
    name: "Two Start Windows (Narrow)",
    subcategory: "start_line",
    skills: ["start_line", "face_control"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // TRAJECTORY + FLIGHT SHAPE
  // ────────────────
  {
    id: "w_low_mid_high",
    name: "Low → Mid → High Cycle (Same Yardage)",
    subcategory: "trajectory",
    skills: ["trajectory", "awareness"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  },
  {
    id: "w_hold_low",
    name: "Hold Low Launch (One-Hop-Stop)",
    subcategory: "trajectory",
    skills: ["trajectory", "strike"],
    description:
      "Lower dynamic loft + narrow stance. Look for predictable hop then check.",
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  },
  {
    id: "w_flight_window_switch",
    name: "Flight Window Switching",
    subcategory: "trajectory",
    skills: ["trajectory", "sequencing"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // LANDING ZONE CONTROL (NO SPIN)
  // ────────────────
  {
    id: "w_three_zone_targets",
    name: "3 Landing Zones (Short / Middle / Deep)",
    subcategory: "landing_zone",
    skills: ["distance", "landing"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_zone_progression",
    name: "Landing Zone Progression",
    subcategory: "landing_zone",
    skills: ["landing", "sequencing"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "streak" }
  },
  {
    id: "w_pin_seek",
    name: "Pin-Seek Landing Challenge",
    subcategory: "landing_zone",
    skills: ["landing", "pressure"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // RANDOMIZED DECISION MAKING
  // ────────────────
  {
    id: "w_rng_short",
    name: "Random Short Wedges (40–90)",
    subcategory: "random",
    skills: ["decision_making", "distance"],
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_rng_one_ball",
    name: "One-Ball Random Targets",
    subcategory: "random",
    skills: ["adaptability", "distance"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // PRESSURE GAMES
  // ────────────────
  {
    id: "w_pressure_10",
    name: "10-Ball Pressure Test",
    subcategory: "pressure",
    skills: ["pressure", "distance", "start_line"],
    duration: 15,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_clutch_last",
    name: "Clutch Last Shot",
    subcategory: "pressure",
    skills: ["pressure"],
    duration: 10,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "w_matchplay",
    name: "Matchplay vs Par (Short Wedges)",
    subcategory: "pressure",
    skills: ["pressure", "decision_making"],
    duration: 20,
    environment: ["range", "sim"],
    scoring: { type: "points" }
  },

  // ────────────────
  // TECHNICAL FEEL BLOCKS (NON-MECHANICAL)
  // ────────────────
  {
    id: "w_narrow_stance_low",
    name: "Low Flight Narrow Stance Block",
    subcategory: "feel",
    skills: ["trajectory", "strike"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  },
  {
    id: "w_three_tempo_block",
    name: "Three Tempos (Slow / Normal / Fast)",
    subcategory: "feel",
    skills: ["tempo", "strike"],
    duration: 12,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  },
  {
    id: "w_clock_system_refresh",
    name: "Clock System Refresh (9 → 10 → Full)",
    subcategory: "feel",
    skills: ["distance", "sequencing"],
    duration: 18,
    environment: ["range", "sim"],
    scoring: { type: "subjective" }
  }
],
// ==============================
// SHORT GAME DRILLS (FULL EXPANDED LIST)
// ==============================
shortgame: [

  // ────────────────
  // RANDOM LIES (PRIMARY CATEGORY)
  // ────────────────
  {
    id: "sg_one_ball_random",
    name: "One-Ball Random Lies",
    subcategory: "random",
    skills: ["confidence", "landing", "decision_making"],
    description: "Drop ball → hit → move on. No retries.",
    duration: 10,
    environment: ["home", "course"],
    scoring: { type: "subjective" }
  },
  {
    id: "sg_three_lie_cycle",
    name: "3-Lie Cycle (Tight, Fluffy, Bare)",
    subcategory: "random",
    skills: ["adaptability", "landing"],
    duration: 15,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_elevated_lies",
    name: "Elevated Lie Up & Down",
    subcategory: "random",
    skills: ["trajectory", "landing", "confidence"],
    duration: 15,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_hardpan",
    name: "Hardpan Confidence Block",
    subcategory: "random",
    skills: ["landing", "face_angle"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "points" }
  },

  // ────────────────
  // LANDING SPOT CONTROL
  // ────────────────
  {
    id: "sg_three_zone_ladder",
    name: "Landing Zone Ladder (Short → Mid → Long)",
    subcategory: "landing",
    skills: ["landing", "trajectory", "control"],
    duration: 15,
    environment: ["home", "course"],
    scoring: { type: "streak" }
  },
  {
    id: "sg_tight_window",
    name: "Tight Landing Window",
    subcategory: "landing",
    skills: ["landing", "face_control"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_two_window_switch",
    name: "Switch Between Two Landing Spots",
    subcategory: "landing",
    skills: ["landing", "decision_making"],
    duration: 12,
    environment: ["home", "course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_deep_zone",
    name: "Deep Landing Zone Runner",
    subcategory: "landing",
    skills: ["landing", "trajectory"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "subjective" }
  },

  // ────────────────
  // LOW + BOUNCE-FOCUSED SHOTS
  // ────────────────
  {
    id: "sg_low_runner",
    name: "Low Runner (One-Hop Release)",
    subcategory: "trajectory",
    skills: ["trajectory", "landing"],
    duration: 10,
    environment: ["home", "course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_standard_pitch",
    name: "Standard Pitch (Neutral Flight)",
    subcategory: "trajectory",
    skills: ["trajectory", "landing"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_open_face_soft",
    name: "Open Face Soft Landing (Grab)",
    subcategory: "trajectory",
    skills: ["trajectory", "landing"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_low_launch_bounce_check",
    name: "Low Launch Bounce Check",
    subcategory: "trajectory",
    skills: ["trajectory", "face_control", "landing"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "subjective" }
  },

  // ────────────────
  // START LINE / DIRECTIONAL CHIPPING
  // ────────────────
  {
    id: "sg_target_left_center_right",
    name: "Left → Center → Right Targets",
    subcategory: "start_line",
    skills: ["start_line", "landing"],
    duration: 12,
    environment: ["home", "course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_narrow_start_lane",
    name: "Narrow Start Lane",
    subcategory: "start_line",
    skills: ["start_line"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "make_rate" }
  },
  {
    id: "sg_offset_setup",
    name: "Start Direction via Setup (Open vs Square)",
    subcategory: "start_line",
    skills: ["start_line", "decision_making"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "subjective" }
  },

  // ────────────────
  // RANDOM TARGETS / DECISION MAKING
  // ────────────────
  {
    id: "sg_rng_three_targets",
    name: "RNG: 3 Target Circuit",
    subcategory: "random",
    skills: ["decision_making", "landing"],
    duration: 15,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_rng_coin_flip",
    name: "Coin Flip: High vs Low",
    subcategory: "random",
    skills: ["adaptability", "trajectory"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_rng_club_switch",
    name: "Random Club Switch (PW vs 56 vs 60)",
    subcategory: "random",
    skills: ["adaptability", "decision_making"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },

  // ────────────────
  // PRESSURE GAMES
  // ────────────────
  {
    id: "sg_up_and_down_test",
    name: "Up & Down 9-Hole Test",
    subcategory: "pressure",
    skills: ["pressure", "decision_making"],
    duration: 25,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "sg_clutch_3",
    name: "Clutch 3 Finish",
    subcategory: "pressure",
    skills: ["pressure"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "streak" }
  },
  {
    id: "sg_moneyball",
    name: "Money Ball Last",
    subcategory: "pressure",
    skills: ["pressure", "confidence"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },

  // ────────────────
  // SIMPLE CONFIDENCE BLOCKS (NO TECHNIQUE THOUGHTS)
  // ────────────────
  {
    id: "sg_soft_hands_block",
    name: "Soft Hands Confidence Block",
    subcategory: "feel",
    skills: ["confidence", "landing"],
    duration: 12,
    environment: ["home", "course"],
    scoring: { type: "subjective" }
  },
  {
    id: "sg_glide_only",
    name: "Glide Only (No Dig)",
    subcategory: "feel",
    skills: ["confidence", "landing"],
    duration: 10,
    environment: ["home", "course"],
    scoring: { type: "subjective" }
  },
  {
    id: "sg_narrow_feet_block",
    name: "Narrow Feet, Neutral Release",
    subcategory: "feel",
    skills: ["confidence", "strike"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "subjective" }
  }
],
// ==============================
// PUTTING DRILLS (FULL EXPANDED LIST)
// ==============================
putting: [

  // ────────────────
  // START LINE (INDOOR)
  // ────────────────
  {
    id: "p_startline_gate",
    name: "Start Line Gate (Tees / Coins)",
    subcategory: "start_line",
    skills: ["start_line", "face_control"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "streak" }
  },
  {
    id: "p_startline_string",
    name: "String Line Start Path",
    subcategory: "start_line",
    skills: ["start_line"],
    duration: 12,
    environment: ["home"],
    scoring: { type: "points" }
  },
  {
    id: "p_small_cup",
    name: "Small Cup Insert Accuracy",
    subcategory: "start_line",
    skills: ["start_line", "precision"],
    duration: 12,
    environment: ["home", "course"],
    scoring: { type: "make_rate" }
  },
  {
    id: "p_eyes_closed_start",
    name: "Eyes Closed Start Line (Open → Closed → Open)",
    subcategory: "start_line",
    skills: ["start_line", "feel"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_one_hand_start",
    name: "One-Hand Start Line Control",
    subcategory: "start_line",
    skills: ["face_control"],
    duration: 8,
    environment: ["home"],
    scoring: { type: "subjective" }
  },

  // ────────────────
  // PACE CONTROL (INDOOR)
  // ────────────────
  {
    id: "p_lag_endline",
    name: "Lag to the End Line",
    subcategory: "pace",
    skills: ["pace"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "dispersion" }
  },
  {
    id: "p_lag_zones",
    name: "3 Distance Zones (Short-Mid-Long)",
    subcategory: "pace",
    skills: ["pace", "decision_making"],
    duration: 12,
    environment: ["home"],
    scoring: { type: "points" }
  },
  {
    id: "p_speed_ladder_forward_backward",
    name: "Speed Ladder (Up & Down)",
    subcategory: "pace",
    skills: ["pace", "adaptability"],
    duration: 12,
    environment: ["home"],
    scoring: { type: "streak" }
  },
  {
    id: "p_speed_randomizer",
    name: "Random Speed Generator (Use Dice/App)",
    subcategory: "pace",
    skills: ["pace", "decision_making"],
    duration: 12,
    environment: ["home"],
    scoring: { type: "points" }
  },

  // ────────────────
  // PRESSURE & GAMES (INDOOR)
  // ────────────────
  {
    id: "p_10_in_10",
    name: "10 in 10 Minutes (4–6 ft)",
    subcategory: "pressure",
    skills: ["pressure", "start_line"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "make_rate" }
  },
  {
    id: "p_clutch_finish",
    name: "Clutch Finish (Last Putt Worth Double)",
    subcategory: "pressure",
    skills: ["pressure"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "points" }
  },
  {
    id: "p_progression_ladder",
    name: "Make to Advance / Miss Goes Back",
    subcategory: "pressure",
    skills: ["pressure", "start_line"],
    duration: 15,
    environment: ["home"],
    scoring: { type: "levels" }
  },
  {
    id: "p_sprint_then_putt",
    name: "Raise Heart Rate → Focus Putts",
    subcategory: "pressure",
    skills: ["focus", "pressure"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "points" }
  },
  {
    id: "p_moneyball",
    name: "Money Ball Last (5 Regular + 1 Money)",
    subcategory: "pressure",
    skills: ["pressure"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "points" }
  },

  // ────────────────
  // STRAIGHT MAT SKILL BUILDING
  // ────────────────
  {
    id: "p_centerline_hold",
    name: "Hold Center Line Entire Roll",
    subcategory: "straight_mat",
    skills: ["start_line", "roll_quality"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "streak" }
  },
  {
    id: "p_roll_quality",
    name: "Roll Quality Check (Mark Ball)",
    subcategory: "straight_mat",
    skills: ["roll_quality", "face_control"],
    duration: 8,
    environment: ["home"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_gate_at_ball",
    name: "Gate at Impact",
    subcategory: "straight_mat",
    skills: ["start_line"],
    duration: 10,
    environment: ["home"],
    scoring: { type: "make_rate" }
  },
  {
    id: "p_gate_at_hole",
    name: "Gate at Hole (Entry Line)",
    subcategory: "straight_mat",
    skills: ["start_line", "roll_quality"],
    duration: 12,
    environment: ["home"],
    scoring: { type: "points" }
  },

  // ────────────────
  // REALISTIC SIM (ON-COURSE / SIM)
  // ────────────────
  {
    id: "p_lag_circle",
    name: "Lag Circle (3 ft Circle from 25–50 ft)",
    subcategory: "course",
    skills: ["pace"],
    duration: 12,
    environment: ["course", "sim"],
    scoring: { type: "dispersion" }
  },
  {
    id: "p_unreadable_green",
    name: "Commit-No-Read Speed Focus",
    subcategory: "course",
    skills: ["pace", "confidence"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_spike_marks",
    name: "Bumpy Surface Roll Control",
    subcategory: "course",
    skills: ["adaptability", "roll_quality"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "points" }
  },
  {
    id: "p_three_read_variants",
    name: "Same Putt, 3 Reads, Then Choose",
    subcategory: "course",
    skills: ["decision_making", "start_line"],
    duration: 12,
    environment: ["course"],
    scoring: { type: "points" }
  },

  // ────────────────
  // CONFIDENCE / FEEL / NO TECHNIQUE
  // ────────────────
  {
    id: "p_meditation_putts",
    name: "Quiet Mind 5-Minute Block",
    subcategory: "feel",
    skills: ["confidence", "focus"],
    duration: 5,
    environment: ["home"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_feel_only",
    name: "Eyes Closed Feel Putting",
    subcategory: "feel",
    skills: ["feel", "pace"],
    duration: 8,
    environment: ["home"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_alignment_free",
    name: "No Line / No Clutter",
    subcategory: "feel",
    skills: ["feel"],
    duration: 8,
    environment: ["course"],
    scoring: { type: "subjective" }
  },
  {
    id: "p_fast_greens_focus",
    name: "Fast Green Downhill Touch",
    subcategory: "feel",
    skills: ["pace", "feel"],
    duration: 10,
    environment: ["course"],
    scoring: { type: "points" }
  },

  // ────────────────
  // PERCEPTION / START-DIRECTION BLENDING
  // ────────────────
  {
    id: "p_read_vs_start",
    name: "Pick Line → Verify Start",
    subcategory: "perception",
    skills: ["start_line", "decision_making"],
    duration: 12,
    environment: ["course", "sim"],
    scoring: { type: "points" }
  },
  {
    id: "p_gate_plus_lag_combo",
    name: "Gate + Lag Hybrid",
    subcategory: "perception",
    skills: ["start_line", "pace"],
    duration: 15,
    environment: ["home", "course"],
    scoring: { type: "points" }
  }
],

};
