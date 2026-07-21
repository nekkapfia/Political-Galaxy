// Interactive Sliders + nearest-neighbor matching

function initSliders() {
  const container = document.getElementById("slider-container");
  if (!container) return;

  // Group by meta.group
  const groups = {};
  SLIDER_META.forEach(s => {
    if (!groups[s.group]) groups[s.group] = [];
    groups[s.group].push(s);
  });

  let html = "";
  for (const [groupName, sliders] of Object.entries(groups)) {
    html += `<div class="slider-group">
      <h3>${groupName}</h3>`;
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

  // Event listeners
  container.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener("input", () => {
      document.getElementById(`val-${input.dataset.id}`).textContent = input.value;
      updateMatches();
    });
  });

  document.getElementById("reset-sliders")?.addEventListener("click", () => {
    container.querySelectorAll('input[type=range]').forEach(input => {
      input.value = 50;
      document.getElementById(`val-${input.dataset.id}`).textContent = "50";
    });
    updateMatches();
  });

  updateMatches();
}

function getCurrentVector() {
  const vec = {};
  SLIDER_META.forEach(s => {
    const el = document.getElementById(`slider-${s.id}`);
    vec[s.id] = el ? parseInt(el.value, 10) : 50;
  });
  return vec;
}

function distance(a, b) {
  // Euclidean on dimensions that have scores in the entity
  let sum = 0, count = 0;
  for (const id of Object.keys(a)) {
    if (b[id] != null && !isNaN(b[id])) {
      const d = a[id] - b[id];
      sum += d * d;
      count++;
    }
  }
  if (count === 0) return Infinity;
  // Penalize entities with fewer scored dimensions slightly so fuller matches rank higher
  return Math.sqrt(sum / count) + (14 - count) * 0.8;
}

function updateMatches() {
  const target = getCurrentVector();
  const list = (typeof ENTITIES !== "undefined" && ENTITIES) ? ENTITIES : (window.ENTITIES || []);
  if (!list.length) {
    const container = document.getElementById("match-results");
    if (container) container.innerHTML = `<p class="text-slate-500">Loading scored entities…</p>`;
    return;
  }

  const results = list
    .map(e => ({ entity: e, dist: distance(target, e.scores) }))
    .filter(r => r.dist < Infinity)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 8);

  const container = document.getElementById("match-results");
  if (!results.length) {
    container.innerHTML = `<p class="text-slate-500">No scored entities match the current dimensions.</p>`;
    return;
  }

  container.innerHTML = results.map(r => {
    const e = r.entity;
    const scoredDims = Object.values(e.scores).filter(v => v != null).length;
    return `
      <div class="match-card" data-id="${e.id}" onclick="showEntityDetail('${e.id}')">
        <div class="font-medium text-slate-100">${e.name}</div>
        <div class="match-score mt-0.5">
          Distance: ${r.dist.toFixed(1)} · ${scoredDims}/14 dims · ${e.ideology || e.type}
        </div>
        <div class="text-xs text-slate-400 mt-1 line-clamp-2">${e.summary || ""}</div>
      </div>`;
  }).join("");
}

// Expose for detail navigation (from match cards or galaxy panel)
window.showEntityDetail = function(id) {
  // Switch to Detail section
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-section="detail"]').classList.add("active");
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById("section-detail").classList.remove("hidden");

  // Ensure controls exist (country/year panel stays on left)
  if (typeof ensureDetailControls === "function") ensureDetailControls();

  const entity = (window.ENTITIES || ENTITIES || []).find(e => e.id === id);
  const detail = document.getElementById("entity-detail");
  if (!detail) return;

  if (!entity) {
    detail.innerHTML = `<p class="text-slate-500">Entity not found: ${id}</p>`;
    return;
  }

  // Render a party / entity score card (snapshot, not year-based)
  let rows = "";
  for (const slider of SLIDER_META) {
    const v = entity.scores[slider.id];
    if (v != null) {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2.5 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2.5 pr-3 font-mono text-lg text-indigo-300">${v}</td>
          <td class="py-2.5 pr-3 text-sm text-slate-400">—</td>
          <td class="py-2.5 text-xs text-slate-400">Party snapshot</td>
        </tr>`;
    } else {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2.5 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2.5 pr-3 font-mono text-slate-600">—</td>
          <td class="py-2.5 pr-3 text-sm text-slate-600">not scored</td>
          <td class="py-2.5 text-xs text-slate-600">Missing dimension</td>
        </tr>`;
    }
  }

  detail.innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold">${entity.name}</h2>
        <div class="text-slate-400 mt-1">${entity.type} · ${entity.country} · ${entity.era}</div>
        <div class="text-sm text-indigo-300 mt-1">${entity.ideology || ""}</div>
      </div>
      <div class="text-right text-sm text-slate-400 max-w-xs">
        This is a contemporary scoring snapshot.<br>
        Use the country + year controls on the left for historical national scores.
      </div>
    </div>
    <p class="text-sm text-slate-300 mb-4 leading-relaxed">${entity.summary || ""}</p>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-700">
            <th class="py-2 pr-3">Slider</th>
            <th class="py-2 pr-3">Score</th>
            <th class="py-2 pr-3">Era</th>
            <th class="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <p class="mt-6 text-xs text-slate-500">
      Party scores are modern snapshots derived from the same empirical methodology as the national timelines.
      Null / missing values are excluded from nearest-neighbour distance calculations.
    </p>
  `;
};
