// ======================================
// drills.js — master aggregator
// ======================================

import DRIVER_DRILLS from "./drills/driver.js";
import IRON_DRILLS from "./drills/approach.js";
import WEDGE_DRILLS from "./drills/wedges.js";
import SHORTGAME_DRILLS from "./drills/shortgame.js";
import PUTTING_DRILLS from "./drills/putting.js";

export const ALL_DRILLS = [
  ...DRIVER_DRILLS,
  ...IRON_DRILLS,
  ...WEDGE_DRILLS,
  ...SHORTGAME_DRILLS,
  ...PUTTING_DRILLS
];
