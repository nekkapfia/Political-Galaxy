// ============================================================
// Political Galaxy – Data Layer
// Loads Index JSON files and exposes Country + Year lookups
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

// Runtime data stores (filled after JSON load)
let SCORE_DATA = {};          // country → sliderId → eras[]
let PARTY_DATA = {};          // country → partyName → { sliderId: score }
let ENTITIES = [];            // flat list of scored entities (parties etc.) for matching + galaxy
let DATA_READY = false;
let DATA_LOAD_PROMISE = null;

// ------------------------------------------------------------
// Load Index JSON files
// ------------------------------------------------------------
async function loadIndexData() {
  if (DATA_LOAD_PROMISE) return DATA_LOAD_PROMISE;

  DATA_LOAD_PROMISE = (async () => {
    // Canonical source: live Index section of the Political-Galaxy repo
    // https://github.com/nekkapfia/Political-Galaxy/tree/main/Index
    const REMOTE_TIMELINE = "https://raw.githubusercontent.com/nekkapfia/Political-Galaxy/main/Index/Time%20Line/United%20Kingdom.json";
    const REMOTE_PARTIES  = "https://raw.githubusercontent.com/nekkapfia/Political-Galaxy/main/Index/Political%20Parties/United%20Kingdom.json";
    // Local fallback (bundled copies for offline / GitHub Pages edge cases)
    const LOCAL_TIMELINE  = "data/united_kingdom_timeline.json";
    const LOCAL_PARTIES   = "data/united_kingdom_parties.json";

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

    try {
      // Prefer live Index/ from the GitHub repo
      let timeline = await tryFetch(REMOTE_TIMELINE, "Remote Timeline (Index/Time Line)");
      let parties  = await tryFetch(REMOTE_PARTIES,  "Remote Parties (Index/Political Parties)");
      let source   = "GitHub Index (live)";

      // Fallback to local bundled copies if remote unavailable
      if (!timeline) {
        timeline = await tryFetch(LOCAL_TIMELINE, "Local Timeline fallback");
        source = "local fallback";
      }
      if (!parties) {
        parties = await tryFetch(LOCAL_PARTIES, "Local Parties fallback");
        if (source === "GitHub Index (live)") source = "mixed (remote + local)";
        else source = "local fallback";
      }

      if (!timeline) throw new Error("Timeline JSON could not be loaded from remote Index or local data/");
      if (!parties)  throw new Error("Parties JSON could not be loaded from remote Index or local data/");

      // Convert Timeline Index → SCORE_DATA shape
      // Expected: SCORE_DATA[country][sliderId] = [{start, end, score, source, section, notes}]
      const country = timeline.country || "United Kingdom";
      SCORE_DATA[country] = {};

      for (const [sliderId, eras] of Object.entries(timeline.sliders || {})) {
        SCORE_DATA[country][sliderId] = (eras || []).map(e => ({
          start:   e.start == null ? 0 : e.start,
          end:     e.end == null ? 9999 : e.end,
          score:   e.score,
          source:  e.source || "",
          section: e.section || e.era || "",
          notes:   e.era || "",
          era:     e.era || ""
        }));
      }

      // Convert Parties Index → PARTY_DATA shape
      PARTY_DATA[country] = parties.parties || {};

      // Build ENTITIES array + attach to galaxy hierarchy for visualisation / matching
      buildEntitiesFromParties();

      DATA_READY = true;
      console.log(`[Political Galaxy] Index data loaded for ${country} from ${source} – ${ENTITIES.length} entities`);
      // Optional UI status (if element exists)
      const statusEl = document.getElementById("data-source-status");
      if (statusEl) statusEl.textContent = `Data: ${source}`;
      return true;
    } catch (err) {
      console.error("[Political Galaxy] Failed to load Index JSON:", err);
      DATA_READY = false;
      return false;
    }
  })();

  return DATA_LOAD_PROMISE;
}

// Kick off load immediately
loadIndexData();

// ------------------------------------------------------------
// Helper: build a GitHub URL that tries to land on the section
// ------------------------------------------------------------
function makeSourceUrl(sourcePath, sectionTitle) {
  if (!sourcePath) return null;
  // If already a full URL, use as-is
  if (sourcePath.startsWith("http")) return sourcePath;

  const base = "https://github.com/nekkapfia/Political-Galaxy/blob/main/" + encodeURI(sourcePath);
  if (!sectionTitle) return base;

  const anchor = sectionTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base + "#" + anchor;
}

