// ================================
// app.js — ULTIMATE VERSION
// Features: Collapsible, Modals, Charts, Randomizer, Delete History
// ================================

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// ----------------------
// LOAD CHART.JS DYNAMICALLY
// ----------------------
(function loadChartJs() {
  if (!document.getElementById("chartjs-script")) {
    const script = document.createElement("script");
    script.id = "chartjs-script";
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    document.head.appendChild(script);
  }
})();

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
// UI COMPONENTS (MODAL)
// ================================
function createModal() {
  if ($("app-modal")) return; // Already exists

  const modalHtml = `
    <div id="app-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button id="modal-close" class="absolute top-4 right-4 text-gray-500 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="modal-title" class="text-xl font-bold mb-2 pr-6"></h3>
        <div id="modal-content" class="text-gray-600 text-sm leading-relaxed"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  $("modal-close").addEventListener("click", closeModal);
  $("app-modal").addEventListener("click", (e) => {
    if (e.target.id === "app-modal") closeModal();
  });
}

function showModal(title, content) {
  $("modal-title").innerText = title;
  $("modal-content").innerHTML = content;
  $("app-modal").classList.remove("hidden");
}

function closeModal() {
  $("app-modal").classList.add("hidden");
}

// ================================
// CORE LOGIC
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
  return "other";
}

function getDrillMetric(drill) {
  const firstSkill = drill.skills[0];
  const skill = skillMap.get(firstSkill);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

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
// RENDER — SKILL SELECT (COLLAPSIBLE)
// ================================
function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";

  // Group skills
  const groupedSkills = {};
  SKILLS.forEach(skill => {
    const cat = skill.category || "Other";
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill);
  });

  // Render collapsible sections
  Object.keys(groupedSkills).forEach((category, index) => {
    const details = document.createElement("details");
    details.className = "group border border-gray-200 rounded-lg mb-2 overflow-hidden";
    // Open the first one by default
    if (index === 0) details.open = true;

    const summary = document.createElement("summary");
    summary.className = "flex items-center justify-between p-3 bg-gray-50 cursor-pointer font-bold text-emerald-900 select-none hover:bg-gray-100 transition";
    summary.innerHTML = `
      <span>${category}</span>
      <span class="text-emerald-500 group-open:rotate-180 transition-transform">▼</span>
    `;

    const content = document.createElement("div");
    content.className = "p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border-t border-gray-100";

    groupedSkills[category].forEach(skill => {
        const label = document.createElement("label");
        label.className = "flex items-center space-x-3 p-2 rounded hover:bg-emerald-50 cursor-pointer transition";
        label.innerHTML = `
          <input type="checkbox" class="skill-check h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500" data-skill="${skill.id}">
          <span class="text-gray-700 text-sm font-medium">${skill.label}</span>
        `;
        
        // Sync state if re-rendering
        if (selectedSkills.has(skill.id)) {
            label.querySelector("input").checked = true;
        }

        label.querySelector("input").addEventListener("change", (e) => {
          if (e.target.checked) selectedSkills.add(skill.id);
          else selectedSkills.delete(skill.id);
          renderDrillSelect();
        });

        content.appendChild(label);
    });

    details.appendChild(summary);
    details.appendChild(content);
    container.appendChild(details);
  });
}

// ================================
// RENDER — DRILL SELECT (INFO MODALS)
// ================================
function renderDrillSelect() {
  const container = $("drill-select");
  container.innerHTML = "";

  if (selectedSkills.size === 0) {
    container.innerHTML = `
        <div class="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p class="text-gray-500 mb-2">Select skills above to see relevant drills</p>
            <span class="text-xs text-gray-400">OR</span>
            <button id="random-session-btn" class="mt-2 block mx-auto bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-indigo-700 transition">
                🎲 Random Session
            </button>
        </div>
    `;
    
    // Bind Random Button
    const randBtn = $("random-session-btn");
    if(randBtn) randBtn.addEventListener("click", generateRandomSession);
    return;
  }

  const activeSkills = SKILLS.filter(s => selectedSkills.has(s.id));
  const allDrills = Object.values(DRILLS).flat();

  activeSkills.forEach(skill => {
      const matchingDrills = allDrills.filter(d => d.skills.includes(skill.id));
      if (matchingDrills.length === 0) return;

      const section = document.createElement("div");
      section.className = "mb-6";
      section.innerHTML = `
        <h3 class="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 mb-3 bg-emerald-50 py-1 rounded-r">
            ${skill.category} — ${skill.label}
        </h3>
        <div class="space-y-3" id="skill-group-${skill.id}"></div>
      `;

      container.appendChild(section);
      const groupDiv = section.querySelector(`#skill-group-${skill.id}`);

      matchingDrills.forEach(drill => {
          const card = document.createElement("div");
          card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between";
          
          const isAdded = selectedDrillIds.has(drill.id);
          const btnClass = isAdded ? "bg-red-50 text-red-600 border border-red-200" : "bg-black text-white border border-black";
          const btnText = isAdded ? "Remove" : "Add";

          // MODAL TRIGGER: The (i) button
          card.innerHTML = `
            <div class="flex-1 w-full">
                <div class="flex items-center gap-2">
                    <h4 class="font-bold text-gray-800">${drill.name}</h4>
                    <button class="info-btn text-gray-400 hover:text-emerald-600 transition" title="View Info">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div class="flex gap-2 mt-1">
                     <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">⏱ ${drill.duration} min</span>
                </div>
            </div>
            
            <button data-id="${drill.id}" class="add-drill shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition w-full sm:w-auto ${btnClass}">
              ${btnText}
            </button>
          `;

          // Button Logic
          card.querySelector(".add-drill").addEventListener("click", () => {
            if (selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id);
            else selectedDrillIds.add(drill.id);
            renderDrillSelect();
            renderPreviewList(); 
            updateGoToLogButton();
          });

          // Info Logic
          card.querySelector(".info-btn").addEventListener("click", () => {
              showModal(drill.name, `<p>${drill.description}</p><br><p class='text-xs text-gray-400'>Category: ${detectCategory(drill)}</p>`);
          });

          groupDiv.appendChild(card);
      });
  });
}

