// ============================================================
// Sliders Explorer – orbital interactive axes + three modes
// Fully independent page
// ============================================================

let currentMode = "modern";
let currentVector = {};
let selectedCountry = "United Kingdom";
let selectedParty = null;
let selectedYear = 2024;

const allSlots = {
  party1: { locked: true },
  party2: { locked: true },
  era1:   { locked: true },
  era2:   { locked: true }
};

// Orbital positions (percent of container) for the 7 groups (pairs)
// Order matches the visual ring around the centre
const ORBIT_POSITIONS = [
  { top: "3%",  left: "50%", transform: "translateX(-50%)" },          // top – Cultural 1
  { top: "18%", left: "8%" },                                          // upper-left – Core 1
  { top: "18%", right: "8%" },                                         // upper-right – Core 2
  { top: "48%", left: "2%" },                                          // mid-left – Cultural 2
  { top: "48%", right: "2%" },                                         // mid-right – Cultural 3
  { bottom: "18%", left: "10%" },                                      // lower-left – Cultural 4
  { bottom: "18%", right: "10%" }                                      // lower-right – Cultural 5
];

function initSliders() {
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => {
        b.classList.remove("active", "bg-indigo-600", "text-white");
        b.classList.add("text-slate-400");
      });
      btn.classList.add("active", "bg-indigo-600", "text-white");
      btn.classList.remove("text-slate-400");
      currentMode = btn.dataset.mode;
      renderCenterPanel();
      refreshScores();
    });
  });

  buildOrbitalSliders();
  SLIDER_META.forEach(s => currentVector[s.id] = 50);
  renderCenterPanel();
  if (typeof loadIndexData === "function") {
    loadIndexData().then(() => refreshScores());
  } else {
    refreshScores();
  }
}

function buildOrbitalSliders() {
  const container = document.getElementById("slider-container");
  if (!container) return;

  // Group into the 7 visual cards that sit on the orbit
  const groups = [
    { title: "Cultural 1 – Foundation", ids: ["C1A", "C1B"] },
    { title: "Core 1 – Autonomy",       ids: ["1A", "1B"] },
    { title: "Core 2 – Sovereignty",    ids: ["2A", "2B"] },
    { title: "Cultural 2 – Identity",   ids: ["C2A", "C2B"] },
    { title: "Cultural 3 – Boundaries", ids: ["C3A", "C3B"] },
    { title: "Cultural 4 – Structure",  ids: ["C4A", "C4B"] },
    { title: "Cultural 5 – Change",     ids: ["C5A", "C5B"] }
  ];

  let html = "";
  groups.forEach((g, i) => {
    const pos = ORBIT_POSITIONS[i] || {};
    const style = Object.entries(pos).map(([k, v]) => `${k}:${v}`).join(";");
    html += `<div class="slider-group absolute z-10" style="${style}; width:200px;">
      <h3>${g.title}</h3>`;
    g.ids.forEach(id => {
      const meta = SLIDER_META.find(s => s.id === id) || { short: id, desc: "" };
      html += `
        <div class="slider-row" title="${meta.desc}">
          <label for="slider-${id}">${meta.short}</label>
          <input type="range" id="slider-${id}" min="0" max="100" value="50" data-id="${id}" />
          <span class="slider-value" id="val-${id}">50</span>
        </div>`;
    });
    html += `</div>`;
  });
  container.innerHTML = html;

  container.querySelectorAll("input[type=range]").forEach(input => {
    input.addEventListener("input", () => {
      const id = input.dataset.id;
      const valEl = document.getElementById(`val-${id}`);
      if (valEl) valEl.textContent = input.value;
      currentVector[id] = parseInt(input.value, 10);
      refreshScores();
    });
  });
}

function renderCenterPanel() {
  const panel = document.getElementById("center-panel");
  if (!panel) return;

  if (currentMode === "modern") {
    panel.innerHTML = `
      <div class="text-xs text-indigo-300 font-medium mb-2">Modern – Party Snapshot</div>
      <label>Country</label>
      <select id="modern-country"></select>
      <label>Political Party</label>
      <select id="modern-party"></select>
      <div class="text-xs text-slate-500 mt-1">Moving sliders finds nearest party</div>
    `;
    populateCountrySelect("modern-country", selectedCountry);
    populatePartySelect("modern-party", selectedCountry, selectedParty);
    document.getElementById("modern-country").addEventListener("change", e => {
      selectedCountry = e.target.value;
      populatePartySelect("modern-party", selectedCountry, null);
      selectedParty = null;
      refreshScores();
    });
    document.getElementById("modern-party").addEventListener("change", e => {
      selectedParty = e.target.value || null;
      refreshScores();
    });
  } else if (currentMode === "historical") {
    panel.innerHTML = `
      <div class="text-xs text-indigo-300 font-medium mb-2">Historical – Timeline</div>
      <label>Country</label>
      <select id="hist-country"></select>
      <label>Year</label>
      <input type="number" id="hist-year" value="${selectedYear}" min="1945" max="2030" />
      <div class="text-xs text-slate-500 mt-1">Scores update on change</div>
    `;
    populateCountrySelect("hist-country", selectedCountry);
    document.getElementById("hist-country").addEventListener("change", e => {
      selectedCountry = e.target.value;
      refreshScores();
    });
    document.getElementById("hist-year").addEventListener("input", e => {
      selectedYear = parseInt(e.target.value, 10) || 2024;
      refreshScores();
    });
  } else {
    panel.innerHTML = `
      <div class="text-xs text-indigo-300 font-medium mb-2">All – Live Nearest Matches</div>
      <div class="grid grid-cols-2 gap-1.5">
        <div class="match-slot ${allSlots.party1.locked ? "locked" : ""}" id="slot-party1">
          <button class="lock-btn" data-slot="party1">${allSlots.party1.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">1st Party</div>
          <div class="slot-value" id="val-party1">—</div>
        </div>
        <div class="match-slot ${allSlots.party2.locked ? "locked" : ""}" id="slot-party2">
          <button class="lock-btn" data-slot="party2">${allSlots.party2.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">2nd Party</div>
          <div class="slot-value" id="val-party2">—</div>
        </div>
        <div class="match-slot ${allSlots.era1.locked ? "locked" : ""}" id="slot-era1">
          <button class="lock-btn" data-slot="era1">${allSlots.era1.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">1st Era</div>
          <div class="slot-value" id="val-era1">—</div>
        </div>
        <div class="match-slot ${allSlots.era2.locked ? "locked" : ""}" id="slot-era2">
          <button class="lock-btn" data-slot="era2">${allSlots.era2.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">2nd Era</div>
          <div class="slot-value" id="val-era2">—</div>
        </div>
      </div>
      <div class="text-xs text-slate-500 mt-1.5">🔒 country only · 🔓 all countries</div>
    `;
    panel.querySelectorAll(".lock-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const slot = btn.dataset.slot;
        allSlots[slot].locked = !allSlots[slot].locked;
        btn.textContent = allSlots[slot].locked ? "🔒" : "🔓";
        document.getElementById(`slot-${slot}`).classList.toggle("locked", allSlots[slot].locked);
        refreshScores();
      });
    });
  }
}

