// ================================
// app.js — FINAL FIXED VERSION
// Features: Robust Logging, Graphing, Saving, and Auth
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

const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

// ----------------------
// METRIC TYPES (Must match drills.js)
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

// ----------------------
// INITIALIZATION
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Ready. Listening for Auth...");
    
    // Auth Listener
    try {
        subscribeToAuth((user) => {
            handleAuthChange(user);
        });
    } catch (e) {
        console.error("Auth Error:", e);
    }

    // Login Button
    const googleBtn = $("google-login-btn");
    if(googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try { await loginWithGoogle(); } catch(e) { alert(e.message); }
        });
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
                <div class="flex items-center gap-3">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-bold text-slate-700">${user.displayName}</p>
                        <button id="logout-btn" class="text-xs text-red-500 hover:underline">Sign Out</button>
                    </div>
                    <img src="${user.photoURL}" class="w-8 h-8 rounded-full border border-slate-300">
                </div>`;
            const logoutBtn = $("logout-btn");
            if(logoutBtn) logoutBtn.addEventListener("click", () => logout().then(() => location.reload()));
        }
        initAppData();
    } else {
        if(loginScreen) loginScreen.classList.remove("hidden");
        if(appScreen) appScreen.classList.add("hidden");
    }
}

function initAppData() {
    restoreDraft();
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); // Ensure log is ready if resuming
    initSaveSession();      // Bind save button
    
    // Tab switching
    document.querySelectorAll(".tab-button").forEach(b => {
        b.addEventListener("click", () => switchTab(b.dataset.tab));
    });
    
    // Presets
    document.querySelectorAll(".preset-btn").forEach(b => {
        b.addEventListener("click", () => generateSessionPreset(b.dataset.type));
    });
    
    // Start Button
    const goLog = $("go-to-log");
    if(goLog) goLog.addEventListener("click", () => {
        if(selectedDrillIds.size > 0) switchTab("log");
    });

    // Global Event Delegation for dynamic elements
    document.body.addEventListener("input", handleGlobalInput);
    document.body.addEventListener("click", handleGlobalClick);
}

// ----------------------
// GLOBAL HANDLERS (Delegation)
// ----------------------

function handleGlobalInput(e) {
    // Auto-save trigger
    if (e.target.matches("input, textarea")) {
        triggerAutoSave();
    }

    // Calc Logic: Dispersion
    if (e.target.classList.contains("calc-input")) {
        const groupId = e.target.dataset.group;
        const inputs = document.querySelectorAll(`.calc-input[data-group="${groupId}"]`);
        const values = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
        
        if (values.length > 1) {
            const sd = calculateSD(values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            
            const sdEl = document.getElementById(`calc-sd-${groupId}`);
            const avgEl = document.getElementById(`calc-avg-${groupId}`);
            const hiddenInput = document.querySelector(`.drill-score-input[data-id="${groupId}"]`);

            if (sdEl) sdEl.innerText = sd.toFixed(2);
            if (avgEl) avgEl.innerText = avg.toFixed(1);
            if (hiddenInput) hiddenInput.value = sd.toFixed(2);
        }
    }

    // Calc Logic: RNG Multilog
    if (e.target.classList.contains("multi-inp")) {
        const container = e.target.closest(".rng-table-container");
        if (container) {
            const drillId = container.id.replace("rng-table-", "");
            const rows = container.querySelectorAll(".multi-row");
            let totalError = 0;
            let count = 0;

            rows.forEach(row => {
                const target = parseFloat(row.dataset.target);
                const inputs = row.querySelectorAll("input");
                inputs.forEach(inp => {
                    const val = parseFloat(inp.value);
                    if (!isNaN(val)) {
                        totalError += Math.abs(val - target);
                        count++;
                    }
                });
            });

            const avgError = count > 0 ? (totalError / count).toFixed(1) : "--";
            const scoreEl = document.getElementById(`rng-score-${drillId}`);
            const hiddenInput = document.querySelector(`.drill-score-input[data-id="${drillId}"]`);

            if (scoreEl) scoreEl.innerText = avgError;
            if (hiddenInput) hiddenInput.value = avgError; // This saves the "Score"
        }
    }
}

function handleGlobalClick(e) {
    // RNG Single Roll
    if (e.target.classList.contains("roll-btn")) {
        const btn = e.target;
        const choices = JSON.parse(btn.dataset.choices);
        const targetEl = document.getElementById(btn.dataset.target);
        
        if(choices.length > 0) {
            targetEl.innerText = choices[Math.floor(Math.random() * choices.length)];
        } else {
            const min = parseInt(btn.dataset.min);
            const max = parseInt(btn.dataset.max);
            targetEl.innerText = "Target: " + (Math.floor(Math.random() * (max - min + 1)) + min) + "y";
        }
    }

    // RNG Multilog Generator
    if (e.target.classList.contains("rng-multi-btn")) {
        const btn = e.target;
        const id = btn.dataset.id;
        const min = parseInt(btn.dataset.min);
        const max = parseInt(btn.dataset.max);
        const count = parseInt(btn.dataset.count);
        
        const rowsContainer = document.getElementById(`rng-rows-${id}`);
        const tableContainer = document.getElementById(`rng-table-${id}`);
        
        if(rowsContainer) {
            rowsContainer.innerHTML = "";
            for(let i=0; i<count; i++) {
                const target = Math.floor(Math.random() * (max - min + 1)) + min;
                rowsContainer.innerHTML += `
                <div class="grid grid-cols-3 gap-2 items-center multi-row mb-2" data-target="${target}">
                    <span class="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded text-center">${target}y</span>
                    <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="1">
                    <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="2">
                </div>`;
            }
            if(tableContainer) tableContainer.classList.remove("hidden");
            btn.classList.add("hidden");
        }
    }
}

// ----------------------
// CORE LOGIC
// ----------------------

function getDrillMetric(drill) {
    // Prioritize specific metricType, fallback to CUSTOM
    return drill.metricType || "CUSTOM";
}

function calculateSD(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / values.length;
    return Math.sqrt(variance);
}

// ----------------------
// DRAFT & PRESETS
// ----------------------

function generateSessionPreset(type) {
    selectedDrillIds.clear();
    selectedSkills.clear();
    clearDraft();
    
    const cats = {
        'random': ['driver', 'irons', 'wedges', 'putting'],
        'shortgame': ['wedges', 'short_game', 'putting'],
        'driver_iron': ['driver', 'irons'],
        'putting': ['putting']
    }[type] || [];

    cats.forEach(cat => {
        const list = DRILLS[cat];
        if(list && list.length) {
            const d = list[Math.floor(Math.random() * list.length)];
            selectedDrillIds.add(d.id);
            d.skills.forEach(s => selectedSkills.add(s));
        }
    });

    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); // Populate Log immediately
    updateStartButton();
    triggerAutoSave();
    
    // Automatically go to log if drills found
    if(selectedDrillIds.size > 0) switchTab("log");
}

function triggerAutoSave() {
    const drillData = {};
    selectedDrillIds.forEach(id => {
        // Save main input
        const mainInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
        
        drillData[id] = {
            score: mainInput ? mainInput.value : "",
            note: noteInput ? noteInput.value : ""
        };
        
        // Save calc inputs
        const calcInputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
        if(calcInputs.length) {
            drillData[id].calcValues = Array.from(calcInputs).map(i => i.value);
        }
        
        // Save RNG multi inputs
        const rngContainer = document.getElementById(`rng-rows-${id}`);
        if(rngContainer) {
            // Save the generated target values so they persist
            const rows = rngContainer.querySelectorAll(".multi-row");
            drillData[id].rngTargets = Array.from(rows).map(r => r.dataset.target);
            // Save the user inputs
            const inputs = rngContainer.querySelectorAll("input");
            drillData[id].rngValues = Array.from(inputs).map(i => i.value);
        }
    });

    saveDraft({
        date: $("session-date")?.value,
        drills: Array.from(selectedDrillIds),
        skills: Array.from(selectedSkills),
        drillData: drillData,
        notes: $("session-notes")?.value
    });
}

function restoreDraft() {
    const draft = loadDraft();
    if(!draft) return;
    
    if(draft.skills) draft.skills.forEach(s => selectedSkills.add(s));
    if(draft.drills) draft.drills.forEach(d => selectedDrillIds.add(d));
    
    if(draft.date && $("session-date")) $("session-date").value = draft.date;
    if(draft.notes && $("session-notes")) $("session-notes").value = draft.notes;
    
    // Render UI state
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills();
    updateStartButton();

    // Restore Values
    setTimeout(() => {
        if(draft.drillData) {
            Object.keys(draft.drillData).forEach(id => {
                const d = draft.drillData[id];
                
                // 1. Restore Main Inputs
                const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
                const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
                if(scoreInput) scoreInput.value = d.score || "";
                if(noteInput) noteInput.value = d.note || "";
                
                // 2. Restore Calc Inputs
                if(d.calcValues) {
                    const calcs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
                    calcs.forEach((inp, i) => { if(d.calcValues[i]) inp.value = d.calcValues[i]; });
                    if(calcs.length) {
                         // Manually trigger calculation logic
                         // We can reuse the global handler but we need a fake event target
                         handleCalcInput(calcs[0]); 
                    }
                }
                
                // 3. Restore RNG Tables
                if(d.rngTargets && d.rngTargets.length > 0) {
                    // Re-build the table first!
                    const rowsContainer = document.getElementById(`rng-rows-${id}`);
                    const tableContainer = document.getElementById(`rng-table-${id}`);
                    const btn = document.querySelector(`#rng-table-${id} .rng-multi-btn`); 
                    
                    if(rowsContainer) {
                        rowsContainer.innerHTML = "";
                        d.rngTargets.forEach((target, idx) => {
                            rowsContainer.innerHTML += `
                            <div class="grid grid-cols-3 gap-2 items-center multi-row mb-2" data-target="${target}">
                                <span class="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded text-center">${target}y</span>
                                <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 1">
                                <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 2">
                            </div>`;
                        });
                        
                        // Restore values into the newly created inputs
                        if(d.rngValues) {
                            const inputs = rowsContainer.querySelectorAll("input");
                            inputs.forEach((inp, i) => { if(d.rngValues[i]) inp.value = d.rngValues[i]; });
                            // Trigger math for this row if inputs exist
                            if(inputs.length > 0) handleMultiInput(inputs[0]);
                        }
                        
                        if(tableContainer) tableContainer.classList.remove("hidden");
                        if(btn) btn.classList.add("hidden");
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
    
    const grouped = {};
    SKILLS.forEach(s => { const c = s.category||"Other"; if(!grouped[c]) grouped[c]=[]; grouped[c].push(s); });

    Object.keys(grouped).forEach((cat, i) => {
        const details = document.createElement("details");
        details.className = "group border border-gray-200 rounded-lg mb-2 overflow-hidden";
        if(i===0) details.open = true;
        
        details.innerHTML = `<summary class="flex justify-between p-3 bg-gray-50 cursor-pointer font-bold text-emerald-900 hover:bg-gray-100 transition"><span>${cat}</span><span>▼</span></summary>`;
        
        const div = document.createElement("div");
        div.className = "p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border-t border-gray-100";
        
        grouped[cat].forEach(skill => {
            const lbl = document.createElement("label");
            lbl.className = "flex items-center space-x-3 p-2 rounded hover:bg-emerald-50 cursor-pointer transition";
            const checked = selectedSkills.has(skill.id) ? "checked" : "";
            lbl.innerHTML = `<input type="checkbox" class="skill-check h-4 w-4 text-emerald-600 rounded" ${checked}><span class="text-sm font-medium text-gray-700">${skill.label}</span>`;
            
            lbl.querySelector("input").addEventListener("change", (e) => {
                if(e.target.checked) selectedSkills.add(skill.id); else selectedSkills.delete(skill.id);
                renderDrillSelect();
                triggerAutoSave();
            });
            div.appendChild(lbl);
        });
        details.appendChild(div);
        container.appendChild(details);
    });
}

