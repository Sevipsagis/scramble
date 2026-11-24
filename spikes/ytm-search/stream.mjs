/**
 * Step-3 spike: resolve a playable audio stream URL for one Track id.
 *
 * Usage:
 *   COOKIE_FILE=./cookie.txt npm run stream -- <videoId>
 *   COOKIE_FILE=./cookie.txt npm run stream --
 *
 * Anonymous calls from many environments return LOGIN_REQUIRED / bot challenges
 * on the player endpoint. A logged-in music.youtube.com Cookie is expected here.
 *
 * Never commit cookie.txt. Never paste cookies or signed stream URLs into chat.
 */
import { readFileSync, existsSync } from "node:fs";
import { Innertube, UniversalCache } from "youtubei.js";

const arg = process.argv.slice(2).join(" ").trim();
const cookiePath = process.env.COOKIE_FILE ?? new URL("./cookie.txt", import.meta.url).pathname;

function loadCookie() {
  if (!existsSync(cookiePath)) return undefined;
  const raw = readFileSync(cookiePath, "utf8").trim();
  return raw || undefined;
}

function redactUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}?…(redacted)`;
  } catch {
    return "(unparseable url)";
  }
}

const cookie = loadCookie();
if (!cookie) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "cookie_required",
        hint: "Save music.youtube.com Cookie header to spikes/ytm-search/cookie.txt (gitignored), then re-run.",
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const yt = await Innertube.create({
  cookie,
  retrieve_player: true,
  cache: new UniversalCache(false),
});

let videoId = arg;
let title;
if (!videoId || videoId.includes(" ")) {
  const q = videoId || "lofi hip hop";
  const search = await yt.music.search(q, { type: "song" });
  const first = search.songs?.contents?.[0];
  if (!first?.id) {
    console.error(JSON.stringify({ ok: false, error: "no_track_from_search" }, null, 2));
    process.exit(1);
  }
  videoId = first.id;
  title = first.title?.toString?.() ?? undefined;
}

let format;
try {
  format = await yt.getStreamingData(videoId, {
    type: "audio",
    quality: "bestefficiency",
  });
} catch (err) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "getStreamingData_failed",
        message: String(err?.message ?? err),
        videoId,
        title,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

if (!format?.url) {
  // Fall back to inspecting playability when decipher returns empty.
  const info = await yt.getBasicInfo(videoId);
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "no_url",
        playability: info.playability_status?.status,
        reason: info.playability_status?.reason,
        videoId,
        title,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const head = await fetch(format.url, { method: "GET", headers: { Range: "bytes=0-1" } });
const okHttp = head.ok || head.status === 206;

const out = {
  ok: Boolean(okHttp && format.url),
  videoId,
  title,
  auth: "cookie",
  itag: format.itag,
  mimeType: format.mime_type ?? format.mimeType,
  audioQuality: format.audio_quality ?? format.audioQuality,
  httpStatus: head.status,
  url: redactUrl(format.url),
};

console.log(JSON.stringify(out, null, 2));
if (!out.ok) process.exit(1);
