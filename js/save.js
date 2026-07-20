import { restoreSiegeState, serializeSiegeState } from "./siege.js";

/**
 * Lokales Speichersystem von Fortress Commander.
 *
 * Spielstände werden ausschließlich zwischen den Wellen erzeugt. Beim Laden
 * werden flüchtige Kampfobjekte wie Gegner, Projektile, Partikel und Ziele
 * verworfen und die gespeicherten Gebäude wieder mit ihren Bauplätzen sowie
 * den aktuellen Blaupausen verbunden.
 */

const SAVE_KEY = "fortressCommander.save.v1";
const SAVE_FORMAT = 1;

function getSlotIndex(slot, { wallSlots, insideSlots, castleSlots }) {
  if (!slot) return -1;

  if (slot.type === "wall") return wallSlots.indexOf(slot);
  if (slot.type === "inside") return insideSlots.indexOf(slot);
  if (slot.type === "castle") return castleSlots.indexOf(slot);

  return -1;
}

function getSlotByReference(reference, { wallSlots, insideSlots, castleSlots }) {
  const slotGroups = {
    wall: wallSlots,
    inside: insideSlots,
    castle: castleSlots,
  };
  const slots = slotGroups[reference?.type];
  const index = Number(reference?.index);

  if (!slots || !Number.isInteger(index) || index < 0 || index >= slots.length) {
    throw new Error("Speicherstand enthält einen ungültigen Bauplatz.");
  }

  return slots[index];
}

function serializeBuilding(building, slots) {
  const { base, slot, ...plainBuilding } = building;

  return {
    ...plainBuilding,
    expUpgradeStats: { ...(building.expUpgradeStats || {}) },
    slot: {
      type: slot?.type || null,
      index: getSlotIndex(slot, slots),
    },
  };
}

function serializeUnit(unit) {
  const { base, autoTarget, ...plainUnit } = unit;

  return {
    ...plainUnit,
    autoTarget: null,
    upgradeStats: { ...(unit.upgradeStats || {}) },
  };
}

function createSnapshot({
  state,
  gameVersion,
  wallSlots,
  insideSlots,
  castleSlots,
  view,
  saveType = "manual",
}) {
  if (state.inWave) {
    throw new Error("Speichern ist nur zwischen den Wellen möglich.");
  }

  return {
    saveFormat: SAVE_FORMAT,
    gameVersion,
    savedAt: new Date().toISOString(),
    saveType: saveType === "auto" ? "auto" : "manual",
    state: {
      gold: state.gold,
      wood: state.wood,
      stone: state.stone,
      researchPoints: state.researchPoints,
      hp: state.hp,
      maxHp: state.maxHp,
      wave: state.wave,
      kills: state.kills,
      repairedHp: state.repairedHp,
      nextUnitId: state.nextUnitId,
      nextBuildingId: state.nextBuildingId,
      nextResidentId: state.nextResidentId,
      research: { ...(state.research || {}) },
      walls: state.walls.map((wall) => ({
        built: wall.built === true,
        hp: wall.hp,
        maxHp: wall.maxHp,
      })),
      innerWalls: (state.innerWalls || []).map((wall) => ({
        built: true,
        hp: wall.hp,
        maxHp: wall.maxHp,
      })),
      buildings: state.buildings.map((building) =>
        serializeBuilding(building, {
          wallSlots,
          insideSlots,
          castleSlots,
        })
      ),
      units: state.units.map(serializeUnit),
      residents: state.residents.map((resident) => ({ ...resident })),
      siege: serializeSiegeState(state.siege),
    },
    view: {
      zoom: view?.zoom ?? 0.48,
      camX: view?.camX ?? null,
      camY: view?.camY ?? null,
    },
  };
}

function parseSnapshot() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  const snapshot = JSON.parse(raw);
  if (
    snapshot?.saveFormat !== SAVE_FORMAT ||
    !snapshot.state ||
    !Array.isArray(snapshot.state.walls) ||
    !Array.isArray(snapshot.state.buildings) ||
    !Array.isArray(snapshot.state.units) ||
    !Array.isArray(snapshot.state.residents)
  ) {
    throw new Error("Speicherstand ist ungültig oder veraltet.");
  }

  return snapshot;
}

function restoreBuilding(savedBuilding, context) {
  const blueprint = context.BUILD[savedBuilding?.key];
  if (!blueprint || blueprint.kind === "unit") {
    throw new Error("Speicherstand enthält ein unbekanntes Gebäude.");
  }

  const slot = getSlotByReference(savedBuilding.slot, context);
  const allowedSlot =
    blueprint.kind === "tower"
      ? slot.type === "wall" || slot.type === "castle"
      : slot.type === "inside" &&
        (blueprint.slotRole === "statue"
          ? slot.role === "statue"
          : slot.role !== "statue");
  if (!allowedSlot) {
    throw new Error("Gebäude und Bauplatz passen im Speicherstand nicht zusammen.");
  }

  const { slot: _savedSlot, ...plainBuilding } = savedBuilding;
  return {
    ...plainBuilding,
    kind: "building",
    base: blueprint,
    slot,
    cooldown: 0,
    expUpgradeStats: { ...(savedBuilding.expUpgradeStats || {}) },
  };
}

function restoreUnit(savedUnit, BUILD) {
  const blueprint = BUILD[savedUnit?.key];
  if (!blueprint || blueprint.kind !== "unit") {
    throw new Error("Speicherstand enthält eine unbekannte Einheit.");
  }

  return {
    ...savedUnit,
    kind: "unit",
    base: blueprint,
    autoTarget: null,
    attackCd: 0,
    retargetCd: 0,
    upgradeStats: { ...(savedUnit.upgradeStats || {}) },
  };
}

