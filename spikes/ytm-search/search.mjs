/**
 * Step-2 spike: prove YouTube Music Innertube search works.
 *
 * Usage:
 *   npm install
 *   npm run search -- "lofi hip hop"
 *   COOKIE_FILE=./cookie.txt npm run search -- "lofi hip hop"
 *
 * cookie.txt (gitignored): raw Cookie header value from music.youtube.com
 * while logged in. Do NOT commit it. Do NOT paste it into chat.
 */
import { readFileSync, existsSync } from "node:fs";
import { Innertube } from "youtubei.js";

const query = process.argv.slice(2).join(" ").trim() || "lofi hip hop";
const cookiePath = process.env.COOKIE_FILE ?? new URL("./cookie.txt", import.meta.url).pathname;

function loadCookie() {
  if (!existsSync(cookiePath)) return undefined;
  const raw = readFileSync(cookiePath, "utf8").trim();
  return raw || undefined;
}

function trackLines(search) {
  // youtubei.js Music Search exposes filtered shelves, e.g. search.songs
  const items = search.songs?.contents ?? [];
  return items
    .map((item) => ({
      id: item.id,
      title: item.title?.toString?.() ?? String(item.title ?? ""),
      artists: item.artists?.map((a) => a.name).filter(Boolean).join(", ") || undefined,
    }))
    .filter((r) => r.id && r.title)
    .slice(0, 10);
}

const cookie = loadCookie();
const yt = await Innertube.create({
  cookie,
  retrieve_player: false,
});

const search = await yt.music.search(query, { type: "song" });
const tracks = trackLines(search);

if (tracks.length === 0) {
  console.error("FAIL: no song results parsed for query:", query);
  console.error("auth:", cookie ? "cookie file present" : "anonymous");
  // Dump shape once for debugging parsers — no secrets.
  console.error(
    "top-level keys:",
    search && typeof search === "object" ? Object.keys(search) : typeof search,
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      query,
      auth: cookie ? "cookie" : "anonymous",
      count: tracks.length,
      tracks,
    },
    null,
    2,
  ),
);
