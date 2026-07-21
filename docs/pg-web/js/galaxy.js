// Hierarchical 2D "Galaxy" visualization with zoom levels

let currentGalaxyNode = null;
let galaxySvg = null;
let galaxyZoom = null;
let galaxyG = null;

function initGalaxy() {
  const container = document.getElementById("galaxy-canvas");
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || (window.innerHeight - 56);

  container.innerHTML = "";
  galaxySvg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  // Background stars
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
    document.getElementById("galaxy-panel").classList.add("hidden");
  });

  // Attach parents for navigation
  function attachParents(node, parent = null) {
    node.parent = parent;
    (node.children || []).forEach(c => attachParents(c, node));
  }
  attachParents(GALAXY_HIERARCHY);

  currentGalaxyNode = GALAXY_HIERARCHY;
  renderGalaxyLevel(GALAXY_HIERARCHY);

  window.addEventListener("resize", () => {
    // Simple re-init on resize for now
    if (document.getElementById("section-galaxy") && !document.getElementById("section-galaxy").classList.contains("hidden")) {
      initGalaxy();
    }
  });
}

function renderGalaxyLevel(node) {
  currentGalaxyNode = node;
  const breadcrumb = document.getElementById("galaxy-breadcrumb");
  // Build path
  const path = [];
  let cur = node;
  while (cur) {
    path.unshift(cur.name);
    cur = cur.parent;
  }
  breadcrumb.textContent = path.join(" › ");

  const width = galaxySvg.attr("width");
  const height = galaxySvg.attr("height");
  galaxyG.selectAll("*").remove();

  const children = node.children || [];
  const entityList = (typeof ENTITIES !== "undefined" && ENTITIES) ? ENTITIES : (window.ENTITIES || []);
  const entities = (node.entities || []).map(id => entityList.find(e => e.id === id)).filter(Boolean);

  // If leaf-ish (has entities and few/no children), show entity dots
  if (entities.length > 0 && children.length === 0) {
    renderEntities(entities, width, height);
    return;
  }

  // Otherwise render clusters as large circles
  const n = Math.max(children.length, 1);
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cellW = width / (cols + 0.5);
  const cellH = height / (rows + 0.5);
  const radius = Math.min(cellW, cellH) * 0.32;

  children.forEach((child, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = cellW * (col + 0.75);
    const cy = cellH * (row + 0.7);

    const g = galaxyG.append("g")
      .attr("transform", `translate(${cx},${cy})`)
      .style("cursor", "pointer")
      .on("click", (event) => {
        event.stopPropagation();
        // Zoom into this cluster
        renderGalaxyLevel(child);
        // Optional: animate zoom toward it
        galaxySvg.transition().duration(600).call(
          galaxyZoom.transform,
          d3.zoomIdentity.translate(width/2, height/2).scale(1.4).translate(-cx, -cy)
        );
      });

    // Glow
    g.append("circle")
      .attr("r", radius + 12)
      .attr("fill", child.color || "#6366f1")
      .attr("opacity", 0.15);

    g.append("circle")
      .attr("class", "cluster-bg")
      .attr("r", radius)
      .attr("fill", child.color || "#6366f1")
      .attr("opacity", 0.55)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4);

    // Count badge
    const count = countEntities(child);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -4)
      .attr("class", "cluster-label")
      .attr("font-size", 14)
      .text(child.name);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 16)
      .attr("fill", "#cbd5e1")
      .attr("font-size", 11)
      .text(`${count} entities`);
  });

  // Also show any direct entities on this level as smaller dots
  if (entities.length) {
    entities.forEach((e, i) => {
      const angle = (i / entities.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.38;
      const cx = width/2 + Math.cos(angle) * r;
      const cy = height/2 + Math.sin(angle) * r;
      drawEntityDot(galaxyG, e, cx, cy, 8);
    });
  }
}

function countEntities(node) {
  let c = (node.entities || []).length;
  (node.children || []).forEach(ch => c += countEntities(ch));
  return c;
}

function renderEntities(entities, width, height) {
  // Simple force or grid layout for entities at leaf level
  const cols = Math.ceil(Math.sqrt(entities.length));
  const cell = Math.min(width, height) / (cols + 1.5);

  entities.forEach((e, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = cell * (col + 1.2);
    const cy = cell * (row + 1.3);
    drawEntityDot(galaxyG, e, cx, cy, 14, true);
  });
}

function drawEntityDot(parent, entity, cx, cy, r, withLabel = false) {
  const color = scoreToColor(entity.scores["1A"]);
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
      .attr("dy", r + 14)
      .attr("fill", "#e2e8f0")
      .attr("font-size", 11)
      .text(entity.name.length > 28 ? entity.name.slice(0, 26) + "…" : entity.name);
  }

  // Tooltip title
  g.append("title").text(`${entity.name}\n1A: ${entity.scores["1A"] ?? "—"}\n${entity.ideology || ""}`);
}

function scoreToColor(score) {
  if (score == null) return "#64748b";
  // Low autonomy (authoritarian) → red; high → green/blue
  if (score < 20) return "#ef4444";
  if (score < 40) return "#f97316";
  if (score < 55) return "#eab308";
  if (score < 70) return "#22c55e";
  return "#3b82f6";
}

function showGalaxyPanel(entity) {
  const panel = document.getElementById("galaxy-panel");
  const content = document.getElementById("panel-content");
  panel.classList.remove("hidden");

  const scoresHtml = SLIDER_META.map(s => {
    const v = entity.scores[s.id];
    const bar = v != null
      ? `<div class="h-1.5 bg-slate-700 rounded mt-0.5"><div class="h-full bg-indigo-500 rounded" style="width:${v}%"></div></div>`
      : `<div class="text-xs text-slate-500">not scored</div>`;
    return `<div class="mb-2">
      <div class="flex justify-between text-xs"><span>${s.short}</span><span class="font-mono text-indigo-300">${v ?? "—"}</span></div>
      ${bar}
    </div>`;
  }).join("");

  content.innerHTML = `
    <h3 class="font-semibold text-lg pr-6">${entity.name}</h3>
    <div class="text-xs text-slate-400 mt-1">${entity.type} · ${entity.country || ""} · ${entity.era || ""}</div>
    <div class="text-sm text-indigo-300 mt-1">${entity.ideology || ""}</div>
    <p class="text-sm text-slate-300 mt-3 leading-relaxed">${entity.summary || ""}</p>
    <h4 class="font-medium text-sm mt-4 mb-2 text-slate-200">Scores</h4>
    ${scoresHtml}
    <button onclick="showEntityDetail('${entity.id}')" class="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm">
      Open full Detail →
    </button>
  `;
}
