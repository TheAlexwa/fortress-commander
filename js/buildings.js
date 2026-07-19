/**
 * Bau- und Aufwertungssystem von Fortress Commander.
 *
 * Das Modul verwaltet Bauvoraussetzungen, Platzierung, Aufwertungen und Verkauf.
 * Spielzustand und UI-Rückmeldungen werden von main.js übergeben.
 */

export function getBuildRequirement(state, key) {
  const hasHouse = state.buildings.some((building) => building.key === "house");
  const hasLumber = state.buildings.some((building) => building.key === "lumber");
  const hasRepair = state.buildings.some((building) => building.key === "repair");
  const hasWorkshop = state.buildings.some((building) => building.key === "workshop");

  if (key === "house") return { ok: true, reason: "" };
  if (key === "lumber" && !hasHouse) {
    return { ok: false, reason: "Zuerst ein Zeltlager bauen" };
  }
  if (key === "repair" && !hasLumber) {
    return { ok: false, reason: "Zuerst einen Holzfäller bauen" };
  }
  if (key === "workshop" && !(hasHouse && hasLumber && hasRepair)) {
    return {
      ok: false,
      reason: "Benötigt Zeltlager oder Holzhaus, Holzfäller und Handwerkerhaus",
    };
  }
  if (key === "market" && !hasWorkshop) {
    return { ok: false, reason: "Zuerst eine Werkstatt bauen" };
  }

  return { ok: true, reason: "" };
}

export function createEntityAt(x, y, key, context) {
  const {
    state,
    BUILD,
    CX,
    CY,
    WALL_R,
    wallSlots,
    castleSlots,
    insideSlots,
    researchedUnitStats,
    syncResidents,
    showToast,
    setBuildMode,
    setSelected,
  } = context;

  const blueprint = BUILD[key];
  if (!blueprint) return false;

  const requirement = getBuildRequirement(state, key);
  if (!requirement.ok) {
    showToast(requirement.reason);
    return false;
  }
  if (state.gold < blueprint.gold || state.wood < blueprint.wood) {
    showToast("Nicht genug Ressourcen");
    return false;
  }

  if (blueprint.kind === "unit") {
    const distanceToCastle = Math.hypot(x - CX, y - CY);
    if (distanceToCastle > WALL_R - 30 || distanceToCastle < 105) {
      showToast("Einheiten im Bereich hinter der Mauer platzieren");
      return false;
    }

    state.gold -= blueprint.gold;
    state.wood -= blueprint.wood;
    const stats = researchedUnitStats(key);

    state.units.push({
      kind: "unit",
      uid: ++state.nextUnitId,
      key,
      base: blueprint,
      x,
      y,
      targetX: x,
      targetY: y,
      homeX: x,
      homeY: y,
      hp: stats.hp,
      maxHp: stats.hp,
      damage: stats.damage,
      range: stats.range,
      rate: stats.rate,
      speed: stats.speed,
      armor: stats.armor,
      stance: key === "guard" ? "defend" : null,
      retreating: false,
      level: 1,
      expLevel: 1,
      xp: 0,
      xpMax: 65,
      pendingUpgrades: 0,
      upgradeStats: { damage: 0, health: 0, speed: 0, rate: 0, range: 0 },
      attackCd: 0,
      retargetCd: 0,
      controlMode: "auto",
      autoTarget: null,
      investedGold: blueprint.gold,
      investedWood: blueprint.wood,
    });

    setBuildMode(null);
    showToast(`${blueprint.name} positioniert`);
    return true;
  }

  const slots =
    blueprint.kind === "tower"
      ? [...wallSlots, ...castleSlots]
      : insideSlots;

  let bestSlot = null;
  let bestDistance = 42;
  for (const slot of slots) {
    const distance = Math.hypot(x - slot.x, y - slot.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSlot = slot;
    }
  }

  if (!bestSlot) {
    showToast(
      blueprint.kind === "tower"
        ? "Turm auf einem Mauer- oder Burgplatz errichten"
        : "Gebäude im Burghof errichten"
    );
    return false;
  }
  if (bestSlot.building) {
    showToast("Bauplatz belegt");
    return false;
  }
  if (
    blueprint.kind === "tower" &&
    bestSlot.type === "wall" &&
    state.walls[bestSlot.i].hp <= 0
  ) {
    showToast("Auf einer zerstörten Mauer kann nicht gebaut werden");
    return false;
  }

  state.gold -= blueprint.gold;
  state.wood -= blueprint.wood;

  const building = {
    kind: "building",
    bid: ++state.nextBuildingId,
    key,
    base: blueprint,
    slot: bestSlot,
    level: 1,
    cooldown: 0,
    residentId: null,
    residentAssigned: false,
    repairEnabled: true,
    investedGold: blueprint.gold,
    investedWood: blueprint.wood,
    expLevel: 1,
    xp: 0,
    xpMax: 90,
    pendingUpgrades: 0,
    expUpgradeStats: { damage: 0, range: 0, rate: 0, health: 0 },
  };

  if (blueprint.kind === "tower") {
    Object.assign(building, {
      hp: blueprint.hp,
      maxHp: blueprint.hp,
      range: blueprint.range,
      rate: blueprint.rate,
      damage: blueprint.damage,
      speed: blueprint.speed,
      splash: blueprint.splash || 0,
    });
  }

  bestSlot.building = building;
  state.buildings.push(building);
  syncResidents();
  setBuildMode(null);
  setSelected(building);
  showToast(`${blueprint.name} errichtet`);
  return true;
}

