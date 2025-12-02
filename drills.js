// drills.js — SCRATCH PLAYER (SMART EDITION)
// Features: Auto-SD Calc Config, Randomizers, and Level-Based Scoring

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [
    // --- HOME / NET (Launch Monitor) ---
    {
      id: "driver_lm_carry_consistency",
      name: "LM Carry Consistency",
      skills: ["driver_speed", "driver_dispersion"],
      duration: 15,
      // NEW: Special metric type that App.js will recognize to show 5 inputs
      metricType: "DISPERSION_CALC", 
      description: "Hit 5 drives. Enter the CARRY distance for each. The app will calculate your consistency (Standard Deviation). \n\nScratch Goal: SD < 6 yards."
    },
    {
      id: "driver_lm_shape_call",
      name: "LM Shape Call (Spin Axis)",
      skills: ["driver_face"],
      duration: 20,
      description: "Call the shape (Draw/Fade). Hit into net. Check Spin Axis on LM. \n\nScratch Goal: Axis matches call but stays under 500rpm. \nScore: Success / 10."
    },
    {
      id: "driver_speed_training_lm",
      name: "LM Speed Training",
      skills: ["driver_speed"],
      duration: 15,
      description: "Hit 10 balls. \n\nLevel 1: Avg Ball Speed > 160mph\nLevel 2: Avg Ball Speed > 165mph\nScratch: Avg Ball Speed > 170mph. \nScore: Max Ball Speed."
    },

    // --- RANGE ---
    {
      id: "driver_fairway_levels",
      name: "Fairway Levels Game",
      skills: ["driver_dispersion"],
      duration: 20,
      description: "Define your fairway width using flags/markers. Hit 14 drives. \n\nLevel 1: 40 Yards Wide (Standard)\nLevel 2: 30 Yards Wide (Tight)\nLevel 3: 20 Yards Wide (U.S. Open)\n\nScore: Fairways Hit / 14."
    }
  ],

  // ======================================================
  // ======================== IRONS =======================
  // ======================================================
  irons: [
    // --- HOME / NET (Launch Monitor) ---
    {
      id: "irons_lm_random_carry",
      name: "RNG Carry (150-175)",
      skills: ["irons_distance"],
      duration: 25,
      // NEW: Randomizer configuration
      randomizer: { min: 150, max: 175, unit: "y" },
      description: "Click 'Roll Target'. Hit to that exact CARRY number. \n\nLevel 1: +/- 4 yards\nScratch: +/- 2 yards. \nScore: Success / 10."
    },
    {
      id: "irons_stock_yardage_combine",
      name: "Stock Yardage Test (SD)",
      skills: ["irons_distance"],
      duration: 20,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots with your 8-iron (or club of choice). Enter carry distances. \n\nScratch Goal: SD < 3 yards. \nPass/Fail calculated below."
    },
    {
      id: "irons_lm_flight_control",
      name: "LM Flight Windows",
      skills: ["irons_trajectory"],
      duration: 15,
      description: "Hit 7-iron. Target Peak Heights: \n1. Low (<80ft) \n2. Stock (90-100ft) \n3. High (>110ft). \nScore: Successful Sets / 5."
    },

    // --- RANGE ---
    {
      id: "irons_shape_shifter_range",
      name: "Shape Shifter (Range)",
      skills: ["irons_startline", "irons_trajectory"],
      duration: 20,
      description: "Hit High-Draw, Low-Fade, High-Fade, Low-Draw. \n\nScratch Goal: Start line must be correct for the shape. \nScore: Successful shots / 10."
    }
  ],

  // ======================================================
  // ======================= WEDGES =======================
  // ======================================================
  wedges: [
    // --- HOME / NET (Launch Monitor) ---
    {
      id: "wedges_lm_ladder",
      name: "LM Carry Ladder (30-90y)",
      skills: ["wedges_distance"],
      duration: 20,
      description: "Hit 30y, 40y, 50y... 90y. \n\nScratch Goal: +/- 2 yards carry. Miss? Restart at 30. \nScore: Highest Yardage Reached."
    },
    {
      id: "wedges_lm_random_finesse",
      name: "RNG Finesse (30-80y)",
      skills: ["wedges_distance"],
      duration: 20,
      randomizer: { min: 30, max: 80, unit: "y" },
      description: "Click 'Roll Target'. Hit exact yardage. \n\nScratch Goal: +/- 1.5 yards. \nScore: Success / 10."
    },
    {
      id: "wedges_lm_spin_maintenance",
      name: "Spin Maintenance Check",
      skills: ["wedges_strike"],
      duration: 15,
      description: "Hit 50y shot. Check spin. Wet ball/face, hit again. \nGoal: Learn moisture spin loss. \nScore: Spin loss (RPM)."
    },

    // --- BACKYARD (20y Space) ---
    {
      id: "wedges_backyard_landing_spot",
      name: "Backyard Landing (Coins)",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Coins at 7y, 12y, 17y. Land ON target. \n\nLevel 1: Hit towel (12 inch)\nScratch: Hit Coin (2 inch). \nScore: Hits / 20."
    },
    {
      id: "wedges_backyard_flight",
      name: "Backyard Trajectory (High/Low)",
      skills: ["wedges_trajectory"],
      duration: 15,
      description: "Target: 15 yards away. \nShot A: LW (High soft). \nShot B: PW (Low runner). \nBoth must stop at same total distance. \nScore: Successful pairs / 10."
    }
  ],

  // ======================================================
  // ===================== SHORT GAME =====================
  // ======================================================
  short_game: [
    {
      id: "short_backyard_ratio",
      name: "Rule of 12 (Backyard)",
      skills: ["shortgame_glide", "shortgame_trajectory"],
      duration: 15,
      description: "Target at 12y. Hit with LW (High), SW (Med), PW (Low). \nObserve roll-out changes. \nScore: Closest Proximity (ft)."
    },
    {
      id: "short_backyard_bad_lie",
      name: "Backyard Bad Lie",
      skills: ["shortgame_strike"],
      duration: 10,
      description: "Hit off bare dirt or deep grass. \nScratch Goal: Clean contact only. \nScore: Clean strikes / 10."
    },
    {
      id: "short_par_18_scratch",
      name: "Par 18 (Course)",
      skills: ["shortgame_scoring"],
      duration: 30,
      description: "9 Holes around green. Easy/Med/Hard lies. \n\nScratch Goal: Score 18 or lower. \nScore: Total Score."
    }
  ],

  // ======================================================
  // ====================== PUTTING =======================
  // ======================================================
  putting: [
    {
      id: "putting_mat_gate_precision",
      name: "Tiger Gate (Strict 6ft)",
      skills: ["putting_startline", "putting_strike"],
      duration: 15,
      description: "Gate width = Putter Head + 2mm. Place at 6ft. \n\nScratch Goal: 20 in a row clean. \nScore: Max Streak."
    },
    {
      id: "putting_mat_perfect_speed",
      name: "Speed Control (Stop Zones)",
      skills: ["putting_speed"],
      duration: 15,
      description: "Mark zones at 10ft, 11ft, 12ft. \nRandomly call zone -> Stop ball in zone. \nScore: Success / 20."
    },
    {
      id: "putting_course_compass",
      name: "Compass Drill (Course)",
      skills: ["putting_scoring"],
      duration: 20,
      description: "3ft, 6ft, 9ft from N, S, E, W. \n\nScratch Goal: Make all 3s/6s. Make 50% 9s. \nScore: Total Makes / 12."
    },
    {
      id: "putting_course_lag_pressure",
      name: "70ft Lag (No 3-Putts)",
      skills: ["putting_speed"],
      duration: 15,
      description: "Hit 10 putts from 60ft+. \n\nScratch Goal: All 10 must be 2-putts. \nScore: 2-Putts / 10."
    }
  ]
};