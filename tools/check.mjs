// Build check: every page in public/ must keep the rules in CORE.md that a
// script can see. Run by Cloudflare before each deploy (wrangler.jsonc).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public";
const failures = [];

function pages(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? pages(p) : p.endsWith(".html") ? [p] : [];
  });
}

const required = [
  [/<meta name="robots" content="noindex">/, "robots noindex meta"],
  [/<title>[^<]+<\/title>/, "title"],
  [/<meta name="description" content="[^"]+">/, "meta description"],
  [/<meta property="og:title" content="[^"]+">/, "og:title"],
  [/<meta property="og:description" content="[^"]+">/, "og:description"],
  [/<meta property="og:image" content="https:\/\/unreasonable-error\.unpromptedworks\.com\/[^"]+">/, "og:image on the site's subdomain"],
  [/href="https:\/\/unpromptedworks\.com\/#about"/, "link to unpromptedworks.com/#about"],
  [/<link rel="icon"/, "favicon link"],
];

for (const page of pages(ROOT)) {
  const html = readFileSync(page, "utf8");
  for (const [re, what] of required) if (!re.test(html)) failures.push(`${page}: missing ${what}`);
  if (/<script[^>]+src="https?:/.test(html)) failures.push(`${page}: third-party script`);
  if (/<link[^>]+href="https?:\/\/(?!unpromptedworks)/.test(html)) failures.push(`${page}: external stylesheet or link tag`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    let target = join(ROOT, m[1]);
    if (m[1].endsWith("/")) target = join(target, "index.html");
    if (!existsSync(target)) failures.push(`${page}: broken local link ${m[1]}`);
  }
}

const headers = existsSync(join(ROOT, "_headers")) ? readFileSync(join(ROOT, "_headers"), "utf8") : "";
if (!/X-Robots-Tag: noindex/.test(headers)) failures.push("public/_headers: missing X-Robots-Tag: noindex");
for (const f of ["favicon.svg", "og.png"]) if (!existsSync(join(ROOT, f))) failures.push(`public/${f}: missing`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`check passed: ${pages(ROOT).length} pages`);
