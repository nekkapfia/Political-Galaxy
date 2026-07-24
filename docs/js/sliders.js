// Sliders Explorer – Modern / Historical / Compare
// Compare: two independent sides (each Era or Party), dual tracks on every axis

let currentMode = "modern";
let currentVector = {};
let selectedCountry = "United Kingdom";
let selectedParty = null;
let selectedYear = 2024;

// Compare sides (A = left, B = right) – each can be era or party
const sideA = { country: "United Kingdom", mode: "era", year: 2024, party: null };
const sideB = { country: "United Kingdom", mode: "party", year: 2024, party: null };
let scoresA = {};
let scoresB = {};

const CORE_POS = [
  { id: "1A", top: "18%", left: "18%" },
  { id: "1B", top: "18%", right: "18%" },
  { id: "2A", bottom: "18%", left: "18%" },
  { id: "2B", bottom: "18%", right: "18%" }
];
const CULT_POS = [
  { ids: ["C1A","C1B"], title: "Cultural 1 – Foundation", top: "1.5%", left: "50%", transform: "translateX(-50%)" },
  { ids: ["C2A","C2B"], title: "Cultural 2 – Identity", top: "36%", left: "0.5%" },
  { ids: ["C3A","C3B"], title: "Cultural 3 – Exclusivity", top: "36%", right: "0.5%" },
  { ids: ["C4A","C4B"], title: "Cultural 4 – Structure", bottom: "4%", left: "6%" },
  { ids: ["C5A","C5B"], title: "Cultural 5 – Change", bottom: "4%", right: "6%" }
];
const SHORT = {
  "C1A":"Foundation", "C1B":"Dogmatism",
  "C2A":"Individuality", "C2B":"Pride",
  "C3A":"Ethnic", "C3B":"Cultural",
  "C4A":"Determinism", "C4B":"Equity",
  "C5A":"Tradition", "C5B":"Radicalism"
};
const ACCENT_THEMES = [
  { id: "gold-sky", label: "Gold / Sky", a: "#c9a227", aBright: "#fbbf24", b: "#38bdf8", bBright: "#7dd3fc" },
  { id: "rose-teal", label: "Rose / Teal", a: "#e11d48", aBright: "#fb7185", b: "#14b8a6", bBright: "#5eead4" },
  { id: "violet-lime", label: "Violet / Lime", a: "#8b5cf6", aBright: "#c4b5fd", b: "#84cc16", bBright: "#bef264" },
  { id: "orange-indigo", label: "Orange / Indigo", a: "#f97316", aBright: "#fdba74", b: "#6366f1", bBright: "#a5b4fc" }
];
let currentAccent = ACCENT_THEMES[0];

function applyAccentTheme(theme) {
  currentAccent = theme;
  const r = document.documentElement;
  r.style.setProperty("--accent-a", theme.a);
  r.style.setProperty("--accent-a-bright", theme.aBright);
  r.style.setProperty("--accent-b", theme.b);
  r.style.setProperty("--accent-b-bright", theme.bBright);
  try { localStorage.setItem("pg-accent", theme.id); } catch(e) {}
}

function initAccentControl() {
  const btn = document.getElementById("accent-btn");
  const menu = document.getElementById("accent-menu");
  const opts = document.getElementById("accent-options");
  if (!btn || !menu || !opts) return;

  // restore
  let saved = null;
  try { saved = localStorage.getItem("pg-accent"); } catch(e) {}
  const theme = ACCENT_THEMES.find(t => t.id === saved) || ACCENT_THEMES[0];
  applyAccentTheme(theme);

  opts.innerHTML = ACCENT_THEMES.map(th => `
    <button data-accent="${th.id}" class="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left">
      <span class="w-3 h-3 rounded-full" style="background:${th.a}"></span>
      <span class="w-3 h-3 rounded-full" style="background:${th.b}"></span>
      <span class="text-slate-300">${th.label}</span>
    </button>`).join("");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });
  document.addEventListener("click", () => menu.classList.add("hidden"));
  menu.addEventListener("click", e => e.stopPropagation());
  opts.querySelectorAll("[data-accent]").forEach(b => {
    b.addEventListener("click", () => {
      const th = ACCENT_THEMES.find(x => x.id === b.dataset.accent);
      if (th) applyAccentTheme(th);
      menu.classList.add("hidden");
    });
  });
}

const CORE_NAMES = {
  "1A":"Personal Autonomy", "1B":"Economic Autonomy",
  "2A":"National Sovereignty", "2B":"International Sovereignty"
};

