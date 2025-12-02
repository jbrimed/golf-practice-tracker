// ================================
// app.js — ULTIMATE VERSION
// Features: RNG Multilog, Smart Scoring, Analytics, Data Backup, Progression
// ================================

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// ----------------------
// CHART LOADER
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
  DISPERSION_CALC: "DISPERSION_CALC",
  RNG_MULTILOG: "RNG_MULTILOG"
};

const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
const skillMap = new Map(SKILLS.map(s => [s.id, s]));

// ================================
// UI COMPONENTS
// ================================
function createModal() {
  if ($("app-modal")) return;
  const modalHtml = `
    <div id="app-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[85vh] overflow-y-auto">
        <button id="modal-close" class="absolute top-4 right-4 text-gray-500 hover:text-black">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 id="modal-title" class="text-xl font-bold mb-2 pr-6 border-b pb-2"></h3>
        <div id="modal-content" class="text-gray-600 text-sm leading-relaxed mt-4"></div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  $("modal-close").addEventListener("click", closeModal);
  $("app-modal").addEventListener("click", (e) => { if (e.target.id === "app-modal") closeModal(); });
}

function showModal(title, content) {
  $("modal-title").innerText = title;
  $("modal-content").innerHTML = content;
  $("app-modal").classList.remove("hidden");
}

function closeModal() { $("app-modal").classList.add("hidden"); }

// ================================
// CORE LOGIC
// ================================
function getDrillMetric(drill) {
  if (drill.metricType) return drill.metricType;
  const firstSkill = drill.skills[0];
  const skill = skillMap.get(firstSkill);
  return skill ? skill.metricType : METRIC_TYPES.CUSTOM;
}

function calculateSD(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length;
    return Math.sqrt(variance);
}

// ================================
// DATA BACKUP (EXPORT/IMPORT)
// ================================
function initDataBackup() {
    if($("backup-section")) return;

    const backupContainer = document.createElement("div");
    backupContainer.id = "backup-section";
    backupContainer.className = "card mt-8 bg-gray-50 border border-gray-200";
    backupContainer.innerHTML = `
        <h3 class="font-bold text-lg mb-2">Data Backup</h3>
        <p class="text-sm text-gray-600 mb-4">Download history or restore from file.</p>
        <div class="flex gap-4">
            <button id="export-btn" class="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-emerald-700">⬇ Export</button>
            <label class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 cursor-pointer text-center">
                ⬆ Import
                <input type="file" id="import-file" class="hidden" accept=".json">
            </label>
        </div>
    `;
    
    const container = $("backup-section-container") || $("history-list");
    if(container) container.appendChild(backupContainer);

    $("export-btn").addEventListener("click", () => {
        const data = localStorage.getItem("golf_sessions");
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `golf_data_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    });

    $("import-file").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const sessions = JSON.parse(event.target.result);
                if(Array.isArray(sessions)) {
                    localStorage.setItem("golf_sessions", JSON.stringify(sessions));
                    alert("Data restored successfully!");
                    renderHistory();
                    renderAnalytics();
                } else {
                    alert("Invalid file format.");
                }
            } catch(err) {
                alert("Error parsing file.");
            }
        };
        reader.readAsText(file);
    });
}

// ================================
// INPUT HTML GENERATOR
// ================================
function getMetricInputHTML(id, type, drill) {
  let extraHTML = "";
  
  if (drill.randomizer && type !== METRIC_TYPES.RNG_MULTILOG) {
      extraHTML = `
        <div class="mb-3 p-3 bg-indigo-50 rounded border border-indigo-100 flex justify-between items-center">
             <span class="text-indigo-900 font-bold text-sm" id="rand-display-${id}">Target: ???</span>
             <button class="roll-btn bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold" 
                data-choices='${JSON.stringify(drill.randomizer.choices || [])}'
                data-min="${drill.randomizer.min}" 
                data-max="${drill.randomizer.max}"
                data-target="rand-display-${id}">🎲 Roll</button>
        </div>`;
  }

  switch (type) {
    case METRIC_TYPES.RNG_MULTILOG:
        return `
            <div class="mb-2">
                <button class="rng-multi-btn w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold mb-2 transition hover:bg-indigo-700"
                    data-id="${id}"
                    data-min="${drill.randomizer.min}"
                    data-max="${drill.randomizer.max}"
                    data-count="${drill.randomizer.count || 5}" 
                    data-shots="${drill.randomizer.shotsPerTarget || 2}">
                    🎲 Generate 5 Targets
                </button>
                <div id="rng-table-${id}" class="hidden bg-gray-50 p-2 rounded text-sm border border-gray-200">
                    <div class="grid grid-cols-3 gap-2 font-bold text-xs text-gray-500 border-b pb-2 mb-2 text-center">
                        <span>TARGET</span>
                        <span>SHOT 1</span>
                        <span>SHOT 2</span>
                    </div>
                    <div id="rng-rows-${id}" class="space-y-2"></div>
                </div>
                <div class="mt-2 text-xs text-right text-gray-500 font-medium">
                    Avg Error: <span id="rng-score-${id}" class="font-bold text-emerald-600 text-sm">--</span> y
                </div>
                <input type="hidden" data-id="${id}" class="drill-score-input" />
            </div>
        `;

    case METRIC_TYPES.DISPERSION_CALC:
        return extraHTML + `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(5).fill(0).map(() => `<input type="number" class="calc-input input-style px-1 text-center font-mono" data-group="${id}">`).join('')}
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded flex justify-between">
                <span>Avg: <strong id="calc-avg-${id}">--</strong></span>
                <span>SD: <strong id="calc-sd-${id}" class="text-emerald-600">--</strong></span>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />
        `;

    case METRIC_TYPES.PERCENTAGE:
      return extraHTML + `<label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score (e.g. 8/10)</label><input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Made / Attempts" />`;
      
    default:
      return extraHTML + `<label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score / Result</label><input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Result" />`;
  }
}