// ================================
// RANDOMIZER
// ================================
function generateRandomSession() {
    // Clear current
    selectedSkills.clear();
    selectedDrillIds.clear();
    
    // Pick one from each major category if available
    const cats = ['driver', 'irons', 'wedges', 'putting'];
    
    cats.forEach(catKey => {
        const drills = DRILLS[catKey];
        if (drills && drills.length > 0) {
            const randomDrill = drills[Math.floor(Math.random() * drills.length)];
            
            // Add the drill
            selectedDrillIds.add(randomDrill.id);
            
            // Add its skills so the UI knows what to expand
            randomDrill.skills.forEach(s => selectedSkills.add(s));
        }
    });

    // Update UI
    renderSkills(); // Opens relevant accordion items
    renderDrillSelect();
    renderPreviewList();
    updateGoToLogButton();
    
    alert("Random session generated! Click 'Start Practice' when ready.");
}

// ================================
// RENDER — PREVIEW LIST
// ================================
function renderPreviewList() {
    let previewContainer = $("preview-container");
    if (!previewContainer) {
        const setupSection = $("setup");
        const goToLogBtn = $("go-to-log");
        previewContainer = document.createElement("div");
        previewContainer.id = "preview-container";
        previewContainer.className = "card bg-indigo-50 border border-indigo-100 mb-6 hidden"; 
        setupSection.insertBefore(previewContainer, goToLogBtn);
    }

    if (selectedDrillIds.size === 0) {
        previewContainer.classList.add("hidden");
        previewContainer.innerHTML = "";
        return;
    }

    previewContainer.classList.remove("hidden");
    let html = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-indigo-900">Session Plan (${selectedDrillIds.size})</h3>
            <button class="text-xs text-indigo-600 hover:text-indigo-900 font-bold" id="clear-all-btn">Clear All</button>
        </div>
        <ul class="space-y-2">
    `;
    
    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        html += `
            <li class="flex justify-between items-center bg-white p-2 rounded border border-indigo-100 shadow-sm">
                <span class="text-sm font-medium text-gray-800">${drill.name}</span>
                <button class="text-red-400 hover:text-red-600" data-id="${id}">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
            </li>
        `;
    });
    html += `</ul>`;
    
    previewContainer.innerHTML = html;

    previewContainer.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id; // currentTarget handles svg clicks
            selectedDrillIds.delete(id);
            renderDrillSelect();
            renderPreviewList();
            updateGoToLogButton();
        });
    });
    
    $("clear-all-btn").addEventListener("click", () => {
        selectedDrillIds.clear();
        selectedSkills.clear();
        renderSkills();
        renderDrillSelect();
        renderPreviewList();
        updateGoToLogButton();
    });
}

// ================================
// LOGGING & SAVING
// ================================
function renderSelectedDrills() {
  const container = $("selected-drills-log");
  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML = `<p class="text-center text-gray-500">No drills selected. Go to "New Session" to add some!</p>`;
    return;
  }

  Array.from(selectedDrillIds).forEach(id => {
    const drill = allDrillsMap.get(id);
    const metric = getDrillMetric(drill);

    const card = document.createElement("div");
    card.className = "card border-l-4 border-black"; // Distinct look for log

    card.innerHTML = `
      <div class="flex justify-between">
          <h3 class="text-lg font-bold mb-2">${drill.name}</h3>
          <button class="info-btn text-gray-400 hover:text-emerald-600" title="Drill Description">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase">Score / Result</label>
            ${getMetricInputHTML(id, metric)}
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase">Notes</label>
            <textarea data-id="${id}" class="drill-notes-input input-style w-full h-10 resize-none py-2" placeholder="Feel, miss pattern..."></textarea>
          </div>
      </div>
    `;

    card.querySelector(".info-btn").addEventListener("click", () => {
        showModal(drill.name, `<p>${drill.description}</p>`);
    });

    container.appendChild(card);
  });
}

function updateGoToLogButton() {
  const btn = $("go-to-log");
  if (selectedDrillIds.size === 0) {
      btn.innerText = "Start Practice (0 Drills)";
      btn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
      btn.innerText = `Start Practice (${selectedDrillIds.size} Drills)`;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

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
      id: Date.now().toString(), // Added ID for deletion
      date: $("session-date").value || new Date().toISOString().slice(0, 10),
      location: $("session-location").value,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds),
      drillResults,
      notes: $("session-notes").value.trim(),
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Session saved!");
    
    // Reset
    selectedDrillIds.clear();
    selectedSkills.clear();
    renderSkills();
    renderDrillSelect();
    renderPreviewList();
    updateGoToLogButton();
    $("session-notes").value = "";
    
    switchTab("history");
  });
}

// ================================
// HISTORY (WITH DELETE)
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
  sessions.slice().reverse().forEach((s, index) => {
    // Note: s is the session, index is the reversed index. 
    // To delete safely, we filter by ID (if it exists) or use the original index.
    // For now, we will manipulate the underlying array directly for deletion.
    
    const div = document.createElement("div");
    div.className = "card relative";
    
    const drillsCount = s.drills ? s.drills.length : 0;
    const notesSnippet = s.notes ? `<p class="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">"${s.notes}"</p>` : "";
    
    // Calculate best drill of session (just for info)
    const bestResult = s.drillResults ? s.drillResults.find(r => r.score.numeric !== null) : null;
    const bestText = bestResult ? `<span class="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Recorded Data</span>` : "";

    div.innerHTML = `
      <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg">${s.date} <span class="text-gray-400 font-normal">@</span> ${s.location}</h3>
            <p class="text-sm text-gray-800">${drillsCount} drills completed ${bestText}</p>
          </div>
          <button class="delete-btn text-red-400 hover:text-red-600 p-1" title="Delete Session">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
      </div>
      ${notesSnippet}
    `;
    
    // Delete Logic
    div.querySelector(".delete-btn").addEventListener("click", () => {
        if(confirm("Are you sure you want to delete this session?")) {
            deleteSession(s);
        }
    });

    container.appendChild(div);
  });
}

