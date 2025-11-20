// app.js - main client logic (FIXED CASCADING UI & NEW LOG TAB)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();
// NEW STATE: Tracks the currently active club for the sub-menu display
let activeClubCategory = null; 

// --- Tabs ---
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

  // Default to setup tab
  const defaultTab = document.querySelector('.tab-button[data-tab="setup"]');
  if (defaultTab) {
    defaultTab.classList.add("active");
  }
  const sessionPane = document.getElementById("setup");
  if (sessionPane) {
    sessionPane.classList.remove("hidden");
  }
}

// --- Skill Grouping ---
function groupSkillsByClub() {
    const grouped = {};
    SKILLS.forEach(skill => {
        // Now using the dedicated 'category' property
        const category = skill.category; 
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(skill);
    });
    return grouped;
}

// --- Skills UI (CASCADING OVERHAUL) ---
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
        <label for="club-select-dropdown" class="block text-sm font-medium text-gray-700">1. Choose a Club/Area</label>
        <select id="club-select-dropdown" class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">-- Select Club --</option>
            ${clubCategories.map(cat => `<option value="${cat}" ${cat === activeClubCategory ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
    </div>
    <div id="skill-buttons-container" class="mt-4 space-y-3">
        ${activeClubCategory ? `<p class="text-sm font-medium text-gray-700">2. Select Skills for ${activeClubCategory}</p>` : ''}
    </div>
    <div id="selected-skills-summary" class="mt-4 pt-3 border-t border-gray-200">
        <p class="text-sm font-medium text-gray-700 mb-2">3. Active Skills</p>
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
            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
            : 'bg-white text-gray-700 border-gray-400 hover:border-emerald-600';
          return `<button data-skill-id="${skill.id}" class="skill-button px-3 py-1 rounded border text-sm transition ${className}">${skill.label}</button>`;
      }).join('');
      
      skillButtonContainer.innerHTML += `<div class="flex flex-wrap gap-2">${skillsHtml}</div>`;
      
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
            <span class="inline-flex items-center text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5">
                ${skill.category}: ${skill.label}
                <button data-skill-id="${skill.id}" class="remove-skill-tag ml-1 text-emerald-600 hover:text-emerald-800">
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
      '<p class="text-gray-500 text-sm">Select one or more skills above to see matching drills.</p>';
    return;
  }

  // Flatten all drills for quick lookup by ID
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  drills.forEach((drill) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-100 p-3 space-y-2"; 

    const added = selectedDrillIds.has(drill.id);
    
    const buttonClass = added 
        ? "bg-gray-300 text-gray-800 hover:bg-gray-400" 
        : "bg-emerald-600 text-white hover:bg-emerald-700";

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-gray-800">${drill.name}</h3>
          <p class="text-xs uppercase tracking-wide text-gray-400">${drill.category || drill.subcategory || "N/A"}</p>
        </div>
        <button
          data-id="${drill.id}"
          class="toggle-drill px-3 py-1 text-xs rounded transition ${buttonClass}"
        >
          ${added ? "Added" : "Add"}
        </button>
      </div>
      <p class="text-sm text-gray-700">${drill.description}</p>
      <p class="text-xs text-gray-500">~${drill.duration} min</p>
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

// --- Drills for Practice Log tab (Logging/Scoring List) ---
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

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return; 

    const card = document.createElement("div");
    card.className = "border rounded-lg p-4 bg-white shadow-md"; 

    card.innerHTML = `
      <div class="flex justify-between items-start mb-3 border-b pb-2">
        <h3 class="text-lg font-bold text-gray-800">${drill.name}</h3>
        <button data-id="${drill.id}" class="remove-drill text-red-500 text-xs font-medium hover:underline">
          Remove
        </button>
      </div>
      
      <p class="text-sm text-gray-700 mb-4">${drill.description}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="md:col-span-1">
          <label class="block text-gray-600 mb-1 font-medium">Score / Result</label>
          <input
            type="text"
            class="drill-score-input w-full border border-gray-300 rounded p-2" 
            data-id="${drill.id}"
            placeholder="e.g., 7/10, +5, 14 pts"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-gray-600 mb-1 font-medium">Detailed Notes for Drill</label>
          <input
            type="text"
            class="drill-notes-input w-full border border-gray-300 rounded p-2" 
            data-id="${drill.id}"
            placeholder="Struggled with the low point; tendency to miss right."
          />
        </div>
      </div>
    `;

    container.appendChild(card);
    
    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      const drillId = e.currentTarget.getAttribute("data-id");
      selectedDrillIds.delete(drillId);
      renderSessionDrills(); // Updates the count in the setup tab
      renderSelectedDrills(); // Updates the log tab
    });
  });
}

// --- Drill Library tab (Grouped by Category) ---
function renderDrillLibrary() {
  const container = $("drill-list");
  if (!container) return;

  container.innerHTML = "";

  for (const category in DRILLS) {
    if (DRILLS.hasOwnProperty(category) && DRILLS[category].length > 0) {
        
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "mt-6 mb-3 border-b pb-2 border-gray-300";
      categoryHeader.innerHTML = `
        <h3 class="text-xl font-bold text-gray-700 capitalize">${category.replace(/_/g, ' ')} Drills</h3>
      `;
      container.appendChild(categoryHeader);

      DRILLS[category].forEach((drill) => {
        const card = document.createElement("div");
        card.className = "card border border-gray-100 p-3 space-y-1 hover:border-emerald-500 transition";

        card.innerHTML = `
          <div class="flex justify-between items-center">
            <p class="font-semibold text-gray-800">${drill.name}</p>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
              ${drill.subcategory || category}
            </span>
          </div>
          <p class="text-sm text-gray-600">${drill.description}</p>
          <p class="text-xs text-gray-400">
            Skills: ${drill.skills.join(", ")} | Duration: ~${drill.duration} min
          </p>
        `;

        container.appendChild(card);
      });
    }
  }
}

// --- Save Session ---
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
        score: scoreInput?.value.trim() || "",
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
    document.querySelectorAll(".skill-button.active").forEach(b => b.classList.remove("active"));

    // Switch back to setup tab
    const setupTabBtn = document.querySelector('.tab-button[data-tab="setup"]');
    if (setupTabBtn) setupTabBtn.click();
    
    renderSkills();
    renderSessionDrills();
  });
}

// --- History tab ---
// (No changes needed, function remains as previously provided and functional)
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
          const scorePart = r.score ? ` <span class="font-semibold text-emerald-700">(${r.score})</span>` : "";
          const notePart = r.notes ? ` <span class="italic text-gray-500">— ${r.notes})</span>` : "";
          return `<li><span class="font-medium">${name}</span>${scorePart}${notePart}</li>`;
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