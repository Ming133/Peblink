import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);

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
  assert.match(css, /\.overview-pollution-feature>\.overview-feature-tooltip\{[^}]*rotate\(-8deg\)/);
  assert.match(css, /\.overview-farm-feature>\.overview-feature-tooltip\{[^}]*rotate\(8deg\)/);
  assert.match(css, /\.overview-river-feature:hover[\s\S]*?\.overview-alert-marker:focus-visible\{z-index:60\}/);
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

test("provides English, French and Chinese across the dashboard", async () => {
  const [page, i18n, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useState<Locale>\("en"\)/);
  assert.match(page, /useDocumentTranslation\(locale\)/);
  assert.match(page, /className="language-switcher"/);
  assert.match(page, /localeOptions\.map/);
  assert.match(i18n, /code: "en"[\s\S]*code: "fr"[\s\S]*code: "zh"/);
  assert.match(i18n, /Tableau de bord national du renseignement minier/);
  assert.match(i18n, /国家矿产信息仪表板/);
  assert.match(i18n, /Renseignement sur l’exploration des minéraux critiques/);
  assert.match(i18n, /关键矿产勘探信息/);
  assert.match(i18n, /Points d’échantillonnage/);
  assert.match(i18n, /采样点/);
  assert.match(i18n, /Statut de l’enquête/);
  assert.match(i18n, /调查状态/);
  assert.match(i18n, /Risque de pluie et de ruissellement/);
  assert.match(i18n, /降雨与径流风险/);
  assert.match(i18n, /MutationObserver/);
  assert.match(i18n, /attributeFilter: \[\.\.\.translatedAttributes\]/);
  assert.match(css, /\.language-switcher>div button\.active/);
});

test("keeps the English source while switching through multiple languages", async () => {
  const source = await readFile(new URL("../app/i18n.ts", import.meta.url), "utf8");
  const ts = require("typescript");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const localModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(require, localModule, localModule.exports);
  const { advanceTranslation } = localModule.exports;

  let memory;
  let current = "National Overview";
  ({ memory, value: current } = advanceTranslation(memory, current, "en"));
  assert.equal(current, "National Overview");
  ({ memory, value: current } = advanceTranslation(memory, current, "fr"));
  assert.equal(current, "Vue d’ensemble nationale");
  ({ memory, value: current } = advanceTranslation(memory, current, "zh"));
  assert.equal(current, "全国概览");
  ({ memory, value: current } = advanceTranslation(memory, current, "en"));
  assert.equal(current, "National Overview");

  current = "Evidence layers";
  ({ memory, value: current } = advanceTranslation(memory, current, "zh"));
  assert.equal(current, "证据图层");
});

