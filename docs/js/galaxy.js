// ============================================================
// Political Galaxy – Score-similarity hierarchy
// Clusters entities by their 14-axis score vectors (not by
// country or pre-conceived ideology labels). Zoom starts at
// the coarsest natural split and drills into finer clusters.
// ============================================================

let currentGalaxyNode = null;
let galaxySvg = null;
let galaxyZoom = null;
let galaxyG = null;
let GALAXY_HIERARCHY = null;

const AXIS_IDS = () =>
  (typeof SLIDER_IDS !== "undefined" && SLIDER_IDS.length)
    ? SLIDER_IDS
    : ["1A","1B","2A","2B","C1A","C1B","C2A","C2B","C3A","C3B","C4A","C4B","C5A","C5B"];

// ------------------------------------------------------------
// Vector helpers
// ------------------------------------------------------------
function entityVector(entity) {
  const ids = AXIS_IDS();
  const v = [];
  for (const id of ids) {
    const raw = entity.scores && entity.scores[id];
    let n = null;
    if (typeof scorePrimary === "function") n = scorePrimary(raw);
    else if (typeof raw === "number") n = raw;
    else if (raw && typeof raw === "object") n = raw.endos ?? raw.xenos ?? raw.primary ?? null;
    // Missing scores: use neutral 50 so they don't dominate distance
    v.push(n == null || isNaN(n) ? 50 : Number(n));
  }
  return v;
}

function euclidean(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

function centroid(vectors) {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const c = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) c[i] += v[i];
  }
  for (let i = 0; i < dim; i++) c[i] /= vectors.length;
  return c;
}

/** Average linkage distance between two clusters (arrays of vector indices). */
function linkageDistance(clusterA, clusterB, distMatrix) {
  let sum = 0;
  let n = 0;
  for (const i of clusterA) {
    for (const j of clusterB) {
      sum += distMatrix[i][j];
      n++;
    }
  }
  return n ? sum / n : 0;
}

// ------------------------------------------------------------
// Agglomerative hierarchical clustering
// Returns a dendrogram node: { indices, left, right, height, size }
// ------------------------------------------------------------
function hierarchicalCluster(vectors) {
  const n = vectors.length;
  if (n === 0) return null;
  if (n === 1) return { indices: [0], left: null, right: null, height: 0, size: 1 };

  // Pairwise distance matrix
  const dist = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = euclidean(vectors[i], vectors[j]);
      dist[i][j] = dist[j][i] = d;
    }
  }

  // Active clusters
  let clusters = [];
  for (let i = 0; i < n; i++) {
    clusters.push({ indices: [i], left: null, right: null, height: 0, size: 1, id: i });
  }
  let nextId = n;

  while (clusters.length > 1) {
    // Find closest pair
    let best = Infinity;
    let bi = 0, bj = 1;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = linkageDistance(clusters[i].indices, clusters[j].indices, dist);
        if (d < best) {
          best = d;
          bi = i;
          bj = j;
        }
      }
    }
    const a = clusters[bi];
    const b = clusters[bj];
    const merged = {
      indices: a.indices.concat(b.indices),
      left: a,
      right: b,
      height: best,
      size: a.size + b.size,
      id: nextId++
    };
    // Remove bj first if larger index
    clusters.splice(Math.max(bi, bj), 1);
    clusters.splice(Math.min(bi, bj), 1);
    clusters.push(merged);
  }
  return clusters[0];
}

