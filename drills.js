// drills.js — SCRATCH ELITE EDITION
// ~75 Drills | Fully structured | All categories preserved
// Level Standards: L1 = Single Digit | L2 = Scratch | L3 = Tour+

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [

    // ================= DISPERSION / ACCURACY =================
    {
      id: "drv_fairway_corridor",
      name: "The Corridor (Fairway %)",
      skills: ["driver_dispersion"],
      duration: 15,
      metricType: "COUNT",
      scoreType: "count",
      sessionUnit: "fairways",
      progression: [
        { level: 1, name: "25y Wide", targetShots: 14, goalThreshold: 9 },
        { level: 2, name: "20y Wide", targetShots: 14, goalThreshold: 10 },
        { level: 3, name: "15y Wide", targetShots: 14, goalThreshold: 11 }
      ],
      description: "Hit 14 drives. Count fairways hit inside corridor."
    },
    {
      id: "drv_pressure_streak",
      name: "Fairway Streak",
      skills: ["driver_dispersion"],
      duration: 10,
      metricType: "COUNT",
      scoreType: "streak",
      progression: [
        { level: 1, targetStreak: 5 },
        { level: 2, targetStreak: 8 },
        { level: 3, targetStreak: 12 }
      ],
      description: "Consecutive fairways. Reset on a miss."
    },
    {
      id: "drv_narrow_gate",
      name: "Narrow Gate @ 250y",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "COUNT",
      scoreType: "count",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 6 },
        { level: 2, targetShots: 10, goalThreshold: 7 }
      ],
      description: "Visual gate between trees/poles. Must fly through."
    },
    {
      id: "drv_random_fairway",
      name: "Random Width Fairway",
      skills: ["driver_dispersion"],
      duration: 12,
      metricType: "RNG_MULTILOG",
      randomizer: {
        count: 8,
        widths: [15, 18, 20, 25] // randomized fairway width
      },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_yards: 10 },
        { level: 2, tolerance_yards: 6 }
      ],
      description: "Simulator gives random widths. Log left/right error."
    },

    // ================= FACE CONTROL =================
    {
      id: "drv_start_line_gate",
      name: "Start Line Gate (3ft)",
      skills: ["driver_face"],
      duration: 10,
      metricType: "COUNT",
      scoreType: "count",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 8 },
        { level: 2, targetShots: 10, goalThreshold: 9 }
      ],
      description: "Alignment sticks 3ft ahead. Ball must launch through gate."
    },
    {
      id: "drv_heel_toe_call",
      name: "Heel/Toe Call-Out",
      skills: ["driver_face"],
      duration: 10,
      metricType: "COUNT",
      scoreType: "count",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 8 }
      ],
      description: "Call heel or toe pre-shot. Only counts if correct."
    },
    {
      id: "drv_gear_effect",
      name: "Gear Effect Shapes",
      skills: ["driver_face"],
      duration: 15,
      metricType: "COUNT",
      scoreType: "count",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 7 },
        { level: 2, targetShots: 10, goalThreshold: 7 }
      ],
      description: "Toe-draws and heel-fades. Must curve back to center line."
    },
    {
      id: "drv_face_match",
      name: "Face Match Test",
      skills: ["driver_face"],
      duration: 12,
      metricType: "NUMERIC",
      scoreType: "numeric_low",
      progression: [
        { level: 1, tolerance_deg: 4 },
        { level: 2, tolerance_deg: 2.5 }
      ],
      description: "Compare intended start direction to measured face angle."
    },

    // ================= SPEED =================
    {
      id: "drv_speed_cruising",
      name: "Cruising Speed Maintenance",
      skills: ["driver_speed"],
      duration: 10,
      metricType: "NUMERIC",
      scoreType: "numeric_high",
      progression: [
        { level: 1 },
        { level: 2 }
      ],
      description: "Log average speed. Must stay inside grid."
    },
    {
      id: "drv_overspeed_max",
      name: "Max Output",
      skills: ["driver_speed"],
      duration: 10,
      metricType: "NUMERIC",
      scoreType: "numeric_high",
      progression: [
        { level: 1 }
      ],
      description: "Max effort. Ignore direction."
    },
    {
      id: "drv_speed_stability",
      name: "Speed Stability Test",
      skills: ["driver_speed"],
      duration: 12,
      metricType: "DISPERSION_CALC",
      scoreType: "sd",
      progression: [
        { level: 1, sd_target: 2.5 },
        { level: 2, sd_target: 1.8 }
      ],
      description: "10 balls. Measure SD of clubhead speed."
    }
  ],


  // ======================================================
  // ======================= IRONS ========================
  // ======================================================
  irons: [

    // ================= DISTANCE CONTROL =================
    {
      id: "iron_carry_sd_test",
      name: "Carry Consistency (SD Test)",
      skills: ["irons_distance"],
      duration: 12,
      metricType: "DISPERSION_CALC",
      scoreType: "sd",
      progression: [
        { level: 1, sd_target_yards: 4 },
        { level: 2, sd_target_yards: 3 },
        { level: 3, sd_target_yards: 2 }
      ],
      description: "Hit 8 reps with same club. Track carry SD."
    },
    {
      id: "iron_ladder_drill",
      name: "The Ladder (+5y)",
      skills: ["irons_distance"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 9, goalThreshold: 6 },
        { level: 2, targetShots: 6, goalThreshold: 5 }
      ],
      description: "Hit 150 → 155 → 160 etc. Must land ±2y."
    },
    {
      id: "iron_rng_matrix",
      name: "RNG Proximity Matrix",
      skills: ["irons_distance"],
      duration: 20,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 120, max: 200, count: 5, shotsPerTarget: 2 },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_yards: 8 },
        { level: 2, tolerance_yards: 5 }
      ],
      description: "5 random numbers; log carry error."
    },
    {
      id: "iron_three_target",
      name: "Three Target Distance Test",
      skills: ["irons_distance"],
      duration: 15,
      metricType: "RNG_MULTILOG",
      randomizer: { targets: [135, 155, 175], shotsPerTarget: 3 },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_yards: 7 },
        { level: 2, tolerance_yards: 4.5 }
      ],
      description: "Rotate between 3 fixed distances."
    },

    // ================= SHAPING =================
    {
      id: "iron_nine_windows",
      name: "9-Window Shaping",
      skills: ["irons_workability"],
      duration: 20,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 9, goalThreshold: 7 },
        { level: 2, targetShots: 9, goalThreshold: 7 }
      ],
      description: "Hit low/mid/high fade/draw/straight."
    },
    {
      id: "iron_trouble_shot",
      name: "Trouble Simulation",
      skills: ["irons_workability"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 7 }
      ],
      description: "Simulate trees. Must curve ball ≥15y."
    },
    {
      id: "iron_shape_random",
      name: "Random Shape Callout",
      skills: ["irons_workability"],
      duration: 12,
      metricType: "RNG_MULTILOG",
      randomizer: {
        count: 8,
        shapes: ["Low Fade", "High Draw", "Hold Fade", "Push Draw"]
      },
      scoreType: "count",
      progression: [
        { level: 1, goalThreshold: 5 },
        { level: 2, goalThreshold: 6 }
      ],
      description: "App gives a random shape; 1 attempt."
    },

    // ================= CONTACT =================
    {
      id: "iron_flush_contact",
      name: "Smash Factor Test",
      skills: ["irons_contact"],
      duration: 10,
      metricType: "NUMERIC",
      scoreType: "numeric_high",
      progression: [
        { level: 1, targetShots: 10 }
      ],
      description: "Record smash factor."
    },
    {
      id: "iron_contact_spot",
      name: "Face Contact Map",
      skills: ["irons_contact"],
      duration: 10,
      metricType: "COUNT",
      scoreType: "count",
      progression: [
        { level: 1, targetShots: 8, goalThreshold: 6 }
      ],
      description: "Use foot spray. Must hit center 6/8."
    },
    {
      id: "iron_low_point",
      name: "Low Point Control",
      skills: ["irons_contact"],
      duration: 12,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 7 }
      ],
      description: "Strike line 1–2 inches ahead of ball."
    }
  ],


  // ======================================================
  // ======================= WEDGES =======================
  // ======================================================
  wedges: [

    // ================= DISTANCE (30–100y) =================
    {
      id: "wdg_clock_system",
      name: "Wedge Clock",
      skills: ["wedges_distance"],
      duration: 15,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 40, max: 90, count: 5, shotsPerTarget: 2 },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_yards: 4 },
        { level: 2, tolerance_yards: 2.5 }
      ],
      description: "Hit random wedge yardages using clock feel."
    },
    {
      id: "wdg_leap_frog",
      name: "Leap Frog",
      skills: ["wedges_distance"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 5, goalThreshold: 3 }
      ],
      description: "Each ball must fly past previous."
    },
    {
      id: "wdg_odd_even",
      name: "Odd/Even Yardages",
      skills: ["wedges_distance"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 20, goalThreshold: 15 }
      ],
      description: "Hit 51y, 53y, 55y etc. Micro-adjustments."
    },
    {
      id: "wdg_rng_pulse",
      name: "Random Pulse Wedges",
      skills: ["wedges_distance"],
      duration: 15,
      metricType: "RNG_MULTILOG",
      randomizer: { min: 35, max: 95, count: 8, shotsPerTarget: 1 },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_yards: 5 },
        { level: 2, tolerance_yards: 3 }
      ],
      description: "Single-rep random yardages."
    },

    // ================= SPIN / FLIGHT =================
    {
      id: "wdg_flight_control",
      name: "Launch Angle Control",
      skills: ["wedges_trajectory"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 7 },
        { level: 2, targetShots: 10, goalThreshold: 8 }
      ],
      description: "Hit below target launch window."
    },
    {
      id: "wdg_spin_test",
      name: "One-Hop Stop",
      skills: ["wedges_spin"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 6 }
      ],
      description: "50y shot must check instantly."
    },
    {
      id: "wdg_spin_window",
      name: "Spin Window Challenge",
      skills: ["wedges_spin"],
      duration: 12,
      metricType: "DISPERSION_CALC",
      progression: [
        { level: 1, sd_target: 800 },
        { level: 2, sd_target: 500 }
      ],
      description: "Track topspin numbers. Reduce spin SD."
    }
  ],


  // ======================================================
  // ==================== SHORT GAME ======================
  // ======================================================
  short_game: [

    // ================= SCORING =================
    {
      id: "sg_par18",
      name: "Par 18",
      skills: ["shortgame_scoring"],
      duration: 30,
      metricType: "CUSTOM",
      scoreType: "score_inverse",
      progression: [
        { level: 1, targetScore: 22 },
        { level: 2, targetScore: 18 },
        { level: 3, targetScore: 16 }
      ],
      description: "9 up-and-down holes. Score 2–4 per hole."
    },
    {
      id: "sg_worst_ball",
      name: "Worst Ball Scramble",
      skills: ["shortgame_pressure"],
      duration: 25,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 3 },
        { level: 2, targetShots: 5 }
      ],
      description: "Play the worst of two balls."
    },
    {
      id: "sg_21_game",
      name: "21 Point Game",
      skills: ["shortgame_scoring"],
      duration: 15,
      metricType: "NUMERIC",
      progression: [
        { level: 1, targetScore: 21 }
      ],
      description: "Holed=5, inside 3ft=1."
    },
    {
      id: "sg_rng_updown",
      name: "Random Lie Generator",
      skills: ["shortgame_pressure"],
      duration: 18,
      metricType: "RNG_MULTILOG",
      randomizer: {
        lies: ["Rough", "Fairway", "Downhill", "Fringe", "Hardpan"],
        count: 5,
      },
      scoreType: "count",
      progression: [
        { level: 1, goalThreshold: 3 },
        { level: 2, goalThreshold: 4 }
      ],
      description: "App gives random lie and distance."
    },

    // ================= TECHNIQUE =================
    {
      id: "sg_landing_spot",
      name: "Landing Spot (Towel)",
      skills: ["shortgame_control"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 20, goalThreshold: 15 },
        { level: 2, targetShots: 20, goalThreshold: 12 }
      ],
      description: "Must land on towel."
    },
    {
      id: "sg_bad_lies",
      name: "Bad Lie Survival",
      skills: ["shortgame_control"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 8 },
        { level: 2, targetShots: 10, goalThreshold: 7 }
      ],
      description: "Worst lies only. Must hit green."
    },
    {
      id: "sg_hop_stop",
      name: "Hop-and-Stop Window",
      skills: ["shortgame_control"],
      duration: 12,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 8, goalThreshold: 5 }
      ],
      description: "Hit a low hop that checks inside circle."
    }
  ],


  // ======================================================
  // ====================== PUTTING =======================
  // ======================================================
  putting: [

    // ================= PRESSURE =================
    {
      id: "putt_phils_circle",
      name: "The Circle (Streak)",
      skills: ["putting_pressure"],
      duration: 15,
      metricType: "COUNT",
      scoreType: "streak",
      progression: [
        { level: 1, targetStreak: 25 },
        { level: 2, targetStreak: 50 },
        { level: 3, targetStreak: 20 }
      ],
      description: "3ft/4ft circle. Restart on miss."
    },
    {
      id: "putt_compass",
      name: "Compass Drill",
      skills: ["putting_read"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 12, goalThreshold: 10 },
        { level: 2, targetShots: 12, goalThreshold: 9 }
      ],
      description: "N/S/E/W breaking putts."
    },
    {
      id: "putt_matchplay",
      name: "Putting Matchplay (vs Par)",
      skills: ["putting_pressure"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 6, goalThreshold: 4 }
      ],
      description: "6 random lengths. Must 2-putt or better."
    },

    // ================= SPEED =================
    {
      id: "putt_lag_ladder",
      name: "Lag Ladder (30–50ft)",
      skills: ["putting_speed"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 9, goalThreshold: 7 },
        { level: 2, targetShots: 9, goalThreshold: 7 }
      ],
      description: "Stop inside safety zone."
    },
    {
      id: "putt_random_speed",
      name: "Random Speed Control",
      skills: ["putting_speed"],
      duration: 15,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 8 }
      ],
      description: "Random targets. Must finish <2ft past hole."
    },
    {
      id: "putt_rng_stimpmaster",
      name: "RNG Speed Switch",
      skills: ["putting_speed"],
      duration: 12,
      metricType: "RNG_MULTILOG",
      randomizer: {
        count: 8,
        distances: [20, 30, 40, 50]
      },
      scoreType: "smart_log_avg_error",
      progression: [
        { level: 1, tolerance_feet: 3.5 },
        { level: 2, tolerance_feet: 2 }
      ],
      description: "Random long-putt distances; track leave distance."
    },

    // ================= START LINE =================
    {
      id: "putt_tiger_gate",
      name: "Tiger Gate",
      skills: ["putting_startline"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 20, goalThreshold: 18 },
        { level: 2, targetShots: 20, goalThreshold: 19 }
      ],
      description: "Gate just wider than putter."
    },
    {
      id: "putt_ruler",
      name: "Metal Ruler Drill",
      skills: ["putting_startline"],
      duration: 10,
      metricType: "COUNT",
      progression: [
        { level: 1, targetShots: 10, goalThreshold: 9 }
      ],
      description: "Ball must roll full length."
    },
    {
      id: "putt_start_rnd",
      name: "Random Start Line Windows",
      skills: ["putting_startline"],
      duration: 12,
      metricType: "RNG_MULTILOG",
      randomizer:
        { widths: [1, 2, 3], count: 8 },
      scoreType: "count",
      progression: [
        { level: 1, goalThreshold: 5 },
        { level: 2, goalThreshold: 6 }
      ],
      description: "Gate width changes randomly."
    }
  ]
};
