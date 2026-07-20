/**
 * Spiel- und Wellenlogik von Fortress Commander.
 *
 * Das Modul arbeitet ausschließlich mit übergebenem Zustand und Callbacks.
 * Dadurch bleibt es unabhängig von DOM, Canvas und der Benutzeroberfläche.
 */

export function getWaveEnemyCount(wave) {
  return Math.floor(4 + wave * 2.15 + Math.pow(wave, 1.25));
}

export function getWallHealthSum(state) {
  const middle = state.walls.reduce(
    (sum, wall) => sum + (wall.built ? wall.hp : 0),
    0
  );
  const inner = (state.innerWalls || []).reduce(
    (sum, wall) => sum + (wall.built ? wall.hp : 0),
    0
  );
  const gates = (state.middleGates || []).reduce(
    (sum, gate) => sum + (gate.built ? gate.hp : 0),
    0
  );
  return middle + inner + gates;
}

export function beginWave(
  state,
  {
    gameOver,
    assignCraftsmen,
    hideRepairDecision,
    showToast,
    setPaused,
    setBuildMode,
    setSelected,
  }
) {
  if (state.inWave || gameOver) return false;

  setPaused(false);
  state.supportTimer = 0;
  state.repairActive = false;
  assignCraftsmen();
  hideRepairDecision();

  state.inWave = true;
  state.toSpawn = getWaveEnemyCount(state.wave);
  state.spawnTimer = 0.1;

  setBuildMode(null);
  setSelected(null);
  showToast(`Welle ${state.wave}: Die Eisenclans greifen an`);
  return true;
}

function selectEarlyWaveEnemyType(wave, roll) {
  let type = "raider";

  if (wave >= 10 && roll < 0.12) type = "berserker";
  else if (wave >= 6 && roll > 0.78) type = "shield";
  else if (wave >= 4 && roll < 0.25) type = "runner";
  else if (wave >= 3 && roll > 0.58 && roll < 0.74) type = "spear";

  return type;
}

export function getWaveEnemyWeights(wave) {
  const progress = Math.min(1, Math.max(0, (wave - 12) / 12));
  const specialShare = 0.36 + progress * 0.22;
  const berserkerShare = 0.34 + progress * 0.08;
  const normalShare = 1 - specialShare;

  return {
    raider: normalShare * 0.54,
    runner: normalShare * 0.17,
    spear: normalShare * 0.29,
    shield: specialShare * (1 - berserkerShare),
    berserker: specialShare * berserkerShare,
  };
}

export function getBossEscortTypes(wave) {
  if (wave % 8 !== 0 || wave < 16) return [];
  if (wave < 24) return ["shield", "shield"];
  if (wave < 32) return ["berserker", "shield", "shield"];
  return ["shield", "berserker", "shield", "berserker", "shield"];
}

export function selectWaveEnemyType(
  wave,
  remainingToSpawn,
  random = Math.random
) {
  if (wave % 8 === 0) {
    if (remainingToSpawn === 1) return "boss";

    const escort = getBossEscortTypes(wave);
    const escortIndex = escort.length - (remainingToSpawn - 1);
    if (escortIndex >= 0 && escortIndex < escort.length) {
      return escort[escortIndex];
    }
  }

  const roll = Math.min(0.999999, Math.max(0, random()));
  if (wave < 12) return selectEarlyWaveEnemyType(wave, roll);

  const weights = getWaveEnemyWeights(wave);
  let threshold = 0;
  for (const type of ["raider", "runner", "spear", "shield", "berserker"]) {
    threshold += weights[type];
    if (roll < threshold) return type;
  }

  return "berserker";
}

export function createWaveEnemy(
  state,
  {
    WORLD_W,
    WORLD_H,
    TAU,
    enemyStatsFor,
    discoverEnemy,
    random = Math.random,
    forcedType = null,
    spawnPoint = null,
  }
) {
  const side = Math.floor(random() * 4);
  const margin = 45;
  let x;
  let y;

  if (spawnPoint && Number.isFinite(spawnPoint.x) && Number.isFinite(spawnPoint.y)) {
    x = spawnPoint.x;
    y = spawnPoint.y;
  } else if (side === 0) {
    x = 100 + random() * (WORLD_W - 200);
    y = -margin;
  } else if (side === 1) {
    x = WORLD_W + margin;
    y = 100 + random() * (WORLD_H - 200);
  } else if (side === 2) {
    x = 100 + random() * (WORLD_W - 200);
    y = WORLD_H + margin;
  } else {
    x = -margin;
    y = 100 + random() * (WORLD_H - 200);
  }

  const wave = state.wave;
  const type = forcedType || selectWaveEnemyType(wave, state.toSpawn, random);
  const stats = enemyStatsFor(type, wave);
  const enemy = {
    kind: "enemy",
    x,
    y,
    type,
    name: stats.name,
    clan: "Eisenclans",
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    radius: Number.isFinite(stats.radius) ? stats.radius : 14,
    visualClass: stats.visualClass || "normal",
    visualScale: Number.isFinite(stats.visualScale) ? stats.visualScale : 1,
    reward: stats.reward,
    damage: stats.damage,
    attackRate: stats.attackRate,
    attackCd: random(),
    armor: stats.armor || 0,
    color: stats.color,
    phase: "outside",
    wallIndex: null,
    animSeed: random() * TAU,
  };

  state.enemies.push(enemy);
  discoverEnemy(type);
  return enemy;
}

export function applyWaveAutoRepair(state, percent) {
  if (percent <= 0) return 0;

  let repaired = 0;
  const castleGain = Math.min(state.maxHp - state.hp, state.maxHp * percent);

  if (castleGain > 0) {
    state.hp += castleGain;
    repaired += castleGain;
  }

  for (const wall of [
    ...state.walls,
    ...(state.innerWalls || []),
    ...(state.middleGates || []),
  ]) {
    if (!wall.built) continue;
    const gain = Math.min(wall.maxHp - wall.hp, wall.maxHp * percent);
    if (gain > 0) {
      wall.hp += gain;
      repaired += gain;
    }
  }

  state.repairedHp += repaired;
  return repaired;
}

export function getTotalRepairDamage(state) {
  let total = Math.max(0, state.maxHp - state.hp);

  total += [
    ...state.walls,
    ...(state.innerWalls || []),
    ...(state.middleGates || []),
  ].reduce(
    (sum, wall) => sum + (wall.built ? Math.max(0, wall.maxHp - wall.hp) : 0),
    0
  );

  total += state.buildings
    .filter(
      (building) =>
        building.base.kind === "tower" && building.hp > 0
    )
    .reduce(
      (sum, building) =>
        sum + Math.max(0, building.maxHp - building.hp),
      0
    );

  return total;
}

export function getRepairWoodEstimate(state) {
  return Math.ceil(getTotalRepairDamage(state) / 20);
}
