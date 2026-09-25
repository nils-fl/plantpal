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

**Profile (short):** A pocket plant on your wrist: water it, give it sun, walk with it, and watch it grow.

**Details:**

PlantPal is a tiny Tamagotchi-style plant that lives on your watch.

- Water it, give it sunlight and tap it for some love. Its needs drop in real time, even while the app is closed.
- Walk! Your steps make it grow faster (up to 30 growth points a day).
- Forget it for too long and it wilts, but it never dies. A little care brings it back.
- Grow from seed to sprout to sapling, and on to a final form that depends on how you cared for it: Fern, Sunflower, Rose, Oak, or the balanced Bonsai.
- When it blooms, plant a new seed and keep the old one in your Garden.
- Swipe up for stats: age, growth, steps and which form it is heading for.

Hand-made pixel art, no account, no internet, no ads.

Free for everyone. If you enjoy it, you can support me at ko-fi.com/nflaschel.

## Deutsch

**App-Name:** PlantPal

**Profil (kurz):** Eine Taschenpflanze am Handgelenk: gießen, Sonne geben, spazieren gehen und beim Wachsen zusehen.

**Details:**

PlantPal ist eine kleine Pflanze im Tamagotchi-Stil, die auf deiner Uhr lebt.

- Gieße sie, gib ihr Sonne und tippe sie für etwas Zuneigung an. Ihre Bedürfnisse sinken in Echtzeit, auch wenn die App geschlossen ist.
- Geh spazieren! Deine Schritte lassen sie schneller wachsen (bis zu 30 Wachstumspunkte am Tag).
- Vergisst du sie zu lange, lässt sie die Blätter hängen, stirbt aber nie. Ein wenig Pflege bringt sie zurück.
- Vom Samen über Keimling und Setzling zur endgültigen Form, je nachdem, wie du sie gepflegt hast: Farn, Sonnenblume, Rose, Eiche oder der ausgeglichene Bonsai.
- Wenn sie blüht, pflanze einen neuen Samen; die alte Pflanze kommt in deinen Garten.
- Nach oben wischen für Statistiken: Alter, Wachstum, Schritte und welche Form sie ansteuert.

Handgemachte Pixel-Art, kein Konto, kein Internet, keine Werbung.

Kostenlos für alle. Wenn es dir gefällt, kannst du mich auf ko-fi.com/nflaschel unterstützen.

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