export function saveGameState(context) {
  const snapshot = createSnapshot(context);
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));

  return {
    savedAt: snapshot.savedAt,
    gameVersion: snapshot.gameVersion,
    wave: snapshot.state.wave,
    saveType: snapshot.saveType,
  };
}

export function loadGameState({
  state,
  BUILD,
  wallSlots,
  insideSlots,
  castleSlots,
}) {
  const snapshot = parseSnapshot();
  if (!snapshot) {
    throw new Error("Kein Speicherstand vorhanden.");
  }

  const savedState = snapshot.state;
  if (savedState.walls.length !== state.walls.length) {
    throw new Error("Speicherstand passt nicht zur aktuellen Karte.");
  }
  if (
    Array.isArray(savedState.innerWalls) &&
    savedState.innerWalls.length !== (state.innerWalls || []).length
  ) {
    throw new Error("Speicherstand passt nicht zum inneren Mauerring.");
  }

  const slotContext = { BUILD, wallSlots, insideSlots, castleSlots };
  const buildings = savedState.buildings.map((building) =>
    restoreBuilding(building, slotContext)
  );
  const units = savedState.units.map((unit) => restoreUnit(unit, BUILD));
  const residents = savedState.residents.map((resident) => ({ ...resident }));
  const occupiedSlots = new Set();

  for (const building of buildings) {
    if (occupiedSlots.has(building.slot)) {
      throw new Error("Speicherstand belegt einen Bauplatz mehrfach.");
    }
    occupiedSlots.add(building.slot);
  }

  for (const wall of [
    ...savedState.walls,
    ...(Array.isArray(savedState.innerWalls) ? savedState.innerWalls : []),
  ]) {
    if (!Number.isFinite(Number(wall?.hp)) || !Number.isFinite(Number(wall?.maxHp))) {
      throw new Error("Speicherstand enthält ungültige Mauerwerte.");
    }
  }

  for (const slot of [...wallSlots, ...insideSlots, ...castleSlots]) {
    slot.building = null;
  }

  Object.assign(state, {
    gold: Number(savedState.gold) || 0,
    wood: Number(savedState.wood) || 0,
    stone: Number(savedState.stone) || 0,
    researchPoints: Number(savedState.researchPoints) || 0,
    hp: Number(savedState.hp) || 0,
    maxHp: Number(savedState.maxHp) || 1200,
    wave: Math.max(1, Number(savedState.wave) || 1),
    kills: Math.max(0, Number(savedState.kills) || 0),
    repairedHp: Math.max(0, Number(savedState.repairedHp) || 0),
    nextUnitId: Math.max(0, Number(savedState.nextUnitId) || 0),
    nextBuildingId: Math.max(0, Number(savedState.nextBuildingId) || 0),
    nextResidentId: Math.max(0, Number(savedState.nextResidentId) || 0),
    research: { ...(savedState.research || {}) },
    buildings,
    units,
    residents,
    siege: restoreSiegeState(savedState.siege, savedState.wave),
    spawnQueue: [],
    enemies: [],
    projectiles: [],
    particles: [],
    craftsmen: [],
    inWave: false,
    toSpawn: 0,
    spawnTimer: 0,
    supportTimer: 0,
    repairActive: false,
  });

  savedState.walls.forEach((savedWall, index) => {
    // Spielstände vor v1.14.4 besaßen die mittlere Palisade bereits vollständig.
    // Fehlt das neue Kennzeichen, bleibt dieser Fortschritt aus Kompatibilitäts-
    // gründen erhalten. Neue Partien starten dagegen mit ungebauten Abschnitten.
    const built = savedWall?.built === undefined ? true : savedWall.built === true;
    state.walls[index].built = built;
    state.walls[index].hp = built ? Math.max(0, Number(savedWall.hp) || 0) : 0;
    state.walls[index].maxHp = Math.max(1, Number(savedWall.maxHp) || state.walls[index].maxHp);
  });

  const savedInnerWalls = Array.isArray(savedState.innerWalls)
    ? savedState.innerWalls
    : null;
  (state.innerWalls || []).forEach((wall, index) => {
    const savedWall = savedInnerWalls?.[index];
    // Ältere Spielstände erhalten den neuen inneren Ring vollständig intakt.
    wall.built = true;
    wall.maxHp = Math.max(1, Number(savedWall?.maxHp) || wall.maxHp);
    wall.hp = savedWall
      ? Math.max(0, Number(savedWall.hp) || 0)
      : wall.maxHp;
  });
  for (const building of buildings) {
    building.slot.building = building;
  }

  return {
    savedAt: snapshot.savedAt,
    gameVersion: snapshot.gameVersion,
    wave: state.wave,
    view: {
      zoom: Number.isFinite(Number(snapshot.view?.zoom))
        ? Number(snapshot.view.zoom)
        : null,
      camX: Number.isFinite(Number(snapshot.view?.camX)) && snapshot.view?.camX !== null
        ? Number(snapshot.view.camX)
        : null,
      camY: Number.isFinite(Number(snapshot.view?.camY)) && snapshot.view?.camY !== null
        ? Number(snapshot.view.camY)
        : null,
    },
  };
}

export function deleteSaveGame() {
  const existed = localStorage.getItem(SAVE_KEY) !== null;
  localStorage.removeItem(SAVE_KEY);
  return existed;
}

export function getSaveMetadata() {
  try {
    const snapshot = parseSnapshot();
    if (!snapshot) return null;

    return {
      valid: true,
      savedAt: snapshot.savedAt,
      gameVersion: snapshot.gameVersion,
      wave: snapshot.state.wave,
      saveType: snapshot.saveType === "auto" ? "auto" : "manual",
    };
  } catch (error) {
    console.error("Speicherstand konnte nicht gelesen werden:", error);
    return { valid: false };
  }
}
