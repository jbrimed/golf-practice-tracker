// drills.js — SCRATCH PLAYER (MAX VOLUME EDITION)
// Features: Explicit Levels, 5x2 Randomizers, SD Tests, Pressure

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [
    // --- FAIRWAY LEVELS (RANGE/NET) ---
    {
      id: "driver_fairway_lvl1",
      name: "Fairway Finder (Lvl 1: 40y)",
      skills: ["driver_dispersion"],
      duration: 15,
      description: "Define a 40-yard wide grid. Hit 10 balls. \n\nGoal: 8/10 in grid. \nScore: Fairways Hit."
    },
    {
      id: "driver_fairway_lvl2",
      name: "Fairway Finder (Lvl 2: 30y)",
      skills: ["driver_dispersion"],
      duration: 15,
      description: "Define a 30-yard wide grid. Hit 10 balls. \n\nGoal: 7/10 in grid. \nScore: Fairways Hit."
    },
    {
      id: "driver_fairway_lvl3",
      name: "Fairway Finder (Lvl 3: 20y)",
      skills: ["driver_dispersion"],
      duration: 20,
      description: "Define a 20-yard wide grid (U.S. Open width). Hit 14 balls simulating a round. \n\nGoal: 10/14 in grid. \nScore: Fairways Hit."
    },

    // --- START LINE GATES ---
    {
      id: "driver_gate_lvl1",
      name: "Start Line Gate (Lvl 1)",
      skills: ["driver_face"],
      duration: 10,
      description: "Gate 3 yards away. Width = 2 feet. \n\nGoal: 8/10 through gate. \nScore: Success / 10."
    },
    {
      id: "driver_gate_lvl2",
      name: "Start Line Gate (Lvl 2)",
      skills: ["driver_face"],
      duration: 10,
      description: "Gate 3 yards away. Width = 1 foot (very tight). \n\nGoal: 7/10 through gate. \nScore: Success / 10."
    },

    // --- SHAPING / FACE CONTROL ---
    {
      id: "driver_fade_bias_check",
      name: "Fade Bias Confirmation",
      skills: ["driver_face"],
      duration: 15,
      description: "Hit 10 stock fades. \n\nCondition: Any ball that starts right or draws is a failure. Must start left, curve right. \nScore: Good Fades / 10."
    },
    {
      id: "driver_heel_toe_awareness",
      name: "Heel/Toe Awareness",
      skills: ["driver_face"],
      duration: 15,
      description: "Intentional strikes. 1. Heel, 2. Toe, 3. Center. Repeat 5 times. \n\nScore: Successful sets / 5."
    },
    {
      id: "driver_high_low_awareness",
      name: "High/Low Face Awareness",
      skills: ["driver_face"],
      duration: 15,
      description: "Intentional strikes. 1. High Face (Tee high), 2. Low Face (Tee low), 3. Center. \n\nScore: Successful sets / 5."
    },

    // --- SPEED TRAINING ---
    {
      id: "driver_speed_lvl1",
      name: "Speed Training (Lvl 1)",
      skills: ["driver_speed"],
      duration: 15,
      description: "Hit 10 balls. Goal: All above 160mph ball speed (or your 90% max). \nScore: Max Ball Speed."
    },
    {
      id: "driver_speed_lvl2",
      name: "Speed Training (Lvl 2)",
      skills: ["driver_speed"],
      duration: 15,
      description: "Hit 10 balls. Goal: All above 165mph ball speed. \nScore: Max Ball Speed."
    }
  ],

  // ======================================================
  // ======================== IRONS =======================
  // ======================================================
  irons: [
    // --- SD TESTS (CALCULATOR) ---
    {
      id: "irons_sd_test_150",
      name: "SD Test: 150 Yards",
      skills: ["irons_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 150y carry. Enter carries below to get Standard Deviation. \n\nScratch Goal: SD < 3.0"
    },
    {
      id: "irons_sd_test_175",
      name: "SD Test: 175 Yards",
      skills: ["irons_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 175y carry. Enter carries below. \n\nScratch Goal: SD < 4.0"
    },
    {
      id: "irons_sd_test_200",
      name: "SD Test: 200 Yards",
      skills: ["irons_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 200y carry. Enter carries below. \n\nScratch Goal: SD < 5.0"
    },

    // --- RANDOMIZER 5x2 ---
    {
      id: "irons_rng_mid_5x2",
      name: "RNG Matrix: Mid Iron (5x2)",
      skills: ["irons_distance"],
      duration: 20,
      randomizer: { min: 140, max: 170, unit: "y" },
      description: "Click 'Roll'. Hit 2 shots to that number. Repeat 5 times (10 shots total). \n\nScratch Goal: All within 4y carry. \nScore: Successful Shots / 10."
    },
    {
      id: "irons_rng_long_5x2",
      name: "RNG Matrix: Long Iron (5x2)",
      skills: ["irons_distance"],
      duration: 20,
      randomizer: { min: 175, max: 210, unit: "y" },
      description: "Click 'Roll'. Hit 2 shots to that number. Repeat 5 times (10 shots total). \n\nScratch Goal: All inside 40ft radius. \nScore: Successful Shots / 10."
    },

    // --- SHAPING LEVELS ---
    {
      id: "irons_shape_lvl1",
      name: "Shaping (Lvl 1: High/Low)",
      skills: ["irons_trajectory"],
      duration: 15,
      description: "Target 160y. Hit 5 High, 5 Low. \n\nGoal: Clear distinction in peak height (>30ft diff). \nScore: Success / 10."
    },
    {
      id: "irons_shape_lvl2",
      name: "Shaping (Lvl 2: 4 Windows)",
      skills: ["irons_trajectory", "irons_startline"],
      duration: 20,
      description: "High-Draw, Low-Fade, High-Fade, Low-Draw. Repeat sequence twice. \n\nScore: Success / 8."
    },

    // --- CONTACT ---
    {
      id: "irons_flush_contact",
      name: "Flush Contact (Smash Factor)",
      skills: ["irons_distance"],
      duration: 15,
      description: "Hit 10 shots. Monitor Smash Factor (1.38+ for irons). \n\nScore: Shots > 1.38 smash / 10."
    }
  ],

  // ======================================================
  // ======================= WEDGES =======================
  // ======================================================
  wedges: [
    // --- SD TESTS ---
    {
      id: "wedges_sd_test_50",
      name: "SD Test: 50 Yards",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 50y carry. \n\nScratch Goal: SD < 2.0"
    },
    {
      id: "wedges_sd_test_75",
      name: "SD Test: 75 Yards",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 75y carry. \n\nScratch Goal: SD < 2.5"
    },
    {
      id: "wedges_sd_test_100",
      name: "SD Test: 100 Yards",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots at exactly 100y carry. \n\nScratch Goal: SD < 3.0"
    },

    // --- RANDOMIZER 5x2 ---
    {
      id: "wedges_rng_finesse_5x2",
      name: "RNG Finesse: 30-70y (5x2)",
      skills: ["wedges_distance"],
      duration: 20,
      randomizer: { min: 30, max: 70, unit: "y" },
      description: "Roll number. Hit 2 shots. Repeat 5 times. \n\nGoal: +/- 2 yards carry. \nScore: Success / 10."
    },
    {
      id: "wedges_rng_full_5x2",
      name: "RNG Scoring: 70-110y (5x2)",
      skills: ["wedges_distance"],
      duration: 20,
      randomizer: { min: 70, max: 110, unit: "y" },
      description: "Roll number. Hit 2 shots. Repeat 5 times. \n\nGoal: +/- 3 yards carry. \nScore: Success / 10."
    },

    // --- BACKYARD LANDING LEVELS ---
    {
      id: "wedges_backyard_lvl1",
      name: "Backyard Landing (Lvl 1: Towel)",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Targets at 7y, 12y, 17y. Land ON towel (12x12 inch). \n\nScore: Hits / 20."
    },
    {
      id: "wedges_backyard_lvl2",
      name: "Backyard Landing (Lvl 2: Scorecard)",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Targets at 7y, 12y, 17y. Land ON scorecard size target. \n\nScore: Hits / 20."
    },
    {
      id: "wedges_backyard_lvl3",
      name: "Backyard Landing (Lvl 3: Coin)",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Targets at 7y, 12y, 17y. Land ON coin (2 inch). \n\nScore: Hits / 20."
    },

    // --- TRAJECTORY ---
    {
      id: "wedges_flight_over_under",
      name: "Trajectory: Over/Under Stick",
      skills: ["wedges_trajectory"],
      duration: 15,
      description: "Stick at 3ft height halfway to net. \n10 Shots Over, 10 Shots Under. \nScore: Success / 20."
    }
  ],

  // ======================================================
  // ===================== SHORT GAME =====================
  // ======================================================
  short_game: [
    // --- PAR 18 LEVELS ---
    {
      id: "short_par18_lvl1",
      name: "Par 18 (Lvl 1: Easy Lies)",
      skills: ["shortgame_scoring"],
      duration: 25,
      description: "9 holes. All balls placed in fairway cut / fringe. \n\nGoal: Score 18 (All up and down). \nScore: Total Score."
    },
    {
      id: "short_par18_lvl2",
      name: "Par 18 (Lvl 2: Rough)",
      skills: ["shortgame_scoring"],
      duration: 25,
      description: "9 holes. All balls dropped in rough. \n\nGoal: Score < 21. \nScore: Total Score."
    },
    {
      id: "short_par18_lvl3",
      name: "Par 18 (Lvl 3: Bad Lies)",
      skills: ["shortgame_scoring"],
      duration: 25,
      description: "9 holes. Divots, deep rough, downhill lies. \n\nGoal: Score < 24. \nScore: Total Score."
    },

    // --- LANDING SPOTS ---
    {
      id: "short_spot_hitting",
      name: "Spot Hitting (Ratio)",
      skills: ["shortgame_distance"],
      duration: 15,
      description: "Pick landing spot at 5y. Hit LW, SW, PW, 9i to land on same spot. Observe run out. \n\nScore: Hits on spot / 20."
    },
    {
      id: "short_trail_hand",
      name: "Trail Hand Only",
      skills: ["shortgame_glide"],
      duration: 10,
      description: "20 chips trail hand only. \nScore: Clean contacts / 20."
    }
  ],

  // ======================================================
  // ====================== PUTTING =======================
  // ======================================================
  putting: [
    // --- GATE DRILLS ---
    {
      id: "putting_gate_lvl1",
      name: "Tiger Gate (Lvl 1: 1-inch)",
      skills: ["putting_startline"],
      duration: 15,
      description: "Gate width = Putter + 1 inch. Distance 6ft. \n\nGoal: 20 clean through. \nScore: Max Streak."
    },
    {
      id: "putting_gate_lvl2",
      name: "Tiger Gate (Lvl 2: 0.5-inch)",
      skills: ["putting_startline"],
      duration: 15,
      description: "Gate width = Putter + 0.5 inch. Distance 6ft. \n\nGoal: 15 clean through. \nScore: Max Streak."
    },
    {
      id: "putting_gate_lvl3",
      name: "Tiger Gate (Lvl 3: Tight)",
      skills: ["putting_startline"],
      duration: 15,
      description: "Gate width = Putter + 2mm (almost touching). Distance 6ft. \n\nGoal: 10 clean through. \nScore: Max Streak."
    },

    // --- SPEED LEVELS ---
    {
      id: "putting_speed_lvl1",
      name: "Speed Control (Lvl 1: 2ft Zone)",
      skills: ["putting_speed"],
      duration: 15,
      description: "Putt from 10ft. Must stop past hole but within 2ft. \nScore: Success / 10."
    },
    {
      id: "putting_speed_lvl2",
      name: "Speed Control (Lvl 2: 1ft Zone)",
      skills: ["putting_speed"],
      duration: 15,
      description: "Putt from 10ft. Must stop past hole but within 1ft (12 inches). \nScore: Success / 10."
    },
    {
      id: "putting_speed_lvl3",
      name: "Speed Control (Lvl 3: Dead Weight)",
      skills: ["putting_speed"],
      duration: 15,
      description: "Putt from 10ft. Must stop past hole but within 6 inches (Lip speed). \nScore: Success / 10."
    },

    // --- COMPASS ---
    {
      id: "putting_compass_345",
      name: "Compass 3-4-5",
      skills: ["putting_scoring"],
      duration: 15,
      description: "3ft, 4ft, 5ft around hole. \nScore: Makes / 12."
    },
    {
      id: "putting_compass_369",
      name: "Compass 3-6-9",
      skills: ["putting_scoring"],
      duration: 20,
      description: "3ft, 6ft, 9ft around hole. \nScore: Makes / 12."
    },

    // --- MAT DRILLS ---
    {
      id: "putting_mat_left_hand_low",
      name: "Mat: One Handed",
      skills: ["putting_startline"],
      duration: 10,
      description: "10 Right hand, 10 Left hand. \nScore: Center strikes / 20."
    },
    {
      id: "putting_mat_ruler",
      name: "Mat: Metal Ruler",
      skills: ["putting_startline"],
      duration: 15,
      description: "Roll ball down 3ft ruler. \nScore: Success / 10."
    }
  ]
};