// ================================
// app.js — ULTIMATE VERSION (FIREBASE AUTH)
// Features: User Login, Cloud Sync, Auto-Save Drafts
// ================================

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { 
    saveSession, 
    loadSessions, 
    deleteSessionFromCloud, 
    saveDraft, 
    loadDraft, 
    clearDraft,
    loginWithGoogle,
    logout,
    subscribeToAuth
} from "./storage.js";

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
// AUTHENTICATION UI HANDLING
// ================================
function handleAuthChange(user) {
    const loginScreen = $("login-screen");
    const appScreen = $("app-screen");
    const userProfile = $("user-profile");
    
    if (user) {
        // User is logged in
        if(loginScreen) loginScreen.classList.add("hidden");
        if(appScreen) appScreen.classList.remove("hidden");
        
        // Show profile info
        if(userProfile) {
            userProfile.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${user.photoURL}" class="w-8 h-8 rounded-full border border-slate-300">
                    <div class="hidden sm:block text-right">
                        <p class="text-xs font-bold text-slate-700">${user.displayName}</p>
                        <button id="logout-btn" class="text-xs text-red-500 hover:underline">Sign Out</button>
                    </div>
                </div>
            `;
            const logoutBtn = $("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    logout().then(() => location.reload());
                });
            }
        }

        // Initialize App Data
        initAppData(); 
        
    } else {
        // User is logged out
        if(loginScreen) loginScreen.classList.remove("hidden");
        if(appScreen) appScreen.classList.add("hidden");
    }
}

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
  
  const closeBtn = $("modal-close");
  if(closeBtn) closeBtn.addEventListener("click", closeModal);
  
  const modal = $("app-modal");
  if(modal) modal.addEventListener("click", (e) => { if (e.target.id === "app-modal") closeModal(); });
}

function showModal(title, content) {
  const modalTitle = $("modal-title");
  const modalContent = $("modal-content");
  const modal = $("app-modal");
  
  if (modalTitle) modalTitle.innerText = title;
  if (modalContent) modalContent.innerHTML = content;
  if (modal) modal.classList.remove("hidden");
}

function closeModal() { 
    const modal = $("app-modal");
    if(modal) modal.classList.add("hidden"); 
}

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
// AUTO-SAVE LOGIC
// ================================
function triggerAutoSave() {
    const drillData = {};
    selectedDrillIds.forEach(id => {
        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
        drillData[id] = {
            score: scoreInput ? scoreInput.value : "",
            note: noteInput ? noteInput.value : ""
        };
        const calcInputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
        if(calcInputs.length) {
            drillData[id].calcValues = Array.from(calcInputs).map(i => i.value);
        }
    });

    const sessionDate = $("session-date");
    const sessionNotes = $("session-notes");

    const draft = {
        date: sessionDate ? sessionDate.value : "",
        skills: Array.from(selectedSkills),
        drills: Array.from(selectedDrillIds),
        drillData: drillData,
        mainNotes: sessionNotes ? sessionNotes.value : ""
    };
    saveDraft(draft);
}

function restoreDraft() {
    const draft = loadDraft();
    if (!draft) return;

    if (draft.skills) {
        draft.skills.forEach(s => selectedSkills.add(s));
        renderSkills(); 
    }
    
    if (draft.drills) {
        draft.drills.forEach(d => selectedDrillIds.add(d));
        renderDrillSelect(); 
        renderPreviewList();
        updateGoToLogButton();
        
        if (selectedDrillIds.size > 0) {
            renderSelectedDrills(); 
            setTimeout(() => {
                if(draft.drillData) {
                    Object.keys(draft.drillData).forEach(id => {
                        const data = draft.drillData[id];
                        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
                        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
                        if(scoreInput) scoreInput.value = data.score || "";
                        if(noteInput) noteInput.value = data.note || "";
                        if(data.calcValues) {
                            const calcInputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
                            calcInputs.forEach((inp, idx) => {
                                if(data.calcValues[idx]) inp.value = data.calcValues[idx];
                            });
                            if(calcInputs.length > 0) calcInputs[0].dispatchEvent(new Event('input'));
                        }
                    });
                }
                const sessionNotes = $("session-notes");
                if(draft.mainNotes && sessionNotes) sessionNotes.value = draft.mainNotes;
            }, 100);
        }
    }
    const sessionDate = $("session-date");
    if (draft.date && sessionDate) sessionDate.value = draft.date;
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
                    <div class="grid grid-cols-3 gap-2 font-bold text-xs text-gray-500 border-b pb-2 mb-2 text-center"><span>TARGET</span><span>SHOT 1</span><span>SHOT 2</span></div>
                    <div id="rng-rows-${id}" class="space-y-2"></div>
                </div>
                <div class="mt-2 text-xs text-right text-gray-500 font-medium">Avg Error: <span id="rng-score-${id}" class="font-bold text-emerald-600 text-sm">--</span> y</div>
                <input type="hidden" data-id="${id}" class="drill-score-input" />
            </div>`;
    case METRIC_TYPES.DISPERSION_CALC:
        return extraHTML + `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(5).fill(0).map(() => `<input type="number" class="calc-input input-style px-1 text-center font-mono" data-group="${id}">`).join('')}
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded flex justify-between">
                <span>Avg: <strong id="calc-avg-${id}">--</strong></span><span>SD: <strong id="calc-sd-${id}" class="text-emerald-600">--</strong></span>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />`;
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
  if(!container) return;
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
            triggerAutoSave();
        });
        content.appendChild(row);
    });
    details.appendChild(content);
    container.appendChild(details);
  });
}