// ------------------------------------------------------------
// Core lookup functions (Country + Year model)
// ------------------------------------------------------------

/**
 * Find the era object that contains the given year for one slider.
 * Returns the full era object or null.
 */
function getEra(country, year, sliderId) {
  const countryData = SCORE_DATA[country];
  if (!countryData) return null;
  const eras = countryData[sliderId];
  if (!eras || !Array.isArray(eras)) return null;

  for (const era of eras) {
    const start = era.start == null ? -Infinity : era.start;
    const end   = era.end == null || era.end === 9999 ? Infinity : era.end;
    if (year >= start && year <= end) {
      return era;
    }
  }
  return null;
}

/**
 * Get just the numeric score (or null) for country + year + slider.
 */
function getScore(country, year, sliderId) {
  const era = getEra(country, year, sliderId);
  return era ? era.score : null;
}

/**
 * Build the full 14-dimensional vector + source info for a country-year.
 */
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
        section: era.section || era.era || "",
        notes:   era.notes || era.era || "",
        url:     makeSourceUrl(era.source, era.section || era.era)
      };
    } else {
      scores[slider.id] = null;
      details[slider.id] = null;
    }
  }

  return { country, year, scores, details };
}

/**
 * List every country that has at least some data.
 */
function getAvailableCountries() {
  return Object.keys(SCORE_DATA).sort();
}

/**
 * For a country, return the overall min/max year that has any score.
 */
function getYearRange(country) {
  const countryData = SCORE_DATA[country];
  if (!countryData) return { min: 1945, max: 2026 };

  let min = 9999, max = 0;
  for (const sliderId of Object.keys(countryData)) {
    for (const era of countryData[sliderId]) {
      const s = era.start == null ? 1945 : era.start;
      const e = (era.end == null || era.end === 9999) ? 2026 : era.end;
      if (s < min) min = s;
      if (e > max) max = e;
    }
  }
  return { min: min === 9999 ? 1945 : min, max: max === 0 ? 2026 : max };
}

/**
 * Get party scores for a country (modern snapshot).
 * Returns { partyName: { sliderId: score, ... }, ... }
 */
function getPartyScores(country) {
  return PARTY_DATA[country] || {};
}

/**
 * Get a single party's score vector.
 */
function getPartyVector(country, partyName) {
  const parties = PARTY_DATA[country];
  if (!parties || !parties[partyName]) return null;
  return parties[partyName];
}

/**
 * Convert loaded PARTY_DATA into the flat ENTITIES list expected by
 * sliders matching and the galaxy visualisation. Also wires entity IDs
 * into the GALAXY_HIERARCHY so the UK leaf renders party dots.
 */
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

      // Rough ideology label from key scores (heuristic only)
      let ideology = "";
      const c1a = scores.C1A, c2a = scores.C2A, c2b = scores.C2B, a1 = scores["1A"];
      if (c1a != null && c1a >= 60) ideology = "Progressive / Secular";
      else if (c1a != null && c1a <= 20) ideology = "Traditional / Foundational";
      if (c2b != null && c2b >= 70) ideology = (ideology ? ideology + " · " : "") + "High National Pride";
      else if (c2b != null && c2b <= 30) ideology = (ideology ? ideology + " · " : "") + "Low National Pride";
      if (a1 != null && a1 >= 70) ideology = (ideology ? ideology + " · " : "") + "High Autonomy";
      else if (a1 != null && a1 <= 40) ideology = (ideology ? ideology + " · " : "") + "Lower Autonomy";

      ENTITIES.push({
        id,
        name,
        type: "party",
        country,
        era: "Contemporary (≈2024–present)",
        ideology: ideology || "Political party",
        summary: `Empirical 14-axis scoring snapshot for ${name} (${country}). Partial scores are supported; missing dimensions are ignored in distance calculations.`,
        scores
      });
    }
  }

  // Attach entity IDs to the UK node in the hierarchy so galaxy leaf rendering works
  function findAndAttach(node) {
    if (node.country === "United Kingdom" || node.id === "uk") {
      node.entities = ENTITIES.filter(e => e.country === "United Kingdom").map(e => e.id);
      node.type = node.type || "country";
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findAndAttach(child)) return true;
      }
    }
    return false;
  }
  findAndAttach(GALAXY_HIERARCHY);

  // Expose globally for scripts that expect a top-level ENTITIES
  window.ENTITIES = ENTITIES;
}

