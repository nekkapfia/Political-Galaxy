// Detail page – fully independent
function initDetail() {
  const countrySel = document.getElementById("detail-country");
  const yearInput = document.getElementById("detail-year");
  const btn = document.getElementById("detail-lookup");
  if (!countrySel || !yearInput || !btn) return;

  const countries = (typeof getAvailableCountries === "function") ? getAvailableCountries() : ["United Kingdom"];
  countrySel.innerHTML = countries.map(c => `<option value="${c}">${c}</option>`).join("");

  btn.addEventListener("click", runLookup);
  yearInput.addEventListener("keydown", e => { if (e.key === "Enter") runLookup(); });
  runLookup();
}

function runLookup() {
  const country = document.getElementById("detail-country")?.value;
  const year = parseInt(document.getElementById("detail-year")?.value, 10);
  const detail = document.getElementById("entity-detail");
  if (!detail || !country || isNaN(year)) return;

  const vector = (typeof getVector === "function") ? getVector(country, year) : { scores: {}, details: {} };
  const range = (typeof getYearRange === "function") ? getYearRange(country) : { min: 1945, max: 2026 };

  let rows = "";
  for (const slider of (typeof SLIDER_META !== "undefined" ? SLIDER_META : [])) {
    const d = vector.details?.[slider.id];
    if (d) {
      const link = d.url
        ? `<a href="${d.url}" target="_blank" class="text-indigo-400 hover:underline text-xs">Source ↗</a>`
        : `<span class="text-slate-600 text-xs">No link</span>`;
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3"><div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div></td>
          <td class="py-2 pr-3 font-mono text-lg text-indigo-300">${d.score}</td>
          <td class="py-2 pr-3 text-sm text-slate-400">${d.start} – ${d.end}</td>
          <td class="py-2"><div class="text-xs text-slate-300 mb-0.5">${d.section || ""}</div>${link}</td>
        </tr>`;
    } else {
      rows += `
        <tr class="border-b border-slate-800">
          <td class="py-2 pr-3"><div class="font-medium text-slate-200">${slider.name}</div>
            <div class="text-xs text-slate-500">${slider.group}</div></td>
          <td class="py-2 pr-3 font-mono text-slate-600">—</td>
          <td class="py-2 pr-3 text-sm text-slate-600">no data</td>
          <td class="py-2 text-xs text-slate-600">Not scored</td>
        </tr>`;
    }
  }

  detail.innerHTML = `
    <div class="mb-5">
      <h2 class="text-xl font-bold">${country}</h2>
      <div class="text-slate-400 text-sm">Year <span class="text-indigo-300 font-mono">${year}</span>
        · Data range ${range.min} – ${range.max}</div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-700">
            <th class="py-2 pr-3">Slider</th>
            <th class="py-2 pr-3">Score</th>
            <th class="py-2 pr-3">Era</th>
            <th class="py-2">Source</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
