# Shared YouTube Music Queue (Car)

Domain language for a car-first product where passengers join a YouTube Music listening session and contribute to the upcoming track list without taking the Host device.

## Language

**Host**:
The person whose device is currently connected to CarPlay (or later, the party speaker) and is the one streaming YouTube Music aloud.
_Avoid_: Driver, owner, DJ, admin

**Guest**:
A participant who joins a Session to search and contribute Tracks without controlling the Host device. Guests are not required to have a Google / YouTube Music account. A Session admits at most six Guests.
_Avoid_: Passenger (as the role name), collaborator, user, client

**Session**:
A temporary collaborative listening period bound to one Host’s active YouTube Music playback. If the Host disconnects, the Session stays open for a reconnect window of 15 minutes; after that with no Host reconnect it hard-cuts. The Host may also end the Session explicitly at any time.
_Avoid_: Room, party, jam, lobby

**Join Code**:
The short credential Guests use (with or without a QR that encodes it) to enter a Session over the cloud relay.
_Avoid_: PIN, room code, invite link (as the primary term)

**Block**:
A Host action that stops a Guest from adding further Tracks in the current Session (after rate limits and Host removal of bad adds).
_Avoid_: Ban (unless meaning cross-Session), kick (prefer Block + remove from Session if both)

**Queue**:
The ordered list of upcoming Tracks for the current Session’s YouTube Music playback.
_Avoid_: Playlist (unless meaning a YouTube Music playlist entity), lineup

**Track**:
A single YouTube Music song that can be searched and placed on the Queue.
_Avoid_: Song (in domain docs), video, item
