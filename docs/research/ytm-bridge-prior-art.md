# YouTube Music bridge prior art: live Queue on an iOS Host

## Question

For a car-first iOS Host app that must search YouTube Music and add Tracks to the Host’s live YouTube Music **Queue** (not merely a playlist), with credentials staying on device: do usable **bridges** already exist that we can reuse, or must we build our own?

Product constraints (already decided; not reopened here): YouTube Music only; unofficial/internal clients accepted for personal use; bridge runs on the Host iPhone; cloud relay only forwards intents; need search + add-to-queue (+ read now playing / upcoming if possible); iOS Host MVP.

## Verdict

**Build our own** on-device bridge. Partial reuse of *patterns and protocol knowledge* is realistic; drop-in reuse of an iOS library that mutates a live Queue is not.

- Google’s public APIs document **playlists**, not a third-party **playback queue**.
- Working open-source “shared queue” products either (a) inject into the **desktop** `music.youtube.com` player page and mutate that page’s **local** queue store, or (b) sync queues peer-to-peer among **desktop Electron** clients that each own their player. None ship as an embeddable iOS Host library that talks to the official YouTube Music iOS app’s queue.
- Search/browse Innertube clients exist (Python, TypeScript, some Swift/Kotlin). Live queue **mutation** in those libs is either absent or tied to owning the player UI/store—not a portable “add to Host’s official YTM queue” API.

This matches ADR-0001 / ADR-0007: unofficial bridge on the Host device, credentials never leave the phone.

## Official API facts

### YouTube Data API v3

