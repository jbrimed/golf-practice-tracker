// ================================
// app.js — ULTIMATE VERSION
// Features: SD Calculator, Randomizer, Drill-Specific Metrics, Analytics, History
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
  CUSTOM: "CUSTOM",
  DISPERSION_CALC: "DISPERSION_CALC" // NEW
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
  if ($("app-modal")) return;

  const modalHtml = `
    <div id="app-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[85vh] overflow-y-auto">
        <button id="modal-close" class="absolute top-4 right-4 text-gray-500 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="modal-title" class="text-xl font-bold mb-2 pr-6 border-b pb-2"></h3>
        <div id="modal-content" class="text-gray-600 text-sm leading-relaxed mt-4"></div>
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
  if (!drill) return "other";
  if (drill.category) {
      const c = drill.category.toLowerCase();
      if (c === 'irons') return 'approach';
      if (c === 'driver') return 'driving';
      if (c === 'short_game') return 'shortgame';
      return c; 
  }
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
  // NEW: Check if drill has an explicit metric override first
  if (drill.metricType) return drill.metricType;

  const firstSkill = drill.skills[0];
  const skill = skillMap.get(firstSkill);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

// ================================
// CALCULATOR HELPERS
// ================================
function calculateSD(values) {
    if (values.length < 2) return 0;
    const n = values.length;
    const mean = values.reduce((a, b) => a + b) / n;
    const variance = values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n;
    return Math.sqrt(variance);
}

// ================================
// HTML GENERATORS
// ================================
function getMetricInputHTML(id, type, drill) {
  // NEW: Randomizer Button logic
  let extraHTML = "";
  if (drill.randomizer) {
      extraHTML = `
        <div class="mb-3 p-3 bg-indigo-50 rounded border border-indigo-100 flex justify-between items-center">
             <span class="text-indigo-900 font-bold text-sm" id="rand-display-${id}">Target: ???</span>
             <button class="roll-btn bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold" 
                data-min="${drill.randomizer.min}" 
                data-max="${drill.randomizer.max}"
                data-target="rand-display-${id}">
                🎲 Roll
             </button>
        </div>
      `;
  }

  switch (type) {
    case METRIC_TYPES.DISPERSION_CALC:
        return extraHTML + `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                <input type="number" class="calc-input input-style px-1 text-center" data-group="${id}">
                <input type="number" class="calc-input input-style px-1 text-center" data-group="${id}">
                <input type="number" class="calc-input input-style px-1 text-center" data-group="${id}">
                <input type="number" class="calc-input input-style px-1 text-center" data-group="${id}">
                <input type="number" class="calc-input input-style px-1 text-center" data-group="${id}">
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded">
                Avg: <span id="calc-avg-${id}">--</span> | SD: <span id="calc-sd-${id}" class="font-bold text-emerald-600">--</span>
            </div>
            <!-- Hidden input to store final result for saving -->
            <input type="hidden" data-id="${id}" class="drill-score-input" />
        `;

    case METRIC_TYPES.PERCENTAGE:
      return extraHTML + `
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score (e.g. 7/10 or 70)</label>
        <input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Made / Attempts" />
      `;
      
    default:
      return extraHTML + `
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score / Result</label>
        <input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Result" />
      `;
  }
}

// ================================
// RENDER — SKILLS & DRILLS
// ================================
function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";
  const groupedSkills = {};
  
  SKILLS.forEach(skill => {
    const cat = skill.category || "Other";
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill);
  });

  Object.keys(groupedSkills).forEach((category, index) => {
    const details = document.createElement("details");
    details.className = "group border border-gray-200 rounded-lg mb-2 overflow-hidden";
    if (index === 0) details.open = true;

    const summary = document.createElement("summary");
    summary.className = "flex items-center justify-between p-3 bg-gray-50 cursor-pointer font-bold text-emerald-900 select-none hover:bg-gray-100 transition";
    summary.innerHTML = `<span>${category}</span><span class="text-emerald-500 group-open:rotate-180 transition-transform">▼</span>`;

    const content = document.createElement("div");
    content.className = "p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border-t border-gray-100";

    groupedSkills[category].forEach(skill => {
        const label = document.createElement("label");
        label.className = "flex items-center space-x-3 p-2 rounded hover:bg-emerald-50 cursor-pointer transition";
        label.innerHTML = `
          <input type="checkbox" class="skill-check h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500" data-skill="${skill.id}">
          <span class="text-gray-700 text-sm font-medium">${skill.label}</span>
        `;
        if (selectedSkills.has(skill.id)) label.querySelector("input").checked = true;
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

function renderDrillSelect() {
  const container = $("drill-select");
  container.innerHTML = "";

  if (selectedSkills.size === 0) {
    container.innerHTML = `
        <div class="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p class="text-gray-500 mb-2">Select skills above to see relevant drills</p>
            <button id="random-session-btn" class="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-indigo-700 transition">🎲 Random Session</button>
        </div>`;
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

          card.innerHTML = `
            <div class="flex-1 w-full">
                <div class="flex items-center gap-2">
                    <h4 class="font-bold text-gray-800">${drill.name}</h4>
                    <button class="info-btn text-gray-400 hover:text-emerald-600" title="View Info">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                    </button>
                </div>
                <div class="flex gap-2 mt-1">
                     <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">⏱ ${drill.duration} min</span>
                </div>
            </div>
            <button data-id="${drill.id}" class="add-drill shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition w-full sm:w-auto ${btnClass}">${btnText}</button>
          `;

          card.querySelector(".add-drill").addEventListener("click", () => {
            if (selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id);
            else selectedDrillIds.add(drill.id);
            renderDrillSelect();
            renderPreviewList(); 
            updateGoToLogButton();
          });

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
    selectedSkills.clear();
    selectedDrillIds.clear();
    const cats = ['driver', 'irons', 'wedges', 'putting'];
    
    cats.forEach(catKey => {
        const drills = DRILLS[catKey];
        if (drills && drills.length > 0) {
            const randomDrill = drills[Math.floor(Math.random() * drills.length)];
            selectedDrillIds.add(randomDrill.id);
            randomDrill.skills.forEach(s => selectedSkills.add(s));
        }
    });

    renderSkills();
    renderDrillSelect();
    renderPreviewList();
    updateGoToLogButton();
    alert("Random session generated!");
}

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
        return;
    }

    previewContainer.classList.remove("hidden");
    let html = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-indigo-900">Session Plan (${selectedDrillIds.size})</h3>
            <button class="text-xs text-indigo-600 hover:text-indigo-900 font-bold" id="clear-all-btn">Clear All</button>
        </div>
        <ul class="space-y-2">`;
    
    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        html += `
            <li class="flex justify-between items-center bg-white p-2 rounded border border-indigo-100 shadow-sm">
                <span class="text-sm font-medium text-gray-800">${drill.name}</span>
                <button class="text-red-400 hover:text-red-600" data-id="${id}">✕</button>
            </li>`;
    });
    html += `</ul>`;
    previewContainer.innerHTML = html;

    previewContainer.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            selectedDrillIds.delete(e.currentTarget.dataset.id);
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
    container.innerHTML = `<p class="text-center text-gray-500">No drills selected.</p>`;
    return;
  }

  Array.from(selectedDrillIds).forEach(id => {
    const drill = allDrillsMap.get(id);
    const metric = getDrillMetric(drill);
    const card = document.createElement("div");
    card.className = "card border-l-4 border-black";

    card.innerHTML = `
      <div class="mb-3">
          <h3 class="text-lg font-bold">${drill.name}</h3>
          <div class="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
             <strong class="block text-gray-900 mb-1 text-xs uppercase tracking-wide">Instructions / Scoring</strong>
             ${drill.description}
          </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            ${getMetricInputHTML(id, metric, drill)}
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
            <textarea data-id="${id}" class="drill-notes-input input-style w-full h-10 resize-none py-2" placeholder="Feel, miss pattern..."></textarea>
          </div>
      </div>
    `;

    container.appendChild(card);
    
    // ATTACH LISTENERS FOR SPECIAL METRICS
    
    // 1. Randomizer Button
    const rollBtn = card.querySelector(".roll-btn");
    if (rollBtn) {
        rollBtn.addEventListener("click", (e) => {
            const min = parseInt(e.target.dataset.min);
            const max = parseInt(e.target.dataset.max);
            const range = max - min + 1;
            const rand = Math.floor(Math.random() * range) + min;
            document.getElementById(e.target.dataset.target).innerText = `Target: ${rand}y`;
        });
    }

    // 2. Calculator Logic
    if (metric === METRIC_TYPES.DISPERSION_CALC) {
        const inputs = card.querySelectorAll(`.calc-input[data-group="${id}"]`);
        inputs.forEach(input => {
            input.addEventListener("input", () => {
                const values = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
                
                if (values.length > 0) {
                    const sum = values.reduce((a, b) => a + b, 0);
                    const avg = sum / values.length;
                    const sd = calculateSD(values);
                    
                    document.getElementById(`calc-avg-${id}`).innerText = avg.toFixed(1);
                    document.getElementById(`calc-sd-${id}`).innerText = sd.toFixed(2);
                    
                    // Update hidden input for saving
                    card.querySelector(`.drill-score-input[data-id="${id}"]`).value = sd.toFixed(2);
                }
            });
        });
    }
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

      if (raw.includes("/")) {
          const parts = raw.split("/");
          if (parts.length === 2 && parseFloat(parts[1]) !== 0) {
              numeric = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
          }
      } else {
          const match = raw.match(/[-+]?\d*\.?\d+/);
          if (match) numeric = parseFloat(match[0]);
      }

      return {
        id,
        name: allDrillsMap.get(id)?.name,
        score: { raw, numeric },
        notes: notesInput.value.trim()
      };
    });

    const session = {
      id: Date.now().toString(),
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

  sessions.slice().reverse().forEach((s) => {
    const div = document.createElement("div");
    div.className = "card relative hover:shadow-lg transition cursor-pointer border border-transparent hover:border-gray-200";
    div.innerHTML = `
      <div class="flex justify-between items-start pointer-events-none">
          <div><h3 class="font-bold text-lg">${s.date} @ ${s.location}</h3><p class="text-sm text-gray-800">${s.drills ? s.drills.length : 0} drills</p></div>
          <button class="delete-btn pointer-events-auto text-red-400 hover:text-red-600 p-1" title="Delete">✕</button>
      </div>
    `;
    div.addEventListener("click", (e) => { if (!e.target.closest('.delete-btn')) showSessionDetails(s); });
    div.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if(confirm("Delete?")) deleteSession(s);
    });
    container.appendChild(div);
  });
}

