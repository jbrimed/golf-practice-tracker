// ================================
// app.js — TECHNICAL REDESIGN (v2.0)
// Theme: "Flight Deck" / High-Contrast Data
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
// STATE MANAGEMENT
// ----------------------
let selectedSkills = new Set();
let selectedDrillIds = new Set();

// Flatten drills for easy lookup
const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));
const skillMap = new Map(SKILLS.map(s => [s.id, s]));

// ----------------------
// INITIALIZATION
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    setupGlobalClicks();
    setupGlobalInputs();

    // Auth Listener
    try {
        subscribeToAuth((user) => handleAuthChange(user));
    } catch (e) {
        console.error("Auth Error:", e);
        initAppData(); 
    }
});

function handleAuthChange(user) {
    const loginScreen = $("login-screen");
    const appScreen = $("app-screen");
    const userProfile = $("user-profile");

    if (user) {
        if(loginScreen) loginScreen.classList.add("hidden");
        if(appScreen) appScreen.classList.remove("hidden");
        
        if(userProfile) {
            userProfile.innerHTML = `
                <div class="flex flex-col items-end">
                    <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OPERATOR</span>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold text-accent-400 uppercase">${user.displayName || 'GOLFER_01'}</span>
                        <button class="text-[10px] text-red-400 hover:text-red-300 border border-red-900 bg-red-900/10 px-1 rounded-sm uppercase" data-action="logout">EXIT</button>
                    </div>
                </div>`;
        }
        initAppData();
    } else {
        if(loginScreen) loginScreen.classList.remove("hidden");
        if(appScreen) appScreen.classList.add("hidden");
    }
}

function initAppData() {
    try { restoreDraft(); } catch (e) { clearDraft(); }
    
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); 
    updateStartButton();
}

// ----------------------
// AUTO-SAVE LOGIC
// ----------------------
function triggerAutoSave() {
    const drillData = {};
    selectedDrillIds.forEach(id => {
        // Main Inputs
        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
        
        drillData[id] = {
            score: scoreInput ? scoreInput.value : "",
            note: noteInput ? noteInput.value : ""
        };
        
        // Calculation Inputs (Dispersion)
        const calcInputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
        if(calcInputs.length) {
            drillData[id].calcValues = Array.from(calcInputs).map(i => i.value);
        }
        
        // RNG Inputs (Multi-Log Table)
        const rngContainer = document.getElementById(`rng-rows-${id}`);
        if(rngContainer) {
            const rows = rngContainer.querySelectorAll(".multi-row");
            drillData[id].rngTargets = Array.from(rows).map(r => r.dataset.target);
            
            // Capture all inputs in order (2 per row)
            const inputs = rngContainer.querySelectorAll("input");
            drillData[id].rngValues = Array.from(inputs).map(i => i.value);
        }
    });

    const sessionDate = $("session-date");
    const sessionNotes = $("session-notes");

    saveDraft({
        date: sessionDate ? sessionDate.value : "",
        skills: Array.from(selectedSkills),
        drills: Array.from(selectedDrillIds),
        drillData: drillData,
        mainNotes: sessionNotes ? sessionNotes.value : ""
    });
}

// ----------------------
// GLOBAL EVENT DELEGATION
// ----------------------
function setupGlobalClicks() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        // Auth
        if (btn.id === "google-login-btn") {
            try { await loginWithGoogle(); } catch(e) { alert("AUTH FAILED: " + e.message); }
        }
        if (btn.dataset.action === "logout") {
            logout().then(() => location.reload());
        }

        // Navigation
        if (btn.classList.contains("tab-button")) {
            switchTab(btn.dataset.tab);
        }

        // Presets
        if (btn.classList.contains("preset-btn")) {
            generateSessionPreset(btn.dataset.type);
        }

        // Drill Selection
        if (btn.classList.contains("add-drill")) {
            const id = btn.dataset.id;
            if (selectedDrillIds.has(id)) selectedDrillIds.delete(id);
            else selectedDrillIds.add(id);
            
            renderDrillSelect();
            updateStartButton();
            triggerAutoSave();
        }

        // Start / Save
        if (btn.id === "go-to-log") {
            if (selectedDrillIds.size > 0) {
                renderSelectedDrills(); 
                switchTab("log");
            }
        }
        if (btn.id === "save-session") {
            handleSaveSession();
        }

        // Drill Interactions
        if (btn.classList.contains("roll-btn")) {
            handleRngRoll(btn);
        }
        if (btn.classList.contains("rng-multi-btn")) {
            handleMultiTargetGen(btn);
        }

        // History Management
        if (btn.classList.contains("del-hist-btn")) {
            e.stopPropagation();
            if(confirm("CONFIRM DELETION: Purge this record?")) {
                await deleteSessionFromCloud(btn.dataset.id);
                renderHistory();
                renderAnalytics();
            }
        }
    });
}

