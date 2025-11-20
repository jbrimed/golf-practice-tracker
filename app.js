// =============================
// app.js
// =============================

import { SKILLS } from "./skills.js";
import {
  selectedSkills,
  selectedDrillIds,
  currentSessionMeta,
  getFilteredDrills,
  saveCurrentSession,
} from "./session.js";
import { renderHistory } from "./history.js";

// Helper
const $ = (id) => document.getElementById(id);

// =============================
// INITIAL RENDER
// =============================

function renderSkills() {
  const container = $("skill-select");
  container.innerHTML = "";

  SKILLS.forEach((skill) => {
    const btn = document.createElement("button");
    btn.textContent = skill.label;
    btn.className =
      "px-3 py-2 rounded border border-gray-400 text-sm m-1 transition";

    if (selectedSkills.has(skill.id)) {
      btn.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
    }

    btn.addEventListener("click", () => {
      if (selectedSkills.has(skill.id)) {
        selectedSkills.delete(skill.id);
      } else {
        selectedSkills.add(skill.id);
      }

      renderSkills();
      renderDrills();
    });

    container.appendChild(btn);
  });
}

// =============================
// RENDER DRILL CARDS
// =============================

function renderDrills() {
  const container = $("drill-list");
  container.innerHTML = "";

  const drills = getFilteredDrills();

  if (drills.length === 0) {
    container.innerHTML =
      "<p class='text-gray-500 text-sm'>Select skills to see drills.</p>";
    return;
  }

  drills.forEach((drill) => {
    const card = document.createElement("div");
    card.className =
      "p-4 border rounded-lg bg-white shadow cursor-pointer transition hover:border-black";

    if (selectedDrillIds.has(drill.id)) {
      card.classList.add("border-green-600", "bg-green-50");
    }

    card.innerHTML = `
      <h3 class="font-bold text-lg">${drill.name}</h3>
      <p class="text-sm text-gray-600">${drill.club}</p>
      <p class="text-sm mt-2">${drill.instructions[0]}</p>
      <p class="text-xs text-gray-500 mt-2">Duration: ${drill.duration || 15} min</p>
    `;

    card.addEventListener("click", () => {
      if (selectedDrillIds.has(drill.id)) {
        selectedDrillIds.delete(drill.id);
      } else {
        selectedDrillIds.add(drill.id);
      }
      renderDrills();
    });

    container.appendChild(card);
  });
}

// =============================
// START SESSION
// =============================

$("start-session-btn")?.addEventListener("click", () => {
  currentSessionMeta.date = new Date().toISOString().split("T")[0];
  currentSessionMeta.hours = parseFloat($("input-hours")?.value || 1);
  currentSessionMeta.location = $("input-location")?.value || "Unknown";

  $("session-config").classList.add("hidden");
  $("session-log").classList.remove("hidden");

  renderSessionLogForm();
});

// =============================
// SESSION LOG FORM
// =============================

function renderSessionLogForm() {
  const container = $("session-log");
  container.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Log Session</h2>
    <form id="session-log-form" class="space-y-6"></form>
    <button id="save-session" class="w-full p-4 bg-black text-white rounded-xl text-lg mt-4">
      Save Session
    </button>
  `;

  const form = $("session-log-form");
  form.innerHTML = "";

  Array.from(selectedDrillIds).forEach((id) => {
    form.insertAdjacentHTML(
      "beforeend",
      `
        <div class="border p-4 rounded-lg bg-white shadow">
          <h3 class="font-semibold">${id}</h3>

          <label class="block text-sm font-medium mt-3">Score</label>
          <input type="number" id="score-${id}" class="w-full p-2 border rounded" step="1">

          <label class="block text-sm font-medium mt-3">Metric</label>
          <input type="text" id="metric-${id}" class="w-full p-2 border rounded">

          <label class="block text-sm font-medium mt-3">Notes</label>
          <textarea id="notes-${id}" class="w-full p-2 border rounded" rows="2"></textarea>
        </div>
      `
    );
  });

  $("save-session")?.addEventListener("click", () => {
    saveCurrentSession();
    alert("Saved!");
    location.reload();
  });
}

// =============================
// TAB EVENTS
// =============================

// History tab
document.querySelector('[data-tab="history"]')?.addEventListener("click", () => {
  renderHistory();
});

// Session builder tab
document.querySelector('[data-tab="session"]')?.addEventListener("click", () => {
  $("session-config").classList.remove("hidden");
  $("session-log").classList.add("hidden");
});

// =============================
// INIT
// =============================

renderSkills();
renderDrills();
