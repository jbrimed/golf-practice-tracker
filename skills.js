// skills.js — SCRATCH ELITE SKILL DEFINITIONS (Metric Types Added)

export const SKILLS = [
  // === DRIVER ===
  { id: "driver_dispersion", label: "Dispersion / Corridor", category: "Driver", metricType: "PERCENTAGE_OR_SD" },
  { id: "driver_face", label: "Face Control / Start Line", category: "Driver", metricType: "PERCENTAGE" },
  { id: "driver_speed", label: "Speed & Stability", category: "Driver", metricType: "NUMERIC" },
  { id: "driver_workability", label: "Shaping & Flight", category: "Driver", metricType: "PERCENTAGE" },

  // === IRONS ===
  { id: "irons_distance", label: "Carry Consistency (SD)", category: "Irons", metricType: "DISTANCE_STDDEV" },
  { id: "irons_workability", label: "Shaping / Trajectory", category: "Irons", metricType: "PERCENTAGE" },
  { id: "irons_contact", label: "Contact Quality / Low Point", category: "Irons", metricType: "NUMERIC" },

  // === WEDGES (120y in) ===
  { id: "wedges_distance", label: "Distance Control (Clock)", category: "Wedges", metricType: "DISTANCE_STDDEV" },
  { id: "wedges_trajectory", label: "Launch Angle Control", category: "Wedges", metricType: "PERCENTAGE" },
  { id: "wedges_spin", label: "Spin Consistency", category: "Wedges", metricType: "NUMERIC" },

  // === SHORT GAME (Around Green) ===
  { id: "shortgame_scoring", label: "Par 18 / Scoring Games", category: "Short Game", metricType: "SCORE_INVERSE" },
  { id: "shortgame_pressure", label: "Worst Ball / Pressure", category: "Short Game", metricType: "PERCENTAGE" },
  { id: "shortgame_control", label: "Landing Spot Control", category: "Short Game", metricType: "PROXIMITY" },

  // === PUTTING ===
  { id: "putting_pressure", label: "Short Putts / Streak", category: "Putting", metricType: "PERCENTAGE" },
  { id: "putting_speed", label: "Lag & Speed Control", category: "Putting", metricType: "PROXIMITY" },
  { id: "putting_startline", label: "Start Line / Gates", category: "Putting", metricType: "PERCENTAGE" },
  { id: "putting_read", label: "Reading Breaks", category: "Putting", metricType: "PERCENTAGE" },
];