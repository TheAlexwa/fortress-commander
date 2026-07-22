/**
 * Spiel- und Wellenlogik von Fortress Commander.
 *
 * Das Modul arbeitet ausschließlich mit übergebenem Zustand und Callbacks.
 * Dadurch bleibt es unabhängig von DOM, Canvas und der Benutzeroberfläche.
 */


export const WAVE_TYPE_DEFINITIONS = Object.freeze({
  standard: Object.freeze({
    key: "standard",
    icon: "⚔️",
    label: "Eisenclan-Sturm",
    description: "Ausgewogene Truppen greifen über alle Fronten an.",
    formation: "balanced",
  }),
  scoutRaid: Object.freeze({
    key: "scoutRaid",
    icon: "🥾",
    label: "Späherangriff",
    description: "Schnelle Clanspäher und Speerjäger stürmen über zwei gegenüberliegende Flanken.",
    formation: "flanks",
  }),
  shieldWall: Object.freeze({
    key: "shieldWall",
    icon: "🛡️",
    label: "Schildwall",
    description: "Schwer gepanzerte Eisenschilde bündeln sich an einer Hauptfront.",
    formation: "focus",
  }),
  berserkerStorm: Object.freeze({
    key: "berserkerStorm",
    icon: "⚔️",
    label: "Berserkersturm",
    description: "Blutberserker schlagen mit hoher Gewalt an zwei benachbarten Fronten zu.",
    formation: "adjacent",
  }),
  fourFront: Object.freeze({
    key: "fourFront",
    icon: "🧭",
    label: "Vier-Fronten-Angriff",
    description: "Die Armee verteilt sich bewusst gleichmäßig auf alle vier Tore.",
    formation: "four-front",
  }),
  bossAssault: Object.freeze({
    key: "bossAssault",
    icon: "👑",
    label: "Häuptlingsangriff",
    description: "Der Eisenclan-Häuptling führt seine Elite an einer Schwerpunktfront an.",
    formation: "boss-focus",
  }),
});

export function getWaveTypeKey(wave) {
  const value = Math.max(1, Math.floor(Number(wave) || 1));
  if (value % 8 === 0) return "bossAssault";
  if (value >= 10 && value % 6 === 2) return "berserkerStorm";
  if (value >= 6 && value % 6 === 0) return "shieldWall";
  if (value >= 5 && value % 6 === 5) return "fourFront";
  if (value >= 4 && value % 6 === 4) return "scoutRaid";
  return "standard";
}

export function getWaveTypeInfo(wave, forcedKey = null) {
  const key = Object.hasOwn(WAVE_TYPE_DEFINITIONS, forcedKey)
    ? forcedKey
    : getWaveTypeKey(wave);
  return WAVE_TYPE_DEFINITIONS[key];
}

export function getBaseWaveEnemyCount(wave) {
  const value = Math.max(1, Math.floor(Number(wave) || 1));
  return Math.floor(4 + value * 2.15 + Math.pow(value, 1.25));
}

export function getWaveDensityMultiplier(wave) {
  const value = Math.max(1, Math.floor(Number(wave) || 1));
  if (value <= 3) return 1;
  if (value <= 8) return 1.35;
  if (value <= 16) return 1.6;
  return 1.8;
}

export function getWaveEnemyCount(wave) {
  return Math.max(1, Math.round(
    getBaseWaveEnemyCount(wave) * getWaveDensityMultiplier(wave)
  ));
}