// ------------------------------------------------------------
// Cut dendrogram into a zoomable tree with ~target branches per level
// ------------------------------------------------------------
function dendrogramToTree(node, entities, vectors, depth = 0, maxDepth = 4) {
  if (!node) return null;

  const memberEntities = node.indices.map(i => entities[i]);
  const memberVectors = node.indices.map(i => vectors[i]);
  const centre = centroid(memberVectors);

  // Leaf if small enough or max depth
  const isLeaf = node.size <= 3 || depth >= maxDepth || (!node.left && !node.right);

  const out = {
    name: "", // filled below
    color: clusterColor(centre),
    description: clusterDescription(centre, memberEntities.length),
    centroid: centre,
    children: [],
    entities: [],
    size: node.size,
    height: node.height
  };

  if (isLeaf || !node.left) {
    out.entities = memberEntities;
    out.name = leafName(memberEntities);
  } else {
    // Split into left / right subtrees; if one side is tiny, flatten
    const leftTree = dendrogramToTree(node.left, entities, vectors, depth + 1, maxDepth);
    const rightTree = dendrogramToTree(node.right, entities, vectors, depth + 1, maxDepth);
    out.children = [leftTree, rightTree].filter(Boolean);

    // If a child is itself a tiny leaf cluster, keep structure
    out.name = branchName(centre, out.children, depth);
  }

  return out;
}

/** Human-readable cluster label from which axes deviate most from 50. */
function clusterSignature(centre) {
  const ids = AXIS_IDS();
  const deviations = centre.map((v, i) => ({
    id: ids[i],
    v,
    dev: Math.abs(v - 50)
  }));
  deviations.sort((a, b) => b.dev - a.dev);
  const top = deviations.slice(0, 2);
  return top.map(t => {
    const dir = t.v >= 50 ? "High" : "Low";
    return `${dir} ${shortAxis(t.id)}`;
  });
}

function shortAxis(id) {
  const map = {
    "1A": "Pers.Aut.", "1B": "Econ.Aut.",
    "2A": "Nat.Sov.", "2B": "Int.Sov.",
    "C1A": "Foundation", "C1B": "Dogmatism",
    "C2A": "Individ.", "C2B": "Pride",
    "C3A": "Ethnic", "C3B": "Cultural",
    "C4A": "Determinism", "C4B": "Equity",
    "C5A": "Tradition", "C5B": "Radicalism"
  };
  return map[id] || id;
}

function branchName(centre, children, depth) {
  const sig = clusterSignature(centre);
  if (depth === 0) return "Political Galaxy";
  return sig.join(" · ");
}

function leafName(entities) {
  if (entities.length === 1) return entities[0].name || entities[0].party || "Entity";
  if (entities.length <= 3) {
    return entities.map(e => e.name || e.party).join(" · ");
  }
  return `${entities.length} entities`;
}

function clusterDescription(centre, n) {
  const sig = clusterSignature(centre);
  return `${n} entities · characterised by ${sig.join(" and ")}`;
}

function clusterColor(centre) {
  // Colour from 1A (personal autonomy) primarily – low = red, high = blue
  const ids = AXIS_IDS();
  const i1a = ids.indexOf("1A");
  const score = i1a >= 0 ? centre[i1a] : 50;
  if (score < 20) return "#ef4444";
  if (score < 35) return "#f97316";
  if (score < 50) return "#eab308";
  if (score < 65) return "#22c55e";
  if (score < 80) return "#0ea5e9";
  return "#6366f1";
}

// ------------------------------------------------------------
// Build hierarchy from live ENTITIES
// ------------------------------------------------------------
function buildGalaxyHierarchy() {
  const raw = (window.ENTITIES || []).filter(e => e && e.scores);
  if (!raw.length) {
    GALAXY_HIERARCHY = {
      name: "Political Galaxy",
      color: "#6366f1",
      children: [],
      entities: [],
      description: "No scored entities loaded"
    };
    window.GALAXY_HIERARCHY = GALAXY_HIERARCHY;
    return GALAXY_HIERARCHY;
  }

  // Deduplicate by id
  const seen = new Set();
  const entities = [];
  for (const e of raw) {
    const id = e.id || (e.country + "::" + e.name);
    if (seen.has(id)) continue;
    seen.add(id);
    entities.push(e);
  }

  const vectors = entities.map(entityVector);
  const dendro = hierarchicalCluster(vectors);

  // Adaptive depth: more entities → allow one extra level
  const maxDepth = entities.length > 30 ? 5 : entities.length > 15 ? 4 : 3;
  GALAXY_HIERARCHY = dendrogramToTree(dendro, entities, vectors, 0, maxDepth);
  if (GALAXY_HIERARCHY) {
    GALAXY_HIERARCHY.name = "Political Galaxy";
  }

  window.GALAXY_HIERARCHY = GALAXY_HIERARCHY;
  console.log(`[Political Galaxy] Clustered ${entities.length} entities into similarity hierarchy`);
  return GALAXY_HIERARCHY;
}

