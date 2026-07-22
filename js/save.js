import { restoreSiegeState, serializeSiegeState } from "./siege.js";
import { restoreWarCouncilState, serializeWarCouncilState } from "./war-council.js";
import { normalizeVeteranSpecialization } from "./specializations.js";
import { restoreBonusObjectiveState, serializeBonusObjectiveState } from "./bonus-objectives.js";
import { restoreCampaignState, serializeCampaignState } from "./campaign.js";
import {
  MIDDLE_GATE_STONE_MAX_HP,
  MIDDLE_GATE_WOOD_MAX_HP,
  MIDDLE_WALL_STONE_MAX_HP,
  MIDDLE_WALL_WOOD_MAX_HP,
  OUTER_GATE_STONE_MAX_HP,
  OUTER_GATE_WOOD_MAX_HP,
  OUTER_WALL_STONE_MAX_HP,
  OUTER_WALL_WOOD_MAX_HP,
} from "./fortifications.js";

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

  if (slot.type === "wall" || slot.type === "outer-wall") {
    return wallSlots.indexOf(slot);
  }
  if (slot.type === "inside") return insideSlots.indexOf(slot);
  if (slot.type === "castle") return castleSlots.indexOf(slot);

  return -1;
}

const LEGACY_MIDDLE_TOWER_SEGMENTS = Object.freeze([2, 7, 12, 17]);
const LEGACY_OUTER_TOWER_SEGMENTS = Object.freeze([3, 10, 17, 24]);

function closestTowerSlotBySegment(type, segmentIndex, wallSlots) {
  const candidates = wallSlots.filter(
    (slot) => slot.type === type && slot.towerSpot === true
  );
  if (!candidates.length) return null;

  const exact = candidates.find((slot) => slot.i === segmentIndex);
  if (exact) return exact;

  const target = Number(segmentIndex);
  return candidates.reduce((best, slot) => {
    if (!best) return slot;
    return Math.abs(slot.i - target) < Math.abs(best.i - target) ? slot : best;
  }, null);
}

function getSlotByReference(reference, { wallSlots, insideSlots, castleSlots }) {
  const type = reference?.type;
  const index = Number(reference?.index);

  if (type === "wall" || type === "outer-wall") {
    const segmentIndex = Number(reference?.segmentIndex);
    if (Number.isInteger(segmentIndex)) {
      const slot = wallSlots.find(
        (candidate) =>
          candidate.type === type &&
          candidate.towerSpot === true &&
          candidate.i === segmentIndex
      );
      if (slot) return slot;
    }

    // Kompatibilität mit v1.15.4/v1.15.5: Die mittleren Plätze lagen
    // direkt auf den Segmentindizes 2/7/12/17. Die vier äußeren Plätze
    // folgten nach den zwanzig mittleren Slots als globale Indizes 20–23.
    if (Number.isInteger(index)) {
      if (type === "wall" && LEGACY_MIDDLE_TOWER_SEGMENTS.includes(index)) {
        return closestTowerSlotBySegment(type, index, wallSlots);
      }
      if (type === "outer-wall" && index >= 20 && index < 24) {
        return closestTowerSlotBySegment(
          type,
          LEGACY_OUTER_TOWER_SEGMENTS[index - 20],
          wallSlots
        );
      }

      const globalSlot = wallSlots[index];
      if (globalSlot?.type === type) return globalSlot;
    }

    throw new Error("Speicherstand enthält einen ungültigen Mauerturmplatz.");
  }

  const slotGroups = { inside: insideSlots, castle: castleSlots };
  const slots = slotGroups[type];
  if (!slots || !Number.isInteger(index) || index < 0 || index >= slots.length) {
    throw new Error("Speicherstand enthält einen ungültigen Bauplatz.");
  }

  return slots[index];
}


function remapCircularIndex(index, oldCount, newCount) {
  const sourceCount = Math.max(1, Number(oldCount) || 1);
  const targetCount = Math.max(1, Number(newCount) || 1);
  const sourceIndex = Math.max(0, Math.min(sourceCount - 1, Number(index) || 0));
  return Math.min(
    targetCount - 1,
    Math.floor(((sourceIndex + 0.5) * targetCount) / sourceCount)
  );
}