export function getWallHealthSum(state) {
  const outer = (state.outerWalls || []).reduce(
    (sum, wall) => sum + (wall.built ? wall.hp : 0),
    0
  );
  const middle = state.walls.reduce(
    (sum, wall) => sum + (wall.built ? wall.hp : 0),
    0
  );
  const inner = (state.innerWalls || []).reduce(
    (sum, wall) => sum + (wall.built ? wall.hp : 0),
    0
  );
  const gates = [...(state.middleGates || []), ...(state.outerGates || [])].reduce(
    (sum, gate) => sum + (gate.built ? gate.hp : 0),
    0
  );
  return outer + middle + inner + gates;
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
  const waveType = getWaveTypeInfo(state.wave);
  showToast(`${waveType.icon} ${waveType.label}: Die Eisenclans greifen an`);
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

function selectWeightedEnemyType(wave, weights, roll) {
  const unlockWave = { raider: 1, spear: 3, runner: 4, shield: 6, berserker: 10 };
  const available = Object.entries(weights)
    .filter(([type, weight]) => wave >= unlockWave[type] && weight > 0);
  const total = available.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return "raider";

  let threshold = 0;
  for (const [type, weight] of available) {
    threshold += weight / total;
    if (roll < threshold) return type;
  }
  return available.at(-1)?.[0] || "raider";
}

function getWaveTypeWeights(waveType) {
  switch (waveType) {
    case "scoutRaid":
      return { raider: 0.18, runner: 0.58, spear: 0.24, shield: 0, berserker: 0 };
    case "shieldWall":
      return { raider: 0.12, runner: 0.05, spear: 0.18, shield: 0.58, berserker: 0.07 };
    case "berserkerStorm":
      return { raider: 0.18, runner: 0.07, spear: 0.10, shield: 0.10, berserker: 0.55 };
    case "bossAssault":
      return { raider: 0.18, runner: 0.08, spear: 0.18, shield: 0.36, berserker: 0.20 };
    default:
      return null;
  }
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
  random = Math.random,
  forcedWaveType = null
) {
  const waveType = getWaveTypeInfo(wave, forcedWaveType).key;
  if (waveType === "bossAssault") {
    if (remainingToSpawn === 1) return "boss";

    const escort = getBossEscortTypes(wave);
    const escortIndex = escort.length - (remainingToSpawn - 1);
    if (escortIndex >= 0 && escortIndex < escort.length) {
      return escort[escortIndex];
    }
  }

  const roll = Math.min(0.999999, Math.max(0, random()));
  const specialWeights = getWaveTypeWeights(waveType);
  if (specialWeights) return selectWeightedEnemyType(wave, specialWeights, roll);
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
    modifiers = null,
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
  const powerScale = Math.max(0.2, Math.min(3, Number(modifiers?.powerScale) || 1));
  const rewardScale = Math.max(0.15, Math.min(2, Number(modifiers?.rewardScale) || powerScale));
  const enemy = {
    kind: "enemy",
    eid: Math.max(0, Number(state.nextEnemyId) || 0),
    x,
    y,
    type,
    name: stats.name,
    clan: "Eisenclans",
    hp: Math.max(8, stats.hp * powerScale),
    maxHp: Math.max(8, stats.hp * powerScale),
    speed: stats.speed,
    radius: Number.isFinite(stats.radius) ? stats.radius : 14,
    visualClass: stats.visualClass || "normal",
    visualScale: Number.isFinite(stats.visualScale) ? stats.visualScale : 1,
    reward: stats.reward * rewardScale,
    damage: stats.damage * powerScale,
    powerScale,
    rewardScale,
    xpScale: rewardScale,
    attackRate: stats.attackRate,
    attackCd: random(),
    armor: stats.armor || 0,
    armorBreakTime: 0,
    slowTime: 0,
    moraleBreakTime: 0,
    bossAura: false,
    shieldProtected: false,
    color: stats.color,
    phase: "outer",
    wallIndex: null,
    animSeed: random() * TAU,
  };

  state.nextEnemyId = enemy.eid + 1;
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
    ...(state.outerWalls || []),
    ...state.walls,
    ...(state.innerWalls || []),
    ...(state.middleGates || []),
    ...(state.outerGates || []),
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
    ...(state.outerWalls || []),
    ...state.walls,
    ...(state.innerWalls || []),
    ...(state.middleGates || []),
    ...(state.outerGates || []),
  ].reduce(
    (sum, wall) => sum + (wall.built ? Math.max(0, wall.maxHp - wall.hp) : 0),
    0
  );

  total += state.buildings
    .filter(
      (building) =>
        building.hp > 0 &&
        (building.base.kind === "tower" ||
          (building.base.kind !== "tower" && !building.base.decorative && building.key !== "statue"))
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