// ------------------------------------------------------------
// Rendering (unchanged interaction model, new data source)
// ------------------------------------------------------------
function initGalaxy() {
  const container = document.getElementById("galaxy-canvas");
  if (!container) return;

  if (!GALAXY_HIERARCHY) buildGalaxyHierarchy();

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || (window.innerHeight - 56);

  container.innerHTML = "";
  galaxySvg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const stars = galaxySvg.append("g").attr("class", "stars");
  for (let i = 0; i < 120; i++) {
    stars.append("circle")
      .attr("cx", Math.random() * width)
      .attr("cy", Math.random() * height)
      .attr("r", Math.random() * 1.2)
      .attr("fill", "#64748b")
      .attr("opacity", 0.3 + Math.random() * 0.5);
  }

  galaxyG = galaxySvg.append("g");

  galaxyZoom = d3.zoom()
    .scaleExtent([0.4, 8])
    .on("zoom", (event) => {
      galaxyG.attr("transform", event.transform);
    });
  galaxySvg.call(galaxyZoom);

  document.getElementById("galaxy-reset")?.addEventListener("click", () => {
    currentGalaxyNode = GALAXY_HIERARCHY;
    renderGalaxyLevel(GALAXY_HIERARCHY);
    galaxySvg.transition().duration(500).call(galaxyZoom.transform, d3.zoomIdentity);
  });

  document.getElementById("galaxy-zoom-out")?.addEventListener("click", () => {
    if (currentGalaxyNode && currentGalaxyNode.parent) {
      currentGalaxyNode = currentGalaxyNode.parent;
      renderGalaxyLevel(currentGalaxyNode);
    } else {
      currentGalaxyNode = GALAXY_HIERARCHY;
      renderGalaxyLevel(GALAXY_HIERARCHY);
    }
  });

  document.getElementById("close-panel")?.addEventListener("click", () => {
    document.getElementById("galaxy-panel")?.classList.add("hidden");
  });

  function attachParents(node, parent = null) {
    if (!node) return;
    node.parent = parent;
    (node.children || []).forEach(c => attachParents(c, node));
  }
  attachParents(GALAXY_HIERARCHY);

  currentGalaxyNode = GALAXY_HIERARCHY;
  renderGalaxyLevel(GALAXY_HIERARCHY);
}

