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
