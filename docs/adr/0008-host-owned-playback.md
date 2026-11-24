# Host-owned playback (not Google’s YouTube Music CarPlay app)

Research showed no documented or reusable way for a third-party iOS app to mutate the live playback Queue inside Google’s YouTube Music app. Working shared-queue projects inject into a **player they control** (desktop web/Electron). We therefore accept that the Host companion **owns playback**: unofficial on-device client for search, Queue, and audio out to CarPlay/speakers. Guests still never hold Host credentials; the cloud relay still only forwards intents.

This supersedes the “playback stays in YouTube Music’s own CarPlay UI” decision in ADR-0003. Custom CarPlay **Session/QR chrome** remains out of MVP; CarPlay is used as an **audio route** for the Host app, not as Google’s YTM UI.
