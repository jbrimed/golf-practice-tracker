// skills.js — hierarchical skill taxonomy

export const SKILL_TREE = {
  driver: {
    label: "Driver",
    skills: [
      { id: "driver_face", label: "Face Control" },
      { id: "driver_startline", label: "Start Direction" },
      { id: "driver_dontgo_left", label: "Don’t Go Left" },
      { id: "driver_speed", label: "Speed / Intent" },
      { id: "driver_dispersion", label: "Dispersion Windows" }
    ]
  },

  approach: {
    label: "Approach",
    skills: [
      { id: "appr_startline", label: "Start Line Control" },
      { id: "appr_distance", label: "Distance Control" },
      { id: "appr_dispersion", label: "Dispersion" },
      { id: "appr_trajectory", label: "Trajectory Windows" },
      { id: "appr_club_selection", label: "Club Strategy" }
    ]
  },

  wedges: {
    label: "Wedges",
    skills: [
      { id: "wed_dist_system", label: "Distance System" },
      { id: "wed_trajectory", label: "Trajectory Windows" },
      { id: "wed_spin_launch", label: "Launch/Spin Windows" },
      { id: "wed_pressure", label: "Pressure / Randomization" }
    ]
  },

  shortgame: {
    label: "Short Game",
    skills: [
      { id: "sg_landing", label: "Landing Spot Control" },
      { id: "sg_random", label: "Random Lies / Reactivity" },
      { id: "sg_contact", label: "Contact Quality" },
      { id: "sg_updown", label: "Up & Down % Games" }
    ]
  },

  putting: {
    label: "Putting",
    skills: [
      { id: "put_start", label: "Start Line" },
      { id: "put_pace", label: "Pace Control" },
      { id: "put_short", label: "Short Putts (inside 10ft)" },
      { id: "put_lag", label: "Lag Putting" },
      { id: "put_pressure", label: "Pressure Games" },
      { id: "put_indoor", label: "Indoor Mat Games" }
    ]
  }
};
