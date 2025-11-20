// session.js
// Handles session state, drill scoring, saving, history rendering

import { DRILLS } from "./drills.js";
import { SKILLS } from "./skills.js";

// ---- Storage Key ----
const SESSIONS_KEY = "golf_sessions_v1";

// ---- Element Helper ----
export function $(id) {
  return document.getElementById(id);
}

// ---- Flatten drill library ----
export const ALL_DRILLS = Object.entries(DRILLS).flatMap(([category, drills]) =>
  drills.map(d => ({ 
    ...d, 
    category, // ADDED: Injects the top-level club/category (driver, irons, etc.)
    // FIXED: Ensures 'description' is always available, prioritizing 'description' property
    description: d.description || (d.instructions && d.instructions[0]) || 'No detailed instructions available.'
  }))
);

// Lookup table
export const DRILLS_BY_ID = ALL_DRILLS.reduce((acc, d) => {
  acc[d.id] = d;
  return acc;
}, {});

// ---- Session State ----
export let selectedSkills = new Set();
export let selectedDrillIds = new Set();
// FIXED: Initialize as an empty object so app.js can assign properties directly
export let currentSessionMeta = {}; 

// ---- Storage Helpers ----
export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load session history:", e);
    return [];
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// ---- Filtering ----
export function getFilteredDrills() {
  if (selectedSkills.size === 0) return [];
  const selected = Array.from(selectedSkills);

  return ALL_DRILLS
    .map(d => ({
      drill: d,
      score: d.skills?.filter(s => selected.includes(s)).length || 0
    }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.drill);
}

// ---- Recommendation heuristic ----
export function estimateRecommendedDrills(drills, hours) {
  if (!hours || isNaN(hours) || hours <= 0) return drills.slice(0, 4);

  const targetMinutes = hours * 60;
  const out = [];
  let sum = 0;

  for (const d of drills) {
    if (sum + d.duration <= targetMinutes + 15) {
      out.push(d);
      sum += d.duration;
    }
  }
  return out.length ? out : drills.slice(0, 4);
}

// ---- Saving a Session ----
export function saveCurrentSession() {
  const date = currentSessionMeta.date;
  const hours = currentSessionMeta.hours;
  const location = currentSessionMeta.location;
  const skills = Array.from(selectedSkills);
  const drills = Array.from(selectedDrillIds).map(id => DRILLS_BY_ID[id]);

  const form = $("session-log-form");
  if (!form) return;

  const drillEntries = drills.map(drill => {
    // Note: form properties should use the `name` attribute or ensure direct access via ID works
    // The previous app.js setup used IDs like score-${id}
    const scoreInput = form.querySelector(`#score-${drill.id}`);
    const metricInput = form.querySelector(`#metric-${drill.id}`);
    const notesInput = form.querySelector(`#notes-${drill.id}`);
    
    const score = parseInt(scoreInput?.value ?? "", 10);

    return {
      drillId: drill.id,
      name: drill.name,
      category: drill.category,
      score: isNaN(score) ? null : score,
      metric: metricInput?.value?.trim() || "",
      rate: "", // 'rate' input was not created in app.js form
      notes: notesInput?.value?.trim() || ""
    };
  });

  const sessionRecord = {
    id: crypto.randomUUID(),
    date,
    hours,
    location,
    skills,
    drills: drillEntries,
    createdAt: new Date().toISOString()
  };

  const sessions = loadSessions();
  sessions.push(sessionRecord);
  saveSessions(sessions);

  // Note: Selected drills cleared, but skills selection remains for next session setup
  selectedDrillIds.clear();
  // alert("Session saved."); // Removed this line as app.js handles the alert now.
}