function renderGalaxyLevel(node) {
  if (!galaxySvg || !galaxyG || !node) return;
  currentGalaxyNode = node;

  const breadcrumb = document.getElementById("galaxy-breadcrumb");
  if (breadcrumb) {
    const path = [];
    let cur = node;
    while (cur) {
      path.unshift(cur.name);
      cur = cur.parent;
    }
    breadcrumb.textContent = path.join(" › ");
  }

  const width = +galaxySvg.attr("width");
  const height = +galaxySvg.attr("height");
  galaxyG.selectAll("*").remove();

  const children = node.children || [];
  const entities = node.entities || [];

  // Leaf cluster → party dots, laid out by score similarity in 2D
  if (entities.length > 0 && children.length === 0) {
    renderEntitiesBySimilarity(entities, width, height);
    return;
  }

  // Branch → child clusters as circles
  if (children.length > 0) {
    // Place children using their centroid projected to 2D (1A vs C5B or PCA-lite)
    const positions = layoutClusters(children, width, height);

    children.forEach((child, i) => {
      const pos = positions[i];
      const cx = pos.x;
      const cy = pos.y;
      const radius = pos.r;

      const g = galaxyG.append("g")
        .attr("transform", `translate(${cx},${cy})`)
        .style("cursor", "pointer")
        .on("click", (event) => {
          event.stopPropagation();
          renderGalaxyLevel(child);
          galaxySvg.transition().duration(600).call(
            galaxyZoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(1.35).translate(-cx, -cy)
          );
        });

      g.append("circle")
        .attr("r", radius + 10)
        .attr("fill", child.color || "#6366f1")
        .attr("opacity", 0.12);

      g.append("circle")
        .attr("class", "cluster-bg")
        .attr("r", radius)
        .attr("fill", child.color || "#6366f1")
        .attr("opacity", 0.5)
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.35);

      const count = countEntities(child);
      const label = child.name || "Cluster";
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", -6)
        .attr("fill", "#f1f5f9")
        .attr("font-size", 12)
        .attr("font-weight", 600)
        .text(label.length > 26 ? label.slice(0, 24) + "…" : label);

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 12)
        .attr("fill", "#cbd5e1")
        .attr("font-size", 11)
        .text(count === 1 ? "1 entity" : `${count} entities`);
    });
  }

  if (entities.length && children.length) {
    entities.forEach((e, i) => {
      const angle = (i / Math.max(entities.length, 1)) * Math.PI * 2;
      const r = Math.min(width, height) * 0.4;
      drawEntityDot(galaxyG, e, width / 2 + Math.cos(angle) * r, height / 2 + Math.sin(angle) * r, 8);
    });
  }

  if (!children.length && !entities.length) {
    galaxyG.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", 14)
      .text("No entities in this layer");
  }
}

/** Place cluster children in 2D from centroid axes (1A horizontal, C5B vertical). */
function layoutClusters(children, width, height) {
  const ids = AXIS_IDS();
  const i1a = Math.max(0, ids.indexOf("1A"));
  const iC5b = ids.indexOf("C5B") >= 0 ? ids.indexOf("C5B") : Math.min(1, ids.length - 1);

  const pts = children.map(ch => {
    const c = ch.centroid || [];
    return {
      x: c[i1a] != null ? c[i1a] : 50,
      y: c[iC5b] != null ? c[iC5b] : 50,
      size: ch.size || 1
    };
  });

  // Normalise to canvas with margin
  const margin = 80;
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  let minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (maxX - minX < 5) { minX -= 10; maxX += 10; }
  if (maxY - minY < 5) { minY -= 10; maxY += 10; }

  const maxSize = Math.max(...pts.map(p => p.size));
  return pts.map(p => {
    const x = margin + ((p.x - minX) / (maxX - minX)) * (width - 2 * margin);
    const y = margin + ((p.y - minY) / (maxY - minY)) * (height - 2 * margin);
    const r = 28 + 36 * (p.size / maxSize);
    return { x, y, r };
  });
}

function countEntities(node) {
  let c = (node.entities || []).length;
  (node.children || []).forEach(ch => { c += countEntities(ch); });
  return c;
}

