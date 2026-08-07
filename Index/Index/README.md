# Political Galaxy — Index

Cascade layout. Each level only indexes the level below.

## Structure
- `manifest.json` — countries
- `parties/` — party snapshot scores + per-axis docs
- `timeline/` — per-axis era lists + era docs

## Update rules
- Change a score → edit `scores.json` or one row in `eras.json`
- Change prose → edit the matching `docs/*.md` (same filename)
- Add a party → new folder under `parties/{country}/` + entry in that country’s `_index.json`
- Add an era → one object in `eras.json` + `docs/{id}.md`
