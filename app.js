// ================================
// app.js — FULL VERSION (Rebuilt)
// ================================

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// ----------------------
// STATE
// ----------------------
let selectedSkills = new Set();
let selectedDrillIds = new Set();

// ----------------------
// METRIC TYPES
// ----------------------
const METRIC_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  NUMERIC: "NUMERIC",
  DISTANCE_STDDEV: "DISTANCE_STDDEV",
  PROXIMITY: "PROXIMITY",
  CUSTOM: "CUSTOM"
};

// ----------------------
// CATEGORY DISPLAY NAMES
// ----------------------
const CATEGORIES = {
  driving: "Driving",
  approach: "Approach / Irons",
  wedges: "Wedges",
  shortgame: "Short Game",
  putting: "Putting",
  other: "Other"
};

// ----------------------
// HELPERS
// ----------------------
const allDrillsMap = new Map(
  Object.values(DRILLS).flat().map(d => [d.id, d])
);

const skillMap = new Map(SKILLS.map(s => [s.id, s]));

// ================================
// CATEGORY DETECTION (HYBRID)
// ================================
function detectCategory(drill) {
  // 1: manual override
  if (drill.category) return drill.category;

  // 2: infer from group name in DRILLS
  for (const groupName in DRILLS) {
    if (DRILLS[groupName].some(d => d.id === drill.id)) {
      switch (groupName) {
        case "driver": return "driving";
        case "irons": return "approach";
        case "wedges": return "wedges";
        case "short_game": return "shortgame";
        case "putting": return "putting";
        default: return "other";
      }
    }
  }

  // 3: keyword fallback
  const id = drill.id.toLowerCase();
  if (id.includes("driver") || id.includes("tee")) return "driving";
  if (id.includes("iron") || id.includes("approach")) return "approach";
  if (id.includes("wedge") || id.includes("pitch")) return "wedges";
  if (id.includes("chip") || id.includes("short")) return "shortgame";
  if (id.includes("putt") || id.includes("green")) return "putting";

  return "other";
}

// ================================
// METRIC TYPE RESOLVER
// ================================
function getDrillMetric(drill) {
  const firstSkill = drill.skills[0];
  const skill = skillMap.get(firstSkill);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// ================================
// METRIC INPUT HTML
// ================================
function getMetricInputHTML(id, type) {
  switch (type) {
    case METRIC_TYPES.PERCENTAGE:
      return `<input data-id="${id}" type="number" min="0" max="100" class="input-style drill-score-input" placeholder="%" />`;

    case METRIC_TYPES.DISTANCE_STDDEV:
      return `<input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="175 / 5" />`;

    case METRIC_TYPES.PROXIMITY:
      return `<input data-id="${id}" type="number" step="0.1" class="input-style drill-score-input" placeholder="Feet" />`;

    default:
      return `<input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Score" />`;
  }
}

// ================================
// RENDER — SKILL MULTISELECT
// ================================
function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";

  SKILLS.forEach(skill => {
    const row = document.createElement("div");
    row.className = "flex items-center space-x-3 mb-2";

    row.innerHTML = `
      <input type="checkbox" class="skill-check h-4 w-4" data-skill="${skill.id}">
      <label class="text-gray-800 text-sm">${skill.label}</label>
    `;

    row.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) selectedSkills.add(skill.id);
      else selectedSkills.delete(skill.id);
      renderDrillSelect();
    });

    container.appendChild(row);
  });
}

// ================================
// RENDER — DRILL SELECTION (GROUPED)
// ================================
function renderDrillSelect() {
  const container = $("drill-select");
  container.innerHTML = "";

  // FIX: Show all drills if no skills selected, otherwise filter
  const filtered = Object.values(DRILLS)
    .flat()
    .filter(drill => {
      if (selectedSkills.size === 0) return true;
      return drill.skills.some(s => selectedSkills.has(s));
    });

  if (!filtered.length) {
    container.innerHTML = `<p class="text-gray-600">No drills match these skills.</p>`;
    return;
  }

  const grouped = {};
  filtered.forEach(drill => {
    const cat = detectCategory(drill);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(drill);
  });

  Object.keys(grouped).forEach(cat => {
    const section = document.createElement("div");
    section.className = "mb-6";

    section.innerHTML = `
      <h3 class="text-xl font-semibold mb-3 border-b pb-1">${CATEGORIES[cat]}</h3>
      <div class="space-y-4" id="group-${cat}"></div>
    `;

    container.appendChild(section);

    const groupDiv = section.querySelector(`#group-${cat}`);

    grouped[cat].forEach(drill => {
      const card = document.createElement("div");
      card.className = "card";
      
      // Check if already added to disable button
      const isAdded = selectedDrillIds.has(drill.id);
      const btnClass = isAdded ? "bg-emerald-600 cursor-not-allowed" : "bg-black";
      const btnText = isAdded ? "Added" : "Add Drill";

      card.innerHTML = `
        <h4 class="text-lg font-bold">${drill.name}</h4>
        <p class="text-sm text-gray-600 mb-2">${drill.description}</p>
        <button data-id="${drill.id}" class="add-drill text-white px-3 py-2 rounded-lg text-sm ${btnClass}" ${isAdded ? "disabled" : ""}>
          ${btnText}
        </button>
      `;

      card.querySelector(".add-drill").addEventListener("click", (e) => {
        selectedDrillIds.add(drill.id);
        renderSelectedDrills();
        updateGoToLogButton();

        // FIX: Visual feedback
        const btn = e.target;
        btn.innerText = "Added";
        btn.classList.remove("bg-black");
        btn.classList.add("bg-emerald-600");
        btn.disabled = true;
      });

      groupDiv.appendChild(card);
    });
  });
}

