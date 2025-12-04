// ================================
// app.js — SCRATCH ELITE: COACH MODE
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

const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

document.addEventListener("DOMContentLoaded", () => {
    setupGlobalClicks();
    setupGlobalInputs();
    
    // SAFETY CHECK: Clear corrupt data
    try {
        const rawPlan = localStorage.getItem("golf_active_plan");
        if (rawPlan) {
            const parsed = JSON.parse(rawPlan);
            if (!(parsed && parsed.tasks && Array.isArray(parsed.tasks))) {
                localStorage.removeItem("golf_active_plan");
            } else {
                activePlan = parsed;
            }
        }
        userProgression = JSON.parse(localStorage.getItem('golf_progression') || '{}');
    } catch (e) {
        localStorage.removeItem("golf_active_plan");
        localStorage.removeItem('golf_progression');
    }

    try {
        subscribeToAuth((user) => handleAuthChange(user));
    } catch (e) { console.error("Auth subscription failed:", e); initAppData(); }
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
                        <span class="text-xs font-bold text-slate-900">${user.displayName || (user.isAnonymous ? 'Anonymous' : 'Golfer')}</span>
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
    renderPriorityUI(); // New Coach Mode UI
    renderPlanUI(); 
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); 
    updateStartButton();
}

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
// NEW: COACH MODE LOGIC
// ----------------------

function renderPriorityUI() {
    const container = $("priority-container");
    if(!container) return;
    container.innerHTML = "";

    const categories = ["Driver", "Irons", "Wedges", "Short Game", "Putting"];

    categories.forEach(cat => {
        const catId = cat.toLowerCase().replace(" ", "_");
        // Find skills for this category
        const catSkills = SKILLS.filter(s => s.category === cat);
        
        const div = document.createElement("div");
        div.className = "border border-slate-200 rounded-sm p-3 bg-white";
        div.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-slate-900 uppercase">${cat}</span>
                <select class="plan-rank-select input-lcd text-[10px] py-1 px-2 w-28" data-cat="${catId}">
                    <option value="4">High Priority</option>
                    <option value="2" selected>Normal</option>
                    <option value="1">Low Priority</option>
                    <option value="0">Skip</option>
                </select>
            </div>
            <div class="space-y-1 pl-2 border-l-2 border-slate-100" id="sub-${catId}">
                ${catSkills.map(s => `
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" class="plan-sub-check accent-tech-blue" value="${s.id}" checked>
                        <span class="text-[10px] text-slate-500 hover:text-slate-800 transition">${s.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
        
        // Hide sub-skills if "Skip" is selected
        const select = div.querySelector("select");
        select.addEventListener("change", (e) => {
            const sub = div.querySelector(`#sub-${catId}`);
            if(e.target.value === "0") {
                sub.classList.add("hidden");
                div.classList.add("opacity-50");
            } else {
                sub.classList.remove("hidden");
                div.classList.remove("opacity-50");
            }
        });

        container.appendChild(div);
    });
}

function generateSmartPlan() {
    const timeBudget = parseInt($("plan-time-budget").value) || 120; // Minutes
    const tasks = [];
    
    // 1. Calculate Weights
    let totalWeight = 0;
    const categoryConfigs = [];

    document.querySelectorAll(".plan-rank-select").forEach(sel => {
        const cat = sel.dataset.cat;
        const weight = parseInt(sel.value);
        
        if (weight > 0) {
            // Get preferred skills
            const subChecks = document.querySelectorAll(`#sub-${cat} .plan-sub-check:checked`);
            const preferredSkills = Array.from(subChecks).map(c => c.value);
            
            // Safety: If nothing checked, default to all skills in category
            const effectiveSkills = preferredSkills.length > 0 
                ? preferredSkills 
                : SKILLS.filter(s => s.category.toLowerCase().replace(" ","_") === cat).map(s=>s.id);

            categoryConfigs.push({ cat, weight, skills: effectiveSkills });
            totalWeight += weight;
        }
    });

    if (categoryConfigs.length === 0) {
        alert("Please assign a priority to at least one category.");
        return;
    }

    // 2. Distribute Time & Select Drills
    categoryConfigs.forEach(config => {
        // Allocated Minutes = (Weight / Total) * Budget
        let allocatedMins = Math.floor((config.weight / totalWeight) * timeBudget);
        
        // COACH LOGIC: Minimum effective dose is 10 mins if selected
        if (allocatedMins < 10) allocatedMins = 10;

        let filledMins = 0;
        const catDrills = DRILLS[config.cat] || [];
        
        // Filter drills by sub-skills
        let validDrills = catDrills.filter(d => d.skills.some(s => config.skills.includes(s)));
        
        // Fallback if filtering is too strict
        if (validDrills.length === 0) validDrills = catDrills;

        // Shuffle
        validDrills.sort(() => Math.random() - 0.5);

        // Fill Bucket
        for (const drill of validDrills) {
            if (filledMins >= allocatedMins) break;
            
            // Allow slight overflow (+5m) to complete a drill
            if (filledMins + drill.duration > allocatedMins + 5) continue;

            // Avoid duplicates in the plan
            if (!tasks.find(t => t.id === drill.id)) {
                tasks.push({ 
                    id: drill.id, 
                    cat: config.cat, 
                    done: 0, 
                    target: 1 // Default 1 set
                });
                filledMins += drill.duration;
            }
        }
    });

    // 3. Save & Render
    activePlan = { 
        totalTime: timeBudget, 
        tasks: tasks, 
        created: new Date().toISOString() 
    };
    
    localStorage.setItem("golf_active_plan", JSON.stringify(activePlan));
    renderPlanUI();
}