function renderDrillSelect() {
  const container = $("drill-select");
  const presets = $("presets-container");
  if(!container) return;
  container.innerHTML = "";
  
  if (selectedSkills.size === 0 && selectedDrillIds.size === 0) {
      if(presets) presets.classList.remove("hidden");
      container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic">Select focus areas above to add custom drills...</div>`;
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
          if (drill.targetValues?.successThreshold) badge = `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2">Goal: ${drill.targetValues.successThreshold}+</span>`;

          const card = document.createElement("div");
          card.setAttribute("data-card-id", drill.id);
          card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-center";
          const isAdded = selectedDrillIds.has(drill.id);
          card.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2"><h4 class="font-bold text-gray-800">${drill.name}</h4>${badge}<button class="info-btn text-gray-400 hover:text-emerald-600 transition">ⓘ</button></div>
                <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">⏱ ${drill.duration}m</span>
            </div>
            <button class="add-drill px-4 py-2 rounded text-sm font-bold transition ${isAdded?'bg-red-50 text-red-600 border border-red-200':'bg-black text-white hover:bg-gray-800'}">${isAdded?'Remove':'Add'}</button>`;
          const addBtn = card.querySelector(".add-drill");
          if(addBtn) {
              addBtn.addEventListener("click", () => {
                  if(selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id); else selectedDrillIds.add(drill.id);
                  renderDrillSelect(); renderPreviewList(); updateGoToLogButton(); triggerAutoSave();
              });
          }
          const infoBtn = card.querySelector(".info-btn");
          if(infoBtn) {
              infoBtn.addEventListener("click", () => showModal(drill.name, drill.description));
          }
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
    if(!container) return;
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
            <div class="mb-3"><h3 class="text-lg font-bold">${drill.name}</h3>${goalText}<div class="bg-gray-50 p-3 rounded text-sm mt-2 text-gray-700 border border-gray-100">${drill.description}</div></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>${getMetricInputHTML(id, metric, drill)}</div>
                <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label><textarea data-note-id="${id}" class="input-style w-full h-24 resize-none" placeholder="Feel / Miss pattern..."></textarea></div>
            </div>`;
        container.appendChild(card);

        // --- HANDLERS ---
        card.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", triggerAutoSave));

        const rollBtn = card.querySelector(".roll-btn");
        if(rollBtn) {
            rollBtn.addEventListener("click", (e) => {
                const choices = JSON.parse(e.target.dataset.choices);
                if(choices.length) {
                    const targetEl = document.getElementById(e.target.dataset.target);
                    if(targetEl) targetEl.innerText = choices[Math.floor(Math.random()*choices.length)];
                } else {
                    const min = parseInt(e.target.dataset.min), max = parseInt(e.target.dataset.max);
                    const targetEl = document.getElementById(e.target.dataset.target);
                    if(targetEl) targetEl.innerText = "Target: " + (Math.floor(Math.random()*(max-min+1))+min) + "y";
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
                triggerAutoSave();
            }));
        }

        if(metric === METRIC_TYPES.RNG_MULTILOG) {
            const btn = card.querySelector(".rng-multi-btn");
            const tableContainer = document.getElementById(`rng-table-${id}`);
            const rowsContainer = document.getElementById(`rng-rows-${id}`);
            
            if(btn) {
                btn.addEventListener("click", () => {
                    const min = parseInt(btn.dataset.min), max = parseInt(btn.dataset.max), count = parseInt(btn.dataset.count);
                    if(rowsContainer) {
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
                    }
                    if(tableContainer) tableContainer.classList.remove("hidden");
                    btn.classList.add("hidden"); 
                    
                    if(rowsContainer) {
                        rowsContainer.querySelectorAll(".multi-inp").forEach(inp => {
                            inp.addEventListener("input", calculateMultiError);
                            inp.addEventListener("input", triggerAutoSave);
                        });
                    }
                });
            }

            function calculateMultiError() {
                let totalError = 0, shotCount = 0;
                if(rowsContainer) {
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
                }
                const avgErr = shotCount ? (totalError/shotCount).toFixed(1) : "--";
                const scoreEl = document.getElementById(`rng-score-${id}`);
                if(scoreEl) scoreEl.innerText = avgErr;
                const scoreInp = card.querySelector(`.drill-score-input`);
                if(scoreInp) scoreInp.value = avgErr; 
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

    saveBtn.addEventListener("click", async () => {
        try {
            // Safety check: Are there drills?
            if (selectedDrillIds.size === 0) {
                alert("No drills selected to save.");
                return;
            }

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

            const dateInput = $("session-date");
            const dateVal = dateInput ? dateInput.value : new Date().toISOString().slice(0,10);
            const sessionNotes = $("session-notes");

            // SAVE TO FIREBASE
            const success = await saveSession({
                date: dateVal,
                drills: Array.from(selectedDrillIds),
                drillResults,
                notes: sessionNotes ? sessionNotes.value : "",
                createdAt: new Date().toISOString()
            });
            
            if (success) {
                alert("Session saved to cloud!");
                selectedDrillIds.clear(); 
                selectedSkills.clear(); 
                renderSkills(); 
                renderDrillSelect(); 
                renderPreviewList(); 
                updateGoToLogButton();
                if($("session-notes")) $("session-notes").value="";
                switchTab("history");
                checkProgression(drillResults);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving session: " + err.message);
        }
    });
}

// ================================
// INIT & NAVIGATION
// ================================
function generateSessionPreset(type) {
    selectedDrillIds.clear(); 
    selectedSkills.clear();
    
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
    renderDrillSelect(); 
    renderPreviewList(); 
    updateGoToLogButton();
    triggerAutoSave();
}

function checkProgression(results) {
    const passed = results.filter(r => {
        const drill = allDrillsMap.get(r.id);
        if (!drill || !drill.targetValues || !r.score.numeric) return false;
        
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
        alert(`🎉 Goal Met: ${names}. Good job!`);
    }
}

async function renderHistory() {
    const box = $("history-list");
    if(!box) return;
    box.innerHTML = "<p class='text-gray-500'>Loading history...</p>";

    const sessions = await loadSessions(); // ASYNC WAIT
    
    box.innerHTML = ""; 
    if (!sessions.length) { 
        const p = document.createElement("p");
        p.innerText = "No history recorded yet.";
        p.className = "text-gray-500 italic";
        box.appendChild(p);
        return; 
    }

    sessions.forEach(s => {
        const div = document.createElement("div");
        div.className = "card mb-4 relative hover:shadow-md cursor-pointer border border-transparent hover:border-gray-200";
        div.innerHTML = `<div class="font-bold">${s.date}</div><div class="text-sm text-gray-600">${s.drills.length} drills</div><button class="del-btn absolute top-4 right-4 text-red-400 hover:text-red-600 p-2">✕</button>`;
        div.addEventListener("click", (e) => { if(!e.target.classList.contains("del-btn")) showSessionDetails(s); });
        div.querySelector(".del-btn").addEventListener("click", async () => {
            if(confirm("Delete this session from cloud?")) {
                await deleteSessionFromCloud(s.id);
                renderHistory(); 
                renderAnalytics();
            }
        });
        box.appendChild(div);
    });
}

function showSessionDetails(s) {
    let h = `<div class="space-y-2">`;
    s.drillResults.forEach(r => h += `<div class="flex justify-between border-b pb-1"><span>${r.name}</span><span class="font-mono bg-emerald-100 px-2 rounded font-bold">${r.score.raw||"-"}</span></div>`);
    if(s.notes) h += `<div class="mt-4 bg-gray-50 p-2 text-sm italic">"${s.notes}"</div>`;
    showModal("Session Details", h + "</div>");
}

async function renderAnalytics() {
    const box = $("analytics-container");
    if(!box) return;
    const sessions = await loadSessions(); // ASYNC WAIT
    
    if(!sessions.length) { box.innerHTML = "<p>No data recorded yet.</p>"; return; }
    
    const data = {};
    // Sort oldest first
    sessions.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s => {
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
    const p = $(t); if(p) p.classList.remove("hidden");
    const b = document.querySelector(`[data-tab="${t}"]`); if(b) b.classList.add("active");
    
    if(t==="history") renderHistory();
    if(t==="analytics") renderAnalytics();
    if(t==="log") renderSelectedDrills();
    window.scrollTo(0,0);
}

// ----------------------
// DATA & APP INIT
// ----------------------
function initAppData() {
    createModal(); 
    restoreDraft(); 
    renderSkills(); 
    renderDrillSelect(); 
    initSaveSession();
    
    // Wire up events
    document.querySelectorAll(".tab-button").forEach(b => b.addEventListener("click", ()=>switchTab(b.dataset.tab)));
    document.querySelectorAll(".preset-btn").forEach(btn => {
        btn.addEventListener("click", () => generateSessionPreset(btn.dataset.type));
    });
    
    const goLog = $("go-to-log");
    if(goLog) goLog.addEventListener("click", ()=> { if(selectedDrillIds.size) switchTab("log"); });
}

// Main Init: Wait for Auth
document.addEventListener("DOMContentLoaded", () => {
    // Show login screen initially
    const appScreen = $("app-screen");
    const loginScreen = $("login-screen");
    if(appScreen) appScreen.classList.add("hidden");
    if(loginScreen) loginScreen.classList.remove("hidden");

    // Wire up Google login button
    const googleLoginBtn = $("google-login-btn");
    if(googleLoginBtn) {
        googleLoginBtn.addEventListener("click", async () => {
            try {
                await loginWithGoogle();
                // Auth state listener below will handle the rest
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        });
    }

    // Wire up Email Login
    const emailLoginBtn = $("email-login-btn");
    if(emailLoginBtn) {
        emailLoginBtn.addEventListener("click", async () => {
            const email = $("email-input").value;
            const password = $("password-input").value;
            try {
                await loginWithEmail(email, password);
            } catch (error) {
                alert("Login failed: " + error.message);
            }
        });
    }

    // Wire up Email Signup
    const emailSignupBtn = $("email-signup-btn");
    if(emailSignupBtn) {
        emailSignupBtn.addEventListener("click", async () => {
            const email = $("email-input").value;
            const password = $("password-input").value;
            try {
                await signupWithEmail(email, password);
            } catch (error) {
                alert("Signup failed: " + error.message);
            }
        });
    }

    // Subscribe to auth state
    subscribeToAuth((user) => {
        handleAuthChange(user);
    });
});