function setupGlobalInputs() {
    document.body.addEventListener("input", (e) => {
        const el = e.target;

        // Dispersion Calc Logic
        if (el.classList.contains("calc-input")) {
            const group = el.dataset.group;
            calculateDispersion(group);
        }

        // RNG Table Logic
        if (el.classList.contains("multi-inp")) {
            const container = el.closest(".rng-table-container");
            if(container) calculateRngScore(container);
        }

        // Auto-save on any text input
        if (el.matches("input, textarea")) {
            triggerAutoSave();
        }
    });
}

// ----------------------
// MATH & CALCULATIONS
// ----------------------
function calculateDispersion(id) {
    const inputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
    const vals = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
    
    const sdEl = document.getElementById(`calc-sd-${id}`);
    const avgEl = document.getElementById(`calc-avg-${id}`);
    const hidden = document.querySelector(`.drill-score-input[data-id="${id}"]`);

    if (vals.length > 1) {
        const sum = vals.reduce((a,b) => a+b, 0);
        const avg = sum / vals.length;
        const variance = vals.reduce((t, n) => t + Math.pow(n - avg, 2), 0) / vals.length;
        const sd = Math.sqrt(variance);

        if(sdEl) sdEl.innerText = sd.toFixed(1);
        if(avgEl) avgEl.innerText = Math.round(avg);
        if(hidden) hidden.value = sd.toFixed(2); // Store SD as score
    } else {
        if(sdEl) sdEl.innerText = "--";
        if(avgEl) avgEl.innerText = "--";
    }
}

function calculateRngScore(container) {
    const id = container.id.replace("rng-table-", "");
    const rows = container.querySelectorAll(".multi-row");
    let totalErr = 0, count = 0;
    
    rows.forEach(row => {
        const target = parseFloat(row.dataset.target);
        const inputs = row.querySelectorAll("input");
        const deltaDisplay = row.querySelector(".row-delta");
        
        // Calculate row specific delta (Average of the 2 shots vs Target)
        const validShots = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
        
        if (validShots.length > 0) {
            const rowAvg = validShots.reduce((a,b)=>a+b,0) / validShots.length;
            const delta = Math.abs(rowAvg - target);
            if(deltaDisplay) deltaDisplay.innerText = delta.toFixed(1);
            
            // Add to total accumulator
            totalErr += delta;
            count++;
        } else {
            if(deltaDisplay) deltaDisplay.innerText = "--";
        }
    });

    // Global Average Error
    const avgErr = count > 0 ? (totalErr / count).toFixed(1) : "--";
    const scoreEl = document.getElementById(`rng-score-${id}`);
    const hidden = document.querySelector(`.drill-score-input[data-id="${id}"]`);
    
    if(scoreEl) scoreEl.innerText = avgErr;
    if(hidden) hidden.value = avgErr;
}

// ----------------------
// RNG HANDLERS
// ----------------------
function handleRngRoll(btn) {
    const choices = JSON.parse(btn.dataset.choices || "[]");
    const targetEl = document.getElementById(btn.dataset.target);
    
    if(choices.length) {
        targetEl.innerText = choices[Math.floor(Math.random()*choices.length)].toUpperCase();
    } else {
        const min = parseInt(btn.dataset.min), max = parseInt(btn.dataset.max);
        const val = Math.floor(Math.random()*(max-min+1))+min;
        targetEl.innerText = "TGT: " + val + "y";
    }
}

