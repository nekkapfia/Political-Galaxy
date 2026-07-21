// Main app: navigation + country/year Detail view + init

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Index JSON data to load before initialising UI
  if (typeof loadIndexData === "function") {
    await loadIndexData();
  }

  // Navigation
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
      const el = document.getElementById("section-" + section);
      if (el) el.classList.remove("hidden");

      if (section === "galaxy") {
        setTimeout(initGalaxy, 50);
      }
      if (section === "detail") {
        // Ensure the country/year controls are ready
        ensureDetailControls();
      }
    });
  });

  populateIndex();
  initSliders();
  ensureDetailControls();

  // Default to Galaxy
  document.querySelector('[data-section="galaxy"]').click();
});

// ------------------------------------------------------------
// Index
// ------------------------------------------------------------
function populateIndex() {
  const coreUl = document.getElementById("index-core");
  const slidUl = document.getElementById("index-sliders");
  const scorUl = document.getElementById("index-scoring");

  if (coreUl) {
    coreUl.innerHTML = DOC_INDEX.core.map(d =>
      `<li><a href="${d.url}" target="_blank" class="text-indigo-400 hover:underline">${d.name}</a></li>`
    ).join("");
  }
  if (slidUl) {
    slidUl.innerHTML = DOC_INDEX.sliders.map(d =>
      `<li class="text-slate-300">${d.name}</li>`
    ).join("");
  }
  if (scorUl) {
    scorUl.innerHTML = DOC_INDEX.scoring.map(d =>
      `<li><a href="https://github.com/nekkapfia/Political-Galaxy/blob/main/${encodeURI(d.path)}" target="_blank" class="text-indigo-400 hover:underline">${d.name}</a></li>`
    ).join("");
  }

  const tree = document.getElementById("repo-tree");
  if (tree) tree.textContent = REPO_TREE_SUMMARY.trim();
}

// ------------------------------------------------------------
// Detail section – Country + Year model
// ------------------------------------------------------------
function ensureDetailControls() {
  const container = document.getElementById("entity-detail");
  if (!container) return;

  // Only build the controls once
  if (document.getElementById("detail-country")) return;

  const countries = getAvailableCountries();

  // Rebuild the left panel and main area for the new model
  const listPanel = document.getElementById("entity-list");
  if (listPanel) {
    listPanel.innerHTML = `
      <div class="p-3 border-b border-slate-700">
        <label class="block text-xs text-slate-400 mb-1">Country</label>
        <select id="detail-country" class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm">
          ${countries.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
      <div class="p-3 border-b border-slate-700">
        <label class="block text-xs text-slate-400 mb-1">Year</label>
        <input type="number" id="detail-year" value="2024" min="1900" max="2030"
               class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm" />
      </div>
      <div class="p-3">
        <button id="detail-lookup" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium">
          Show scores for this year
        </button>
      </div>
      <div class="p-3 text-xs text-slate-500">
        Each slider is looked up independently. Eras can change on different dates.
      </div>
    `;

    document.getElementById("detail-lookup").addEventListener("click", runDetailLookup);
    document.getElementById("detail-year").addEventListener("keydown", (e) => {
      if (e.key === "Enter") runDetailLookup();
    });
  }

  // Initial load
  runDetailLookup();
}

function runDetailLookup() {
  const countryEl = document.getElementById("detail-country");
  const yearEl = document.getElementById("detail-year");
  const detail = document.getElementById("entity-detail");
  if (!countryEl || !yearEl || !detail) return;

  const country = countryEl.value;
  const year = parseInt(yearEl.value, 10);

  if (!country || isNaN(year)) {
    detail.innerHTML = `<p class="text-slate-500">Choose a country and a valid year.</p>`;
    return;
  }

  const vector = getVector(country, year);
  const range = getYearRange(country);

  // Build the score table with source links
  let rows = "";
  for (const slider of SLIDER_META) {
    const d = vector.details[slider.id];
    if (d) {
      const sourceLink = d.url
        ? `<a href="${d.url}" target="_blank" class="text-indigo-400 hover:underline text-xs">Source ↗</a>`
        : `<span class="text-slate-600 text-xs">No link</span>`;

      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2.5 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2.5 pr-3 font-mono text-lg text-indigo-300">${d.score}</td>
          <td class="py-2.5 pr-3 text-sm text-slate-400">${d.start} – ${d.end}</td>
          <td class="py-2.5">
            <div class="text-xs text-slate-300 mb-0.5">${d.section || ""}</div>
            ${sourceLink}
          </td>
        </tr>
        <tr class="border-b border-slate-800/50">
          <td colspan="4" class="pb-3 text-xs text-slate-500">${d.notes || ""}</td>
        </tr>`;
    } else {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2.5 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2.5 pr-3 font-mono text-slate-600">—</td>
          <td class="py-2.5 pr-3 text-sm text-slate-600">no data</td>
          <td class="py-2.5 text-xs text-slate-600">Not yet scored for this country</td>
        </tr>`;
    }
  }

  detail.innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold">${country}</h2>
        <div class="text-slate-400 mt-1">Snapshot for year <span class="text-indigo-300 font-mono">${year}</span></div>
        <div class="text-xs text-slate-500 mt-1">Data range available: ${range.min} – ${range.max}</div>
      </div>
      <div class="text-right text-sm text-slate-400">
        Each slider uses its own era boundaries.<br>
        Click “Source ↗” to open the exact document section.
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-700">
            <th class="py-2 pr-3">Slider</th>
            <th class="py-2 pr-3">Score</th>
            <th class="py-2 pr-3">Era for this year</th>
            <th class="py-2">Source document & section</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <p class="mt-6 text-xs text-slate-500">
      Scores are looked up independently per slider. If two sliders change eras in different years,
      you will see the correct score for each one on the date you chose.
      Source links open the GitHub file and attempt to jump to the relevant heading.
    </p>
  `;
}

// Make available for other modules
window.runDetailLookup = runDetailLookup;
window.getVector = getVector;
window.getScore = getScore;
window.getAvailableCountries = getAvailableCountries;
