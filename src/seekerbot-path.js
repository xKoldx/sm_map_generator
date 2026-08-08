// seekerbot-path.js
/**
 * =========================================================================================
 * ADVANCED TECHNICAL DOCUMENTATION: SCANNERBOT (SEEKERBOT) PATH & THREAT ZONE ENGINE
 * =========================================================================================
 * 
 * Game Mechanics & Lua Script Interface:
 * - Scrap Mechanic Chapter 2 introduces the Scannerbot manager entity (`ScannerbotManager.lua`).
 * - Scannerbot patrols overworld road cells mapped in game files using a directional node traversal graph.
 * - Road detection uses cell bitmasks (MASK_ROADS = 0x0f00) and game tile UUID maps.
 * 
 * SQLite Save File Integration (`save-reader.js`):
 * - In saved worlds (.db), Scannerbot state is stored in table `ScriptData` at Channel 58:
 *   `STORAGE_CHANNEL_SCANNERBOT_MANAGER = 58`
 * - Decoded JSON payload schema:
 *   {
 *     "scannerbotData": { "currentPosition": { "x": number, "y": number, "z": number } },
 *     "huntMode": boolean,
 *     "huntModeTarget": { "locationOfInterest": { "x": number, "y": number } },
 *     "visitedRoads": Record<string, number>,
 *     "playerLocations": Array<{ "x": number, "y": number }>
 *   }
 * 
 * Fallback & Seed Logic:
 * - If generating purely from a world seed without a save file, initial patrol origin defaults
 *   to the Mechanic Station quest tile ground coordinates, simulating default initial spawn.
 * 
 * Rendering & Visual Overlay Pipeline (`map-viewer.js` & `style.css`):
 * - 64m Threat Zone: Renders a translucent pink corridor (`stroke-width: cellSize * 2.0`)
 *   mirroring Scannerbot's 64m detection radius.
 * - Path Vector: Renders red road segments with glow filters, plus an active path vector line
 *   using SVG `stroke-dasharray` and CSS `@keyframes seekerbotDash` (`stroke-dashoffset`)
 *   for smooth 60 FPS GPU-accelerated marching directional animation.
 * =========================================================================================
 */

const CELL_SIZE = 64;
const MASK_ROADS = 0x0f00;

export function CellKey(x, y) {
  return `${x},${y}`;
}

