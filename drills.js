// drills.js — SCRATCH PLAYER (REFINED SMART EDITION)
// Features: Relaxed Driver Goals, Net-Friendly Drills, Smart Logging Config

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [

    // --- DISPERSION LEVELS (Widened for realism) ---
    {
      id: "driver_dispersion_lvl1",
      name: "Driver Dispersion (Lvl 1: ±20y)",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Hit 10 drives. Ball finish must be within ±20 yards of center line. Goal: 8/10.",
      scoreType: "count",
      targetValues: { successThreshold: 8, shots: 10, tolerance_yards: 20 },
      difficultyRating: 2,
      expectedProLevel: "single-digit",
      sessionUnit: "shots"
    },
    {
      id: "driver_dispersion_lvl2",
      name: "Driver Dispersion (Lvl 2: ±15y)",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Hit 10 drives. Must be within ±15 yards. Goal: 7/10.",
      scoreType: "count",
      targetValues: { successThreshold: 7, shots: 10, tolerance_yards: 15 },
      difficultyRating: 3,
      expectedProLevel: "scratch",
      sessionUnit: "shots"
    },
    {
      id: "driver_dispersion_lvl3",
      name: "Driver Dispersion (Lvl 3: ±10y)",
      skills: ["driver_dispersion"],
      duration: 15,
      metricType: "PERCENTAGE",
      description: "Hit 14 drives sim. Must finish inside ±10 yards. Goal: 10/14.",
      scoreType: "count",
      targetValues: { successThreshold: 10, shots: 14, tolerance_yards: 10 },
      difficultyRating: 4,
      expectedProLevel: "tour-am",
      sessionUnit: "shots"
    },

    // --- NET TARGET LEVELS (Replaces Gate) ---
    {
      id: "driver_net_target_lvl1",
      name: "Net Target (Lvl 1: Center)",
      skills: ["driver_face"],
      duration: 10,
      metricType: "PERCENTAGE",
      description: "Place a piece of tape/towel on center of net. Hit 10 drives. Goal: 7/10 hit the target object directly.",
      scoreType: "count",
      targetValues: { successThreshold: 7, shots: 10 },
      difficultyRating: 2,
      sessionUnit: "shots"
    },
    {
      id: "driver_net_target_lvl2",
      name: "Net Target (Lvl 2: Start Line)",
      skills: ["driver_face"],
      duration: 12,
      metricType: "PERCENTAGE",
      description: "Place target slightly left of center (for fade start). Hit 10 balls. Goal: 8/10 start on that target line.",
      scoreType: "count",
      targetValues: { successThreshold: 8, shots: 10 },
      difficultyRating: 3,
      sessionUnit: "shots"
    },

    // --- RANDOMIZER SHAPE + WINDOW ---
    {
      id: "driver_rng_window_shape",
      name: "Driver RNG Window (Shape + ±15y)",
      skills: ["driver_face", "driver_dispersion"],
      duration: 15,
      randomizer: { choices: ["Fade", "Straight"] }, // Removed Draw as requested
      metricType: "CUSTOM",
      description: "Roll shape. Hit 2 balls to match shape and stay within ±15y dispersion. Repeat for 5 rolls (10 shots).",
      scoreType: "randomizer_success",
      targetValues: { rolls: 5, shotsPerRoll: 2, tolerance_yards: 15 },
      difficultyRating: 4,
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
      sessionUnit: "shots"
    },

    // --- HEEL / TOE AWARENESS ---
    {
      id: "driver_heel_toe_sets",
      name: "Heel/Toe Awareness Sets",
      skills: ["driver_face"],
      duration: 12,
      metricType: "CUSTOM",
      description: "Sequence: 1-heel, 1-toe, 3-center for 5 sets. Record quality of strike per set.",
      scoreType: "count",
      targetValues: { sets: 5 },
      difficultyRating: 2,
      sessionUnit: "sets"
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
      sessionUnit: "shots"
    },

    // --- RNG MATRIX 5x2 (SMART LOGGING) ---
    // NEW metricType "RNG_MULTILOG" tells App.js to generate 5 targets and inputs for each
    {
      id: "irons_rng_mid_5x2_lvl1",
      name: "RNG Matrix: Mid Iron (Lvl1 ±6y) 5x2",
      skills: ["irons_distance"],
      duration: 20,
      metricType: "RNG_MULTILOG", 
      randomizer: { min: 140, max: 170, unit: "y", count: 5, shotsPerTarget: 2 },
      description: "System generates 5 targets. Hit 2 shots to each. Log actual carries. Goal: ±6y error.",
      scoreType: "smart_log",
      targetValues: { tolerance_yards: 6 },
      difficultyRating: 3,
      sessionUnit: "shots"
    },
    {
      id: "irons_rng_mid_5x2_lvl2",
      name: "RNG Matrix: Mid Iron (Lvl2 ±4y) 5x2",
      skills: ["irons_distance"],
      duration: 20,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 140, max: 170, unit: "y", count: 5, shotsPerTarget: 2 },
      description: "System generates 5 targets. Hit 2 shots to each. Log actual carries. Goal: ±4y error.",
      scoreType: "smart_log",
      targetValues: { tolerance_yards: 4 },
      difficultyRating: 4,
      sessionUnit: "shots"
    },

    // --- FLIGHT CONTROL / SHAPING ---
    {
      id: "irons_shape_lvl1",
      name: "Shaping: High/Low Sets",
      skills: ["irons_trajectory"],
      duration: 15,
      metricType: "CUSTOM",
      description: "Hit sets: 5 high, 5 low. Goal: clear perceived separation.",
      scoreType: "count",
      targetValues: { sets: 5 },
      difficultyRating: 3,
      sessionUnit: "sets"
    },

    // --- CONTACT / SMASH FACTOR TEST ---
    {
      id: "irons_flush_contact",
      name: "Flush Contact (Smash Monitor)",
      skills: ["irons_distance"],
      duration: 15,
      metricType: "NUMERIC",
      description: "Hit 10 shots. Track smash factor on LM. Score shots > 1.35.",
      scoreType: "numeric",
      targetValues: { smashTarget: 1.35, shots: 10 },
      difficultyRating: 3,
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
      sessionUnit: "shots"
    },

    // --- RNG Finesse (SMART LOGGING) ---
    {
      id: "wedges_rng_finesse_lvl1",
      name: "Wedge RNG Finesse (Lvl1 ±3y) 5x2",
      skills: ["wedges_distance"],
      duration: 18,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 30, max: 70, unit: "y", count: 5, shotsPerTarget: 2 },
      description: "System generates 5 targets. Hit 2 shots each. Log carries. Goal: ±3y.",
      scoreType: "smart_log",
      targetValues: { tolerance_yards: 3 },
      difficultyRating: 3,
      sessionUnit: "shots"
    },
    {
      id: "wedges_rng_finesse_lvl2",
      name: "Wedge RNG Finesse (Lvl2 ±2y) 5x2",
      skills: ["wedges_distance"],
      duration: 18,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 30, max: 70, unit: "y", count: 5, shotsPerTarget: 2 },
      description: "System generates 5 targets. Hit 2 shots each. Log carries. Goal: ±2y.",
      scoreType: "smart_log",
      targetValues: { tolerance_yards: 2 },
      difficultyRating: 5,
      sessionUnit: "shots"
    },

    // --- BACKYARD TARGET LEVELS ---
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
      sessionUnit: "shots"
    },

    // --- RATIO / LAUNCH REPEATABILITY (LM) ---
    {
      id: "wedges_ratio_repeatability",
      name: "Wedge Launch/Carry Ratio",
      skills: ["wedges_distance"],
      duration: 12,
      metricType: "NUMERIC",
      description: "Hit 8 shots to the same carry. Track carry. Goal: consistent carry within ±1.5y.",
      scoreType: "numeric",
      targetValues: { shots: 8 },
      difficultyRating: 4,
      sessionUnit: "shots"
    }
  ],


  // ======================================================
  // ===================== SHORT GAME =====================
  // ======================================================
  short_game: [
    {
      id: "short_par18_lvl1",
      name: "Par-18 (Lvl1: Easy Lies)",
      skills: ["shortgame_scoring"],
      duration: 25,
      metricType: "CUSTOM",
      description: "9 shots around the green from easy lies. Goal: score ≤ 18.",
      scoreType: "streak",
      targetValues: { holes: 9, goalScore: 18 },
      difficultyRating: 3,
      sessionUnit: "holes"
    },
    {
      id: "short_par18_lvl2",
      name: "Par-18 (Lvl2: Rough)",
      skills: ["shortgame_scoring"],
      duration: 25,
      metricType: "CUSTOM",
      description: "9 shots from rough/held lies. Goal: score < 21.",
      scoreType: "streak",
      targetValues: { holes: 9, goalScore: 21 },
      difficultyRating: 4,
      sessionUnit: "holes"
    },
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
      sessionUnit: "shots"
    }
  ],


  // ======================================================
  // ====================== PUTTING =======================
  // ======================================================
  putting: [
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
      sessionUnit: "shots"
    },
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
      sessionUnit: "reps"
    },
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
      sessionUnit: "shots"
    },
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
      sessionUnit: "shots"
    }
  ]

};