function showSessionDetails(session) {
    let content = `<h4 class="font-bold mb-2">Drill Breakdown</h4><div class="space-y-3">`;
    if (session.drillResults) {
        session.drillResults.forEach(res => {
            content += `<div class="border-b pb-2"><div class="flex justify-between"><span class="font-semibold">${res.name}</span><span class="font-mono font-bold bg-emerald-50 px-2 rounded">${res.score.raw}</span></div></div>`;
        });
    }
    content += `</div>`;
    showModal("Session Details", content);
}

function deleteSession(sessionToDelete) {
    const sessions = loadSessions();
    const newSessions = sessions.filter(s => s.id !== sessionToDelete.id && s.createdAt !== sessionToDelete.createdAt);
    localStorage.setItem("golf_sessions", JSON.stringify(newSessions));
    renderHistory(); renderAnalytics();
}

// ================================
// ANALYTICS (GROUPED)
// ================================
function renderAnalytics() {
  const container = $("analytics-container");
  const sessions = loadSessions();
  if (!sessions.length) { container.innerHTML = "<p>No data recorded yet.</p>"; return; }

  const drillStats = {};
  sessions.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(session => {
    if (!session.drillResults) return;
    session.drillResults.forEach(result => {
      if (result.score && result.score.numeric !== null) {
        if (!drillStats[result.id]) drillStats[result.id] = { name: result.name, dataPoints: [] };
        drillStats[result.id].dataPoints.push({ date: session.date, score: result.score.numeric });
      }
    });
  });

  const groupedStats = {};
  Object.keys(drillStats).forEach(id => {
      const drill = allDrillsMap.get(id);
      const catKey = detectCategory(drill || {id});
      if (!groupedStats[catKey]) groupedStats[catKey] = [];
      groupedStats[catKey].push({ id, ...drillStats[id] });
  });

  container.innerHTML = "";
  Object.keys(CATEGORIES).forEach((catKey, index) => {
      const categoryDrills = groupedStats[catKey];
      if (!categoryDrills) return;
      const details = document.createElement("details");
      details.className = "group border border-gray-200 rounded-lg mb-4 bg-white shadow-sm";
      if (index === 0) details.open = true;
      details.innerHTML = `<summary class="p-4 font-bold cursor-pointer select-none">${CATEGORIES[catKey]}</summary>`;
      const content = document.createElement("div");
      content.className = "p-4 space-y-6 border-t";
      
      categoryDrills.forEach(data => {
          const scores = data.dataPoints.map(dp => dp.score);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const canvasId = `chart-${data.id}`;
          content.innerHTML += `
            <div class="bg-gray-50 rounded p-4">
                <h4 class="font-bold">${data.name} <span class="text-xs bg-amber-100 px-2 rounded ml-2">Best: ${Math.max(...scores).toFixed(1)}</span></h4>
                <div class="h-40 w-full bg-white mt-2 rounded p-2"><canvas id="${canvasId}"></canvas></div>
            </div>`;
      });
      details.appendChild(content);
      container.appendChild(details);
  });

  setTimeout(() => {
      Object.keys(drillStats).forEach(id => {
          const canvas = document.getElementById(`chart-${id}`);
          if (canvas && window.Chart) {
              new Chart(canvas.getContext('2d'), {
                  type: 'line',
                  data: {
                      labels: drillStats[id].dataPoints.map(dp => dp.date.substring(5)),
                      datasets: [{ data: drillStats[id].dataPoints.map(dp => dp.score), borderColor: '#059669', tension: 0.3 }]
                  },
                  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
              });
          }
      });
  }, 100);
}

// ================================
// INIT
// ================================
function switchTab(tabId) {
    document.querySelectorAll(".tab-pane").forEach(x => x.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(x => x.classList.remove("active"));
    document.getElementById(tabId).classList.remove("hidden");
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add("active");
    if (tabId === "history") renderHistory();
    if (tabId === "analytics") renderAnalytics();
    if (tabId === "log") renderSelectedDrills();
    window.scrollTo(0,0);
}

function init() {
  createModal(); renderSkills(); renderDrillSelect(); renderPreviewList(); initSaveSession();
  document.querySelectorAll(".tab-button").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  const btn = $("go-to-log");
  if (btn) btn.addEventListener("click", () => { if(selectedDrillIds.size > 0) switchTab("log"); else alert("Select drills first."); });
}

init();