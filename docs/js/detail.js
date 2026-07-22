// Detail page – Country + Mode (Party/Era) + Selection
function initDetail() {
  const countrySel = document.getElementById("detail-country");
  const modeSel = document.getElementById("detail-mode");
  const btn = document.getElementById("detail-lookup");
  if (!countrySel || !modeSel || !btn) return;

  const countries = (typeof getAvailableCountries === "function")
    ? getAvailableCountries() : ["United Kingdom"];
  countrySel.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join("");

  countrySel.addEventListener("change", () => {
    updateSelectControl();
    runLookup();
  });
  modeSel.addEventListener("change", () => {
    updateSelectControl();
    runLookup();
  });
  btn.addEventListener("click", runLookup);

  updateSelectControl();
  runLookup();
}

function updateSelectControl() {
  const mode = document.getElementById("detail-mode")?.value || "era";
  const country = document.getElementById("detail-country")?.value || "United Kingdom";
  const label = document.getElementById("detail-select-label");
  const wrap = document.getElementById("detail-select-control");
  if (!label || !wrap) return;

  if (mode === "party") {
    label.textContent = "Political Party";
    const parties = (PARTY_DATA[country] && Object.keys(PARTY_DATA[country])) || [];
    wrap.innerHTML = `
      <select id="detail-party" class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm">
        <option value="">— select party —</option>
        ${parties.map(p => `<option value="${p}">${p}</option>`).join("")}
      </select>`;
    document.getElementById("detail-party")?.addEventListener("change", runLookup);
  } else {
    label.textContent = "Year";
    const range = (typeof getYearRange === "function") ? getYearRange(country) : { min: 1945, max: 2026 };
    wrap.innerHTML = `
      <input type="number" id="detail-year" value="2024" min="${range.min}" max="${range.max}"
             class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm" />`;
    document.getElementById("detail-year")?.addEventListener("input", runLookup);
    document.getElementById("detail-year")?.addEventListener("keydown", e => {
      if (e.key === "Enter") runLookup();
    });
  }
}

function runLookup() {
  const country = document.getElementById("detail-country")?.value;
  const mode = document.getElementById("detail-mode")?.value || "era";
  const detail = document.getElementById("entity-detail");
  if (!detail || !country) return;

  let title = country;
  let subtitle = "";
  let scores = {};
  let details = {};
  let extraNote = "";

  if (mode === "party") {
    const party = document.getElementById("detail-party")?.value;
    if (!party) {
      detail.innerHTML = `<p class="text-slate-500">Select a political party.</p>`;
      return;
    }
    const raw = (PARTY_DATA[country] && PARTY_DATA[country][party]) || {};
    // Normalise keys if needed (already handled in data.js, but safe)
    scores = raw;
    title = party;
    subtitle = `Political party snapshot · ${country}`;
    extraNote = "Party scores are contemporary snapshots derived from the same empirical methodology as the national timelines.";
  } else {
    const year = parseInt(document.getElementById("detail-year")?.value, 10);
    if (isNaN(year)) {
      detail.innerHTML = `<p class="text-slate-500">Enter a valid year.</p>`;
      return;
    }
    const vector = (typeof getVector === "function") ? getVector(country, year) : { scores: {}, details: {} };
    scores = vector.scores || {};
    details = vector.details || {};
    title = country;
    const range = (typeof getYearRange === "function") ? getYearRange(country) : { min: 1945, max: 2026 };
    subtitle = `Year <span class="text-indigo-300 font-mono">${year}</span> · Data range ${range.min} – ${range.max}`;
    extraNote = "Each slider uses its own era boundaries. Source links open the justifying document section.";
  }

  let rows = "";
  for (const slider of (typeof SLIDER_META !== "undefined" ? SLIDER_META : [])) {
    const v = scores[slider.id];
    const d = details[slider.id];

    if (mode === "era" && d) {
      const link = d.url
        ? `<a href="${d.url}" target="_blank" class="text-indigo-400 hover:underline text-xs">Source ↗</a>`
        : `<span class="text-slate-600 text-xs">No link</span>`;
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2 pr-3 font-mono text-lg text-indigo-300">${d.score}</td>
          <td class="py-2 pr-3 text-sm text-slate-400">${d.start} – ${d.end}</td>
          <td class="py-2">
            <div class="text-xs text-slate-300 mb-0.5">${d.section || ""}</div>
            ${link}
          </td>
        </tr>`;
    } else if (v != null && !isNaN(v)) {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2 pr-3 font-mono text-lg text-indigo-300">${v}</td>
          <td class="py-2 pr-3 text-sm text-slate-400">—</td>
          <td class="py-2 text-xs text-slate-400">Party snapshot</td>
        </tr>`;
    } else {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2 pr-3 font-mono text-slate-600">—</td>
          <td class="py-2 pr-3 text-sm text-slate-600">no data</td>
          <td class="py-2 text-xs text-slate-600">Not scored</td>
        </tr>`;
    }
  }

  detail.innerHTML = `
    <div class="mb-5">
      <h2 class="text-xl font-bold">${title}</h2>
      <div class="text-slate-400 text-sm">${subtitle}</div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-700">
            <th class="py-2 pr-3">Slider</th>
            <th class="py-2 pr-3">Score</th>
            <th class="py-2 pr-3">Era</th>
            <th class="py-2">Source / Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="mt-4 text-xs text-slate-500">${extraNote}</p>`;
}
