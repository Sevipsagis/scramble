# Spike: YouTube Music Innertube search

**Goal:** prove `youtubei.js` can search YouTube Music before we build the Host player.

## Success criteria

**Search**

```bash
cd spikes/ytm-search
npm install
npm run search -- "lofi hip hop"
```

Prints JSON with `ok: true` and at least one Track `{ id, title, artists }`.

**Stream (step 3)**

```bash
npm run stream --
# or: npm run stream -- <videoId>
```

Prints JSON with `ok: true`, an `itag` / `mimeType`, `httpStatus` 200/206, and a **redacted** URL. Full signed URLs stay local — do not paste them into chat.

**Cookie is required for stream.** Anonymous player calls from this spike return `LOGIN_REQUIRED` / bot challenges. Put the Cookie header in `cookie.txt` locally, then run `npm run stream`.

## Optional cookie (local only)

1. Log into [music.youtube.com](https://music.youtube.com) in a browser.
2. Copy the request `Cookie` header from any authenticated call (DevTools → Network).
3. Save it as `spikes/ytm-search/cookie.txt` (gitignored).
4. Re-run `npm run search -- "…"`.

Never commit `cookie.txt`. Never paste cookies into chat or issues.

## Out of scope here

Playback, Queue mutation, iOS, CarPlay, relay.
