// ============================================================
// Political Galaxy – Data Layer
// Auto-discovers countries from Index folders (GitHub API) + optional manifest.json
// Loads per-slider timeline.json + party scores
// Source links go to internal viewer.html (never GitHub)
// ============================================================

const SLIDER_META = [
  { id: "1A",  group: "Core 1 – Autonomy",    name: "Personal Autonomy",          short: "Personal Aut.",   desc: "Systemic interference with individual actions, speech, body, mind." },
  { id: "1B",  group: "Core 1 – Autonomy",    name: "Economic Autonomy",          short: "Economic Aut.",   desc: "Freedom of voluntary economic actions vs state/collective coercion." },
  { id: "2A",  group: "Core 2 – Sovereignty", name: "National Sovereignty",       short: "Nat. Sovereignty",desc: "Control over territory, borders, laws, institutions vs external cession." },
  { id: "2B",  group: "Core 2 – Sovereignty", name: "International Sovereignty",  short: "Int'l Sovereignty",desc: "Non-interference in other nations vs active intervention." },
  { id: "C1A", group: "Cultural 1 – Foundation", name: "Foundation",              short: "Foundation",     desc: "Transcendent/religious vs secular sources of moral norms." },
  { id: "C1B", group: "Cultural 1 – Foundation", name: "Dogmatism",               short: "Dogmatism",      desc: "Closedness of principles to internal challenge + external frameworks." },
  { id: "C2A", group: "Cultural 2 – Identity", name: "Individuality",             short: "Individuality",  desc: "Individuals as sovereign agents vs subordinated to group identity." },
  { id: "C2B", group: "Cultural 2 – Identity", name: "Pride (National)",          short: "Nat. Pride",     desc: "Stance toward the nation: pride/glorification to shame/condemnation." },
  { id: "C3A", group: "Cultural 3 – Boundaries", name: "Ethnic Exclusivity",      short: "Ethnic Excl.",   desc: "Ancestral/blood requirements for full in-group membership." },
  { id: "C3B", group: "Cultural 3 – Boundaries", name: "Cultural Exclusivity",    short: "Cultural Excl.", desc: "Cultural adoption/transformation required for membership." },
  { id: "C4A", group: "Cultural 4 – Structure", name: "Social Determinism",       short: "Soc. Determinism",desc: "Birth circumstances constraining outcomes vs individual mobility." },
  { id: "C4B", group: "Cultural 4 – Structure", name: "Equity Lens",             short: "Equity Lens",    desc: "Disparities as systemic oppression (equity) vs individual merit." },
  { id: "C5A", group: "Cultural 5 – Change",  name: "Tradition vs Progress",     short: "Tradition",      desc: "Preservation of traditions vs modernization/replacement." },
  { id: "C5B", group: "Cultural 5 – Change",  name: "Gradualism vs Radicalism",  short: "Radicalism",     desc: "Pace of change: incremental vs rapid/disruptive." }
];

const SLIDER_IDS = SLIDER_META.map(s => s.id);

// Runtime stores
let MANIFEST = { countries: [], updated: null };
let SCORE_DATA = {};          // country → sliderId → eras[]
let PARTY_DATA = {};          // country → partyName → { sliderId: score }
let ENTITIES = [];
let DATA_READY = false;
let DATA_LOAD_PROMISE = null;

const REPO_RAW = "https://raw.githubusercontent.com/nekkapfia/Political-Galaxy/main/Index";
const REPO_RAW_ROOT = "https://raw.githubusercontent.com/nekkapfia/Political-Galaxy/main";

// Key normalisation (old Index style → internal)
const SLIDER_KEY_MAP = {
  "core1a": "1A", "core1b": "1B", "core2a": "2A", "core2b": "2B",
  "cultural1a": "C1A", "cultural1b": "C1B", "cultural2a": "C2A", "cultural2b": "C2B",
  "cultural3a": "C3A", "cultural3b": "C3B", "cultural4a": "C4A", "cultural4b": "C4B",
  "cultural5a": "C5A", "cultural5b": "C5B",
  "1A": "1A", "1B": "1B", "2A": "2A", "2B": "2B",
  "C1A": "C1A", "C1B": "C1B", "C2A": "C2A", "C2B": "C2B",
  "C3A": "C3A", "C3B": "C3B", "C4A": "C4A", "C4B": "C4B",
  "C5A": "C5A", "C5B": "C5B",
  "1a": "1A", "1b": "1B", "2a": "2A", "2b": "2B",
  "c1a": "C1A", "c1b": "C1B", "c2a": "C2A", "c2b": "C2B",
  "c3a": "C3A", "c3b": "C3B", "c4a": "C4A", "c4b": "C4B",
  "c5a": "C5A", "c5b": "C5B"
};