// Generates the "Flight Deck" Table Rows
function handleMultiTargetGen(btn) {
    const id = btn.dataset.id;
    const min = parseInt(btn.dataset.min);
    const max = parseInt(btn.dataset.max);
    const count = parseInt(btn.dataset.count);
    
    const rowsContainer = document.getElementById(`rng-rows-${id}`);
    const tableContainer = document.getElementById(`rng-table-${id}`);
    
    // Header Row
    rowsContainer.innerHTML = `
        <div class="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-500 mb-1 px-1">
            <span class="col-span-1">TARGET</span>
            <span class="text-center">SHOT 1</span>
            <span class="text-center">SHOT 2</span>
            <span class="text-right">DELTA</span>
        </div>`;

    for(let i=0; i<count; i++) {
        const t = Math.floor(Math.random()*(max-min+1))+min;
        rowsContainer.innerHTML += `
        <div class="grid grid-cols-4 gap-2 items-center multi-row mb-1" data-target="${t}">
            <div class="col-span-1 text-accent-400 font-mono font-bold text-sm bg-slate-900 border border-slate-800 py-1 text-center">${t}</div>
            <input type="number" class="input-lcd h-8 px-1 text-center multi-inp text-xs" placeholder="-">
            <input type="number" class="input-lcd h-8 px-1 text-center multi-inp text-xs" placeholder="-">
            <div class="text-right text-xs font-mono text-slate-500 py-1 row-delta">--</div>
        </div>`;
    }
    tableContainer.classList.remove("hidden");
    btn.classList.add("hidden");
}

// ----------------------
// PRESETS & DRAFT
// ----------------------
function generateSessionPreset(type) {
    selectedDrillIds.clear();
    selectedSkills.clear();
    clearDraft();
    
    const map = {
        'random': ['driver','irons','wedges','putting'],
        'shortgame': ['wedges','short_game','putting'],
        'driver_iron': ['driver','irons'],
        'putting': ['putting']
    };
    
    const cats = map[type] || [];
    cats.forEach(cat => {
        const list = DRILLS[cat];
        if(list && list.length) {
            // Pick 1-2 random drills per category for a "Mix"
            const d = list[Math.floor(Math.random()*list.length)];
            selectedDrillIds.add(d.id);
            d.skills.forEach(s => selectedSkills.add(s));
        }
    });

    renderSkills();
    renderDrillSelect();
    renderSelectedDrills();
    updateStartButton();
    triggerAutoSave();
    
    if(selectedDrillIds.size > 0) switchTab("log");
}