function initSliders() {
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => {
        b.classList.remove("bg-indigo-600","text-white");
        b.classList.add("text-slate-400");
      });
      btn.classList.add("bg-indigo-600","text-white");
      btn.classList.remove("text-slate-400");
      currentMode = btn.dataset.mode;
      renderCenter();
      buildOrbit();
      refresh();
    });
  });
  initAccentControl();
  buildOrbit();
  SLIDER_META.forEach(s => currentVector[s.id] = 50);
  renderCenter();
  if (typeof loadIndexData === "function") loadIndexData().then(refresh);
  else refresh();
}

function buildOrbit() {
  const c = document.getElementById("slider-container");
  if (!c) return;
  const compare = currentMode === "compare";
  let h = "";

  // ---- CORES ----
  // Compare: one box per axis, two tracks inside (A amber, B sky)
  // Other modes: single track
  CORE_POS.forEach(p => {
    const st = Object.entries(p).filter(([k]) => k !== "id").map(([k,v]) => k+":"+v).join(";");
    const name = CORE_NAMES[p.id] || p.id;
    if (compare) {
      h += `<div class="slider-group core absolute z-10" style="${st};width:240px;">
        <div class="core-label">${name}</div>
        <div class="core-slider-row">
          <input type="range" class="track-a" id="slider-${p.id}-a" min="0" max="100" value="50" data-id="${p.id}" data-side="a" disabled />
          <span class="slider-value side-a" id="val-${p.id}-a">50</span>
        </div>
        <div class="core-slider-row">
          <input type="range" class="track-b" id="slider-${p.id}-b" min="0" max="100" value="50" data-id="${p.id}" data-side="b" disabled />
          <span class="slider-value side-b" id="val-${p.id}-b">50</span>
        </div>
      </div>`;
    } else {
      h += `<div class="slider-group core absolute z-10" style="${st};width:240px;">
        <div class="core-label">${name}</div>
        <div class="core-slider-row">
          <input type="range" id="slider-${p.id}" min="0" max="100" value="50" data-id="${p.id}" />
          <span class="slider-value" id="val-${p.id}">50</span>
        </div>
      </div>`;
    }
  });

  // ---- CULTURALS ----
  // Compare layout:
  //   C1 (top): twin side-by-side
  //   C2 (left): twin stacked vertically
  //   C3 (right): twin stacked vertically
  //   C4 / C5 (bottom): twin side-by-side
  CULT_POS.forEach(g => {
    const key = g.ids[0]; // C1A, C2A, ...
    if (!compare) {
      const st = Object.entries(g).filter(([k]) => !["ids","title"].includes(k)).map(([k,v]) => k+":"+v).join(";");
      h += `<div class="slider-group cultural absolute z-10" style="${st};width:175px;"><h3>${g.title}</h3>`;
      g.ids.forEach(id => {
        const label = SHORT[id] || id;
        h += `<div class="slider-row">
          <label for="slider-${id}">${label}</label>
          <input type="range" id="slider-${id}" min="0" max="100" value="50" data-id="${id}" />
          <span class="slider-value" id="val-${id}">50</span>
        </div>`;
      });
      h += `</div>`;
      return;
    }

    const body = (side) => g.ids.map(id => {
      const label = SHORT[id] || id;
      return `<div class="slider-row">
        <label>${label}</label>
        <input type="range" class="track-${side}" id="slider-${id}-${side}" min="0" max="100" value="50" data-id="${id}" data-side="${side}" disabled />
        <span class="slider-value side-${side}" id="val-${id}-${side}">50</span>
      </div>`;
    }).join("");

    if (key === "C1A") {
      // top – wider twins side by side
      h += `<div class="slider-group cultural side-a absolute z-10" style="top:1%;left:calc(50% - 200px);width:186px;">
        <h3>${g.title}</h3>${body("a")}</div>`;
      h += `<div class="slider-group cultural side-b absolute z-10" style="top:1%;left:calc(50% + 8px);width:186px;">
        <h3>${g.title}</h3>${body("b")}</div>`;
    } else if (key === "C2A") {
      // left – stacked tightly, shifted toward centre
      h += `<div class="slider-group cultural side-a absolute z-10" style="top:26%;left:8%;width:168px;">
        <h3>${g.title}</h3>${body("a")}</div>`;
      h += `<div class="slider-group cultural side-b absolute z-10" style="top:44%;left:8%;width:168px;">
        <h3>${g.title}</h3>${body("b")}</div>`;
    } else if (key === "C3A") {
      // right – stacked tightly, shifted toward centre
      h += `<div class="slider-group cultural side-a absolute z-10" style="top:26%;right:8%;width:168px;">
        <h3>${g.title}</h3>${body("a")}</div>`;
      h += `<div class="slider-group cultural side-b absolute z-10" style="top:44%;right:8%;width:168px;">
        <h3>${g.title}</h3>${body("b")}</div>`;
    } else if (key === "C4A") {
      // bottom left – wider twins
      h += `<div class="slider-group cultural side-a absolute z-10" style="bottom:2%;left:3%;width:186px;">
        <h3>${g.title}</h3>${body("a")}</div>`;
      h += `<div class="slider-group cultural side-b absolute z-10" style="bottom:2%;left:calc(3% + 196px);width:186px;">
        <h3>${g.title}</h3>${body("b")}</div>`;
    } else if (key === "C5A") {
      // bottom right – wider twins
      h += `<div class="slider-group cultural side-a absolute z-10" style="bottom:2%;right:calc(3% + 196px);width:186px;">
        <h3>${g.title}</h3>${body("a")}</div>`;
      h += `<div class="slider-group cultural side-b absolute z-10" style="bottom:2%;right:3%;width:186px;">
        <h3>${g.title}</h3>${body("b")}</div>`;
    }
  });

  c.innerHTML = h;

  if (currentMode === "modern") {
    c.querySelectorAll("input[type=range]").forEach(inp => {
      inp.addEventListener("input", () => {
        const id = inp.dataset.id;
        const valEl = document.getElementById("val-"+id);
        if (valEl) valEl.textContent = inp.value;
        currentVector[id] = parseInt(inp.value, 10);
      });
    });
  }
}

