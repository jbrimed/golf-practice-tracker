// app.js - main client logic (Dual-Input Structured Scoring)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();
let activeClubCategory = null; 

// --- NEW: Metric Definitions ---
const METRIC_TYPES = {
    PERCENTAGE: 'PERCENTAGE',     // Single input: % Success
    NUMERIC: 'NUMERIC',           // Single input: Speed, Points, Score
    DISTANCE_STDDEV: 'DISTANCE_STDDEV', // Dual input: Avg Carry (Yds) and Std Dev (Yds)
    PROXIMITY: 'PROXIMITY',       // Dual input: Avg Leave (ft) and Target (ft)
    CUSTOM: 'CUSTOM'
};

// --- History Stub (Function remains as provided in previous response) ---
function renderHistory() {
  const container = $("history-list");
  if (!container) return;

  const sessions = loadSessions().slice().sort((a, b) => {
    return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
  });

  container.innerHTML = "";

  if (sessions.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">No sessions logged yet.</p>';
    return;
  }

  const skillMap = new Map(SKILLS.map((s) => [s.id, s.category + ": " + s.label]));
  const drillMap = new Map(Object.values(DRILLS).flat().map((d) => [d.id, d.name]));

  sessions.forEach((session) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-200 space-y-2";

    const dateStr = new Date(session.date || session.createdAt).toLocaleDateString();

    const skillLabels = (session.skills || []).map(
      (id) => skillMap.get(id) || id
    );

    let drillSectionHtml = "";
    if (session.drillResults && session.drillResults.length > 0) {
      const items = session.drillResults
        .map((r) => {
          const name = r.name || drillMap.get(r.id) || r.id; 
          
          let scoreParts = [];
          if (r.scorePrimary) scoreParts.push(r.scorePrimary);
          if (r.scoreSecondary) scoreParts.push("±" + r.scoreSecondary);
          
          const scoreDisplay = scoreParts.length > 0 
            ? ` <span class="font-semibold text-emerald-700">(${scoreParts.join(' / ')})</span>` 
            : '';
          
          const notePart = r.notes ? ` <span class="italic text-gray-500">— ${r.notes})</span>` : "";
          return `<li><span class="font-medium">${name}</span>${scoreDisplay}${notePart}</li>`;
        })
        .join("");
      drillSectionHtml = `
        <p class="text-sm font-semibold text-gray-700 mt-2">Drills Logged:</p>
        <ul class="list-disc ml-5 text-sm text-gray-700 space-y-1">${items}</ul>
      `;
    } else {
      const drillNames = (session.drills || []).map(
        (id) => drillMap.get(id) || id
      );
      drillSectionHtml = `
        <p class="text-sm text-gray-700 mt-2">Drills: ${drillNames.join(", ")}</p>
      `;
    }

    card.innerHTML = `
      <div class="flex justify-between items-center pb-2 border-b border-gray-100">
        <h3 class="font-bold text-lg text-emerald-700">${dateStr}</h3>
        <span class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full capitalize">${session.location || "unspecified"}</span>
      </div>
      <p class="text-sm text-gray-700"><strong>Intended Skills:</strong> ${skillLabels.join(", ") || "None"}</p>
      ${drillSectionHtml}
      ${
        session.notes
          ? `<p class="text-sm text-gray-700 mt-3 border-t pt-2"><strong>Session Notes:</strong> ${session.notes}</p>`
          : ""
      }
    `;

    container.appendChild(card);
  });
}
// --- END History Stub ---


// --- Tabs, Skill Grouping, renderSkills, renderSkillSummary, getFilteredDrills, renderSessionDrills are UNCHANGED from the previous working app.js ---
// (omitting for brevity, but assume previous, working code is here)
// ...

function initTabs() { /* ... unchanged ... */ }
function groupSkillsByClub() { /* ... unchanged ... */ }
function renderSkills() { /* ... unchanged ... */ }
function renderSkillSummary(groupedSkills) { /* ... unchanged ... */ }
function getFilteredDrills() { /* ... unchanged ... */ }
function renderSessionDrills() { /* ... unchanged ... */ }