function populateCountrySelect(id, current) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const countries = (typeof getAvailableCountries === "function") ? getAvailableCountries() : ["United Kingdom"];
  sel.innerHTML = countries.map(c => `<option value="${c}" ${c===current?"selected":""}>${c}</option>`).join("");
}

function populatePartySelect(id, country, current) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const parties = (PARTY_DATA[country] && Object.keys(PARTY_DATA[country])) || [];
  sel.innerHTML = `<option value="">— select party —</option>` +
    parties.map(p => `<option value="${p}" ${p===current?"selected":""}>${p}</option>`).join("");
}

function distance(a, b) {
  let sum = 0, count = 0;
  for (const id of Object.keys(a)) {
    if (b[id] != null && !isNaN(b[id])) {
      const d = a[id] - b[id];
      sum += d * d; count++;
    }
  }
  return count === 0 ? Infinity : Math.sqrt(sum / count) + (14 - count) * 0.8;
}

function findNearestParties(target, countryFilter, limit) {
  const list = (window.ENTITIES || ENTITIES || []).filter(e => e.type === "party");
  const filtered = countryFilter ? list.filter(e => e.country === countryFilter) : list;
  return filtered
    .map(e => ({ entity: e, dist: distance(target, e.scores) }))
    .filter(r => r.dist < Infinity)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit);
}

function findNearestEras(target, countryFilter, limit) {
  const candidates = [];
  const countries = countryFilter ? [countryFilter] : Object.keys(SCORE_DATA || {});
  for (const country of countries) {
    const range = (typeof getYearRange === "function") ? getYearRange(country) : { min: 1945, max: 2026 };
    const years = new Set([range.min, range.max, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2016, 2020, 2022, 2024, 2026]);
    for (let y = range.min; y <= range.max; y += 5) years.add(y);
    for (const year of years) {
      const vec = (typeof getVector === "function") ? getVector(country, year) : null;
      if (!vec || !vec.scores) continue;
      const dist = distance(target, vec.scores);
      if (dist < Infinity) candidates.push({ country, year, dist });
    }
  }
  return candidates.sort((a, b) => a.dist - b.dist).slice(0, limit);
}

function refreshScores() {
  if (currentMode === "modern") {
    // scores are already on the interactive sliders; nearest party is informational via centre
    if (selectedParty && PARTY_DATA[selectedCountry]?.[selectedParty]) {
      // optional: could sync slider values to selected party, but leave user control
    }
  } else if (currentMode === "historical") {
    const vec = (typeof getVector === "function") ? getVector(selectedCountry, selectedYear) : { scores: {} };
    // push timeline scores onto the range inputs
    SLIDER_META.forEach(s => {
      const v = vec.scores?.[s.id];
      const input = document.getElementById(`slider-${s.id}`);
      const valEl = document.getElementById(`val-${s.id}`);
      if (input && v != null) {
        input.value = v;
        if (valEl) valEl.textContent = v;
        currentVector[s.id] = v;
      }
    });
  } else {
    const pFilter = allSlots.party1.locked ? selectedCountry : null;
    const parties = findNearestParties(currentVector, pFilter, 3);
    const el1 = document.getElementById("val-party1");
    const el2 = document.getElementById("val-party2");
    if (el1) el1.textContent = parties[0] ? `${parties[0].entity.name} (${parties[0].dist.toFixed(1)})` : "—";
    if (el2) el2.textContent = parties[1] ? `${parties[1].entity.name} (${parties[1].dist.toFixed(1)})` : "—";

    const eFilter = allSlots.era1.locked ? selectedCountry : null;
    const eras = findNearestEras(currentVector, eFilter, 3);
    const ee1 = document.getElementById("val-era1");
    const ee2 = document.getElementById("val-era2");
    if (ee1) ee1.textContent = eras[0] ? `${eras[0].country} ${eras[0].year} (${eras[0].dist.toFixed(1)})` : "—";
    if (ee2) ee2.textContent = eras[1] ? `${eras[1].country} ${eras[1].year} (${eras[1].dist.toFixed(1)})` : "—";
  }
}
