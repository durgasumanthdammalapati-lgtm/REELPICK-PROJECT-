/*
 * Generates one poster image (SVG) per movie into /public/posters.
 *   npm run posters
 * Movies without a hand-tuned style below still get a poster (colors and
 * artwork are picked automatically), so adding a movie never breaks anything.
 * To use a real image instead, put a .jpg/.png in /public/posters and change
 * the movie's `poster` path in src/data/movies.js.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { movies } from "../src/data/movies.js";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "posters");
mkdirSync(OUT, { recursive: true });

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Small seeded random generator so a poster looks the same every time.
function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const star = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 ? r : R;
    return `${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`;
  }).join(" ");

// ---- Artwork motifs. Each draws inside a 600 x 640 area. ----
const motifs = {
  bars: (c) =>
    `<circle cx="300" cy="270" r="190" fill="${c.a}" opacity=".22"/><circle cx="300" cy="270" r="120" fill="${c.a}" opacity=".85"/>` +
    [...Array(8)].map((_, i) => `<rect x="${70 + i * 66}" y="0" width="16" height="640" fill="${c.bg1}" opacity=".92"/>`).join("") +
    `<rect x="0" y="300" width="600" height="14" fill="${c.bg1}" opacity=".9"/>`,

  rose: (c) => {
    let s = "";
    for (let i = 0; i < 8; i++) {
      const ang = i * 45;
      const x = 300 + Math.cos((ang * Math.PI) / 180) * 105;
      const y = 300 + Math.sin((ang * Math.PI) / 180) * 105;
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="88" ry="52" fill="${c.a}" opacity=".55" transform="rotate(${ang} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    for (let i = 0; i < 6; i++) s += `<circle cx="300" cy="300" r="${150 - i * 24}" fill="none" stroke="${i % 2 ? c.b : c.a}" stroke-width="${10 - i}" opacity=".85"/>`;
    return s + `<circle cx="300" cy="300" r="24" fill="${c.bg1}"/>`;
  },

  skyline: (c, r) => {
    let x = -10, s = `<circle cx="430" cy="170" r="80" fill="${c.a}" opacity=".9"/>`;
    while (x < 600) {
      const w = 40 + r() * 50, h = 170 + r() * 300;
      s += `<rect x="${x.toFixed(0)}" y="${(640 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#04060c"/>`;
      for (let wy = 640 - h + 16; wy < 625; wy += 26)
        for (let wx = x + 8; wx < x + w - 10; wx += 16)
          if (r() < 0.28) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="11" fill="${c.a}" opacity=".85"/>`;
      x += w + 4;
    }
    return s;
  },

  rings: (c) =>
    [...Array(9)].map((_, i) => {
      const s = 500 - i * 52;
      return `<rect x="${300 - s / 2}" y="${300 - s / 2}" width="${s}" height="${s}" rx="${12 + i * 3}" fill="none" stroke="${i % 2 ? c.b : c.a}" stroke-width="5" opacity="${(0.95 - i * 0.08).toFixed(2)}" transform="rotate(${i * 9} 300 300)"/>`;
    }).join(""),

  planet: (c, r) => {
    let s = "";
    for (let i = 0; i < 70; i++) s += `<circle cx="${(r() * 600).toFixed(0)}" cy="${(r() * 640).toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
    return s +
      `<defs><radialGradient id="pg" cx="35%" cy="30%"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></radialGradient></defs>` +
      `<circle cx="300" cy="320" r="160" fill="url(#pg)"/>` +
      `<ellipse cx="300" cy="320" rx="285" ry="58" fill="none" stroke="${c.a}" stroke-width="9" opacity=".85" transform="rotate(-18 300 320)"/>` +
      `<circle cx="520" cy="130" r="9" fill="#fff"/>`;
  },

  rain: (c, r) => {
    let s = "";
    for (let col = 0; col < 20; col++) {
      const x = 14 + col * 30;
      let y = -r() * 200;
      while (y < 640) {
        const h = 14 + r() * 40, gap = 10 + r() * 30;
        s += `<rect x="${x}" y="${y.toFixed(0)}" width="12" height="${h.toFixed(0)}" rx="2" fill="${c.a}" opacity="${(0.15 + r() * 0.6).toFixed(2)}"/>`;
        y += h + gap;
      }
      s += `<rect x="${x}" y="${(300 + r() * 300).toFixed(0)}" width="12" height="18" rx="2" fill="#d8ffe8"/>`;
    }
    return s;
  },

  checker: (c) => {
    let s = `<circle cx="300" cy="200" r="130" fill="${c.a}"/><rect x="170" y="190" width="260" height="14" fill="${c.bg1}"/>`;
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 8; col++)
        if ((row + col) % 2 === 0) s += `<rect x="${col * 75}" y="${340 + row * 75}" width="75" height="75" fill="${c.a}" opacity=".9"/>`;
    return s;
  },

  feather: (c) => {
    let s = `<path d="M300 60 C420 180 430 380 300 600 C170 380 180 180 300 60Z" fill="${c.a}" opacity=".95"/>`;
    for (let i = 0; i < 14; i++) {
      const y = 150 + i * 30, w = 62 - Math.abs(i - 6) * 5;
      s += `<path d="M300 ${y} L${300 - w} ${y - 30} M300 ${y} L${300 + w} ${y - 30}" stroke="${c.b}" stroke-width="3" opacity=".55" fill="none"/>`;
    }
    return s + `<path d="M300 90 L300 610" stroke="${c.b}" stroke-width="5"/>` +
      [0, 1, 2, 3, 4].map((i) => `<circle cx="${90 + i * 110}" cy="${560 - (i % 2) * 40}" r="${4 + (i % 3)}" fill="${c.a}" opacity=".7"/>`).join("");
  },

  split: (c) =>
    `<polygon points="0,0 360,0 240,640 0,640" fill="${c.a}" opacity=".9"/><polygon points="360,0 600,0 600,640 240,640" fill="${c.bg1}" opacity=".6"/>` +
    `<circle cx="300" cy="320" r="120" fill="${c.b}"/><circle cx="300" cy="320" r="120" fill="none" stroke="#fff" stroke-width="6"/>` +
    `<path d="M180 320 H420" stroke="${c.bg1}" stroke-width="10"/>`,

  stairs: (c) => {
    let s = `<rect x="380" y="50" width="150" height="110" fill="${c.a}" opacity=".95"/><path d="M455 50V160M380 105H530" stroke="${c.bg1}" stroke-width="6"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${i * 70}" y="${150 + i * 60}" width="${600 - i * 70}" height="${640 - (150 + i * 60)}" fill="${i % 2 ? c.a : c.b}" opacity="${(0.35 + i * 0.07).toFixed(2)}"/>`;
    return s;
  },

  lanterns: (c, r) => {
    let s = `<circle cx="300" cy="230" r="170" fill="${c.b}" opacity=".9"/>`;
    for (let i = 0; i < 7; i++) {
      const x = 60 + i * 80 + ((r() * 20) | 0), y = 140 + r() * 260;
      s += `<line x1="${x}" y1="0" x2="${x}" y2="${y.toFixed(0)}" stroke="${c.a}" opacity=".5" stroke-width="2"/><ellipse cx="${x}" cy="${(y + 28).toFixed(0)}" rx="26" ry="36" fill="${c.a}"/><rect x="${x - 14}" y="${(y - 4).toFixed(0)}" width="28" height="8" fill="${c.bg1}"/>`;
    }
    return s + `<path d="M0 640 V540 L90 500 L120 540 L200 470 L260 520 L340 450 L430 520 L500 480 L600 540 V640Z" fill="${c.bg1}"/>`;
  },

  clouds: (c) => {
    const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c.a}"><circle cx="0" cy="0" r="46"/><circle cx="50" cy="-22" r="58"/><circle cx="110" cy="0" r="46"/><rect x="0" y="0" width="110" height="46"/></g>`;
    return cloud(50, 150, 1.2) + cloud(330, 70, 0.9) + cloud(260, 330, 1.3) + cloud(20, 500, 1) +
      `<polygon points="${star(480, 470, 70, 30)}" fill="${c.b}"/>`;
  },

  savanna: (c) =>
    `<circle cx="300" cy="260" r="170" fill="${c.a}"/><path d="M0 560 Q150 520 300 550 T600 540 V640 H0Z" fill="${c.bg1}"/>` +
    `<path d="M300 560 V400 M300 440 L360 380 M300 470 L240 400" stroke="${c.bg1}" stroke-width="10" fill="none"/>` +
    `<ellipse cx="300" cy="370" rx="150" ry="32" fill="${c.bg1}"/><ellipse cx="380" cy="400" rx="90" ry="22" fill="${c.bg1}"/>`,

  burst: (c) => {
    let s = "";
    for (let i = 0; i < 28; i++) {
      const a1 = (i * Math.PI * 2) / 28, a2 = a1 + Math.PI / 28;
      s += `<polygon points="300,320 ${(300 + Math.cos(a1) * 700).toFixed(0)},${(320 + Math.sin(a1) * 700).toFixed(0)} ${(300 + Math.cos(a2) * 700).toFixed(0)},${(320 + Math.sin(a2) * 700).toFixed(0)}" fill="${i % 2 ? c.a : c.b}" opacity=".28"/>`;
    }
    return s + `<circle cx="300" cy="320" r="120" fill="${c.a}"/><circle cx="300" cy="320" r="86" fill="${c.bg0}"/><circle cx="300" cy="320" r="46" fill="${c.b}"/>`;
  },

  arches: (c) => {
    let s = `<circle cx="300" cy="170" r="110" fill="${c.a}" opacity=".9"/><rect x="0" y="250" width="600" height="390" fill="${c.bg1}" opacity=".85"/>`;
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 5; i++) {
        const x = 30 + i * 112, y = 290 + row * 170;
        s += `<path d="M${x} ${y + 130} V${y + 50} A44 44 0 0 1 ${x + 88} ${y + 50} V${y + 130}Z" fill="${c.a}" opacity="${row ? 0.55 : 0.8}"/>`;
      }
    return s;
  },

  waves: (c) => {
    let s = `<circle cx="440" cy="170" r="90" fill="${c.a}" opacity=".9"/>`;
    for (let k = 0; k < 6; k++) {
      const base = 330 + k * 52;
      let d = `M0 ${base}`;
      for (let x = 0; x <= 600; x += 20) d += ` L${x} ${(base + Math.sin((x / 600) * Math.PI * 4 + k) * 16).toFixed(1)}`;
      s += `<path d="${d} L600 640 L0 640Z" fill="${k % 2 ? c.b : c.bg1}" opacity="${(0.5 + k * 0.08).toFixed(2)}"/>`;
    }
    return s + `<path d="M110 332 H250 L230 354 H130Z M150 332 V292 H210 V332 M165 292 V262 M195 292 V262" fill="${c.bg1}" stroke="${c.bg1}" stroke-width="6" stroke-linejoin="round"/>`;
  },

  equalizer: (c, r) => {
    let s = "";
    for (let i = 0; i < 14; i++) {
      const h = 80 + r() * 420;
      s += `<rect x="${20 + i * 40}" y="${(620 - h).toFixed(0)}" width="28" height="${h.toFixed(0)}" rx="4" fill="${i % 3 ? c.a : c.b}" opacity=".9"/>`;
    }
    return s + `<ellipse cx="450" cy="130" rx="110" ry="14" fill="${c.b}"/><path d="M450 144 V330" stroke="${c.b}" stroke-width="6"/>`;
  },

  sunset: (c, r) => {
    let s = `<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></linearGradient></defs><circle cx="300" cy="320" r="190" fill="url(#sg)"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="100" y="${360 + i * 28}" width="400" height="${4 + i * 3}" fill="${c.bg0}"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 600).toFixed(0)}" cy="${(r() * 220).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
    return s + `<rect x="0" y="560" width="600" height="80" fill="${c.bg1}"/>`;
  },

  eye: (c) =>
    `<path d="M40 320 Q300 90 560 320 Q300 550 40 320Z" fill="${c.bg1}" stroke="${c.a}" stroke-width="8"/><circle cx="300" cy="320" r="108" fill="${c.b}"/>` +
    `<circle cx="300" cy="320" r="52" fill="#050505"/><circle cx="326" cy="296" r="16" fill="#fff" opacity=".85"/>` +
    `<path d="M300 440 C270 500 270 540 300 570 C330 540 330 500 300 440Z" fill="${c.a}" opacity=".85"/>`,

  dunes: (c) =>
    `<circle cx="300" cy="260" r="150" fill="${c.a}"/><path d="M0 430 Q150 360 300 420 T600 400 V640 H0Z" fill="${c.bg1}" opacity=".7"/>` +
    `<path d="M0 500 Q200 430 380 500 T600 470 V640 H0Z" fill="${c.bg1}" opacity=".9"/><path d="M270 640 L295 470 H305 L330 640Z" fill="${c.a}" opacity=".35"/>` +
    [0, 1, 2].map((i) => `<rect x="296" y="${500 + i * 50}" width="8" height="${24 + i * 10}" fill="${c.a}"/>`).join(""),

  marigold: (c) => {
    const flower = (x, y, R, col) => {
      let s = "";
      for (let i = 0; i < 12; i++) s += `<ellipse cx="${x}" cy="${(y - R * 0.62).toFixed(1)}" rx="${(R * 0.26).toFixed(1)}" ry="${(R * 0.42).toFixed(1)}" fill="${col}" transform="rotate(${i * 30} ${x} ${y})" opacity=".92"/>`;
      return s + `<circle cx="${x}" cy="${y}" r="${(R * 0.28).toFixed(1)}" fill="${c.bg0}"/>`;
    };
    return flower(300, 270, 170, c.a) + flower(110, 520, 90, c.b) + flower(500, 540, 100, c.b) + flower(520, 120, 70, c.a);
  },

  lightbulb: (c) => {
    let s = "";
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI * 2) / 14;
      s += `<line x1="${(300 + Math.cos(a) * 190).toFixed(0)}" y1="${(280 + Math.sin(a) * 190).toFixed(0)}" x2="${(300 + Math.cos(a) * 250).toFixed(0)}" y2="${(280 + Math.sin(a) * 250).toFixed(0)}" stroke="${c.a}" stroke-width="8" stroke-linecap="round" opacity=".8"/>`;
    }
    return s + `<circle cx="300" cy="280" r="140" fill="${c.a}"/><path d="M250 420 H350 V470 H250Z" fill="${c.b}"/><rect x="262" y="478" width="76" height="16" rx="6" fill="${c.b}"/>` +
      `<path d="M262 300 L282 250 L300 300 L318 250 L338 300" fill="none" stroke="${c.bg1}" stroke-width="6" stroke-linejoin="round"/>`;
  },

  sevens: (c, r) => {
    let s = `<polygon points="260,0 340,0 480,640 120,640" fill="${c.a}" opacity=".16"/>`;
    for (let i = 0; i < 70; i++) {
      const x = r() * 640 - 20, y = r() * 620;
      s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 18).toFixed(0)}" y2="${(y + 52).toFixed(0)}" stroke="${c.a}" stroke-width="2" opacity="${(0.15 + r() * 0.4).toFixed(2)}"/>`;
    }
    return s + `<rect x="293" y="0" width="14" height="70" fill="${c.bg1}"/><ellipse cx="300" cy="78" rx="46" ry="14" fill="${c.a}"/>`;
  },

  overlap: (c) =>
    `<circle cx="235" cy="280" r="150" fill="${c.a}" opacity=".35" stroke="${c.a}" stroke-width="6"/><circle cx="365" cy="280" r="150" fill="${c.b}" opacity=".35" stroke="${c.b}" stroke-width="6"/>` +
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${120 + i * 8}" y="${470 + i * 26}" width="${360 - i * 16}" height="6" rx="3" fill="${c.a}" opacity="${(0.6 - i * 0.08).toFixed(2)}"/>`).join("") +
    `<path d="M0 450 H600" stroke="${c.a}" stroke-width="2" opacity=".5"/>`,
};

// ---- Hand-tuned look for each starter movie: [motif, bg top, bg bottom, accent, accent 2] ----
const STYLE = {
  1: ["bars", "#1d2b3a", "#0b1320", "#f2c879", "#5c7a99"],
  2: ["rose", "#2a0f0f", "#0a0505", "#c8102e", "#e8d8b0"],
  3: ["skyline", "#0f1a2e", "#05070d", "#f2c94c", "#3a4a66"],
  4: ["rings", "#2b3a55", "#0d1220", "#9fb7ff", "#e8eefc"],
  5: ["planet", "#101a33", "#02040a", "#ffb86b", "#6b8cff"],
  6: ["rain", "#031a0f", "#000a05", "#3dff8a", "#0f8f46"],
  7: ["checker", "#3a0d0d", "#140404", "#ffd23f", "#ffffff"],
  8: ["feather", "#4f86b3", "#16324a", "#ffffff", "#cfe3f2"],
  9: ["split", "#3b1a2a", "#10060b", "#ff6b9a", "#f5f5f5"],
  10: ["stairs", "#1f3b2e", "#08140e", "#8fd19e", "#e8f0e0"],
  11: ["lanterns", "#2a1f5e", "#0b0722", "#ff9a5a", "#7fe0d0"],
  12: ["clouds", "#4aa3ff", "#1c5fbf", "#ffffff", "#ffd23f"],
  13: ["savanna", "#ff8a3d", "#7a1f0c", "#ffd166", "#2b0f06"],
  14: ["burst", "#3b1a63", "#0e0620", "#ffc247", "#a678ff"],
  15: ["arches", "#6b3b16", "#1f0f05", "#e8b86a", "#2b1608"],
  16: ["waves", "#0f3552", "#04121f", "#bfe4ff", "#3c88b8"],
  17: ["equalizer", "#2b1208", "#0a0402", "#ff4d2e", "#ffc857"],
  18: ["sunset", "#5a2a8a", "#15082b", "#ffb86b", "#ff6fb5"],
  19: ["eye", "#14243a", "#04080f", "#e8e8e8", "#c0392b"],
  20: ["dunes", "#d9531e", "#3b0f04", "#ffd166", "#1a0a04"],
  21: ["marigold", "#1f2a6b", "#080c2b", "#ff9f1c", "#ff5d8f"],
  22: ["lightbulb", "#1b5e8c", "#08233a", "#ffe066", "#ffffff"],
  23: ["sevens", "#2a2a1c", "#0a0a06", "#c9c24a", "#8a8a5a"],
  24: ["overlap", "#e08a8a", "#5a2a4a", "#ffe6d5", "#ffffff"],
};

const motifNames = Object.keys(motifs);
const GENRE_HUE = { Action: 12, Adventure: 30, Animation: 160, Comedy: 45, Crime: 350, Drama: 215, Fantasy: 285, Horror: 0, Music: 320, Mystery: 255, Romance: 335, "Sci-Fi": 195, Thriller: 230 };

function styleFor(m) {
  if (STYLE[m.id]) {
    const [motif, bg0, bg1, a, b] = STYLE[m.id];
    return { motif, bg0, bg1, a, b };
  }
  // Automatic style for movies you add yourself.
  const h = GENRE_HUE[m.genres[0]] ?? 210;
  return {
    motif: motifNames[m.id % motifNames.length],
    bg0: `hsl(${h} 45% 28%)`,
    bg1: `hsl(${h + 20} 55% 9%)`,
    a: `hsl(${h + 10} 85% 68%)`,
    b: `hsl(${h + 60} 70% 60%)`,
  };
}

function wrap(title) {
  const lines = [];
  let cur = "";
  for (const w of title.split(" ")) {
    if (cur && (cur + " " + w).length > 13) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function posterSvg(m) {
  const c = styleFor(m);
  const art = motifs[c.motif](c, rng(m.id));

  const lines = wrap(m.title);
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.max(44, Math.min(76, Math.floor(540 / (longest * 0.55))));
  const lastBaseline = 808;
  const titleSvg = lines
    .map((l, i) => `<text x="40" y="${lastBaseline - (lines.length - 1 - i) * size * 1.05}" font-family="Georgia, 'Times New Roman', serif" font-size="${size}" font-weight="700" fill="#fff">${esc(l)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900" role="img" aria-label="${esc(m.title)} poster">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
<linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg1}" stop-opacity="0"/><stop offset=".55" stop-color="${c.bg1}" stop-opacity=".92"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".4" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
</defs>
<rect width="600" height="900" fill="url(#bg)"/>
<g>${art}</g>
<rect y="440" width="600" height="460" fill="url(#band)"/>
<rect width="600" height="900" fill="url(#vig)"/>
${titleSvg}
<text x="40" y="858" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#fff" opacity=".8">${m.year}, directed by ${esc(m.director)}</text>
<rect x="12" y="12" width="576" height="876" rx="6" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
</svg>
`;
}

for (const m of movies) {
  const file = join(OUT, `${slug(m.title)}.svg`);
  writeFileSync(file, posterSvg(m));
  console.log("wrote", `public/posters/${slug(m.title)}.svg`);
}
console.log(`Done: ${movies.length} posters.`);
