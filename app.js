// app.js - main client logic (FIXED)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();

// --- Tabs ---
function initTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabs.forEach((b) => b.classList.remove("active"));
      panes.forEach((p) => p.classList.add("hidden"));

      btn.classList.add("active");
      document.getElementById(target).classList.remove("hidden");

      if (target === "history") {
        renderHistory();
      } else if (target === "drills") {
        renderDrillLibrary();
      }
    });
  });

  // Default to session tab
  const defaultTab = document.querySelector('.tab-button[data-tab="session"]');
  if (defaultTab) {
    defaultTab.classList.add("active");
  }
  const sessionPane = document.getElementById("session");
  if (sessionPane) {
    sessionPane.classList.remove("hidden");
  }
}

// --- Skills UI ---
function renderSkills() {
  const container = $("skill-select");
  if (!container) return;

  container.innerHTML = "";

  SKILLS.forEach((skill) => {
    const wrapper = document.createElement("label");
    // Updated class names for better alignment and interaction
    wrapper.className = "flex items-center space-x-2 text-sm text-gray-700 hover:text-emerald-600 transition"; 

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = skill.id;
    // Updated class name to be more distinct
    cb.className = "skill-checkbox h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"; 

    cb.addEventListener("change", () => {
      if (cb.checked) selectedSkills.add(skill.id);
      else selectedSkills.delete(skill.id);
      renderSessionDrills();
    });

    const span = document.createElement("span");
    span.textContent = skill.label;

    wrapper.appendChild(cb);
    wrapper.appendChild(span);
    container.appendChild(wrapper);
  });
}

// --- Drill filtering ---
function getFilteredDrills() {
  if (selectedSkills.size === 0) return [];
  
  // FIX: Flatten the DRILLS object (which contains arrays) into a single array
  const allDrills = Object.values(DRILLS).flat();
  
  return allDrills.filter((d) => d.skills.some((s) => selectedSkills.has(s)));
}

// --- Drills for session tab (Selection/Add List) ---
function renderSessionDrills() {
  const container = $("drill-select");
  if (!container) return;

  container.innerHTML = "";

  const drills = getFilteredDrills();
  if (drills.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">Select one or more skills above to see matching drills.</p>';
    renderSelectedDrills();
    return;
  }

  drills.forEach((drill) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-100 p-3 space-y-2"; // Used card styling

    const added = selectedDrillIds.has(drill.id);
    
    // Dynamic button styling for clearer feedback
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
      renderSessionDrills();
    });
  });

  renderSelectedDrills();
}

// --- Drills for session tab (Logging/Scoring List) ---
function renderSelectedDrills() {
  const container = $("selected-drills-log"); // Corrected ID from index.html
  if (!container) return;

  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML =
      '<p class="text-xs text-gray-500 italic">No drills selected yet. They will appear here when added.</p>';
    return;
  }

  // Flatten all drills for quick lookup by ID
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return; // Skip if drill somehow not found

    const card = document.createElement("div");
    card.className = "border rounded-lg p-3 bg-white shadow-sm"; 

    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <p class="text-sm font-bold text-gray-800">${drill.name}</p>
        <button data-id="${drill.id}" class="remove-drill text-red-500 text-xs font-medium hover:underline">
          Remove
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block text-gray-600 mb-1">Score / Result</label>
          <input
            type="text"
            class="drill-score-input w-full border border-gray-300 rounded p-2" 
            data-id="${drill.id}"
            placeholder="e.g., 7/10, +5, 14 pts"
          />
        </div>
        <div>
          <label class="block text-gray-600 mb-1">Drill Notes</label>
          <input
            type="text"
            class="drill-notes-input w-full border border-gray-300 rounded p-2" 
            data-id="${drill.id}"
            placeholder="Patterns, misses, feels..."
          />
        </div>
      </div>
    `;

    container.appendChild(card);
    
    // Add remove listener
    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      const drillId = e.currentTarget.getAttribute("data-id");
      selectedDrillIds.delete(drillId);
      renderSessionDrills(); // Re-render selection list and logging list
    });
  });
}

// --- Drill Library tab (Grouped by Category) ---
function renderDrillLibrary() {
  const container = $("drill-list");
  if (!container) return;

  container.innerHTML = "";

  // DRILLS is grouped by category (driver, irons, etc.)
  for (const category in DRILLS) {
    if (DRILLS.hasOwnProperty(category) && DRILLS[category].length > 0) {
        
      // Create a section header for the category
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
  if (!btn) return;

  // Flatten all drills for quick lookup by ID
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  btn.addEventListener("click", () => {
    const dateInput = $("session-date");
    const locInput = $("session-location");
    const notesInput = $("session-notes");

    const date =
      dateInput && dateInput.value
        ? dateInput.value
        : new Date().toISOString().slice(0, 10);

    const location = locInput ? locInput.value : "unspecified";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (selectedDrillIds.size === 0) {
      alert("Select at least one drill before saving the session.");
      return;
    }

    // Capture results from the current form state
    const drillResults = Array.from(selectedDrillIds).map((id) => {
      // Use querySelector on the document to find the inputs regardless of position
      const scoreInput = document.querySelector(
        `.drill-score-input[data-id="${id}"]`
      );
      const notesInputForDrill = document.querySelector(
        `.drill-notes-input[data-id="${id}"]`
      );
      
      return {
        id,
        name: allDrillsMap.get(id)?.name || id, // Store name for easier history lookup
        score: scoreInput ? scoreInput.value.trim() : "",
        notes: notesInputForDrill ? notesInputForDrill.value.trim() : ""
      };
    });

    const session = {
      date,
      location,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds), // Keep ids as a flat list
      drillResults, // Store detailed results
      notes,
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Session saved.");

    // Reset UI state
    selectedSkills = new Set();
    selectedDrillIds = new Set();
    if (notesInput) notesInput.value = "";
    if (locInput) locInput.value = "net";
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    // Uncheck all skill checkboxes and re-render the session view
    document.querySelectorAll(".skill-checkbox").forEach((cb) => {
      cb.checked = false;
    });

    renderSkills();
    renderSessionDrills();
  });
}

// --- History tab ---
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

  // Map ids to labels for display
  const skillMap = new Map(SKILLS.map((s) => [s.id, s.label]));
  
  // Flatten all drills for quick lookup by ID/name
  const drillMap = new Map(Object.values(DRILLS).flat().map((d) => [d.id, d.name]));

  sessions.forEach((session) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-200 space-y-2";

    const dateStr = new Date(session.date || session.createdAt).toLocaleDateString();

    const skillLabels = (session.skills || []).map(
      (id) => skillMap.get(id) || id
    );

    let drillSectionHtml = "";
    // Prioritize drillResults (which contains score/notes)
    if (session.drillResults && session.drillResults.length > 0) {
      const items = session.drillResults
        .map((r) => {
          // Use name from drillResults if available (saved during initSaveSession), otherwise look up via ID
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
      // Fallback for old sessions or if drillResults structure is missing
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

  initSaveSession();
}

document.addEventListener("DOMContentLoaded", init);