Owning docs: [YouTube Data API](https://developers.google.com/youtube/data), [API Reference (resource types)](https://developers.google.com/youtube/data/reference/rest).

Documented resources include Activities, Captions, Channels, Comments, **Playlists**, **PlaylistItems**, Search, Subscriptions, Videos, etc. There is **no** resource for a user’s live playback / “Up next” queue.

What *is* documented for ordered track collections:

| Capability | Method | Source |
| --- | --- | --- |
| Search videos/playlists/channels | `search.list` | [Search: list](https://developers.google.com/youtube/data/reference/rest/v3/search/list) |
| Create playlist | `playlists.insert` | [Playlists: insert](https://developers.google.com/youtube/data/reference/rest/v3/playlists/insert) |
| Add item to playlist | `playlistItems.insert` | [PlaylistItems](https://developers.google.com/youtube/data/reference/rest/v3/playlistItems) |
| List playlist items | `playlistItems.list` | same |

The Data API overview states it supports uploading videos, managing playlists and subscriptions, updating channel settings, and search—not playback-queue control ([Data API home](https://developers.google.com/youtube/data)).

**Conclusion (official):** a third-party app **cannot** add to the YouTube Music *playback queue* through documented public APIs. Playlist mutation is the closest supported surface and is a different product concept (persistent playlist ≠ live Queue).

### YouTube Content ID / partner APIs

Owning docs: [YouTube Content ID API](https://developers.google.com/youtube/partner).

Restricted to YouTube content partners with Content Manager accounts; used for rights management, assets, claims—not consumer playback queues.

### YouTube Music partner / consumer Queue API

No Google Developers page was found that documents a public YouTube Music “add to queue” or “read now playing” API for third-party consumer apps. Searches over `developers.google.com` for YouTube Music queue/partner surfaces resolve to Data API playlists, Content ID, or Data Portability schemas—not a playback-queue API. Absence of a documented Queue resource in the Data API reference is the positive evidence for “not officially supported.”

## Existing libraries & apps

| Name | Source | What it can do | Language / runtime | iOS-reusable as library? | License (as stated in repo) |
| --- | --- | --- | --- | --- | --- |
| **ytmusicapi** | [sigma67/ytmusicapi](https://github.com/sigma67/ytmusicapi), [docs](https://ytmusicapi.readthedocs.io/en/stable/) | Search; browse; library; **playlist** create/edit/`add_playlist_items`; `get_watch_playlist` (reads radio / “next” panel via Innertube `next`) | Python 3 | **No** (Python; not embeddable in iOS Host). Protocol inspiration only. | MIT (`LICENSE`) |
| **youtubei.js** | [luanrt/youtube.js](https://github.com/luanrt/youtube.js), [Music client](https://ytjs.dev/api/youtubei.js/namespaces/Clients/classes/Music.html) | Innertube; `music.search`; `getUpNext` / `MusicQueue` **parser**; playlist manager; no documented “add to live playback queue” method on `Music` | TypeScript / Node & browsers | **Partial**: could run under JavaScriptCore / a JS runtime for **search**; still need Host-owned player queue mutation | MIT |
| **YTMQ** | [T3lluz/YTMQ](https://github.com/T3lluz/YTMQ), [How it works](https://t3lluz.com/ytmq/docs/how-it-works) | Shared guest queue → Host desktop YTM tab. Bridge injects into `music.youtube.com`, calls page `networkManager.fetch('/music/get_queue', …)` then `dispatch({ type: 'ADD_ITEMS', … })`; reads now playing from player bar / store; fallback `queueAddEndpoint` custom events / UI clicks | Deno server + React + **browser extension** (JS) | **No** as iOS lib. Strong **inspiration**: documents that YTM has no queue API and requires the web player page open | `package.json` license: none stated |
| **pear-desktop (ex th-ch/youtube-music) Music Together** | [pear-devs/pear-desktop](https://github.com/pear-devs/pear-desktop) `src/plugins/music-together/` | Peer-to-peer (WebRTC/PeerJS) sync of queue among **desktop** clients; each client calls `/music/get_queue` with `queueContextParams` from **its own** `#queue` store, then `ADD_ITEMS` / `REMOVE_ITEM` / `SET_INDEX` on local player. Guests must run the same desktop app ([issue #3228](https://github.com/pear-devs/pear-desktop/issues/3228) notes no mobile) | Electron + TypeScript | **No** as iOS lib. Queue protocol knowledge reusable | MIT (`package.json`) |
| **YTMDesktop2** | [Venipa/ytmdesktop2](https://github.com/Venipa/ytmdesktop2), [local API routes](https://youtube-music.app/docs/api/routes/) | Desktop app wrapping YTM; local HTTP `POST /nav/queue` appends via `/music/get_queue` + store update; `GET /nav/queue`, now-playing, transport controls | Electron / local HTTP | **No** on iPhone (desktop host). Pattern matches YTMQ/pear | CC0-1.0 (`LICENSE`) |
| **YTM-Swift** | [CuteTenshii/YTM-Swift](https://github.com/CuteTenshii/YTM-Swift) | Native **macOS** YTM client: InnerTube in Swift, search/browse, **app-owned** queue + playback, playlist edit; JavaScriptCore for stream signature | Swift / SwiftUI (macOS 27+) | **Inspiration only** (macOS app, not a published iOS package). Closest first-party-shaped native InnerTube + owned queue | License file not present in repo listing |
| **InnerTubeX** | [MetrolistGroup/innertubex](https://github.com/MetrolistGroup/innertubex) | KMP InnerTube (Android/JVM/iOS claimed): browse, search, playlist, player/stream extraction | Kotlin Multiplatform | Possibly reusable for **search/player fetch** on iOS; README emphasizes streaming/playback extraction, not documented live-queue add-to-Host-official-YTM | Check repo before adoption |
| **ArchiveTune core / similar Android clients** | e.g. [archivetuneapp/core](https://github.com/archivetuneapp/core), SimpMusic / other YTM Android clients | InnerTube search, playlist management, own playback | Kotlin | Pattern for search + own player; not official-app queue bridges; often GPL | Varies (often GPL-3.0) |

### What “queue” means in these codebases (critical)

Primary sources show two different “queues”:

1. **Watch / radio panel (read):** ytmusicapi `get_watch_playlist` posts to Innertube `next` and parses `musicQueueRenderer` / `playlistPanelRenderer` ([`watch.py`](https://github.com/sigma67/ytmusicapi/blob/main/ytmusicapi/mixins/watch.py)). youtubei.js `getUpNext` does the same class of read. This is “songs that would play next if you pressed play,” **not** mutating another client’s live Up Next.

2. **Live player queue (mutate, client-local):** YTMQ’s bridge (and pear / YTMDesktop2) require an already-running web player with `queueContextParams`. They call undocumented Innertube **`/music/get_queue`** to obtain queue item renderers, then **`ADD_ITEMS` into that page’s Redux-like store** (or fire `queueAddEndpoint` / UI clicks). YTMQ’s own docs: *“YouTube Music has no queue API, so the bridge uses the page's own queue the way its menus do. That is why YouTube Music has to stay open in a desktop browser.”* ([How it works](https://t3lluz.com/ytmq/docs/how-it-works)).

So existing “add to queue” success stories automate **a player they control or inject into**, not a cloud Queue that magically appears in the official YouTube Music iOS app.

## iOS constraints (primary sources)

| Approach | Fact from owning docs / project READMEs | Fit for Host-on-device Queue bridge |
| --- | --- | --- |
| Embed Python (ytmusicapi) | ytmusicapi is a Python package ([PyPI / README](https://github.com/sigma67/ytmusicapi)) | Not viable inside an iOS Host binary as-is |
| Run JS Innertube (youtubei.js) | Apple [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore): evaluate JS inside the app; [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview) can load web content and `evaluateJavaScript` | Feasible for **search / Innertube HTTP** inside Host; queue mutation still requires **Host-owned player state** (or a web player the Host embeds), not the stock YTM app |
| Browser extension pattern (YTMQ) | Manifest V3 extension + content script in Chrome/Firefox ([YTMQ README](https://github.com/T3lluz/YTMQ)) | No iOS equivalent for injecting into Google’s YouTube Music app |
| UI / Accessibility automation of official YTM | Apple [XCUIAutomation](https://developer.apple.com/documentation/xcuiautomation): “control **your app’s** user interface” for UI tests via XCTest | Documented as **testing your app**, not a production API to drive a third-party app’s queue. Not a supported Host bridge |
| URL schemes / deep links | No Google Developers page found documenting a YouTube Music “add to queue” URL scheme for third parties | Do not treat undocumented schemes as a product dependency |
| Native Swift InnerTube | YTM-Swift demonstrates Swift InnerTube + Keychain cookies + owned queue on macOS ([README](https://github.com/CuteTenshii/YTM-Swift)) | Closest architectural analogue: **Host plays through Scramble’s unofficial client**, Guests add into *that* Queue |

## Gaps relative to our Host on-device Queue bridge

1. **Official gap:** No documented API to add to / read the live YouTube Music playback Queue.
2. **Library gap:** Mature Innertube libs cover **search + playlists + watch-panel reads**; they do **not** expose a portable “push into Host’s official YTM iOS queue” method.
3. **Runtime gap:** Working shared-queue products are **desktop web-player injection** or **desktop peer sync**. They assume a long-lived `music.youtube.com` (or Electron) context with `queueContextParams`.
4. **iOS Host gap:** To keep credentials on device and mutate a live Queue, the Host app must **own playback** (unofficial client + local queue), as already implied by ADR-0007—not remote-control Google’s App Store YTM app.
5. **Reuse gap:** We can reuse protocol fragments (`/music/get_queue`, `queueContextParams`, `ADD_ITEMS`, SAPISIDHASH auth patterns from open clients) and search implementations; we still implement auth, session, player, queue store, and Guest→Host intent handling ourselves.

## Recommendation for this product

1. **Do not wait for or depend on an official Queue API**—it is not documented.
2. **Do not treat YTMQ / Music Together / YTMDesktop2 as embeddable iOS bridges**—use them as **worked examples** of client-local queue mutation and Guest UX.
3. **Build a Host-owned unofficial YTM client** on iOS (Swift and/or JavaScriptCore Innertube):
   - **Search:** port or wrap patterns from ytmusicapi / youtubei.js (cookie/SAPISIDHASH session on device).
   - **Queue:** maintain the Session Queue inside the Host player (Innertube `get_queue`-style hydrate + local queue state), same conceptual model as pear/YTMQ once *you* own the player.
   - **Now playing / upcoming:** read from Host player state (not from Google’s undocumented cloud).
4. **Top reuse targets (ranked):**
   1. **youtubei.js** — MIT; strongest typed Innertube **search/browse** surface for a JS runtime on device.
   2. **YTMQ bridge + pear Music Together queue modules** — MIT/open examples of `/music/get_queue` + store `ADD_ITEMS` (inspiration / protocol, not a dependency).
   3. **ytmusicapi** — MIT; authoritative Python reference for search + playlist vs watch-playlist semantics when designing the Swift/JS port (do not ship Python on iOS).
5. Aligns with existing ADRs: unofficial bridge, personal distribution, credentials on Host only.

## Sources

1. YouTube Data API overview — https://developers.google.com/youtube/data  
2. YouTube Data API Reference (resource types; no Queue) — https://developers.google.com/youtube/data/reference/rest  
3. PlaylistItems resource — https://developers.google.com/youtube/data/reference/rest/v3/playlistItems  
4. Playlists: insert — https://developers.google.com/youtube/data/reference/rest/v3/playlists/insert  
5. Search: list — https://developers.google.com/youtube/data/reference/rest/v3/search/list  
6. YouTube Content ID API — https://developers.google.com/youtube/partner  
7. ytmusicapi README / features — https://github.com/sigma67/ytmusicapi  
8. ytmusicapi `WatchMixin.get_watch_playlist` — https://github.com/sigma67/ytmusicapi/blob/main/ytmusicapi/mixins/watch.py  
9. ytmusicapi playlists mixin (`add_playlist_items`, etc.) — https://github.com/sigma67/ytmusicapi/blob/main/ytmusicapi/mixins/playlists.py  
10. ytmusicapi LICENSE (MIT) — https://github.com/sigma67/ytmusicapi/blob/main/LICENSE  
11. youtubei.js Music client (`search`, `getUpNext`, …) — https://github.com/luanrt/youtube.js/blob/main/src/core/clients/Music.ts  
12. youtubei.js LICENSE (MIT) — https://github.com/luanrt/youtube.js/blob/main/LICENSE  
13. YTMQ README — https://github.com/T3lluz/YTMQ  
14. YTMQ “How it works” (no queue API; page bridge) — https://t3lluz.com/ytmq/docs/how-it-works  
15. YTMQ `extension/ytmusic-bridge.js` (`/music/get_queue`, `ADD_ITEMS`, `queueAddEndpoint`) — https://github.com/T3lluz/YTMQ/blob/main/extension/ytmusic-bridge.js  
16. pear-desktop Music Together queue — https://github.com/pear-devs/pear-desktop/tree/master/src/plugins/music-together/queue  
17. pear-desktop `getMusicQueueRenderer` (`/music/get_queue`) — https://github.com/pear-devs/pear-desktop/blob/master/src/plugins/music-together/queue/song.ts  
18. pear-desktop issue #3228 (Music Together not on mobile) — https://github.com/pear-devs/pear-desktop/issues/3228  
19. YTMDesktop2 / youtube-music.app local API (`POST /nav/queue`) — https://youtube-music.app/docs/api/routes/  
20. Venipa/ytmdesktop2 LICENSE (CC0) — https://github.com/Venipa/ytmdesktop2/blob/master/LICENSE  
21. CuteTenshii/YTM-Swift README — https://github.com/CuteTenshii/YTM-Swift  
22. Apple JavaScriptCore — https://developer.apple.com/documentation/javascriptcore  
23. Apple WKWebView — https://developer.apple.com/documentation/webkit/wkwebview  
24. Apple XCUIAutomation — https://developer.apple.com/documentation/xcuiautomation  
25. Repo ADRs: `docs/adr/0001-unofficial-ytm-bridge-personal-distribution.md`, `docs/adr/0007-ytm-bridge-on-host-device.md`
