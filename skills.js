// skills.js (MODIFIED to include metricType)

export const SKILLS = [

  // -------------------------
  // DRIVER
  // -------------------------
  { id: "driver_face", category: "Driver", label: "Face/Start Line", metricType: "PERCENTAGE" },
  { id: "driver_speed", category: "Driver", label: "Speed / Max Intent", metricType: "NUMERIC" }, // e.g., MPH
  { id: "driver_dispersion", category: "Driver", label: "Dispersion", metricType: "PERCENTAGE" },

  // -------------------------
  // IRONS
  // -------------------------
  { id: "irons_startline", category: "Irons", label: "Start Line", metricType: "PERCENTAGE" },
  { id: "irons_trajectory", category: "Irons", label: "Trajectory / Flight", metricType: "CUSTOM" }, // Freeform
  { id: "irons_distance", category: "Irons", label: "Yardage / Gapping", metricType: "DISTANCE_STDDEV" }, // e.g., Yds +/- X

  // -------------------------
  // WEDGES
  // -------------------------
  { id: "wedges_distance", category: "Wedges", label: "Distance Control", metricType: "DISTANCE_STDDEV" },
  { id: "wedges_strike", category: "Wedges", label: "Strike / Contact", metricType: "PERCENTAGE" },
  { id: "wedges_trajectory", category: "Wedges", label: "Trajectory Variability", metricType: "CUSTOM" },

  // -------------------------
  // SHORT GAME
  // -------------------------
  { id: "shortgame_distance", category: "Short Game", label: "Landing Zones", metricType: "PROXIMITY" }, // e.g., Avg Leave (ft)
  { id: "shortgame_glide", category: "Short Game", label: "Glide / Bounce Use", metricType: "PERCENTAGE" },
  { id: "shortgame_scoring", category: "Short Game", label: "Up & Down Scoring", metricType: "PERCENTAGE" },
  { id: "shortgame_strike", category: "Short Game", label: "Strike Quality", metricType: "CUSTOM" },

  // -------------------------
  // PUTTING
  // -------------------------
  { id: "putting_startline", category: "Putting", label: "Start Line / Path", metricType: "PERCENTAGE" },
  { id: "putting_speed", category: "Putting", label: "Speed / Capture Distance", metricType: "PROXIMITY" },
  { id: "putting_break", category: "Putting", label: "Break / Read", metricType: "PERCENTAGE" },
  { id: "putting_scoring", category: "Putting", label: "Scoring / Pressure", metricType: "NUMERIC" },

];