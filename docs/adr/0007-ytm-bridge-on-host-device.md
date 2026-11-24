# YouTube Music bridge runs on the Host device

The unofficial YouTube Music client runs inside the Host iOS app. Cookies/tokens never leave the phone. The cloud relay only forwards Guest search/add intents to that device, which performs the YTM calls locally. Putting Host credentials on the VPS was rejected because a relay compromise would mean a full Google/YTM account takeover.