function restoreDraft() {
    const draft = loadDraft();
    if(!draft) return;
    
    if(draft.skills) draft.skills.forEach(s => selectedSkills.add(s));
    if(draft.drills) draft.drills.forEach(d => selectedDrillIds.add(d));
    
    if(draft.date && $("session-date")) $("session-date").value = draft.date;
    if(draft.notes && $("session-notes")) $("session-notes").value = draft.notes;
    
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills();
    updateStartButton();

    // Re-hydrate inputs after rendering
    setTimeout(() => {
        if(draft.drillData) {
            Object.keys(draft.drillData).forEach(id => {
                const d = draft.drillData[id];
                const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
                const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
                
                if(scoreInput && d.score) scoreInput.value = d.score;
                if(noteInput && d.note) noteInput.value = d.note;
                
                // Restore Calc inputs
                if(d.calcValues) {
                    const calcs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
                    calcs.forEach((inp, i) => { if(d.calcValues[i]) inp.value = d.calcValues[i]; });
                    if(calcs.length) calculateDispersion(id);
                }

                // Restore RNG inputs (Complex)
                if(d.rngTargets) {
                    // Need to regenerate the table structure first!
                    const btn = document.querySelector(`.rng-multi-btn[data-id="${id}"]`);
                    if(btn && !btn.classList.contains("hidden")) {
                        // Manually trigger generation, then override targets
                        const rowsContainer = document.getElementById(`rng-rows-${id}`);
                        const tableContainer = document.getElementById(`rng-table-${id}`);
                        
                        rowsContainer.innerHTML = `
                            <div class="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-500 mb-1 px-1">
                                <span class="col-span-1">TARGET</span>
                                <span class="text-center">SHOT 1</span>
                                <span class="text-center">SHOT 2</span>
                                <span class="text-right">DELTA</span>
                            </div>`;
                            
                        d.rngTargets.forEach(t => {
                             rowsContainer.innerHTML += `
                                <div class="grid grid-cols-4 gap-2 items-center multi-row mb-1" data-target="${t}">
                                    <div class="col-span-1 text-accent-400 font-mono font-bold text-sm bg-slate-900 border border-slate-800 py-1 text-center">${t}</div>
                                    <input type="number" class="input-lcd h-8 px-1 text-center multi-inp text-xs" placeholder="-">
                                    <input type="number" class="input-lcd h-8 px-1 text-center multi-inp text-xs" placeholder="-">
                                    <div class="text-right text-xs font-mono text-slate-500 py-1 row-delta">--</div>
                                </div>`;
                        });
                        tableContainer.classList.remove("hidden");
                        btn.classList.add("hidden");
                        
                        // Now fill values
                        if(d.rngValues) {
                            const inputs = rowsContainer.querySelectorAll("input");
                            inputs.forEach((inp, i) => { if(d.rngValues[i]) inp.value = d.rngValues[i]; });
                            calculateRngScore(tableContainer);
                        }
                    }
                }
            });
        }
    }, 200);
}

// ----------------------
// UI RENDERERS
// ----------------------

function renderSkills() {
    const container = $("skill-select");
    if(!container) return;
    container.innerHTML = "";
    
    // Simple Compact List
    SKILLS.forEach(skill => {
        const lbl = document.createElement("label");
        lbl.className = "flex items-center space-x-3 py-1.5 cursor-pointer hover:bg-slate-900 transition px-1 rounded-sm";
        const checked = selectedSkills.has(skill.id) ? "checked" : "";
        lbl.innerHTML = `
            <input type="checkbox" class="accent-accent-400 h-3 w-3 bg-slate-900 border-slate-600 rounded-sm" ${checked}>
            <span class="text-xs font-mono text-slate-400 uppercase">${skill.label}</span>
        `;
        
        lbl.querySelector("input").addEventListener("change", (e) => {
            if(e.target.checked) selectedSkills.add(skill.id); 
            else selectedSkills.delete(skill.id);
            renderDrillSelect();
            triggerAutoSave();
        });
        container.appendChild(lbl);
    });
}

function renderDrillSelect() {
  const container = $("drill-select");
  const presets = $("presets-container");
  if(!container) return;
  container.innerHTML = "";

  if (selectedSkills.size === 0 && selectedDrillIds.size === 0) {
      if(presets) presets.classList.remove("hidden");
      container.innerHTML = `<div class="text-center py-8 text-slate-600 font-mono text-[10px] uppercase border border-dashed border-slate-800 rounded">Awaiting Input Parameters...</div>`;
      return;
  } else {
      if(presets) presets.classList.add("hidden");
  }

  const activeDrills = Object.values(DRILLS).flat().filter(d => d.skills.some(s => selectedSkills.has(s)));
  
  if(activeDrills.length === 0) {
      container.innerHTML = `<div class="text-center py-4 text-slate-500 font-mono text-xs">NO DRILLS FOUND</div>`;
      return;
  }

  activeDrills.forEach(drill => {
      // Prevent duplicates
      if(container.querySelector(`[data-did="${drill.id}"]`)) return;

      const isAdded = selectedDrillIds.has(drill.id);
      
      // Technical Styling
      const cardClass = isAdded ? "border-accent-400 bg-slate-900" : "border-slate-800 hover:border-slate-600 bg-slate-950";
      const btnText = isAdded ? "REMOVE" : "ADD";
      const btnClass = isAdded ? "text-red-400 border-red-900 hover:bg-red-900/20" : "text-accent-400 border-accent-900 hover:bg-accent-900/20";

      const div = document.createElement("div");
      div.className = `flex justify-between items-center p-2 border rounded-sm transition mb-1 ${cardClass}`;
      div.setAttribute("data-did", drill.id);
      
      div.innerHTML = `
        <div class="flex-1 min-w-0 pr-2">
            <div class="flex items-baseline justify-between">
                <h4 class="text-xs font-medium text-slate-300 truncate font-mono">${drill.name}</h4>
                <span class="text-[10px] font-mono text-slate-600">${drill.duration}m</span>
            </div>
        </div>
        <button class="add-drill text-[10px] font-mono font-bold border px-2 py-0.5 rounded-sm uppercase tracking-wide transition ${btnClass}" data-id="${drill.id}">${btnText}</button>
      `;
      container.appendChild(div);
  });
}

