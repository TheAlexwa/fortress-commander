/**
 * Wirtschaftssystem von Fortress Commander.
 *
 * Dieses Modul bleibt absichtlich unabhängig vom globalen Spielzustand.
 * Benötigte Zustände und Hilfsfunktionen werden von main.js übergeben.
 */

export function getRepairBuildingBaseHpPerTick(building) {
  const level = Math.max(1, Math.min(5, Number(building?.level) || 1));
  return 16 + (level - 1) * 2;
}

export function getSupportProductionPerSecond(building, buildingHasWorker) {
  const level = building.level || 1;

  if (building.key === "lumber") {
    return buildingHasWorker(building) ? 0.55 + (level - 1) * 0.30 : 0;
  }

  if (building.key === "quarry") {
    return buildingHasWorker(building) ? 0.35 + (level - 1) * 0.20 : 0;
  }

  if (building.key === "market") {
    return buildingHasWorker(building) ? level : 0;
  }

  return 0;
}

export function getTotalGoldPerSecond(
  state,
  { syncResidents, residentCapacityForHouse, buildingHasWorker }
) {
  syncResidents();

  const housing = state.buildings
    .filter((building) => building.key === "house")
    .reduce(
      (sum, house) => sum + residentCapacityForHouse(house) * 0.18,
      0
    );

  const markets = state.buildings
    .filter((building) => building.key === "market")
    .reduce(
      (sum, building) =>
        sum + getSupportProductionPerSecond(building, buildingHasWorker),
      0
    );

  return housing + markets;
}

export function getMarketLossPercent(building) {
  if (building && building.level >= 3) return 10;
  if (building && building.level >= 2) return 15;
  return 20;
}

export function getMarketOutput(amount, building) {
  return Math.floor(amount * (1 - getMarketLossPercent(building) / 100));
}

export function runEconomySupportTick(
  state,
  {
    paused,
    gameOver,
    syncResidents,
    residentCapacityForHouse,
    buildingHasWorker,
  }
) {
  if (!state.inWave || paused || gameOver) return;

  let woodGain = 0;
  let stoneGain = 0;

  for (const building of state.buildings) {
    if (building.key === "lumber") {
      woodGain += getSupportProductionPerSecond(
        building,
        buildingHasWorker
      );
    }
    if (building.key === "quarry") {
      stoneGain += getSupportProductionPerSecond(
        building,
        buildingHasWorker
      );
    }
  }

  state.wood += woodGain;
  state.stone += stoneGain;
  state.gold += getTotalGoldPerSecond(state, {
    syncResidents,
    residentCapacityForHouse,
    buildingHasWorker,
  });
}
