// ======================
// app.js (working version)
// ======================

import { CATEGORIES } from "./skills.js";
import { ALL_DRILLS } from "./drills.js";
import { selectedSkills, selectedDrillIds, currentSessionMeta, saveCurrentSession, getFilteredDrills } from "./session.js";
import { renderHistory } from "./history.js";

// ---------------------
// Tabs
// ---------------------
const tabs = document.querySelectorAll(".tab-button");
const panes = document.querySelectorAll(".tab-pane");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabs.forEach(b => b.classList.remove("active"));
    panes.forEach(p => p.classList.add("hidden"));

    btn.classList.add("active");
    document.getElementById(target).classList.remove("hidden");

    if (target === "history") renderHistory();
    if (target === "drills") renderDrillLibrary();
  });
});

// ---------------------
// Render Skill Checkboxes
// ---------------------
const skillContainer = document.getElementById("skill-select");

skillContainer.innerHTML = CATEGORIES.map(cat => `
  <label class="flex items-center space-x-2">
    <input type="checkbox" value="${cat}" class="skill-checkbox">
    <span class="font-medium">${cat.toUpperCase()}</span>
  </label>
`).join("");

document.querySelectorAll(".skill-checkbox").forEach(cb => {
  cb.addEventListener("change", () => {
    if (cb.checked) selectedSkills.add(cb.value);
    else selectedSkills.delete(cb.value);

    renderFilteredDrills();
  });
});

// ---------------------
// Render Filtered Drills
// ---------------------
function renderFilteredDrills() {
  const container = document.getElementById("drill-select");
  container.innerHTML = "";

  const drills = getFilteredDrills();
  if (drills.length === 0) {
    container.innerHTML = `<p class="text-gray-500">Select skills to see drills.</p>`;
    return;
  }

  drills.forEach(drill => {
    const div = document.createElement("div");
    div.className = "card border p-4 space-y-2";

    div.innerHTML = `
      <h3 class="font-bold text-emerald-700">${drill.name}</h3>
      <p class="text-sm text-gray-700">${drill.description}</p>
      <button class="select-drill bg-emerald-600 text-white px-3 py-1 rounded"
              data-id="${drill.id}">
        Add Drill
      </button>
    `;

    div.querySelector("button").addEventListener("click", e => {
      selectedDrillIds.add(drill.id);
      e.target.classList.add("bg-gray-400");
      e.target.textContent = "Added";
    });

    container.appendChild(div);
  });
}

// ---------------------
// Start Session
// ---------------------
document.getElementById("start-session").addEventListener("click", () => {
  currentSessionMeta.date = new Date().toISOString();
  currentSessionMeta.hours = parseFloat(document.getElementById("session-duration").value);
  currentSessionMeta.location = document.getElementById("session-location").value;

  saveCurrentSession();
  alert("Session saved!");
});

// ---------------------
// Drill Library Tab
// ---------------------
function renderDrillLibrary() {
  const list = document.getElementById("drill-list");
  list.innerHTML = "";

  ALL_DRILLS.forEach(d => {
    const div = document.createElement("div");
    div.className = "card border p-4 space-y-2";

    div.innerHTML = `
      <h3 class="font-bold text-emerald-700">${d.name}</h3>
      <p class="text-sm text-gray-600">${d.description}</p>
      <p class="text-xs text-gray-400">Category: ${d.category}</p>
    `;
    list.appendChild(div);
  });
}