function renderSelectedDrills() {
    const container = $("selected-drills-log");
    if (!container) return;
    container.innerHTML = "";
    
    if (selectedDrillIds.size === 0) return;

    // Use Array.from to allow index access for numbering
    Array.from(selectedDrillIds).forEach((id, index) => {
        const drill = allDrillsMap.get(id);
        if(!drill) return;

        const metric = drill.metricType || "CUSTOM";
        const card = document.createElement("div");
        card.className = "tech-card p-4 relative shadow-none";
        
        // Technical Header
        const header = `
            <div class="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                <div>
                    <span class="text-[10px] font-mono text-accent-dim uppercase">DRILL_0${index+1}</span>
                    <h3 class="text-sm font-bold text-white font-sans uppercase tracking-wide">${drill.name}</h3>
                </div>
                <div class="text-[10px] font-mono text-slate-500 max-w-[50%] text-right leading-tight">
                    ${drill.description}
                </div>
            </div>`;

        let inputsHtml = "";
        
        // 1. DISPERSION INPUT (Data Grid)
        if (metric === "DISPERSION_CALC") {
            inputsHtml = `
            <div class="bg-black border border-slate-800 p-2 rounded-sm mb-3">
                <div class="flex justify-between text-[10px] font-mono text-slate-500 mb-1 px-1">
                    <span>CARRY VALUES</span>
                    <span>[YDS]</span>
                </div>
                <div class="grid grid-cols-5 gap-1 mb-2">
                    ${Array(5).fill(0).map(() => `<input type="number" class="calc-input bg-slate-900 border border-slate-700 text-accent-400 font-mono text-center text-sm py-1 focus:border-accent-400 focus:outline-none placeholder-slate-800" placeholder="000" data-group="${id}">`).join('')}
                </div>
                <div class="flex justify-between items-center border-t border-slate-800 pt-2 px-1">
                    <span class="text-[10px] font-mono text-slate-400 uppercase">AVG: <span id="calc-avg-${id}" class="text-white text-xs">--</span></span>
                    <span class="text-[10px] font-mono text-slate-400 uppercase">SD: <span id="calc-sd-${id}" class="text-accent-400 font-bold text-xs">--</span></span>
                </div>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />`;
            
        // 2. RNG MULTI LOG (Table View)
        } else if (metric === "RNG_MULTILOG") {
            inputsHtml = `
            <div id="rng-table-${id}" class="rng-table-container">
                <button class="rng-multi-btn w-full border border-dashed border-slate-700 text-slate-500 hover:border-accent-400 hover:text-accent-400 font-mono text-[10px] py-3 mb-2 rounded-sm transition uppercase tracking-widest"
                    data-id="${id}" data-min="${drill.randomizer.min}" data-max="${drill.randomizer.max}" data-count="${drill.randomizer.count||5}">
                    [ Initialize Target Array ]
                </button>
                <div id="rng-rows-${id}" class="space-y-1"></div>
                <div class="mt-2 flex justify-end">
                    <div class="text-[10px] font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-sm text-slate-400 uppercase">
                        Mean Error: <span id="rng-score-${id}" class="text-accent-400 font-bold">--</span>
                    </div>
                </div>
                <input type="hidden" data-id="${id}" class="drill-score-input" />
            </div>`;
            
        // 3. STANDARD INPUT (LCD Field)
        } else {
            let extra = "";
            if (drill.randomizer) {
                 extra = `
                 <div class="flex justify-between items-center mb-2 bg-slate-900 p-2 border border-slate-800 rounded-sm">
                    <span class="text-accent-400 font-mono text-xs font-bold" id="rand-target-${id}">STATUS: READY</span>
                    <button class="roll-btn text-[10px] border border-slate-600 text-slate-300 px-2 py-1 hover:bg-slate-800 font-mono uppercase" 
                        data-target="rand-target-${id}" 
                        data-min="${drill.randomizer.min}" 
                        data-max="${drill.randomizer.max}" 
                        data-choices='${JSON.stringify(drill.randomizer.choices || [])}'>
                        GENERATE
                    </button>
                 </div>`;
            }
            inputsHtml = `
                ${extra}
                <div class="flex items-center gap-3">
                    <div class="flex-1">
                        <label class="block text-[10px] font-mono text-slate-500 mb-1 uppercase">Metric Result</label>
                        <input data-id="${id}" type="text" class="drill-score-input input-lcd w-full p-2 text-sm rounded-sm" placeholder="SCORE / COUNT" />
                    </div>
                </div>`;
        }

        // Combine
        card.innerHTML = `
            ${header}
            ${inputsHtml}
            <div class="mt-3 pt-3 border-t border-slate-800">
                <textarea data-note-id="${id}" class="w-full bg-slate-950 text-slate-400 text-xs p-2 border border-slate-800 focus:border-slate-600 outline-none resize-none font-mono rounded-sm" rows="1" placeholder="// OBSERVER NOTES"></textarea>
            </div>`;
        container.appendChild(card);
    });
}