test("completes the environment-only monitoring workspace", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function EnvironmentModule/);
  assert.match(page, /page==="environment" && <EnvironmentModule/);
  assert.match(page, /NATIONAL ENVIRONMENTAL MONITORING/);
  assert.match(page, /Mining, water, farmland & pollution exposure map/);
  assert.match(page, /<OverviewRiskMap environmentalMode \/>/);
  assert.match(page, /const environmentLayerOptions/);
  assert.match(page, /Sampling points/);
  assert.match(page, /Flow direction/);
  assert.match(page, /Sensitive areas/);
  assert.match(page, /Site boundaries/);
  assert.match(page, /Rainfall & runoff/);
  assert.match(page, /const environmentAdvancedMapData/);
  assert.match(page, /Rio Nunez Water Station WQ-BK-04/);
  assert.match(page, /Kamsar Drinking-water Intake/);
  assert.match(page, /Kankan Tailings Facility Boundary/);
  assert.match(page, /Boké 72-hour Runoff Hotspot/);
  assert.match(page, /environmentTimeOptions/);
  assert.match(page, /investigationStatuses/);
  assert.match(page, /const selectFeature = \(feature: OverviewMapFeature\)/);
  assert.match(page, /if \(current\?\.id === feature\.id\)[\s\S]*?setDismissedFeatureId\(feature\.id\)[\s\S]*?return null/);
  assert.match(page, /target\.closest\("\[data-map-feature='true'\], \.overview-zoom-tools, \.overview-map-legend, \.overview-demo-badge"\)/);
  assert.match(page, /data-map-feature="true"/);
  assert.match(page, /map-feature-dismissed/);
  assert.match(page, /aria-pressed=\{isSelected\(feature\)\}/);
  assert.match(page, /Risk<\/strong> \{feature\.risk\}/);
  assert.match(page, /Confidence<\/strong> \{feature\.confidence\}/);
  assert.match(page, /Environmental alerts requiring action/);
  assert.match(page, /From alert to verified conclusion/);
  assert.match(page, /Permits, inspections and monitoring records/);
  assert.match(page, /className="overview-alert-glyph"/);
  assert.match(page, /kind=\{page==="exploration" \? "exploration" : page==="environment" \? "environment" : "record"\}/);
  const environmentBlock = page.match(/function EnvironmentModule[\s\S]*?\n}\n\ntype ExplorationReadout/)?.[0] ?? "";
  assert.doesNotMatch(environmentBlock, /Community commitments|Resettlement cases|Local employment|Environmental & Social/);
  assert.match(css, /Environmental Monitoring — Environment 1 dedicated monitoring workspace/);
  assert.match(css, /\.overview-alert-glyph\{[^}]*transform:rotate\(45deg\)/);
  assert.match(css, /\.environmental-command-grid/);
  assert.match(css, /\.environmental-action-panel/);
  assert.match(css, /\.environmental-workflow-card/);
  assert.match(css, /\.environment-map-context-controls/);
  assert.match(css, /\.environment-samples-feature/);
  assert.match(css, /\.environment-flow-feature/);
  assert.match(css, /\.environment-receptors-feature/);
  assert.match(css, /\.environment-boundaries-feature/);
  assert.match(css, /\.environment-rainfall-feature/);
  assert.match(css, /\.map-feature-selected>\.overview-feature-tooltip/);
  assert.match(css, /\.map-feature-dismissed:hover>\.overview-feature-tooltip[^{]*\{opacity:0!important;visibility:hidden!important\}/);
  assert.match(css, /:has\(\.map-feature-selected\) \.overview-map-canvas\{z-index:30\}/);
  assert.match(css, /@media\(max-width:800px\).*\.environmental-workflow-card/s);

  const environmentLayerOptions = page.match(/const environmentLayerOptions[\s\S]*?\n\];/)?.[0] ?? "";
  assert.doesNotMatch(environmentLayerOptions, /watersheds|Watersheds/);
  assert.match(page, /watersheds: false/);
  assert.doesNotMatch(page, /layers\.watersheds && visibleAdvancedFeatures\("watersheds"\)/);
  assert.doesNotMatch(page, /legend-watershed" \/> Watershed/);
  assert.match(page, /Interactive layers <b>10<\/b>/);
});

test("lets content cards grow without clipping translated or zoomed text", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const resilienceRules = css.match(/Content-height resilience[\s\S]*$/)?.[0] ?? "";

  assert.match(resilienceRules, /\.module-kpis article\{height:auto;min-height:96px/);
  assert.match(resilienceRules, /\.license-stats article\{height:auto;min-height:78px/);
  assert.match(resilienceRules, /\.module-main>article\{height:auto;min-height:385px/);
  assert.match(resilienceRules, /\.exploration-summary-grid-v2>article\{height:auto;min-height:365px/);
  assert.match(resilienceRules, /\.environmental-workflow-card,\.environmental-obligations-card\{height:auto;min-height:250px/);
  assert.match(resilienceRules, /\.environmental-obligations-card>div:last-child>span\{min-height:42px/);
  assert.match(resilienceRules, /@media\(max-width:800px\)\{\.environmental-workflow-card\{min-height:500px\}/);
});

test("keeps collapsed navigation identifiable and lets every map expand", async () => {
  const [page, css, i18n] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /className="nav-label"/);
  assert.match(css, /\.sidebar\.collapsed nav button \.nav-label\{display:none\}/);
  assert.match(css, /\.sidebar\.collapsed nav button\.active\{background:transparent/);
  assert.match(page, /function useMapExpansion/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /function MapExpandButton/);
  assert.equal((page.match(/<MapExpandButton/g) || []).length, 3);
  assert.match(page, /map-visual map-expand-surface/);
  assert.match(page, /overview-risk-map map-expand-surface/);
  assert.match(page, /exploration-map-workspace map-expand-surface/);
  assert.match(css, /\.map-expand-surface\.map-expanded\{position:fixed!important/);
  assert.match(i18n, /\["Expand map", "Agrandir la carte", "放大地图"\]/);
  assert.match(i18n, /\["Exit expanded view", "Quitter la vue agrandie", "退出放大视图"\]/);
});