/** Leaf layout: project entities onto 1A × C5B plane by their scores. */
function renderEntitiesBySimilarity(entities, width, height) {
  const ids = AXIS_IDS();
  const i1a = Math.max(0, ids.indexOf("1A"));
  const iC5b = ids.indexOf("C5B") >= 0 ? ids.indexOf("C5B") : 1;

  const pts = entities.map(e => {
    const v = entityVector(e);
    return { e, x: v[i1a], y: v[iC5b] };
  });

  const margin = 70;
  let minX = Math.min(...pts.map(p => p.x));
  let maxX = Math.max(...pts.map(p => p.x));
  let minY = Math.min(...pts.map(p => p.y));
  let maxY = Math.max(...pts.map(p => p.y));
  if (maxX - minX < 5) { minX -= 10; maxX += 10; }
  if (maxY - minY < 5) { minY -= 10; maxY += 10; }

  // Axis guides
  galaxyG.append("text")
    .attr("x", width / 2)
    .attr("y", height - 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#64748b")
    .attr("font-size", 11)
    .text("← Low Personal Autonomy   ·   High Personal Autonomy →");
  galaxyG.append("text")
    .attr("x", 18)
    .attr("y", height / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "#64748b")
    .attr("font-size", 11)
    .attr("transform", `rotate(-90, 18, ${height / 2})`)
    .text("← Low Radicalism   ·   High Radicalism →");

  pts.forEach(p => {
    const cx = margin + ((p.x - minX) / (maxX - minX)) * (width - 2 * margin);
    const cy = margin + ((p.y - minY) / (maxY - minY)) * (height - 2 * margin);
    // Invert Y so high radicalism is toward top
    const cyInv = height - cy;
    drawEntityDot(galaxyG, p.e, cx, cyInv, 14, true);
  });
}

function drawEntityDot(parent, entity, cx, cy, r, withLabel = false) {
  const s1a = (typeof scorePrimary === "function")
    ? scorePrimary(entity.scores && entity.scores["1A"])
    : (entity.scores && entity.scores["1A"]);
  const color = scoreToColor(typeof s1a === "number" ? s1a : null);
  const label = entity.name || entity.party || "Unknown";

  const g = parent.append("g")
    .attr("transform", `translate(${cx},${cy})`)
    .style("cursor", "pointer")
    .on("click", (event) => {
      event.stopPropagation();
      showGalaxyPanel(entity);
    });

  g.append("circle")
    .attr("class", "entity-dot")
    .attr("r", r)
    .attr("fill", color)
    .attr("opacity", 0.9)
    .attr("stroke", "#1e293b")
    .attr("stroke-width", 2);

  if (withLabel) {
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", r + 13)
      .attr("fill", "#e2e8f0")
      .attr("font-size", 10)
      .text(label.length > 24 ? label.slice(0, 22) + "…" : label);
  }

  const disp = (typeof scoreDisplay === "function")
    ? scoreDisplay(entity.scores && entity.scores["1A"])
    : (s1a ?? "—");
  g.append("title").text(`${label}\n1A: ${disp}\n${entity.countryName || entity.country || ""}`);
}

function scoreToColor(score) {
  if (score == null || isNaN(score)) return "#64748b";
  if (score < 20) return "#ef4444";
  if (score < 40) return "#f97316";
  if (score < 55) return "#eab308";
  if (score < 70) return "#22c55e";
  return "#3b82f6";
}

function showGalaxyPanel(entity) {
  const panel = document.getElementById("galaxy-panel");
  const content = document.getElementById("panel-content");
  if (!panel || !content) return;
  panel.classList.remove("hidden");

  const scoresHtml = (typeof SLIDER_META !== "undefined" ? SLIDER_META : []).map(s => {
    const raw = entity.scores && entity.scores[s.id];
    const primary = (typeof scorePrimary === "function") ? scorePrimary(raw) : (typeof raw === "number" ? raw : null);
    const label = (typeof scoreDisplay === "function") ? scoreDisplay(raw) : (primary != null ? String(primary) : "—");
    const bar = primary != null
      ? `<div class="h-1.5 bg-slate-700 rounded mt-0.5"><div class="h-full bg-indigo-500 rounded" style="width:${Math.max(0, Math.min(100, primary))}%"></div></div>`
      : `<div class="text-xs text-slate-500">not scored</div>`;
    return `<div class="mb-2">
      <div class="flex justify-between text-xs"><span>${s.short}</span><span class="font-mono text-indigo-300">${label}</span></div>
      ${bar}
    </div>`;
  }).join("");

  const title = entity.name || entity.party || "Entity";
  const sub = [entity.type, entity.countryName || entity.country].filter(Boolean).join(" · ");

  content.innerHTML = `
    <h3 class="font-semibold text-lg pr-6">${title}</h3>
    <div class="text-xs text-slate-400 mt-1">${sub}</div>
    <h4 class="font-medium text-sm mt-4 mb-2 text-slate-200">Scores</h4>
    ${scoresHtml}
  `;
}

window.buildGalaxyHierarchy = buildGalaxyHierarchy;
window.initGalaxy = initGalaxy;