function updateStartButton() {
    const btn = $("go-to-log");
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
    
    if(btn) {
        if (selectedDrillIds.size === 0) {
            btn.disabled = true;
            btn.classList.add("opacity-30");
        } else {
            btn.disabled = false;
            btn.classList.remove("opacity-30");
        }
    }
}

// ----------------------
// SAVING & HISTORY
// ----------------------

async function handleSaveSession() {
    if (selectedDrillIds.size === 0) { alert("ERROR: NULL SELECTION"); return; }

    const results = Array.from(selectedDrillIds).map(id => {
        const drill = allDrillsMap.get(id);
        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
        
        const raw = scoreInput ? scoreInput.value : "";
        const note = noteInput ? noteInput.value : "";
        
        // Attempt to parse number for graphing
        let num = null;
        if (raw) {
            if (!isNaN(parseFloat(raw))) num = parseFloat(raw);
            else if (raw.includes("/")) {
                const [n, d] = raw.split("/");
                if (d && parseFloat(d) !== 0) num = (parseFloat(n) / parseFloat(d)) * 100;
            }
        }
        return { id, name: drill?.name || id, score: { raw, numeric: num !== null ? num : 0 }, notes: note };
    });

    const success = await saveSession({
        date: $("session-date")?.value || new Date().toISOString().slice(0, 10),
        drills: Array.from(selectedDrillIds),
        drillResults: results,
        notes: $("session-notes")?.value || "",
        createdAt: new Date().toISOString()
    });

    if (success) {
        alert("SESSION ARCHIVED SUCCESSFULLY");
        selectedDrillIds.clear();
        selectedSkills.clear();
        clearDraft();
        renderSkills();
        renderDrillSelect();
        renderSelectedDrills();
        updateStartButton();
        if($("session-notes")) $("session-notes").value = "";
        switchTab("history");
    }
}

