// ============================================================
// Political Galaxy – Data Layer
// Discovers countries from Index/manifest.json
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
  "C5A": "C5A", "C5B": "C5B"
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
    return await res.json();
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
async function loadIndexData() {
  if (DATA_LOAD_PROMISE) return DATA_LOAD_PROMISE;

  DATA_LOAD_PROMISE = (async () => {
    // 1. Manifest – list of countries (the only hard discovery point)
    let manifest = await tryFetch(`${REPO_RAW}/manifest.json`, "Index/manifest.json");
    if (!manifest || !Array.isArray(manifest.countries) || manifest.countries.length === 0) {
      // Fallback: assume United Kingdom only
      console.warn("[Political Galaxy] manifest.json missing or empty – falling back to United Kingdom");
      manifest = { countries: ["United Kingdom"], updated: null };
    }
    MANIFEST = manifest;

    // 2. Load each country
    for (const country of MANIFEST.countries) {
      await loadCountry(country);
    }

    buildEntitiesFromParties();
    DATA_READY = true;
    console.log(`[Political Galaxy] Loaded ${MANIFEST.countries.length} countries from manifest:`, MANIFEST.countries);
    const statusEl = document.getElementById("data-source-status");
    if (statusEl) statusEl.textContent = `Countries: ${MANIFEST.countries.join(", ")}`;
    return true;
  })();

  return DATA_LOAD_PROMISE;
}

async function loadCountry(country) {
  const enc = encodeURIComponent(country);

  // --- Parties (still one JSON per country) ---
  const partiesUrl = `${REPO_RAW}/Political%20Parties/${enc}.json`;
  const partiesLocal = `data/${country.toLowerCase().replace(/\s+/g, "_")}_parties.json`;
  let parties = await tryFetch(partiesUrl, `Parties ${country}`);
  if (!parties) parties = await tryFetch(partiesLocal, `Local parties ${country}`);

  if (parties) {
    const rawParties = parties.parties || parties;
    const normalized = {};
    for (const [partyName, rawScores] of Object.entries(rawParties || {})) {
      if (typeof rawScores !== "object") continue;
      const scores = {};
      for (const [rawKey, value] of Object.entries(rawScores)) {
        const id = normalizeSliderKey(rawKey);
        if (id) scores[id] = value;
      }
      normalized[partyName] = scores;
    }
    PARTY_DATA[country] = normalized;
  } else {
    PARTY_DATA[country] = {};
  }

  // --- Timeline: try new per-slider format first, then old flat format ---
  SCORE_DATA[country] = {};

  // New format: Index/Time Line/{Country}/{sliderId}/timeline.json
  let loadedAnyNew = false;
  for (const sliderId of SLIDER_IDS) {
    const url = `${REPO_RAW}/Time%20Line/${enc}/${sliderId}/timeline.json`;
    const eras = await tryFetch(url, `Timeline ${country}/${sliderId}`);
    if (Array.isArray(eras) && eras.length) {
      SCORE_DATA[country][sliderId] = eras.map(e => ({
        name:    e.name || e.era || "",
        start:   e.start == null ? 0 : e.start,
        end:     (e.end == null || e.end === 9999) ? 9999 : e.end,
        score:   e.score,
        // Store Index-relative path for the viewer
        source:  e.doc
          ? `Time Line/${country}/${sliderId}/${e.doc}`
          : (e.source || ""),
        section: e.name || e.era || "",
        era:     e.name || e.era || ""
      }));
      loadedAnyNew = true;
    }
  }

  // Fallback: old flat United Kingdom.json style
  if (!loadedAnyNew) {
    const flatUrl = `${REPO_RAW}/Time%20Line/${enc}.json`;
    const localFlat = `data/${country.toLowerCase().replace(/\s+/g, "_")}_timeline.json`;
    let flat = await tryFetch(flatUrl, `Flat timeline ${country}`);
    if (!flat) flat = await tryFetch(localFlat, `Local flat timeline ${country}`);

    if (flat && flat.sliders) {
      for (const [rawKey, eras] of Object.entries(flat.sliders)) {
        const sliderId = normalizeSliderKey(rawKey);
        if (!sliderId || !Array.isArray(eras)) continue;
        SCORE_DATA[country][sliderId] = eras.map(e => ({
          name:    e.era || e.name || "",
          start:   e.start == null ? 0 : e.start,
          end:     (e.end == null || e.end === 9999) ? 9999 : e.end,
          score:   e.score,
          source:  e.source || "",
          section: e.section || e.era || "",
          era:     e.era || e.name || ""
        }));
      }
    }
  }
}

// Kick off immediately
loadIndexData();

// ------------------------------------------------------------
// Lookups
// ------------------------------------------------------------
function getEra(country, year, sliderId) {
  const countryData = SCORE_DATA[country];
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
  // Prefer manifest order; fall back to whatever was loaded
  if (MANIFEST.countries && MANIFEST.countries.length) return [...MANIFEST.countries];
  return Object.keys(SCORE_DATA).sort();
}

function getYearRange(country) {
  const countryData = SCORE_DATA[country];
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
  return PARTY_DATA[country] || {};
}

function getPartyVector(country, partyName) {
  const parties = PARTY_DATA[country];
  if (!parties || !parties[partyName]) return null;
  return parties[partyName];
}

/** Viewer URL for a party-axis justification document */
function getPartyDocUrl(country, partyName, sliderId) {
  const path = `Political Parties/${country}/${partyName}/${sliderId}.md`;
  return makeViewerUrl(path);
}

function buildEntitiesFromParties() {
  ENTITIES = [];
  for (const [country, parties] of Object.entries(PARTY_DATA)) {
    for (const [name, rawScores] of Object.entries(parties || {})) {
      const id = `party-${country.toLowerCase().replace(/\s+/g, "-")}-${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
      const scores = {};
      for (const s of SLIDER_META) {
        const v = rawScores[s.id];
        scores[s.id] = (v === null || v === undefined || isNaN(v)) ? null : Number(v);
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
window.getAvailableCountries = getAvailableCountries;
window.getVector = getVector;
window.getYearRange = getYearRange;
window.getPartyScores = getPartyScores;
window.getPartyVector = getPartyVector;
window.getPartyDocUrl = getPartyDocUrl;
window.makeViewerUrl = makeViewerUrl;
window.SCORE_DATA = SCORE_DATA;
window.PARTY_DATA = PARTY_DATA;
