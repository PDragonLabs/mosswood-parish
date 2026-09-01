# data/

Course JSON, hole art, and clubhouse stills live here.

Suggested split:

```
data/
  course.json          18-hole definition (names, par, yards, hcp, notes)
  holes/               tee / overhead / close-up stills
  clubhouse/           lounge, lockers, back room
```

The GUI already speaks JSON import / export. Keep the source of truth in this folder so the card and the renderer do not drift.
