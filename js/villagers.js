import { stoneHousingCapacity, stoneWorkerCapacityBonus } from "./stone-buildings.js";

/**
 * Bewohner- und Arbeitersystem von Fortress Commander.
 *
 * v1.17.2 ersetzt die frühere Ein-Arbeiter-Zuweisung durch ein zentrales
 * Bevölkerungssystem mit mehreren Arbeitsplätzen, Mindestreserve und
 * freiwilligen Verteilungsprofilen. Bestehende Speicherstände werden beim
 * Synchronisieren automatisch übernommen.
 */

const WORKPLACE_CONFIG = Object.freeze({
  lumber: Object.freeze({ key: "lumber", label: "Holzfäller", job: "lumberjack", capacity: 4, icon: "🪵" }),
  quarry: Object.freeze({ key: "quarry", label: "Steinbruch", job: "stonecutter", capacity: 4, icon: "🪨" }),
  repair: Object.freeze({ key: "repair", label: "Handwerkerhaus", job: "craftsman", capacity: 3, icon: "👷" }),
  workshop: Object.freeze({ key: "workshop", label: "Werkstatt", job: "researcher", capacity: 3, icon: "⚒️" }),
  market: Object.freeze({ key: "market", label: "Marktplatz", job: "merchant", capacity: 2, icon: "🏪" }),
});

export const POPULATION_MODES = Object.freeze({
  manual: Object.freeze({ key: "manual", label: "Manuell", icon: "✋", description: "Du bestimmst jede Zuweisung selbst." }),
  balanced: Object.freeze({ key: "balanced", label: "Ausgewogen", icon: "⚖️", description: "Verteilt Bewohner möglichst gleichmäßig." }),
  expansion: Object.freeze({ key: "expansion", label: "Ausbau", icon: "🏗️", description: "Bevorzugt Holz, Stein und Werkstatt." }),
  defense: Object.freeze({ key: "defense", label: "Verteidigung", icon: "🛡️", description: "Bevorzugt Handwerker und Werkstatt." }),
  resources: Object.freeze({ key: "resources", label: "Rohstoffe", icon: "📦", description: "Bevorzugt Holz, Stein und Markt." }),
});

const AUTO_PRIORITY = Object.freeze({
  balanced: Object.freeze(["lumber", "quarry", "repair", "workshop", "market"]),
  expansion: Object.freeze(["lumber", "quarry", "workshop", "repair", "market"]),
  defense: Object.freeze(["repair", "workshop", "lumber", "quarry", "market"]),
  resources: Object.freeze(["lumber", "quarry", "market", "workshop", "repair"]),
});

export function createPopulationState() {
  return { mode: "manual", reserve: 1 };
}

export function ensurePopulationState(state) {
  const population = state.population && typeof state.population === "object"
    ? state.population
    : createPopulationState();
  population.mode = POPULATION_MODES[population.mode] ? population.mode : "manual";
  population.reserve = Math.max(0, Math.round(Number(population.reserve) || 0));
  state.population = population;
  return population;
}

export function serializePopulationState(population) {
  const source = population && typeof population === "object" ? population : {};
  return {
    mode: POPULATION_MODES[source.mode] ? source.mode : "manual",
    reserve: Math.max(0, Math.round(Number(source.reserve) || 0)),
  };
}

export function workplaceDefinition(keyOrBuilding) {
  const key = typeof keyOrBuilding === "string" ? keyOrBuilding : keyOrBuilding?.key;
  return WORKPLACE_CONFIG[key] || null;
}

export function workerCapacityForBuilding(building) {
  const baseCapacity = workplaceDefinition(building)?.capacity || 0;
  return baseCapacity + stoneWorkerCapacityBonus(building);
}

export function workforceEfficiencyForCount(count) {
  const workers = Math.max(0, Math.round(Number(count) || 0));
  if (workers <= 0) return 0;
  if (workers === 1) return 0.45;
  if (workers === 2) return 0.75;
  if (workers === 3) return 1;
  if (workers === 4) return 1.2;
  return 1.35;
}

