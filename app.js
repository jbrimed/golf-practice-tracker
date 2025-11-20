// app.js (Visual updates applied to dynamic rendering)

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();
let activeClubCategory = null; 

// (initTabs, groupSkillsByClub, getFilteredDrills functions are unchanged)

// --- Skills UI (CASCADING OVERHAUL - Stylized) ---
function renderSkills() {
  const container = $("skill-select");
  if (!container) return;

  const groupedSkills = groupSkillsByClub();
  const clubCategories = Object.keys(groupedSkills);
  const selectedCount = selectedDrillIds.size;
  const goToLogBtn = $("go-to-log");

  if (goToLogBtn) {
    goToLogBtn.textContent = `Go to Practice Log (${selectedCount} Drills Selected)`;
    goToLogBtn.disabled = selectedCount === 0;
  }
  
  // Clear and rebuild the container
  container.innerHTML = `
    <div class="space-y-3">
        <label for="club-select-dropdown" class="block text-sm font-semibold text-gray-700">1. Choose a Club/Area</label>
        <select id="club-select-dropdown" class="w-full input-style">
            <option value="">-- Select Club --</option>
            ${clubCategories.map(cat => `<option value="${cat}" ${cat === activeClubCategory ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>
    </div>
    <div id="skill-buttons-container" class="mt-6 space-y-3">
        ${activeClubCategory ? `<p class="text-sm font-semibold text-gray-700">2. Select Skills for ${activeClubCategory}</p>` : ''}
    </div>
    <div id="selected-skills-summary" class="mt-6 pt-4 border-t border-gray-200">
        <p class="text-sm font-semibold text-gray-700 mb-2">3. Active Skills</p>
        <div id="skill-summary-tags" class="flex flex-wrap gap-2"></div>
    </div>
  `;
  
  const clubDropdown = $("club-select-dropdown");
  const skillButtonContainer = $("skill-buttons-container");
  
  // Event listener for Club Dropdown
  if (clubDropdown) {
      clubDropdown.addEventListener('change', (e) => {
          activeClubCategory = e.target.value;
          renderSkills();
      });
  }
  
  // Render Skill Buttons for the active category
  if (activeClubCategory && groupedSkills[activeClubCategory]) {
      const skillsHtml = groupedSkills[activeClubCategory].map(skill => {
          const active = selectedSkills.has(skill.id); 
          const className = active 
            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md'
            : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-600';
          // Adjusted button sizing and styling
          return `<button data-skill-id="${skill.id}" class="skill-button px-4 py-2 rounded-full border text-sm transition ${className}">${skill.label}</button>`;
      }).join('');
      
      skillButtonContainer.innerHTML += `<div class="flex flex-wrap gap-3">${skillsHtml}</div>`;
      
      // Attach listeners to the new skill buttons
      skillButtonContainer.querySelectorAll('.skill-button').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const skillId = e.target.getAttribute('data-skill-id');
              if (selectedSkills.has(skillId)) {
                  selectedSkills.delete(skillId);
              } else {
                  selectedSkills.add(skillId);
              }
              renderSkills();
              renderSessionDrills();
          });
      });
  }
  
  // Render Summary Tags (Active Skills)
  renderSkillSummary(groupedSkills);
  renderSessionDrills();
}

function renderSkillSummary(groupedSkills) {
    const summaryContainer = $("skill-summary-tags");
    if (!summaryContainer) return;

    const allSkills = Object.values(groupedSkills).flat();
    const activeSkills = allSkills.filter(skill => selectedSkills.has(skill.id));
    
    if (activeSkills.length === 0) {
        summaryContainer.innerHTML = '<p class="text-xs text-gray-500 italic">No skills selected.</p>';
        return;
    }
    
    summaryContainer.innerHTML = activeSkills.map(skill => {
        // Chip style for selected skills
        return `
            <span class="inline-flex items-center text-xs font-medium bg-emerald-50 text-emerald-800 rounded-full px-3 py-1 shadow-sm">
                ${skill.category}: ${skill.label}
                <button data-skill-id="${skill.id}" class="remove-skill-tag ml-2 text-emerald-600 hover:text-emerald-900 font-bold">
                    &times;
                </button>
            </span>
        `;
    }).join('');

    summaryContainer.querySelectorAll('.remove-skill-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const skillId = e.currentTarget.getAttribute('data-skill-id');
            selectedSkills.delete(skillId);
            renderSkills();
        });
    });
}

// --- Drills for session tab (Selection/Add List - Stylized) ---
function renderSessionDrills() {
  const container = $("drill-select");
  if (!container) return;

  container.innerHTML = "";

  const drills = getFilteredDrills();
  const selectedCount = selectedDrillIds.size;
  
  const goToLogBtn = $("go-to-log");
  if (goToLogBtn) {
    goToLogBtn.textContent = `Go to Practice Log (${selectedCount} Drills Selected)`;
    goToLogBtn.disabled = selectedCount === 0;
  }
  
  if (drills.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-base italic mt-4">Select one or more skills above to see matching drills.</p>';
    return;
  }

  // Flatten all drills for quick lookup by ID
  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  drills.forEach((drill) => {
    const card = document.createElement("div");
    // Enhanced card style for drill listing
    card.className = "p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition hover:border-emerald-400"; 

    const added = selectedDrillIds.has(drill.id);
    
    const buttonClass = added 
        ? "bg-gray-300 text-gray-800" 
        : "bg-emerald-600 text-white";

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-lg text-gray-800">${drill.name}</h3>
          <p class="text-xs uppercase tracking-wider text-gray-500 mt-0.5">${drill.category || drill.subcategory || "N/A"}</p>
        </div>
        <button
          data-id="${drill.id}"
          class="toggle-drill px-4 py-1.5 text-sm rounded-lg font-semibold transition ${buttonClass}"
        >
          ${added ? "Remove" : "Add"}
        </button>
      </div>
      <p class="text-sm text-gray-700 mt-2">${drill.description}</p>
      <div class="flex items-center space-x-4 text-xs text-gray-500 mt-2 pt-2 border-t">
        <span>Duration: ~${drill.duration} min</span>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach listeners... (unchanged)
  container.querySelectorAll(".toggle-drill").forEach((btn) => {
    const id = btn.getAttribute("data-id");
    btn.addEventListener("click", () => {
      if (selectedDrillIds.has(id)) {
        selectedDrillIds.delete(id);
      } else {
        selectedDrillIds.add(id);
      }
      renderSessionDrills();
    });
  });
}

// --- Drills for Practice Log tab (Stylized Inputs) ---
function renderSelectedDrills() {
  const container = $("selected-drills-log");
  if (!container) return;

  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML =
      '<p class="text-lg text-gray-500 italic mt-8 text-center">No drills selected. Go back to the "New Session" tab to choose drills first.</p>';
    return;
  }

  const allDrillsMap = new Map(Object.values(DRILLS).flat().map(d => [d.id, d]));

  Array.from(selectedDrillIds).forEach((id) => {
    const drill = allDrillsMap.get(id);
    if (!drill) return; 

    const card = document.createElement("div");
    // Enhanced log card style
    card.className = "border border-gray-200 rounded-xl p-5 bg-white shadow-lg"; 

    card.innerHTML = `
      <div class="flex justify-between items-start mb-4 border-b pb-3">
        <h3 class="text-xl font-bold text-gray-900">${drill.name}</h3>
        <button data-id="${drill.id}" class="remove-drill text-red-500 text-sm font-medium hover:underline">
          Remove Drill
        </button>
      </div>
      
      <p class="text-sm text-gray-600 mb-6">${drill.description}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="md:col-span-1">
          <label class="block text-gray-700 mb-1 font-semibold">Score / Result</label>
          <input
            type="text"
            class="w-full input-style drill-score-input" 
            data-id="${drill.id}"
            placeholder="e.g., 7/10, 145 MPH"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-gray-700 mb-1 font-semibold">Detailed Observations</label>
          <input
            type="text"
            class="w-full input-style drill-notes-input" 
            data-id="${drill.id}"
            placeholder="What felt different? Why was the score high/low?"
          />
        </div>
      </div>
    `;

    container.appendChild(card);
    
    // Add remove listener... (unchanged)
    card.querySelector(".remove-drill")?.addEventListener("click", (e) => {
      const drillId = e.currentTarget.getAttribute("data-id");
      selectedDrillIds.delete(drillId);
      renderSessionDrills();
      renderSelectedDrills();
    });
  });
}

// --- Drill Library tab (Stylized and Grouped) ---
function renderDrillLibrary() {
  const container = $("drill-list");
  if (!container) return;

  container.innerHTML = "";

  for (const category in DRILLS) {
    if (DRILLS.hasOwnProperty(category) && DRILLS[category].length > 0) {
        
      // Header for category section
      const categoryHeader = document.createElement("div");
      categoryHeader.className = "mt-8 mb-4 border-b-2 border-emerald-500 pb-3";
      categoryHeader.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-800 capitalize">${category.replace(/_/g, ' ')}</h3>
      `;
      container.appendChild(categoryHeader);

      DRILLS[category].forEach((drill) => {
        const card = document.createElement("div");
        // Enhanced card style for library
        card.className = "card border border-gray-200 p-4 space-y-2 hover:border-emerald-400 transition shadow-sm";

        card.innerHTML = `
          <div class="flex justify-between items-center">
            <p class="font-semibold text-lg text-gray-800">${drill.name}</p>
            <span class="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase font-medium">
              ${drill.subcategory || category}
            </span>
          </div>
          <p class="text-sm text-gray-600">${drill.description}</p>
          <div class="text-xs text-gray-500 pt-2 border-t mt-2">
            <p><strong>Focus Skills:</strong> ${drill.skills.join(", ")}</p>
            <p><strong>Duration:</strong> ~${drill.duration} min</p>
          </div>
        `;

        container.appendChild(card);
      });
    }
  }
}

// (initSaveSession and init functions are unchanged aside from dependencies)

// --- Init ---
function init() {
  initTabs();
  renderSkills();
  renderSessionDrills();
  
  // Prefill date
  const dateInput = $("session-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  
  // Listener for Go to Log button
  $("go-to-log")?.addEventListener("click", () => {
    document.querySelector('.tab-button[data-tab="log"]')?.click();
  });

  initSaveSession();
}

document.addEventListener("DOMContentLoaded", init);