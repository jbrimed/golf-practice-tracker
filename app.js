// ================================
// app.js — ULTIMATE VERSION (REVIEWED & FIXED)
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

// ----------------------
// INITIALIZATION
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Ready. Initializing...");

    // 1. Global Event Listeners (Delegation)
    setupGlobalListeners();

    // 2. Auth Logic
    subscribeToAuth((user) => {
        handleAuthChange(user);
    });

    // 3. Login Buttons
    const googleBtn = $("google-login-btn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try { await loginWithGoogle(); } catch (err) { alert("Login error: " + err.message); }
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
                    <img src="${user.photoURL || 'https://via.placeholder.com/30'}" class="w-8 h-8 rounded-full border border-slate-300">
                    <div class="hidden sm:block text-right">
                        <p class="text-xs font-bold text-slate-700">${user.displayName || 'Golfer'}</p>
                        <button class="action-btn text-xs text-red-500 hover:underline" data-action="logout">Sign Out</button>
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
    try {
        restoreDraft();
    } catch (e) {
        console.error("Draft error", e);
        clearDraft();
    }
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); // This might be empty initially, which is fine
    updateStartButton();
}

// ----------------------
// GLOBAL LISTENER
// ----------------------
function setupGlobalListeners() {
    document.body.addEventListener("click", (e) => {
        const target = e.target;
        
        // Action Buttons
        const btn = target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id; 

        if (action === "logout") {
            logout().then(() => location.reload());
        }
        else if (action === "tab") {
            switchTab(btn.dataset.tab);
        }
        else if (action === "preset") {
            generateSessionPreset(btn.dataset.type);
        }
        else if (action === "add-drill") {
            if (selectedDrillIds.has(id)) selectedDrillIds.delete(id);
            else selectedDrillIds.add(id);
            renderDrillSelect();
            updateStartButton();
            triggerAutoSave();
        }
        else if (action === "start-session") {
            if (selectedDrillIds.size > 0) {
                renderSelectedDrills(); // Ensure log is up to date
                switchTab("log");
            }
        }
        else if (action === "save-session") {
            handleSaveSession();
        }
        else if (action === "roll-rng") {
            handleRngRoll(btn, id);
        }
        else if (action === "gen-targets") {
            handleMultiTargetGen(btn, id);
        }
        else if (action === "delete-history") {
             if(confirm("Delete this session?")) {
                deleteSessionFromCloud(id).then(() => renderHistory());
            }
        }
    });

    // Input Listeners
    document.body.addEventListener("input", (e) => {
        if (e.target.matches(".drill-score-input") || e.target.matches("textarea")) {
            triggerAutoSave();
        }
        if (e.target.matches(".calc-input")) {
            handleCalcInput(e.target);
            triggerAutoSave();
        }
        if (e.target.matches(".multi-inp")) {
            handleMultiInput(e.target);
            triggerAutoSave();
        }
    });
}

// ----------------------
// LOGIC HANDLERS
// ----------------------

function handleCalcInput(input) {
    const group = input.dataset.group;
    const inputs = document.querySelectorAll(`.calc-input[data-group="${group}"]`);
    const values = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
    
    if (values.length > 1) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const variance = values.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / values.length;
        const sd = Math.sqrt(variance);

        const sdEl = document.getElementById(`calc-sd-${group}`);
        const avgEl = document.getElementById(`calc-avg-${group}`);
        if(sdEl) sdEl.innerText = sd.toFixed(2);
        if(avgEl) avgEl.innerText = avg.toFixed(1);

        // Update hidden score input
        const hidden = document.querySelector(`.drill-score-input[data-id="${group}"]`);
        if(hidden) hidden.value = sd.toFixed(2);
    }
}

function handleMultiInput(input) {
    const container = input.closest(".rng-table-container");
    if (!container) return;
    
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
    const drillId = container.id.replace("rng-table-", "");
    
    const scoreEl = document.getElementById(`rng-score-${drillId}`);
    if(scoreEl) scoreEl.innerText = avgError;
    
    const hidden = document.querySelector(`.drill-score-input[data-id="${drillId}"]`);
    if(hidden) hidden.value = avgError;
}