export function upgradeEntity(entity, context) {
  const {
    state,
    syncResidents,
    showToast,
    globalResearchIncreaseRate,
  } = context;

  if (!entity) return false;

  if (entity.kind === "unit") {
    showToast("Einheiten werden nur über EXP oder Forschung verbessert");
    return false;
  }

  if (entity.kind !== "building") return false;

  const goldCost = Math.floor(entity.base.gold * (0.65 + entity.level * 0.45));
  const woodCost = Math.floor(entity.base.wood * (0.45 + entity.level * 0.3));
  const maxLevel = entity.key === "house" ? 2 : entity.key === "market" ? 3 : 5;

  if (entity.level >= maxLevel) {
    showToast(
      entity.key === "house"
        ? "Holzhaus ist bereits vollständig ausgebaut"
        : "Maximale Stufe erreicht"
    );
    return false;
  }
  if (state.gold < goldCost || state.wood < woodCost) {
    showToast(`Benötigt ${goldCost} Gold und ${woodCost} Holz`);
    return false;
  }

  state.gold -= goldCost;
  state.wood -= woodCost;
  entity.investedGold += goldCost;
  entity.investedWood += woodCost;
  entity.level++;

  if (entity.key === "house") {
    syncResidents();
    showToast("Zeltlager zum Holzhaus ausgebaut: 4 Bewohner");
  } else if (entity.base.kind === "tower") {
    entity.damage *= 1.34;
    entity.range *= 1.06;
    entity.rate *= 0.9;
    entity.maxHp *= 1.22;
    entity.hp = entity.maxHp;
    showToast("Gebäude verbessert");
  } else if (entity.key === "workshop") {
    showToast(
      `Werkstatt Stufe ${entity.level}: globaler Forschungsanstieg jetzt ${Math.round(
        globalResearchIncreaseRate() * 100
      )} %`
    );
  } else {
    showToast("Gebäude verbessert");
  }

  return true;
}

export function sellEntity(entity, context) {
  const { state, syncResidents, showToast, setSelected } = context;
  if (!entity) return false;

  if (entity.kind === "unit") {
    state.gold += Math.floor(entity.investedGold * 0.6);
    state.wood += Math.floor(entity.investedWood * 0.6);
    state.units = state.units.filter((unit) => unit !== entity);
  } else if (entity.kind === "building") {
    if (entity.residentId) {
      const resident = state.residents.find(
        (candidate) => candidate.id === entity.residentId
      );
      if (resident) {
        resident.job = null;
        resident.workplaceId = null;
      }
    }

    state.gold += Math.floor(entity.investedGold * 0.6);
    state.wood += Math.floor(entity.investedWood * 0.6);
    entity.slot.building = null;
    state.buildings = state.buildings.filter(
      (building) => building !== entity
    );
    syncResidents();
  } else {
    return false;
  }

  setSelected(null);
  showToast("Verkauft");
  return true;
}