function renderPlanUI() {
    const activeView = $("active-plan-view");
    const createView = $("create-plan-view");
    const list = $("plan-tasks-list");
    const progBar = $("plan-progress-bar");

    if(!activeView || !createView) return;

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

    // Group tasks by Category for cleaner display
    activePlan.tasks.forEach((task) => {
        const drill = getDrillParams(task.id);
        if (!drill) return; 

        const completion = Math.min(task.done, task.target);
        const isComplete = task.done >= task.target;
        
        const item = document.createElement("div");
        item.className = `flex justify-between items-center p-3 border rounded-sm ${isComplete ? 'bg-green-50 border-green-200 opacity-90' : 'bg-white border-l-4 border-l-tech-blue border-slate-200'}`;
        
        item.innerHTML = `
            <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">${drill.category || task.cat} - ${drill.duration}m</div>
                <div class="text-xs font-bold text-slate-900">${drill.name}</div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold ${isComplete ? 'text-green-600' : 'text-tech-blue'}">${completion}/${task.target}</span>
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
// AUTO-SAVE & DRAFT
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
    if(draft.drills) draft.drills.forEach(id => selectedDrillIds.add(id));
}

// ----------------------
// SCORING & PROMOTION
// ----------------------
function evaluateResult(drill, rawScore) {
    let numeric = 0;
    if (rawScore.includes('/')) {
        const parts = rawScore.split('/');
        numeric = parseFloat(parts[0]) / (parseFloat(parts[1]) || 1); 
    } else {
        numeric = parseFloat(rawScore);
    }
    if (isNaN(numeric)) return { passed: false, numeric: 0 };

    let passed = false;

    if (drill.scoreType === 'count' || drill.scoreType === 'streak' || drill.scoreType === 'numeric_high') {
        const target = drill.goalThreshold || drill.targetStreak || drill.targetScore || 0;
        passed = numeric >= target;
    } else {
        const target = drill.sd_target_yards || drill.tolerance_yards || drill.targetScore || 999;
        passed = numeric <= target;
    }

    return { passed, numeric: numeric }; 
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
    
    const grouped = SKILLS.reduce((acc, skill) => {
        const cat = skill.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});
    
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
    
    if(selectedSkills.size === 0 && active.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-xs text-slate-400">Select skills or drills to begin.</div>`;
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
        let placeholderText = "Enter score (e.g., 8/10)";

        if(params.metricType === "DISPERSION_CALC") {
            inputHtml = `
            <div class="grid grid-cols-5 gap-1 mb-2">
                ${Array(params.shots||8).fill(0).map(()=>`<input type="number" class="calc-input input-lcd bg-slate-50 border border-slate-200 text-center text-sm py-1 rounded-sm" placeholder="-" data-group="${id}">`).join('')}
            </div>
            <div class="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Target SD: ${params.sd_target_yards || params.sd_target || '--'}</span>
                <span>Actual: <span id="calc-sd-${id}" class="text-tech-blue">--</span></span>
            </div>`;
        } else if (params.metricType === "RNG_MULTILOG") {
            const unit = params.tolerance_yards ? 'y' : (params.tolerance_feet ? 'ft' : '');
            inputHtml = `
            <div id="rng-table-${id}" class="rng-table-container">
                <button class="rng-multi-btn w-full border border-dashed border-slate-300 text-slate-500 text-[10px] font-bold py-2 mb-2 uppercase hover:bg-slate-50" data-id="${id}" data-min="${params.randomizer?.min}" data-max="${params.randomizer?.max}">Generate Targets</button>
                <div id="rng-rows-${id}" class="space-y-1"></div>
                <div class="flex justify-between text-xs font-bold text-slate-500 uppercase mt-2">
                    <span>Target: ${params.tolerance_yards || params.tolerance_feet || '--'}${unit}</span>
                    <span>Avg Err: <span id="rng-score-${id}" class="text-tech-blue">--</span></span>
                </div>
            </div>`;
        } else {
            // Contextual placeholders
            if (params.scoreType === 'streak') placeholderText = "Max Streak (e.g. 12)";
            else if (params.scoreType === 'score_inverse') placeholderText = "Total Score (e.g. 21)";
            else if (params.scoreType === 'numeric_high') placeholderText = "Value (e.g. 112)";
            else if (params.metricType === 'COUNT') placeholderText = `Count (e.g., ${params.goalThreshold || 7}/${params.targetShots || 10})`;
            
            inputHtml = `<input data-id="${id}" type="text" class="drill-score-input input-lcd w-full p-2 text-sm rounded-sm bg-white" placeholder="${placeholderText}">`;
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
        const inputs = row.querySelectorAll("input");
        const shots = Array.from(inputs).map(i => parseFloat(i.value)).filter(n => !isNaN(n));
        
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
    
    // Find hidden input or create it to store value for save logic
    let hidden = document.querySelector(`.drill-score-input[data-id="${id}"]`);
    if(!hidden) {
        hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.className = "drill-score-input";
        hidden.setAttribute("data-id", id);
        const parentDiv = container.closest(".tech-card");
        if (parentDiv) parentDiv.appendChild(hidden);
    }
    hidden.value = avgErr;
}

function setupGlobalClicks() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        if (btn.id === "google-login-btn") {
            try {
                await loginWithGoogle();
            } catch(e) {
                console.error("Google Login Failed:", e);
                alert("Google Login failed. Check the console for details.");
            }
        }
        if (btn.dataset.action === "logout") logout().then(() => location.reload());
        if (btn.classList.contains("tab-button")) switchTab(btn.dataset.tab);
        
        // --- NEW CLICK HANDLER ---
        if (btn.id === "generate-smart-plan-btn") generateSmartPlan();
        
        if (btn.id === "delete-plan-btn") { activePlan = null; localStorage.removeItem("golf_active_plan"); renderPlanUI(); }
        
        if (btn.classList.contains("load-plan-drill")) {
            const id = btn.dataset.id;
            selectedDrillIds.add(id);
            renderSkills();
            renderDrillSelect();
            renderSelectedDrills();
            switchTab("log");
        }
        
        if (btn.classList.contains("add-btn")) {
            const id = btn.dataset.id;
            selectedDrillIds.has(id) ? selectedDrillIds.delete(id) : selectedDrillIds.add(id);
            renderDrillSelect();
            renderSelectedDrills();
            updateStartButton();
        }
        
        if (btn.id === "go-to-log") switchTab("log");
        if (btn.id === "save-session") handleSaveSession();
        
        if (btn.classList.contains("rng-multi-btn")) handleMultiTargetGen(btn);
        
        if (btn.classList.contains("del-hist-btn")) {
            if(confirm("Delete this record?")) { await deleteSessionFromCloud(btn.dataset.id); renderHistory(); renderAnalytics(); }
        }
    });
}

