# Spike: YouTube Music Innertube search

**Goal:** prove `youtubei.js` can search YouTube Music before we build the Host player.

## Success for this step

```bash
cd spikes/ytm-search
npm install
npm run search -- "lofi hip hop"
```

Prints JSON with `ok: true` and at least one Track `{ id, title, artists }`.

Anonymous search is enough to pass this spike. A logged-in cookie is optional here; it becomes required later for account-bound streaming.

## Optional cookie (local only)

1. Log into [music.youtube.com](https://music.youtube.com) in a browser.
2. Copy the request `Cookie` header from any authenticated call (DevTools → Network).
3. Save it as `spikes/ytm-search/cookie.txt` (gitignored).
4. Re-run `npm run search -- "…"`.

Never commit `cookie.txt`. Never paste cookies into chat or issues.

## Out of scope here

Playback, Queue mutation, iOS, CarPlay, relay.
