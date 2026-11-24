# Shared YouTube Music Queue (Car)

Domain language for a car-first product where passengers join a YouTube Music listening session and contribute to the upcoming track list without taking the Host device.

## Language

**Host**:
The person whose device is currently connected to CarPlay (or later, the party speaker) and is the one streaming YouTube Music aloud.
_Avoid_: Driver, owner, DJ, admin

**Guest**:
A participant who joins a Session to search and contribute Tracks without controlling the Host device.
_Avoid_: Passenger (as the role name), collaborator, user, client

**Session**:
A temporary collaborative listening period bound to one Host’s active YouTube Music playback. It ends as soon as that Host disconnects from CarPlay (or the speaker); Guests are dropped and must join a new Session.
_Avoid_: Room, party, jam, lobby

**Queue**:
The ordered list of upcoming Tracks for the current Session’s YouTube Music playback.
_Avoid_: Playlist (unless meaning a YouTube Music playlist entity), lineup

**Track**:
A single YouTube Music song that can be searched and placed on the Queue.
_Avoid_: Song (in domain docs), video, item
