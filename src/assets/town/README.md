# Town art

Delivered art for the town (`/map`, `/map/planete`). A PNG dropped here is picked up by the app on the next reload; anything without a file keeps its code-drawn version. Rules come from the artist's guide (`village-art-guide.md`): check files first in **`/map/atelier`**.

| What | Name | Canvas | Anchor |
|---|---|---|---|
| Building, any level | `building_<name>.png` | 1536 × 2048 | 768, 1728 |
| Building at one level | `building_<name>_l<level>.png` | 1536 × 2048 | 768, 1728 |
| Repeated prop | `prop_<name>_<nn>.png` | 1024 × 1024 | 512, 832 |

- **Building names in the town:** `school`, `library`, `lab`, `math_tower`, `music`, `stadium`, `greenhouse`, `cafe`, `arena`, `house`, `shop`.
- **Prop names:** `tree`, `pine`, `bush`, `flowers`, `rocks`, `lamp`, `bench`, `parasol`, `fountain`.
- **Levels:** a building uses the file for its level, else the closest lower level, else the file without a level. Level 0 (not built yet) only uses an explicit `_l0` file.
- **Current set (2026-11-16):** made in Scenario (Gemini 3.0 Pro, every asset edited from the school as its style reference; Photoroom cut-outs), then fitted with `python scripts/town-art/fit.py <cutout.png> <out.png> building` (or `prop <name>`). Re-run the fit on any new cut-out instead of placing it by hand.
- **Scale:** 1 tile = 1024 px in the master; the map draws a one-tile master at 1/16. A building bigger than one tile is scaled to its footprint until a larger template exists (guide § 3: ask first).
