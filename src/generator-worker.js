import { findMapMarkers } from "./builder-quests.js";
import { computeSeekerbotPath } from "./seekerbot-path.js";

let generatorPromise;

async function loadGenerator(baseUrl) {
  if (!generatorPromise) {
    generatorPromise = (async () => {
      globalThis.__SM_MAP_BASE_URL = baseUrl;
      return import("./generator.js");
    })();
  }
  return generatorPromise;
}

self.addEventListener("message", async (event) => {
  if (event.data?.type !== "generate" && event.data?.type !== "generate-markers") return;
  const { seed, baseUrl, seekerbotState } = event.data;
  const progress = (message, percent) => {
    self.postMessage({ type: "progress", message, percent });
  };

  try {
    const { generateCells } = await loadGenerator(baseUrl);
    const cells = await generateCells(seed, progress);
    const mapMarkers = findMapMarkers(cells);
    const seekerbotPath = computeSeekerbotPath(cells, seekerbotState);
    if (event.data.type === "generate-markers") {
      self.postMessage({ type: "markers", seed, mapMarkers, seekerbotPath });
      return;
    }
    self.postMessage({ type: "cells", cells, mapMarkers, seekerbotPath });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error?.message || String(error),
      stack: error?.stack,
    });
  }
});
