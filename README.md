# Mosswood Parish Golf Club

**St. Martin Parish · Louisiana**  
Championship tees · Par 72 · 6,842 yards

Eighteen holes under live oaks and Spanish moss.  
Play the bayou course from a tilted map — aim, pick a club, swing.  
Hole 12 is the island we built.

**Play**  
[pdragonlabs.github.io/mosswood-parish/web](https://pdragonlabs.github.io/mosswood-parish/web/)  
[t.co/mb1MfhQ1tU](https://t.co/mb1MfhQ1tU)

Clubhouse gate: [pdragonlabs.github.io/mosswood-parish](https://pdragonlabs.github.io/mosswood-parish/)  
Thread: [x.com/PDragonLabs/status/2094820252588589392](https://x.com/PDragonLabs/status/2094820252588589392)

---

## The clubhouse

The course is only half the place.

- **Lounge** — Leather, moss in the windows, last night's card still on the wall.
- **Lockers** — Brass tags, wet towels, oaks outside the pane.
- **Back room** — Keys, radio, the book they don't show the members.

Stage 1 is finished. The web GUI is playable. AI is on the GUI.

---

## Status

| | |
|---|---|
| Stage | 1 — playable |
| Surface | Browser web GUI |
| Live tee | https://pdragonlabs.github.io/mosswood-parish/web/ |
| Course | Full 18, named, scored |
| Clubhouse | Lounge / Lockers / Back room |
| Play | Aim · club · power meter · swing |
| Course I/O | JSON import / export |
| Extras | Caddie, voices, sounds, wind, lies, water, foursome, 2.5D flyover |

---

## The card

| # | Hole | Par | Yds | HCP |
|---|------|-----|-----|-----|
| 1 | Cypress Gate | 4 | 392 | 9 |
| 2 | Bayou Bend | 5 | 531 | 3 |
| 3 | Cathedral | 4 | 418 | 5 |
| 4 | Palmetto | 3 | 164 | 15 |
| 5 | Cane Cut | 4 | 401 | 11 |
| 6 | Alligator Run | 5 | 548 | 1 |
| 7 | Spanish Beard | 4 | 387 | 13 |
| 8 | Magnolia | 3 | 191 | 17 |
| 9 | Parish Line | 4 | 436 | 7 |
| 10 | Cottonmouth | 4 | 409 | 8 |
| 11 | Lily Cut | 5 | 512 | 4 |
| 12 | Isle of Moss | 3 | 168 | 16 |
| 13 | Tabasco | 4 | 375 | 14 |
| 14 | Foggy Oaks | 4 | 427 | 2 |
| 15 | Pirogue | 3 | 142 | 18 |
| 16 | Plantation | 5 | 555 | 6 |
| 17 | Hurricane | 4 | 388 | 12 |
| 18 | Home Oaks | 4 | 398 | 10 |
| | **Total** | **72** | **6,842** | |

Hole 12 — Isle of Moss. Island green, two white bunkers, lily pads, and no place to miss short.

---

## How to play (Stage 1)

1. Aim with the arrows or by tapping the map.
2. Pull back the power meter — the dotted line shows about how far it will fly.
3. Let go to set it. Tap **Swing** to hit.

Clubs run Driver through Putter. Wind, lie, and water are live. Voices and caddie can be toggled from the top bar.

---

## Repo layout

```
mosswood-parish/
  README.md           this door
  index.html          Pages front gate
  LICENSE             Unlicense
  docs/scorecard.md   the printed card
  web/                the playable GUI
  data/               course JSON, hole art, clubhouse stills
```

The first tee on the web is `web/index.html`.

---

## The book they don't show the members

Stage 1 is the course, the clubhouse, and a swing that works.  
Later stages can deepen the caddie, the foursome, the wind over the bayou, and whatever is in that back-room ledger.

PDragonLabs · 2026