function sidePanelHTML(sideKey, side) {
  const isEra = side.mode === "era";
  return `
    <label>Country</label>
    <select id="${sideKey}-country"></select>
    <label>Mode</label>
    <select id="${sideKey}-mode">
      <option value="era" ${isEra ? "selected" : ""}>Era (Timeline)</option>
      <option value="party" ${!isEra ? "selected" : ""}>Political Party</option>
    </select>
    <div id="${sideKey}-select-wrap"></div>
  `;
}

function fillSideSelect(sideKey, side) {
  const wrap = document.getElementById(sideKey + "-select-wrap");
  if (!wrap) return;
  if (side.mode === "era") {
    wrap.innerHTML = `<label>Year</label>
      <input type="number" id="${sideKey}-year" value="${side.year}" min="1945" max="2030" />`;
    document.getElementById(sideKey + "-year").oninput = e => {
      side.year = parseInt(e.target.value, 10) || 2024;
      refresh();
    };
  } else {
    wrap.innerHTML = `<label>Political Party</label>
      <select id="${sideKey}-party"></select>`;
    fillParty(sideKey + "-party", side.country, side.party);
    document.getElementById(sideKey + "-party").onchange = e => {
      side.party = e.target.value || null;
      refresh();
    };
  }
}

function wireSide(sideKey, side) {
  fillCountry(sideKey + "-country", side.country);
  document.getElementById(sideKey + "-country").onchange = e => {
    side.country = e.target.value;
    side.party = null;
    fillSideSelect(sideKey, side);
    refresh();
  };
  document.getElementById(sideKey + "-mode").onchange = e => {
    side.mode = e.target.value;
    fillSideSelect(sideKey, side);
    refresh();
  };
  fillSideSelect(sideKey, side);
}

