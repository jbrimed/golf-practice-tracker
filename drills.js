// drills.js — unified drill list for Golf Practice Tracker
// FORMAT REQUIRED BY app.js:
// export const DRILLS = { driver: [...], irons: [...], wedges: [...], shortgame: [...], putting: [...] };

export const DRILLS = {

  // ======================================================
  // ======================= DRIVER =======================
  // ======================================================
  driver: [

    {
      id: "driver_fade_window",
      name: "Fade Window Challenge",
      skills: ["driver_start", "driver_face", "driver_dispersion"],
      duration: 20,
      description: "Hit intentional fades. Ball must finish right of center but not overcurve. Track % fairway-width hits."
    },

    {
      id: "driver_no_left_10",
      name: "Don't Go Left — 10 Ball Test",
      skills: ["driver_face", "driver_start", "driver_dispersion"],
      duration: 15,
      description: "Hit 10 balls. Any finishing left of target = fail. Score = balls finishing right or within neutral corridor."
    },

    {
      id: "driver_big_carry_fairway",
      name: "Max Carry + Fairway",
      skills: ["driver_speed", "driver_dispersion"],
      duration: 15,
      description: "Max intent swings. Score = (carry score) + (direction score). Wide first, narrow later."
    },

    {
      id: "driver_40y_corridor",
      name: "40–20 Yard Narrowing Corridor",
      skills: ["driver_dispersion", "driver_start"],
      duration: 15,
      description: "Start with 40-yard width, shrink by 5 yards each successful 3-shot streak. End session when you fail twice."
    },

    {
      id: "driver_tee_height_variability",
      name: "Variable Tee Height Control",
      skills: ["driver_start", "driver_face"],
      duration: 15,
      description: "Alternate three tee heights: low, stock, high. Track start line stability and curve bias."
    },

    {
      id: "driver_hold_fade_low",
      name: "Low Launch Hold Fade",
      skills: ["driver_start", "driver_face", "driver_trajectory"],
      duration: 15,
      description: "Hit low launch fades (<12°). Start slightly left, finish right. Score based on curvature control."
    },

    {
      id: "driver_3_target_rotation",
      name: "3 Targets — Randomized",
      skills: ["driver_start", "driver_dispersion", "driver_decision"],
      duration: 20,
      description: "Pick three targets (left edge, center, right edge). Randomly call targets. Score % accuracy per target."
    },

    {
      id: "driver_speed_ladder",
      name: "Speed Intent Ladder",
      skills: ["driver_speed"],
      duration: 12,
      description: "Cycle normal → fast → max → fast → normal. Track ball speed and dispersion at high intent."
    },

    {
      id: "driver_last_ball_pressure",
      name: "Last Ball Pressure Challenge",
      skills: ["driver_pressure", "driver_dispersion"],
      duration: 10,
      description: "Hit 5 balls. Only the LAST ball counts. Must finish within right-half corridor. Reset if miss."
    },

    {
      id: "driver_face_map_tracking",
      name: "Face Impact Cluster",
      skills: ["driver_face"],
      duration: 12,
      description: "Use impact spray. Score based on cluster tightness + relative heel/toe bias trends."
    },

    {
      id: "driver_miss_pattern_awareness",
      name: "Miss Pattern Mapping",
      skills: ["driver_dispersion"],
      duration: 18,
      description: "10 drives. Log miss direction, curvature, and strike. Goal is consistency of miss—not perfection."
    },

    {
      id: "driver_course_sim",
      name: "Simulated Driving Round (Net or Sim)",
      skills: ["driver_dispersion", "driver_start", "driver_pressure"],
      duration: 25,
      description: "Pretend you're playing a course. Call a target for each hole. Track fairways hit and big left misses."
    }

  ],

  // ======================================================
  // ================ PLACEHOLDERS (TO FILL) ==============
  // ======================================================

    // ======================================================
  // ======================== IRONS =======================
  // ======================================================
  irons: [

    // ─────────── Distance Control ───────────

    {
      id: "irons_distance_3_targets",
      name: "3 Distance Targets (Random)",
      skills: ["irons_distance", "irons_dispersion"],
      duration: 20,
      description: "Pick 3 targets (e.g., 145, 160, 175). Randomly select before each shot. Score accuracy within ±5y."
    },

    {
      id: "irons_ladder_up_down",
      name: "Distance Ladder Up + Down",
      skills: ["irons_distance"],
      duration: 20,
      description: "Increase 10y per shot up to a max distance, then decrease. Must stay within ±5y to continue ladder."
    },

    {
      id: "irons_stock_number_reps",
      name: "Stock Distance Repetition",
      skills: ["irons_distance", "irons_consistency"],
      duration: 15,
      description: "Pick your stock yardage for one iron (e.g., 165). Hit 10 balls, log carry variance."
    },

    {
      id: "irons_spread_vs_focus",
      name: "Spread vs Focus",
      skills: ["irons_distance"],
      duration: 18,
      description: "Hit 5 balls at a wide range (120→170), then 5 at a single target. Compare consistency."
    },


    // ─────────── Dispersion / Targeting ───────────

    {
      id: "irons_30y_window",
      name: "30-Yard Window Challenge",
      skills: ["irons_dispersion", "irons_start"],
      duration: 15,
      description: "Ball must finish inside 30y fairway width. Tighten to 25→20→15 as you pass thresholds."
    },

    {
      id: "irons_left_right_bias",
      name: "Directional Bias Mapping",
      skills: ["irons_dispersion", "irons_start"],
      duration: 15,
      description: "Hit 10 balls and map where shots finish left/right. Goal is predictable bias, not perfection."
    },

    {
      id: "irons_green_hit_pct",
      name: "Sim Green Hit % (By Distance)",
      skills: ["irons_dispersion"],
      duration: 20,
      description: "Create a target circle ±8y depth, ±10y width. Track GIR % at chosen yardage."
    },

    {
      id: "irons_random_target_side",
      name: "Randomized Start-Line Challenge",
      skills: ["irons_start"],
      duration: 15,
      description: "Alternate between left-edge, center, right-edge target lines. Track execution consistency."
    },


    // ─────────── Curvature Control ───────────

    {
      id: "irons_stock_vs_curve",
      name: "Stock vs Intentional Curve",
      skills: ["irons_shape", "irons_start"],
      duration: 20,
      description: "Hit 5 stock → 5 draws → 5 fades. Score based on curve staying <15y offline."
    },

    {
      id: "irons_low_hold_fade",
      name: "Low Launch Hold Fade",
      skills: ["irons_shape", "irons_start", "irons_trajectory"],
      duration: 15,
      description: "Lower flight + hold fade. Start slightly left, finish right, spin stable."
    },

    {
      id: "irons_tight_draw",
      name: "Tight Draw Execution",
      skills: ["irons_shape"],
      duration: 15,
      description: "Small draw (<8y). Harder than big push-draw. Track curve magnitude."
    },


    // ─────────── Trajectory Variability ───────────

    {
      id: "irons_low_mid_high",
      name: "Low / Mid / High Rotation",
      skills: ["irons_trajectory"],
      duration: 15,
      description: "Alternate 3 trajectories. Score based on peak height relative to target windows."
    },

    {
      id: "irons_low_spin_penetrating",
      name: "Low Spin Penetrating Flight",
      skills: ["irons_trajectory"],
      duration: 12,
      description: "Lower peak height without losing directional control. Useful in wind."
    },


    // ─────────── Pressure / Simulation ───────────

    {
      id: "irons_last_ball_matters",
      name: "Last Ball Matters",
      skills: ["irons_pressure", "irons_dispersion"],
      duration: 12,
      description: "Hit 5–8 balls but only FINAL ball counts. Forces mental commitment."
    },

    {
      id: "irons_course_sim",
      name: "Sim Approach Round",
      skills: ["irons_dispersion", "irons_decision"],
      duration: 25,
      description: "Use 6–7 approach shots from random real hole positions. Score greens hit or target zones."
    },

    {
      id: "irons_hazard_avoid",
      name: "Left Hazard Avoidance",
      skills: ["irons_start", "irons_decision"],
      duration: 15,
      description: "Define left OB zone. Any ball finishing in zone resets score. Goal: directional bias to safe side."
    }

  ],
  wedges: [

    // ========= CLOCK SYSTEM / BASELINE =========

    {
      id: "wedges_clock_baseline_full",
      name: "Clock System Baseline",
      skills: ["wedges_distance"],
      duration: 20,
      description: "Record carry for 8–4, 9–3, 10–2 with 52°, 56°, 60°. Log averages and stdev. Goal: ±2.5 yards repeatability."
    },

    {
      id: "wedges_clock_random",
      name: "Clock Randomizer",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Randomly call a clock length + club (e.g., 9–3 w/ 56°). Must land within ±3 yards to continue streak."
    },

    {
      id: "wedges_clock_consistency",
      name: "Clock Consistency Test",
      skills: ["wedges_distance"],
      duration: 20,
      description: "Pick one clock length. Hit 10 balls. Score: (# within ±3 yards) / 10. Log % each session."
    },



    // ========= EXACT DISTANCE ACCURACY =========

    {
      id: "wedges_exact_single",
      name: "Exact Distance Single Target",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Pick a target (ex: 85y). Each ball must be ±2 yards to score. Goal: streak of 3, 5, then 7."
    },

    {
      id: "wedges_distance_ladder",
      name: "Ascending Distance Ladder",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Start 60y → 70y → 80y → 90y → 100y. Must be ±3 yards to move on. Miss forces restart."
    },

    {
      id: "wedges_descending_ladder",
      name: "Descending Distance Ladder",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Start at 110y and step down in 10y increments. Miss by >3y = go back up one rung."
    },

    {
      id: "wedges_precision_80",
      name: "80-Yard Audit",
      skills: ["wedges_distance"],
      duration: 10,
      description: "10 balls at 80y. Score (# within ±3y). Track score session-to-session."
    },



    // ========= RANDOMIZED TARGETS =========

    {
      id: "wedges_distance_shuffle",
      name: "Distance Shuffle",
      skills: ["wedges_distance"],
      duration: 20,
      description: "Cycle 65/75/90/105y in random order. Score +1 if ±3y, -1 miss. End after 20 balls."
    },

    {
      id: "wedges_5yd_step",
      name: "5-Yard Step Game",
      skills: ["wedges_distance"],
      duration: 20,
      description: "Start 75y → increase 5y each shot until miss. Miss resets streak. Track max distance reached."
    },

    {
      id: "wedges_distance_spread",
      name: "Large–Small Spread",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Alternate long & short: 110y → 70y → 105y → 65y etc. Tracks adjustment precision."
    },



    // ========= DISPERSION FOCUSED BUT STILL DISTANCE BASED =========

    {
      id: "wedges_two_circle_test",
      name: "Two Circle Distance + Side",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Define zone: landing circle ±3y long/short and ±7y left/right. Score out of 10."
    },

    {
      id: "wedges_target_narrow",
      name: "Tight Window Wedges",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Choose one target. Must be both ±2 yards carry and within 8-yard dispersion left-right."
    },



    // ========= PRESSURE / VOLUME BUT STILL DISTANCE ONLY =========

    {
      id: "wedges_final_ball_must_hit",
      name: "Final Ball Must Hit Yardage",
      skills: ["wedges_distance"],
      duration: 10,
      description: "Pick one target. Only final ball counts. Track hit/miss history."
    },

    {
      id: "wedges_10ball_test",
      name: "10 Ball Distance Test",
      skills: ["wedges_distance"],
      duration: 12,
      description: "10 balls at a chosen distance. Score % inside ±3y. Compare sessions over time."
    },

    {
      id: "wedges_one_target_fatigue",
      name: "One Target Under Fatigue",
      skills: ["wedges_distance"],
      duration: 15,
      description: "Hit 20 reps to the same distance with minimal rest. Track variance over time."
    }

  ],

  short_game: [

    // ================================
    // BACKYARD / MAT DRILLS
    // ================================

    {
      id: "short_bounce_window_low",
      name: "Low Height Glide Window",
      skills: ["shortgame_glide"],
      duration: 12,
      description: "Hit 15 balls that land in a strip 5ft in front of you and roll out. Must keep launch <20° and use bounce. Score: % executed clean."
    },

    {
      id: "short_bounce_window_mid",
      name: "Mid Height Chipping Window",
      skills: ["shortgame_glide"],
      duration: 12,
      description: "Alternate low→mid→low trajectory every shot. Launch must land in zones 5ft, 10ft, 5ft. Miss resets sequence."
    },

    {
      id: "short_landing_ladder",
      name: "Landing Spot Ladder",
      skills: ["shortgame_distance"],
      duration: 15,
      description: "Place 3 zones at 4ft, 8ft, 12ft. Hit 3-3-4 pattern. Score = total accurate landings / balls."
    },

    {
      id: "short_random_spots",
      name: "Random Landing Generator",
      skills: ["shortgame_distance"],
      duration: 15,
      description: "Call random landing points before each ball. Must be ±1ft. Miss = -1 point. Score to 20 balls."
    },

    {
      id: "short_mini_corner_challenge",
      name: "Corner Challenge",
      skills: ["shortgame_glide"],
      duration: 10,
      description: "Define a 2ft×2ft square target. Must land inside 2 times in a row. Restart on miss. Score streak."
    },

    {
      id: "short_strike_cluster_test",
      name: "Strike Cluster Test",
      skills: ["shortgame_strike"],
      duration: 12,
      description: "Track strike location on face using spray or marker. Score based on clustering tightness rather than outcome."
    },

    {
      id: "short_one_handed_release",
      name: "One-Handed Release",
      skills: ["shortgame_glide"],
      duration: 8,
      description: "Hit with trail hand only for 8–12 reps. Goal: soft glide, no stabbing. No scoring—quality notes."
    },

    {
      id: "short_feel_change",
      name: "Feel Change (Variation)",
      skills: ["shortgame_glide"],
      duration: 10,
      description: "Alternate 'handle high', 'neutral', 'toe down' deliveries. Evaluate strike + bounce use, not result."
    },



    // ================================
    // CHIPPING GREEN / ON-COURSE DRILLS
    // ================================

    {
      id: "short_updown_9ball",
      name: "9-Ball Up-&-Down Challenge",
      skills: ["shortgame_scoring"],
      duration: 20,
      description: "3 easy, 3 medium, 3 hard lies. Score up-and-down %. Track baseline weekly."
    },

    {
      id: "short_updown_tournament",
      name: "Tournament Up-&-Down",
      skills: ["shortgame_scoring"],
      duration: 20,
      description: "Play 6 holes around green. Score par = 2, bogey =1, double=0, birdie=3. Track weekly score."
    },

    {
      id: "short_impossible_lies",
      name: "Hard Lies Only",
      skills: ["shortgame_glide"],
      duration: 15,
      description: "Hit only from downhill, tight, or buried lies. Score % within tap-in (<3ft)."
    },

    {
      id: "short_around_the_world",
      name: "Around the World",
      skills: ["shortgame_distance"],
      duration: 15,
      description: "Start at 5yds → rotate clockwise around green hitting to one hole. Must get inside 6ft to move to next."
    },

    {
      id: "short_landing_circle",
      name: "Landing Circle Test",
      skills: ["shortgame_distance"],
      duration: 15,
      description: "Mark a circle on green (3ft radius). Must land inside. Score /10. Track variance over time."
    },

    {
      id: "short_trajectory_ladder",
      name: "Trajectory Ladder",
      skills: ["shortgame_glide"],
      duration: 18,
      description: "Hit low→mid→high→low etc. Score correct ball flight vs intended windows."
    },

    {
      id: "short_chip_putt_conversion",
      name: "Chip-Putt Conversion Test",
      skills: ["shortgame_scoring"],
      duration: 18,
      description: "10 chips to a hole. Putt everything out. Score strokes to finish vs par baseline."
    },

    {
      id: "short_target_zones",
      name: "Target Zone Challenge",
      skills: ["shortgame_distance"],
      duration: 18,
      description: "Define Red/Yellow/Green zones near pin. Score based on difficulty: Green=2, Yellow=1, Red=0."
    },

    {
      id: "short_hard_vs_easy_mix",
      name: "Hard + Easy Alternating",
      skills: ["shortgame_scoring"],
      duration: 15,
      description: "Alternate hard lie → easy lie. Track performance difference to identify real course weakness."
    },

    {
      id: "short_par18",
      name: "Short Game Par-18",
      skills: ["shortgame_scoring"],
      duration: 20,
      description: "6-hole par-3 short-game course around green. Score vs par; track improvement week to week."
    }

  ],
  putting: [

    // ================================
    // HOME / MAT DRILLS (STRAIGHT LINE)
    // ================================

    {
      id: "putt_mat_gate_basic",
      name: "Gate Start Line (Basic)",
      skills: ["putting_startline"],
      duration: 12,
      description: "Set tees or a putting gate 1\" wider than the ball at 2ft. Must roll through 10 consecutive times. Tracks face/path stability."
    },

    {
      id: "putt_mat_gate_narrow",
      name: "Gate Start Line (Narrow)",
      skills: ["putting_startline"],
      duration: 12,
      description: "Same drill but gate width only ½\" on each side. Score % through in sets of 10. Restart on miss."
    },

    {
      id: "putt_mat_yardstick",
      name: "Yardstick Roll Test",
      skills: ["putting_startline"],
      duration: 10,
      description: "Roll ball down a yardstick. Must stay on and fall off center. Score makes out of 10."
    },

    {
      id: "putt_mat_eyes_closed",
      name: "Eyes Closed Start Line",
      skills: ["putting_startline"],
      duration: 8,
      description: "Hit 8–12 putts eyes closed, checking face/path quality. Score cluster tightness, not makes."
    },

    {
      id: "putt_mat_small_cup",
      name: "Small Cup Target",
      skills: ["putting_startline"],
      duration: 12,
      description: "Use a reduced cup insert. Must make 6/10 from 6ft. No speed focus—pure face/path."
    },

    {
      id: "putt_mat_jump_jacks",
      name: "Fatigue / Distraction Makes",
      skills: ["putting_startline"],
      duration: 10,
      description: "10 jumping jacks → step into 8 balls 4–6ft. Track makes under spike heart rate."
    },

    {
      id: "putt_mat_speed_ladder",
      name: "Mat Speed Ladder",
      skills: ["putting_speed"],
      duration: 12,
      description: "Place four zones 1ft apart on mat. Try to stop ball in each zone sequentially. Score streaks."
    },

    {
      id: "putt_mat_reverse_speed",
      name: "Reverse Speed Ladder",
      skills: ["putting_speed"],
      duration: 12,
      description: "Start long → progressively shorter stops. Score total zones hit in sequence."
    },

    {
      id: "putt_mat_proximity",
      name: "End-Point Proximity Drill",
      skills: ["putting_speed"],
      duration: 10,
      description: "Pick a line at end of mat; track average stopping distance from line over 10 balls."
    },

    // ================================
    // PUTTING GREEN / BREAK & PACE
    // ================================

    {
      id: "putt_green_circle",
      name: "6ft Circle Drill",
      skills: ["putting_startline"],
      duration: 15,
      description: "Place tees in a circle at 6ft around hole. Make % out of 18. No repeats from same spot."
    },

    {
      id: "putt_green_clock",
      name: "Clock Face (Pressure)",
      skills: ["putting_startline"],
      duration: 18,
      description: "12 spots around hole 4-6ft. Must complete full loop. Miss restarts from the top."
    },

    {
      id: "putt_green_lag_range",
      name: "Lag Distance Track",
      skills: ["putting_speed"],
      duration: 20,
      description: "Pick distances 20, 30, 40, 50ft. Roll 3 balls each. Score average leave distance."
    },

    {
      id: "putt_green_die_in_lip",
      name: "Die-In Front Edge",
      skills: ["putting_speed"],
      duration: 12,
      description: "10-20ft putts, must finish before back edge. Score based on % inside optimal window."
    },

    {
      id: "putt_green_break_read",
      name: "Break Read Calibration",
      skills: ["putting_break"],
      duration: 15,
      description: "Choose a slope. Place 15ft putts from 3 spots. Track predicted vs actual start line. Score accuracy."
    },

    {
      id: "putt_green_left_vs_right",
      name: "Left / Right Bias Test",
      skills: ["putting_break"],
      duration: 15,
      description: "Hit breaking putts both directions. Track miss pattern (low vs high). No score—pattern notes."
    },

    {
      id: "putt_green_par18",
      name: "Putting Par-18",
      skills: ["putting_scoring"],
      duration: 20,
      description: "9 holes on green. Par=2 per hole. Track score over time. Pressure-format scoring."
    },

    {
      id: "putt_green_competition",
      name: "Make % Challenge",
      skills: ["putting_startline"],
      duration: 18,
      description: "10 balls each from 5ft, 10ft, 20ft. Score make %, convert long putts to lag score."
    },

    {
      id: "putt_green_long_short_mix",
      name: "Long to Short Conversion",
      skills: ["putting_speed", "putting_scoring"],
      duration: 18,
      description: "Hit 3 long lags → convert all inside circle. Score strokes to finish."
    },

    {
      id: "putt_green_sudden_death",
      name: "Sudden Death Pressure",
      skills: ["putting_scoring"],
      duration: 12,
      description: "Pick 6ft putt. Make streak. Miss ends session. Record streaks over time."
    }

  ],

};