// --- Helper: Get Metric Type for a Drill ---
function getDrillMetric(drill, skillMap) {
    const firstSkillId = drill.skills && drill.skills[0];
    const skill = skillMap.get(firstSkillId);
    return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// --- Helper: Generate Input Field HTML based on Metric Type (NEW DUAL INPUTS) ---
function getMetricInputHTML(id, metricType) {
    switch (metricType) {
        case METRIC_TYPES.PERCENTAGE:
            return `
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Success % (0-100)</label>
                    <input type="number" min="0" max="100" class="w-full input-style drill-score-input" data-id="${id}" data-type="primary" placeholder="e.g., 70" />
                </div>
            `;
        case METRIC_TYPES.NUMERIC:
            return `
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Primary Metric</label>
                    <input type="text" class="w-full input-style drill-score-input" data-id="${id}" data-type="primary" placeholder="e.g., 145 MPH, 8/10" />
                </div>
            `;
        case METRIC_TYPES.DISTANCE_STDDEV:
            return `
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Avg Carry (Yds)</label>
                    <input type="number" step="1" class="w-full input-style drill-score-input" data-id="${id}" data-type="primary" placeholder="e.g., 175" />
                </div>
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Deviation (Yds)</label>
                    <input type="number" step="0.1" class="w-full input-style drill-score-input" data-id="${id}" data-type="secondary" placeholder="e.g., 5.2" />
                </div>
            `;
        case METRIC_TYPES.PROXIMITY:
            return `
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Avg Leave (Feet)</label>
                    <input type="number" step="0.1" class="w-full input-style drill-score-input" data-id="${id}" data-type="primary" placeholder="e.g., 2.5" />
                </div>
                <div class="md:col-span-1">
                    <label class="block text-gray-700 mb-1 font-semibold">Target / Goal (Feet)</label>
                    <input type="number" step="1" class="w-full input-style drill-score-input" data-id="${id}" data-type="secondary" placeholder="e.g., 6" />
                </div>
            `;
        case METRIC_TYPES.CUSTOM:
        default:
            return `
                <div class="md:col-span-2">
                    <label class="block text-gray-700 mb-1 font-semibold">Score / Result (Custom)</label>
                    <input type="text" class="w-full input-style drill-score-input" data-id="${id}" data-type="primary" placeholder="e.g., Good feel, Not scored, 8/10" />
                </div>
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
  const skillMap = new Map(SKILLS.map(s => [s.id, s]));

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return; 

    const metricType = getDrillMetric(drill, skillMap);
    
    // Determine input span size: 3 for dual inputs, 2 for single numeric/percentage, 3 for custom
    let metricSpanClass = "md:grid-cols-3"; 
    if (metricType === METRIC_TYPES.DISTANCE_STDDEV || metricType === METRIC_TYPES.PROXIMITY) {
        // Dual inputs need 3 columns (2 for inputs, 1 for notes)
        metricSpanClass = "md:grid-cols-3"; 
    } else if (metricType === METRIC_TYPES.PERCENTAGE || metricType === METRIC_TYPES.NUMERIC) {
        // Single inputs need 2 columns (1 for input, 1 for notes)
        metricSpanClass = "md:grid-cols-2"; 
    } else if (metricType === METRIC_TYPES.CUSTOM) {
        // Custom single input takes 2 columns, 1 for notes
        metricSpanClass = "md:grid-cols-3"; // Allows notes to take up 1 column
    }


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

      <div class="grid grid-cols-1 ${metricSpanClass} gap-4 text-sm">
          ${getMetricInputHTML(id, metricType)}
          <div class="md:col-span-1">
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
    
    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      const drillId = e.currentTarget.getAttribute("data-id");
      selectedDrillIds.delete(drillId);
      renderSkills();
      renderSelectedDrills();
    });
  });
}

// --- Drill Library tab (UNCHANGED) ---
function renderDrillLibrary() { /* ... unchanged ... */ }


// --- Save Session (Reading Dual Inputs) ---
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
      // Find the primary and secondary score inputs
      const scoreInputPrimary = document.querySelector(`.drill-score-input[data-id="${id}"][data-type="primary"]`);
      const scoreInputSecondary = document.querySelector(`.drill-score-input[data-id="${id}"][data-type="secondary"]`);
      const notesInputForDrill = document.querySelector(`.drill-notes-input[data-id="${id}"]`);
      
      return {
        id,
        name: allDrillsMap.get(id)?.name || id,
        // Store both metrics separately for easy parsing by an analytics engine
        scorePrimary: scoreInputPrimary?.value.trim() || "", 
        scoreSecondary: scoreInputSecondary?.value.trim() || "", 
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

// --- Init ---
function init() {
  initTabs();
  renderSkills();
  renderSessionDrills();
  
  // Prefill date
  const dateInput = $("session-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  
  // Listener for Go to Log button
  $("go-to-log")?.addEventListener("click", () => {
    document.querySelector('.tab-button[data-tab="log"]')?.click();
  });

  initSaveSession();
}

document.addEventListener("DOMContentLoaded", init);