function setupGlobalInputs() {
    document.body.addEventListener("input", (e) => {
        if(e.target.classList.contains("calc-input")) calculateDispersion(e.target.dataset.group);
        if(e.target.classList.contains("multi-inp")) calculateRngScore(e.target.closest(".rng-table-container"));
    });
}

function updateStartButton() {
    const btn = $("go-to-log");
    if(btn) btn.disabled = selectedDrillIds.size === 0;
}

async function renderHistory() {
    const box = $("history-list");
    if(!box) return;
    const sessions = await loadSessions();
    box.innerHTML = sessions.length ? "" : "<div class='text-center text-xs text-slate-400'>No history found</div>";
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
            if(r.score && (r.score.numeric !== undefined)) {
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
        
        const isInverse = drillInfo && (drillInfo.scoreType === 'sd' || drillInfo.scoreType === 'smart_log_avg_error' || drillInfo.scoreType === 'score_inverse');
        
        const options = {
            plugins: { legend: false }, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    reverse: isInverse, 
                    title: { display: true, text: isInverse ? 'Metric (Lower is Better)' : 'Metric (Higher is Better)' },
                },
                x: { grid: { display: false }, ticks: { display: false } }
            }
        };

        setTimeout(() => {
            new Chart(document.getElementById(id), {
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
    
    const target = $(t);
    if(target) target.classList.remove("hidden");
    
    const nav = document.querySelector(`button[data-tab="${t}"]`);
    if(nav) nav.classList.add("active");
    
    if(t === "setup") renderPlanUI();
    if(t === "history") renderHistory();
    if(t === "analytics") renderAnalytics();
    if(t === "log") renderSelectedDrills(); 
}