// Known true road tile UUID set from Scrap Mechanic overworld tile database
const ROAD_TILE_UIDS = new Set([
  "3ef31461-6f4e-4fb5-938d-875fb837d736", // MechanicStation_QuestTile_01
  "2c36976b-e008-408c-a5b5-1baaaf01df04", // MechanicStation_128_01
  "f3535095-b884-4596-a432-0aee1b5d742a", // Random_Road_64_01
  "7281c295-9748-496b-bc1e-6efe5f5f2541", // Random_Road_64_02
  "af25cff8-1700-4842-b6f8-b486558cfefc", // Random_Road_64_03
  "ea30c62b-944a-4763-be94-454cd03fa218", // Random_Road_64_04
  "c287b99e-c7f9-41a0-bb17-6203a2466ccb",
  "8e5a9986-3003-4a6d-93ce-b9e732723a0a",
  "ff4d8357-5656-4baf-9ed2-61c226cf3b62",
  "53fafc33-74a4-4637-87e8-0626cc945084",
  "4eccd58b-b6ca-4e43-9b70-27ee75cbb441",
  "163c84ef-b493-437a-827f-e6f8c79420ab",
  "ddb758e6-1920-4f51-b707-c0e8277e6cd4",
  "a428bce1-949f-4ba9-b1b3-2b984fb0d22c",
  "6a0e42cd-13be-44a8-a315-453573200666",
  "283704ff-0ea5-4fcf-ac73-fc4f4944dc8d",
  "39c6c4ea-0a6d-45ef-90ed-9bd722a29fdc",
  "60f9245a-37aa-4740-91a6-9b1c596b3a81",
  "be6259b3-be4e-4e68-a86f-bd6d67eb7572",
  "86ad572b-b7d3-444d-9dfd-8b5f37f229b4",
  "08ebf03e-804c-493c-b626-a56060afb0fa",
  "3a82527c-01a2-4d24-b417-7788bd234e6e",
  "427b130a-99af-46e8-9446-c5ad04398864",
  "72e26acb-5f66-4835-a52d-83fb01143381",
  "df62624d-8d81-4dd8-b6a5-59f359952dc1",
  "3fa22bd4-111b-4c59-87be-da8fafde861c",
  "8e9563ac-9c4d-40fb-9d7f-d7745dc7462a",
  "88ab9e44-1580-457f-be83-b4a8b8915703",
  "e6c772ea-dd97-4355-847e-f2f60790e40a",
  "2c11ac86-14ea-49ee-92dc-64d4a3ec9474",
  "13007bde-e48f-454f-942e-186719bf1ba8",
  "bac613c0-c3e7-40c5-8b1b-8aef28c4be50",
  "eb463d72-ab2b-429e-89ea-bb4b3a41018c",
  "a20cbce9-bb5f-4409-8b2e-9a32aaec7d74",
  "92b6ed7f-91e2-4f05-bbc9-261d320fa23a",
  "98a5e16c-ede2-4580-8ad9-ef070d9fbd29",
  "cd6cdd6f-90e1-4355-8bf9-77ac83b2248c",
  "14e2d035-871f-4420-8a05-783a377c6471",
  "dfec295c-66d9-498c-8f18-72447167dbdf",
  "a8bc9bb7-76ed-4dc1-a746-dc81b46cc77b",
  "e0be898b-49b2-4710-8a3c-47a1999376e1",
  "e8f3a25c-1e74-4244-bfc8-9560f2511b56",
  "d72cd356-f436-4d6f-b98d-48363d2538eb",
  "ba2e96b3-bf93-4d8b-a64d-eed203614b5c",
  "2e599b00-a4f6-4490-b714-b4673e539268",
  "80f1d48d-51a7-4bc8-9315-9567de8c253a",
  "f70f4e7e-8f33-438b-91e5-ecd953e9cf83",
  "38bd425b-6169-4aa8-9a8c-70545299e42a",
  "a5220463-8117-4e95-8e70-fe71c42b631a",
  "568c541a-0d29-4a3c-a73c-dc5c1cb36b61",
  "4ebcfa79-e86a-4c20-bf38-0b863abad849",
  "92686933-9abd-4765-90ee-b30bc1a8c296",
  "775c34a6-d473-4b53-9b46-881bfaada491",
  "f6e1a6f1-ac23-4fa5-b083-33ea37f4550e",
  "28c8f354-3919-46e4-a311-6c3ceee5b5d9",
]);

