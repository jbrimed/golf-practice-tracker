import { loadSessions } from "./storage.js";

export function renderHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  const sessions = loadSessions();
  historyList.innerHTML = "";

  if (sessions.length === 0) {
    historyList.innerHTML = `<p class="text-center text-gray-500">No sessions yet.</p>`;
    return;
  }

  sessions.forEach(session => {
    const div = document.createElement("div");
    div.className = "card border p-4";

    const date = new Date(session.date).toLocaleDateString();

    div.innerHTML = `
      <h3 class="font-bold text-emerald-700">${date} — ${session.location}</h3>
      <p class="text-sm text-gray-700 mt-2"><strong>Skills:</strong> ${session.skills.join(", ")}</p>
      <p class="mt-3 font-semibold">Drills:</p>
      <ul class="list-disc ml-6 text-sm">
        ${session.drills.map(d => `<li>${d.id}</li>`).join("")}
      </ul>
    `;
    historyList.appendChild(div);
  });
}
