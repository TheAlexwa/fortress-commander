import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BORDERLANDS_SAVE_KEY,
  deleteSaveGame,
  getSaveKey,
  getSaveMetadata,
  loadGameState,
  saveGameState,
} from "../js/save.js";
import {
  ACTIVE_WORLD_ID,
  createWorldMapProfile,
  createWorldRunStats,
  getCommanderPointSummary,
  getWorldMapView,
  loadWorldMapProfile,
  normalizeWorldMapProfile,
  saveWorldMapProfile,
  syncWorldMapProfileFromState,
} from "../js/world-map.js";
import {
  WORLD_DEFINITIONS,
  getWorldDefinition,
  isWorldUnlocked,
} from "../js/world-definitions.js";
import {
  CAMPAIGN_FINAL_WAVE,
  continueCampaignInEndlessMode,
  createCampaignState,
  resolveCampaignWave,
} from "../js/campaign.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
  clear() { this.values.clear(); }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;

function snapshot({ worldId, wave = 9 } = {}) {
  const value = {
    saveFormat: 1,
    gameVersion: "1.18.18",
    savedAt: "2026-08-09T08:00:00.000Z",
    saveType: "manual",
    state: {
      gold: 321,
      wood: 123,
      stone: 45,
      researchPoints: 7,
      hp: 1100,
      maxHp: 1200,
      wave,
      kills: 20,
      repairedHp: 30,
      research: {},
      walls: [],
      buildings: [],
      units: [{ key: "soldier", uid: 7, x: 812.5, y: 644.25, targetX: 900, targetY: 700, homeX: 780, homeY: 620 }],
      residents: [],
      campaign: createCampaignState(wave),
      worldRun: createWorldRunStats(),
    },
    view: { zoom: 0.73, camX: 1512.25, camY: 1114.75 },
  };
  if (worldId !== undefined) value.worldId = worldId;
  return value;
}

function runtimeState(worldId = ACTIVE_WORLD_ID) {
  return {
    worldId,
    inWave: false,
    gold: 210,
    wood: 105,
    stone: 0,
    researchPoints: 0,
    hp: 1200,
    maxHp: 1200,
    wave: 1,
    kills: 0,
    repairedHp: 0,
    heroOffering: 0,
    heroSummoned: false,
    heroFallen: false,
    nextUnitId: 0,
    nextBuildingId: 0,
    nextResidentId: 0,
    research: {},
    walls: [],
    innerWalls: [],
    middleGates: [],
    outerWalls: [],
    outerGates: [],
    buildings: [],
    units: [],
    residents: [],
    population: {},
    siege: null,
    warCouncil: null,
    bonusObjective: null,
    campaign: createCampaignState(1),
    worldRun: createWorldRunStats(),
  };
}

assert(getSaveKey("borderlands") === "fortressCommander.save.v1", "Grenzmark verwendet nicht den bisherigen Save-Schlüssel");
assert(BORDERLANDS_SAVE_KEY === "fortressCommander.save.v1", "Historischer Save-Schlüssel wurde verändert");
assert(getSaveKey("mistwood") === "fortressCommander.save.v1.mistwood", "Nebelwald besitzt keinen getrennten Save-Schlüssel");
let unknownRejected = false;
try { getSaveKey("unknown-world"); } catch { unknownRejected = true; }
assert(unknownRejected, "Unbekannte Welt-ID wurde nicht abgelehnt");

assert(WORLD_DEFINITIONS.length === 5, "Der Weltkatalog muss alle fünf Kampagnenwelten enthalten");
assert(JSON.stringify(getWorldDefinition("borderlands").campaign.bossWaves) === "[8,16,24,32]", "Die Grenzmark-Bosswellen dürfen sich nicht ändern");
assert(getWorldDefinition("borderlands").campaign.finalWave === 32, "Die Grenzmark muss weiter mit Welle 32 enden");
assert(getWorldDefinition("mistwood").status === "construction", "Nebelwald muss im Bau bleiben");
assert(getWorldDefinition("mistwood").campaign.finalWave === null, "Nebelwald darf noch kein spielbares Kampagnenende erhalten");
assert(isWorldUnlocked("mistwood", { borderlands: { completed: false } }) === false, "Nebelwald darf vor Abschluss der Grenzmark nicht freigeschaltet sein");
assert(isWorldUnlocked("mistwood", { borderlands: { completed: true } }) === true, "Die spätere Nebelwald-Freischaltung muss datengetrieben sein");

storage.clear();
storage.setItem(getSaveKey("borderlands"), JSON.stringify(snapshot()));
const legacyMetadata = getSaveMetadata("borderlands");
assert(legacyMetadata?.valid === true && legacyMetadata.worldId === "borderlands", "Alter Snapshot ohne worldId wird nicht als Grenzmark akzeptiert");

