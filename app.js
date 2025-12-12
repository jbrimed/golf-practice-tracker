// ================================
// app.js — SCRATCH ELITE: COACH MODE
// FINAL VERSION with Wizard, Auto/Manual Select, and Quick Session
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
let planBlueprint = null; // Temp storage for the weekly plan wizard
let selectionMode = 'auto'; // 'auto' or 'manual'

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
    renderPriorityUI(); 
    renderPlanUI(); 
    renderSkills();
    renderDrillSelect();
    renderSelectedDrills(); 
    updateStartButton();
    // Set initial button state for auto/manual mode
    document.getElementById("mode-auto")?.click();
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
// NEW: COACH MODE LOGIC (Blueprint, Wizard, Auto/Manual)
// ----------------------

function renderPriorityUI() {
    const container = $("priority-container");
    if(!container) return;
    container.innerHTML = "";

    const categories = ["Driver", "Irons", "Wedges", "Short Game", "Putting"];

    categories.forEach(cat => {
        const catId = cat.toLowerCase().replace(" ", "_");
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

// 1. GENERATE THE SKELETON (Slots)
function generateBlueprint() {
    const timeBudget = parseInt($("plan-time-budget").value) || 600;
    const slots = [];
    let totalWeight = 0;
    
    // Calculate weights
    const categoryConfigs = [];
    document.querySelectorAll(".plan-rank-select").forEach(sel => {
        const cat = sel.dataset.cat;
        const weight = parseInt(sel.value);
        if (weight > 0) {
            const subChecks = document.querySelectorAll(`#sub-${cat} .plan-sub-check:checked`);
            const preferredSkills = Array.from(subChecks).map(c => c.value);
            const effectiveSkills = preferredSkills.length > 0 
                ? preferredSkills 
                : SKILLS.filter(s => s.category.toLowerCase().replace(" ","_") === cat).map(s=>s.id);

            categoryConfigs.push({ cat, weight, skills: effectiveSkills });
            totalWeight += weight;
        }
    });

    if (categoryConfigs.length === 0) { alert("Select priorities first."); return; }

    // Distribute Slots
    categoryConfigs.forEach(config => {
        let allocatedMins = Math.floor((config.weight / totalWeight) * timeBudget);
        if (allocatedMins < 30) allocatedMins = 30; 

        const avgSessionDuration = 30; // 30 mins per session slot
        let slotCount = Math.max(1, Math.min(8, Math.round(allocatedMins / avgSessionDuration)));
        const repsPerSlot = 2; // Fixed low reps for variety

        for(let i=0; i<slotCount; i++) {
            let selectedDrill = null;
            
            // AUTO-SELECT LOGIC: (Only runs if mode is 'auto')
            if (selectionMode === 'auto') {
                const catDrills = DRILLS[config.cat] || [];
                // Filter by allowed skills
                const eligible = catDrills.filter(d => d.skills.some(s => config.skills.includes(s)));
                if (eligible.length > 0) {
                    // Pick a random drill from the eligible list
                    selectedDrill = eligible[Math.floor(Math.random() * eligible.length)].id;
                }
            }

            slots.push({
                id: `slot-${Date.now()}-${Math.random()}`,
                category: config.cat,
                allowedSkills: config.skills,
                targetReps: repsPerSlot,
                selectedDrill: selectedDrill
            });
        }
    });

    planBlueprint = { totalTime: timeBudget, slots };
    
    if (selectionMode === 'auto') {
        finalizePlan(); // Skip wizard if auto
    } else {
        renderWizardUI(); // Go to selection page
    }
}

// 2. RENDER THE SELECTION WIZARD (Manual Drill Picker)
function renderWizardUI() {
    $("create-plan-view").classList.add("hidden");
    $("plan-wizard-view").classList.remove("hidden");
    const container = $("wizard-slots-container");
    container.innerHTML = "";

    planBlueprint.slots.forEach((slot, index) => {
        const div = document.createElement("div");
        div.className = "border border-slate-200 bg-white p-3 rounded-sm mb-2";
        
        if (slot.selectedDrill) {
            // FILLED SLOT STATE
            const drill = allDrillsMap.get(slot.selectedDrill);
            div.className = "border border-tech-blue bg-blue-50 p-3 rounded-sm mb-2";
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-[10px] font-bold text-slate-500 uppercase">${drill.category} • ${slot.targetReps} Weekly Reps</div>
                        <div class="text-sm font-bold text-slate-900">${drill.name}</div>
                    </div>
                    <button class="text-[10px] text-red-500 font-bold uppercase border border-red-200 px-2 py-1 rounded bg-white" onclick="clearSlot(${index})">Change</button>
                </div>
            `;
        } else {
            // EMPTY SLOT STATE
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="text-xs font-bold text-slate-400 uppercase">${slot.category} Slot</div>
                    <div class="text-[10px] text-slate-400">Target: ${slot.targetReps} Sessions</div>
                </div>
                <button class="mt-2 w-full border border-dashed border-slate-300 text-slate-500 text-xs font-bold py-2 hover:bg-slate-50" onclick="openDrillPicker(${index})">
                    + Select Drill
                </button>
            `;
        }
        container.appendChild(div);
    });
    
    // Enable/Disable Finalize Button
    const allFilled = planBlueprint.slots.every(s => s.selectedDrill);
    $("finalize-plan-btn").disabled = !allFilled;
}

// 3. DRILL PICKER (Uses the Manual Selection Area temporarily)
window.openDrillPicker = function(slotIndex) {
    const slot = planBlueprint.slots[slotIndex];
    const container = $("wizard-slots-container");
    
    const catDrills = DRILLS[slot.category] || [];
    const eligible = catDrills.filter(d => d.skills.some(s => slot.allowedSkills.includes(s)));

    const pickerId = `picker-${slotIndex}`;
    const existingPicker = document.getElementById(pickerId);
    if(existingPicker) { existingPicker.remove(); return; }

    const pickerDiv = document.createElement("div");
    pickerDiv.id = pickerId;
    pickerDiv.className = "mt-2 bg-slate-50 border-t border-slate-200 p-2 max-h-80 overflow-y-auto custom-scrollbar shadow-inner";
    
    if(eligible.length === 0) {
        pickerDiv.innerHTML = "<div class='text-xs text-red-500'>No drills match filters. Uncheck sub-skills?</div>";
    } else {
        eligible.forEach(d => {
            const item = document.createElement("div");
            item.className = "border-b border-slate-200 last:border-0 py-2";
            
            // Layout: Title + Info Button on top row, select button on right
            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1 pr-2">
                        <div class="text-xs font-bold text-slate-900">${d.name}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">${d.duration} mins • Level ${userProgression[d.id] || 1}</div>
                    </div>
                    <button class="select-drill-btn text-[10px] bg-slate-900 text-white px-2 py-1 rounded shadow-sm hover:bg-slate-700 uppercase font-bold">
                        Select
                    </button>
                </div>
                <details class="mt-1">
                    <summary class="text-[10px] text-tech-blue cursor-pointer font-bold select-none">Show Description</summary>
                    <p class="text-[10px] text-slate-600 mt-1 pl-2 border-l-2 border-slate-200 italic">
                        ${d.description || "No description available."}
                    </p>
                </details>
            `;
            
            // Attach click handler manually to avoid string escaping issues
            item.querySelector(".select-drill-btn").onclick = () => {
                planBlueprint.slots[slotIndex].selectedDrill = d.id;
                renderWizardUI();
            };
            
            pickerDiv.appendChild(item);
        });
    }
    
    const slotDivs = container.children;
    if(slotDivs[slotIndex]) slotDivs[slotIndex].appendChild(pickerDiv);
}

window.clearSlot = function(index) {
    planBlueprint.slots[index].selectedDrill = null;
    renderWizardUI();
}

// 4. FINALIZE & SAVE
function finalizePlan() {
    const tasks = planBlueprint.slots.map(slot => ({
        id: slot.selectedDrill,
        cat: slot.category,
        done: 0,
        target: slot.targetReps
    }));

    activePlan = { 
        totalTime: planBlueprint.totalTime, 
        tasks: tasks, 
        created: new Date().toISOString() 
    };
    
    localStorage.setItem("golf_active_plan", JSON.stringify(activePlan));
    
    // Switch Views
    $("plan-wizard-view").classList.add("hidden");
    renderPlanUI();
}

// ------------------------------------------
// PLAN DASHBOARD (DAILY BUILDER)
// ------------------------------------------

function renderPlanUI() {
    const activeView = $("active-plan-view");
    const createView = $("create-plan-view");
    const wizardView = $("plan-wizard-view");
    const list = $("plan-tasks-list");
    const progBar = $("plan-progress-bar");
    const startBtn = $("start-daily-session-btn");

    // View Routing
    if(!activePlan) {
        activeView.classList.add("hidden");
        wizardView.classList.add("hidden");
        createView.classList.remove("hidden");
        return;
    }

    activeView.classList.remove("hidden");
    createView.classList.add("hidden");
    wizardView.classList.add("hidden");
    list.innerHTML = "";

    // Overall Weekly Progress
    const doneCount = activePlan.tasks.reduce((sum, t) => sum + Math.min(t.done, t.target), 0);
    const totalTarget = activePlan.tasks.reduce((sum, t) => sum + t.target, 0);
    const pct = totalTarget === 0 ? 0 : (doneCount / totalTarget) * 100;
    if(progBar) progBar.style.width = `${pct}%`;

    // Render Drill List with Checkboxes for "Daily Session"
    activePlan.tasks.forEach((task) => {
        const drill = getDrillParams(task.id);
        if (!drill) return; 

        const completion = Math.min(task.done, task.target);
        const isFinished = task.done === task.target;
        
        // --- FIX: Map the category ID (task.cat) to a display name ---
        const categoryMap = {
            'driver': 'Driving', 
            'irons': 'Irons', 
            'wedges': 'Wedges', 
            'short_game': 'Short Game', 
            'putting': 'Putting'
        };
        const categoryName = categoryMap[task.cat] || task.cat;
        // -----------------------------------------------------------
        
        const item = document.createElement("div");
        item.className = `flex items-start p-3 border rounded-sm mb-2 ${isFinished ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`;
        
        // Checkbox logic
        const checkboxId = `daily-check-${task.id}`;
        
        item.innerHTML = `
            <div class="mr-3 mt-1">
                <input type="checkbox" id="${checkboxId}" class="daily-session-check w-5 h-5 accent-slate-900" value="${task.id}" ${isFinished ? 'disabled' : ''}>
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <span class="text-[10px] uppercase font-bold text-slate-400">${categoryName} • Lvl ${drill.currentLevel || 1}</span>
                    <span class="text-xs font-mono font-bold ${isFinished ? 'text-green-600' : 'text-tech-blue'}">
                        ${completion} <span class="text-[10px] text-slate-400 font-normal">of</span> ${task.target}
                    </span>
                </div>
                <div class="text-xs font-bold text-slate-900 ${isFinished ? 'line-through opacity-50' : ''}">${drill.name}</div>
                
                <p class="text-[10px] text-slate-500 mt-1 pl-2 border-l-2 border-slate-200 italic">
                    ${drill.description}
                </p>
                
            </div>
        `;
        list.appendChild(item);
    });

    // Checkbox Listener to toggle "Start Day" button
    const checkboxes = document.querySelectorAll(".daily-session-check");
    checkboxes.forEach(box => {
        box.addEventListener("change", () => {
            const anyChecked = Array.from(checkboxes).some(c => c.checked);
            anyChecked ? startBtn.classList.remove("hidden") : startBtn.classList.add("hidden");
        });
    });

    startBtn.onclick = loadDailySession;
}
function loadDailySession() {
    const checked = document.querySelectorAll(".daily-session-check:checked");
    selectedDrillIds.clear();
    
    checked.forEach(box => {
        selectedDrillIds.add(box.value);
    });

    // Clear main notes field
    if ($("session-notes")) $("session-notes").value = "";

    // Clear selection UI on the Log tab and populate new drills
    renderSelectedDrills();
    
    switchTab("log");
}

// ----------------------
// AUTO-SAVE & DRAFT
// ----------------------
function triggerAutoSave() {
    // ... (rest of triggerAutoSave remains unchanged)
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
    // ... (rest of evaluateResult remains unchanged)
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
    // ... (rest of checkAndApplyPromotion remains unchanged)
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
            // Only mark completion if the drill was part of the *active* daily session and the user passed
            if (evalResult.passed) {
                const task = activePlan.tasks.find(t => t.id === id && t.done < t.target);
                if(task) {
                    task.done += 1;
                    localStorage.setItem("golf_active_plan", JSON.stringify(activePlan));
                }
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
    // ... (rest of renderSkills remains unchanged)
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
    // ... (rest of renderDrillSelect remains unchanged)
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
    // ... (rest of renderSelectedDrills remains unchanged)
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
    // ... (rest of calculateDispersion remains unchanged)
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
    const rowsContainer = $(`rng-rows-${id}`);
    const params = getDrillParams(id);
    const randomizer = params.randomizer;
    const count = randomizer.count || 5;

    let targets = [];
    let unit = 'y';

    // 1. Determine targets based on randomizer type
    if (randomizer.widths || randomizer.shapes) {
        // Handle drills that pick from an array (e.g., Fairway Width, Random Shape)
        const options = randomizer.widths || randomizer.shapes;
        for (let i = 0; i < count; i++) {
            targets.push(options[Math.floor(Math.random() * options.length)]);
        }
        unit = randomizer.widths ? 'y' : ''; // Use 'y' for widths, none for shapes
    } else if (randomizer.min !== undefined && randomizer.max !== undefined) {
        // Handle drills that pick from a numeric range (e.g., RNG Proximity Matrix)
        const min = parseInt(randomizer.min);
        const max = parseInt(randomizer.max);
        for (let i = 0; i < count; i++) {
            targets.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        unit = randomizer.unit || 'y';
    } else {
        rowsContainer.innerHTML = "<div class='text-xs text-red-500'>Error: Invalid randomizer configuration.</div>";
        btn.classList.add("hidden");
        return;
    }

    // 2. Render the rows based on the determined targets
    let html = `<div class="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-500 mb-1"><span>Target</span><span class="text-center">Shot 1</span><span class="text-center">Shot 2</span><span class="text-right">Delta</span></div>`;
    
    // Determine shots per target (defaults to 2 for number logging, 1 for simple logging)
    const shotsPerTarget = randomizer.shotsPerTarget !== undefined 
        ? randomizer.shotsPerTarget 
        : (typeof targets[0] === 'number' ? 2 : 1); 

    targets.forEach((t) => {
        let inputFields = '';
        if (shotsPerTarget > 0) {
            for(let i = 0; i < shotsPerTarget; i++) {
                // If the target is a number (like 25y), use number inputs. Otherwise, use a text placeholder.
                const inputType = typeof t === 'number' ? 'number' : 'text';
                const inputPlaceholder = inputType === 'text' ? 'Hit "Yes"' : '-';
                inputFields += `<input type="${inputType}" class="input-lcd h-7 text-center multi-inp text-xs" placeholder="${inputPlaceholder}">`;
            }
        }
        
        // Only show Delta column if shotsPerTarget > 0 (i.e., we expect a number input)
        const deltaHtml = shotsPerTarget > 0 ? `<div class="text-right text-xs font-bold text-slate-500 py-1 row-delta">--</div>` : '';
        
        html += `<div class="grid grid-cols-${shotsPerTarget + 2} gap-2 items-center mb-1 multi-row" data-target="${t}">
            <div class="bg-slate-100 text-slate-900 font-bold text-center py-1 rounded text-xs">${t}${unit}</div>
            ${inputFields}
            ${deltaHtml}
        </div>`;
    });

    rowsContainer.innerHTML = html;
    btn.classList.add("hidden");
}

function calculateRngScore(container) {
    // ... (rest of calculateRngScore remains unchanged)
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

        // --- AUTHENTICATION ---
        if (btn.id === "google-login-btn") {
            try {
                await loginWithGoogle();
            } catch(e) {
                console.error("Google Login Failed:", e);
                alert("Google Login failed. Check the console for details.");
            }
        }
        if (btn.dataset.action === "logout") logout().then(() => location.reload());
        
        // --- NAVIGATION ---
        if (btn.classList.contains("tab-button")) switchTab(btn.dataset.tab);
        
        // --- MODE TOGGLES (New) ---
        if (btn.id === "mode-auto") {
            selectionMode = 'auto';
            btn.classList.add("bg-white", "shadow-sm", "border-slate-200");
            $("mode-manual").classList.remove("bg-white", "shadow-sm", "border-slate-200");
            $("mode-manual").classList.add("text-slate-500");
        }
        if (btn.id === "mode-manual") {
            selectionMode = 'manual';
            btn.classList.add("bg-white", "shadow-sm", "border-slate-200");
            $("mode-auto").classList.remove("bg-white", "shadow-sm", "border-slate-200");
            $("mode-auto").classList.add("text-slate-500");
        }
        
        // --- BLUEPRINT / WIZARD FLOW ---
        if (btn.id === "generate-blueprint-btn") generateBlueprint();
        if (btn.id === "finalize-plan-btn") finalizePlan();
        if (btn.id === "cancel-wizard-btn") { 
            planBlueprint = null; 
            renderPlanUI(); 
        }

        // --- DAILY SESSION EXECUTION ---
        if (btn.id === "start-daily-session-btn") loadDailySession();
        
        // --- QUICK SESSION (New) ---
        if (btn.id === "quick-session-btn") {
            selectedDrillIds.clear();
            // Note: Keep manual selection area for drill picking
            renderDrillSelect();
            updateStartButton();
            switchTab("setup"); 
            switchTab("log"); // Jump to log page
        }

        // --- PLAN MANAGEMENT ---
        if (btn.id === "delete-plan-btn") { 
            activePlan = null; 
            planBlueprint = null; 
            localStorage.removeItem("golf_active_plan"); 
            renderPlanUI(); 
        }
        
        // --- MANUAL SELECTION (Bottom of screen) ---
        if (btn.classList.contains("add-btn")) {
            const id = btn.dataset.id;
            selectedDrillIds.has(id) ? selectedDrillIds.delete(id) : selectedDrillIds.add(id);
            renderDrillSelect();
            renderSelectedDrills();
            updateStartButton();
        }
        
        // --- LOGGING & UTILS ---
        if (btn.id === "go-to-log") switchTab("log");
        if (btn.id === "save-session") handleSaveSession();
        
        if (btn.classList.contains("rng-multi-btn")) handleMultiTargetGen(btn);
        
        if (btn.classList.contains("del-hist-btn")) {
            if(confirm("Delete this record?")) { 
                await deleteSessionFromCloud(btn.dataset.id); 
                renderHistory(); 
                renderAnalytics(); 
            }
        }
    });
}

function setupGlobalInputs() {
    // ... (rest of setupGlobalInputs remains unchanged)
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
        div.className = "tech-card p-3 mb-2 relative group"; 
        div.innerHTML = `
            <div class="flex justify-between font-bold text-sm">
                <span>${new Date(s.date).toLocaleDateString()}</span>
                <div class="flex items-center gap-3">
                    <span class="text-tech-blue">${s.drills.length} Drills</span>
                    <button class="del-hist-btn text-[10px] text-red-400 hover:text-red-600 font-bold uppercase border border-slate-200 hover:border-red-400 px-2 py-1 rounded-sm" data-id="${s.id}">
                        Delete
                    </button>
                </div>
            </div>
            <div class="text-xs text-slate-500 mt-1">${s.drillResults.map(r=>`${r.name}: ${r.score.raw || r.score.numeric}`).join(', ')}</div>
        `;
        box.appendChild(div);
    });
}

async function renderAnalytics() {
    // ... (rest of renderAnalytics remains unchanged)
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