export function computeSeekerbotPath(cells, seekerbotState = null) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return { path: [], segments: [], mode: "NONE", distanceMeters: 0 };
  }

  // 1. Build raw road cell lookup table (including Mechanic Station, POIs & road tiles)
  const rawRoadCells = new Map();
  let firstRoadCell = null;
  let mechanicStationCell = null;

  for (const cell of cells) {
    const hasRoadFlag = (cell.flags & MASK_ROADS) !== 0;
    const isKnownRoadUid = ROAD_TILE_UIDS.has(cell.uid);

    if (hasRoadFlag || isKnownRoadUid) {
      const key = CellKey(cell.x, cell.y);
      const groundPosition = {
        x: cell.x * CELL_SIZE + CELL_SIZE / 2,
        y: cell.y * CELL_SIZE + CELL_SIZE / 2,
      };
      const record = {
        cellX: cell.x,
        cellY: cell.y,
        key,
        groundPosition,
        uid: cell.uid,
      };
      rawRoadCells.set(key, record);
    }
  }

  // 2. Perform Connected Component Analysis (BFS) to filter out false-positive isolated islands (< 4 cells)
  const visitedCells = new Set();
  const roadCells = new Map();

  for (const [key, cell] of rawRoadCells.entries()) {
    if (visitedCells.has(key)) continue;

    const component = [];
    const queue = [key];
    visitedCells.add(key);

    while (queue.length > 0) {
      const currKey = queue.shift();
      const currCell = rawRoadCells.get(currKey);
      component.push(currCell);

      const neighbors = [
        CellKey(currCell.cellX, currCell.cellY + 1),
        CellKey(currCell.cellX - 1, currCell.cellY),
        CellKey(currCell.cellX + 1, currCell.cellY),
        CellKey(currCell.cellX, currCell.cellY - 1),
      ];

      for (const nKey of neighbors) {
        if (rawRoadCells.has(nKey) && !visitedCells.has(nKey)) {
          visitedCells.add(nKey);
          queue.push(nKey);
        }
      }
    }

    // Keep only connected road components of size >= 4 (eliminates isolated false-positive islands)
    if (component.length >= 4) {
      for (const validCell of component) {
        roadCells.set(validCell.key, validCell);
        if (!firstRoadCell) firstRoadCell = validCell;
        if ((validCell.cellX === -30 && validCell.cellY === -27) || (validCell.cellX === 11 && validCell.cellY === 23)) {
          mechanicStationCell = validCell;
        }
      }
    }
  }

  if (roadCells.size === 0) {
    return { path: [], segments: [], mode: "NO_ROADS", distanceMeters: 0 };
  }

  // 2. Extract full road network line segments connecting adjacent road tiles
  const visitedEdges = new Set();
  const segments = [];

  for (const roadCell of roadCells.values()) {
    const neighbors = [
      { x: roadCell.cellX, y: roadCell.cellY + 1 },
      { x: roadCell.cellX - 1, y: roadCell.cellY },
      { x: roadCell.cellX + 1, y: roadCell.cellY },
      { x: roadCell.cellX, y: roadCell.cellY - 1 },
    ];

    for (const pos of neighbors) {
      const nKey = CellKey(pos.x, pos.y);
      const neighborCell = roadCells.get(nKey);
      if (neighborCell) {
        const edgeKey = [roadCell.key, nKey].sort().join("--");
        if (!visitedEdges.has(edgeKey)) {
          visitedEdges.add(edgeKey);
          segments.push([
            { x: roadCell.cellX, y: roadCell.cellY, worldX: roadCell.groundPosition.x, worldY: roadCell.groundPosition.y },
            { x: neighborCell.cellX, y: neighborCell.cellY, worldX: neighborCell.groundPosition.x, worldY: neighborCell.groundPosition.y },
          ]);
        }
      }
    }
  }

  // 3. Determine initial start position (Mechanic Station or saved Seekerbot position)
  let startPosition = null;
  const huntMode = seekerbotState?.huntMode ?? false;
  const huntTarget = seekerbotState?.huntModeTarget || null;
  const visitedRoads = { ...(seekerbotState?.visitedRoads || {}) };

  if (seekerbotState?.scannerbotData?.currentPosition) {
    startPosition = seekerbotState.scannerbotData.currentPosition;
  } else if (mechanicStationCell) {
    startPosition = mechanicStationCell.groundPosition;
  } else {
    let bestCell = firstRoadCell;
    let minCenterDist = Infinity;
    for (const cell of roadCells.values()) {
      const dist = Math.hypot(cell.groundPosition.x + 1024, cell.groundPosition.y + 512);
      if (dist < minCenterDist) {
        minCenterDist = dist;
        bestCell = cell;
      }
    }
    startPosition = bestCell ? bestCell.groundPosition : firstRoadCell.groundPosition;
  }

  let startCellX = Math.floor(startPosition.x / CELL_SIZE);
  let startCellY = Math.floor(startPosition.y / CELL_SIZE);
  let startCellKey = CellKey(startCellX, startCellY);

  if (!roadCells.has(startCellKey)) {
    let closestKey = null;
    let minDistanceSq = Infinity;
    for (const [key, roadCell] of roadCells.entries()) {
      const dx = roadCell.groundPosition.x - startPosition.x;
      const dy = roadCell.groundPosition.y - startPosition.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestKey = key;
      }
    }
    if (closestKey) {
      const closest = roadCells.get(closestKey);
      startCellX = closest.cellX;
      startCellY = closest.cellY;
      startCellKey = closestKey;
    }
  }

  // 4. Determine target location
  let targetLocation = null;
  if (huntMode && huntTarget?.locationOfInterest) {
    targetLocation = huntTarget.locationOfInterest;
  } else if (seekerbotState?.playerLocations?.length) {
    targetLocation = seekerbotState.playerLocations[seekerbotState.playerLocations.length - 1];
  } else {
    targetLocation = { x: 0, y: 0 };
  }

  // 5. Simulate primary Seekerbot patrol path (ScannerbotManager.lua: sv_updateRoadDestination)
  const path = [];
  let currentKey = startCellKey;
  let previousKey = null;
  const maxSteps = 150;
  let totalDistance = 0;
  const MaxRoadVisits = 2;

  let currentCell = roadCells.get(currentKey);
  if (currentCell) {
    path.push({
      x: currentCell.cellX,
      y: currentCell.cellY,
      worldX: currentCell.groundPosition.x,
      worldY: currentCell.groundPosition.y,
      key: currentKey,
    });
  }

  for (let step = 0; step < maxSteps; step++) {
    if (!currentCell) break;

    const cellX = currentCell.cellX;
    const cellY = currentCell.cellY;

    const neighbourPositions = [
      { cellX: cellX, cellY: cellY + 1 },
      { cellX: cellX - 1, cellY: cellY },
      { cellX: cellX + 1, cellY: cellY },
      { cellX: cellX, cellY: cellY - 1 },
    ];

    const roadNeighboursByRandom = [];
    const roadNeighboursByDistance = [];
    let previousRoad = null;

    for (const pos of neighbourPositions) {
      const nKey = CellKey(pos.cellX, pos.cellY);
      const roadCell = roadCells.get(nKey);
      if (roadCell) {
        if (previousKey && nKey === previousKey) {
          previousRoad = { roadCell, cellKey: nKey };
        } else {
          if (targetLocation) {
            const dx = roadCell.groundPosition.x - targetLocation.x;
            const dy = roadCell.groundPosition.y - targetLocation.y;
            const targetToCellDistance2 = dx * dx + dy * dy;
            roadNeighboursByDistance.push({
              roadCell,
              targetToCellDistance2,
              cellKey: nKey,
            });
          }
          roadNeighboursByRandom.push({ roadCell, cellKey: nKey });
        }
      }
    }

    let selectedCell = null;

    if (roadNeighboursByDistance.length > 0) {
      if (huntMode) {
        roadNeighboursByDistance.sort((a, b) => a.targetToCellDistance2 - b.targetToCellDistance2);
      } else {
        roadNeighboursByDistance.sort((a, b) => b.targetToCellDistance2 - a.targetToCellDistance2);
      }

      let lowestTimesVisited = MaxRoadVisits;
      for (const neighbour of roadNeighboursByDistance) {
        const timesVisited = visitedRoads[neighbour.cellKey] || 0;
        if (timesVisited === 0) {
          selectedCell = neighbour;
          break;
        } else if (timesVisited < lowestTimesVisited) {
          lowestTimesVisited = timesVisited;
          selectedCell = neighbour;
        }
      }
    }

    if (!selectedCell && previousRoad) {
      const timesVisited = visitedRoads[previousRoad.cellKey] || 1;
      if (timesVisited < MaxRoadVisits) {
        selectedCell = previousRoad;
      }
    }

    if (!selectedCell && roadNeighboursByRandom.length > 0) {
      selectedCell = roadNeighboursByRandom[Math.floor(Math.random() * roadNeighboursByRandom.length)];
    }

    if (!selectedCell) {
      break;
    }

    previousKey = currentKey;
    currentKey = selectedCell.cellKey;
    currentCell = selectedCell.roadCell;

    visitedRoads[currentKey] = (visitedRoads[currentKey] || 0) + 1;

    const prevPoint = path[path.length - 1];
    const dx = currentCell.groundPosition.x - prevPoint.worldX;
    const dy = currentCell.groundPosition.y - prevPoint.worldY;
    totalDistance += Math.hypot(dx, dy);

    path.push({
      x: currentCell.cellX,
      y: currentCell.cellY,
      worldX: currentCell.groundPosition.x,
      worldY: currentCell.groundPosition.y,
      key: currentKey,
    });
  }

  return {
    path,
    segments,
    mode: huntMode ? "HUNT" : "ROAM",
    startCell: path[0] || null,
    targetCell: path[path.length - 1] || null,
    distanceMeters: Math.round(totalDistance),
  };
}