export function residentCapacityForHouse(house) {
  const level = Math.max(1, Number(house?.level) || 1);
  const woodenCapacity = level >= 3 ? 5 : level >= 2 ? 4 : 2;
  return stoneHousingCapacity(house, woodenCapacity);
}

function releaseResident(resident, displaced = false) {
  resident.job = null;
  resident.workplaceId = null;
  resident.displaced = displaced === true;
}

function assignedWorkerIds(state, building) {
  return state.residents
    .filter((resident) => resident.workplaceId === building.bid)
    .map((resident) => resident.id);
}

function syncLegacyBuildingWorkerFields(state) {
  for (const building of state.buildings) {
    const definition = workplaceDefinition(building);
    if (!definition) continue;
    const ids = assignedWorkerIds(state, building);
    building.workerCount = ids.length;
    building.workerIds = ids;
    building.residentId = ids[0] || null;
    building.residentAssigned = ids.length > 0;
  }
}

export function syncResidents(state) {
  if (!Array.isArray(state.residents)) state.residents = [];
  if (!Array.isArray(state.buildings)) state.buildings = [];
  ensurePopulationState(state);

  const houses = state.buildings.filter((building) => building.key === "house");
  const validHouseIds = new Set(houses.map((house) => house.bid));
  const validWorkplaces = new Map(
    state.buildings
      .filter((building) => workplaceDefinition(building))
      .map((building) => [building.bid, building])
  );

  state.residents = state.residents.filter((resident) => validHouseIds.has(resident.homeId));

  for (const house of houses) {
    const capacity = residentCapacityForHouse(house);
    const ownedResidents = state.residents.filter((resident) => resident.homeId === house.bid);

    while (ownedResidents.length < capacity) {
      const resident = {
        id: ++state.nextResidentId,
        homeId: house.bid,
        job: null,
        workplaceId: null,
        displaced: false,
      };
      state.residents.push(resident);
      ownedResidents.push(resident);
    }

    while (ownedResidents.length > capacity) {
      const resident = ownedResidents.pop();
      state.residents = state.residents.filter((candidate) => candidate !== resident);
    }
  }

  // Alte Speicherstände hinterlegten nur residentId am Gebäude. Diese Belegung
  // wird einmalig auf die Bewohnerliste übertragen.
  for (const building of validWorkplaces.values()) {
    if (!building.residentId) continue;
    const alreadyAssigned = state.residents.some((resident) => resident.workplaceId === building.bid);
    if (alreadyAssigned) continue;
    const legacyResident = state.residents.find((resident) => resident.id === building.residentId && !resident.workplaceId);
    if (legacyResident) {
      const definition = workplaceDefinition(building);
      legacyResident.job = definition.job;
      legacyResident.workplaceId = building.bid;
      legacyResident.displaced = false;
    }
  }

  for (const resident of state.residents) {
    if (!resident.workplaceId) {
      if (!state.inWave) resident.displaced = false;
      continue;
    }
    const workplace = validWorkplaces.get(resident.workplaceId);
    if (!workplace) {
      releaseResident(resident, state.inWave === true);
      continue;
    }
    const definition = workplaceDefinition(workplace);
    resident.job = definition.job;
    resident.displaced = false;
  }

  // Überbelegungen aus fehlerhaften oder älteren Speicherständen werden sauber
  // auf die jeweilige Kapazität begrenzt.
  for (const building of validWorkplaces.values()) {
    const capacity = workerCapacityForBuilding(building);
    const workers = state.residents.filter((resident) => resident.workplaceId === building.bid);
    for (const resident of workers.slice(capacity)) releaseResident(resident, state.inWave === true);
  }

  syncLegacyBuildingWorkerFields(state);
  ensurePopulationState(state);
}

export function totalResidents(state) {
  syncResidents(state);
  return state.residents.length;
}

export function assignedResidents(state) {
  syncResidents(state);
  return state.residents.filter((resident) => resident.workplaceId).length;
}

export function displacedResidents(state) {
  syncResidents(state);
  return state.residents.filter((resident) => resident.displaced === true).length;
}

