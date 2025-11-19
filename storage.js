const PLAN_KEY = "golf_plan_v1";
const CHECKLIST_KEY = "golf_checklist_progress_v1";
const DRILL_LOG_KEY = "golf_drill_logs_v1";

export function loadPlan() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_KEY) || "null");
  } catch {
    return null;
  }
}

export function savePlan(plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function resetAllData() {
  localStorage.removeItem(PLAN_KEY);
  localStorage.removeItem(CHECKLIST_KEY);
  localStorage.removeItem(DRILL_LOG_KEY);
}

// -------- CHECKLIST PROGRESS --------
// stored as { drillId: completedCount }

export function loadChecklistProgress() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveChecklistProgress(progress) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(progress));
}

export function toggleChecklistEntry(drillId) {
  const progress = loadChecklistProgress();
  const current = progress[drillId] || 0;
  progress[drillId] = current + 1;
  saveChecklistProgress(progress);
}

// -------- DRILL LOGS --------
// array of { drillId, date, score, reps, notes, timestamp }

export function loadDrillLogs() {
  try {
    return JSON.parse(localStorage.getItem(DRILL_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDrillLog(entry) {
  const logs = loadDrillLogs();
  logs.push(entry);
  localStorage.setItem(DRILL_LOG_KEY, JSON.stringify(logs));
}
