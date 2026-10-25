// Renders tools/og.html to public/og.png (1200×630). Run by hand: node tools/og.cjs
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto("file://" + path.resolve(__dirname, "og.html"));
  await p.screenshot({ path: path.resolve(__dirname, "../public/og.png") });
  await b.close();
})();