function handleRngRoll(btn, id) {
    const choicesData = btn.dataset.choices;
    const targetEl = document.getElementById(btn.dataset.target);
    
    if (choicesData && choicesData !== "undefined") {
        try {
            const choices = JSON.parse(choicesData);
            targetEl.innerText = choices[Math.floor(Math.random() * choices.length)];
        } catch (e) { console.error(e); }
    } else {
        const min = parseInt(btn.dataset.min);
        const max = parseInt(btn.dataset.max);
        targetEl.innerText = "Target: " + (Math.floor(Math.random() * (max - min + 1)) + min) + "y";
    }
}

function handleMultiTargetGen(btn, id) {
    const min = parseInt(btn.dataset.min);
    const max = parseInt(btn.dataset.max);
    const count = parseInt(btn.dataset.count);
    
    const rowsContainer = document.getElementById(`rng-rows-${id}`);
    const tableContainer = document.getElementById(`rng-table-${id}`);
    
    if (!rowsContainer) return;
    
    let html = "";
    for(let i=0; i<count; i++) {
        const target = Math.floor(Math.random() * (max - min + 1)) + min;
        html += `
        <div class="grid grid-cols-3 gap-2 items-center multi-row mb-2" data-target="${target}">
            <span class="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded text-center">${target}y</span>
            <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 1">
            <input type="number" class="input-style h-9 px-1 text-center multi-inp font-mono" placeholder="Carry 2">
        </div>`;
    }
    
    rowsContainer.innerHTML = html;
    tableContainer.classList.remove("hidden");
    btn.classList.add("hidden");
}

async function handleSaveSession() {
    if (selectedDrillIds.size === 0) { alert("No drills selected."); return; }
    
    // Build Results
    const drillResults = Array.from(selectedDrillIds).map(id => {
        const drill = allDrillsMap.get(id);
        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
        
        const raw = scoreInput ? scoreInput.value : "";
        const note = noteInput ? noteInput.value : "";
        
        let num = null;
        if (raw) {
            if (raw.includes("/")) {
                const [n, d] = raw.split("/");
                if (d && parseFloat(d) !== 0) num = (parseFloat(n) / parseFloat(d)) * 100;
            } else {
                const match = raw.match(/[-+]?\d*\.?\d+/);
                if (match) num = parseFloat(match[0]);
            }
        }
        
        return { id, name: drill?.name || id, score: { raw, numeric: num }, notes: note };
    });

    const dateVal = $("session-date")?.value || new Date().toISOString().slice(0, 10);

    const success = await saveSession({
        date: dateVal,
        drills: Array.from(selectedDrillIds),
        drillResults,
        notes: $("session-notes")?.value || "",
        createdAt: new Date().toISOString()
    });

    if (success) {
        alert("Session Saved!");
        selectedDrillIds.clear();
        selectedSkills.clear();
        clearDraft();
        renderSkills();
        renderDrillSelect();
        renderSelectedDrills(); // Clear log UI
        updateStartButton();
        switchTab("history");
    }
}

// ----------------------
// GENERATORS
// ----------------------
function generateSessionPreset(type) {
    console.log("Generating Preset:", type);
    selectedDrillIds.clear(); 
    selectedSkills.clear();
    clearDraft();

    let cats = [];
    if(type === 'random') cats = ['driver','irons','wedges','putting'];
    if(type === 'shortgame') cats = ['wedges','short_game','putting']; 
    if(type === 'driver_iron') cats = ['driver','irons'];
    if(type === 'putting') cats = ['putting'];

    cats.forEach(cat => {
        // FIX: Access DRILLS properties safely using optional chaining or direct access if structure is guaranteed
        const categoryDrills = DRILLS[cat]; 
        if (categoryDrills && categoryDrills.length > 0) {
            const d = categoryDrills[Math.floor(Math.random() * categoryDrills.length)];
            selectedDrillIds.add(d.id);
            d.skills.forEach(s => selectedSkills.add(s));
        }
    });

    renderSkills();
    renderDrillSelect();
    renderSelectedDrills();
    updateStartButton();
    triggerAutoSave();
    
    if(selectedDrillIds.size > 0) {
         // Optional: auto-switch to log or just show drills
         // switchTab("log"); 
    }
}