storage.setItem(getSaveKey("mistwood"), JSON.stringify(snapshot()));
const originalError = console.error;
console.error = () => {};
assert(getSaveMetadata("mistwood")?.valid === false, "Alter Snapshot ohne worldId wird fälschlich als Nebelwald akzeptiert");
storage.setItem(getSaveKey("mistwood"), JSON.stringify(snapshot({ worldId: "borderlands" })));
assert(getSaveMetadata("mistwood")?.valid === false, "Expliziter Grenzmark-Snapshot wird als Nebelwald akzeptiert");
storage.setItem(getSaveKey("borderlands"), JSON.stringify(snapshot({ worldId: "mistwood" })));
assert(getSaveMetadata("borderlands")?.valid === false, "Expliziter Nebelwald-Snapshot wird als Grenzmark akzeptiert");
console.error = originalError;

storage.setItem(getSaveKey("borderlands"), JSON.stringify(snapshot({ worldId: "borderlands" })));
storage.setItem(getSaveKey("mistwood"), JSON.stringify(snapshot({ worldId: "mistwood" })));
deleteSaveGame("mistwood");
assert(storage.getItem(getSaveKey("borderlands")) !== null, "Löschen des Nebelwald-Saves entfernt den Grenzmark-Save");
assert(storage.getItem(getSaveKey("mistwood")) === null, "Nebelwald-Save wurde nicht gelöscht");

storage.clear();
saveGameState({
  state: runtimeState("mistwood"),
  worldId: "mistwood",
  gameVersion: "1.18.19",
  saveType: "manual",
  wallSlots: [],
  insideSlots: [],
  castleSlots: [],
  view: { zoom: 0.48, camX: 1500, camY: 1100 },
});
assert(JSON.parse(storage.getItem(getSaveKey("mistwood"))).worldId === "mistwood", "Neuer Snapshot speichert seine worldId nicht");
assert(storage.getItem(getSaveKey("borderlands")) === null, "Nebelwald-Speicherung überschreibt den Grenzmark-Schlüssel");
let stateWorldMismatchRejected = false;
try {
  saveGameState({
    state: runtimeState("mistwood"),
    worldId: "borderlands",
    gameVersion: "1.18.19",
    saveType: "manual",
    wallSlots: [], insideSlots: [], castleSlots: [], view: {},
  });
} catch { stateWorldMismatchRejected = true; }
assert(stateWorldMismatchRejected, "Widerspruch zwischen laufender Welt und Ziel-Slot wurde nicht abgelehnt");

const legacyProfile = normalizeWorldMapProfile({
  format: 2,
  selectedWorldId: "mistwood",
  lastPlayedWorldId: "borderlands",
  worlds: { borderlands: { bestWave: 24, currentWave: 25, bossesDefeated: 3, bonusObjectivesCompleted: 11 } },
  commander: { unlockedPerks: ["gold-crate", "timber-convoy"], activePerks: ["gold-crate"] },
});
assert(legacyProfile.format === 3, "Format-2-Profil wird nicht auf Format 3 normalisiert");
assert(legacyProfile.selectedWorldId === "mistwood", "Ausgewählte bekannte Welt des alten Profils geht verloren");
assert(legacyProfile.worlds.borderlands.bestWave === 24 && legacyProfile.worlds.borderlands.bossesDefeated === 3, "Grenzmark-Fortschritt des alten Profils geht verloren");
assert(legacyProfile.commander.unlockedPerks.length === 2 && legacyProfile.commander.activePerks[0] === "gold-crate", "Kommandantenvorteile des alten Profils gehen verloren");

const multiworldProfile = normalizeWorldMapProfile({
  ...createWorldMapProfile(),
  worlds: {
    borderlands: { bestWave: 32, completed: true, bossesDefeated: 4, bonusObjectivesCompleted: 12 },
    mistwood: { bestWave: 7, currentWave: 8, bossesDefeated: 1, bonusObjectivesCompleted: 3 },
  },
});
assert(multiworldProfile.worlds.borderlands.bestWave === 32, "Grenzmark-Fortschritt im Mehrweltprofil geht verloren");
assert(multiworldProfile.worlds.mistwood.bestWave === 7 && multiworldProfile.worlds.mistwood.bonusObjectivesCompleted === 3, "Nebelwald-Fortschritt im Mehrweltprofil geht verloren");

saveWorldMapProfile(multiworldProfile);
const reloadedMultiworldProfile = loadWorldMapProfile();
assert(reloadedMultiworldProfile.worlds.borderlands.bestWave === 32, "Grenzmark-Fortschritt muss Speichern/Laden überstehen");
assert(reloadedMultiworldProfile.worlds.mistwood.bestWave === 7, "Nebelwald-Fortschritt muss Speichern/Laden überstehen");

