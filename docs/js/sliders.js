// Sliders Explorer – individual Cores, outer Culturals, 8-slot centre
let currentMode = "modern";
let currentVector = {};
let selectedCountry = "United Kingdom";
let selectedParty = null;
let selectedYear = 2024;

// 8-slot state: 2 parties + 2 eras, each with countryLock + entityLock
const slots = {
  p1: { country: "United Kingdom", countryLock: true, entity: null, entityLock: false },
  p2: { country: "United Kingdom", countryLock: true, entity: null, entityLock: false },
  e1: { country: "United Kingdom", countryLock: true, entity: null, entityLock: false },
  e2: { country: "United Kingdom", countryLock: true, entity: null, entityLock: false }
};

// Individual Core positions (inner orbit)
const CORE_POS = [
  { id: "1A", top: "18%", left: "18%" },
  { id: "1B", top: "18%", right: "18%" },
  { id: "2A", bottom: "18%", left: "18%" },
  { id: "2B", bottom: "18%", right: "18%" }
];
// Cultural pairs further out
const CULT_POS = [
  { ids: ["C1A","C1B"], title: "Cultural 1 – Foundation", top: "1.5%", left: "50%", transform: "translateX(-50%)" },
  { ids: ["C2A","C2B"], title: "Cultural 2 – Identity", top: "36%", left: "0.5%" },
  { ids: ["C3A","C3B"], title: "Cultural 3 – Exclusivity", top: "36%", right: "0.5%" },
  { ids: ["C4A","C4B"], title: "Cultural 4 – Structure", bottom: "4%", left: "6%" },
  { ids: ["C5A","C5B"], title: "Cultural 5 – Change", bottom: "4%", right: "6%" }
];

function initSliders() {
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => {
        b.classList.remove("bg-indigo-600","text-white"); b.classList.add("text-slate-400");
      });
      btn.classList.add("bg-indigo-600","text-white"); btn.classList.remove("text-slate-400");
      currentMode = btn.dataset.mode;
      renderCenter();
      refresh();
    });
  });
  buildOrbit();
  SLIDER_META.forEach(s => currentVector[s.id] = 50);
  renderCenter();
  if (typeof loadIndexData === "function") loadIndexData().then(refresh);
  else refresh();
}

function buildOrbit() {
  const c = document.getElementById("slider-container");
  if (!c) return;
  let h = "";
  // Individual Core cards
  CORE_POS.forEach(p => {
    const m = SLIDER_META.find(s => s.id === p.id) || { short: p.id, desc: "" };
    const st = Object.entries(p).filter(([k]) => k !== "id").map(([k,v]) => k+":"+v).join(";");
    const fullName = {"1A":"Personal Autonomy","1B":"Economic Autonomy","2A":"National Sovereignty","2B":"International Sovereignty"}[p.id] || m.short;
    h += `<div class="slider-group core absolute z-10" style="${st};width:240px;">
      <div class="core-label">${fullName}</div>
      <div class="core-slider-row" title="${m.desc}">
        <input type="range" id="slider-${p.id}" min="0" max="100" value="50" data-id="${p.id}" />
        <span class="slider-value" id="val-${p.id}">50</span>
      </div></div>`;
  });
  // Cultural pairs further out
  CULT_POS.forEach(g => {
    const st = Object.entries(g).filter(([k]) => !["ids","title"].includes(k)).map(([k,v]) => k+":"+v).join(";");
    h += `<div class="slider-group cultural absolute z-10" style="${st};width:175px;"><h3>${g.title}</h3>`;
    const shortNames = {
      "C1A":"Foundation", "C1B":"Dogmatism",
      "C2A":"Individuality", "C2B":"Pride",
      "C3A":"Ethnic", "C3B":"Cultural",
      "C4A":"Determinism", "C4B":"Equity",
      "C5A":"Tradition", "C5B":"Radicalism"
    };
    g.ids.forEach(id => {
      const m = SLIDER_META.find(s => s.id === id) || { short: id, desc: "" };
      const label = shortNames[id] || m.short;
      h += `<div class="slider-row" title="${m.desc}">
        <label for="slider-${id}">${label}</label>
        <input type="range" id="slider-${id}" min="0" max="100" value="50" data-id="${id}" />
        <span class="slider-value" id="val-${id}">50</span>
      </div>`;
    });
    h += `</div>`;
  });
  c.innerHTML = h;
  c.querySelectorAll("input[type=range]").forEach(inp => {
    inp.addEventListener("input", () => {
      const id = inp.dataset.id;
      const el = document.getElementById("val-"+id);
      if (el) el.textContent = inp.value;
      currentVector[id] = parseInt(inp.value, 10);
      refresh();
    });
  });
}