function remapSavedBuildingWallSlots(savedBuildings, oldWallCount, newWallCount) {
  if (oldWallCount === newWallCount) return savedBuildings;

  const usedWallSlots = new Set();
  return savedBuildings.map((building) => {
    if (building?.slot?.type !== "wall") return building;

    const preferred = remapCircularIndex(
      building.slot.index,
      oldWallCount,
      newWallCount
    );
    let mapped = preferred;
    for (let offset = 0; offset < newWallCount; offset++) {
      const clockwise = (preferred + offset) % newWallCount;
      const counterClockwise = (preferred - offset + newWallCount) % newWallCount;
      if (!usedWallSlots.has(clockwise)) {
        mapped = clockwise;
        break;
      }
      if (!usedWallSlots.has(counterClockwise)) {
        mapped = counterClockwise;
        break;
      }
    }
    usedWallSlots.add(mapped);
    return {
      ...building,
      slot: { ...building.slot, index: mapped },
    };
  });
}

function restoreMiddleWallState(
  savedWalls,
  currentWalls,
  { allowStone = false, woodMaxHp = null, stoneMaxHp = null } = {}
) {
  const oldCount = savedWalls.length;
  const newCount = currentWalls.length;

  currentWalls.forEach((wall, index) => {
    const sourceIndex = oldCount === newCount
      ? index
      : Math.min(
          oldCount - 1,
          Math.floor(((index + 0.5) * oldCount) / newCount)
        );
    const savedWall = savedWalls[sourceIndex];
    const built = savedWall?.built === undefined ? true : savedWall.built === true;
    const material = allowStone && savedWall?.material === "stone" ? "stone" : "wood";
    const targetMax = material === "stone"
      ? Math.max(1, Number(stoneMaxHp) || Number(wall.maxHp) || 1)
      : Math.max(1, Number(woodMaxHp) || Number(wall.maxHp) || 1);
    const savedMax = Math.max(1, Number(savedWall?.maxHp) || targetMax);
    const healthRatio = built
      ? Math.max(0, Math.min(1, (Number(savedWall?.hp) || 0) / savedMax))
      : 0;

    wall.material = material;
    wall.maxHp = targetMax;
    wall.built = built;
    wall.hp = built ? targetMax * healthRatio : 0;
  });
}

