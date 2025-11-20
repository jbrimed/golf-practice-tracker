// ================================
// app.js — Minimal Upgrade Version
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
let activeClubCategory = null;

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
// Determine metric type
// ----------------------
function getDrillMetric(drill, skillMap) {
  const firstSkillId = drill.skills && drill.skills[0];
  const skill = skillMap.get(firstSkillId);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// ----------------------
// Metric Input HTML
// ----------------------
function getMetricInputHTML(id, metricType) {
  switch (metricType) {
    case METRIC_TYPES.PERCENTAGE:
      return `
          <label class="block text-gray-700 mb-1 font-semibold">Success %</label>
          <input type="number" min="0" max="100" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g. 70" />
      `;
    case METRIC_TYPES.NUMERIC:
      return `
          <label class="block text-gray-700 mb-1 font-semibold">Primary Metric</label>
          <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g. 145 MPH, 3 pts" />
      `;
    case METRIC_TYPES.DISTANCE_STDDEV:
      return `
          <label class="block text-gray-700 mb-1 font-semibold">Carry Avg / Deviation (Yds)</label>
          <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="175 / 5" />
      `;
    case METRIC_TYPES.PROXIMITY:
      return `
          <label class="block text-gray-700 mb-1 font-semibold">Average Leave Distance (ft)</label>
          <input type="number" min="0" step="0.1" class="w-full input-style drill-score-input" data-id="${id}" placeholder="2.5" />
      `;
    default:
      return `
          <label class="block text-gray-700 mb-1 font-semibold">Score</label>
          <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="8/10, good strikes" />
      `;
  }
}

// ----------------------
// Render drills in log tab
// ----------------------
function renderSelectedDrills() {
  const container = $("selected-drills-log");
  if (!container) return;

  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML =
      `<p class="text-lg text-gray-500 italic mt-8 text-center">
        No drills selected.
      </p>`;
    return;
  }

  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
  const skillMap = new Map(SKILLS.map(s => [s.id, s]));

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return;

    const metricType = getDrillMetric(drill, skillMap);

    const card = document.createElement("div");
    card.className = "border border-gray-200 rounded-xl p-5 bg-white shadow-lg";

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3 border-b pb-3">
        <h3 class="text-xl font-bold text-gray-900">${drill.name}</h3>
        <button data-id="${drill.id}" class="remove-drill text-red-500 text-sm font-medium hover:underline">Remove</button>
      </div>

      <p class="text-sm text-gray-600 mb-4">${drill.description}</p>
      <p class="text-xs text-gray-500 mb-4">Metric: ${metricType}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>${getMetricInputHTML(id, metricType)}</div>
        <div class="md:col-span-2">
          <label class="block text-gray-700 mb-1 font-semibold">Notes</label>
          <input type="text" class="w-full input-style drill-notes-input" data-id="${id}" placeholder="Observations..." />
        </div>
      </div>
    `;

    container.appendChild(card);

    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      selectedDrillIds.delete(id);
      renderSelectedDrills();
    });
  });
}

// ----------------------
// Save session w/ structured metrics
// ----------------------
function initSaveSession() {
  const btn = $("save-session");
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
  const skillMap = new Map(SKILLS.map(s => [s.id, s]));

  btn.addEventListener("click", () => {
    const dateInput = $("session-date");
    const locInput = $("session-location");
    const notesInput = $("session-notes");

    const date = dateInput?.value || new Date().toISOString().slice(0, 10);
    const location = locInput?.value || "unspecified";
    const notes = notesInput?.value.trim() || "";

    const drillResults = Array.from(selectedDrillIds).map((id) => {
      const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
      const notesInputForDrill = document.querySelector(`.drill-notes-input[data-id="${id}"]`);

      const raw = scoreInput?.value.trim() || "";
      let numeric = null;
      const match = raw.match(/[-+]?\d*\.?\d+/);
      if (match) numeric = parseFloat(match[0]);

      const metricType = getDrillMetric(allDrillsMap.get(id), skillMap);

      return {
        id,
        name: allDrillsMap.get(id)?.name || id,
        score: { raw, numeric, type: metricType },
        notes: notesInputForDrill?.value.trim() || ""
      };
    });

    const session = {
      date,
      location,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds),
      drillResults,
      notes,
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Saved.");

    selectedSkills = new Set();
    selectedDrillIds = new Set();
    renderSelectedDrills();
  });
}

// ----------------------
// Analytics
// ----------------------
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();

  if (!sessions.length) {
    container.innerHTML = "<p>No sessions logged.</p>";
    return;
  }

  const numericScores = sessions
    .flatMap(s => s.drillResults || [])
    .filter(d => d.score && d.score.numeric !== null);

  if (!numericScores.length) {
    container.innerHTML = "<p>No numeric scores to analyze yet.</p>";
    return;
  }

  const avg = numericScores.reduce((a, b) => a + b.score.numeric, 0) / numericScores.length;

  container.innerHTML = `
    <div class="card">
      <h3 class="text-xl font-bold">Overall Avg Metric</h3>
      <p class="text-lg">${avg.toFixed(2)}</p>
    </div>
  `;
}

// ----------------------
// Tab Logic (Add analytics trigger)
// ----------------------
function initTabs() {
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;

      document.querySelectorAll(".tab-pane").forEach(x => x.classList.add("hidden"));
      document.querySelectorAll(".tab-button").forEach(x => x.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(tab).classList.remove("hidden");

      if (tab === "analytics") renderAnalytics();
    });
  });
}

// ----------------------
// Initialize
// ----------------------
function init() {
  initTabs();
  initSaveSession();
  renderSelectedDrills();
}

init();
