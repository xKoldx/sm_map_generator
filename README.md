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
- **Scannerbot Path & Threat Zone Overlay:**
  - **Patrol Route & Detection Sweep:** Visualizes where Scannerbot is traveling and highlights its 64-meter scanning zone along the road network.
  - **Live Position & Destination Tracking:** Displays Scannerbot's current location and destination so you can safely navigate around it.
  - **Interactive Toggles:** Easily turn patrol lines and pink scan zone overlays on or off from the toolbar.

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

## Scannerbot & Threat Zone Guide

**Scannerbot** is the automated security robot that patrols the overworld roads in Scrap Mechanic Chapter 2.

* **What is the 64m Pink Scan Zone?**  
  Scannerbot continuously sweeps a **64-meter wide radius** along roads for player movement or activity. If you build, drive, or move inside this pink zone, Scannerbot can detect you and switch into **Hunt Mode** to track your location. Staying outside the pink zone keeps you safe.

* **How Map Generator Data Works for You:**  
  * **Uploading Your Save File (`.db`):** Shows where Scannerbot **actually is right now** in your world, including whether it is actively hunting you or patrolling normal routes.  
  * **Entering a World Seed:** Shows Scannerbot's default starting patrol route beginning at the **Mechanic Station**.

* **Map Symbols & Lines:**  
  * **Animated Red Line:** Scannerbot's active travel route along the road network.  
  * **Pulsing Radar Beacon:** Scannerbot's exact live position and destination point.  
  * **Translucent Pink Zone:** The 64-meter detection zone where Scannerbot's sensors can spot you.

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
