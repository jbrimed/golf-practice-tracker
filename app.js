// app.js - main client logic (FIXED BLANK SCREEN ISSUE)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();
let activeClubCategory = null; 

// --- Metric Definitions ---
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

// --- Tabs (FIX: Ensures a tab is active on load) ---
function initTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      
      // Handle tab switching visuals
      tabs.forEach((b) => b.classList.remove("active"));
      panes.forEach((p) => p.classList.add("hidden"));

      btn.classList.add("active");
      document.getElementById(target).classList.remove("hidden");

      // Handle content rendering for specific tabs
      if (target === "history") {
        renderHistory();
      } else if (target === "drills") {
        renderDrillLibrary();
      } else if (target === "log") {
        renderSelectedDrills(); // Ensure the log is current when switching
      }
    });
  });

  // FIX: Force initial tab activation on load
  const defaultTab = document.querySelector('.tab-button[data-tab="setup"]');
  if (defaultTab) {
    defaultTab.classList.add("active");
    const sessionPane = document.getElementById("setup");
    if (sessionPane) {
      sessionPane.classList.remove("hidden");
    }
  }
}

// --- Skill Grouping ---
function groupSkillsByClub() {
    const grouped = {};
    SKILLS.forEach(skill => {
        const category = skill.category; 
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(skill);
    });
    return grouped;
}

