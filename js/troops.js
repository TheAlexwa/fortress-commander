/**
 * Truppenplatz-System für mobile Einheiten.
 *
 * Bewohner und Arbeitsplätze bleiben bewusst getrennt. Wohngebäude erhöhen
 * zusätzlich die militärische Kapazität, ohne vorhandene Einheiten bei einem
 * Gebäudeverlust automatisch zu entfernen.
 */

export const BASE_TROOP_CAPACITY = 2;
export const HARD_TROOP_CAPACITY = 24;

const UNIT_TROOP_COSTS = Object.freeze({
  soldier: 1,
  guard: 1,
  hero: 0,
});

export function troopCostForUnit(unitOrKey) {
  const key = typeof unitOrKey === "string" ? unitOrKey : unitOrKey?.key;
  if (!key) return 0;
  return Math.max(0, Number(UNIT_TROOP_COSTS[key] ?? 1) || 0);
}

export function troopCapacityForHouse(house) {
  if (!house || house.key !== "house" || Number(house.hp) <= 0) return 0;
  if (house.material === "stone") return 6;
  const level = Math.max(1, Number(house.level) || 1);
  if (level >= 3) return 5;
  if (level >= 2) return 4;
  return 2;
}

export function usedTroopCapacity(state) {
  return (state?.units || []).reduce(
    (sum, unit) => sum + (Number(unit?.hp) > 0 ? troopCostForUnit(unit) : 0),
    0
  );
}

export function totalTroopCapacity(state) {
  const housing = (state?.buildings || [])
    .filter((building) => building?.key === "house" && Number(building.hp) > 0)
    .reduce((sum, house) => sum + troopCapacityForHouse(house), 0);
  return Math.min(HARD_TROOP_CAPACITY, BASE_TROOP_CAPACITY + housing);
}

export function troopCapacityStatus(state, unitOrKey = null) {
  const used = usedTroopCapacity(state);
  const capacity = totalTroopCapacity(state);
  const cost = troopCostForUnit(unitOrKey);
  const projected = used + cost;
  return {
    used,
    capacity,
    cost,
    projected,
    free: Math.max(0, capacity - used),
    overLimit: used > capacity,
    hardCapReached: projected > HARD_TROOP_CAPACITY,
    canTrain: cost <= 0 || projected <= capacity,
  };
}

export function troopCapacityBreakdown(state) {
  const houses = (state?.buildings || [])
    .filter((building) => building?.key === "house" && Number(building.hp) > 0)
    .map((house) => ({
      bid: house.bid,
      level: Math.max(1, Number(house.level) || 1),
      material: house.material === "stone" ? "stone" : "wood",
      capacity: troopCapacityForHouse(house),
    }));
  return {
    base: BASE_TROOP_CAPACITY,
    houses,
    total: totalTroopCapacity(state),
    used: usedTroopCapacity(state),
    hardCap: HARD_TROOP_CAPACITY,
  };
}
