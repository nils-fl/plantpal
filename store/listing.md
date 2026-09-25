# PlantPal: Zepp store listing

Copy these into the Zepp Open Platform console (console.zepp.com → PlantPal → Submit).

| Field | Value |
|---|---|
| appId | 1128597 |
| Package | `zeus build` → `dist/1128597-PlantPal-1.0.0-*.zab` |
| Category | Games |
| Icon | `assets/default.s/icon.png` (240×240, round, transparent outside) |
| Screenshots | `store/screenshots/1-thriving.png` … `4-stats.png` (360×360, transparent) |
| Data permissions | Step count (`data:user.hd.step`), alarms (`device:os.alarm`), background service (`device:os.bg_service`); all used on the watch only |
| Third-party SDKs | None |
| Payments | None in the app; the description mentions an optional tip link (ko-fi.com/nflaschel) |
| Countries | All available |

## English

**App name:** PlantPal

**App introduction** (36/40 characters):

A pixel plant that grows as you walk

**App details** (527/600 characters):

A tiny Tamagotchi-style plant on your wrist. Water it, give it sun and tap it for love. Its needs drop in real time, even when the app is closed. Your steps make it grow faster. Neglect it and it wilts, but it never dies: a little care brings it back.

Grow from seed to sprout to sapling and on to a final form shaped by your care: Fern, Sunflower, Rose, Oak or Bonsai. When it blooms, plant a new seed and keep the old one in your garden.

Pixel art, no ads, no account, no internet. Free; tips welcome at ko-fi.com/nflaschel

## Deutsch

**App-Name:** PlantPal

**App-Einführung (App introduction)** (38/40 characters):

Eine Pixel-Pflanze, die mit dir wächst

**App-Details (App details)** (549/600 characters):

Eine kleine Pflanze im Tamagotchi-Stil am Handgelenk. Gieße sie, gib ihr Sonne und tippe sie für Zuneigung an. Ihre Bedürfnisse sinken in Echtzeit, auch bei geschlossener App. Deine Schritte lassen sie schneller wachsen. Vernachlässigt welkt sie, stirbt aber nie.

Vom Samen über Keimling und Setzling zur Form, die deine Pflege bestimmt: Farn, Sonnenblume, Rose, Eiche oder Bonsai. Blüht sie, pflanze einen neuen Samen; die alte kommt in deinen Garten.

Pixel-Art, keine Werbung, kein Konto, kein Internet. Kostenlos; Trinkgeld: ko-fi.com/nflaschel

## Features descriptions

Feature list:

- Care for a pixel plant: water, sun and love
- Grows faster when you walk
- Wilts when neglected, but never dies
- 5 final forms shaped by your care
- Collect bloomed plants in your garden
- Offline, no ads, no account

Screenshot captions (same order as `store/screenshots/`):

1. Keep your plant happy with water, sun and love
2. Watch it bloom into its final form
3. Forgot it? It wilts, but a little care brings it back
4. Track growth, steps and your care profile

Deutsch:

- Pflanze pflegen: Wasser, Sonne und Zuneigung
- Wächst schneller, wenn du gehst
- Welkt, stirbt aber nie
- 5 Endformen je nach Pflege
- Garten für erblühte Pflanzen
- Offline, ohne Werbung

## Review notes

PlantPal is a free offline virtual-pet game: the user cares for a pixel plant (Water, Sun, tap the plant for Love) that grows over several days.

**How to test:** Open the app, press Water and Sun, tap the plant. Swipe up for the stats and garden page. Needs decay in real time, so growth and new forms appear over several days; a wilted plant recovers after watering.

**Permissions:**
- Step count (data:user.hd.step): steps give the plant bonus growth. Read on the watch only.
- Alarm and background service (device:os.alarm, device:os.bg_service): two silent daily alarms (23:30 and 23:55) start a short single-run app service that credits the day's steps to the plant. It shows no UI and finishes in under a second.
- Local storage: saves the game progress on the watch.

**Data:** No network access, no account, no analytics, no third-party SDKs. Nothing leaves the watch.

**Payments:** None. The app is completely free with no locked features. The store description only mentions an optional external tip link (ko-fi.com/nflaschel); nothing in the app refers to it.

Supported devices: square-screen Zepp OS 3+ watches (developed and tested on Amazfit Active 2 Square).

## Privacy statement

PlantPal does not collect, transmit or share any personal data.

- **Step count:** PlantPal reads today's step count from the watch to let your plant grow when you walk. The value is only used on the watch and is never sent anywhere.
- **Nightly check-in:** PlantPal sets two daily alarms (23:30 and 23:55) that briefly run a silent background task on the watch to credit the day's steps to your plant. It shows nothing, sends nothing and finishes in under a second.
- **Game progress:** your plant, its care history and your garden are stored locally on the watch in the app's own storage. They are deleted when you uninstall the app.
- PlantPal has no account, no network access, no analytics, no advertising and no third-party SDKs.

Contact: n.flaschel@gmail.com

### Datenschutzerklärung

PlantPal erhebt, überträgt oder teilt keine personenbezogenen Daten.

- **Schrittzahl:** PlantPal liest die heutige Schrittzahl der Uhr, damit deine Pflanze wächst, wenn du dich bewegst. Der Wert wird nur auf der Uhr verwendet und nirgendwohin gesendet.
- **Nächtlicher Check-in:** PlantPal stellt zwei tägliche Alarme (23:30 und 23:55), die kurz eine unsichtbare Hintergrundaufgabe auf der Uhr ausführen, um die Schritte des Tages deiner Pflanze gutzuschreiben. Sie zeigt nichts an, sendet nichts und ist in unter einer Sekunde fertig.
- **Spielstand:** Deine Pflanze, ihr Pflegeverlauf und dein Garten werden lokal im eigenen Speicher der App auf der Uhr gespeichert und beim Deinstallieren gelöscht.
- PlantPal hat kein Konto, keinen Netzwerkzugriff, keine Analyse, keine Werbung und keine SDKs von Drittanbietern.

Kontakt: n.flaschel@gmail.com