// --- Skills UI (FIX: Ensures consistent rendering and state) ---
function renderSkills() {
  const container = $("skill-select");
  if (!container) return;

  const groupedSkills = groupSkillsByClub();
  const clubCategories = Object.keys(groupedSkills);
  const selectedCount = selectedDrillIds.size;
  const goToLogBtn = $("go-to-log");

  if (goToLogBtn) {
    goToLogBtn.textContent = `Go to Practice Log (${selectedCount} Drills Selected)`;
    goToLogBtn.disabled = selectedCount === 0;
  }
  
  // Clear and rebuild the container
  container.innerHTML = `
    <div class="space-y-3">
        <label for="club-select-dropdown" class="block text-sm font-semibold text-gray-700">1. Choose a Club/Area</label>
        <select id="club-select-dropdown" class="w-full input-style">
            <option value="">-- Select Club --</option>
            ${clubCategories.map(cat => `<option value="${cat}" ${cat === activeClubCategory ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
    </div>
    <div id="skill-buttons-container" class="mt-6 space-y-3">
        ${activeClubCategory ? `<p class="text-sm font-semibold text-gray-700">2. Select Skills for ${activeClubCategory}</p>` : ''}
    </div>
    <div id="selected-skills-summary" class="mt-4 pt-3 border-t border-gray-200">
        <p class="text-sm font-semibold text-gray-700 mb-2">3. Active Skills</p>
        <div id="skill-summary-tags" class="flex flex-wrap gap-2"></div>
    </div>
  `;
  
  const clubDropdown = $("club-select-dropdown");
  const skillButtonContainer = $("skill-buttons-container");
  
  // Event listener for Club Dropdown
  if (clubDropdown) {
      clubDropdown.addEventListener('change', (e) => {
          activeClubCategory = e.target.value;
          renderSkills(); // Re-render to show new buttons
      });
  }
  
  // Render Skill Buttons for the active category
  if (activeClubCategory && groupedSkills[activeClubCategory]) {
      const skillsHtml = groupedSkills[activeClubCategory].map(skill => {
          const active = selectedSkills.has(skill.id); 
          const className = active 
            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md'
            : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-600';
          return `<button data-skill-id="${skill.id}" class="skill-button px-4 py-2 rounded-full border text-sm transition ${className}">${skill.label}</button>`;
      }).join('');
      
      skillButtonContainer.innerHTML += `<div class="flex flex-wrap gap-3">${skillsHtml}</div>`;
      
      // Attach listeners to the new skill buttons
      skillButtonContainer.querySelectorAll('.skill-button').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const skillId = e.target.getAttribute('data-skill-id');
              if (selectedSkills.has(skillId)) {
                  selectedSkills.delete(skillId);
              } else {
                  selectedSkills.add(skillId);
              }
              renderSkills(); // Update button appearance and summary
              renderSessionDrills(); // Update the drill list
          });
      });
  }
  
  // Render Summary Tags (Active Skills)
  renderSkillSummary(groupedSkills);
  // FIX: This must be called at the end to ensure the drill list reflects the current state
  renderSessionDrills();
}

function renderSkillSummary(groupedSkills) {
    const summaryContainer = $("skill-summary-tags");
    if (!summaryContainer) return;

    const allSkills = Object.values(groupedSkills).flat();
    const activeSkills = allSkills.filter(skill => selectedSkills.has(skill.id));
    
    if (activeSkills.length === 0) {
        summaryContainer.innerHTML = '<p class="text-xs text-gray-500 italic">Select skills from the dropdown above.</p>';
        return;
    }
    
    summaryContainer.innerHTML = activeSkills.map(skill => {
        return `
            <span class="inline-flex items-center text-xs font-medium bg-emerald-50 text-emerald-800 rounded-full px-3 py-1 shadow-sm">
                ${skill.category}: ${skill.label}
                <button data-skill-id="${skill.id}" class="remove-skill-tag ml-2 text-emerald-600 hover:text-emerald-900 font-bold">
                    &times;
                </button>
            </span>
        `;
    }).join('');

    summaryContainer.querySelectorAll('.remove-skill-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const skillId = e.currentTarget.getAttribute('data-skill-id');
            selectedSkills.delete(skillId);
            renderSkills();
        });
    });
}


// --- Drill filtering ---
function getFilteredDrills() {
  if (selectedSkills.size === 0) return [];
  
  const allDrills = Object.values(DRILLS).flat();
  
  return allDrills.filter((d) => d.skills.some((s) => selectedSkills.has(s)));
}

// --- Drills for session tab (Selection/Add List) ---
function renderSessionDrills() {
  const container = $("drill-select");
  if (!container) return;

  container.innerHTML = "";

  const drills = getFilteredDrills();
  const selectedCount = selectedDrillIds.size;
  
  const goToLogBtn = $("go-to-log");
  if (goToLogBtn) {
    goToLogBtn.textContent = `Go to Practice Log (${selectedCount} Drills Selected)`;
    goToLogBtn.disabled = selectedCount === 0;
  }
  
  if (drills.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-base italic mt-4">Select one or more skills above to see matching drills.</p>';
    // FIX: Must still render the log section to clear old drills if filtered drills list becomes empty
    renderSelectedDrills(); 
    return;
  }

  // Flatten all drills for quick lookup by ID
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  drills.forEach((drill) => {
    const card = document.createElement("div");
    card.className = "p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition hover:border-emerald-400"; 

    const added = selectedDrillIds.has(drill.id);
    
    const buttonClass = added 
        ? "bg-gray-300 text-gray-800" 
        : "bg-emerald-600 text-white";

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-lg text-gray-800">${drill.name}</h3>
          <p class="text-xs uppercase tracking-wider text-gray-500 mt-0.5">${drill.category || drill.subcategory || "N/A"}</p>
        </div>
        <button
          data-id="${drill.id}"
          class="toggle-drill px-4 py-1.5 text-sm rounded-lg font-semibold transition ${buttonClass}"
        >
          ${added ? "Remove" : "Add"}
        </button>
      </div>
      <p class="text-sm text-gray-700 mt-2">${drill.description}</p>
      <div class="flex items-center space-x-4 text-xs text-gray-500 mt-2 pt-2 border-t">
        <span>Duration: ~${drill.duration} min</span>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach listeners after DOM insertion
  container.querySelectorAll(".toggle-drill").forEach((btn) => {
    const id = btn.getAttribute("data-id");
    btn.addEventListener("click", () => {
      if (selectedDrillIds.has(id)) {
        selectedDrillIds.delete(id);
      } else {
        selectedDrillIds.add(id);
      }
      renderSessionDrills(); // Re-render to update the add/added button and log count
    });
  });
}

// --- Helper: Get Metric Type for a Drill ---
function getDrillMetric(drill, skillMap) {
    const firstSkillId = drill.skills && drill.skills[0];
    const skill = skillMap.get(firstSkillId);
    return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// --- Helper: Generate Input Field HTML based on Metric Type ---
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
    
    // Determine input span size:
    let metricSpanClass = "md:grid-cols-3"; 
    if (metricType === METRIC_TYPES.DISTANCE_STDDEV || metricType === METRIC_TYPES.PROXIMITY) {
        // Dual inputs need 3 columns (2 for inputs, 1 for notes)
        metricSpanClass = "md:grid-cols-3"; 
    } else if (metricType === METRIC_TYPES.PERCENTAGE || metricType === METRIC_TYPES.NUMERIC) {
        // Single inputs use 2 columns (1 for input, 1 for notes)
        metricSpanClass = "md:grid-cols-2"; 
    } else if (metricType === METRIC_TYPES.CUSTOM) {
        // Custom single input is wider, taking 2 columns, 1 for notes
        metricSpanClass = "md:grid-cols-3"; 
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

// --- Drill Library tab ---
function renderDrillLibrary() {
  const container = $("drill-list");
  if (!container) return;

  container.innerHTML = "";

  for (const category in DRILLS) {
    if (DRILLS.hasOwnProperty(category) && DRILLS[category].length > 0) {
        
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "mt-8 mb-4 border-b-2 border-emerald-500 pb-3";
      categoryHeader.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-800 capitalize">${category.replace(/_/g, ' ')} Drills</h3>
      `;
      container.appendChild(categoryHeader);

      DRILLS[category].forEach((drill) => {
        const card = document.createElement("div");
        card.className = "card border border-gray-200 p-4 space-y-2 hover:border-emerald-400 transition shadow-sm";

        card.innerHTML = `
          <div class="flex justify-between items-center">
            <p class="font-semibold text-lg text-gray-800">${drill.name}</p>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
              ${drill.subcategory || category}
            </span>
          </div>
          <p class="text-sm text-gray-600">${drill.description}</p>
          <div class="text-xs text-gray-500 pt-2 border-t mt-2">
            <p><strong>Focus Skills:</strong> ${drill.skills.join(", ")}</p>
            <p><strong>Duration:</strong> ~${drill.duration} min</p>
          </div>
        `;

        container.appendChild(card);
      });
    }
  }
}

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
  // renderSessionDrills is called inside renderSkills now to handle dependencies
  
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