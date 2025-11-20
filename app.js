// app.js (Overhauled Scoring Logic)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State and Setup (unchanged) ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();
let activeClubCategory = null; 

// --- NEW: Metric Definitions ---
const METRIC_TYPES = {
    PERCENTAGE: 'PERCENTAGE',
    NUMERIC: 'NUMERIC', // Single number metric (e.g., speed)
    DISTANCE_STDDEV: 'DISTANCE_STDDEV', // Carry distance +/- Standard Deviation (for gapping)
    PROXIMITY: 'PROXIMITY', // Average leave distance (e.g., Short Game)
    CUSTOM: 'CUSTOM'
};

// --- Helper: Get Metric Type for a Drill ---
function getDrillMetric(drill, skillMap) {
    // Find the metric type of the first associated skill
    const firstSkillId = drill.skills && drill.skills[0];
    const skill = skillMap.get(firstSkillId);
    return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// --- Helper: Generate Input Field HTML based on Metric Type ---
function getMetricInputHTML(id, metricType) {
    switch (metricType) {
        case METRIC_TYPES.PERCENTAGE:
            return `
                <label class="block text-gray-700 mb-1 font-semibold">Success % (out of 100)</label>
                <input type="number" min="0" max="100" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g., 70" />
            `;
        case METRIC_TYPES.NUMERIC:
            return `
                <label class="block text-gray-700 mb-1 font-semibold">Primary Metric</label>
                <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g., 145 MPH, 3 pts" />
            `;
        case METRIC_TYPES.DISTANCE_STDDEV:
            return `
                <label class="block text-gray-700 mb-1 font-semibold">Carry Avg / Deviation (Yds)</label>
                <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g., 175 / 5 (175yds +/- 5yds)" />
            `;
        case METRIC_TYPES.PROXIMITY:
            return `
                <label class="block text-gray-700 mb-1 font-semibold">Average Leave Distance (ft)</label>
                <input type="number" min="0" step="0.1" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g., 2.5 (feet)" />
            `;
        case METRIC_TYPES.CUSTOM:
        default:
            return `
                <label class="block text-gray-700 mb-1 font-semibold">Score / Result (Custom)</label>
                <input type="text" class="w-full input-style drill-score-input" data-id="${id}" placeholder="e.g., 8/10, Good contact, Not scored" />
            `;
    }
}

// --- Drills for Practice Log tab (Structured Logging) ---
function renderSelectedDrills() {
  const container = $("selected-drills-log");
  if (!container) return;

  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML =
      '<p class="text-lg text-gray-500 italic mt-8 text-center">No drills selected. Go back to the "New Session" tab to choose drills first.</p>';
    return;
  }

  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
  const skillMap = new Map(SKILLS.map(s => [s.id, s])); // Map for quick skill lookup

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return; 

    // Determine the metric type for this drill based on its first associated skill
    const metricType = getDrillMetric(drill, skillMap);

    const card = document.createElement("div");
    card.className = "border border-gray-200 rounded-xl p-5 bg-white shadow-lg"; 

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3 border-b pb-3">
        <h3 class="text-xl font-bold text-gray-900">${drill.name}</h3>
        <button data-id="${drill.id}" class="remove-drill text-red-500 text-sm font-medium hover:underline">
          Remove
        </button>
      </div>
      
      <p class="text-sm text-gray-600 mb-4">${drill.description}</p>
      <p class="text-xs text-gray-500 mb-4">Metric Type: ${metricType}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="md:col-span-1">
          ${getMetricInputHTML(id, metricType)}
        </div>
        <div class="md:col-span-2">
          <label class="block text-gray-700 mb-1 font-semibold">Detailed Observations</label>
          <input
            type="text"
            class="w-full input-style drill-notes-input" 
            data-id="${id}"
            placeholder="What felt different? Why was the score high/low?"
          />
        </div>
      </div>
    `;

    container.appendChild(card);
    
    // Add remove listener... (unchanged)
    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      const drillId = e.currentTarget.getAttribute("data-id");
      selectedDrillIds.delete(drillId);
      renderSkills();
      renderSelectedDrills();
    });
  });
}

// --- Save Session (Read Structured Metrics) ---
function initSaveSession() {
  const btn = $("save-session");
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  if (!btn) return;

  btn.addEventListener("click", () => {
    const dateInput = $("session-date");
    const locInput = $("session-location");
    const notesInput = $("session-notes");

    const date = dateInput?.value || new Date().toISOString().slice(0, 10);
    const location = locInput?.value || "unspecified";
    const notes = notesInput?.value.trim() || "";

    if (selectedDrillIds.size === 0) {
      alert("Select at least one drill before saving the session.");
      return;
    }

    const drillResults = Array.from(selectedDrillIds).map((id) => {
      const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
      const notesInputForDrill = document.querySelector(`.drill-notes-input[data-id="${id}"]`);
      
      return {
        id,
        name: allDrillsMap.get(id)?.name || id,
        // The score now captures the text input regardless of type, making it structured text data
        score: scoreInput?.value.trim() || "", 
        notes: notesInputForDrill?.value.trim() || ""
      };
    });
    
    // ... (rest of session object creation and saving logic remains unchanged)
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
    alert("Session saved.");

    // Reset UI state to start new session
    selectedSkills = new Set();
    selectedDrillIds = new Set();
    activeClubCategory = null; 
    
    // Clear inputs
    if (notesInput) notesInput.value = "";
    if (locInput) locInput.value = "net";
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    
    // Switch back to setup tab
    const setupTabBtn = document.querySelector('.tab-button[data-tab="setup"]');
    if (setupTabBtn) setupTabBtn.click();
    
    renderSkills();
  });
}

// (All other functions like initTabs, renderSkills, renderDrillLibrary, renderHistory are unchanged from the previous version)