function renderCenter() {
  const p = document.getElementById("center-panel");
  const pB = document.getElementById("center-panel-b");
  if (!p) return;

  if (currentMode === "compare") {
    p.style.width = "200px";
    if (pB) {
      pB.style.display = "block";
      pB.style.width = "200px";
      pB.className = "center-side side-b";
    }
    p.className = "center-side side-a";
    p.innerHTML = sidePanelHTML("a", sideA);
    if (pB) pB.innerHTML = sidePanelHTML("b", sideB);
    wireSide("a", sideA);
    if (pB) wireSide("b", sideB);
    return;
  }

  // Single panel modes
  if (pB) pB.style.display = "none";
  p.style.width = "220px";
  p.className = "";
  p.removeAttribute("class");

  if (currentMode === "modern") {
    p.innerHTML = `<div class="text-xs text-indigo-300 font-medium mb-2">Modern – Party</div>
      <label>Country</label><select id="m-country"></select>
      <label>Party</label><select id="m-party"></select>
      <div class="text-xs text-slate-500 mt-1">Select a party to load its scores</div>`;
    fillCountry("m-country", selectedCountry);
    fillParty("m-party", selectedCountry, selectedParty);
    document.getElementById("m-country").onchange = e => {
      selectedCountry = e.target.value;
      fillParty("m-party", selectedCountry, null);
      selectedParty = null;
      refresh();
    };
    document.getElementById("m-party").onchange = e => {
      selectedParty = e.target.value || null;
      refresh();
    };
  } else {
    p.innerHTML = `<div class="text-xs text-indigo-300 font-medium mb-2">Historical – Year</div>
      <label>Country</label><select id="h-country"></select>
      <label>Year</label><input type="number" id="h-year" value="${selectedYear}" min="1945" max="2030" />
      <div class="text-xs text-slate-500 mt-1">Scores update live</div>`;
    fillCountry("h-country", selectedCountry);
    document.getElementById("h-country").onchange = e => {
      selectedCountry = e.target.value;
      refresh();
    };
    document.getElementById("h-year").oninput = e => {
      selectedYear = parseInt(e.target.value, 10) || 2024;
      refresh();
    };
  }
}

function fillCountry(id, cur) {
  const el = document.getElementById(id);
  if (!el) return;
  const list = (typeof getAvailableCountries === "function") ? getAvailableCountries() : ["United Kingdom"];
  el.innerHTML = list.map(c => `<option value="${c}" ${c===cur?"selected":""}>${c}</option>`).join("");
}
function fillParty(id, country, cur) {
  const el = document.getElementById(id);
  if (!el) return;
  const parties = (PARTY_DATA[country] && Object.keys(PARTY_DATA[country])) || [];
  el.innerHTML = `<option value="">— select party —</option>` +
    parties.map(p => `<option value="${p}" ${p===cur?"selected":""}>${p}</option>`).join("");
}

function resolveSideScores(side) {
  if (side.mode === "party") {
    if (!side.party) return {};
    if (typeof getPartyVector === "function") {
      return getPartyVector(side.country, side.party) || {};
    }
    return (PARTY_DATA[side.country] && PARTY_DATA[side.country][side.party]) || {};
  }
  // era
  const vec = (typeof getVector === "function") ? getVector(side.country, side.year) : { scores: {} };
  return vec.scores || {};
}

function applyScoresToSliders(scores) {
  if (!scores) return;
  SLIDER_META.forEach(s => {
    const v = scores[s.id];
    const inp = document.getElementById("slider-" + s.id);
    const val = document.getElementById("val-" + s.id);
    if (inp && v != null && !isNaN(v)) {
      inp.value = v;
      if (val) val.textContent = v;
      currentVector[s.id] = Number(v);
    }
  });
}

function applyDualScores(scoresLeft, scoresRight) {
  SLIDER_META.forEach(s => {
    const va = scoresLeft[s.id];
    const vb = scoresRight[s.id];
    const inpA = document.getElementById("slider-" + s.id + "-a");
    const inpB = document.getElementById("slider-" + s.id + "-b");
    const valA = document.getElementById("val-" + s.id + "-a");
    const valB = document.getElementById("val-" + s.id + "-b");
    if (inpA) {
      inpA.value = (va != null && !isNaN(va)) ? va : 50;
      if (valA) valA.textContent = (va != null && !isNaN(va)) ? va : "—";
    }
    if (inpB) {
      inpB.value = (vb != null && !isNaN(vb)) ? vb : 50;
      if (valB) valB.textContent = (vb != null && !isNaN(vb)) ? vb : "—";
    }
  });
}

function refresh() {
  if (currentMode === "modern") {
    if (selectedParty) {
      const scores = (typeof getPartyVector === "function")
        ? getPartyVector(selectedCountry, selectedParty)
        : (PARTY_DATA[selectedCountry] && PARTY_DATA[selectedCountry][selectedParty]);
      if (scores) applyScoresToSliders(scores);
    }
    return;
  }
  if (currentMode === "historical") {
    const vec = (typeof getVector === "function") ? getVector(selectedCountry, selectedYear) : { scores: {} };
    applyScoresToSliders(vec.scores || {});
    return;
  }
  if (currentMode === "compare") {
    scoresA = resolveSideScores(sideA);
    scoresB = resolveSideScores(sideB);
    applyDualScores(scoresA, scoresB);
  }
}