async function renderHistory() {
    const box = $("history-list");
    if(!box) return;
    box.innerHTML = "<p class='text-slate-600 text-xs font-mono animate-pulse'>ACCESSING DATABANKS...</p>";
    const sessions = await loadSessions();
    box.innerHTML = sessions.length ? "" : "<p class='text-slate-600 text-xs font-mono'>NO ARCHIVES FOUND</p>";
    
    sessions.forEach(s => {
        const div = document.createElement("div");
        div.className = "tech-card mb-2 relative p-3 cursor-pointer hover:border-slate-600 transition group";
        
        const d = new Date(s.date).toLocaleDateString('en-US', {month:'short', day:'numeric'});
        
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-accent-400 font-mono font-bold text-sm uppercase">${d}</span>
                    <span class="text-slate-500 text-xs ml-2 font-mono">${s.drills.length} PROTOCOLS</span>
                </div>
                <div class="text-slate-600 group-hover:text-red-400 transition z-10">
                    <button class="del-hist-btn font-mono text-[10px] px-2" data-id="${s.id}">[PURGE]</button>
                </div>
            </div>`;
            
        // Show detail on click (excluding delete btn)
        div.addEventListener("click", (e) => { 
            if(!e.target.matches(".del-hist-btn")) {
                const details = (s.drillResults||[]).map(r => 
                    `${r.name.substring(0,20)}... : ${r.score.raw || '--'}`
                ).join('\n');
                alert(`ARCHIVE ID: ${s.id.substring(0,8)}\nDATE: ${s.date}\n\n${details}`);
            }
        });
        box.appendChild(div);
    });
}

// ----------------------
// ANALYTICS (Dark Mode)
// ----------------------
async function renderAnalytics() {
    const box = $("analytics-container");
    if(!box) return;
    const sessions = await loadSessions();
    if(!sessions.length) { box.innerHTML = "<p class='text-slate-600 text-xs font-mono'>INSUFFICIENT DATA</p>"; return; }
    
    const stats = {};
    sessions.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s => {
        if(s.drillResults) s.drillResults.forEach(r => {
            if(r.score && r.score.numeric !== null) {
                if(!stats[r.name]) stats[r.name] = [];
                stats[r.name].push(r.score.numeric);
            }
        });
    });
    
    box.innerHTML = "";
    Object.keys(stats).forEach(name => {
        const scores = stats[name];
        if(scores.length===0) return;
        
        const avg = (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
        const cid = "c-" + Math.random().toString(36).substr(2,9);
        
        box.innerHTML += `
        <div class="tech-card mb-4 p-4">
            <div class="flex justify-between font-mono text-xs mb-2">
                <span class="text-slate-300 uppercase">${name}</span>
                <span class="text-accent-400">AVG: ${avg}</span>
            </div>
            <div class="h-32">
                <canvas id="${cid}"></canvas>
            </div>
        </div>`;
        
        setTimeout(() => { 
            new Chart(document.getElementById(cid), { 
                type:'line', 
                data:{
                    labels:scores.map((_,i)=>i+1), 
                    datasets:[{
                        data:scores, 
                        borderColor:'#22d3ee', // Cyan
                        backgroundColor: 'rgba(34, 211, 238, 0.1)',
                        borderWidth: 2,
                        tension:0.1, 
                        pointRadius:2,
                        pointBackgroundColor: '#000',
                        pointBorderColor: '#22d3ee'
                    }]
                }, 
                options:{
                    plugins:{legend:{display:false}}, 
                    maintainAspectRatio:false, 
                    scales:{
                        y:{
                            beginAtZero:true,
                            grid: { color: '#1e293b' },
                            ticks: { color: '#64748b', font: {family: "'JetBrains Mono', monospace", size: 9} }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { display: false }
                        }
                    }
                }
            }); 
        }, 100);
    });
}

function switchTab(t) {
    document.querySelectorAll(".tab-pane").forEach(e => e.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(e => {
        e.classList.remove("active");
        e.classList.remove("text-accent-400");
        e.classList.add("text-slate-500");
    });
    
    const target = $(t);
    if (target) target.classList.remove("hidden");
    
    const btn = document.querySelector(`[data-tab="${t}"]`);
    if (btn) {
        btn.classList.add("active", "text-accent-400");
        btn.classList.remove("text-slate-500");
    }

    if (t === "history") renderHistory();
    if (t === "analytics") renderAnalytics();
    if (t === "log") renderSelectedDrills(); 
    window.scrollTo(0,0);
}