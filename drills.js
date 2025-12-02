// drills.js — FULL ADVANCED / SMART "MAX VOLUME EDITION"
// - Keeps your category structure exactly: driver, irons, wedges, short_game, putting
// - Levels present for several drills in each category
// - Ultra-smart scoring metadata included for analytics & progression

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [

    // --- DISPERSION LEVELS (graduated) ---
    {
      id: "driver_dispersion_lvl1",
      name: "Driver Dispersion (Lvl 1: ±15y)",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "PERCENTAGE", // Fixed: Use Percentage for X/Y scoring
      description: "Hit 10 drives. Ball finish must be within ±15 yards of center line. Goal: 8/10.",
      scoreType: "count",
      targetValues: { successThreshold: 8, shots: 10, tolerance_yards: 15 },
      difficultyRating: 2,
      expectedProLevel: "single-digit",
      sessionUnit: "shots",
      progressionTriggers: { advanceIf: "success >= 8" }
    },
    {
      id: "driver_dispersion_lvl2",
      name: "Driver Dispersion (Lvl 2: ±10y)",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Hit 10 drives. Must be within ±10 yards. Goal: 7/10.",
      scoreType: "count",
      targetValues: { successThreshold: 7, shots: 10, tolerance_yards: 10 },
      difficultyRating: 3,
      expectedProLevel: "scratch",
      sessionUnit: "shots",
      progressionTriggers: { advanceIf: "success >= 7" }
    },
    {
      id: "driver_dispersion_lvl3",
      name: "Driver Dispersion (Lvl 3: ±7y)",
      skills: ["driver_dispersion"],
      duration: 15,
      metricType: "PERCENTAGE",
      description: "Hit 14 drives sim. Must finish inside ±7 yards. Goal: 10/14.",
      scoreType: "count",
      targetValues: { successThreshold: 10, shots: 14, tolerance_yards: 7 },
      difficultyRating: 4,
      expectedProLevel: "tour-am",
      sessionUnit: "shots",
      progressionTriggers: { advanceIf: "success >= 10" }
    },

    // --- START-LINE GATE (levels) ---
    {
      id: "driver_gate_lvl1",
      name: "Start Line Gate (Lvl 1: 2ft)",
      skills: ["driver_face"],
      duration: 10,
      metricType: "PERCENTAGE",
      description: "Gate 3 yards from ball. Width = 2ft. Hit 10 drives through gate. Goal: 8/10.",
      scoreType: "count",
      targetValues: { successThreshold: 8, shots: 10, gateWidth_in: 24 },
      difficultyRating: 2,
      expectedProLevel: "club-level",
      sessionUnit: "shots"
    },
    {
      id: "driver_gate_lvl2",
      name: "Start Line Gate (Lvl 2: 1ft)",
      skills: ["driver_face"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Same as lvl1 but gate width = 1ft. Goal: 7/10.",
      scoreType: "count",
      targetValues: { successThreshold: 7, shots: 10, gateWidth_in: 12 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RANDOMIZER SHAPE + WINDOW (mat/LM) ---
    {
      id: "driver_rng_window_shape",
      name: "Driver RNG Window (Shape + ±12y)",
      skills: ["driver_face", "driver_dispersion"],
      duration: 15,
      randomizer: { choices: ["Fade", "Draw", "Straight"] },
      metricType: "CUSTOM",
      description: "Roll shape. Hit 2 balls to match shape and stay within ±12y dispersion. Repeat for 5 rolls (10 shots).",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 12 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- SD TEST FOR CARRY (LM) ---
    {
      id: "driver_sd_test_5",
      name: "Driver Carry SD (5-shot)",
      skills: ["driver_speed", "driver_dispersion"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 drives with max intentional repeatability. Enter carry for each. App calculates SD. Scratch target: SD < 9y.",
      scoreType: "sd",
      targetValues: { sd_target_yards: 9, shots: 5 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- HEEL / TOE & VERTICAL IMPACT AWARENESS (practice sets) ---
    {
      id: "driver_heel_toe_sets",
      name: "Heel/Toe Awareness Sets",
      skills: ["driver_face"],
      duration: 12,
      metricType: "CUSTOM",
      description: "Sequence: 1-heel, 1-toe, 3-center for 5 sets. Record quality of strike and dispersion per set.",
      scoreType: "count",
      targetValues: { sets: 5 },
      difficultyRating: 2,
      expectedProLevel: "club-level",
      sessionUnit: "sets"
    },

    // --- SPEED LADDER (LM) ---
    {
      id: "driver_speed_ladder",
      name: "Driver Speed Ladder (LM)",
      skills: ["driver_speed"],
      duration: 12,
      metricType: "NUMERIC",
      description: "Cycle normal → fast → max → fast → normal for 10 shots. Record max and average ball speed. Score = max ball speed.",
      scoreType: "numeric",
      targetValues: { recommendBalls: 10 },
      difficultyRating: 3,
      expectedProLevel: "strength-trained",
      sessionUnit: "shots"
    }

  ],


  // ======================================================
  // ======================== IRONS =======================
  // ======================================================
  irons: [

    // --- SD TESTS (explicit distances) ---
    {
      id: "irons_sd_test_150",
      name: "SD Test: 150y (5-shot)",
      skills: ["irons_distance"],
      duration: 12,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots to ~150y. Enter carry numbers. App computes SD. Scratch goal: SD < 3.0 y.",
      scoreType: "sd",
      targetValues: { shots: 5, sd_target_yards: 3 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },
    {
      id: "irons_sd_test_175",
      name: "SD Test: 175y (5-shot)",
      skills: ["irons_distance"],
      duration: 12,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots to ~175y. Enter carries. Scratch goal: SD < 4.0 y.",
      scoreType: "sd",
      targetValues: { shots: 5, sd_target_yards: 4 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RNG MATRIX 5x2 (levels) ---
    {
      id: "irons_rng_mid_5x2_lvl1",
      name: "RNG Matrix: Mid Iron (Lvl1 ±6y) 5x2",
      skills: ["irons_distance"],
      duration: 20,
      randomizer: { min: 140, max: 170, unit: "y" },
      metricType: "NUMERIC",
      description: "Roll distance. Hit 2 shots to that number. Repeat 5 rolls (10 shots). Tolerance ±6y.",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 6 },
      difficultyRating: 3,
      expectedProLevel: "low-handicap",
      sessionUnit: "shots",
      progressionTriggers: { upgradeTo: "irons_rng_mid_5x2_lvl2", upgradeIf: "successRate >= 0.8" }
    },
    {
      id: "irons_rng_mid_5x2_lvl2",
      name: "RNG Matrix: Mid Iron (Lvl2 ±4y) 5x2",
      skills: ["irons_distance"],
      duration: 20,
      randomizer: { min: 140, max: 170, unit: "y" },
      metricType: "NUMERIC",
      description: "Same drill but tighter tolerance ±4y. Scratch-level challenge.",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 4 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RNG COMBO: DISTANCE + STARTLINE (combo test) ---
    {
      id: "irons_rng_combo_distance_start",
      name: "Iron RNG Combo (Distance + Start Line)",
      skills: ["irons_distance", "irons_startline"],
      duration: 20,
      randomizer: { min: 140, max: 180, unit: "y" },
      metricType: "CUSTOM",
      description: "Roll distance. Hit 1 shot per roll (10 rolls). Must meet carry tolerance ±4y AND start-line tolerance ±2y.",
      scoreType: "combo",
      targetValues: { rolls: 10, carryTolerance_y: 4, startlineTolerance_y: 2 },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- TRIPLE WINDOW (carry + start + apexFromLM optional) ---
    {
      id: "irons_triple_window",
      name: "Triple Window: Carry + Start Line",
      skills: ["irons_distance", "irons_startline"],
      duration: 18,
      metricType: "CUSTOM",
      description: "Hit 10 irons. Must meet carry ±3y and start line ±2y. (If LM provides apex, add apex tolerance later.)",
      scoreType: "count",
      targetValues: { shots: 10, carryTolerance_y: 3, startlineTolerance_y: 2 },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- FLIGHT CONTROL / SHAPING (levels) ---
    {
      id: "irons_shape_lvl1",
      name: "Shaping: High/Low Sets (Lvl1)",
      skills: ["irons_trajectory"],
      duration: 15,
      metricType: "CUSTOM",
      description: "Hit sets: 5 high, 5 low. Goal: clear perceived separation. Use LM if available to confirm.",
      scoreType: "count",
      targetValues: { sets: 5 },
      difficultyRating: 3,
      expectedProLevel: "club-level",
      sessionUnit: "sets"
    },

    // --- CONTACT / SMASH FACTOR TEST ---
    {
      id: "irons_flush_contact",
      name: "Flush Contact (Smash Factor Monitor)",
      skills: ["irons_distance"],
      duration: 15,
      metricType: "NUMERIC",
      description: "Hit 10 shots. Track smash factor on LM. Score shots > target (configurable).",
      scoreType: "numeric",
      targetValues: { smashTarget: 1.35, shots: 10 },
      difficultyRating: 3,
      expectedProLevel: "trained",
      sessionUnit: "shots"
    },

    // --- NEW: IRON CENTROID (cluster) ---
    {
      id: "irons_centroid_cluster",
      name: "Iron Centroid Cluster (5-shot)",
      skills: ["irons_distance"],
      duration: 12,
      metricType: "CUSTOM",
      description: "Hit 5 shots. App computes centroid (avg x/y) and cluster radius. Lower radius = better control.",
      scoreType: "cluster",
      targetValues: { shots: 5 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    }

  ],


  // ======================================================
  // ======================= WEDGES =======================
  // ======================================================
  wedges: [

    // --- SD TESTS ---
    {
      id: "wedges_sd_test_50",
      name: "Wedges SD Test: 50y (5-shot)",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots to 50y. Enter carries. Scratch target: SD < 2.0 y.",
      scoreType: "sd",
      targetValues: { shots: 5, sd_target_yards: 2 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },
    {
      id: "wedges_sd_test_75",
      name: "Wedges SD Test: 75y (5-shot)",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "DISPERSION_CALC",
      description: "Hit 5 shots to 75y. Scratch target: SD < 2.5 y.",
      scoreType: "sd",
      targetValues: { shots: 5, sd_target_yards: 2.5 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RNG Finesse (levels) ---
    {
      id: "wedges_rng_finesse_lvl1",
      name: "Wedge RNG Finesse (Lvl1 ±3y) 5x2",
      skills: ["wedges_distance"],
      duration: 18,
      randomizer: { min: 30, max: 70, unit: "y" },
      metricType: "NUMERIC",
      description: "Roll distance. Hit 2 shots. Repeat 5 rolls (10 shots). Tolerance ±3y.",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 3 },
      difficultyRating: 3,
      expectedProLevel: "low-handicap",
      sessionUnit: "shots"
    },
    {
      id: "wedges_rng_finesse_lvl2",
      name: "Wedge RNG Finesse (Lvl2 ±2y) 5x2",
      skills: ["wedges_distance"],
      duration: 18,
      randomizer: { min: 30, max: 70, unit: "y" },
      metricType: "NUMERIC",
      description: "Tighter tolerance ±2y. For scratch-level precision.",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 2 },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- BACKYARD TARGET LEVELS (mat-friendly) ---
    {
      id: "wedges_backyard_lvl1",
      name: "Backyard Landing (Lvl1: Towel)",
      skills: ["wedges_distance"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Targets at short distances. Land on towel (12\"x12\"). 20 reps. Score hits/20.",
      scoreType: "count",
      targetValues: { shots: 20, target: "towel" },
      difficultyRating: 2,
      expectedProLevel: "club-level",
      sessionUnit: "shots"
    },
    {
      id: "wedges_backyard_lvl2",
      name: "Backyard Landing (Lvl2: Scorecard)",
      skills: ["wedges_distance"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Same drill but scorecard-size target. 20 reps. Tighter accuracy.",
      scoreType: "count",
      targetValues: { shots: 20, target: "scorecard" },
      difficultyRating: 3,
      expectedProLevel: "low-handicap",
      sessionUnit: "shots"
    },
    {
      id: "wedges_backyard_lvl3",
      name: "Backyard Landing (Lvl3: Coin)",
      skills: ["wedges_distance"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Coin target (2\" diameter). 20 reps. Elite micro-control challenge.",
      scoreType: "count",
      targetValues: { shots: 20, target: "coin" },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RNG SCORING (70–110) 5x2 ---
    {
      id: "wedges_rng_scoring_5x2",
      name: "Wedge RNG Scoring (70–110 y, 5x2)",
      skills: ["wedges_distance"],
      duration: 20,
      randomizer: { min: 70, max: 110, unit: "y" },
      metricType: "NUMERIC",
      description: "Roll distance. Hit two shots. Repeat 5 rolls. Score success if within tolerance.",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 3 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RATIO / LAUNCH REPEATABILITY (LM) ---
    {
      id: "wedges_ratio_repeatability",
      name: "Wedge Launch/Carry Ratio Repeatability",
      skills: ["wedges_distance"],
      duration: 12,
      metricType: "NUMERIC",
      description: "Hit 8 shots to the same carry. Track carry and launch. Goal: consistent carry within ±1.5y and consistent launch angle.",
      scoreType: "numeric",
      targetValues: { shots: 8 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    }

  ],


  // ======================================================
  // ===================== SHORT GAME =====================
  // ======================================================
  short_game: [

    // --- PAR 18 LEVELS (course-sim but mat-adaptable) ---
    {
      id: "short_par18_lvl1",
      name: "Par-18 (Lvl1: Easy Lies)",
      skills: ["shortgame_scoring"],
      duration: 25,
      metricType: "CUSTOM",
      description: "9 shots around the green from easy lies. Goal: score ≤ 18. Focus on up-and-down percentage.",
      scoreType: "streak",
      targetValues: { holes: 9, goalScore: 18 },
      difficultyRating: 3,
      expectedProLevel: "low-handicap",
      sessionUnit: "holes"
    },
    {
      id: "short_par18_lvl2",
      name: "Par-18 (Lvl2: Rough)",
      skills: ["shortgame_scoring"],
      duration: 25,
      metricType: "CUSTOM",
      description: "9 shots from rough/held lies. Goal: score < 21. Harder scoring conditions.",
      scoreType: "streak",
      targetValues: { holes: 9, goalScore: 21 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "holes"
    },

    // --- SPOT HITTING / MICRO-LANDING (mat) ---
    {
      id: "short_spot_1ft_window",
      name: "Spot Hitting: 1ft Window",
      skills: ["shortgame_distance"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Pick a 1ft landing zone. Hit 20 chips. Score hits/20.",
      scoreType: "count",
      targetValues: { shots: 20, target: "1ft_window" },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- STRIKE CLUSTER SD (face consistency) ---
    {
      id: "short_strike_sd",
      name: "Short Game Strike SD (Face Impact)",
      skills: ["shortgame_strike"],
      duration: 12,
      metricType: "CUSTOM",
      description: "Use face tape or impact tool. Hit 10 chips. App records strike cluster SD (x/y). Lower = better.",
      scoreType: "cluster",
      targetValues: { shots: 10 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- RANDOMIZER: LIE + LANDING (mat-friendly randomized parameters) ---
    {
      id: "short_randomizer_lie_spot",
      name: "Short Game Randomizer (Lie + Spot)",
      skills: ["shortgame_distance", "shortgame_glide"],
      duration: 20,
      randomizer: { choices: ["fringe-5y", "tight-6y", "bare-4y", "buried-6y", "uphill-5y"] },
      metricType: "CUSTOM",
      description: "Roll a lie + landing spot. One ball. Score up-and-down or proximity. 10 rounds.",
      scoreType: "randomizer_success",
      targetValues: { rounds: 10 },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "rounds"
    },

    // --- TRAIL HAND ONLY (technical overload) ---
    {
      id: "short_trail_hand_only",
      name: "Trail Hand Only (Control)",
      skills: ["shortgame_glide"],
      duration: 10,
      metricType: "PERCENTAGE",
      description: "20 chips using only the trail hand. Score clean contact %.",
      scoreType: "count",
      targetValues: { shots: 20 },
      difficultyRating: 3,
      expectedProLevel: "club-level",
      sessionUnit: "shots"
    }

  ],


  // ======================================================
  // ====================== PUTTING =======================
  // ======================================================
  putting: [

    // --- GATE LEVELS (start line emphasis) ---
    {
      id: "putting_gate_lvl1",
      name: "Tiger Gate (Lvl1: +1\" gap)",
      skills: ["putting_startline"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Gate width = putter head + 1 inch. 20 reps from 6ft. Score longest streak.",
      scoreType: "streak",
      targetValues: { shots: 20 },
      difficultyRating: 2,
      expectedProLevel: "club-level",
      sessionUnit: "shots"
    },
    {
      id: "putting_gate_lvl2",
      name: "Tiger Gate (Lvl2: +0.5\" gap)",
      skills: ["putting_startline"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Gate width = +0.5 inch. 20 reps. Tighter face control demand.",
      scoreType: "streak",
      targetValues: { shots: 20 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- SPEED LADDER / MAT (tight) ---
    {
      id: "putting_speed_3ball_ladder",
      name: "3-Ball Speed Ladder (Tight)",
      skills: ["putting_speed"],
      duration: 12,
      metricType: "NUMERIC",
      description: "3 zones 12\" apart. Execute 3-ball ladder (short/med/long) for 3 rounds. Score hits/9.",
      scoreType: "count",
      targetValues: { reps: 3, ballsPerRep: 3 },
      difficultyRating: 3,
      expectedProLevel: "low-handicap",
      sessionUnit: "reps"
    },

    // --- ONE-BALL CLOCK (pressure) ---
    {
      id: "putting_one_ball_clock",
      name: "One-Ball Clock (6 spots)",
      skills: ["putting_startline", "putting_scoring"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Six spots around hole (mat adaptation). One ball each. Score makes/6. Pressure = single attempt only.",
      scoreType: "count",
      targetValues: { shots: 6 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- SPEED VARIANCE / SD (LM or measured) ---
    {
      id: "putting_speed_variance_sd",
      name: "Putting Speed Variance (SD)",
      skills: ["putting_speed"],
      duration: 15,
      metricType: "DISPERSION_CALC",
      description: "Roll 10 putts aimed at a tee at 30ft. Record stopping distances. App computes SD; target SD < 10 inches.",
      scoreType: "sd",
      targetValues: { shots: 10, sd_target_inches: 10 },
      difficultyRating: 5,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- BREAK READ CALIBRATION (perception + result) ---
    {
      id: "putting_break_read_calibration",
      name: "Break Read Calibration",
      skills: ["putting_startline", "putting_break"],
      duration: 15,
      metricType: "CUSTOM",
      description: "Hit 12ft breaking putts from 3 spots. Predict start line before roll; record % correct and result.",
      scoreType: "perception_accuracy",
      targetValues: { shots: 9 },
      difficultyRating: 4,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },

    // --- MAT: ONE-HANDED / RULER STRAIGHT ROLLS (technique) ---
    {
      id: "putting_mat_one_hand_ruler",
      name: "Mat One-Handed / Ruler",
      skills: ["putting_startline"],
      duration: 12,
      metricType: "CUSTOM",
      description: "10 right-hand only, 10 left-hand only rolls down ruler. Score center strike consistency.",
      scoreType: "count",
      targetValues: { shots: 20 },
      difficultyRating: 3,
      expectedProLevel: "club-level",
      sessionUnit: "shots"
    }

  ]

};