export function freeResidents(state) {
  syncResidents(state);
  return state.residents.filter((resident) => !resident.workplaceId && resident.displaced !== true).length;
}

export function workersForBuilding(state, building) {
  syncResidents(state);
  if (!building) return [];
  return state.residents.filter((resident) => resident.workplaceId === building.bid);
}

export function buildingWorkerCount(state, building) {
  if (!building) return 0;
  if (!Number.isFinite(Number(building.workerCount))) syncResidents(state);
  return Math.max(0, Number(building.workerCount) || 0);
}

export function buildingWorkforceEfficiency(state, building) {
  return workforceEfficiencyForCount(buildingWorkerCount(state, building));
}

export function buildingHasWorker(building) {
  return !workplaceDefinition(building) || Math.max(0, Number(building?.workerCount) || (building?.residentId ? 1 : 0)) > 0;
}

export function residentWorkforceAvailable(state, job) {
  syncResidents(state);
  return state.residents.filter((resident) => resident.job === job && resident.workplaceId).length;
}

export function craftsmanCapacity(state) {
  syncResidents(state);
  return state.residents.filter((resident) => resident.job === "craftsman" && resident.workplaceId).length;
}

export function workplaceGroupSummary(state, key) {
  syncResidents(state);
  const definition = workplaceDefinition(key);
  if (!definition) return null;
  const buildings = state.buildings.filter((building) => building.key === key);
  const workers = buildings.reduce((sum, building) => sum + (Number(building.workerCount) || 0), 0);
  const capacity = buildings.reduce((sum, building) => sum + workerCapacityForBuilding(building), 0);
  const efficiency = capacity > 0
    ? buildings.reduce((sum, building) => sum + workforceEfficiencyForCount(building.workerCount), 0) / buildings.length
    : 0;
  return { ...definition, buildings, workers, capacity, efficiency };
}

function findBuildingForAddition(state, key) {
  return state.buildings
    .filter((building) => building.key === key && buildingWorkerCount(state, building) < workerCapacityForBuilding(building))
    .sort((a, b) => buildingWorkerCount(state, a) - buildingWorkerCount(state, b) || a.bid - b.bid)[0] || null;
}

function findBuildingForRemoval(state, key) {
  return state.buildings
    .filter((building) => building.key === key && buildingWorkerCount(state, building) > 0)
    .sort((a, b) => buildingWorkerCount(state, b) - buildingWorkerCount(state, a) || b.bid - a.bid)[0] || null;
}

function addWorker(state, building) {
  const definition = workplaceDefinition(building);
  if (!definition) return false;
  if (buildingWorkerCount(state, building) >= workerCapacityForBuilding(building)) return false;
  const resident = state.residents.find((candidate) => !candidate.workplaceId && candidate.displaced !== true);
  if (!resident) return false;
  resident.job = definition.job;
  resident.workplaceId = building.bid;
  resident.displaced = false;
  syncLegacyBuildingWorkerFields(state);
  return true;
}

function removeWorker(state, building) {
  const workers = workersForBuilding(state, building);
  const resident = workers[workers.length - 1];
  if (!resident) return false;
  releaseResident(resident, false);
  syncLegacyBuildingWorkerFields(state);
  return true;
}

export function adjustWorkplaceWorkers(state, building, delta, { assignCraftsmen, showToast } = {}) {
  if (!building || !workplaceDefinition(building)) return false;
  syncResidents(state);
  if (state.inWave) {
    showToast?.("Arbeitsverteilung ist während eines Angriffs gesperrt");
    return false;
  }
  ensurePopulationState(state);
  const step = Math.sign(Number(delta) || 0);
  if (!step) return false;

  if (step > 0) {
    if (freeResidents(state) <= state.population.reserve) {
      showToast?.(`Mindestreserve von ${state.population.reserve} Bewohnern bleibt frei`);
      return false;
    }
    if (!addWorker(state, building)) {
      showToast?.("Kein freier Arbeitsplatz oder Bewohner verfügbar");
      return false;
    }
  } else if (!removeWorker(state, building)) {
    showToast?.("An diesem Gebäude arbeitet niemand");
    return false;
  }

  state.population.mode = "manual";
  assignCraftsmen?.();
  const count = buildingWorkerCount(state, building);
  showToast?.(`${workplaceDefinition(building).label}: ${count}/${workerCapacityForBuilding(building)} Bewohner`);
  return true;
}

