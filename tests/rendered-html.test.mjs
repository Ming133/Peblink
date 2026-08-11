import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the National Overview environmental map", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>National Mineral Intelligence Dashboard — Republic of Guinea<\/title>/i);
  assert.match(html, /Mining, farmland, rivers &amp; potential pollution/i);
  assert.match(html, /aria-label="Map layer filters"/i);
  assert.match(html, /aria-pressed="true"[^>]*>.*Mines/i);
  assert.match(html, /aria-pressed="true"[^>]*>.*Farmland/i);
  assert.match(html, /aria-pressed="true"[^>]*>.*Rivers/i);
  assert.match(html, /DEMONSTRATION MAP/i);
  assert.match(html, /North Ridge Bauxite Mine/i);
  assert.match(html, /Konkouré River/i);
  assert.match(html, /Kamsar Rice Fields/i);
  assert.match(html, /Boké Runoff Watch Zone/i);
  assert.match(html, /10\.84° N, 14\.11° W/i);
  assert.match(html, /Potential contamination alerts/i);
  assert.match(html, /They are not real environmental findings/i);
});

test("keeps the map interactions and responsive styles in the Overview module", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type OverviewLayer = "mines" \| "farms" \| "rivers" \| "pollution" \| "alerts"/);
  assert.match(page, /aria-pressed=\{layers\[option\.id\]\}/);
  assert.match(page, /setAllLayers\(true\)/);
  assert.match(page, /setAllLayers\(false\)/);
  assert.match(page, /Math\.min\(2, Math\.max\(0\.8/);
  assert.match(page, /onMouseEnter=\{\(\) => focusFeature\(feature\)\}/);
  assert.match(page, /aria-live="polite"/);
  assert.match(css, /\.overview-intelligence-grid/);
  assert.match(css, /\.overview-feature-tooltip/);
  assert.match(css, /@keyframes pollution-pulse/);
  assert.match(css, /@media\(max-width:800px\).*\.overview-risk-map/s);
});

test("implements the expert-aligned interactive Exploration Intelligence workspace", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function InteractiveExplorationMap/);
  assert.match(page, /function EvidenceHoverCard/);
  assert.match(page, /const explorationLayerExampleSeeds/);
  const exampleSeedBlock = page.match(/const explorationLayerExampleSeeds:[\s\S]*?= \[([\s\S]*?)\n\];/);
  assert.ok(exampleSeedBlock, "layer example seed data should exist");
  assert.equal((exampleSeedBlock[1].match(/\["/g) ?? []).length, 46);
  assert.match(page, /const currentReadout = hovered \|\| selectedEvidence/);
  assert.match(page, /setSelectedEvidence\(\{ \.\.\.example/);
  assert.match(page, /visibleLayerExamples\.map/);
  assert.match(page, /SELECTED TARGET AREA/);
  assert.match(page, /currently selected exploration target area/);
  assert.match(page, /function ExplorationV2/);
  assert.match(page, /function ExplorationCompareModal/);
  assert.match(page, /role="dialog" aria-modal="true"/);
  assert.match(page, /Choose Area \{index === 0 \? "A" : "B"\}/);
  assert.match(page, /Compare two exploration areas/);
  assert.match(page, /setShowCompareModal\(true\)/);
  assert.match(page, /Environmental constraints/);
  assert.match(page, /Recommended next action/);
  assert.match(page, /const explorationLayerGroups/);
  assert.match(page, /selectedCommodities/);
  assert.match(page, /aria-pressed=\{selectedTargetId === target\.id\}/);
  assert.match(page, /Math\.min\(target\.x \+ 10, 90\)/);
  assert.match(page, /Math\.min\(target\.y \+ 7 \+ index, 90\)/);
  assert.match(page, /Math\.min\(2, Math\.max\(0\.8/);
  assert.match(page, /localStorage\.setItem\("peblink-exploration-view"/);
  assert.match(page, /window\.print\(\)/);
  assert.match(page, /canvas\.toBlob/);
  assert.match(page, /Basemap: \{basemap\}/);
  assert.match(page, /national-exploration-evidence-map\.png/);
  assert.match(page, /Five-part evidence summary/);
  assert.match(page, /Areas Requiring Further Evaluation/);
  assert.match(page, /Data Sources & Metadata/);
  assert.match(page, /do not confirm the existence of an economically viable mineral deposit/);
  assert.match(css, /\.exploration-workspace-v2/);
  assert.match(css, /\.exploration-layer-drawer/);
  assert.match(css, /\.exploration-target-panel-v2/);
  assert.match(css, /\.exploration-drill-v2\{z-index:14\}/);
  assert.match(css, /\.exploration-evidence-example/);
  assert.match(css, /\.exploration-floating-tooltip/);
  assert.match(css, /visibility:hidden/);
  assert.match(css, /\.exploration-target-v2\.selected>\.exploration-floating-tooltip\{background:#183a55/);
  assert.match(css, /\.exploration-compare-overlay/);
  assert.match(css, /\.exploration-compare-modal/);
  assert.match(css, /\.exploration-compare-grid/);
  assert.match(css, /@media\(max-width:900px\).*\.exploration-workspace-v2/s);
});