const syncedMistwoodProfile = syncWorldMapProfileFromState(reloadedMultiworldProfile, {
  worldId: "mistwood",
  wave: 6,
  campaign: { highestCompletedWave: 5, milestoneRewardsClaimed: [] },
  worldRun: { bonusObjectivesCompleted: 4, bonusObjectivesFailed: 1, heroBossWavesSurvived: [] },
});
assert(syncedMistwoodProfile.worlds.borderlands.bestWave === 32, "Ein Nebelwald-Sync darf die Grenzmark nicht überschreiben");
assert(syncedMistwoodProfile.worlds.mistwood.currentWave === 6, "Der Sync muss den ausdrücklich gewählten Weltfortschritt aktualisieren");
const mistwoodMapView = getWorldMapView(syncedMistwoodProfile).worlds.find((world) => world.id === "mistwood");
assert(mistwoodMapView?.progress.currentWave === 6, "Die Kartenansicht muss weltbezogenen Fortschritt liefern");
assert(mistwoodMapView?.underConstruction === true && mistwoodMapView?.playable === false, "Nebelwald darf trotz vorbereitetem Fortschritt nicht spielbar sein");

const borderlandsOnly = normalizeWorldMapProfile({
  ...createWorldMapProfile(),
  worlds: { borderlands: { completed: true, bossesDefeated: 2, bonusObjectivesCompleted: 12 } },
});
assert(getCommanderPointSummary(borderlandsOnly).earned === 42, "Grenzmark-Kommandantenpunkte haben sich ohne Welt-2-Fortschritt verändert");

const campaignState = { wave: 32, campaign: createCampaignState(32) };
const victory = resolveCampaignWave(campaignState, 32);
assert(CAMPAIGN_FINAL_WAVE === 32 && victory.victory === true && victory.campaign.victoryPending === true, "Grenzmark-Abschluss in Welle 32 hat sich verändert");
campaignState.wave = 33;
continueCampaignInEndlessMode(campaignState);
assert(campaignState.campaign.mode === "endless" && campaignState.campaign.completed === true, "Endlosmodus ab Welle 33 hat sich verändert");

storage.clear();
storage.setItem(getSaveKey("borderlands"), JSON.stringify(snapshot()));
const loadedState = runtimeState("borderlands");
const loaded = loadGameState({
  state: loadedState,
  worldId: "borderlands",
  BUILD: { soldier: { kind: "unit", name: "Bogenschütze" } },
  wallSlots: [],
  insideSlots: [],
  castleSlots: [],
});
assert(loadedState.units[0]?.x === 812.5 && loadedState.units[0]?.targetX === 900, "Gespeicherte Einheitenpositionen wurden zurückgesetzt");
assert(loaded.view.zoom === 0.73 && loaded.view.camX === 1512.25 && loaded.view.camY === 1114.75, "Gespeicherte Kamera wurde zurückgesetzt");

const safeProfile = createWorldMapProfile();
globalThis.localStorage = { getItem: () => null, setItem: () => { throw new Error("Speicher gesperrt"); } };
const originalWarn = console.warn;
console.warn = () => {};
let storageFailureHandled = true;
try { saveWorldMapProfile(safeProfile); } catch { storageFailureHandled = false; }
console.warn = originalWarn;
globalThis.localStorage = storage;
assert(storageFailureHandled, "LocalStorage-Schreibfehler lässt die Kampagnenkarte abstürzen");

const main = read("js/main.js");
const sw = read("service-worker.js");
for (const marker of [
  'const GAME_VERSION="1.18.19"',
  'const GAME_RELEASE_NAME="Mehrwelt-Speicherfundament"',
  'let activeSessionWorldId=null',
  'activeSessionWorldId===world.id',
  'state={worldId:ACTIVE_WORLD_ID',
  'const sameMapVersion=/^1\\.(15|16|17|18|19)\\./',
]) assert(main.includes(marker), `Mehrwelt-Sitzungslogik fehlt: ${marker}`);
assert(sw.includes("'./js/world-definitions.js'"), "Weltdefinitionen fehlen im Service-Worker-App-Shell");

if (failures.length) {
  console.error("Mehrwelt-Save-Prüfung fehlgeschlagen:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Mehrwelt-Save-Prüfung erfolgreich: getrennte Welt-Slots, Legacy-Grenzmark-Save, Profilformat 3, weltweite Kommandantenpunkte, Welle 32/Endlosmodus sowie Kamera- und Einheitenpositionen bestätigt.");