function normalizeSliderKey(key) {
  if (!key) return null;
  if (SLIDER_KEY_MAP[key]) return SLIDER_KEY_MAP[key];
  const k = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [from, to] of Object.entries(SLIDER_KEY_MAP)) {
    if (from.toLowerCase().replace(/[^a-z0-9]/g, "") === k) return to;
  }
  return null;
}

async function tryFetch(url, label) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${label} HTTP ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (pe) {
      console.warn(`[Political Galaxy] ${label} invalid JSON:`, pe.message, url);
      return null;
    }
  } catch (e) {
    console.warn(`[Political Galaxy] ${label} failed:`, e.message);
    return null;
  }
}

async function tryFetchText(url) {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Source links → internal viewer (never GitHub)
// ------------------------------------------------------------
/**
 * Build an internal viewer URL for any Index-relative path.
 * path examples:
 *   "Time Line/United Kingdom/2B/eras/1997-2001.md"
 *   "Political Parties/United Kingdom/Conservative Party/C4B.md"
 */
function makeViewerUrl(indexPath) {
  if (!indexPath) return null;
  // Strip any accidental leading "Index/"
  let p = indexPath.replace(/^Index\//, "");
  // If someone passed a full GitHub URL, try to extract the path after /Index/
  if (p.startsWith("http")) {
    const m = p.match(/\/Index\/(.+?)(?:#|$)/);
    if (m) p = decodeURIComponent(m[1]);
    else return null; // external URL we refuse to surface
  }
  return "viewer.html?path=" + encodeURIComponent(p);
}

/** @deprecated – kept for compatibility; now returns viewer URL */
function makeSourceUrl(sourcePath, sectionTitle) {
  return makeViewerUrl(sourcePath);
}

// ------------------------------------------------------------
// Load manifest + all country data
// ------------------------------------------------------------
// ------------------------------------------------------------
// Index cascade (new layout)
//   Index/manifest.json
//     → sections.parties  → parties/_index.json
//     → sections.timeline → timeline/_index.json
//   parties/{country-id}/_index.json → parties[{id,name}]
//   parties/{country-id}/{party-id}/scores.json
//   timeline/{country-id}/_index.json → axes[]
//   timeline/{country-id}/{axis}/eras.json
// ------------------------------------------------------------

/** Normalize country entry from manifest to {id, name} */
function asCountryEntry(c) {
  if (typeof c === "string") {
    return { id: c, name: c.replace(/-/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()) };
  }
  if (c && c.id) return { id: c.id, name: c.name || c.id };
  return null;
}

async function discoverCountries() {
  const manifest = await tryFetch(`${REPO_RAW}/manifest.json`, "Index/manifest.json");
  const countries = [];
  const seen = new Set();

  if (manifest && Array.isArray(manifest.countries)) {
    for (const c of manifest.countries) {
      const e = asCountryEntry(c);
      if (e && !seen.has(e.id)) {
        seen.add(e.id);
        countries.push(e);
      }
    }
  }

  // Also merge from section indexes if present
  const partiesPath = (manifest && manifest.sections && manifest.sections.parties) || "parties/_index.json";
  const timelinePath = (manifest && manifest.sections && manifest.sections.timeline) || "timeline/_index.json";

  const partiesIdx = await tryFetch(`${REPO_RAW}/${partiesPath}`, "parties/_index.json");
  const timelineIdx = await tryFetch(`${REPO_RAW}/${timelinePath}`, "timeline/_index.json");

  for (const idx of [partiesIdx, timelineIdx]) {
    if (!idx || !Array.isArray(idx.countries)) continue;
    for (const c of idx.countries) {
      const e = asCountryEntry(c);
      if (e && !seen.has(e.id)) {
        seen.add(e.id);
        countries.push(e);
      }
    }
  }

  if (countries.length === 0) {
    console.warn("[Political Galaxy] No countries in manifest – fallback united-kingdom");
    countries.push({ id: "united-kingdom", name: "United Kingdom" });
  }

  return {
    countries, // [{id, name}, ...]
    countryIds: countries.map(c => c.id),
    sections: {
      parties: partiesPath,
      timeline: timelinePath
    },
    source: manifest ? "manifest + section indexes" : "fallback"
  };
}

async function loadIndexData() {
  if (DATA_LOAD_PROMISE) return DATA_LOAD_PROMISE;

  DATA_LOAD_PROMISE = (async () => {
    MANIFEST = await discoverCountries();

    // Country display map: id → name
    window.COUNTRY_NAMES = {};
    for (const c of MANIFEST.countries) {
      window.COUNTRY_NAMES[c.id] = c.name;
    }

    for (const c of MANIFEST.countries) {
      await loadCountry(c.id, c.name);
    }

    buildEntitiesFromParties();
    DATA_READY = true;
    const names = MANIFEST.countries.map(c => c.name).join(", ");
    console.log(`[Political Galaxy] Loaded ${MANIFEST.countries.length} countries (${MANIFEST.source}):`, names);
    const statusEl = document.getElementById("data-source-status");
    if (statusEl) statusEl.textContent = `Countries: ${names}`;
    return true;
  })();

  return DATA_LOAD_PROMISE;
}

async function loadCountry(countryId, countryName) {
  const enc = encodeURIComponent(countryId);

  // ---- PARTIES ----
  // parties/{country}/_index.json → { parties: [{id,name}] | ["id"] }
  PARTY_DATA[countryId] = {};
  window.PARTY_NAMES = window.PARTY_NAMES || {};
  window.PARTY_NAMES[countryId] = {};

  const partyIndex = await tryFetch(
    `${REPO_RAW}/parties/${enc}/_index.json`,
    `parties/${countryId}/_index.json`
  );

  let partyList = []; // [{id, name}]
  if (partyIndex && Array.isArray(partyIndex.parties)) {
    partyList = partyIndex.parties.map(p => {
      if (typeof p === "string") return { id: p, name: p.replace(/-/g, " ") };
      return { id: p.id, name: p.name || p.id };
    }).filter(p => p.id);
  }

  for (const party of partyList) {
    window.PARTY_NAMES[countryId][party.id] = party.name;
    const penc = encodeURIComponent(party.id);
    const scores = await tryFetch(
      `${REPO_RAW}/parties/${enc}/${penc}/scores.json`,
      `scores ${countryId}/${party.id}`
    );
    if (!scores) continue;

    const normalized = {};
    const raw = scores.scores || scores;
    for (const [rawKey, value] of Object.entries(raw)) {
      const id = normalizeSliderKey(rawKey);
      if (!id) continue;

      // Plain number (or null) → single score
      if (value === null || typeof value === "number") {
        normalized[id] = value;
        continue;
      }
      // Dual form: { endos, xenos } — keep both; primary for matching = endos ?? xenos
      if (typeof value === "object") {
        const endos = (typeof value.endos === "number") ? value.endos : null;
        const xenos = (typeof value.xenos === "number") ? value.xenos : null;
        if (endos == null && xenos == null && typeof value.score === "number") {
          normalized[id] = value.score;
        } else if (endos != null || xenos != null) {
          normalized[id] = {
            endos,
            xenos,
            // primary used by nearest-match / single-slider position
            primary: endos != null ? endos : xenos
          };
        }
        continue;
      }
      const n = Number(value);
      if (!Number.isNaN(n)) normalized[id] = n;
    }
    // Store under display name AND id so UI selects work either way
    PARTY_DATA[countryId][party.name] = normalized;
    PARTY_DATA[countryId][party.id] = normalized;
  }

  // ---- TIMELINE ----
  // timeline/{country}/_index.json → { axes: ["1a", ...] }
  // timeline/{country}/{axis}/eras.json
  SCORE_DATA[countryId] = {};

  const tlIndex = await tryFetch(
    `${REPO_RAW}/timeline/${enc}/_index.json`,
    `timeline/${countryId}/_index.json`
  );

  let axes = SLIDER_IDS.map(id => id); // default try all
  if (tlIndex) {
    const listed = tlIndex.axes || tlIndex.sliders;
    if (Array.isArray(listed) && listed.length) {
      axes = listed.map(normalizeSliderKey).filter(Boolean);
    }
  }

  for (const sliderId of axes) {
    // Folder uses lowercase axis ids: 1a, c4b
    const folder = String(sliderId).toLowerCase();
    const erasRaw = await tryFetch(
      `${REPO_RAW}/timeline/${enc}/${folder}/eras.json`,
      `eras ${countryId}/${folder}`
    );
    if (!erasRaw) continue;

    // Accept either a bare array or { eras: [...] }
    const erasArr = Array.isArray(erasRaw) ? erasRaw : (Array.isArray(erasRaw.eras) ? erasRaw.eras : null);
    if (!erasArr) continue;

    SCORE_DATA[countryId][sliderId] = erasArr.map(e => {
      const id = e.id || null;
      const docPath = id
        ? `timeline/${countryId}/${folder}/docs/${id}.md`
        : "";
      return {
        id,
        name: e.name || e.era || id || "",
        start: e.start == null ? 0 : e.start,
        end: (e.end == null || e.end === 9999) ? 9999 : e.end,
        score: e.score,
        source: docPath,
        section: e.name || e.era || id || "",
        era: e.name || e.era || id || ""
      };
    });
  }
}

// Kick off immediately
loadIndexData();

// ------------------------------------------------------------
// Lookups
// ------------------------------------------------------------

/** Extract a single number for slider position / distance math.
 *  Honours window.scoreLens ("endos" | "xenos") when dual scores exist.
 */
function scorePrimary(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object") {
    const lens = (typeof window !== "undefined" && window.scoreLens) || "endos";
    if (lens === "xenos") {
      if (typeof v.xenos === "number") return v.xenos;
      if (typeof v.endos === "number") return v.endos;
    } else {
      if (typeof v.endos === "number") return v.endos;
      if (typeof v.xenos === "number") return v.xenos;
    }
    if (typeof v.primary === "number") return v.primary;
    if (typeof v.score === "number") return v.score;
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Format score for display: "48" or "48 / 52" (endos / xenos) */
function scoreDisplay(v) {
  if (v == null) return "—";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const e = (typeof v.endos === "number") ? v.endos : null;
    const x = (typeof v.xenos === "number") ? v.xenos : null;
    if (e != null && x != null) return e + " / " + x;
    if (e != null) return String(e);
    if (x != null) return String(x);
    if (typeof v.primary === "number") return String(v.primary);
  }
  return "—";
}

function getEra(country, year, sliderId) {
  const countryData = SCORE_DATA[resolveCountryId(country)] || SCORE_DATA[country];
  if (!countryData) return null;
  const eras = countryData[sliderId];
  if (!eras || !Array.isArray(eras)) return null;
  for (const era of eras) {
    const start = era.start == null ? -Infinity : era.start;
    const end   = era.end == null || era.end === 9999 ? Infinity : era.end;
    if (year >= start && year <= end) return era;
  }
  return null;
}

function getScore(country, year, sliderId) {
  const era = getEra(country, year, sliderId);
  return era ? era.score : null;
}

function getVector(country, year) {
  const scores = {};
  const details = {};
  for (const slider of SLIDER_META) {
    const era = getEra(country, year, slider.id);
    if (era) {
      scores[slider.id] = era.score;
      details[slider.id] = {
        score:   era.score,
        start:   era.start,
        end:     (era.end === 9999 || era.end == null) ? "present" : era.end,
        source:  era.source,
        section: era.section || era.name || era.era || "",
        notes:   era.name || era.era || "",
        url:     makeViewerUrl(era.source)   // internal viewer, never GitHub
      };
    } else {
      scores[slider.id] = null;
      details[slider.id] = null;
    }
  }
  return { country, year, scores, details };
}

function getAvailableCountries() {
  // Return display names for UI dropdowns; map back via COUNTRY_NAMES / id when loading
  if (MANIFEST.countries && MANIFEST.countries.length) {
    // Prefer display names
    return MANIFEST.countries.map(c => (typeof c === "string" ? c : c.name || c.id));
  }
  return Object.keys(SCORE_DATA).sort();
}

/** Resolve a UI country label to the Index folder id */
function resolveCountryId(label) {
  if (!label) return null;
  if (SCORE_DATA[label] || PARTY_DATA[label]) return label;
  if (MANIFEST.countries) {
    for (const c of MANIFEST.countries) {
      if (typeof c === "string") {
        if (c === label) return c;
      } else if (c.name === label || c.id === label) {
        return c.id;
      }
    }
  }
  // kebab guess
  const kebab = String(label).toLowerCase().replace(/\s+/g, "-");
  if (SCORE_DATA[kebab] || PARTY_DATA[kebab]) return kebab;
  return label;
}


function getYearRange(country) {
  const countryData = SCORE_DATA[resolveCountryId(country)] || SCORE_DATA[country];
  if (!countryData) return { min: 1945, max: 2026 };
  let min = 9999, max = 0;
  for (const sliderId of Object.keys(countryData)) {
    for (const era of countryData[sliderId] || []) {
      const s = era.start == null ? 1945 : era.start;
      const e = (era.end == null || era.end === 9999) ? 2026 : era.end;
      if (s < min) min = s;
      if (e > max) max = e;
    }
  }
  return { min: min === 9999 ? 1945 : min, max: max === 0 ? 2026 : max };
}

function getPartyScores(country) {
  return PARTY_DATA[resolveCountryId(country)] || PARTY_DATA[country] || {};
}

function getPartyVector(country, partyName) {
  const parties = PARTY_DATA[resolveCountryId(country)] || PARTY_DATA[country];
  if (!parties || !parties[partyName]) return null;
  return parties[partyName];
}

/** Viewer URL for a party-axis justification document */
function getPartyDocUrl(country, partyName, sliderId) {
  const cid = resolveCountryId(country) || country;
  const folder = String(sliderId).toLowerCase();
  // partyName may be display name – try id from PARTY_NAMES reverse
  let pid = partyName;
  const names = (window.PARTY_NAMES && window.PARTY_NAMES[cid]) || {};
  for (const [id, name] of Object.entries(names)) { if (name === partyName) pid = id; }
  const path = `parties/${cid}/${pid}/docs/${folder}.md`;
  return makeViewerUrl(path);
}

function buildEntitiesFromParties() {
  ENTITIES = [];
  for (const [country, parties] of Object.entries(PARTY_DATA)) {
    const seen = new Set();
    for (const [name, rawScores] of Object.entries(parties || {})) {
      // Skip duplicate id-key when display-name key already holds same object
      if (seen.has(rawScores)) continue;
      seen.add(rawScores);
      const id = `party-${country.toLowerCase().replace(/\s+/g, "-")}-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
      const scores = {};
      for (const s of SLIDER_META) {
        const v = rawScores[s.id];
        scores[s.id] = scorePrimary(v);
      }
      ENTITIES.push({
        id,
        name,
        type: "party",
        country,
        era: "Contemporary",
        ideology: "Political party",
        summary: `Empirical 14-axis scoring snapshot for ${name} (${country}).`,
        scores
      });
    }
  }
  window.ENTITIES = ENTITIES;
}

// Expose for other pages
window.SLIDER_META = SLIDER_META;
window.loadIndexData = loadIndexData;
window.resolveCountryId = resolveCountryId;
window.getAvailableCountries = getAvailableCountries;
window.getVector = getVector;
window.getYearRange = getYearRange;
window.getPartyScores = getPartyScores;
window.getPartyVector = getPartyVector;
window.getPartyDocUrl = getPartyDocUrl;
window.scorePrimary = scorePrimary;
window.scoreDisplay = scoreDisplay;
window.makeViewerUrl = makeViewerUrl;
window.SCORE_DATA = SCORE_DATA;
window.PARTY_DATA = PARTY_DATA;
