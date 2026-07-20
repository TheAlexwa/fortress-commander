/**
 * Bewohner- und Arbeitersystem von Fortress Commander.
 *
 * Das Modul verwaltet Bewohner, Arbeitsplätze und Zuweisungen. Funktionen,
 * die UI oder Handwerkerfiguren betreffen, werden als Rückrufe übergeben,
 * damit das Modul nicht direkt auf main.js zugreifen muss.
 */

const WORKER_BUILDINGS = new Set(["lumber", "quarry", "repair", "market"]);

export function residentCapacityForHouse(house) {
  return (house.level || 1) >= 2 ? 4 : 2;
}

export function syncResidents(state) {
  const houses = state.buildings.filter((building) => building.key === "house");
  const validHouseIds = new Set(houses.map((house) => house.bid));

  state.residents = state.residents.filter((resident) =>
    validHouseIds.has(resident.homeId)
  );

  for (const house of houses) {
    const capacity = residentCapacityForHouse(house);
    const ownedResidents = state.residents.filter(
      (resident) => resident.homeId === house.bid
    );

    while (ownedResidents.length < capacity) {
      const resident = {
        id: ++state.nextResidentId,
        homeId: house.bid,
        job: null,
        workplaceId: null,
      };
      state.residents.push(resident);
      ownedResidents.push(resident);
    }

    while (ownedResidents.length > capacity) {
      const resident = ownedResidents.pop();
      const workplace = state.buildings.find(
        (building) => building.bid === resident.workplaceId
      );

      if (workplace) {
        workplace.residentId = null;
        workplace.residentAssigned = false;
      }

      state.residents = state.residents.filter(
        (candidate) => candidate !== resident
      );
    }
  }

  for (const building of state.buildings.filter((candidate) =>
    WORKER_BUILDINGS.has(candidate.key)
  )) {
    if (
      building.residentId &&
      !state.residents.some(
        (resident) => resident.id === building.residentId
      )
    ) {
      building.residentId = null;
      building.residentAssigned = false;
    }
  }
}

export function totalResidents(state) {
  syncResidents(state);
  return state.residents.length;
}

export function assignedResidents(state) {
  syncResidents(state);
  return state.residents.filter((resident) => resident.workplaceId).length;
}

export function freeResidents(state) {
  return Math.max(0, totalResidents(state) - assignedResidents(state));
}

export function buildingHasWorker(building) {
  return !WORKER_BUILDINGS.has(building.key) || Boolean(building.residentId);
}

export function residentWorkforceAvailable(state, job) {
  syncResidents(state);
  return state.residents.filter(
    (resident) => resident.job === job && resident.workplaceId
  ).length;
}

export function craftsmanCapacity(state) {
  return state.buildings
    .filter(
      (building) =>
        building.key === "repair" && buildingHasWorker(building)
    )
    .reduce((sum) => sum + 1, 0);
}

export function toggleBuildingResident(
  state,
  building,
  { assignCraftsmen, showToast }
) {
  if (
    !building ||
    building.kind !== "building" ||
    !WORKER_BUILDINGS.has(building.key)
  ) {
    return false;
  }

  syncResidents(state);

  if (building.residentId) {
    const resident = state.residents.find(
      (candidate) => candidate.id === building.residentId
    );

    if (resident) {
      resident.job = null;
      resident.workplaceId = null;
    }

    building.residentId = null;
    building.residentAssigned = false;
    state.craftsmen = state.craftsmen.filter(
      (craftsman) =>
        craftsman.home !== building &&
        craftsman.residentId !== (resident && resident.id)
    );

    assignCraftsmen();
    showToast("Bewohner abgezogen");
    return true;
  }

  const resident = state.residents.find(
    (candidate) => !candidate.workplaceId
  );

  if (!resident) {
    showToast("Kein freier Bewohner – errichte oder verbessere ein Wohnhaus");
    return false;
  }

  resident.job =
    building.key === "lumber"
      ? "lumberjack"
      : building.key === "quarry"
        ? "stonecutter"
        : building.key === "market"
          ? "merchant"
          : "craftsman";
  resident.workplaceId = building.bid;
  building.residentId = resident.id;
  building.residentAssigned = true;

  assignCraftsmen();
  showToast(
    building.key === "repair"
      ? "Handwerker zugewiesen – Einheit ist sichtbar"
      : building.key === "market"
        ? "Händler zugewiesen – Goldproduktion aktiv"
        : building.key === "quarry"
          ? "Steinmetz zugewiesen – Steinproduktion aktiv"
          : "Bewohner zugewiesen"
  );

  return true;
}