// ================================
// RENDERING & INTERACTIVITY
// ================================
function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";
  const grouped = {};
  SKILLS.forEach(s => { const c = s.category||"Other"; if(!grouped[c]) grouped[c]=[]; grouped[c].push(s); });

  Object.keys(grouped).forEach((cat, i) => {
    const details = document.createElement("details");
    details.className = "group border border-gray-200 rounded-lg mb-2 overflow-hidden";
    if (i === 0) details.open = true;
    details.innerHTML = `<summary class="flex justify-between p-3 bg-gray-50 cursor-pointer font-bold text-emerald-900 select-none hover:bg-gray-100 transition"><span>${cat}</span><span class="text-emerald-500 group-open:rotate-180 transition-transform">▼</span></summary>`;
    const content = document.createElement("div");
    content.className = "p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border-t border-gray-100";
    
    grouped[cat].forEach(skill => {
        const row = document.createElement("label");
        row.className = "flex items-center space-x-3 p-2 rounded hover:bg-emerald-50 cursor-pointer transition";
        row.innerHTML = `<input type="checkbox" class="skill-check h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500" data-skill="${skill.id}"><span class="text-sm font-medium text-gray-700">${skill.label}</span>`;
        if (selectedSkills.has(skill.id)) row.querySelector("input").checked = true;
        row.querySelector("input").addEventListener("change", (e) => {
            if(e.target.checked) selectedSkills.add(skill.id); else selectedSkills.delete(skill.id);
            renderDrillSelect();
        });
        content.appendChild(row);
    });
    details.appendChild(content);
    container.appendChild(details);
  });
}