function serializeBuilding(building, slots) {
  const { base, slot, ...plainBuilding } = building;

  return {
    ...plainBuilding,
    expUpgradeStats: { ...(building.expUpgradeStats || {}) },
    slot: {
      type: slot?.type || null,
      index: getSlotIndex(slot, slots),
      segmentIndex:
        slot?.type === "wall" || slot?.type === "outer-wall"
          ? Number(slot.i)
          : null,
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
      heroOffering: Math.max(0, Number(state.heroOffering) || 0),
      heroSummoned: state.heroSummoned === true,
      heroFallen: state.heroFallen === true,
      nextUnitId: state.nextUnitId,
      nextBuildingId: state.nextBuildingId,
      nextResidentId: state.nextResidentId,
      research: { ...(state.research || {}) },
      walls: state.walls.map((wall) => ({
        material: wall.material === "stone" ? "stone" : "wood",
        built: wall.built === true,
        hp: wall.hp,
        maxHp: wall.maxHp,
      })),
      innerWalls: (state.innerWalls || []).map((wall) => ({
        material: wall.material === "stone" ? "stone" : "wood",
        built: wall.built !== false,
        hp: wall.hp,
        maxHp: wall.maxHp,
      })),
      middleGates: (state.middleGates || []).map((gate) => ({
        material: gate.material === "stone" ? "stone" : "wood",
        built: gate.built === true,
        hp: gate.hp,
        maxHp: gate.maxHp,
      })),
      outerWalls: (state.outerWalls || []).map((wall) => ({
        material: wall.material === "stone" ? "stone" : "wood",
        built: wall.built === true,
        hp: wall.hp,
        maxHp: wall.maxHp,
      })),
      outerGates: (state.outerGates || []).map((gate) => ({
        material: gate.material === "stone" ? "stone" : "wood",
        built: gate.built === true,
        hp: gate.hp,
        maxHp: gate.maxHp,
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
      warCouncil: serializeWarCouncilState(state.warCouncil, state.wave),
      bonusObjective: serializeBonusObjectiveState(state.bonusObjective, state.wave),
      campaign: serializeCampaignState(state.campaign, state.wave),
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
      ? slot.type === "wall" || slot.type === "outer-wall" || slot.type === "castle"
      : slot.type === "inside" &&
        (blueprint.slotRole === "statue"
          ? slot.role === "statue"
          : slot.role !== "statue");
  if (!allowedSlot) {
    throw new Error("Gebäude und Bauplatz passen im Speicherstand nicht zusammen.");
  }

  const { slot: _savedSlot, ...plainBuilding } = savedBuilding;
  const building = {
    ...plainBuilding,
    kind: "building",
    base: blueprint,
    slot,
    cooldown: 0,
    expUpgradeStats: { ...(savedBuilding.expUpgradeStats || {}) },
  };
  normalizeVeteranSpecialization(building);
  return building;
}

function restoreUnit(savedUnit, BUILD) {
  const blueprint = BUILD[savedUnit?.key];
  if (!blueprint || blueprint.kind !== "unit") {
    throw new Error("Speicherstand enthält eine unbekannte Einheit.");
  }

  const unit = {
    ...savedUnit,
    kind: "unit",
    base: blueprint,
    autoTarget: null,
    attackCd: 0,
    retargetCd: 0,
    targetPriority: savedUnit?.key === "soldier" && ["nearest", "fast", "strong"].includes(savedUnit.targetPriority)
      ? savedUnit.targetPriority
      : savedUnit?.key === "soldier" ? "nearest" : null,
    heroAbilityTime: savedUnit?.key === "hero" ? Math.max(0, Number(savedUnit.heroAbilityTime) || 0) : 0,
    heroAbilityCooldown: savedUnit?.key === "hero" ? Math.max(0, Number(savedUnit.heroAbilityCooldown) || 0) : 0,
    upgradeStats: { ...(savedUnit.upgradeStats || {}) },
  };
  normalizeVeteranSpecialization(unit);
  return unit;
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
  if (
    Array.isArray(savedState.innerWalls) &&
    savedState.innerWalls.length !== (state.innerWalls || []).length
  ) {
    throw new Error("Speicherstand passt nicht zum inneren Mauerring.");
  }

  const slotContext = { BUILD, wallSlots, insideSlots, castleSlots };
  const normalizedBuildings = remapSavedBuildingWallSlots(
    savedState.buildings,
    savedState.walls.length,
    state.walls.length
  );
  const buildings = normalizedBuildings.map((building) =>
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
    ...(Array.isArray(savedState.middleGates) ? savedState.middleGates : []),
    ...(Array.isArray(savedState.outerWalls) ? savedState.outerWalls : []),
    ...(Array.isArray(savedState.outerGates) ? savedState.outerGates : []),
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
    heroOffering: Math.max(0, Number(savedState.heroOffering) || 0),
    heroSummoned: savedState.heroSummoned === true || units.some((unit) => unit.key === "hero"),
    heroFallen: savedState.heroFallen === true,
    nextUnitId: Math.max(0, Number(savedState.nextUnitId) || 0),
    nextBuildingId: Math.max(0, Number(savedState.nextBuildingId) || 0),
    nextResidentId: Math.max(0, Number(savedState.nextResidentId) || 0),
    nextEnemyId: 0,
    research: { ...(savedState.research || {}) },
    buildings,
    units,
    residents,
    siege: restoreSiegeState(savedState.siege, savedState.wave),
    warCouncil: restoreWarCouncilState(savedState.warCouncil, savedState.wave),
    bonusObjective: null,
    campaign: restoreCampaignState(savedState.campaign, savedState.wave),
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

  // v1.14.6 reduziert den mittleren Ring von 24 auf 20 Segmente.
  // Ältere Spielstände werden proportional auf die neue Geometrie übertragen.
  restoreMiddleWallState(savedState.walls, state.walls, {
    allowStone: true,
    woodMaxHp: MIDDLE_WALL_WOOD_MAX_HP,
    stoneMaxHp: MIDDLE_WALL_STONE_MAX_HP,
  });

  const savedInnerWalls = Array.isArray(savedState.innerWalls)
    ? savedState.innerWalls
    : null;
  (state.innerWalls || []).forEach((wall, index) => {
    const savedWall = savedInnerWalls?.[index];
    const material = savedWall?.material === "stone" ? "stone" : "wood";
    const hasMaterial = Object.prototype.hasOwnProperty.call(savedWall || {}, "material");
    wall.material = material;
    wall.built = savedWall?.built !== false;
    const targetMax = material === "stone" ? wall.maxHp : wall.maxHp;
    if (savedWall && hasMaterial) {
      wall.maxHp = Math.max(1, Number(savedWall.maxHp) || targetMax);
      wall.hp = Math.max(0, Number(savedWall.hp) || 0);
    } else if (savedWall) {
      const legacyMax = Math.max(1, Number(savedWall.maxHp) || targetMax);
      const legacyRatio = Math.max(0, Math.min(1, (Number(savedWall.hp) || 0) / legacyMax));
      wall.maxHp = targetMax;
      wall.hp = wall.maxHp * legacyRatio;
    } else {
      wall.maxHp = targetMax;
      wall.hp = wall.maxHp;
    }
  });
  const savedMiddleGates = Array.isArray(savedState.middleGates)
    ? savedState.middleGates
    : null;
  (state.middleGates || []).forEach((gate, index) => {
    const savedGate = savedMiddleGates?.[index];
    const material = savedGate?.material === "stone" ? "stone" : "wood";
    const targetMax = material === "stone"
      ? MIDDLE_GATE_STONE_MAX_HP
      : MIDDLE_GATE_WOOD_MAX_HP;
    const savedMax = Math.max(1, Number(savedGate?.maxHp) || targetMax);
    const ratio = savedGate?.built === true
      ? Math.max(0, Math.min(1, (Number(savedGate?.hp) || 0) / savedMax))
      : 0;
    gate.material = material;
    gate.built = savedGate?.built === true;
    gate.maxHp = targetMax;
    gate.hp = gate.built ? targetMax * ratio : 0;
  });

  const savedOuterWalls = Array.isArray(savedState.outerWalls)
    ? savedState.outerWalls
    : null;
  if (savedOuterWalls?.length) {
    restoreMiddleWallState(savedOuterWalls, state.outerWalls || [], {
      allowStone: true,
      woodMaxHp: OUTER_WALL_WOOD_MAX_HP,
      stoneMaxHp: OUTER_WALL_STONE_MAX_HP,
    });
  } else {
    for (const wall of state.outerWalls || []) {
      wall.built = false;
      wall.hp = 0;
    }
  }


  const savedOuterGates = Array.isArray(savedState.outerGates)
    ? savedState.outerGates
    : null;
  (state.outerGates || []).forEach((gate, index) => {
    const savedGate = savedOuterGates?.[index];
    const material = savedGate?.material === "stone" ? "stone" : "wood";
    const targetMax = material === "stone"
      ? OUTER_GATE_STONE_MAX_HP
      : OUTER_GATE_WOOD_MAX_HP;
    const savedMax = Math.max(1, Number(savedGate?.maxHp) || targetMax);
    const ratio = savedGate?.built === true
      ? Math.max(0, Math.min(1, (Number(savedGate?.hp) || 0) / savedMax))
      : 0;
    gate.material = material;
    gate.built = savedGate?.built === true;
    gate.maxHp = targetMax;
    gate.hp = gate.built ? targetMax * ratio : 0;
  });

  for (const building of buildings) {
    building.slot.building = building;
  }

  if (state.heroSummoned && !state.units.some((unit) => unit.key === "hero" && unit.hp > 0)) {
    state.heroFallen = true;
  }

  state.bonusObjective = restoreBonusObjectiveState(
    savedState.bonusObjective,
    state,
    state.wave
  );

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
