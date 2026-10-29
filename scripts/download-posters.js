/*
 * Downloads a real poster for every movie into /public/posters and points each
 * movie at it in src/data/movies.js.
 *
 *   1. Put your free TMDB key in a .env file:  VITE_TMDB_API_KEY=your_key
 *   2. Run:  npm run posters:download
 *
 * Needs Node 18 or newer (for the built-in fetch). Movies that cannot be found
 * keep their current image.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { movies } from "../src/data/movies.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "posters");
const MOVIES_FILE = join(ROOT, "src", "data", "movies.js");

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function readKey() {
  if (process.env.VITE_TMDB_API_KEY) return process.env.VITE_TMDB_API_KEY.trim();
  const envFile = join(ROOT, ".env");
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, "utf8").split(/\r?\n/).find((l) => l.trim().startsWith("VITE_TMDB_API_KEY"));
    if (line) return line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const KEY = readKey();
if (!KEY || KEY.includes("your_tmdb_api_key")) {
  console.error("No TMDB API key found.");
  console.error("Create a file named .env next to package.json containing:");
  console.error("  VITE_TMDB_API_KEY=paste_your_key_here");
  process.exit(1);
}

const isToken = KEY.length > 40; // v4 read token vs v3 key

async function api(path, params) {
  const url = new URL("https://api.themoviedb.org/3" + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const headers = { accept: "application/json" };
  if (isToken) headers.Authorization = `Bearer ${KEY}`;
  else url.searchParams.set("api_key", KEY);
  const res = await fetch(url, { headers });
  if (res.status === 401) throw new Error("TMDB rejected the API key. Check your .env file.");
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return res.json();
}

mkdirSync(OUT, { recursive: true });
let source = readFileSync(MOVIES_FILE, "utf8");
const failed = [];
let saved = 0;

for (const m of movies) {
  const name = slug(m.title);
  const file = join(OUT, `${name}.jpg`);
  try {
    if (!existsSync(file)) {
      const data = await api("/search/movie", { query: m.title, year: m.year, include_adult: "false" });
      const hit = data.results && data.results.find((r) => r.poster_path);
      if (!hit) throw new Error("no poster found");

      const img = await fetch(`https://image.tmdb.org/t/p/w500${hit.poster_path}`);
      if (!img.ok) throw new Error(`image download failed (${img.status})`);
      writeFileSync(file, Buffer.from(await img.arrayBuffer()));
    }

    // Point the movie at the downloaded image.
    const from = `poster: "/posters/${name}.svg"`;
    if (source.includes(from)) source = source.replace(from, `poster: "/posters/${name}.jpg"`);

    saved++;
    console.log(`ok       ${m.title}`);
  } catch (e) {
    failed.push(m.title);
    console.log(`skipped  ${m.title}: ${e.message}`);
    if (e.message.includes("rejected the API key")) break;
  }
}

writeFileSync(MOVIES_FILE, source);
console.log(`\nDone: ${saved} posters ready, ${failed.length} skipped.`);
if (saved > 0) console.log("Restart the dev server (Ctrl+C, then npm run dev) to see them.");
if (failed.length) console.log("Skipped:", failed.join(", "));
console.log("\nThese posters come from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.");
