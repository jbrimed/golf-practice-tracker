// ================================
// app.js — SCRATCH EDITION WITH WEEKLY PLANS
// Features: Weekly Plan Builder, Raw Metric Logging, Dynamic Leveling
// REFACTORED: Uses imported SKILLS array for filter rendering.
// ================================

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { 
    saveSession, loadSessions, deleteSessionFromCloud, 
    saveDraft, loadDraft, clearDraft,
    loginWithGoogle, logout, subscribeToAuth
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
// STATE & INIT
// ----------------------
let selectedSkills = new Set();
let selectedDrillIds = new Set();
let userProgression = {}; 
let activePlan = null; 

// Map of all drills from drills.js for fast lookup
const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

document.addEventListener("DOMContentLoaded", () => {
    setupGlobalClicks();
    setupGlobalInputs();
    
    // Load persisted data
    activePlan = JSON.parse(localStorage.getItem("golf_active_plan") || "null");
    userProgression = JSON.parse(localStorage.getItem('golf_progression') || '{}');

    try {
        subscribeToAuth((user) => handleAuthChange(user));
    } catch (e) { console.error("Auth Error:", e); initAppData(); }
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
                    <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Player</span>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900">${user.displayName || 'Scratch Player'}</span>
                        <button class="text-[10px] text-slate-500 hover:text-red-600 border border-slate-300 hover:border-red-400 px-1 rounded-sm uppercase bg-white font-medium" data-action="logout">Sign Out</button>
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
    renderPlanUI(); 
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); 
    updateStartButton();
}

// ----------------------
// HELPER: DRILL PARAMS
// ----------------------
function getDrillParams(id) {
    const drill = allDrillsMap.get(id);
    if (!drill) return null;
    if (drill.progression) {
        const currentLevel = userProgression[id] || 1;
        const params = drill.progression.find(p => p.level === currentLevel) || drill.progression[0];
        
        return {
            ...drill,
            ...params,
            currentLevel,
            description: `${params.name} // ${drill.description}`
        };
    }
    return drill;
}

// ----------------------
// PLAN BUILDER LOGIC
// ----------------------
function generateWeekPlan() {
    const checks = document.querySelectorAll('.plan-focus-check:checked');
    const areas = Array.from(checks).map(c => c.value);
    
    if(areas.length === 0) { alert("Select at least one focus area."); return; }

    const tasks = [];
    areas.forEach(area => {
        // Find the top-level categories based on the checkbox value (e.g., 'driver', 'irons')
        const categoryDrills = Object.values(DRILLS[area] || {}).flat();
        if(categoryDrills.length > 0) {
            
            let chosen = new Set();
            while(chosen.size < 3 && chosen.size < categoryDrills.length) {
                const randomDrill = categoryDrills[Math.floor(Math.random() * categoryDrills.length)];
                if (!chosen.has(randomDrill.id)) {
                    chosen.add(randomDrill.id);
                    tasks.push({ 
                        id: randomDrill.id, 
                        cat: area, 
                        done: 0, 
                        target: 3, // Goal: 3 successful completions this week
                    });
                }
            }
        }
    });

    if (tasks.length === 0) {
        alert("Could not generate a sufficient plan based on selections. Try again.");
        return;
    }

    activePlan = { focusAreas: areas, tasks: tasks, created: new Date().toISOString() };
    localStorage.setItem("golf_active_plan", JSON.stringify(activePlan));
    renderPlanUI();
}

function renderPlanUI() {
    const activeView = $("active-plan-view");
    const createView = $("create-plan-view");
    const list = $("plan-tasks-list");
    const progBar = $("plan-progress-bar");

    if(!activePlan) {
        activeView.classList.add("hidden");
        createView.classList.remove("hidden");
        return;
    }

    activeView.classList.remove("hidden");
    createView.classList.add("hidden");
    list.innerHTML = "";

    const doneCount = activePlan.tasks.reduce((sum, t) => sum + Math.min(t.done, t.target), 0);
    const totalTarget = activePlan.tasks.reduce((sum, t) => sum + t.target, 0);
    const pct = totalTarget === 0 ? 0 : (doneCount / totalTarget) * 100;
    
    if(progBar) progBar.style.width = `${pct}%`;

    activePlan.tasks.forEach((task) => {
        const drill = getDrillParams(task.id);
        const completion = Math.min(task.done, task.target);
        const isComplete = task.done >= task.target;
        
        const item = document.createElement("div");
        item.className = `flex justify-between items-center p-3 border rounded-sm ${isComplete ? 'bg-green-50 border-green-200 opacity-90' : 'bg-white border-l-4 border-l-4 border-l-tech-blue border-slate-200'}`;
        
        item.innerHTML = `
            <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">${drill?.category || task.cat} - Lvl ${drill.currentLevel}</div>
                <div class="text-xs font-bold text-slate-900">${drill?.name || task.id}</div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold ${isComplete ? 'text-green-600' : 'text-tech-blue'}">${completion}/${task.target} Done</span>
                <button class="load-plan-drill text-[10px] bg-slate-900 text-white px-2 py-1 rounded-sm uppercase disabled:opacity-50" 
                        data-id="${task.id}" 
                        ${isComplete ? 'disabled' : ''}>
                    Load
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// ----------------------
// AUTO-SAVE & DRAFT (No change needed)
// ----------------------
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
        
        const rngContainer = document.getElementById(`rng-rows-${id}`);
        if(rngContainer) {
            const rows = rngContainer.querySelectorAll(".multi-row");
            drillData[id].rngTargets = Array.from(rows).map(r => r.dataset.target);
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

function restoreDraft() {
    const draft = loadDraft();
    if(!draft) return;
    
    if(draft.skills) draft.skills.forEach(s => selectedSkills.add(s));
    if(draft.drills) draft.drills.forEach(d => selectedDrillIds.add(d));
    
    if(draft.date && $("session-date")) $("session-date").value = draft.date;
    if(draft.notes && $("session-notes")) $("session-notes").value = draft.notes;
    
    // Rerendering functions will call getDrillParams which handles progression
}

// ----------------------
// SCORING & PROMOTION
// ----------------------
function evaluateResult(drill, rawScore) {
    let numeric = 0;
    // Streak and Count are simple integers/ratios
    if (rawScore.includes('/')) {
        const parts = rawScore.split('/');
        // Use division for plotting percentage success/score ratio
        numeric = parseFloat(parts[0]) / (parseFloat(parts[1]) || 1); 
    } else {
        // Simple numeric input (SD, Avg Error, Speed, Par Score)
        numeric = parseFloat(rawScore);
    }
    if (isNaN(numeric)) return { passed: false, numeric: 0 };

    let passed = false;

    // Logic: Did they beat the threshold?
    if (drill.scoreType === 'count' || drill.scoreType === 'streak' || drill.scoreType === 'numeric_high') {
        const target = drill.goalThreshold || drill.targetStreak || drill.targetScore || 0;
        passed = numeric >= target;
    } else {
        // Lower is better (SD, Avg Error, Par 18 Score)
        const target = drill.sd_target_yards || drill.tolerance_yards || drill.targetScore || 999;
        passed = numeric <= target;
    }

    return { passed, numeric: numeric }; // numeric is raw metric for charting
}

function checkAndApplyPromotion(drillId, passed) {
    if (!passed) return;
    
    const drill = allDrillsMap.get(drillId);
    if (!drill || !drill.progression) return;

    const currentLevel = userProgression[drillId] || 1;
    const maxLevel = drill.progression.length;
    
    if (currentLevel < maxLevel) {
        const nextLevel = currentLevel + 1;
        const nextLevelParams = drill.progression.find(p => p.level === nextLevel);

        if (confirm(`Promotion available for ${drill.name}!\n\nYou achieved the Level ${currentLevel} standard.\n\nDo you want to move up to the next challenge: ${nextLevelParams.name}?`)) {
            userProgression[drillId] = nextLevel;
            localStorage.setItem('golf_progression', JSON.stringify(userProgression));
            alert(`Level up complete! ${drill.name} is now at Level ${nextLevel}.`);
        }
    }
}

// ----------------------
// SAVING
// ----------------------
async function handleSaveSession() {
    if (selectedDrillIds.size === 0) { alert("Select drills first."); return; }

    const results = Array.from(selectedDrillIds).map(id => {
        const rawInput = document.querySelector(`.drill-score-input[data-id="${id}"]`)?.value || "";
        const note = document.querySelector(`textarea[data-note-id="${id}"]`)?.value || "";
        
        const params = getDrillParams(id);
        const evalResult = evaluateResult(params, rawInput);

        // Update Plan if exists
        if(activePlan) {
            const task = activePlan.tasks.find(t => t.id === id && t.done < t.target);
            if(task && evalResult.passed) {
                task.done += 1;
                localStorage.setItem("golf_active_plan", JSON.stringify(activePlan));
            }
        }

        // Check Promotion
        checkAndApplyPromotion(id, evalResult.passed); 

        return { 
            id, 
            name: params.name, 
            score: { raw: rawInput, numeric: evalResult.numeric }, 
            notes: note,
            level: params.currentLevel || 1,
            scoreType: params.scoreType
        };
    });

    await saveSession({
        date: $("session-date")?.value || new Date().toISOString().split('T')[0],
        drills: Array.from(selectedDrillIds),
        drillResults: results,
        notes: $("session-notes")?.value || "",
        createdAt: new Date().toISOString()
    });

    alert("Session Saved");
    selectedDrillIds.clear();
    clearDraft();
    renderPlanUI();
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills();
    updateStartButton();
    if($("session-notes")) $("session-notes").value = "";
    switchTab("history");
}

// ----------------------
// UI RENDERERS (Standard)
// ----------------------
function renderSkills() {
    const container = $("skill-select");
    if(!container) return;
    container.innerHTML = "";
    
    // Group SKILLS by their category property for the UI structure
    const grouped = SKILLS.reduce((acc, skill) => {
        const cat = skill.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});
    
    // Define the preferred display order
    const order = ["Driver", "Irons", "Wedges", "Short Game", "Putting"];

    order.forEach(catName => {
        const skills = grouped[catName];
        if(!skills || skills.length === 0) return;
        
        const h = document.createElement("div");
        h.className = "bg-slate-100 text-[10px] font-bold text-slate-600 uppercase px-2 py-1 border-b border-t border-slate-200 first:border-t-0";
        h.innerText = catName;
        container.appendChild(h);
        
        skills.forEach(skill => {
            const lbl = document.createElement("label");
            lbl.className = "flex items-center space-x-2 py-2 px-2 border-b border-slate-100";
            lbl.innerHTML = `<input type="checkbox" class="accent-tech-blue" value="${skill.id}"> <span class="text-xs text-slate-700">${skill.label}</span>`;
            lbl.querySelector("input").addEventListener("change", (e) => {
                e.target.checked ? selectedSkills.add(skill.id) : selectedSkills.delete(skill.id);
                renderDrillSelect();
            });
            container.appendChild(lbl);
        });
    });
}

function renderDrillSelect() {
    const container = $("drill-select");
    if(!container) return;
    container.innerHTML = "";
    
    const allDrills = Object.values(DRILLS).flat();
    const active = allDrills.filter(d => d.skills.some(s => selectedSkills.has(s)));
    
    if(selectedSkills.size > 0 && active.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-xs text-slate-400">No drills match filter</div>`;
        return;
    }
    
    if(selectedSkills.size === 0 && selectedDrillIds.size === 0) {
        container.innerHTML = `<div class="text-center py-8 text-slate-300 text-[10px] uppercase">Select filters above</div>`;
        return;
    }

    active.forEach(drill => {
        if(container.querySelector(`[data-did="${drill.id}"]`)) return;
        const isAdded = selectedDrillIds.has(drill.id);
        const params = getDrillParams(drill.id);
        
        const div = document.createElement("div");
        div.className = `flex justify-between items-center p-2 border rounded-sm mb-1 ${isAdded ? 'border-tech-blue bg-blue-50' : 'border-slate-200 bg-white'}`;
        div.innerHTML = `
            <div class="flex-1">
                <div class="text-xs font-bold text-slate-900">${params.name}</div>
                <div class="text-[10px] text-slate-500">${params.duration}m • Lvl ${params.currentLevel || 1}</div>
            </div>
            <button class="add-btn text-[10px] font-bold uppercase px-2 py-1 border rounded ${isAdded ? 'text-white bg-tech-blue border-tech-blue' : 'text-slate-500 border-slate-300 hover:bg-slate-50'}" data-id="${drill.id}">${isAdded ? 'Remove' : 'Add'}</button>
        `;
        container.appendChild(div);
    });
}

function renderSelectedDrills() {
    const container = $("selected-drills-log");
    if(!container) return;
    container.innerHTML = "";
    
    Array.from(selectedDrillIds).forEach((id) => {
        const params = getDrillParams(id);
        if (!params) return;
        const card = document.createElement("div");
        card.className = "tech-card p-4";
        
        let inputHtml = "";
        let placeholderText = "Enter score (e.g., 8/10 or 3.2)";

        if(params.metricType === "DISPERSION_CALC") {
            placeholderText = "Enter 5-10 carry distances...";
            // Use progression params for shots count
            inputHtml = `
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(params.shots||8).fill(0).map(()=>`<input type="number" class="calc-input input-lcd bg-slate-50 border border-slate-200 text-center text-sm py-1 rounded-sm" placeholder="-" data-group="${id}">`).join('')}
            </div>
            <div class="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Target SD: ${params.sd_target_yards || params.sd_target} ${params.sd_target_yards ? 'y' : 'units'}</span>
                <span>Actual SD: <span id="calc-sd-${id}" class="text-tech-blue">--</span></span>
            </div>`;
        } else if (params.metricType === "RNG_MULTILOG") {
            placeholderText = "Avg Error (Calculated)";
            const unit = params.tolerance_yards ? 'y' : (params.tolerance_feet ? 'ft' : '');
            inputHtml = `
            <div id="rng-table-${id}" class="rng-table-container">
                <button class="rng-multi-btn w-full border border-dashed border-slate-300 text-slate-500 text-[10px] font-bold py-2 mb-2 uppercase hover:bg-slate-50" data-id="${id}" data-min="${params.randomizer.min}" data-max="${params.randomizer.max}">Generate Targets</button>
                <div id="rng-rows-${id}" class="space-y-1"></div>
                <div class="flex justify-between text-xs font-bold text-slate-500 uppercase mt-2">
                    <span>Target Err: ${params.tolerance_yards || params.tolerance_feet || 'N/A'} ${unit}</span>
                    <span>Avg Err: <span id="rng-score-${id}" class="text-tech-blue">--</span></span>
                </div>
            </div>`;
        } else if (params.scoreType === 'streak') {
             placeholderText = `Enter Max Streak (e.g., ${params.targetStreak})`;
        } else if (params.scoreType === 'score_inverse') {
             placeholderText = `Enter Total Score (e.g., ${params.targetScore || 20})`;
        } else if (params.scoreType === 'numeric_high') {
             placeholderText = `Enter Avg Metric (e.g., 112)`;
        } else if (params.metricType === 'COUNT') {
             placeholderText = `Enter count (e.g., ${params.goalThreshold || 7}/${params.targetShots || 10})`;
        }


        card.innerHTML = `
            <div class="mb-3 border-b border-slate-100 pb-2">
                <div class="text-sm font-bold text-slate-900">${params.name}</div>
                <div class="text-[10px] text-slate-500">${params.description}</div>
            </div>
            ${inputHtml}
            
            <div class="mt-3">
                <label class="block text-[10px] text-slate-500 mb-1 uppercase font-bold">Result</label>
                <input data-id="${id}" type="text" class="drill-score-input input-lcd w-full p-2 text-sm rounded-sm bg-white" placeholder="${placeholderText}">
            </div>
            <textarea data-note-id="${id}" class="w-full mt-2 text-xs p-2 bg-slate-50 border border-slate-200 rounded-sm resize-none" rows="1" placeholder="Notes..."></textarea>
            
        `;
        container.appendChild(card);
    });
}

// ----------------------
// UTILS
// ----------------------

function calculateDispersion(id) {
    const inputs = document.querySelectorAll(`.calc-input[data-group="${id}"]`);
    const vals = Array.from(inputs).map(i => parseFloat(i.value)).filter(v => !isNaN(v));
    const sdEl = $(`calc-sd-${id}`);
    const hidden = document.querySelector(`.drill-score-input[data-id="${id}"]`);
    
    if(vals.length > 1) {
        const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
        const sd = Math.sqrt(vals.reduce((t,n)=>t+Math.pow(n-avg,2),0)/vals.length).toFixed(2);
        if(sdEl) sdEl.innerText = sd;
        if(hidden) hidden.value = sd;
    } else {
        if(sdEl) sdEl.innerText = "--";
        if(hidden) hidden.value = "";
    }
}

function handleMultiTargetGen(btn) {
    const id = btn.dataset.id;
    const min = parseInt(btn.dataset.min);
    const max = parseInt(btn.dataset.max);
    const rowsContainer = $(`rng-rows-${id}`);
    const params = getDrillParams(id);
    const count = params.randomizer.count || 5;

    let html = `<div class="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-500 mb-1"><span>Target</span><span class="text-center">Shot 1</span><span class="text-center">Shot 2</span><span class="text-right">Delta</span></div>`;
    for(let i=0; i<count; i++) {
        const t = Math.floor(Math.random()*(max-min+1))+min;
        const unit = params.randomizer.unit || 'y';
        html += `<div class="grid grid-cols-4 gap-2 items-center mb-1 multi-row" data-target="${t}">
            <div class="bg-slate-100 text-slate-900 font-bold text-center py-1 rounded text-xs">${t}${unit}</div>
            <input type="number" class="input-lcd h-7 text-center multi-inp text-xs" placeholder="-">
            <input type="number" class="input-lcd h-7 text-center multi-inp text-xs" placeholder="-">
            <div class="text-right text-xs font-bold text-slate-500 py-1 row-delta">--</div>
        </div>`;
    }
    rowsContainer.innerHTML = html;
    btn.classList.add("hidden");
}

function calculateRngScore(container) {
    const id = container.id.replace("rng-table-", "");
    let totalErr = 0, count = 0;
    container.querySelectorAll(".multi-row").forEach(row => {
        const t = parseFloat(row.dataset.target);
        const shots = Array.from(row.querySelectorAll("input")).map(i => parseFloat(i.value)).filter(n => !isNaN(n));
        
        if(shots.length > 0) {
            const avg = shots.reduce((a,b)=>a+b,0)/shots.length;
            const delta = Math.abs(avg-t).toFixed(1);
            row.querySelector(".row-delta").innerText = delta;
            totalErr += parseFloat(delta);
            count++;
        }
    });
    const avgErr = count ? (totalErr/count).toFixed(1) : "--";
    const scoreEl = $(`rng-score-${id}`);
    if(scoreEl) scoreEl.innerText = avgErr;
    const hidden = document.querySelector(`.drill-score-input[data-id="${id}"]`);
    if(hidden) hidden.value = avgErr;
}

// ----------------------
// HISTORY & ANALYTICS
// ----------------------
async function renderHistory() {
    const box = $("history-list");
    if(!box) return;
    const sessions = await loadSessions();
    box.innerHTML = sessions.length ? "" : "<div class='text-center text-xs text-slate-400'>No history</div>";
    sessions.forEach(s => {
        const div = document.createElement("div");
        div.className = "tech-card p-3 mb-2";
        div.innerHTML = `
            <div class="flex justify-between font-bold text-sm">
                <span>${new Date(s.date).toLocaleDateString()}</span>
                <span class="text-tech-blue">${s.drills.length} Drills</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">${s.drillResults.map(r=>`${r.name}: ${r.score.raw || r.score.numeric}`).join(', ')}</div>
        `;
        box.appendChild(div);
    });
}

async function renderAnalytics() {
    const box = $("analytics-container");
    if(!box) return;
    const sessions = await loadSessions();
    if(!sessions.length) { box.innerHTML = "No Data"; return; }
    
    const stats = {};
    sessions.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s => {
        s.drillResults.forEach(r => {
            if(r.score && r.score.numeric) {
                if(!stats[r.name]) stats[r.name] = [];
                stats[r.name].push(r.score.numeric);
            }
        });
    });
    
    box.innerHTML = "";
    Object.keys(stats).forEach(name => {
        const scores = stats[name];
        if(scores.length < 2) return;
        const id = "c-" + Math.random().toString(36).substr(2,9);
        box.innerHTML += `<div class="tech-card p-4 mb-4"><div class="text-xs font-bold mb-2">${name}</div><div class="h-32"><canvas id="${id}"></canvas></div></div>`;
        
        const drillInfo = allDrillsMap.get(Object.keys(DRILLS).flatMap(k=>DRILLS[k]).find(d=>d.name===name)?.id);
        
        // Inverse plotting logic (lower is better for SD/Error/Score)
        const isInverse = drillInfo && (drillInfo.scoreType === 'sd' || drillInfo.scoreType === 'smart_log_avg_error' || drillInfo.scoreType === 'score_inverse');
        
        const options = {
            plugins: { legend: false }, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    reverse: isInverse, // Invert Y-axis for SD/Error so improvement goes up
                    title: { display: true, text: isInverse ? 'Metric (Lower is Better)' : 'Metric (Higher is Better)' },
                },
                x: { grid: { display: false }, ticks: { display: false } }
            }
        };

        setTimeout(() => {
            new Chart($(id), {
                type: 'line',
                data: { labels: scores.map((_,i)=>i+1), datasets: [{ data: scores, borderColor: '#2563eb', tension: 0.1, fill: false }] },
                options: options
            });
        }, 50);
    });
}

function switchTab(t) {
    document.querySelectorAll(".tab-pane").forEach(e => e.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(e => e.classList.remove("active"));
    $(t).classList.remove("hidden");
    const nav = document.querySelector(`button[data-tab="${t}"]`);
    if(nav) nav.classList.add("active");
    
    if(t === "setup") renderPlanUI();
    if(t === "history") renderHistory();
    if(t === "analytics") renderAnalytics();
    if (t === "log") renderSelectedDrills(); 
}