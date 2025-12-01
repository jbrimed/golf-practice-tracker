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
  if (drill.category) return drill.category;

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
// RENDER — DRILL SELECTION (With Toggle)
// ================================
function renderDrillSelect() {
  const container = $("drill-select");
  container.innerHTML = "";

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
      
      const isAdded = selectedDrillIds.has(drill.id);
      
      // UX: Toggle Button Styles
      const btnClass = isAdded ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800";
      const btnText = isAdded ? "Remove" : "Add Drill";

      card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h4 class="text-lg font-bold">${drill.name}</h4>
                <p class="text-sm text-gray-600 mb-2">${drill.description}</p>
            </div>
        </div>
        <button data-id="${drill.id}" class="add-drill text-white px-4 py-2 rounded-lg text-sm mt-2 transition ${btnClass}">
          ${btnText}
        </button>
      `;

      card.querySelector(".add-drill").addEventListener("click", () => {
        if (selectedDrillIds.has(drill.id)) {
            selectedDrillIds.delete(drill.id);
        } else {
            selectedDrillIds.add(drill.id);
        }
        
        // Re-render everything to update UI states
        renderDrillSelect();
        renderPreviewList(); 
        updateGoToLogButton();
      });

      groupDiv.appendChild(card);
    });
  });
}

// ================================
// RENDER — PREVIEW LIST (New Feature)
// ================================
function renderPreviewList() {
    let previewContainer = $("preview-container");
    
    // Create container if it doesn't exist (Injected purely via JS)
    if (!previewContainer) {
        const setupSection = $("setup");
        const goToLogBtn = $("go-to-log");
        
        previewContainer = document.createElement("div");
        previewContainer.id = "preview-container";
        previewContainer.className = "card bg-gray-50 border border-gray-200 mb-6 hidden"; // Hidden by default
        
        // Insert before the big button
        setupSection.insertBefore(previewContainer, goToLogBtn);
    }

    if (selectedDrillIds.size === 0) {
        previewContainer.classList.add("hidden");
        previewContainer.innerHTML = "";
        return;
    }

    previewContainer.classList.remove("hidden");
    let html = `<h3 class="font-bold text-gray-800 mb-2">Selected Drills (${selectedDrillIds.size})</h3><ul class="space-y-2">`;
    
    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        html += `
            <li class="flex justify-between items-center bg-white p-2 rounded border">
                <span class="text-sm font-medium">${drill.name}</span>
                <button class="text-red-500 text-xs font-bold uppercase hover:text-red-700 remove-preview-item" data-id="${id}">Remove</button>
            </li>
        `;
    });
    html += `</ul>`;
    
    previewContainer.innerHTML = html;

    // Add listeners to small remove buttons
    previewContainer.querySelectorAll(".remove-preview-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            selectedDrillIds.delete(id);
            renderDrillSelect();
            renderPreviewList();
            updateGoToLogButton();
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
      // Update the other tab views too
      renderDrillSelect();
      renderPreviewList();
    });

    container.appendChild(card);
  });
}

// ================================
// BUTTON — UPDATE COUNT
// ================================
function updateGoToLogButton() {
  const btn = $("go-to-log");
  if (selectedDrillIds.size === 0) {
      btn.innerText = "Go to Practice Log (0 Drills)";
      btn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
      btn.innerText = `Start Practice (${selectedDrillIds.size} Drills)`;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
  }
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
    
    // Reset Logic
    selectedDrillIds.clear();
    renderSelectedDrills();
    renderDrillSelect();
    renderPreviewList();
    updateGoToLogButton();
    $("session-notes").value = "";
    
    // Go back to setup or stay? Let's go to history
    switchTab("history");
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

  sessions.slice().reverse().forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    
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
// ANALYTICS
// ================================
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();

  if (!sessions.length) {
    container.innerHTML = "<p>No data recorded yet.</p>";
    return;
  }

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
// TABS HELPER
// ================================
function switchTab(tabId) {
    // Hide all panes
    document.querySelectorAll(".tab-pane").forEach(x => x.classList.add("hidden"));
    // Deactivate all buttons
    document.querySelectorAll(".tab-button").forEach(x => x.classList.remove("active"));

    // Show target pane
    const targetPane = document.getElementById(tabId);
    if(targetPane) targetPane.classList.remove("hidden");

    // Activate target button
    const targetBtn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if(targetBtn) targetBtn.classList.add("active");

    // Run tab specific render logic
    if (tabId === "history") renderHistory();
    if (tabId === "analytics") renderAnalytics();
    if (tabId === "log") renderSelectedDrills();
    
    window.scrollTo(0,0);
}

function initTabs() {
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });
}

// ================================
// INIT
// ================================
function init() {
  renderSkills();
  renderDrillSelect();
  renderPreviewList(); // Initialize empty preview
  initSaveSession();
  initTabs();

  // FIX: Robust Button Listener
  const goToLogBtn = $("go-to-log");
  if (goToLogBtn) {
      goToLogBtn.addEventListener("click", () => {
         if(selectedDrillIds.size > 0) {
             switchTab("log");
         } else {
             alert("Please select at least one drill first.");
         }
      });
  }
}

init();