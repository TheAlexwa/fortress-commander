import { workforceEfficiencyForCount } from "./villagers.js";
import {
  stoneMarketLossReduction,
  stoneProductionMultiplier,
  stoneRepairMultiplier,
} from "./stone-buildings.js";

/**
 * Wirtschaftssystem von Fortress Commander.
 *
 * Dieses Modul bleibt absichtlich unabhängig vom globalen Spielzustand.
 * Benötigte Zustände und Hilfsfunktionen werden von main.js übergeben.
 */

export function getRepairBuildingBaseHpPerTick(building) {
  const level = Math.max(1, Math.min(5, Number(building?.level) || 1));
  return (16 + (level - 1) * 2) * stoneRepairMultiplier(building);
}

export function getSupportProductionPerSecond(building, _buildingHasWorker) {
  const level = building.level || 1;
  const efficiency = workforceEfficiencyForCount(building.workerCount || (building.residentId ? 1 : 0));

  if (building.key === "lumber") {
    return (0.55 + (level - 1) * 0.30) * efficiency * stoneProductionMultiplier(building);
  }

  if (building.key === "quarry") {
    return (0.35 + (level - 1) * 0.20) * efficiency * stoneProductionMultiplier(building);
  }

  if (building.key === "market") {
    // Zwei Händler entsprechen 100 % des bisherigen Marktertrags. Ein einzelner
    // Händler hält den Markt bereits eingeschränkt offen.
    return (level / 0.75) * efficiency * stoneProductionMultiplier(building);
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
  const baseLoss = building && building.level >= 3 ? 10 : building && building.level >= 2 ? 15 : 20;
  return Math.max(5, baseLoss - stoneMarketLossReduction(building));
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
    productionMultiplier = 1,
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

  const multiplier = Math.max(0, Number(productionMultiplier) || 0);
  state.wood += woodGain * multiplier;
  state.stone += stoneGain * multiplier;
  state.gold += getTotalGoldPerSecond(state, {
    syncResidents,
    residentCapacityForHouse,
    buildingHasWorker,
  }) * multiplier;
}
