/**
 * Steinbau für Versorgungsgebäude.
 *
 * v1.17.3 führt nach der normalen Holz-Ausbaureihe eine dauerhafte zweite
 * Baustufe ein. Die Daten bleiben bewusst in einem kleinen Modul, damit
 * Bevölkerung, Wirtschaft, Darstellung und Speicherstände dieselben Werte
 * verwenden.
 */

export const STONE_BUILDING_RESEARCH_ID = "stone_building";
export const STONE_BUILDING_REPAIR_STONE_PER_TICK = 0.1;

const STONE_BUILDING_CONFIG = Object.freeze({
  house: Object.freeze({
    label: "Steinhaus",
    requiredLevel: 3,
    cost: Object.freeze({ gold: 110, wood: 90, stone: 70, research: 1 }),
    hpMultiplier: 2,
    housingCapacity: 7,
    description: "+2 Bewohnerplätze, 6 Truppenplätze, deutlich mehr Leben und besserer Schutz vor Plünderern.",
  }),
  lumber: Object.freeze({
    label: "Steinsägewerk",
    requiredLevel: 5,
    cost: Object.freeze({ gold: 150, wood: 120, stone: 100, research: 1 }),
    hpMultiplier: 1.9,
    workerBonus: 1,
    productionMultiplier: 1.15,
    description: "+1 Arbeitsplatz, +15 % Holzproduktion und deutlich mehr Leben.",
  }),
  quarry: Object.freeze({
    label: "Großer Steinbruch",
    requiredLevel: 5,
    cost: Object.freeze({ gold: 170, wood: 105, stone: 125, research: 2 }),
    hpMultiplier: 1.85,
    workerBonus: 1,
    productionMultiplier: 1.18,
    description: "+1 Arbeitsplatz, +18 % Steinproduktion und deutlich mehr Leben.",
  }),
  workshop: Object.freeze({
    label: "Steinwerkstatt",
    requiredLevel: 5,
    cost: Object.freeze({ gold: 205, wood: 145, stone: 140, research: 2 }),
    hpMultiplier: 1.9,
    workerBonus: 1,
    researchCostMultiplier: 0.95,
    description: "+1 Arbeitsplatz, weitere 5 % günstigere Forschung und deutlich mehr Leben.",
  }),
  repair: Object.freeze({
    label: "Steinmetzhütte",
    requiredLevel: 5,
    cost: Object.freeze({ gold: 185, wood: 130, stone: 120, research: 2 }),
    hpMultiplier: 1.95,
    workerBonus: 1,
    repairMultiplier: 1.18,
    description: "+1 Arbeitsplatz, +18 % Reparaturleistung und deutlich mehr Leben.",
  }),
  market: Object.freeze({
    label: "Handelshaus",
    requiredLevel: 3,
    cost: Object.freeze({ gold: 225, wood: 165, stone: 150, research: 2 }),
    hpMultiplier: 1.9,
    workerBonus: 1,
    productionMultiplier: 1.1,
    marketLossReduction: 3,
    description: "+1 Arbeitsplatz, +10 % Einkommen, 3 Prozentpunkte weniger Handelsverlust und deutlich mehr Leben.",
  }),
});

export function stoneBuildingDefinition(keyOrBuilding) {
  const key = typeof keyOrBuilding === "string" ? keyOrBuilding : keyOrBuilding?.key;
  return STONE_BUILDING_CONFIG[key] || null;
}

export function isStoneUpgradeableBuilding(building) {
  return Boolean(
    building &&
    building.kind === "building" &&
    building.base?.kind !== "tower" &&
    stoneBuildingDefinition(building)
  );
}

export function isStoneBuilding(building) {
  return isStoneUpgradeableBuilding(building) && building.material === "stone";
}

export function normalizeStoneBuilding(building) {
  if (!isStoneUpgradeableBuilding(building)) return building;
  building.material = building.material === "stone" ? "stone" : "wood";
  building.buildTier = building.material === "stone" ? 2 : 1;
  return building;
}

export function stoneBuildingDisplayName(building, fallback = "Gebäude") {
  return isStoneBuilding(building)
    ? stoneBuildingDefinition(building)?.label || fallback
    : fallback;
}

export function stoneWorkerCapacityBonus(building) {
  return isStoneBuilding(building)
    ? Math.max(0, Number(stoneBuildingDefinition(building)?.workerBonus) || 0)
    : 0;
}

export function stoneHousingCapacity(building, fallback) {
  if (!isStoneBuilding(building)) return fallback;
  return Math.max(fallback, Number(stoneBuildingDefinition(building)?.housingCapacity) || fallback);
}

