// ==============================
// history.js
// ==============================

import { loadSessions } from "./storage.js";

export function renderHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  const sessions = loadSessions();

  historyList.innerHTML = "";

  if (sessions.length === 0) {
    historyList.innerHTML = `
      <p class="text-center text-gray-500 mt-8">
        No sessions logged yet. Go to the "New Session" tab to start tracking.
      </p>`;
    return;
  }

  sessions.forEach((session, idx) => {
    const date = new Date(session.date).toLocaleDateString();
    
    const entry = document.createElement("div");
    entry.className = "card border border-gray-200 p-4 space-y-2";

    entry.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-emerald-700">${date}</h3>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          ${session.location || "Unknown"}
        </span>
      </div>

      <p class="text-sm"><strong>Intents:</strong> ${session.skills?.join(", ") || "N/A"}</p>

      <button class="toggle-details text-sm text-emerald-700 underline">
        Show Details
      </button>

      <div class="details hidden text-sm space-y-2 pt-2 border-t mt-2">
        <p><strong>Drills:</strong></p>
        <ul class="list-disc ml-5 text-gray-700">
          ${session.drills.map(d => `<li>${d.name}</li>`).join("")}
        </ul>

        ${session.notes ? `<p class="pt-2"><strong>Notes:</strong> ${session.notes}</p>` : ""}
      </div>
    `;

    // Add expand/collapse
    const toggleBtn = entry.querySelector(".toggle-details");
    const details = entry.querySelector(".details");

    toggleBtn.addEventListener("click", () => {
      details.classList.toggle("hidden");
      toggleBtn.textContent = details.classList.contains("hidden")
        ? "Show Details"
        : "Hide Details";
    });

    historyList.appendChild(entry);
  });
}
