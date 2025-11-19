const QUOTA_KEY = "golf-practice-quotas";
const SESSION_KEY = "golf-practice-sessions";

export function saveQuotaState(key, value) {
    const data = loadQuotaState();
    data[key] = value;
    localStorage.setItem(QUOTA_KEY, JSON.stringify(data));
}

export function loadQuotaState() {
    return JSON.parse(localStorage.getItem(QUOTA_KEY) || "{}");
}

export function saveSession(session) {
    const sessions = loadSessions();
    sessions.push(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
}

export function loadSessions() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
}
