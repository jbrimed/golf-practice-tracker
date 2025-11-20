export const DRILLS = {
  driver: [
    {
      id: "driver_fade_window",
      name: "Fade Window + Face Spray",
      skills: ["start_line", "face_control", "pattern"],
      description: "Start slightly left, finish right. Track strike with face spray.",
      duration: 20,
      environment: ["net", "range", "sim"],
      scoring: {
        type: "points",
        rules: [
          { outcome: "start_left_finish_right", points: 2 },
          { outcome: "start_center_finish_right", points: 1 },
          { outcome: "start_left_small_left", points: 1 },
          { outcome: "start_right_anything", points: 0 },
          { outcome: "finish_left", points: -2 }
        ]
      }
    },
    {
      id: "driver_no_left_10",
      name: "Don’t-Go-Left Challenge",
      skills: ["pattern", "face_control"],
      description: "10-ball set. Must start left and finish right or ≤10 yards left.",
      duration: 15,
      environment: ["net", "range", "sim"],
      scoring: { type: "points", max_score: 20 }
    },
    {
      id: "driver_low_launch",
      name: "Low Launch Bunt Fade",
      skills: ["face_control", "launch"],
      description: "75% speed, ball slightly back, hold-off finish.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "cluster", metric: "strike_tightness" }
    },
    {
      id: "driver_speed_cluster",
      name: "Speed + Cluster",
      skills: ["speed", "pattern", "strike"],
      description: "Max intent swings tracked for ball speed + cluster dispersion.",
      duration: 20,
      environment: ["sim", "range"],
      scoring: {
        type: "weighted",
        components: ["ball_speed", "start_line", "strike_location"]
      }
    },
    {
      id: "driver_three_targets",
      name: "3-Target Line Test (Left/Center/Right)",
      skills: ["start_line", "face_control"],
      description: "Pick three start-line lanes, must hit each lane twice in rotation.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "completion", target_hits: 6 }
    },
    {
      id: "driver_pressure_21",
      name: "Driver 21-Point Circuit",
      skills: ["start_line", "strike", "pattern"],
      description: "21-point scoring game. Must score before session ends.",
      duration: 25,
      environment: ["range", "sim"],
      scoring: {
        type: "points",
        rules: [
          { zone: "ideal", points: 3 },
          { zone: "playable", points: 1 },
          { zone: "left_miss", points: -2 }
        ]
      }
    },
    {
      id: "driver_start_line_only",
      name: "Start Direction Only (No Curve Constraints)",
      skills: ["start_line"],
      description: "Focus only on start window. Curve doesn't matter.",
      duration: 10,
      environment: ["net"],
      scoring: { type: "rate", metric: "start_center_pct" }
    },
    {
      id: "driver_face_randomizer",
      name: "Face Angle Randomizer",
      skills: ["face_control", "pattern"],
      description: "Call the face condition before hitting: open, square, slightly closed.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "execution_rate" }
    },
    {
      id: "driver_high_low_window",
      name: "Vertical Launch Window",
      skills: ["launch", "strike"],
      description: "Alternate low, mid, high trajectories with same start line.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "driver_gear_effect_map",
      name: "Gear-Effect Mapping",
      skills: ["strike", "face_control"],
      description: "Deliberate heel vs toe to learn movement patterns.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "awareness", metric: "predicted_vs_actual_curve" }
    },
    {
      id: "driver_strike_grid",
      name: "Strike Location Grid",
      skills: ["strike"],
      description: "Divide face into 9 zones, attempt to hit called squares.",
      duration: 20,
      environment: ["net"],
      scoring: { type: "accuracy", attempts: 12 }
    },
    {
      id: "driver_fairway_finder",
      name: "Fairway Finder 5-Ball",
      skills: ["pattern", "start_line"],
      description: "Define a 20-yard fairway. Score based on hits.",
      duration: 10,
      environment: ["sim", "range"],
      scoring: { type: "points", max_score: 5 }
    },
    {
      id: "driver_commit_sesh",
      name: "Intent-Locked Block",
      skills: ["pattern", "routine", "mental"],
      description: "Pick pattern (fade) and do entire session without switching.",
      duration: 30,
      environment: ["range", "sim"],
      scoring: { type: "subjective", metric: "consistency" }
    },
    {
      id: "driver_over_speed_block",
      name: "Over-Speed + Pattern",
      skills: ["speed", "pattern"],
      description: "High-intent cluster work without losing start direction window.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "dual_metric", metrics: ["ball_speed", "corridor"] }
    }
  ],
  irons: [
    {
      id: "irons_start_lane_tape",
      name: "Intermediate Tape Start-Line",
      skills: ["start_line", "face_control"],
      description: "Place vertical tape strip on net. Commit to start lane, ignore curve.",
      duration: 15,
      environment: ["net", "range", "sim"],
      scoring: { type: "rate", metric: "start_window_pct" }
    },
    {
      id: "irons_3_length_test",
      name: "Three-Length Calibration",
      skills: ["start_line", "sequencing"],
      description: "Half → rib-high → full swings with same start line target.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "variance", metric: "start_shift_between_lengths" }
    },
    {
      id: "irons_depth_box",
      name: "Divot Depth + Low Point Box",
      skills: ["low_point", "strike"],
      description: "Draw chalk box ahead of ball. Low point must be inside box.",
      duration: 20,
      environment: ["range", "grass"],
      scoring: { type: "hits_in_box", attempts: 15 }
    },
    {
      id: "irons_tee_contact",
      name: "Low Point Tee Line",
      skills: ["low_point"],
      description: "Lay down 6 tees in a line ahead of ball; clip tees after contact.",
      duration: 10,
      environment: ["range"],
      scoring: { type: "rate", metric: "tees_struck" }
    },
    {
      id: "irons_height_ladder",
      name: "Trajectory Height Ladder",
      skills: ["trajectory", "spin", "face_control"],
      description: "Hit low, normal, high shots in order without losing start line.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "irons_spin_hold",
      name: "Spin Hold-Off Control",
      skills: ["face_control", "trajectory", "spin"],
      description: "Deliver low-spin hold-off flights. Control curve through face stability.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "launch_monitor", metrics: ["spin", "launch", "face_to_path"] }
    },
    {
      id: "irons_strike_spray",
      name: "Face Spray Strike Clusters",
      skills: ["strike", "pattern"],
      description: "Track cluster shrinks over 15–20 shot block.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "cluster", metric: "pattern_radius" }
    },
    {
      id: "irons_missed_start_map",
      name: "Start-Line Miss Mapping",
      skills: ["start_line", "awareness"],
      description: "Track misses by bucket (early face vs timing vs aim).",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "categorical", categories: ["left_pull", "push", "push_fade", "straight"] }
    },
    {
      id: "irons_club_rotation_loop",
      name: "Club Rotation Loop",
      skills: ["adaptation", "start_line"],
      description: "Rotate 5i → 8i → PW repeatedly. Maintain same start window.",
      duration: 25,
      environment: ["range"],
      scoring: { type: "consistency" }
    },
    {
      id: "irons_pressure_18",
      name: "18 Ball Target Round",
      skills: ["start_line", "strike", "trajectory"],
      description: "3 clubs × 6 shots each. Must score better than last session.",
      duration: 30,
      environment: ["sim", "range"],
      scoring: {
        type: "points",
        rules: [
          { zone: "center", points: 2 },
          { zone: "playable", points: 1 },
          { zone: "bad_miss_left", points: -2 }
        ]
      }
    },
    {
      id: "irons_pure_center",
      name: "Center Contact Only",
      skills: ["strike"],
      description: "Call and execute only center-face strikes. Miss ends streak.",
      duration: 15,
      environment: ["net"],
      scoring: { type: "streak" }
    },
    {
      id: "irons_start_corners",
      name: "Corner Start Grid",
      skills: ["start_line", "shaping"],
      description: "Pick 4 corner lanes (low-left, low-right, high-left, high-right). Hit each twice.",
      duration: 25,
      environment: ["range", "sim"],
      scoring: { type: "completion" }
    },
    {
      id: "irons_flight_hold",
      name: "Hold-Off Fade / Punch",
      skills: ["trajectory", "face_control"],
      description: "Alternate punch → fade → punch → fade without shifting aim.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "rate" }
    },
    {
      id: "irons_divot_direction",
      name: "Divot Direction Match",
      skills: ["path", "low_point"],
      description: "Ensure divot direction matches target, not curve.",
      duration: 20,
      environment: ["grass"],
      scoring: { type: "visual_match" }
    },
    {
      id: "irons_ground_force_check",
      name: "Pressure Shift Timing",
      skills: ["sequencing", "strike"],
      description: "Use stance plate/feel to time pressure into lead side before impact.",
      duration: 20,
      environment: ["range"],
      scoring: { type: "trend" }
    },
    {
      id: "irons_one_ball_test",
      name: "One-Ball Round (Sim)",
      skills: ["decision_making", "start_line"],
      description: "Play a virtual round with one ball, no retries. Score objectively.",
      duration: 45,
      environment: ["sim"],
      scoring: { type: "score" }
    },
    {
      id: "irons_random_distance",
      name: "Random Distance Generator",
      skills: ["distance", "start_line"],
      description: "Random number from 130–200, hit to that number repeatedly.",
      duration: 20,
      environment: ["sim", "range"],
      scoring: { type: "carry_error" }
    },
    {
      id: "irons_gap_verification",
      name: "Gapping Check",
      skills: ["distance", "face_control"],
      description: "Hit 5 shots per club 4i–PW and measure carry spacing.",
      duration: 40,
      environment: ["sim"],
      scoring: { type: "spread", metric: "distance_gap_variance" }
    },
    {
      id: "irons_face_offset_sesh",
      name: "Face Offset Awareness",
      skills: ["face_control"],
      description: "Deliberately hit pulls and push-fades to calibrate face alignment awareness.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "awareness" }
    },
    {
      id: "irons_anti_flip",
      name: "Anti-Flip Release",
      skills: ["impact", "face_control"],
      description: "Focus on lead wrist + shaft lean without losing start line.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "impact_quality" }
    }
  ],
  wedges: [
    {
      id: "wedges_distance_ladder",
      name: "Distance Ladder (40–120)",
      skills: ["distance", "trajectory", "calibration"],
      description: "Hit 40 → 60 → 80 → 100 → 120. Restart if any miss exceeds tolerance.",
      duration: 25,
      environment: ["range", "sim"],
      scoring: { type: "tolerance", yards: 5 }
    },
    {
      id: "wedges_half_threequarter_full",
      name: "1/2 → 3/4 → Full Calibration",
      skills: ["distance", "strike"],
      description: "Hit 10 balls per motion style. Track clusters separately.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "cluster", metric: "carry_variance" }
    },
    {
      id: "wedges_partial_matrix",
      name: "Partial Swing Matrix",
      skills: ["distance", "trajectory"],
      description: "Clock system grids for different wedges. Fill in carry data.",
      duration: 45,
      environment: ["sim", "range"],
      scoring: { type: "mapping" }
    },
    {
      id: "wedges_start_line_gate",
      name: "Start-Line Gate",
      skills: ["start_line", "strike"],
      description: "Use net lanes or alignment sticks. Ball must launch through gate.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "rate", metric: "start_gate_pct" }
    },
    {
      id: "wedges_face_spray_cluster",
      name: "Face Spray Strike Cluster",
      skills: ["strike", "pattern"],
      description: "Track cluster radius and drift across session.",
      duration: 15,
      environment: ["net", "range"],
      scoring: { type: "cluster" }
    },
    {
      id: "wedges_random_distance_generator",
      name: "Random Distance Generator",
      skills: ["distance", "adaptation"],
      description: "Generate random number 55–105. Hit to that target once and move on.",
      duration: 20,
      environment: ["sim", "range"],
      scoring: { type: "carry_error" }
    },
    {
      id: "wedges_low_trajectory_hold",
      name: "Low Launch + Hold-Off",
      skills: ["trajectory", "face_control"],
      description: "Hit compressed low shots without hooks.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: { type: "launch_monitor", metrics: ["launch", "spin", "face_to_path"] }
    },
    {
      id: "wedges_high_float_spinners",
      name: "Float + Spin High Shots",
      skills: ["trajectory", "spin"],
      description: "Hit high launch, high spin with neutral face (not pull-hooks).",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "wedges_distance_pressure_18",
      name: "18 Shot Distance Challenge",
      skills: ["distance", "start_line", "consistency"],
      description: "3 motions × 6 shots each. Score must beat previous session.",
      duration: 30,
      environment: ["sim", "range"],
      scoring: {
        type: "points",
        rules: [
          { zone: "±3yd", points: 3 },
          { zone: "±6yd", points: 1 },
          { zone: ">6yd", points: -2 }
        ]
      }
    },
    {
      id: "wedges_narrow_stance_lowpoint",
      name: "Narrow Stance Low Point Audit",
      skills: ["strike", "low_point"],
      description: "Narrow stance wedge swings focusing on bottoming out ahead.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "visual", metric: "contact_pattern" }
    },
    {
      id: "wedges_spin_axis_test",
      name: "Spin Axis Control",
      skills: ["face_control", "spin"],
      description: "Hit same distance but vary spin axis to understand face changes.",
      duration: 20,
      environment: ["sim"],
      scoring: { type: "metric_track", metrics: ["spin_axis", "launch", "face"] }
    },
    {
      id: "wedges_target_one_club_round",
      name: "One-Wedge Round",
      skills: ["distance", "trajectory", "decision_making"],
      description: "Play full simulated hole distances using only one wedge.",
      duration: 25,
      environment: ["sim", "range"],
      scoring: { type: "score" }
    },
    {
      id: "wedges_hard_ground_strip",
      name: "Tight Lie Test",
      skills: ["strike", "low_point"],
      description: "Hit from firm/tight surface. Evaluate strike consistency.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "cluster" }
    },
    {
      id: "wedges_face_path_offset",
      name: "Face vs Path Offset Awareness",
      skills: ["face_control", "start_line"],
      description: "Hit push-fade wedges intentionally, then square-neutral.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "awareness" }
    },
    {
      id: "wedges_spin_kill",
      name: "Spin-Kill Punch Shots",
      skills: ["trajectory", "strike"],
      description: "Remove loft + reduce spin. Keep carry within target zone.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "launch_monitor" }
    },
    {
      id: "wedges_uninterrupted_string",
      name: "10 in a Row Clean",
      skills: ["strike", "start_line"],
      description: "Must hit 10 clean strikes in a row. Miss → restart.",
      duration: 20,
      environment: ["net", "range"],
      scoring: { type: "streak" }
    },
    {
      id: "wedges_game_ladder",
      name: "Game Ladder: 3 Distances Repeated",
      skills: ["distance", "consistency"],
      description: "Pick 3 yardages, complete them in sequence. Restart on failure.",
      duration: 25,
      environment: ["sim", "range"],
      scoring: { type: "progress" }
    },
    {
      id: "wedges_curve_to_target",
      name: "Shape-to-Number Test",
      skills: ["trajectory", "face_control", "distance"],
      description: "Hit draw → fade → straight to same carry number.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "completion" }
    },
    {
      id: "wedges_downhill_uphill",
      name: "Slope Adjustment Wedges",
      skills: ["strike", "trajectory"],
      description: "Hit from uphill/downhill/sidehill lies.",
      duration: 20,
      environment: ["range"],
      scoring: { type: "qualitative" }
    },
    {
      id: "wedges_ball_position_shifts",
      name: "Ball Position Variability",
      skills: ["strike", "trajectory"],
      description: "Hit ball back, middle, forward—track launch + spin differences.",
      duration: 15,
      environment: ["range"],
      scoring: { type: "metric_compare" }
    }
  ],
  chipping: [
    {
      id: "chip_random_lies",
      name: "Random Lie Roulette",
      skills: ["strike", "lie_adjustment", "confidence"],
      description: "Drop ball in random lies (rough, fringe, bare) and play one-ball only.",
      duration: 20,
      environment: ["short_game_area", "backyard"],
      scoring: { type: "up_and_down_rate" }
    },
    {
      id: "chip_landing_ladder",
      name: "Landing Spot Ladder",
      skills: ["landing_spot", "trajectory", "spin"],
      description: "Three landing zones, 3–3–4 pattern. Track misses.",
      duration: 15,
      environment: ["short_game_area", "backyard"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "chip_glide_only",
      name: "Glide Only (Wiffle Balls)",
      skills: ["strike", "bounce_usage"],
      description: "Use wiffle balls to remove fear of digging; neutral release.",
      duration: 10,
      environment: ["backyard", "garage", "indoor"],
      scoring: { type: "subjective_pattern" }
    },
    {
      id: "chip_10_ball_par",
      name: "10-Ball Par Challenge",
      skills: ["pressure", "accuracy", "scoring"],
      description: "Define hole, play 10 up-and-down attempts for score vs previous best.",
      duration: 25,
      environment: ["short_game_area"],
      scoring: { type: "stroke_score", par: 40 }
    },
    {
      id: "chip_lie_switch",
      name: "Lie Variety Switch",
      skills: ["lie_adjustment", "spin", "decision_making"],
      description: "Rotate lies every swing: tight → fluffy → downhill → greenside.",
      duration: 20,
      environment: ["short_game_area"],
      scoring: { type: "rate", metric: "successful_contact" }
    },
    {
      id: "chip_trajectory_triad",
      name: "Trajectory Triad",
      skills: ["trajectory", "landing_spot"],
      description: "Hit low runner → standard → high soft in repeating rotation.",
      duration: 15,
      environment: ["short_game_area"],
      scoring: { type: "completion" }
    },
    {
      id: "chip_release_variability",
      name: "Release Variability",
      skills: ["strike", "face_control"],
      description: "Hit hands-forward, neutral, and throw-release versions to compare.",
      duration: 15,
      environment: ["backyard"],
      scoring: { type: "qualitative_compare" }
    },
    {
      id: "chip_one_ball_course",
      name: "One-Ball Realism Loop",
      skills: ["pressure", "decision_making", "landing_spot"],
      description: "Simulate course: new lie every rep, no retries.",
      duration: 30,
      environment: ["short_game_area"],
      scoring: { type: "score" }
    },
    {
      id: "chip_spinner_vs_dead",
      name: "Spinner vs Dead-ball Contrast",
      skills: ["spin", "trajectory", "strike"],
      description: "Hit alternating high spin then dead runner to same landing spot.",
      duration: 20,
      environment: ["short_game_area"],
      scoring: { type: "differential" }
    },
    {
      id: "chip_over_obstacle",
      name: "Carry-Obstacle Challenge",
      skills: ["trajectory", "confidence"],
      description: "Chip over a towel/bag to force height and landing precision.",
      duration: 15,
      environment: ["backyard", "short_game_area"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "chip_bare_lie_test",
      name: "Bare Lie Strike Test",
      skills: ["strike", "low_point"],
      description: "Focus on clean contact on tight lies.",
      duration: 10,
      environment: ["short_game_area"],
      scoring: { type: "cluster" }
    },
    {
      id: "chip_lag_chip",
      name: "Lag Chip Distance Control",
      skills: ["distance", "touch", "landing_spot"],
      description: "Chip from 20–50 yards to a fat landing zone for rollout control.",
      duration: 20,
      environment: ["short_game_area", "range"],
      scoring: { type: "carry_error" }
    },
    {
      id: "chip_miss_zone",
      name: "Miss Pattern Mapping",
      skills: ["diagnostic", "strike"],
      description: "Track misses: thin, heavy, high face, leading edge, toe.",
      duration: 15,
      environment: ["backyard", "short_game_area"],
      scoring: { type: "categorical" }
    },
    {
      id: "chip_three_targets",
      name: "Three Target Grid",
      skills: ["landing_spot", "trajectory"],
      description: "Hit small → medium → far landing spots, repeat in loops.",
      duration: 20,
      environment: ["short_game_area"],
      scoring: { type: "completion" }
    },
    {
      id: "chip_pressure_reset",
      name: "Pressure Ladder Reset",
      skills: ["pressure", "confidence"],
      description: "Complete ascending difficulty levels; miss → restart run.",
      duration: 25,
      environment: ["short_game_area"],
      scoring: { type: "progress" }
    },
    {
      id: "chip_spin_hold",
      name: "Spin Hold-Off",
      skills: ["spin", "trajectory"],
      description: "Play softer spin reduction, no face flip.",
      duration: 15,
      environment: ["short_game_area"],
      scoring: { type: "metric_compare" }
    },
    {
      id: "chip_slope_variation",
      name: "Slope Variation",
      skills: ["decision_making", "strike"],
      description: "Hit chips on up/down/sidehill slopes with same club.",
      duration: 20,
      environment: ["short_game_area"],
      scoring: { type: "awareness" }
    },
    {
      id: "chip_two_club_compare",
      name: "Two-Club Comparison",
      skills: ["decision_making"],
      description: "Hit same shot w/ LW then GW and compare rollout strategy.",
      duration: 15,
      environment: ["short_game_area"],
      scoring: { type: "compare" }
    },
    {
      id: "chip_force_bounce",
      name: "Bounce Enforcement Drill",
      skills: ["bounce_usage", "strike"],
      description: "Slight open face, neutral shaft, avoid digging leading edge.",
      duration: 10,
      environment: ["backyard", "short_game_area"],
      scoring: { type: "strike_quality" }
    },
    {
      id: "chip_10_up_downs",
      name: "10 Up and Downs",
      skills: ["scoring", "pressure", "decision_making"],
      description: "Play ten real up-and-down attempts, score vs par.",
      duration: 30,
      environment: ["short_game_area"],
      scoring: { type: "stroke_score" }
    }
  ],
  putting: [
    {
      id: "putt_pace_circle",
      name: "Pace Circle",
      skills: ["pace", "capture_speed", "distance_control"],
      description: "Place a 3-ft circle around the hole. All balls must finish inside the circle, dying before the back edge.",
      duration: 15,
      environment: ["green", "indoor_mat"],
      scoring: { type: "make_rate", metric: "in_circle_pct" }
    },
    {
      id: "putt_short_start_gate",
      name: "Short-Start Gate",
      skills: ["start_line", "path"],
      description: "Gate 1\" wider than ball, 2–3ft away. Must roll clean through gate.",
      duration: 15,
      environment: ["indoor_mat", "green"],
      scoring: { type: "gate_success" }
    },
    {
      id: "putt_lag_target_ladder",
      name: "Lag Target Ladder",
      skills: ["pace", "touch"],
      description: "Hit putts to 20/30/40/50 ft targets in order. Restart on large miss.",
      duration: 20,
      environment: ["green", "indoor_mat"],
      scoring: { type: "zones_hit" }
    },
    {
      id: "putt_pressure_21",
      name: "21-Point Pressure",
      skills: ["pressure", "confidence"],
      description: "Earn points for putts inside defined capture window.",
      duration: 25,
      environment: ["indoor_mat", "green"],
      scoring: {
        type: "points",
        rules: [
          { zone: "made", points: 3 },
          { zone: "within_12in", points: 1 },
          { zone: "short", points: 0 },
          { zone: "long", points: -2 }
        ]
      }
    },
    {
      id: "putt_knee_knocker_run",
      name: "Knee-Knocker Circuit",
      skills: ["confidence", "start_line"],
      description: "4–6ft putts from multiple angles; must make streak of 8 before ending.",
      duration: 15,
      environment: ["green"],
      scoring: { type: "streak" }
    },
    {
      id: "putt_tee_gate_control",
      name: "Tee Gate Distance Control",
      skills: ["pace", "start_line"],
      description: "Place two tees as a gate halfway to hole; must pass gate + finish inside window.",
      duration: 20,
      environment: ["green", "indoor_mat"],
      scoring: { type: "dual_metric" }
    },
    {
      id: "putt_left_right_variance",
      name: "Left/Right Bias Map",
      skills: ["start_line", "face_control"],
      description: "Hit 20 putts tracking left miss vs right miss tendencies.",
      duration: 10,
      environment: ["indoor_mat"],
      scoring: { type: "categorical" }
    },
    {
      id: "putt_die_at_front_edge",
      name: "Die At Front Edge",
      skills: ["pace", "capture_speed"],
      description: "20 putts must finish before back lip. No smash speeds.",
      duration: 15,
      environment: ["indoor_mat", "green"],
      scoring: { type: "rate", metric: "die_speed_pct" }
    },
    {
      id: "putt_random_distance_generator",
      name: "Random Distance Generator",
      skills: ["pace", "adaptability"],
      description: "Pick random distances between 15–50 ft with a generator.",
      duration: 20,
      environment: ["green"],
      scoring: { type: "distance_error" }
    },
    {
      id: "putt_backup_line_test",
      name: "Backup Line Test",
      skills: ["start_line", "path"],
      description: "Roll ball backwards through gate to check alignment consistency.",
      duration: 10,
      environment: ["indoor_mat"],
      scoring: { type: "pass_fail" }
    },
    {
      id: "putt_one_ball_pressure",
      name: "One-Ball Round",
      skills: ["pressure", "routine", "decision_making"],
      description: "Walk entire putting green hitting one-ball real play.",
      duration: 30,
      environment: ["green"],
      scoring: { type: "strokes_to_complete" }
    },
    {
      id: "putt_lag_cluster",
      name: "Lag Cluster Tracking",
      skills: ["pace", "distance"],
      description: "10 putts from one distance, track cluster size.",
      duration: 15,
      environment: ["green"],
      scoring: { type: "cluster" }
    },
    {
      id: "putt_break_read_compare",
      name: "Break-Read Compare",
      skills: ["break_reading", "aim"],
      description: "Pick line, commit, then compare to actual.",
      duration: 20,
      environment: ["green"],
      scoring: { type: "awareness" }
    },
    {
      id: "putt_spiral_ladder",
      name: "Spiral Ladder",
      skills: ["pace", "start_line"],
      description: "Putts progressively farther in a spiral around hole.",
      duration: 25,
      environment: ["green"],
      scoring: { type: "progression" }
    },
    {
      id: "putt_three_gate",
      name: "Triple Gate Path Test",
      skills: ["path", "start_line"],
      description: "Three gates spaced evenly; ball must pass all.",
      duration: 20,
      environment: ["indoor_mat"],
      scoring: { type: "gate_success" }
    },
    {
      id: "putt_pressure_ladder",
      name: "Pressure Ladder (Make or Restart)",
      skills: ["confidence", "pressure"],
      description: "Ascending putt difficulty; miss restarts run.",
      duration: 20,
      environment: ["green", "indoor_mat"],
      scoring: { type: "progress" }
    },
    {
      id: "putt_aim_vs_start_direction",
      name: "Aim vs Start Direction Split",
      skills: ["aim", "start_line", "face_control"],
      description: "Pick an aim line separate from start line to test face influence.",
      duration: 15,
      environment: ["green"],
      scoring: { type: "differential" }
    },
    {
      id: "putt_speed_hold_off",
      name: "Speed Hold-Off",
      skills: ["pace", "touch"],
      description: "Intentionally eliminate long misses by dropping pace ceiling.",
      duration: 15,
      environment: ["indoor_mat", "green"],
      scoring: { type: "long_miss_rate" }
    },
    {
      id: "putt_competition_mode",
      name: "Competition Mode",
      skills: ["pressure", "routine"],
      description: "Simulate tournament finish. 6 putts, all must score.",
      duration: 15,
      environment: ["green"],
      scoring: { type: "points" }
    },
    {
      id: "putt_outlier_cleanout",
      name: "Outlier Miss Cleanout",
      skills: ["start_line", "consistency"],
      description: "Focus entire block on eliminating ONE miss pattern type.",
      duration: 10,
      environment: ["indoor_mat", "green"],
      scoring: { type: "category_reduction" }
    }
  ],
  strategy: [
    {
      id: "strat_virtual_round_one_ball",
      name: "One-Ball Virtual Round",
      skills: ["decision_making", "pressure", "dispersion", "distance"],
      description: "Play a simulated round shot-by-shot with one ball, no re-hits. Treat misses as real penalties.",
      duration: 60,
      environment: ["sim", "range"],
      scoring: { type: "score", unit: "strokes" }
    },
    {
      id: "strat_target_par_3_rotation",
      name: "Par-3 Rotation Challenge",
      skills: ["distance", "launch", "start_line"],
      description: "Simulate 9 par-3s at varying distances. Score like real golf.",
      duration: 30,
      environment: ["sim", "range"],
      scoring: { type: "score" }
    },
    {
      id: "strat_dispersion_corridor",
      name: "Dispersion Corridor Test",
      skills: ["start_line", "pattern", "face_control"],
      description: "Define a 20–30 yard wide corridor. Score based on staying inside window.",
      duration: 20,
      environment: ["sim", "range"],
      scoring: {
        type: "points",
        rules: [
          { zone: "center", points: 3 },
          { zone: "corridor", points: 1 },
          { zone: "outside_corridor", points: -2 }
        ]
      }
    },
    {
      id: "strat_three_target_mix",
      name: "Three Target Mix",
      skills: ["distance", "start_line", "trajectory"],
      description: "Choose 3 random targets (short, mid, long). Must hit all three in rotation.",
      duration: 20,
      environment: ["sim", "range"],
      scoring: { type: "completion", hits_required: 6 }
    },
    {
      id: "strat_penalty_left_test",
      name: "Penalty Left / Safe Miss Game",
      skills: ["pattern", "start_line", "pressure"],
      description: "Simulate holes where left is hazard. Reward safe misses, punish left.",
      duration: 25,
      environment: ["sim", "range"],
      scoring: {
        type: "points",
        rules: [
          { zone: "ideal", points: 2 },
          { zone: "safe_miss", points: 1 },
          { zone: "left_penalty", points: -3 }
        ]
      }
    },
    {
      id: "strat_random_club_wheel",
      name: "Random Club Wheel",
      skills: ["adaptability", "shotmaking", "decision_making"],
      description: "Assign random clubs to specific yardages to force creativity.",
      duration: 20,
      environment: ["range", "sim"],
      scoring: { type: "carry_error" }
    },
    {
      id: "strat_up_down_sim_round",
      name: "Simulated Up & Down Circuit",
      skills: ["scoring", "short_game", "pressure"],
      description: "Start each hole 50–120 yards out and play in. Score total strokes to finish.",
      duration: 40,
      environment: ["sim"],
      scoring: { type: "score" }
    },
    {
      id: "strat_shot_shape_assignment",
      name: "Shot Shape Assignment",
      skills: ["pattern", "trajectory", "face_control"],
      description: "Call the shape before each swing: straight, fade, low float, punch.",
      duration: 15,
      environment: ["range", "sim"],
      scoring: { type: "execution_rate" }
    },
    {
      id: "strat_go_no_go_decisions",
      name: "Go / No-Go Decision Map",
      skills: ["strategy", "dispersion", "probabilistic_thinking"],
      description: "Simulate approach decisions: choose layup vs attack based on dispersion.",
      duration: 25,
      environment: ["sim"],
      scoring: { type: "decision_quality" }
    },
    {
      id: "strat_stress_finish",
      name: "Under-Pressure Finish",
      skills: ["pressure", "confidence", "routine"],
      description: "End session with 5–10 high-pressure 'round finishing' swings that must score.",
      duration: 10,
      environment: ["sim", "range", "net"],
      scoring: { type: "points" }
    }
  ]
};