function renderDrillSelect() {
    const container = $("drill-select");
    const presets = $("presets-container");
    if(!container) return;
    container.innerHTML = "";

    // Toggle Presets Visibility
    if(selectedSkills.size === 0 && selectedDrillIds.size === 0) {
        if(presets) presets.classList.remove("hidden");
        container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic">Select focus areas...</div>`;
        return;
    } else {
        if(presets) presets.classList.add("hidden");
    }

    const activeDrills = Object.values(DRILLS).flat().filter(d => d.skills.some(s => selectedSkills.has(s)));
    
    // Group by Skill Label
    const groups = {};
    selectedSkills.forEach(sId => {
        const skill = skillMap.get(sId);
        if(skill) {
            const matches = activeDrills.filter(d => d.skills.includes(sId));
            if(matches.length) groups[skill.label] = matches;
        }
    });

    Object.keys(groups).forEach(label => {
        const sec = document.createElement("div");
        sec.className = "mb-6";
        sec.innerHTML = `<h3 class="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 mb-3 bg-emerald-50 py-1 rounded-r">${label}</h3><div class="space-y-3"></div>`;
        container.appendChild(sec);
        const grp = sec.querySelector("div");

        groups[label].forEach(drill => {
            if(grp.querySelector(`[data-did="${drill.id}"]`)) return; // Dedupe

            const isAdded = selectedDrillIds.has(drill.id);
            const btnClass = isAdded ? "bg-red-50 text-red-600 border-red-200" : "bg-black text-white hover:bg-gray-800";
            const btnText = isAdded ? "Remove" : "Add";
            
            const card = document.createElement("div");
            card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-center";
            card.setAttribute("data-did", drill.id);
            
            let badge = drill.targetValues?.successThreshold ? `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2">Goal: ${drill.targetValues.successThreshold}+</span>` : "";

            card.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center gap-2"><h4 class="font-bold text-gray-800">${drill.name}</h4>${badge}</div>
                    <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">⏱ ${drill.duration}m</span>
                </div>
                <button class="add-btn px-4 py-2 rounded text-sm font-bold border transition ${btnClass}">${btnText}</button>
            `;
            
            card.querySelector(".add-btn").addEventListener("click", () => {
                if(selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id); 
                else selectedDrillIds.add(drill.id);
                
                renderDrillSelect(); 
                renderPreviewList(); 
                updateStartButton(); 
                triggerAutoSave();
            });
            
            grp.appendChild(card);
        });
    });
}

function renderPreviewList() {
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
}

function updateStartButton() {
    const btn = $("go-to-log");
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
    if(btn) {
        btn.querySelector("span").innerText = selectedDrillIds.size > 0 ? `Start Practice (${selectedDrillIds.size})` : "Start Session";
        if (selectedDrillIds.size === 0) {
            btn.classList.add("opacity-50", "cursor-not-allowed");
        } else {
            btn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }
}

// ================================
// LOGGING & INPUTS
// ================================

function renderSelectedDrills() {
    const container = $("selected-drills-log");
    if(!container) return;
    container.innerHTML = "";
    
    if(selectedDrillIds.size === 0) {
        container.innerHTML = "<p class='text-center text-gray-500'>No drills selected.</p>";
        return;
    }

    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        if(!drill) return;

        const metric = getDrillMetric(drill);
        const card = document.createElement("div");
        card.className = "card border-l-4 border-black mb-6";
        
        let inputsHtml = "";
        
        if (metric === METRIC_TYPES.DISPERSION_CALC) {
            inputsHtml = `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(5).fill(0).map(() => `<input type="number" class="calc-input input-style px-1 text-center font-mono" data-group="${id}">`).join('')}
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded flex justify-between">
                <span>Avg: <strong id="calc-avg-${id}">--</strong></span><span>SD: <strong id="calc-sd-${id}" class="text-emerald-600">--</strong></span>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />`;
        } else if (metric === METRIC_TYPES.RNG_MULTILOG) {
            inputsHtml = `
            <div class="mb-2 rng-table-container" id="rng-table-${id}">
                <button class="rng-multi-btn w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold mb-2 transition hover:bg-indigo-700"
                    data-id="${id}"
                    data-min="${drill.randomizer.min}"
                    data-max="${drill.randomizer.max}"
                    data-count="${drill.randomizer.count || 5}">🎲 Generate 5 Targets</button>
                
                <div id="rng-rows-${id}" class="space-y-2"></div>
                
                <div class="mt-2 text-xs text-right text-gray-500 font-medium">
                    Avg Error: <span id="rng-score-${id}" class="font-bold text-emerald-600 text-sm">--</span> y
                </div>
                <input type="hidden" data-id="${id}" class="drill-score-input" />
            </div>`;
        } else {
            let extra = "";
            if (drill.randomizer) {
                 extra = `
                 <div class="mb-2 flex justify-between items-center bg-indigo-50 p-2 rounded">
                    <span class="text-indigo-900 text-sm font-bold" id="rand-target-${id}">Target: ???</span>
                    <button class="roll-btn bg-indigo-600 text-white px-2 py-1 rounded text-xs" 
                        data-target="rand-target-${id}"
                        data-min="${drill.randomizer.min}"
                        data-max="${drill.randomizer.max}"
                        data-choices='${JSON.stringify(drill.randomizer.choices || [])}'>Roll</button>
                 </div>`;
            }
            inputsHtml = extra + `<label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score</label><input data-id="${id}" type="text" class="drill-score-input input-style" placeholder="Result" />`;
        }

        card.innerHTML = `
            <div class="mb-3"><h3 class="text-lg font-bold">${drill.name}</h3><div class="bg-gray-50 p-3 rounded text-sm mt-2 text-gray-700 border border-gray-100">${drill.description}</div></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>${inputsHtml}</div>
                <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label><textarea data-note-id="${id}" class="input-style w-full h-24 resize-none" placeholder="Notes..."></textarea></div>
            </div>`;
        
        container.appendChild(card);
    });
}

// ================================
// SAVE & COMPLETE
// ================================

function initSaveSession() {
    const btn = $("save-session");
    if(!btn) return;

    // Use replacement to ensure fresh listener
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", async () => {
        if(selectedDrillIds.size === 0) { alert("No drills selected."); return; }

        // Build Data
        const results = Array.from(selectedDrillIds).map(id => {
            const drill = allDrillsMap.get(id);
            const rawInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
            const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
            
            const raw = rawInput ? rawInput.value : "";
            const note = noteInput ? noteInput.value : "";
            
            // Parse Number
            let num = null;
            if(raw) {
                if(!isNaN(parseFloat(raw))) num = parseFloat(raw);
                else if(raw.includes("/")) {
                    const [n, d] = raw.split("/");
                    if(d && parseFloat(d)!==0) num = (parseFloat(n)/parseFloat(d))*100;
                }
            }

            return { 
                id, 
                name: drill?.name || id, 
                score: { raw, numeric: num || 0 }, // Fallback to 0 if parsing failed
                notes: note 
            };
        });

        const success = await saveSession({
            date: $("session-date")?.value || new Date().toISOString().slice(0,10),
            drills: Array.from(selectedDrillIds),
            drillResults: results,
            notes: $("session-notes")?.value || "",
            createdAt: new Date().toISOString()
        });

        if(success) {
            alert("Session Saved!");
            clearDraft();
            selectedDrillIds.clear(); 
            selectedSkills.clear();
            renderSkills(); 
            renderDrillSelect(); 
            renderSelectedDrills(); 
            updateStartButton();
            if($("session-notes")) $("session-notes").value = "";
            switchTab("history");
        }
    });
}

// ================================
// HISTORY & ANALYTICS
// ================================

async function renderHistory() {
    const box = $("history-list");
    if(!box) return;
    box.innerHTML = "<p class='text-gray-400 text-sm'>Loading...</p>";
    
    const sessions = await loadSessions();
    box.innerHTML = sessions.length ? "" : "<p class='text-gray-400'>No history found.</p>";

    sessions.forEach(s => {
        const div = document.createElement("div");
        div.className = "card mb-4 relative border border-gray-200 p-4 cursor-pointer hover:shadow-md transition";
        div.innerHTML = `
            <div class="font-bold text-lg">${s.date}</div>
            <div class="text-sm text-gray-600">${s.drills ? s.drills.length : 0} drills completed</div>
            <button class="del-btn absolute top-4 right-4 text-red-300 hover:text-red-500 font-bold px-2">✕</button>
        `;
        
        const delBtn = div.querySelector(".del-btn");
        delBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if(confirm("Delete this session?")) {
                await deleteSessionFromCloud(s.id);
                renderHistory();
                renderAnalytics();
            }
        });
        
        div.addEventListener("click", (e) => {
            if(e.target !== delBtn) {
                const content = (s.drillResults || []).map(r => 
                    `<div class="flex justify-between border-b pb-1 mb-1"><span>${r.name}</span><span class="font-bold text-emerald-600">${r.score.raw || '-'}</span></div>`
                ).join('');
                showModal(s.date, content || "No details.");
            }
        });
        box.appendChild(div);
    });
}

async function renderAnalytics() {
    const box = $("analytics-container");
    if(!box) return;
    const sessions = await loadSessions();
    if(!sessions.length) { box.innerHTML = "<p class='text-gray-400'>No data.</p>"; return; }

    const stats = {};
    sessions.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s => {
        if(s.drillResults) {
            s.drillResults.forEach(r => {
                // Robust check for numeric value
                if(r.score && r.score.numeric !== null && !isNaN(r.score.numeric)) {
                    if(!stats[r.name]) stats[r.name] = [];
                    stats[r.name].push(r.score.numeric);
                }
            });
        }
    });

    box.innerHTML = "";
    Object.keys(stats).forEach(name => {
        const scores = stats[name];
        if(scores.length === 0) return;
        
        const avg = (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
        const cid = "c-" + Math.random().toString(36).substr(2, 9);
        
        box.innerHTML += `
        <div class="card mb-4 p-4">
            <div class="flex justify-between font-bold mb-2"><span>${name}</span><span class="bg-emerald-100 text-emerald-800 px-2 rounded text-sm">Avg: ${avg}</span></div>
            <div class="h-32"><canvas id="${cid}"></canvas></div>
        </div>`;

        setTimeout(() => {
            new Chart(document.getElementById(cid), {
                type: 'line',
                data: { labels: scores.map((_,i)=>i+1), datasets: [{ data: scores, borderColor: '#10b981', tension: 0.3, pointRadius: 3 }] },
                options: { plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{y:{beginAtZero:true}} }
            });
        }, 100);
    });
}

function switchTab(t) {
    document.querySelectorAll(".tab-pane").forEach(e => e.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(e => e.classList.remove("active"));
    
    const target = $(t);
    if (target) target.classList.remove("hidden");
    
    const btn = document.querySelector(`[data-tab="${t}"]`);
    if (btn) btn.classList.add("active");

    if (t === "history") renderHistory();
    if (t === "analytics") renderAnalytics();
    if (t === "log") renderSelectedDrills(); 
    window.scrollTo(0,0);
}