// ================================
// RENDER — SELECTED DRILLS IN LOG
// ================================
function renderSelectedDrills() {
  const container = $("selected-drills-log");
  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML = `<p>No drills selected.</p>`;
    return;
  }

  Array.from(selectedDrillIds).forEach(id => {
    const drill = allDrillsMap.get(id);
    const metric = getDrillMetric(drill);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3 class="text-lg font-bold mb-2">${drill.name}</h3>
      <label class="text-sm font-semibold">Score</label>
      ${getMetricInputHTML(id, metric)}

      <label class="text-sm font-semibold mt-3 block">Notes</label>
      <textarea data-id="${id}" class="drill-notes-input input-style w-full"></textarea>

      <button class="remove-drill mt-3 text-red-600 text-sm underline" data-id="${id}">
        Remove
      </button>
    `;

    card.querySelector(".remove-drill").addEventListener("click", () => {
      selectedDrillIds.delete(id);
      renderSelectedDrills();
      updateGoToLogButton();
      // Re-render select list to re-enable the "Add" button
      renderDrillSelect(); 
    });

    container.appendChild(card);
  });
}

// ================================
// BUTTON — UPDATE COUNT
// ================================
function updateGoToLogButton() {
  $("go-to-log").innerText = `Go to Practice Log (${selectedDrillIds.size} drills)`;
}

// ================================
// SAVE SESSION
// ================================
function initSaveSession() {
  $("save-session").addEventListener("click", () => {
    const drillResults = Array.from(selectedDrillIds).map(id => {
      const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
      const notesInput = document.querySelector(`.drill-notes-input[data-id="${id}"]`);

      const raw = scoreInput?.value.trim() || "";
      let numeric = null;
      const match = raw.match(/[-+]?\d*\.?\d+/);
      if (match) numeric = parseFloat(match[0]);

      return {
        id,
        name: allDrillsMap.get(id)?.name,
        score: { raw, numeric },
        notes: notesInput.value.trim()
      };
    });

    const session = {
      date: $("session-date").value || new Date().toISOString().slice(0, 10),
      location: $("session-location").value,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds),
      drillResults,
      notes: $("session-notes").value.trim(),
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Session saved.");
    
    // Optional: Reset for next session
    selectedDrillIds.clear();
    renderSelectedDrills();
    updateGoToLogButton();
    renderDrillSelect();
    $("session-notes").value = "";
  });
}

// ================================
// HISTORY
// ================================
function renderHistory() {
  const container = $("history-list");
  const sessions = loadSessions();

  container.innerHTML = "";

  if (!sessions.length) {
    container.innerHTML = "<p>No past sessions.</p>";
    return;
  }

  // Reverse to show newest first
  sessions.slice().reverse().forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    
    // Calculate simple summary
    const drillsCount = s.drills ? s.drills.length : 0;
    const notesSnippet = s.notes ? `<p class="text-sm text-gray-500 mt-1">"${s.notes}"</p>` : "";

    div.innerHTML = `
      <h3 class="font-bold">${s.date} — ${s.location}</h3>
      <p class="text-sm text-gray-800">${drillsCount} drills completed</p>
      ${notesSnippet}
    `;

    container.appendChild(div);
  });
}

// ================================
// ANALYTICS (FIXED)
// ================================
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();

  if (!sessions.length) {
    container.innerHTML = "<p>No data recorded yet.</p>";
    return;
  }

  // 1. Group scores by Drill ID
  const drillStats = {};

  sessions.forEach(session => {
    if (!session.drillResults) return;
    
    session.drillResults.forEach(result => {
      if (result.score && result.score.numeric !== null) {
        if (!drillStats[result.id]) {
          drillStats[result.id] = { name: result.name, scores: [] };
        }
        drillStats[result.id].scores.push(result.score.numeric);
      }
    });
  });

  // 2. Render HTML
  container.innerHTML = "";
  
  if (Object.keys(drillStats).length === 0) {
      container.innerHTML = "<p>No numeric scores found in history.</p>";
      return;
  }

  Object.keys(drillStats).forEach(id => {
    const data = drillStats[id];
    const sum = data.scores.reduce((a, b) => a + b, 0);
    const avg = sum / data.scores.length;
    const max = Math.max(...data.scores);

    const card = document.createElement("div");
    card.className = "card mb-4";
    card.innerHTML = `
      <h3 class="font-bold text-lg border-b pb-2 mb-2">${data.name}</h3>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
           <span class="block text-xs font-bold text-gray-500 uppercase">Average</span>
           <span class="text-xl font-mono">${avg.toFixed(1)}</span>
        </div>
        <div>
           <span class="block text-xs font-bold text-gray-500 uppercase">Best</span>
           <span class="text-xl font-mono">${max}</span>
        </div>
        <div>
           <span class="block text-xs font-bold text-gray-500 uppercase">Attempts</span>
           <span class="text-xl font-mono">${data.scores.length}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ================================
// TABS
// ================================
function initTabs() {
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      document.querySelectorAll(".tab-pane").forEach(x => x.classList.add("hidden"));
      document.querySelectorAll(".tab-button").forEach(x => x.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tab).classList.remove("hidden");

      if (tab === "history") renderHistory();
      if (tab === "analytics") renderAnalytics();
      if (tab === "log") renderSelectedDrills();
    });
  });
}

// ================================
// INIT
// ================================
function init() {
  renderSkills();
  renderDrillSelect();
  initSaveSession();
  initTabs();

  // FIX: Make the big button actually switch tabs
  $("go-to-log").addEventListener("click", () => {
     document.querySelector('[data-tab="log"]').click();
     window.scrollTo(0,0);
  });
}

init();