// ------------------------------------------------------------
// Simple hierarchical grouping for the Galaxy
// ------------------------------------------------------------
const GALAXY_HIERARCHY = {
  id: "root",
  name: "Political Galaxy",
  description: "Explore political space. Click clusters to zoom; entities appear at leaf levels.",
  children: [
    {
      id: "west",
      name: "Western Democracies",
      description: "Liberal democratic systems of Western Europe and the Anglosphere.",
      color: "#6366f1",
      children: [
        {
          id: "uk",
          name: "United Kingdom",
          type: "country",
          country: "United Kingdom",
          color: "#818cf8",
          entities: []   // populated by buildEntitiesFromParties()
        }
      ]
    }
  ]
};

// ------------------------------------------------------------
// Document index (for the Index section of the site)
// ------------------------------------------------------------
const DOC_INDEX = {
  core: [
    { name: "Complete Authoritative Slider System", url: "https://github.com/nekkapfia/Political-Galaxy/blob/main/system-functionality/Complete%20Authoritative%20Slider%20System.md" },
    { name: "Empirical Political Slider System (PDF)", url: "https://github.com/nekkapfia/Political-Galaxy/blob/main/docs/Empirical_Political_Slider_System.pdf" }
  ],
  sliders: SLIDER_META.map(s => ({ name: s.id + " – " + s.name })),
  scoring: [
    { name: "Core 1A – UK Timeline", path: "Scoring/Core 1A/Time Line/Core-1A-Timeline-UK-1945-Present.md" },
    { name: "Core 1B – Britain", path: "Scoring/Core 1B/Britain_Core_1B_Scoring_Document_Complete.md" },
    { name: "Core 2A – Britain", path: "Scoring/Core 2A/Britain Core 2A Scoring.md" },
    { name: "Core 2B – Britain", path: "Scoring/Core 2B/Britain Core 2B Scoring.md" },
    { name: "Cultural 1A – UK Timeline", path: "Scoring/Cultural 1A/Time Line/Cultural-1A-Timeline-UK-1945-2026.md" },
    { name: "Cultural 1B – Britain", path: "Scoring/Cultural 1B/Britain Cultural 1B.md" },
    { name: "Cultural 2A – Britain", path: "Scoring/Cultural 2A/Britain Cultural 2A.md" },
    { name: "Cultural 2B – Britain", path: "Scoring/Cultural 2B/Britain Cultural 2B.md" },
    { name: "Cultural 3A+3B – Britain", path: "Scoring/Cultural Pair 3/Britain 3A+3B.md" },
    { name: "Cultural 4A – Britain", path: "Scoring/Cultural 4A/Britain Cultural 4A.md" },
    { name: "Cultural 4B – Britain", path: "Scoring/Cultural 4B/Britain Cultural 4B.md" },
    { name: "Cultural 5A – Britain", path: "Scoring/Cultural 5A/Britain-Cultural-5A-.md" },
    { name: "Cultural 5B – UK Timeline", path: "Scoring/Cultural 5B/UK_Cultural_5B_Timeline_1945_Present.md" }
  ]
};

const REPO_TREE_SUMMARY = `
Scoring/
├── Core 1A/ … Time Line/ + Modern Politics/
├── Core 1B/
├── Core 2A/
├── Core 2B/
├── Cultural 1A/ … Time Line/ + Modern Politics/
├── Cultural 1B/
├── Cultural 2A/
├── Cultural 2B/
├── Cultural Pair 3/
├── Cultural 4A/
├── Cultural 4B/
├── Cultural 5A/
└── Cultural 5B/

Index/   ← LIVE data source for this website (fetched at runtime)
├── Time Line/United Kingdom.json
└── Political Parties/United Kingdom.json

The website explicitly pulls the two Index JSON files from the
canonical GitHub repo (raw.githubusercontent.com/nekkapfia/Political-Galaxy)
so scores stay in sync with the authoritative Index section.
Local data/ copies are kept only as offline fallback.
`;