export function adjustWorkforceGroup(state, key, delta, callbacks = {}) {
  syncResidents(state);
  const building = Number(delta) > 0
    ? findBuildingForAddition(state, key)
    : findBuildingForRemoval(state, key);
  if (!building) {
    callbacks.showToast?.(Number(delta) > 0 ? "Kein freier Arbeitsplatz in dieser Gruppe" : "In dieser Gruppe arbeitet niemand");
    return false;
  }
  return adjustWorkplaceWorkers(state, building, delta, callbacks);
}

function clearAssignments(state) {
  for (const resident of state.residents) {
    if (resident.displaced === true) continue;
    releaseResident(resident, false);
  }
  syncLegacyBuildingWorkerFields(state);
}

export function autoDistributeResidents(state, mode, { assignCraftsmen, showToast } = {}) {
  syncResidents(state);
  if (state.inWave) {
    showToast?.("Arbeitsverteilung ist während eines Angriffs gesperrt");
    return false;
  }
  if (!AUTO_PRIORITY[mode]) return false;

  const population = ensurePopulationState(state);
  population.mode = mode;
  clearAssignments(state);
  const usable = Math.max(0, freeResidents(state) - population.reserve);
  let assigned = 0;
  const priority = AUTO_PRIORITY[mode];

  // Erst Grundbesetzung aufbauen, danach zweite, dritte und vierte Schicht.
  for (let target = 1; target <= 4 && assigned < usable; target++) {
    for (const key of priority) {
      const buildings = state.buildings
        .filter((building) => building.key === key && workerCapacityForBuilding(building) >= target)
        .sort((a, b) => a.bid - b.bid);
      for (const building of buildings) {
        if (assigned >= usable) break;
        if (buildingWorkerCount(state, building) >= target) continue;
        if (addWorker(state, building)) assigned++;
      }
      if (assigned >= usable) break;
    }
  }

  syncResidents(state);
  assignCraftsmen?.();
  showToast?.(`${POPULATION_MODES[mode].label}: ${assignedResidents(state)} Bewohner verteilt, ${freeResidents(state)} frei`);
  return true;
}

export function setPopulationReserve(state, reserve, { assignCraftsmen, showToast, redistribute = true } = {}) {
  syncResidents(state);
  if (state.inWave) {
    showToast?.("Mindestreserve ist während eines Angriffs gesperrt");
    return false;
  }
  const population = ensurePopulationState(state);
  population.reserve = Math.max(0, Math.min(totalResidents(state), Math.round(Number(reserve) || 0)));
  if (redistribute && AUTO_PRIORITY[population.mode]) {
    return autoDistributeResidents(state, population.mode, { assignCraftsmen, showToast });
  }
  showToast?.(`Mindestreserve: ${population.reserve} Bewohner`);
  return true;
}

export function releaseBuildingResidents(state, building, { displaced = false } = {}) {
  if (!building) return 0;
  syncResidents(state);
  const workers = state.residents.filter((resident) => resident.workplaceId === building.bid);
  for (const resident of workers) releaseResident(resident, displaced);
  building.workerCount = 0;
  building.workerIds = [];
  building.residentId = null;
  building.residentAssigned = false;
  return workers.length;
}

// Kompatibilitätsfunktion für ältere UI-Aufrufe: ein Klick fügt einen Bewohner
// hinzu; bei voller Belegung wird einer abgezogen.
export function toggleBuildingResident(state, building, callbacks = {}) {
  const count = buildingWorkerCount(state, building);
  const capacity = workerCapacityForBuilding(building);
  return adjustWorkplaceWorkers(state, building, count >= capacity ? -1 : 1, callbacks);
}