export function stoneProductionMultiplier(building) {
  return isStoneBuilding(building)
    ? Math.max(1, Number(stoneBuildingDefinition(building)?.productionMultiplier) || 1)
    : 1;
}

export function stoneRepairMultiplier(building) {
  return isStoneBuilding(building)
    ? Math.max(1, Number(stoneBuildingDefinition(building)?.repairMultiplier) || 1)
    : 1;
}

export function stoneResearchCostMultiplier(building) {
  return isStoneBuilding(building)
    ? Math.min(1, Math.max(0.5, Number(stoneBuildingDefinition(building)?.researchCostMultiplier) || 1))
    : 1;
}

export function stoneMarketLossReduction(building) {
  return isStoneBuilding(building)
    ? Math.max(0, Number(stoneBuildingDefinition(building)?.marketLossReduction) || 0)
    : 0;
}

export function stonePlunderDamageMultiplier(building) {
  // Holzgebäude behalten die bestehende +40-%-Plündererwut. Steinbauten
  // erhalten stattdessen 25 % weniger Grundschaden.
  return isStoneBuilding(building) ? 0.75 : 1.4;
}

export function getStoneBuildingUpgrade(building, state) {
  const definition = stoneBuildingDefinition(building);
  if (!definition || !isStoneUpgradeableBuilding(building)) {
    return { supported: false, eligible: false, upgraded: false, reason: "Keine Steinaufwertung verfügbar" };
  }

  const upgraded = isStoneBuilding(building);
  const level = Math.max(1, Number(building.level) || 1);
  const wave = Math.max(1, Number(state?.wave) || 1);
  const researchReady = Math.max(0, Number(state?.research?.[STONE_BUILDING_RESEARCH_ID]) || 0) > 0;
  const levelReady = level >= definition.requiredLevel;
  const waveReady = wave >= 9;
  const inWave = state?.inWave === true;
  const cost = { ...definition.cost };
  const affordable = Boolean(state) &&
    Number(state.gold) >= cost.gold &&
    Number(state.wood) >= cost.wood &&
    Number(state.stone) >= cost.stone &&
    Number(state.researchPoints) >= cost.research;

  let reason = "";
  if (upgraded) reason = "Bereits als Steingebäude ausgebaut";
  else if (!levelReady) reason = `Zuerst Gebäudestufe ${definition.requiredLevel} erreichen`;
  else if (!waveReady) reason = "Steinbau ist erst nach Welle 8 verfügbar";
  else if (!researchReady) reason = "Zuerst Steinbaukunst in der Werkstatt erforschen";
  else if (inWave) reason = "Steinausbau ist nur zwischen den Wellen möglich";
  else if (!affordable) reason = `Benötigt ${cost.gold} Gold, ${cost.wood} Holz, ${cost.stone} Stein und ${cost.research} Forschung`;

  return {
    supported: true,
    eligible: !upgraded && levelReady,
    upgraded,
    definition,
    cost,
    levelReady,
    waveReady,
    researchReady,
    inWave,
    affordable,
    canUpgrade: !upgraded && levelReady && waveReady && researchReady && !inWave && affordable,
    reason,
  };
}

export function upgradeBuildingToStone(building, state) {
  const upgrade = getStoneBuildingUpgrade(building, state);
  if (!upgrade.canUpgrade) return { ok: false, ...upgrade };

  const ratio = Math.max(0, Math.min(1, Number(building.hp) / Math.max(1, Number(building.maxHp) || 1)));
  const oldMaxHp = Math.max(1, Number(building.maxHp) || Number(building.base?.hp) || 260);
  const newMaxHp = Math.round(oldMaxHp * upgrade.definition.hpMultiplier);

  state.gold -= upgrade.cost.gold;
  state.wood -= upgrade.cost.wood;
  state.stone -= upgrade.cost.stone;
  state.researchPoints -= upgrade.cost.research;

  building.investedGold = (Number(building.investedGold) || 0) + upgrade.cost.gold;
  building.investedWood = (Number(building.investedWood) || 0) + upgrade.cost.wood;
  building.investedStone = (Number(building.investedStone) || 0) + upgrade.cost.stone;
  building.investedResearch = (Number(building.investedResearch) || 0) + upgrade.cost.research;
  building.material = "stone";
  building.buildTier = 2;
  building.maxHp = newMaxHp;
  building.hp = Math.max(1, newMaxHp * ratio);
  building.stoneBuiltAtWave = Math.max(1, Number(state.wave) || 1);

  return { ok: true, ...upgrade, newMaxHp };
}