function renderDrillSelect() {
  const container = $("drill-select");
  const presets = $("presets-container"); // New Reference
  container.innerHTML = "";
  
  // TOGGLE PRESETS LOGIC
  if (selectedSkills.size === 0 && selectedDrillIds.size === 0) {
      if(presets) presets.classList.remove("hidden");
      container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic">Select focus areas above...</div>`;
      return;
  } else {
      if(presets) presets.classList.add("hidden");
  }

  const drillsToShow = Object.values(DRILLS).flat().filter(d => d.skills.some(s => selectedSkills.has(s)));
  
  const skillGroups = {};
  selectedSkills.forEach(sId => {
      const skill = skillMap.get(sId);
      const matches = drillsToShow.filter(d => d.skills.includes(sId));
      if(matches.length) skillGroups[skill.label] = matches;
  });

  Object.keys(skillGroups).forEach(label => {
      const sec = document.createElement("div");
      sec.className = "mb-6";
      sec.innerHTML = `<h3 class="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 mb-3 bg-emerald-50 py-1 rounded-r">${label}</h3><div class="space-y-3" id="grp-${label.replace(/\s/g,'')}"></div>`;
      container.appendChild(sec);
      const grp = sec.querySelector(`div`);
      
      skillGroups[label].forEach(drill => {
          if(grp.querySelector(`[data-card-id="${drill.id}"]`)) return;

          let badge = "";
          if (drill.targetValues?.successThreshold) {
             badge = `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2">Goal: ${drill.targetValues.successThreshold}+</span>`;
          }

          const card = document.createElement("div");
          card.setAttribute("data-card-id", drill.id);
          card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-center";
          const isAdded = selectedDrillIds.has(drill.id);
          card.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <h4 class="font-bold text-gray-800">${drill.name}</h4>
                    ${badge}
                    <button class="info-btn text-gray-400 hover:text-emerald-600 transition">ⓘ</button>
                </div>
                <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">⏱ ${drill.duration}m</span>
            </div>
            <button class="add-drill px-4 py-2 rounded text-sm font-bold transition ${isAdded?'bg-red-50 text-red-600 border border-red-200':'bg-black text-white hover:bg-gray-800'}">${isAdded?'Remove':'Add'}</button>
          `;
          card.querySelector(".add-drill").addEventListener("click", () => {
              if(selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id); else selectedDrillIds.add(drill.id);
              renderDrillSelect(); renderPreviewList(); updateGoToLogButton();
          });
          card.querySelector(".info-btn").addEventListener("click", () => showModal(drill.name, drill.description));
          grp.appendChild(card);
      });
  });
}

function renderPreviewList() {
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
}

// ================================
// LOGGING LOGIC
// ================================
function renderSelectedDrills() {
    const container = $("selected-drills-log");
    container.innerHTML = "";
    if (selectedDrillIds.size === 0) { container.innerHTML = "<p class='text-center text-gray-500'>No drills selected.</p>"; return; }

    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        const metric = getDrillMetric(drill);
        const card = document.createElement("div");
        card.className = "card border-l-4 border-black mb-6";
        
        let goalText = "";
        if (drill.targetValues) {
            if (drill.targetValues.successThreshold) goalText = `<div class="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-1 rounded mt-2 inline-block">🎯 Goal: ${drill.targetValues.successThreshold}/${drill.targetValues.shots}</div>`;
            else if (drill.targetValues.sd_target_yards) goalText = `<div class="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-1 rounded mt-2 inline-block">🎯 Goal: SD < ${drill.targetValues.sd_target_yards}y</div>`;
        }

        card.innerHTML = `
            <div class="mb-3">
                <h3 class="text-lg font-bold">${drill.name}</h3>
                ${goalText}
                <div class="bg-gray-50 p-3 rounded text-sm mt-2 text-gray-700 border border-gray-100">${drill.description}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>${getMetricInputHTML(id, metric, drill)}</div>
                <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label><textarea data-note-id="${id}" class="input-style w-full h-24 resize-none" placeholder="Feel / Miss pattern..."></textarea></div>
            </div>`;
        container.appendChild(card);

        // --- HANDLERS ---
        const rollBtn = card.querySelector(".roll-btn");
        if(rollBtn) {
            rollBtn.addEventListener("click", (e) => {
                const choices = JSON.parse(e.target.dataset.choices);
                if(choices.length) {
                    document.getElementById(e.target.dataset.target).innerText = choices[Math.floor(Math.random()*choices.length)];
                } else {
                    const min = parseInt(e.target.dataset.min), max = parseInt(e.target.dataset.max);
                    document.getElementById(e.target.dataset.target).innerText = "Target: " + (Math.floor(Math.random()*(max-min+1))+min) + "y";
                }
            });
        }

        if(metric === METRIC_TYPES.DISPERSION_CALC) {
            const inputs = card.querySelectorAll(`.calc-input[data-group="${id}"]`);
            inputs.forEach(i => i.addEventListener("input", () => {
                const vals = Array.from(inputs).map(inp => parseFloat(inp.value)).filter(v=>!isNaN(v));
                if(vals.length) {
                    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
                    const sd = calculateSD(vals);
                    document.getElementById(`calc-avg-${id}`).innerText = avg.toFixed(1);
                    document.getElementById(`calc-sd-${id}`).innerText = sd.toFixed(1);
                    card.querySelector(`.drill-score-input`).value = sd.toFixed(2);
                }
            }));
        }

        if(metric === METRIC_TYPES.RNG_MULTILOG) {
            const btn = card.querySelector(".rng-multi-btn");
            const tableContainer = document.getElementById(`rng-table-${id}`);
            const rowsContainer = document.getElementById(`rng-rows-${id}`);
            
            btn.addEventListener("click", () => {
                const min = parseInt(btn.dataset.min), max = parseInt(btn.dataset.max), count = parseInt(btn.dataset.count);
                rowsContainer.innerHTML = ""; 
                for(let i=0; i<count; i++) {
                    const target = Math.floor(Math.random()*(max-min+1)) + min;
                    rowsContainer.innerHTML += `
                        <div class="grid grid-cols-3 gap-2 items-center multi-row" data-target="${target}">
                            <span class="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded text-center">${target}y</span>
                            <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 1">
                            <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 2">
                        </div>`;
                }
                tableContainer.classList.remove("hidden");
                btn.classList.add("hidden"); 
                rowsContainer.querySelectorAll(".multi-inp").forEach(inp => inp.addEventListener("input", calculateMultiError));
            });

            function calculateMultiError() {
                let totalError = 0, shotCount = 0;
                rowsContainer.querySelectorAll(".multi-row").forEach(row => {
                    const target = parseFloat(row.dataset.target);
                    row.querySelectorAll("input").forEach(inp => {
                        const val = parseFloat(inp.value);
                        if(!isNaN(val)) {
                            totalError += Math.abs(val - target);
                            shotCount++;
                        }
                    });
                });
                const avgErr = shotCount ? (totalError/shotCount).toFixed(1) : "--";
                document.getElementById(`rng-score-${id}`).innerText = avgErr;
                card.querySelector(`.drill-score-input`).value = avgErr; 
            }
        }
    });
}

function updateGoToLogButton() {
    const btn = $("go-to-log");
    if(btn) {
        btn.innerText = selectedDrillIds.size ? `Start Practice (${selectedDrillIds.size})` : "Start Practice (0)";
        btn.disabled = selectedDrillIds.size === 0;
        if(selectedDrillIds.size === 0) btn.classList.add("opacity-50"); else btn.classList.remove("opacity-50");
    }
}

function initSaveSession() {
    const saveBtn = $("save-session");
    if(!saveBtn) return;

    saveBtn.addEventListener("click", () => {
        const drillResults = Array.from(selectedDrillIds).map(id => {
            const raw = document.querySelector(`.drill-score-input[data-id="${id}"]`)?.value || "";
            const note = document.querySelector(`textarea[data-note-id="${id}"]`)?.value || "";
            let num = null;
            
            if(raw.includes("/")) {
                const [n, d] = raw.split("/");
                if(d && parseFloat(d)!==0) num = (parseFloat(n)/parseFloat(d))*100;
            } else {
                const match = raw.match(/[\d\.]+/);
                if(match) num = parseFloat(match[0]);
            }

            return { id, name: allDrillsMap.get(id)?.name, score: { raw, numeric: num }, notes: note };
        });

        // Removed location from object
        saveSession({
            id: Date.now().toString(),
            date: $("session-date").value || new Date().toISOString().slice(0,10),
            drills: Array.from(selectedDrillIds),
            drillResults,
            notes: $("session-notes").value,
            createdAt: new Date().toISOString()
        });
        
        alert("Saved!");
        selectedDrillIds.clear(); selectedSkills.clear(); 
        
        // Reset Logic
        renderSkills(); 
        renderDrillSelect(); // Will unhide presets
        renderPreviewList(); 
        updateGoToLogButton();
        
        $("session-notes").value="";
        switchTab("history");
        
        checkProgression(drillResults);
    });
}

// ================================
// INIT & NAVIGATION
// ================================
function generateSessionPreset(type) {
    selectedDrillIds.clear(); selectedSkills.clear();
    
    let cats = [];
    if(type === 'random') cats = ['driver','irons','wedges','putting'];
    if(type === 'shortgame') cats = ['wedges','short_game','putting'];
    if(type === 'driver_iron') cats = ['driver','irons'];
    if(type === 'putting') cats = ['putting'];

    cats.forEach(cat => {
        if(DRILLS[cat]?.length) {
            const d = DRILLS[cat][Math.floor(Math.random()*DRILLS[cat].length)];
            selectedDrillIds.add(d.id);
            d.skills.forEach(s => selectedSkills.add(s));
        }
    });
    renderSkills(); 
    renderDrillSelect(); // This hides presets
    renderPreviewList(); 
    updateGoToLogButton();
}

function generateRandomSession() { generateSessionPreset('random'); }

function checkProgression(results) {
    const passed = results.filter(r => {
        const drill = allDrillsMap.get(r.id);
        if (!drill.targetValues || !r.score.numeric) return false;
        
        if (drill.scoreType === 'count') {
             const goalPct = (drill.targetValues.successThreshold / drill.targetValues.shots) * 100;
             return r.score.numeric >= goalPct;
        }
        if (drill.scoreType === 'sd') {
            return r.score.numeric <= drill.targetValues.sd_target_yards;
        }
        return false;
    });

    if (passed.length > 0) {
        const names = passed.map(p => p.name).join(", ");
        alert(`🎉 Goal Met: ${names}.`);
    }
}

function renderHistory() {
    initDataBackup(); 
    const box = $("history-list");
    const existingBackup = $("backup-section");
    box.innerHTML = ""; 
    if(existingBackup) box.appendChild(existingBackup);

    const sessions = loadSessions();
    if (!sessions.length) { 
        const p = document.createElement("p");
        p.innerText = "No history.";
        box.appendChild(p);
        return; 
    }

    sessions.slice().reverse().forEach(s => {
        const div = document.createElement("div");
        div.className = "card mb-4 relative hover:shadow-md cursor-pointer border border-transparent hover:border-gray-200";
        div.innerHTML = `<div class="font-bold">${s.date}</div><div class="text-sm text-gray-600">${s.drills.length} drills</div><button class="del-btn absolute top-4 right-4 text-red-400 hover:text-red-600 p-2">✕</button>`;
        div.addEventListener("click", (e) => { if(!e.target.classList.contains("del-btn")) showSessionDetails(s); });
        div.querySelector(".del-btn").addEventListener("click", () => {
            if(confirm("Delete?")) {
                const newS = loadSessions().filter(x => x.id !== s.id);
                localStorage.setItem("golf_sessions", JSON.stringify(newS));
                renderHistory(); renderAnalytics();
            }
        });
        box.appendChild(div);
    });
}

function showSessionDetails(s) {
    let h = `<div class="space-y-2">`;
    s.drillResults.forEach(r => h += `<div class="flex justify-between border-b pb-1"><span>${r.name}</span><span class="font-mono bg-emerald-100 px-2 rounded font-bold">${r.score.raw||"-"}</span></div>`);
    showModal("Session Details", h + "</div>");
}

function renderAnalytics() {
    const box = $("analytics-container");
    const data = {};
    loadSessions().sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s => {
        s.drillResults.forEach(r => {
            if(r.score.numeric !== null) {
                if(!data[r.id]) data[r.id] = { name: r.name, pts: [], targets: [] };
                data[r.id].pts.push(r.score.numeric);
                
                const drill = allDrillsMap.get(r.id);
                let target = null;
                if(drill?.targetValues?.successThreshold) target = (drill.targetValues.successThreshold / drill.targetValues.shots) * 100;
                else if(drill?.targetValues?.sd_target_yards) target = drill.targetValues.sd_target_yards;
                else if(drill?.targetValues?.tolerance_yards) target = drill.targetValues.tolerance_yards;
                
                data[r.id].targets.push(target);
            }
        });
    });
    
    if(!Object.keys(data).length) { box.innerHTML = "<p>No data recorded yet.</p>"; return; }
    box.innerHTML = "";
    
    Object.keys(data).forEach(id => {
        const d = data[id];
        const avg = (d.pts.reduce((a,b)=>a+b,0)/d.pts.length).toFixed(1);
        const cid = `c-${id}`;
        box.innerHTML += `<div class="card mb-4"><div class="flex justify-between mb-2 font-bold"><span>${d.name}</span><span class="bg-gray-100 px-2 rounded text-sm">Avg: ${avg}</span></div><div class="h-32"><canvas id="${cid}"></canvas></div></div>`;
        setTimeout(() => {
            const datasets = [{ data: d.pts, borderColor: '#059669', tension:0.3, pointRadius:3 }];
            if (d.targets.some(t => t !== null)) {
                datasets.push({
                    data: d.targets,
                    borderColor: '#f87171',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    label: 'Goal'
                });
            }

            new Chart(document.getElementById(cid), {
                type: 'line',
                data: { labels: d.pts.map((_,i)=>i+1), datasets: datasets },
                options: { plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{y:{beginAtZero:true}} }
            });
        }, 50);
    });
}

function switchTab(t) {
    document.querySelectorAll(".tab-pane").forEach(e=>e.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(e=>e.classList.remove("active"));
    $(`${t}`).classList.remove("hidden");
    document.querySelector(`[data-tab="${t}"]`).classList.add("active");
    if(t==="history") renderHistory();
    if(t==="analytics") renderAnalytics();
    if(t==="log") renderSelectedDrills();
    window.scrollTo(0,0);
}

// Ensure init waits for DOM
document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    createModal(); renderSkills(); renderDrillSelect(); initSaveSession();
    document.querySelectorAll(".tab-button").forEach(b => b.addEventListener("click", ()=>switchTab(b.dataset.tab)));
    document.querySelectorAll(".preset-btn").forEach(btn => {
        btn.addEventListener("click", () => generateSessionPreset(btn.dataset.type));
    });
    
    const goLog = $("go-to-log");
    if(goLog) goLog.addEventListener("click", ()=> { if(selectedDrillIds.size) switchTab("log"); });
}