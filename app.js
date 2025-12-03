// ================================
// app.js — ULTIMATE VERSION (FIXED & ROBUST)
// Features: Safety Checks, Auto-Recovery, Event Listeners
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
// INITIALIZATION & AUTH
// ----------------------

// Main Init Function (Moved to top scope to fix ReferenceError)
function initAppData() {
    console.log("Initializing App Data...");
    
    // 1. Restore Draft (Safe Mode)
    try {
        restoreDraft();
    } catch (e) {
        console.error("Draft restore failed. Clearing bad draft.", e);
        clearDraft();
    }

    // 2. Render Initial UI
    renderSkills(); 
    renderDrillSelect(); 
    initSaveSession();
    
    // 3. Attach Global Event Listeners (Tabs & Presets)
    document.querySelectorAll(".tab-button").forEach(b => {
        b.removeEventListener("click", handleTabClick); // Prevent duplicates
        b.addEventListener("click", handleTabClick);
    });

    document.querySelectorAll(".preset-btn").forEach(btn => {
        // Clone node to strip old listeners if re-initializing
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
            console.log("Preset Clicked:", newBtn.dataset.type);
            generateSessionPreset(newBtn.dataset.type);
        });
    });
    
    const goLog = $("go-to-log");
    if(goLog) {
        // Clear old listeners
        const newGoLog = goLog.cloneNode(true);
        goLog.parentNode.replaceChild(newGoLog, goLog);
        newGoLog.addEventListener("click", () => { 
            if(selectedDrillIds.size) switchTab("log"); 
        });
    }

    console.log("App Initialized Successfully.");
}

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
                        <button id="logout-btn" class="text-xs text-red-500 hover:underline">Sign Out</button>
                    </div>
                </div>
            `;
            const logoutBtn = $("logout-btn");
            if (logoutBtn) logoutBtn.addEventListener("click", () => logout().then(() => location.reload()));
        }
        // NOW this function is defined and accessible
        initAppData(); 
    } else {
        if(loginScreen) loginScreen.classList.remove("hidden");
        if(appScreen) appScreen.classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Ready. Initializing...");

    // 1. Setup Auth Listeners
    try {
        subscribeToAuth((user) => {
            console.log("Auth State Changed:", user ? "Logged In" : "Logged Out");
            handleAuthChange(user);
        });
    } catch (e) {
        console.error("Auth Subscription Failed:", e);
        // Fallback: Try initializing app anyway if auth fails (offline mode attempt)
        initAppData();
    }

    // 2. Wire up Login Buttons (Always accessible)
    const googleBtn = $("google-login-btn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            try {
                await loginWithGoogle();
            } catch (err) {
                alert("Login error: " + err.message);
            }
        });
    }
});


// Wrapper for tab clicks
function handleTabClick(e) {
    switchTab(e.target.dataset.tab);
}

// ================================
// CORE LOGIC & FEATURES
// ================================

function restoreDraft() {
    const draft = loadDraft();
    if (!draft) return;

    if (draft.skills) draft.skills.forEach(s => selectedSkills.add(s));
    renderSkills(); // Sync UI checkboxes

    if (draft.drills) {
        draft.drills.forEach(d => selectedDrillIds.add(d));
        
        // Render everything based on the restored drill IDs
        renderDrillSelect(); 
        renderPreviewList();
        updateGoToLogButton();
        
        if (selectedDrillIds.size > 0) {
            renderSelectedDrills();
            // Populate input values after rendering
            setTimeout(() => {
                if(draft.drillData) {
                    Object.keys(draft.drillData).forEach(id => {
                        const data = draft.drillData[id];
                        const scoreInput = document.querySelector(`.drill-score-input[data-id="${id}"]`);
                        const noteInput = document.querySelector(`textarea[data-note-id="${id}"]`);
                        if(scoreInput && data.score) scoreInput.value = data.score;
                        if(noteInput && data.note) noteInput.value = data.note;
                    });
                }
                if(draft.mainNotes && $("session-notes")) $("session-notes").value = draft.mainNotes;
            }, 100);
        }
    }
}

function generateSessionPreset(type) {
    console.log("Generating Preset:", type);
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
    renderDrillSelect(); // This will hide the presets
    renderPreviewList(); 
    updateGoToLogButton();
    triggerAutoSave();
}

function renderDrillSelect() {
  const container = $("drill-select");
  const presets = $("presets-container");
  if(!container) return;
  container.innerHTML = "";
  
  // TOGGLE PRESETS
  if (selectedSkills.size === 0 && selectedDrillIds.size === 0) {
      if(presets) presets.classList.remove("hidden");
      container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm italic">Select focus areas above to add custom drills...</div>`;
      return;
  } else {
      if(presets) presets.classList.add("hidden");
  }

  const drillsToShow = Object.values(DRILLS).flat().filter(d => d.skills.some(s => selectedSkills.has(s)));
  
  // Create map for grouping
  const skillGroups = {};
  selectedSkills.forEach(sId => {
      const skill = skillMap.get(sId);
      if(skill) {
          const matches = drillsToShow.filter(d => d.skills.includes(sId));
          if(matches.length) skillGroups[skill.label] = matches;
      }
  });

  Object.keys(skillGroups).forEach(label => {
      const sec = document.createElement("div");
      sec.className = "mb-6";
      sec.innerHTML = `<h3 class="text-md font-bold text-emerald-900 border-l-4 border-emerald-500 pl-3 mb-3 bg-emerald-50 py-1 rounded-r">${label}</h3><div class="space-y-3"></div>`;
      container.appendChild(sec);
      const grp = sec.querySelector(`div`);
      
      skillGroups[label].forEach(drill => {
          if(grp.querySelector(`[data-card-id="${drill.id}"]`)) return;
          
          const isAdded = selectedDrillIds.has(drill.id);
          const card = document.createElement("div");
          card.setAttribute("data-card-id", drill.id);
          card.className = "card border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 justify-between items-center";
          
          let badge = "";
          if (drill.targetValues?.successThreshold) badge = `<span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded ml-2">Goal: ${drill.targetValues.successThreshold}+</span>`;

          card.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2"><h4 class="font-bold text-gray-800">${drill.name}</h4>${badge}</div>
                <span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-medium">⏱ ${drill.duration}m</span>
            </div>
            <button class="add-drill px-4 py-2 rounded text-sm font-bold transition ${isAdded?'bg-red-50 text-red-600 border border-red-200':'bg-black text-white hover:bg-gray-800'}">${isAdded?'Remove':'Add'}</button>`;
          
          card.querySelector(".add-drill").addEventListener("click", () => {
              if(selectedDrillIds.has(drill.id)) selectedDrillIds.delete(drill.id); 
              else selectedDrillIds.add(drill.id);
              
              renderDrillSelect(); 
              renderPreviewList(); 
              updateGoToLogButton(); 
              triggerAutoSave();
          });
          
          grp.appendChild(card);
      });
  });
}

// ================================
// UI UPDATERS
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
        
        const checkbox = row.querySelector("input");
        if (selectedSkills.has(skill.id)) checkbox.checked = true;
        
        checkbox.addEventListener("change", (e) => {
            if(e.target.checked) selectedSkills.add(skill.id); 
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

function renderPreviewList() {
    const badge = $("drill-count-badge");
    if(badge) badge.innerText = selectedDrillIds.size;
    
    // Clear All Button Logic
    const header = $("drill-select")?.previousElementSibling;
    let clearBtn = $("clear-drills-btn");
    
    if (selectedDrillIds.size > 0) {
        if (!clearBtn && header) {
            clearBtn = document.createElement("button");
            clearBtn.id = "clear-drills-btn";
            clearBtn.className = "text-xs text-red-500 font-bold hover:text-red-700 ml-auto mr-2";
            clearBtn.innerText = "Clear All";
            clearBtn.addEventListener("click", () => {
                if(confirm("Clear selection?")) {
                    selectedDrillIds.clear();
                    selectedSkills.clear();
                    renderSkills();
                    renderDrillSelect();
                    renderPreviewList();
                    updateGoToLogButton();
                    triggerAutoSave();
                }
            });
            header.insertBefore(clearBtn, header.lastElementChild);
        }
    } else {
        if (clearBtn) clearBtn.remove();
    }
}

function updateGoToLogButton() {
    const btn = $("go-to-log");
    if(!btn) return;
    btn.innerText = selectedDrillIds.size ? `Start Practice (${selectedDrillIds.size})` : "Start Session";
    btn.disabled = selectedDrillIds.size === 0;
    if(selectedDrillIds.size === 0) btn.classList.add("opacity-50"); 
    else btn.classList.remove("opacity-50");
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

// ================================
// LOGGING & SAVING
// ================================

function renderSelectedDrills() {
    const container = $("selected-drills-log");
    if(!container) return;
    container.innerHTML = "";
    if (selectedDrillIds.size === 0) return;

    selectedDrillIds.forEach(id => {
        const drill = allDrillsMap.get(id);
        if(!drill) return;
        
        const metric = drill.metricType || "CUSTOM";
        const card = document.createElement("div");
        card.className = "card border-l-4 border-black mb-6";
        
        let goalText = "";
        if (drill.targetValues) {
            if (drill.targetValues.successThreshold) goalText = `<div class="bg-amber-50 text-amber-800 text-xs font-bold px-2 py-1 rounded mt-2 inline-block">🎯 Goal: ${drill.targetValues.successThreshold}/${drill.targetValues.shots}</div>`;
        }

        card.innerHTML = `
            <div class="mb-3"><h3 class="text-lg font-bold">${drill.name}</h3>${goalText}<div class="bg-gray-50 p-3 rounded text-sm mt-2 text-gray-700 border border-gray-100">${drill.description}</div></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>${getMetricInputHTML(id, metric, drill)}</div>
                <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label><textarea data-note-id="${id}" class="input-style w-full h-24 resize-none" placeholder="Pattern / Notes..."></textarea></div>
            </div>`;
        container.appendChild(card);

        // Listeners for input changes
        card.querySelectorAll("input, textarea").forEach(el => el.addEventListener("input", triggerAutoSave));

        // --- METRIC SPECIFIC LOGIC ---
        if(metric === METRIC_TYPES.DISPERSION_CALC) {
            const inputs = card.querySelectorAll(`.calc-input[data-group="${id}"]`);
            inputs.forEach(i => i.addEventListener("input", () => {
                const vals = Array.from(inputs).map(inp => parseFloat(inp.value)).filter(v=>!isNaN(v));
                if(vals.length > 1) {
                    const sd = calculateSD(vals);
                    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
                    card.querySelector(`#calc-sd-${id}`).innerText = sd.toFixed(1);
                    card.querySelector(`#calc-avg-${id}`).innerText = avg.toFixed(1);
                    // Save to hidden
                    const hidden = card.querySelector(`.drill-score-input`);
                    if(hidden) hidden.value = sd.toFixed(2);
                }
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

    if(type === METRIC_TYPES.DISPERSION_CALC) {
        return extraHTML + `
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Enter 5 Carry Distances</label>
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(5).fill(0).map(() => `<input type="number" class="calc-input input-style px-1 text-center font-mono" data-group="${id}">`).join('')}
            </div>
            <div class="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded flex justify-between">
                <span>Avg: <strong id="calc-avg-${id}">--</strong></span><span>SD: <strong id="calc-sd-${id}" class="text-emerald-600">--</strong></span>
            </div>
            <input type="hidden" data-id="${id}" class="drill-score-input" />`;
    }
    
    if(type === METRIC_TYPES.RNG_MULTILOG) {
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
    }

    // Default text input for others
    return extraHTML + `<label class="block text-xs font-bold text-gray-500 uppercase mb-1">Score</label><input data-id="${id}" type="text" class="input-style drill-score-input" placeholder="Result" />`;
}

function initSaveSession() {
    const saveBtn = $("save-session");
    if(!saveBtn) return;

    // Clone to remove old listeners
    const newBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newBtn, saveBtn);

    newBtn.addEventListener("click", async () => {
        if (selectedDrillIds.size === 0) { alert("No drills selected."); return; }
        
        // Build Result Object
        const drillResults = Array.from(selectedDrillIds).map(id => {
            const raw = document.querySelector(`.drill-score-input[data-id="${id}"]`)?.value || "";
            const note = document.querySelector(`textarea[data-note-id="${id}"]`)?.value || "";
            let num = null;
            
            // Parse numeric score
            if(raw.includes("/")) {
                const [n, d] = raw.split("/");
                if(d && parseFloat(d)!==0) num = (parseFloat(n)/parseFloat(d))*100;
            } else {
                const match = raw.match(/[\d\.]+/);
                if(match) num = parseFloat(match[0]);
            }

            return { id, name: allDrillsMap.get(id)?.name, score: { raw, numeric: num }, notes: note };
        });

        const saved = await saveSession({
            date: $("session-date")?.value || new Date().toISOString().slice(0,10),
            drills: Array.from(selectedDrillIds),
            drillResults,
            notes: $("session-notes")?.value || "",
            createdAt: new Date().toISOString()
        });
        
        if(saved) {
            alert("Session saved!");
            clearDraft();
            selectedDrillIds.clear(); selectedSkills.clear();
            renderSkills(); renderDrillSelect(); renderPreviewList(); updateGoToLogButton();
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
    box.innerHTML = sessions.length ? "" : "<p class='text-gray-400'>No history yet.</p>";
    
    sessions.forEach(s => {
        const div = document.createElement("div");
        div.className = "card mb-4 relative border border-gray-200";
        div.innerHTML = `
            <div class="font-bold">${s.date}</div>
            <div class="text-sm text-gray-600">${s.drills ? s.drills.length : 0} drills completed</div>
            <button class="del-btn absolute top-4 right-4 text-red-300 hover:text-red-500">✕</button>
        `;
        div.querySelector(".del-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            if(confirm("Delete this session?")) {
                await deleteSessionFromCloud(s.id);
                renderHistory();
            }
        });
        div.addEventListener("click", (e) => {
           if(!e.target.classList.contains("del-btn")) showSessionDetails(s);
        });
        box.appendChild(div);
    });
}

async function renderAnalytics() {
    const box = $("analytics-container");
    if(!box) return;
    const sessions = await loadSessions();
    
    if(!sessions.length) { box.innerHTML = "<p class='text-gray-400'>No data.</p>"; return; }
    
    // Simple aggregation
    const stats = {};
    sessions.forEach(s => {
        if(s.drillResults) {
            s.drillResults.forEach(res => {
                if(res.score.numeric !== null) {
                    if(!stats[res.name]) stats[res.name] = [];
                    stats[res.name].push(res.score.numeric);
                }
            });
        }
    });
    
    box.innerHTML = "";
    Object.keys(stats).forEach(name => {
        const scores = stats[name];
        const avg = (scores.reduce((a,b)=>a+b,0) / scores.length).toFixed(1);
        const max = Math.max(...scores).toFixed(1);
        box.innerHTML += `
            <div class="card mb-4">
                <div class="flex justify-between font-bold mb-2">
                    <span>${name}</span>
                    <span class="text-sm bg-emerald-50 text-emerald-700 px-2 py-1 rounded">Avg: ${avg}</span>
                </div>
                <div class="text-xs text-gray-500">Best: ${max} • Attempts: ${scores.length}</div>
            </div>
        `;
    });
}

function showSessionDetails(s) {
    const content = (s.drillResults || []).map(r => 
        `<div class="flex justify-between border-b border-gray-100 pb-2 mb-2">
            <span class="font-medium text-sm">${r.name}</span>
            <span class="font-mono font-bold text-emerald-600">${r.score.raw || '-'}</span>
         </div>`
    ).join('');
    showModal(s.date, content || "No details recorded.");
}