// ----------------------
// RENDERING
// ----------------------
function switchTab(tabId) {
    document.querySelectorAll(".tab-pane").forEach(e => e.classList.add("hidden"));
    document.querySelectorAll(".tab-button").forEach(e => e.classList.remove("active"));
    
    const target = $(tabId);
    if (target) target.classList.remove("hidden");
    
    const btn = document.querySelector(`[data-action="tab"][data-tab="${tabId}"]`);
    if (btn) btn.classList.add("active");

    if (tabId === "history") renderHistory();
    if (tabId === "analytics") renderAnalytics();
    if (tabId === "log") renderSelectedDrills();
    
    window.scrollTo(0,0);
}

function renderSkills() {
    const container = $("skill-select");
    if (!container) return;
    container.innerHTML = "";

    const grouped = {};
    SKILLS.forEach(s => {
        const c = s.category || "Other";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(s);
    });

    Object.keys(grouped).forEach((cat, i) => {
        const details = document.createElement("details");
        details.className = "group border border-gray-200 rounded-lg mb-2 overflow-hidden";
        if (i === 0) details.open = true;
        details.innerHTML = `<summary class="flex justify-between p-3 bg-gray-50 cursor-pointer font-bold text-emerald-900 hover:bg-gray-100 transition"><span>${cat}</span><span>▼</span></summary>`;
        const content = document.createElement("div");
        content.className = "p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border-t border-gray-100";

        grouped[cat].forEach(skill => {
            const isChecked = selectedSkills.has(skill.id) ? "checked" : "";
            const row = document.createElement("label");
            row.className = "flex items-center space-x-3 p-2 rounded hover:bg-emerald-50 cursor-pointer transition";
            row.innerHTML = `<input type="checkbox" class="skill-check h-4 w-4 text-emerald-600 rounded" data-skill="${skill.id}" ${isChecked}><span class="text-sm font-medium text-gray-700">${skill.label}</span>`;
            
            row.querySelector("input").addEventListener("change", (e) => {
                if (e.target.checked) selectedSkills.add(skill.id);
                else selectedSkills.delete(skill.id);
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
    if (!container) return;
    container.innerHTML = "";

    if (selectedSkills.size === 0 && selectedDrillIds.size === 0) {
        if (presets) presets.classList.remove("hidden");
        container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic">Select focus areas...</div>`;
        return;
    } else {
        if (presets) presets.classList.add("hidden");
    }

    const drillsToShow = Object.values(DRILLS).flat().filter(d => d.skills.some(s => selectedSkills.has(s)));
    const skillGroups = {};
    
    selectedSkills.forEach(sId => {
        const skill = SKILLS.find(s => s.id === sId);
        if (skill) {
            const matches = drillsToShow.filter(d => d.skills.includes(sId));
            if (matches.length) skillGroups[skill.label] = matches;
        }
    });

    Object.keys(skillGroups).forEach(label => {
        const sec = document.createElement("div");
        sec.className = "mb-6";
        sec.innerHTML = `<h3 class="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 mb-3 bg-emerald-50 py-1 rounded-r">${label}</h3><div class="space-y-3"></div>`;
        container.appendChild(sec);
        const grp = sec.querySelector("div");

        skillGroups[label].forEach(drill => {
            if (grp.querySelector(`[data-card-id="${drill.id}"]`)) return;

            const isAdded = selectedDrillIds.has(drill.id);
            const btnClass = isAdded ? "bg-red-50 text-red-600 border border-red-200" : "bg-black text-white hover:bg-gray-800";
            const btnText = isAdded ? "Remove" : "Add";
            
            const card = document.createElement("div");
            card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-center";
            card.setAttribute("data-card-id", drill.id);
            card.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center gap-2"><h4 class="font-bold text-gray-800">${drill.name}</h4></div>
                    <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">⏱ ${drill.duration}m</span>
                </div>
                <button class="action-btn px-4 py-2 rounded text-sm font-bold transition ${btnClass}" data-action="add-drill" data-id="${drill.id}">${btnText}</button>
            `;
            grp.appendChild(card);
        });
    });
}

function updateStartButton() {
    const btn = $("go-to-log");
    if (btn) {
        btn.querySelector("span").innerText = selectedDrillIds.size > 0 ? `Start Practice (${selectedDrillIds.size})` : "Start Session";
        if (selectedDrillIds.size === 0) {
            btn.classList.add("opacity-50", "cursor-not-allowed");
            btn.setAttribute("data-action", ""); 
        } else {
            btn.classList.remove("opacity-50", "cursor-not-allowed");
            btn.setAttribute("data-action", "start-session"); 
        }
    }
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
}

function renderSelectedDrills() {
    const container = $("selected-drills-log");
    if (!container) return;
    container.innerHTML = "";
    
    if (selectedDrillIds.size === 0) return;

    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        if (!drill) return;

        const metric = drill.metricType || "CUSTOM";
        const card = document.createElement("div");
        card.className = "card border-l-4 border-black mb-6";
        
        let inputsHtml = "";
        
        if (metric === "DISPERSION_CALC") {
            inputsHtml = `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(5).fill(0).map(() => `<input type="number" class="calc-input input-style px-1 text-center font-mono" data-group="${id}">`).join('')}
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded flex justify-between">
                <span>Avg: <strong id="calc-avg-${id}">--</strong></span><span>SD: <strong id="calc-sd-${id}" class="text-emerald-600">--</strong></span>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />`;
        } else if (metric === "RNG_MULTILOG") {
            inputsHtml = `
            <div class="mb-2 rng-table-container" id="rng-table-${id}">
                <button class="action-btn w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold mb-2 transition hover:bg-indigo-700"
                    data-action="gen-targets"
                    data-id="${id}"
                    data-min="${drill.randomizer.min}"
                    data-max="${drill.randomizer.max}"
                    data-count="${drill.randomizer.count || 5}">🎲 Generate 5 Targets</button>
                
                <div id="rng-rows-${id}" class="space-y-2"></div>
                
                <div class="mt-2 text-xs text-right text-gray-500 font-medium hidden" id="rng-table-${id}-stats">
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
                    <button class="action-btn bg-indigo-600 text-white px-2 py-1 rounded text-xs" 
                        data-action="roll-rng" 
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
            <div class="text-sm text-gray-600">${s.drills ? s.drills.length : 0} drills</div>
            <button class="action-btn absolute top-4 right-4 text-red-300 hover:text-red-600 font-bold px-2" data-action="delete-history" data-id="${s.id}">✕</button>
        `;
        div.addEventListener("click", (e) => {
            if(!e.target.matches(".action-btn")) {
                let content = (s.drillResults || []).map(r => `<div class="flex justify-between border-b pb-1 mb-1"><span>${r.name}</span><span class="font-bold text-emerald-600">${r.score.raw || '-'}</span></div>`).join('');
                showModal(s.date, content);
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

// ================================
// DRAFT HELPERS
// ================================
function restoreDraft() {
    const draft = loadDraft();
    if(!draft) return;
    if(draft.skills) draft.skills.forEach(s => selectedSkills.add(s));
    if(draft.drills) draft.drills.forEach(d => selectedDrillIds.add(d));
}

function triggerAutoSave() {
    saveDraft({
        skills: Array.from(selectedSkills),
        drills: Array.from(selectedDrillIds)
    });
}