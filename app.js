// ================================
// app.js — Full Rebuild (Simple)
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

// ================================
// HELPER — MAP STRUCTURES
// ================================
const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
const skillMap = new Map(SKILLS.map(s => [s.id, s]));

// ================================
// DETERMINE METRIC TYPE
// ================================
function getDrillMetric(drill) {
  const skillId = drill.skills?.[0];
  const skill = skillMap.get(skillId);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// ================================
// INPUT UI BASED ON METRIC TYPE
// ================================
function getMetricInputHTML(id, metricType) {
  switch (metricType) {
    case METRIC_TYPES.PERCENTAGE:
      return `<input data-id="${id}" type="number" min="0" max="100" class="input-style drill-score-input" placeholder="%" />`;

    case METRIC_TYPES.DISTANCE_STDDEV:
      return `<input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="175 / 5" />`;

    case METRIC_TYPES.PROXIMITY:
      return `<input data-id="${id}" type="number" class="input-style drill-score-input" placeholder="Feet" />`;

    default:
      return `<input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Score" />`;
  }
}

// ================================
// RENDER — SKILL SELECTION (SETUP TAB)
// ================================
function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";

  SKILLS.forEach(skill => {
    const div = document.createElement("div");
    div.className = "flex items-center space-x-3 mb-2";

    div.innerHTML = `
      <input type="checkbox" data-skill="${skill.id}" class="skill-check h-4 w-4" />
      <label class="text-gray-800">${skill.label}</label>
    `;

    div.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) selectedSkills.add(skill.id);
      else selectedSkills.delete(skill.id);
      renderDrillSelect();
    });

    container.appendChild(div);
  });
}

// ================================
// RENDER — DRILL SELECTION LIST
// ================================
function renderDrillSelect() {
  const container = $("drill-select");
  container.innerHTML = "";

  const filtered = Object.values(DRILLS)
    .flat()
    .filter(d => d.skills.some(s => selectedSkills.has(s)));

  if (!filtered.length) {
    container.innerHTML = `<p class="text-gray-600">Select skills to see drills.</p>`;
    return;
  }

  filtered.forEach(drill => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3 class="text-lg font-bold">${drill.name}</h3>
      <p class="text-sm text-gray-600 mb-3">${drill.description}</p>
      <button data-id="${drill.id}" class="add-drill bg-black text-white px-3 py-2 rounded-lg text-sm">
        Add Drill
      </button>
    `;

    card.querySelector(".add-drill").addEventListener("click", () => {
      selectedDrillIds.add(drill.id);
      renderSelectedDrills();
      updateGoToLogButton();
    });

    container.appendChild(card);
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
    const metricType = getDrillMetric(drill);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3 class="text-lg font-bold mb-2">${drill.name}</h3>
      <label class="text-sm font-semibold">Score</label>
      ${getMetricInputHTML(id, metricType)}

      <label class="text-sm font-semibold mt-3 block">Notes</label>
      <textarea data-id="${id}" class="drill-notes-input input-style w-full"></textarea>

      <button data-id="${id}" class="remove-drill mt-3 text-red-600 text-sm underline">Remove</button>
    `;

    card.querySelector(".remove-drill").addEventListener("click", () => {
      selectedDrillIds.delete(id);
      renderSelectedDrills();
      updateGoToLogButton();
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
    const sessions = loadSessions();

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
      date: $("session-date").value || new Date().toISOString().slice(0,10),
      location: $("session-location").value,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds),
      drillResults,
      notes: $("session-notes").value.trim(),
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Session saved.");
  });
}

// ================================
// HISTORY VIEW
// ================================
function renderHistory() {
  const container = $("history-list");
  const sessions = loadSessions();

  container.innerHTML = "";

  if (!sessions.length) {
    container.innerHTML = "<p>No past sessions.</p>";
    return;
  }

  sessions.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3 class="font-bold">${s.date} — ${s.location}</h3>
      <p class="text-sm text-gray-600">${s.drills.length} drills</p>
    `;

    container.appendChild(div);
  });
}

// ================================
// ANALYTICS
// ================================
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();

  const numericScores = sessions.flatMap(s =>
    (s.drillResults || []).filter(d => d.score.numeric !== null)
  );

  if (!numericScores.length) {
    container.innerHTML = "<p>No numeric data yet.</p>";
    return;
  }

  const avg = numericScores.reduce((a, b) => a + b.score.numeric, 0) / numericScores.length;

  container.innerHTML = `
    <div class="card">
      <h3 class="text-xl font-bold">Overall Average</h3>
      <p>${avg.toFixed(2)}</p>
    </div>
  `;
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
}

init();
