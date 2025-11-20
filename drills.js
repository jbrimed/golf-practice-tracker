// drills.js — unified drill list

export const DRILLS = {
  driver: [
    {
      id: "driver_fade_window",
      name: "Fade Window Challenge",
      skills: ["driver_start", "driver_face", "driver_control"],
      duration: 20,
      description: "Hit intentional fades. Ball must finish right of center but not overcurve. Track % fairway-width hits."
    },
    {
      id: "driver_no_left",
      name: "Don't Go Left Test",
      skills: ["driver_face", "driver_start", "driver_control"],
      duration: 15,
      description: "Track 10 balls. Any ball finishing left of target = automatic fail. Score based on how many stay right."
    },
    {
      id: "driver_big_carry",
      name: "Max Carry + Fairway",
      skills: ["driver_speed", "driver_control"],
      duration: 15,
      description: "Swing at max intent. Score based on carry AND whether shot finishes within set fairway width."
    }
  ],

  irons: [
    {
      id: "irons_start_line",
      name: "Start-Line Gate",
      skills: ["irons_start", "irons_face"],
      duration: 20,
      description: "Use tees or alignment rods. Count % of shots starting within gate."
    },
    {
      id: "irons_distance_10ball",
      name: "10-Ball Distance Ladder",
      skills: ["irons_distance", "irons_control"],
      duration: 20,
      description: "Pick 3 distances (e.g., 135/150/165). Must land within ±5 yards. Score: total hits."
    },
    {
      id: "irons_dispersion_circle",
      name: "Circle of Accuracy",
      skills: ["irons_dispersion"],
      duration: 15,
      description: "Pick a target. Score based on % of shots finishing in a radius (10–20 yards depending on level)."
    }
  ],

  wedges: [
    {
      id: "wedges_clock_system",
      name: "Clock System Calibration",
      skills: ["wedges_distance", "wedges_precision"],
      duration: 25,
      description: "Hit 50/60/70 yard controlled swings. Track carry precision across positions."
    },
    {
      id: "wedges_landing_spot",
      name: "Landing Spot Ladder",
      skills: ["wedges_spin", "wedges_precision"],
      duration: 20,
      description: "Pick 3–5 landing spots. Ball must land in zone. Score hits per zone."
    },
    {
      id: "wedges_low_spinner",
      name: "Low Flight Spinner",
      skills: ["wedges_trajectory", "wedges_spin"],
      duration: 15,
      description: "Hit low-flight wedges that stop within controlled rollout. Score based on stop distance."
    }
  ],

  shortgame: [
    {
      id: "sg_random_lies",
      name: "Random Lies 10-Ball",
      skills: ["shortgame_contact", "shortgame_precision"],
      duration: 20,
      description: "Throw balls into random lies. Score up-and-down or proximity."
    },
    {
      id: "sg_elevated_shortside",
      name: "Short-Sided Up & Down",
      skills: ["shortgame_precision", "shortgame_pressure"],
      duration: 15,
      description: "Simulate being short-sided. Score by proximity or up/down %."
    },
    {
      id: "sg_ladder_challenge",
      name: "Landing Ladder",
      skills: ["shortgame_feel", "shortgame_precision"],
      duration: 20,
      description: "Progress landing zones. Restart if miss."
    }
  ],

  putting: [
    {
      id: "putt_short_line",
      name: "Short Putt Line Drill",
      skills: ["putting_start", "putting_path"],
      duration: 10,
      description: "3–6ft straight mat reps. Score streaks. Miss resets count."
    },
    {
      id: "putt_lag_speed",
      name: "Lag Putting Distance Control",
      skills: ["putting_speed"],
      duration: 20,
      description: "20–50ft puts. Score based on distance from hole (e.g., <3ft = point)."
    },
    {
      id: "putt_pressure",
      name: "Pressure Ladder",
      skills: ["putting_pressure"],
      duration: 15,
      description: "Make 10 in a row from 3–6ft increasing distance. Miss sends you back."
    }
  ]
};
