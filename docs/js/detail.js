// Detail page – Mode (Party/Era) + Country + Selection
// Loads party scores via getPartyVector (folder-id keyed PARTY_DATA)

function initDetail() {
  const countrySel = document.getElementById("detail-country");
  const modeSel = document.getElementById("detail-mode");
  const btn = document.getElementById("detail-lookup");
  if (!countrySel || !modeSel || !btn) return;

  function repopulateCountries() {
    const countries = (typeof getAvailableCountries === "function")
      ? getAvailableCountries()
      : ["United Kingdom"];
    if (!countries.length) {
      countrySel.innerHTML = `<option value="">— no countries loaded —</option>`;
      return;
    }
    const cur = countrySel.value;
    countrySel.innerHTML = countries.map(c =>
      `<option value="${c}" ${c === cur ? "selected" : ""}>${c}</option>`
    ).join("");
    if (!countrySel.value && countries.length) countrySel.value = countries[0];
  }

  repopulateCountries();

  if (typeof loadIndexData === "function") {
    loadIndexData().then(() => {
      repopulateCountries();
      updateSelectControl();
      runLookup();
    });
  }

  countrySel.addEventListener("change", () => {
    updateSelectControl();
    runLookup();
  });
  modeSel.addEventListener("change", () => {
    updateSelectControl();
    runLookup();
  });
  btn.addEventListener("click", runLookup);

  // Prefer Political Party as default (Timeline still sparse)
  if (![...modeSel.options].some(o => o.selected && o.value)) {
    modeSel.value = "party";
  }
  // If HTML still defaults to era, switch to party for better UX
  if (modeSel.value === "era") {
    // leave as-is if user already chose; only set once on first load
  }

  updateSelectControl();
  runLookup();
}

function updateSelectControl() {
  const mode = document.getElementById("detail-mode")?.value || "party";
  const country = document.getElementById("detail-country")?.value || "";
  const label = document.getElementById("detail-select-label");
  const wrap = document.getElementById("detail-select-control");
  if (!label || !wrap) return;

  if (mode === "party") {
    label.textContent = "Political Party";
    const cid = (typeof resolveCountryId === "function") ? resolveCountryId(country) : country;
    const byName = new Map();
    if (window.PARTY_NAMES && window.PARTY_NAMES[cid]) {
      for (const [pid, name] of Object.entries(window.PARTY_NAMES[cid])) {
        if (!byName.has(name)) byName.set(name, pid);
      }
    } else if (typeof getPartyScores === "function") {
      const raw = getPartyScores(country) || {};
      for (const k of Object.keys(raw)) {
        if (!byName.has(k)) byName.set(k, k);
      }
    }
    const parties = [...byName.entries()]
      .map(([name, pid]) => ({ name, pid }))
      .sort((a, b) => a.name.localeCompare(b.name));

    wrap.innerHTML = `
      <select id="detail-party" class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm">
        <option value="">— select party —</option>
        ${parties.map(p =>
          `<option value="${p.name}" data-id="${p.pid}">${p.name}</option>`
        ).join("")}
      </select>`;
    document.getElementById("detail-party")?.addEventListener("change", runLookup);
  } else {
    label.textContent = "Year";
    const range = (typeof getYearRange === "function")
      ? getYearRange(country)
      : { min: 1945, max: 2026 };
    wrap.innerHTML = `
      <input type="number" id="detail-year" value="2024"
        min="${range.min}" max="${range.max}"
        class="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm" />`;
    const yearEl = document.getElementById("detail-year");
    yearEl?.addEventListener("input", runLookup);
    yearEl?.addEventListener("keydown", e => {
      if (e.key === "Enter") runLookup();
    });
  }
}

function runLookup() {
  const country = document.getElementById("detail-country")?.value;
  const mode = document.getElementById("detail-mode")?.value || "party";
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
    // Resolve via getPartyVector (handles display name → folder id)
    const raw = (typeof getPartyVector === "function")
      ? (getPartyVector(country, party) || {})
      : {};
    scores = raw;
    title = party;
    subtitle = `Political party snapshot · ${country}`;
    extraNote = "Party scores are contemporary snapshots from the Index scores.json files.";
  } else {
    const year = parseInt(document.getElementById("detail-year")?.value, 10);
    if (isNaN(year)) {
      detail.innerHTML = `<p class="text-slate-500">Enter a valid year.</p>`;
      return;
    }
    const vector = (typeof getVector === "function")
      ? getVector(country, year)
      : { scores: {}, details: {} };
    scores = vector.scores || {};
    details = vector.details || {};
    title = country;
    const range = (typeof getYearRange === "function")
      ? getYearRange(country)
      : { min: 1945, max: 2026 };
    subtitle = `Year <span class="text-indigo-300 font-mono">${year}</span> · Data range ${range.min} – ${range.max}`;
    extraNote = "Timeline era data is only shown where eras.json exists for this country. Party mode uses full Index scores.";
  }

  const meta = (typeof SLIDER_META !== "undefined") ? SLIDER_META : [];
  let rows = "";
  let scoredCount = 0;

  for (const slider of meta) {
    const v = scores[slider.id];
    const d = details[slider.id];
    const primary = (typeof scorePrimary === "function") ? scorePrimary(v) : (typeof v === "number" ? v : null);
    const display = (typeof scoreDisplay === "function")
      ? scoreDisplay(v)
      : (primary != null ? String(primary) : "—");

    if (mode === "era" && d && d.score != null) {
      scoredCount++;
      const link = d.source
        ? `<a href="${typeof makeViewerUrl === "function" ? makeViewerUrl(d.source) : "#"}" class="text-indigo-400 hover:underline text-xs">Source →</a>`
        : `<span class="text-slate-600 text-xs">No link</span>`;
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2 pr-3 font-mono text-lg text-indigo-300">${d.score}</td>
          <td class="py-2 pr-3 text-sm text-slate-400">${d.start ?? "—"} – ${d.end === 9999 ? "present" : (d.end ?? "—")}</td>
          <td class="py-2 text-xs text-slate-400">${d.section || ""} ${link}</td>
        </tr>`;
    } else if (primary != null || (v != null && typeof v === "object")) {
      scoredCount++;
      let notes = "—";
      if (mode === "party") {
        const party = document.getElementById("detail-party")?.value;
        const docUrl = (typeof getPartyDocUrl === "function" && party)
          ? getPartyDocUrl(country, party, slider.id)
          : null;
        notes = docUrl
          ? `<a href="${docUrl}" class="text-indigo-400 hover:underline">Source →</a>`
          : `<span class="text-slate-500">Party snapshot</span>`;
      }
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3">
            <div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div>
          </td>
          <td class="py-2 pr-3 font-mono text-lg text-indigo-300">${display}</td>
          <td class="py-2 pr-3 text-sm text-slate-400">—</td>
          <td class="py-2 text-xs text-slate-400">${notes}</td>
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

  if (mode === "party" && scoredCount === 0) {
    extraNote = "No scores found for this party. Check that Index/Parties scores.json loaded (see browser console).";
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

window.initDetail = initDetail;
window.runLookup = runLookup;