function deleteSession(sessionToDelete) {
    // We have to access localStorage directly here to bypass storage.js limitations without editing it
    const sessions = loadSessions();
    // Filter out the session. 
    // If it has an ID, use it. If not, match by date/createdAt (legacy support)
    const newSessions = sessions.filter(s => {
        if (sessionToDelete.id && s.id) return s.id !== sessionToDelete.id;
        return s.createdAt !== sessionToDelete.createdAt;
    });
    
    localStorage.setItem("golf_sessions", JSON.stringify(newSessions));
    renderHistory(); // Refresh UI
    renderAnalytics(); // Refresh Analytics
}

// ================================
// ANALYTICS (TREND GRAPHS & PB)
// ================================
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();

  if (!sessions.length) {
    container.innerHTML = "<p>No data recorded yet.</p>";
    return;
  }

  // 1. Group scores
  const drillStats = {};

  // Sort sessions chronological for charts
  const chronSessions = sessions.slice().sort((a,b) => new Date(a.date) - new Date(b.date));

  chronSessions.forEach(session => {
    if (!session.drillResults) return;
    session.drillResults.forEach(result => {
      if (result.score && result.score.numeric !== null) {
        if (!drillStats[result.id]) {
          drillStats[result.id] = { 
              name: result.name, 
              dataPoints: [] 
          };
        }
        drillStats[result.id].dataPoints.push({
            date: session.date,
            score: result.score.numeric
        });
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
    const scores = data.dataPoints.map(dp => dp.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores); // PB
    
    const card = document.createElement("div");
    card.className = "card mb-6";
    
    // Canvas ID must be unique
    const canvasId = `chart-${id}`;

    card.innerHTML = `
      <div class="flex justify-between items-baseline mb-4 border-b pb-2">
        <h3 class="font-bold text-lg">${data.name}</h3>
        <span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">PB: ${max}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-4 text-center mb-4">
        <div class="bg-gray-50 p-2 rounded">
           <span class="block text-xs text-gray-500 uppercase">Average</span>
           <span class="text-xl font-mono font-bold">${avg.toFixed(1)}</span>
        </div>
        <div class="bg-gray-50 p-2 rounded">
           <span class="block text-xs text-gray-500 uppercase">Attempts</span>
           <span class="text-xl font-mono font-bold">${scores.length}</span>
        </div>
      </div>
      
      <div class="h-48 w-full">
         <canvas id="${canvasId}"></canvas>
      </div>
    `;
    container.appendChild(card);

    // Render Chart (if library loaded)
    if (window.Chart) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dataPoints.map(dp => dp.date.substring(5)), // Show MM-DD
                datasets: [{
                    label: 'Score',
                    data: scores,
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true } // Assuming scores are positive
                }
            }
        });
    }
  });
}

// ================================
// TABS
// ================================
function switchTab(tabId) {
    document.querySelectorAll(".tab-pane").forEach(x => x.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(x => x.classList.remove("active"));

    const targetPane = document.getElementById(tabId);
    if(targetPane) targetPane.classList.remove("hidden");

    const targetBtn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if(targetBtn) targetBtn.classList.add("active");

    if (tabId === "history") renderHistory();
    if (tabId === "analytics") renderAnalytics();
    if (tabId === "log") renderSelectedDrills();
    
    window.scrollTo(0,0);
}

function initTabs() {
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

// ================================
// INIT
// ================================
function init() {
  createModal(); // Setup modal DOM
  renderSkills();
  renderDrillSelect(); // Will show "Select skills" empty state
  renderPreviewList(); 
  initSaveSession();
  initTabs();

  // Robust Button Listener
  const goToLogBtn = $("go-to-log");
  if (goToLogBtn) {
      goToLogBtn.addEventListener("click", () => {
         if(selectedDrillIds.size > 0) switchTab("log");
         else alert("Please select or randomize drills first.");
      });
  }
}

init();