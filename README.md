# Scrap Mechanic Chapter 2 Overworld Map Generator

Generate a complete, interactive Scrap Mechanic Chapter 2 world map directly in your browser from any world seed or `.db` save file — without launching Scrap Mechanic.

**Repository:** [https://github.com/xKoldx/sm_map_generator](https://github.com/xKoldx/sm_map_generator)  
**Version:** 1.7.0  

---

## Credits & Acknowledgments

- **Original Core Generator Engine:** Created by [KornPlays](https://github.com/KornPlays/sm_map_generator) ([sm.kornplays.com](https://sm.kornplays.com)).
- **Enhanced Overworld Data & Marker Engine (v1.7.0):** Created by [xKoldx](https://github.com/xKoldx).

---

## Features & Overworld Data (28,998+ Markers)

- **Complete Binary & Tileson Asset Extraction:** Direct parsing of Scrap Mechanic game files for exact overworld coordinate mapping.
- **Scannerbot Path & Scan Zone Overlay:**
  - **Patrol Path Simulation:** Predicts Scannerbot road network navigation and active patrol routes derived from `ScannerbotManager.lua` overworld cell logic.
  - **Animated Patrol Line & Radar Pings:** Renders red patrol trajectories with animated dash vectors and pulsing location pings.
  - **Translucent 64m Pink Scan Zone:** Overlays a 64m-radius translucent pink corridor depicting Scannerbot's scanner detection range.
  - **Interactive Toggles:** Independent toolbar checkboxes to toggle Scannerbot Path and Scan Zone overlays on demand.

---

## Scannerbot Mechanics & Path Simulation

In Scrap Mechanic Chapter 2, **Scannerbot** is an autonomous patrol entity that roams the island's road network:

* **64m Scan Detection Corridor:** Scannerbot continuously scans a **64-meter radius corridor** along roads for player presence or activity.
* **Patrol & Hunt Modes:** Navigates interconnected road cells (`ScannerbotManager.lua`). If player activity is detected, Scannerbot switches from standard road patrol into **Hunt Mode** to pursue location targets.
* **Save File vs. Seed Generation:**
  * **Saved World (`.db`):** Reads the exact saved Scannerbot state from SQLite (`ScriptData` Channel 58), including live position (`scannerbotData.currentPosition`), active hunt targets, player locations, and visited road memory.
  * **World Seed:** Simulates default patrol pathing originating from the Mechanic Station spawn location across the road network.
* **Visual Map Indicators:**
  * **Animated Red Line:** Shows the predicted road navigation route with directional vector animations.
  * **Pulsing Radar Beacon:** Displays Scannerbot's exact location and target destination.
  * **Translucent Pink Zone:** Shows the full 64m detection sweep so players can plan safe navigation routes around Scannerbot.
- **Resource Deposits & Flora:**
  - **Oil Geysers** (9,923 markers)
  - **Standard Loot Crates** (6,205 markers with custom green compass badge)
  - **Pigment Flowers** (4,272 markers)
  - **Wild Corn Fields** (3,095 markers)
  - **Wild Beehives** (2,285 markers)
  - **Stone Nodes** (1,444 markers)
  - **Wild Cotton Patches** (893 markers)
- **Loot & High-Tier Chests:**
  - **Epic & Legendary Loot Crates** (410 markers hidden in ruins and secret structures)
- **POIs, Landmarks & Facilities:**
  - **Ruins** (216 markers)
  - **Caged Farmers** (182 markers)
  - **Chemical Ponds** (14 markers)
  - **Warehouses** (9 multi-floor markers)
  - **Growlabs** (7 markers)
  - **Crash Sites** (2 starter spaceship & crash markers)
  - **Pumping Stations** (2 markers)
  - **Mechanic Stations** (2 markers)
  - **Packing Stations** (2 markers)
  - **Trader Hideout** (1 marker)
  - **Oil Pond / Tar Pit** (1 marker)
- **High-Performance 60 FPS Viewport Engine:**
  - **Dynamic Viewer Size Selector:** Switch between **Small**, **Medium**, and **Large** viewport dimensions with persistent layout preference saving.
  - **Spatial Clustering:** Intelligent 8m–24m radius clustering algorithms to eliminate icon clutter while preserving patch locations.
  - **View Frustum Culling:** Real-time viewport clipping so only visible icons are rendered, maintaining smooth 60 FPS scrolling and panning over 28,000+ total markers.

---

## Run Locally

Requires Node.js `20.19` or newer.

```bash
git clone https://github.com/xKoldx/sm_map_generator.git
cd sm_map_generator
npm ci
npm run dev
```

Open the local URL printed by Vite.

---

## Build & Host

```bash
npm ci
npm run build
```

Upload the contents of `dist/` to any static HTTPS web host (GitHub Pages, Cloudflare Pages, Netlify, Vercel).