function renderCenter() {
  const p = document.getElementById("center-panel");
  if (!p) return;
  if (currentMode === "modern") {
    p.innerHTML = `<div class="text-xs text-indigo-300 font-medium mb-2">Modern – Party</div>
      <label>Country</label><select id="m-country"></select>
      <label>Party</label><select id="m-party"></select>
      <div class="text-xs text-slate-500 mt-1">Select a party to load its scores</div>`;
    fillCountry("m-country", selectedCountry);
    fillParty("m-party", selectedCountry, selectedParty);
    document.getElementById("m-country").onchange = e => {
      selectedCountry = e.target.value; fillParty("m-party", selectedCountry, null); selectedParty = null; refresh();
    };
    document.getElementById("m-party").onchange = e => { selectedParty = e.target.value || null; refresh(); };
  } else if (currentMode === "historical") {
    p.innerHTML = `<div class="text-xs text-indigo-300 font-medium mb-2">Historical – Year</div>
      <label>Country</label><select id="h-country"></select>
      <label>Year</label><input type="number" id="h-year" value="${selectedYear}" min="1945" max="2030" />
      <div class="text-xs text-slate-500 mt-1">Scores update live</div>`;
    fillCountry("h-country", selectedCountry);
    document.getElementById("h-country").onchange = e => { selectedCountry = e.target.value; refresh(); };
    document.getElementById("h-year").oninput = e => { selectedYear = parseInt(e.target.value,10)||2024; refresh(); };
  } else {
    // 8-slot All mode
    p.innerHTML = `<div class="text-xs text-indigo-300 font-medium mb-1.5">All – Nearest Matches</div>
      <div class="grid grid-cols-2 gap-1.5 text-xs">
        ${slotHTML("p1","1st Party")}
        ${slotHTML("p2","2nd Party")}
        ${slotHTML("e1","1st Era")}
        ${slotHTML("e2","2nd Era")}
      </div>
      <div class="text-[10px] text-slate-500 mt-1.5">🔒 country = scope · 🔒 entity = pin match</div>`;
    ["p1","p2","e1","e2"].forEach(k => {
      const s = slots[k];
      const cSel = document.getElementById(k+"-country");
      if (cSel) {
        fillCountry(k+"-country", s.country);
        cSel.onchange = e => { s.country = e.target.value; refresh(); };
      }
      document.getElementById(k+"-clock")?.addEventListener("click", () => {
        s.countryLock = !s.countryLock;
        document.getElementById(k+"-clock").textContent = s.countryLock ? "🔒" : "🔓";
        refresh();
      });
      document.getElementById(k+"-elock")?.addEventListener("click", () => {
        s.entityLock = !s.entityLock;
        document.getElementById(k+"-elock").textContent = s.entityLock ? "🔒" : "🔓";
        refresh();
      });
    });
  }
}

function slotHTML(key, label) {
  const s = slots[key];
  const isParty = key.startsWith("p");
  return `<div class="match-slot ${s.countryLock ? "locked" : ""}">
    <div class="slot-title">${label}</div>
    <div class="lock-row">
      <button id="${key}-clock" class="lock-btn" title="Lock country scope">${s.countryLock ? "🔒" : "🔓"}</button>
      <select id="${key}-country"></select>
    </div>
    <div class="lock-row">
      <button id="${key}-elock" class="lock-btn" title="Pin this match">${s.entityLock ? "🔒" : "🔓"}</button>
      <div class="slot-value" id="${key}-val" style="flex:1;">—</div>
    </div>
  </div>`;
}

function fillCountry(id, cur) {
  const el = document.getElementById(id);
  if (!el) return;
  const list = (typeof getAvailableCountries==="function") ? getAvailableCountries() : ["United Kingdom"];
  el.innerHTML = list.map(c => `<option value="${c}" ${c===cur?"selected":""}>${c}</option>`).join("");
}
function fillParty(id, country, cur) {
  const el = document.getElementById(id);
  if (!el) return;
  const parties = (PARTY_DATA[country] && Object.keys(PARTY_DATA[country])) || [];
  el.innerHTML = `<option value="">— select —</option>` + parties.map(p => `<option value="${p}" ${p===cur?"selected":""}>${p}</option>`).join("");
}

