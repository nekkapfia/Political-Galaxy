// ============================================================
// Spiders Explorer – Concentric layout with three modes
// Modern / Historical / All
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
      updateInteractiveVisibility();
      refreshScores();
    });
  });

  buildInteractiveSliders();
  document.getElementById("reset-sliders")?.addEventListener("click", () => {
    SLIDER_META.forEach(s => {
      const el = document.getElementById(`slider-${s.id}`);
      if (el) {
        el.value = 50;
        const valEl = document.getElementById(`val-${s.id}`);
        if (valEl) valEl.textContent = "50";
        currentVector[s.id] = 50;
      }
    });
    refreshScores();
  });

  SLIDER_META.forEach(s => currentVector[s.id] = 50);
  renderCenterPanel();
  updateInteractiveVisibility();
  // Delay first refresh until data is ready
  if (typeof loadIndexData === "function") {
    loadIndexData().then(() => refreshScores());
  } else {
    refreshScores();
  }
}

function updateInteractiveVisibility() {
  const box = document.getElementById("interactive-sliders");
  if (!box) return;
  box.classList.toggle("hidden", currentMode === "historical");
}

function buildInteractiveSliders() {
  const container = document.getElementById("slider-container");
  if (!container) return;

  const groups = {};
  SLIDER_META.forEach(s => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });

  let html = "";
  for (const [groupName, sliders] of Object.entries(groups)) {
    html += `<div class="slider-group"><h3>${groupName}</h3>`;
    sliders.forEach(s => {
      html += `
        <div class="slider-row" title="${s.desc}">
          <label for="slider-${s.id}">${s.short}</label>
          <input type="range" id="slider-${s.id}" min="0" max="100" value="50" data-id="${s.id}" />
          <span class="slider-value" id="val-${s.id}">50</span>
        </div>`;
    });
    html += `</div>`;
  }
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
      <div class="text-xs text-indigo-300 font-medium mb-2">Historical – Timeline Lookup</div>
      <label>Country</label>
      <select id="hist-country"></select>
      <label>Year</label>
      <input type="number" id="hist-year" value="${selectedYear}" min="1945" max="2030" />
      <div class="text-xs text-slate-500 mt-1">Scores update instantly on change</div>
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
      <div class="grid grid-cols-2 gap-2">
        <div class="match-slot ${allSlots.party1.locked ? "locked" : ""}" id="slot-party1">
          <button class="lock-btn" data-slot="party1" title="Toggle country lock">${allSlots.party1.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">1st Party</div>
          <div class="slot-value" id="val-party1">—</div>
        </div>
        <div class="match-slot ${allSlots.party2.locked ? "locked" : ""}" id="slot-party2">
          <button class="lock-btn" data-slot="party2" title="Toggle country lock">${allSlots.party2.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">2nd Party</div>
          <div class="slot-value" id="val-party2">—</div>
        </div>
        <div class="match-slot ${allSlots.era1.locked ? "locked" : ""}" id="slot-era1">
          <button class="lock-btn" data-slot="era1" title="Toggle country lock">${allSlots.era1.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">1st Era</div>
          <div class="slot-value" id="val-era1">—</div>
        </div>
        <div class="match-slot ${allSlots.era2.locked ? "locked" : ""}" id="slot-era2">
          <button class="lock-btn" data-slot="era2" title="Toggle country lock">${allSlots.era2.locked ? "🔒" : "🔓"}</button>
          <div class="slot-title">2nd Era</div>
          <div class="slot-value" id="val-era2">—</div>
        </div>
      </div>
      <div class="text-xs text-slate-500 mt-2">🔒 = only selected country · 🔓 = all countries</div>
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

function populateCountrySelect(selectId, current) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const countries = (typeof getAvailableCountries === "function") ? getAvailableCountries() : ["United Kingdom"];
  sel.innerHTML = countries.map(c =>
    `<option value="${c}" ${c === current ? "selected" : ""}>${c}</option>`
  ).join("");
}

function populatePartySelect(selectId, country, current) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const parties = (PARTY_DATA[country] && Object.keys(PARTY_DATA[country])) || [];
  sel.innerHTML = `<option value="">— select party —</option>` +
    parties.map(p => `<option value="${p}" ${p === current ? "selected" : ""}>${p}</option>`).join("");
}

function setAxisScores(scores) {
  SLIDER_META.forEach(s => {
    const el = document.getElementById(`score-${s.id}`);
    if (el) {
      const v = scores ? scores[s.id] : null;
      el.textContent = (v != null && !isNaN(v)) ? v : "—";
    }
  });
}

function distance(a, b) {
  let sum = 0, count = 0;
  for (const id of Object.keys(a)) {
    if (b[id] != null && !isNaN(b[id])) {
      const d = a[id] - b[id];
      sum += d * d;
      count++;
    }
  }
  if (count === 0) return Infinity;
  return Math.sqrt(sum / count) + (14 - count) * 0.8;
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
      if (dist < Infinity) candidates.push({ country, year, scores: vec.scores, dist });
    }
  }
  return candidates.sort((a, b) => a.dist - b.dist).slice(0, limit);
}

function refreshScores() {
  if (currentMode === "modern") {
    let scores = {};
    if (selectedParty && PARTY_DATA[selectedCountry] && PARTY_DATA[selectedCountry][selectedParty]) {
      scores = PARTY_DATA[selectedCountry][selectedParty];
    } else {
      const nearest = findNearestParties(currentVector, selectedCountry, 1);
      if (nearest.length) scores = nearest[0].entity.scores;
    }
    setAxisScores(scores);
  } else if (currentMode === "historical") {
    const vec = (typeof getVector === "function") ? getVector(selectedCountry, selectedYear) : { scores: {} };
    setAxisScores(vec.scores || {});
  } else {
    const pFilter = allSlots.party1.locked ? selectedCountry : null;
    const parties = findNearestParties(currentVector, pFilter, 3);
    const party1 = parties[0];
    const party2 = parties[1];

    const el1 = document.getElementById("val-party1");
    const el2 = document.getElementById("val-party2");
    if (el1) el1.textContent = party1 ? `${party1.entity.name} (${party1.dist.toFixed(1)})` : "—";
    if (el2) el2.textContent = party2 ? `${party2.entity.name} (${party2.dist.toFixed(1)})` : "—";

    const eFilter = allSlots.era1.locked ? selectedCountry : null;
    const eras = findNearestEras(currentVector, eFilter, 3);
    const era1 = eras[0];
    const era2 = eras[1];

    const ee1 = document.getElementById("val-era1");
    const ee2 = document.getElementById("val-era2");
    if (ee1) ee1.textContent = era1 ? `${era1.country} ${era1.year} (${era1.dist.toFixed(1)})` : "—";
    if (ee2) ee2.textContent = era2 ? `${era2.country} ${era2.year} (${era2.dist.toFixed(1)})` : "—";

    setAxisScores(party1 ? party1.entity.scores : {});
  }
}

window.showEntityDetail = function(id) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const detailBtn = document.querySelector('[data-section="detail"]');
  if (detailBtn) detailBtn.classList.add("active");
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  const sec = document.getElementById("section-detail");
  if (sec) sec.classList.remove("hidden");
  if (typeof ensureDetailControls === "function") ensureDetailControls();
};
