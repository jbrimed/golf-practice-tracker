export const PRACTICE_QUOTAS = {
    Driver: [
        { key: 'driverFadeWindow', label: 'Fade Window + Face Spray', required: true },
        { key: 'driverDontGoLeft', label: 'Don’t-Go-Left Scoring', required: true },
        { key: 'driverFaceCluster', label: 'Face Cluster Tracking', required: true },
        { key: 'driverLowLaunchFade', label: 'Low-Launch Bunt Fade', required: false },
        { key: 'driverCreative', label: 'Creative / Variability', required: false },
    ],
    Irons: [
        { key: 'ironsStartLine', label: 'Intermediate Target Start-Line', required: true },
        { key: 'ironsThreeLength', label: 'Three-Length Calibration', required: true },
        { key: 'ironsClubRotation', label: 'Club Rotation Sequence', required: true },
        { key: 'ironsTrajectoryExtremes', label: 'Trajectory Extremes', required: false },
    ],
    Wedges: [
        { key: 'wedgesDistance', label: 'Distance System (½ / ¾ / Full)', required: true },
        { key: 'wedgesStrikeCombo', label: 'Strike + Start-Line Combo', required: true },
        { key: 'wedgesSpecificDistance', label: 'Specific Distance Challenge', required: false },
    ],
    Chipping: [
        { key: 'chippingRandomLies', label: 'Random Lies / One-Ball Reps', required: true },
        { key: 'chippingLadder', label: 'Landing Spot Ladder', required: true },
        { key: 'chippingWiffle', label: 'Wiffle-Ball Glide', required: false },
    ],
    Putting: [
        { key: 'puttingPath', label: 'Short-Path Gate', required: true },
        { key: 'puttingPace', label: 'Pace: Die-in Speed', required: true },
    ],
};

export const DRILL_LIBRARY = {
    Driver: [
        {
            name: "Fade Window + Face Spray",
            description: "Start slightly left, finish right into the fade lane. Tracks strike pattern + start line.",
            criteria: [
                "Start left or center",
                "Finish right",
                "Track face cluster",
                "Positive spin axis"
            ]
        },
        {
            name: "Low-Launch Bunt Fade",
            description: "Reduce closure rate, stabilize face. Not a punch shot.",
            criteria: [
                "Ball slightly back",
                "75% speed",
                "Lower finish",
                "No right starts"
            ]
        }
    ],
    Irons: [
        {
            name: "Three-Length Calibration",
            description: "Detect sequencing drift across motion sizes.",
            criteria: [
                "3 half swings",
                "3 rib-high",
                "4 full swings",
                "Start window consistency"
            ]
        }
    ],
    Wedges: [
        {
            name: "Distance System (½ / ¾ / Full)",
            description: "Cluster carries within 3–5 yards across motion types.",
            criteria: [
                "10 shots per motion",
                "Track carry variance",
                "Face spray optional"
            ]
        }
    ],
    Chipping: [
        {
            name: "Random Lies One-Ball",
            description: "No re-dos. Simulates course pressure.",
            criteria: [
                "Drop → Hit → Move",
                "Bounce-first",
                "Neutral release"
            ]
        }
    ],
    Putting: [
        {
            name: "Short-Path Gate",
            description: "Maintain a square path with no manipulation.",
            criteria: [
                "Gate 1\" wider than ball",
                "2–3 ft distance",
                "Clean roll"
            ]
        }
    ]
};
