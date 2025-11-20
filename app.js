// app.js - main client logic

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";
import { saveSession, loadSessions } from "./storage.js";

const $ = (id) => document.getElementById(id);

// --- State ---
let selectedSkills = new Set();
let selectedDrillIds = new Set();

// --- Tabs ---
function initTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabs.forEach((b) => b.classList.remove("active"));
      panes.forEach((p) => p.classList.add("hidden"));

      btn.classList.add("active");
      document.getElementById(target).classList.remove("hidden");

      if (target === "history") {
        renderHistory();
      } else if (target === "drills") {
        renderDrillLibrary();
      }
    });
  });

  // Default to session tab
  document.querySelector('.tab-button[data-tab="session"]').classList.add("active");
  document.getElementById("session").classList.remove("hidden");
}

// --- Skills UI ---
function renderSkills() {
  const container = $("skill-select");
  if (!container) return;

  container.innerHTML = "";

  SKILLS.forEach((skill) => {
    const wrapper = document.createElement("label");
    wrapper.className = "flex items-center space-x-2 text-sm";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = skill.id;
    cb.className = "skill-checkbox";

    cb.addEventListener("change", () => {
      if (cb.checked) selectedSkills.add(skill.id);
      else selectedSkills.delete(skill.id);
      renderSessionDrills();
    });

    const span = document.createElement("span");
    span.textContent = skill.label;

    wrapper.appendChild(cb);
    wrapper.appendChild(span);
    container.appendChild(wrapper);
  });
}

// --- Drill filtering ---
function getFilteredDrills() {
  if (selectedSkills.size === 0) return [];
  return DRILLS.filter((d) => d.skills.some((s) => selectedSkills.has(s)));
}

// --- Drills for session tab ---
function renderSessionDrills() {
  const container = $("drill-select");
  if (!container) return;

  container.innerHTML = "";

  const drills = getFilteredDrills();
  if (drills.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">Select one or more skills above to see matching drills.</p>';
    renderSelectedDrills();
    return;
  }

  drills.forEach((drill) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-200 space-y-2";

    const added = selectedDrillIds.has(drill.id);

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-emerald-700">${drill.name}</h3>
          <p class="text-xs uppercase tracking-wide text-gray-400">${drill.category}</p>
        </div>
        <button
          data-id="${drill.id}"
          class="toggle-drill px-3 py-1 text-xs rounded ${added ? "bg-gray-300" : "bg-emerald-600 text-white"}"
        >
          ${added ? "Added" : "Add"}
        </button>
      </div>
      <p class="text-sm text-gray-700">${drill.description}</p>
      <p class="text-xs text-gray-500">~${drill.duration} min</p>
    `;

    container.appendChild(card);
  });

  // Attach listeners after DOM insertion
  container.querySelectorAll(".toggle-drill").forEach((btn) => {
    const id = btn.getAttribute("data-id");
    btn.addEventListener("click", () => {
      if (selectedDrillIds.has(id)) {
        selectedDrillIds.delete(id);
      } else {
        selectedDrillIds.add(id);
      }
      renderSessionDrills();
      renderSelectedDrills();
    });
  });

  renderSelectedDrills();
}

function renderSelectedDrills() {
  const container = $("selected-drills");
  if (!container) return;

  container.innerHTML = "";

  if (selectedDrillIds.size === 0) {
    container.innerHTML =
      '<p class="text-xs text-gray-500 italic">No drills selected yet.</p>';
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "list-disc ml-5 text-sm text-gray-700";

  DRILLS.filter((d) => selectedDrillIds.has(d.id)).forEach((drill) => {
    const li = document.createElement("li");
    li.textContent = `${drill.name} (${drill.duration} min)`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// --- Drill Library tab ---
function renderDrillLibrary() {
  const container = $("drill-list");
  if (!container) return;

  container.innerHTML = "";

  DRILLS.forEach((drill) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-200 space-y-2";

    card.innerHTML = `
      <h3 class="font-semibold text-emerald-700">${drill.name}</h3>
      <p class="text-xs uppercase tracking-wide text-gray-400">${drill.category}</p>
      <p class="text-sm text-gray-700">${drill.description}</p>
      <p class="text-xs text-gray-500 mt-1">Skills: ${drill.skills.join(", ")}</p>
      <p class="text-xs text-gray-500">~${drill.duration} min</p>
    `;

    container.appendChild(card);
  });
}

// --- Save Session ---
function initSaveSession() {
  const btn = $("save-session");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const dateInput = $("session-date");
    const hoursInput = $("session-hours");
    const locInput = $("session-location");
    const notesInput = $("session-notes");

    const date =
      dateInput && dateInput.value
        ? dateInput.value
        : new Date().toISOString().slice(0, 10);

    const hours = hoursInput && hoursInput.value
      ? parseFloat(hoursInput.value)
      : null;

    const location = locInput ? locInput.value : "unspecified";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (selectedDrillIds.size === 0) {
      alert("Select at least one drill before saving the session.");
      return;
    }

    const session = {
      date,
      hours,
      location,
      skills: Array.from(selectedSkills),
      drills: Array.from(selectedDrillIds),
      notes,
      createdAt: new Date().toISOString()
    };

    saveSession(session);
    alert("Session saved.");

    // Reset
    selectedSkills = new Set();
    selectedDrillIds = new Set();
    if (notesInput) notesInput.value = "";
    if (hoursInput) hoursInput.value = "";
    if (locInput) locInput.value = "net";

    // Uncheck all skill checkboxes
    document.querySelectorAll(".skill-checkbox").forEach((cb) => {
      cb.checked = false;
    });

    renderSessionDrills();
    renderSelectedDrills();
  });
}

// --- History tab ---
function renderHistory() {
  const container = $("history-list");
  if (!container) return;

  const sessions = loadSessions().slice().sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  container.innerHTML = "";

  if (sessions.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">No sessions logged yet.</p>';
    return;
  }

  // Map ids to labels for display
  const skillMap = new Map(SKILLS.map((s) => [s.id, s.label]));
  const drillMap = new Map(DRILLS.map((d) => [d.id, d.name]));

  sessions.forEach((session) => {
    const card = document.createElement("div");
    card.className = "card border border-gray-200 space-y-2";

    const dateStr = new Date(session.date || session.createdAt).toLocaleDateString();

    const skillLabels = (session.skills || []).map((id) => skillMap.get(id) || id);
    const drillNames = (session.drills || []).map((id) => drillMap.get(id) || id);

    card.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-emerald-700">${dateStr}</h3>
        <span class="text-xs bg-gray-100 px-2 py-1 rounded">${session.location || "unspecified"}</span>
      </div>
      <p class="text-xs text-gray-500">Time: ${session.hours || "N/A"} hrs</p>
      <p class="text-sm text-gray-700"><strong>Skills:</strong> ${skillLabels.join(", ") || "None"}</p>
      <p class="text-sm text-gray-700"><strong>Drills:</strong> ${drillNames.join(", ")}</p>
      ${
        session.notes
          ? `<p class="text-sm text-gray-700 mt-2"><strong>Notes:</strong> ${session.notes}</p>`
          : ""
      }
    `;

    container.appendChild(card);
  });
}

// --- Init ---
function init() {
  initTabs();
  renderSkills();
  renderSessionDrills();
  renderDrillLibrary();

  // Prefill date
  const dateInput = $("session-date");
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  initSaveSession();
}

document.addEventListener("DOMContentLoaded", init);
