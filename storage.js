const SESSION_KEY = "golf_sessions";

export function saveSession(session) {
  const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  data.push(session);
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function loadSessions() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
}