function dist(a,b) {
  let s=0,n=0;
  for (const id of Object.keys(a)) {
    if (b[id]!=null && !isNaN(b[id])) { const d=a[id]-b[id]; s+=d*d; n++; }
  }
  return n===0 ? Infinity : Math.sqrt(s/n) + (14-n)*0.8;
}

function nearestParties(target, countryFilter, limit) {
  const list = (window.ENTITIES||ENTITIES||[]).filter(e => e.type==="party");
  const f = countryFilter ? list.filter(e => e.country===countryFilter) : list;
  return f.map(e => ({entity:e, dist:dist(target,e.scores)})).filter(r=>r.dist<Infinity)
    .sort((a,b)=>a.dist-b.dist).slice(0,limit);
}

function nearestEras(target, countryFilter, limit) {
  const out = [];
  const countries = countryFilter ? [countryFilter] : Object.keys(SCORE_DATA||{});
  for (const country of countries) {
    const range = (typeof getYearRange==="function") ? getYearRange(country) : {min:1945,max:2026};
    const years = new Set([range.min,range.max,1950,1960,1970,1980,1990,2000,2010,2016,2020,2022,2024,2026]);
    for (let y=range.min; y<=range.max; y+=5) years.add(y);
    for (const year of years) {
      const vec = (typeof getVector==="function") ? getVector(country, year) : null;
      if (!vec?.scores) continue;
      const d = dist(target, vec.scores);
      if (d < Infinity) out.push({country, year, dist:d});
    }
  }
  return out.sort((a,b)=>a.dist-b.dist).slice(0,limit);
}

function applyScoresToSliders(scores) {
  if (!scores) return;
  SLIDER_META.forEach(s => {
    const v = scores[s.id];
    const inp = document.getElementById("slider-"+s.id);
    const val = document.getElementById("val-"+s.id);
    if (inp && v != null && !isNaN(v)) {
      inp.value = v;
      if (val) val.textContent = v;
      currentVector[s.id] = Number(v);
    }
  });
}

function refresh() {
  if (currentMode === "modern") {
    // Selecting a party loads its scores onto the sliders
    if (selectedParty && typeof getPartyVector === "function") {
      const scores = getPartyVector(selectedCountry, selectedParty);
      if (scores) applyScoresToSliders(scores);
    } else if (selectedParty && PARTY_DATA[selectedCountry] && PARTY_DATA[selectedCountry][selectedParty]) {
      applyScoresToSliders(PARTY_DATA[selectedCountry][selectedParty]);
    }
    return;
  }
  if (currentMode === "historical") {
    const vec = (typeof getVector==="function") ? getVector(selectedCountry, selectedYear) : {scores:{}};
    applyScoresToSliders(vec.scores || {});
    return;
  }
  if (currentMode !== "all") return;

  // Parties
  [["p1",0],["p2",1]].forEach(([key, idx]) => {
    const s = slots[key];
    if (s.entityLock && s.entity) {
      document.getElementById(key+"-val").textContent = s.entity;
      return;
    }
    const filter = s.countryLock ? s.country : null;
    const list = nearestParties(currentVector, filter, 3);
    const hit = list[idx];
    if (hit) {
      s.entity = `${hit.entity.name} (${hit.dist.toFixed(1)})`;
      document.getElementById(key+"-val").textContent = s.entity;
    } else {
      document.getElementById(key+"-val").textContent = "—";
    }
  });

  // Eras
  [["e1",0],["e2",1]].forEach(([key, idx]) => {
    const s = slots[key];
    if (s.entityLock && s.entity) {
      document.getElementById(key+"-val").textContent = s.entity;
      return;
    }
    const filter = s.countryLock ? s.country : null;
    const list = nearestEras(currentVector, filter, 3);
    const hit = list[idx];
    if (hit) {
      s.entity = `${hit.country} ${hit.year} (${hit.dist.toFixed(1)})`;
      document.getElementById(key+"-val").textContent = s.entity;
    } else {
      document.getElementById(key+"-val").textContent = "—";
    }
  });
}
