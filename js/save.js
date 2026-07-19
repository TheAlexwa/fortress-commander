/**
 * Lokales Speichersystem von Fortress Commander.
 *
 * Phase 4.1 speichert einen sauberen Spielstand zwischen den Wellen.
 * Laufzeitobjekte wie Gegner, Projektile, Partikel und Zielreferenzen
 * werden absichtlich nicht gespeichert.
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
}) {
  if (state.inWave) {
    throw new Error("Speichern ist nur zwischen den Wellen möglich.");
  }

  return {
    saveFormat: SAVE_FORMAT,
    gameVersion,
    savedAt: new Date().toISOString(),
    state: {
      gold: state.gold,
      wood: state.wood,
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
    },
    view: {
      zoom: view?.zoom ?? 0.48,
      camX: view?.camX ?? null,
      camY: view?.camY ?? null,
    },
  };
}

export function saveGameState(context) {
  const snapshot = createSnapshot(context);
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));

  return {
    savedAt: snapshot.savedAt,
    gameVersion: snapshot.gameVersion,
    wave: snapshot.state.wave,
  };
}

export function getSaveMetadata() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    const snapshot = JSON.parse(raw);

    if (snapshot.saveFormat !== SAVE_FORMAT || !snapshot.state) {
      return { valid: false };
    }

    return {
      valid: true,
      savedAt: snapshot.savedAt,
      gameVersion: snapshot.gameVersion,
      wave: snapshot.state.wave,
    };
  } catch (error) {
    console.error("Speicherstand konnte nicht gelesen werden:", error);
    return { valid: false };
  }
}
