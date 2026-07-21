import { getWaveTypeInfo } from "./game.js";

/**
 * Belagerungsphase von Fortress Commander.
 *
 * Zwischen den Angriffswellen sammelt sich die bereits festgelegte nächste
 * Welle an vier Außenlagern. Jedes Lager ist eindeutig einem Festungstor
 * zugeordnet. Langes Warten erhöht nur die Größe des ersten Angriffspulks;
 * die gesamte Wellenstärke bleibt unverändert.
 */

export const SIEGE_GATHER_SECONDS = 45;
export const SIEGE_CAMP_COUNT = 4;

const SIEGE_CAMP_META = Object.freeze([
  Object.freeze({ label: "Nordlager", shortLabel: "Nord", gateLabel: "Nordtor", gateIndex: 0 }),
  Object.freeze({ label: "Ostlager", shortLabel: "Ost", gateLabel: "Osttor", gateIndex: 1 }),
  Object.freeze({ label: "Südlager", shortLabel: "Süd", gateLabel: "Südtor", gateIndex: 2 }),
  Object.freeze({ label: "Westlager", shortLabel: "West", gateLabel: "Westtor", gateIndex: 3 }),
]);

const ENEMY_THREAT = Object.freeze({
  runner: 0.8,
  raider: 1,
  spear: 1.2,
  shield: 2.4,
  berserker: 3,
  boss: 8,
});

const ENEMY_REWARD = Object.freeze({
  runner: 13,
  raider: 12,
  spear: 17,
  shield: 24,
  berserker: 29,
  boss: 135,
});

const MASS_ENEMY_TYPES = new Set(["raider", "runner", "spear"]);

function clampCampIndex(value) {
  return Math.max(0, Math.min(SIEGE_CAMP_COUNT - 1, Number(value) || 0));
}

export function getSiegeCampPositions({ WORLD_W, WORLD_H }) {
  const positions = [
    { x: WORLD_W / 2, y: 145, angle: Math.PI / 2 },
    { x: WORLD_W - 185, y: WORLD_H / 2, angle: Math.PI },
    { x: WORLD_W / 2, y: WORLD_H - 145, angle: -Math.PI / 2 },
    { x: 185, y: WORLD_H / 2, angle: 0 },
  ];

  return positions.map((position, index) => ({
    ...SIEGE_CAMP_META[index],
    ...position,
  }));
}

function chooseLeastUsedCamp(campCounts, candidates, random) {
  const valid = candidates.filter((index) => index >= 0 && index < SIEGE_CAMP_COUNT);
  const minimum = Math.min(...valid.map((index) => campCounts[index]));
  const leastUsed = valid.filter((index) => campCounts[index] === minimum);
  return leastUsed[Math.floor(random() * leastUsed.length)] ?? valid[0] ?? 0;
}

function createFormationPlan(waveType, random) {
  const focusCamp = Math.floor(random() * SIEGE_CAMP_COUNT);
  const clockwise = (focusCamp + 1) % SIEGE_CAMP_COUNT;
  const counterClockwise = (focusCamp + SIEGE_CAMP_COUNT - 1) % SIEGE_CAMP_COUNT;
  const flankCamps = random() < 0.5 ? [0, 2] : [1, 3];
  return {
    waveType,
    focusCamp,
    flankCamps,
    assaultCamps: random() < 0.5
      ? [focusCamp, clockwise]
      : [focusCamp, counterClockwise],
  };
}

function selectMassEnemyType(wave, waveType, random) {
  const roll = Math.min(0.999999, Math.max(0, random()));
  if (waveType === "scoutRaid") {
    return wave >= 4 && roll < 0.68 ? "runner" : wave >= 3 ? "spear" : "raider";
  }
  if (waveType === "shieldWall") {
    return wave >= 3 && roll < 0.48 ? "spear" : "raider";
  }
  if (waveType === "berserkerStorm" || waveType === "bossAssault") {
    return wave >= 3 && roll < 0.38 ? "spear" : "raider";
  }
  if (wave >= 4 && roll < 0.22) return "runner";
  if (wave >= 3 && roll < 0.48) return "spear";
  return "raider";
}

function interleaveMassTroops(baseTypes, extraTypes) {
  const bosses = baseTypes.filter((type) => type === "boss");
  const regular = baseTypes.filter((type) => type !== "boss");
  if (!extraTypes.length) return [...regular, ...bosses];

  const combined = [];
  let extraIndex = 0;
  regular.forEach((type, index) => {
    combined.push(type);
    const targetExtras = Math.floor(((index + 1) * extraTypes.length) / Math.max(1, regular.length));
    while (extraIndex < targetExtras) combined.push(extraTypes[extraIndex++]);
  });
  while (extraIndex < extraTypes.length) combined.push(extraTypes[extraIndex++]);
  return [...combined, ...bosses];
}

function sumTypeBudget(types, table) {
  return types.reduce((sum, type) => sum + (table[type] || 1), 0);
}

function chooseCamp(type, campCounts, random, formation) {
  const allCamps = [0, 1, 2, 3];
  switch (formation.waveType) {
    case "scoutRaid":
      return chooseLeastUsedCamp(campCounts, formation.flankCamps, random);
    case "shieldWall":
      if (type === "shield" || random() < 0.68) return formation.focusCamp;
      return chooseLeastUsedCamp(
        campCounts,
        allCamps.filter((index) => index !== formation.focusCamp),
        random
      );
    case "berserkerStorm":
      if (type === "berserker" || random() < 0.75) {
        return chooseLeastUsedCamp(campCounts, formation.assaultCamps, random);
      }
      return chooseLeastUsedCamp(campCounts, allCamps, random);
    case "bossAssault":
      if (["boss", "shield", "berserker"].includes(type) || random() < 0.55) {
        return formation.focusCamp;
      }
      return chooseLeastUsedCamp(campCounts, allCamps, random);
    case "fourFront":
    case "standard":
    default:
      return chooseLeastUsedCamp(campCounts, allCamps, random);
  }
}

export function prepareSiegePhase(
  state,
  { getWaveEnemyCount, getBaseWaveEnemyCount, selectWaveEnemyType, random = Math.random }
) {
  const total = getWaveEnemyCount(state.wave);
  const baseTotal = typeof getBaseWaveEnemyCount === "function"
    ? getBaseWaveEnemyCount(state.wave)
    : total;
  const waveType = getWaveTypeInfo(state.wave);
  const formation = createFormationPlan(waveType.key, random);
  const campCounts = Array(SIEGE_CAMP_COUNT).fill(0);
  const baseTypes = [];

  for (let remaining = baseTotal; remaining > 0; remaining--) {
    baseTypes.push(selectWaveEnemyType(state.wave, remaining, random, waveType.key));
  }

  const extraTypes = Array.from(
    { length: Math.max(0, total - baseTotal) },
    () => selectMassEnemyType(state.wave, waveType.key, random)
  );
  const denseTypes = interleaveMassTroops(baseTypes, extraTypes);
  const baseMass = baseTypes.filter((type) => MASS_ENEMY_TYPES.has(type));
  const denseMass = denseTypes.filter((type) => MASS_ENEMY_TYPES.has(type));
  const powerScale = denseMass.length
    ? Math.max(0.2, Math.min(1, sumTypeBudget(baseMass, ENEMY_THREAT) / sumTypeBudget(denseMass, ENEMY_THREAT)))
    : 1;
  const rewardScale = denseMass.length
    ? Math.max(0.15, Math.min(1, sumTypeBudget(baseMass, ENEMY_REWARD) / sumTypeBudget(denseMass, ENEMY_REWARD)))
    : 1;
  const planned = [];

  for (const type of denseTypes) {
    const camp = chooseCamp(type, campCounts, random, formation);
    campCounts[camp]++;
    const massTroop = MASS_ENEMY_TYPES.has(type);
    planned.push({
      type,
      camp,
      powerScale: massTroop ? powerScale : 1,
      rewardScale: massTroop ? rewardScale : 1,
    });
  }

  state.siege = {
    active: true,
    wave: state.wave,
    waveType: waveType.key,
    baseTotal,
    total: planned.length,
    densityMultiplier: baseTotal > 0 ? planned.length / baseTotal : 1,
    arrived: 0,
    elapsed: 0,
    gatherDuration: SIEGE_GATHER_SECONDS,
    planned,
  };
  state.spawnQueue = [];

  return state.siege;
}

export function ensureSiegePhase(state, context) {
  const siege = state.siege;
  const valid =
    siege?.active === true &&
    Number(siege.wave) === Number(state.wave) &&
    Array.isArray(siege.planned) &&
    siege.planned.length === Number(siege.total);

  return valid ? siege : prepareSiegePhase(state, context);
}

export function updateSiegePhase(state, dt) {
  const siege = state.siege;
  if (state.inWave || !siege?.active || siege.arrived >= siege.total) return false;

  siege.elapsed = Math.max(0, Number(siege.elapsed) || 0) + Math.max(0, dt);
  const duration = Math.max(1, Number(siege.gatherDuration) || SIEGE_GATHER_SECONDS);
  let target = Math.floor((siege.elapsed / duration) * siege.total);
  if (siege.elapsed >= 1) target = Math.max(1, target);
  target = Math.min(siege.total, target);

  if (target <= siege.arrived) return false;
  siege.arrived = target;
  return true;
}

export function getSiegeCampOverview(siege) {
  const overview = SIEGE_CAMP_META.map((meta) => ({
    ...meta,
    total: 0,
    arrived: 0,
    threat: 0,
    special: { shield: 0, berserker: 0, boss: 0 },
    dangerous: false,
  }));

  if (!siege?.active || !Array.isArray(siege.planned)) return overview;

  const arrived = Math.max(0, Math.min(siege.planned.length, Number(siege.arrived) || 0));
  siege.planned.forEach((entry, index) => {
    const camp = overview[clampCampIndex(entry?.camp)];
    const type = String(entry?.type || "raider");
    camp.total++;
    if (index < arrived) camp.arrived++;
    camp.threat += (ENEMY_THREAT[type] || 1) * Math.max(0.2, Number(entry?.powerScale) || 1);
    if (Object.hasOwn(camp.special, type)) camp.special[type]++;
  });

  const highestThreat = Math.max(...overview.map((camp) => camp.threat));
  const dangerousIndex = highestThreat > 0
    ? overview.findIndex((camp) => camp.threat === highestThreat)
    : -1;
  if (dangerousIndex >= 0) overview[dangerousIndex].dangerous = true;

  return overview;
}

export function getSiegeCampCounts(siege) {
  return getSiegeCampOverview(siege).map((camp) => camp.arrived);
}

export function getSiegeCampPreview(siege) {
  return getSiegeCampOverview(siege)
    .map((camp) => {
      const special = [
        camp.special.shield ? `🛡${camp.special.shield}` : "",
        camp.special.berserker ? `⚔${camp.special.berserker}` : "",
        camp.special.boss ? `👑${camp.special.boss}` : "",
      ].filter(Boolean).join(" ");
      return `${camp.shortLabel} ${camp.arrived}/${camp.total}${special ? ` ${special}` : ""}`;
    })
    .join(" · ");
}

function roundRobinByCamp(entries) {
  const buckets = Array.from({ length: SIEGE_CAMP_COUNT }, () => []);
  for (const entry of entries) buckets[clampCampIndex(entry?.camp)].push(entry);
  const ordered = [];
  while (buckets.some((bucket) => bucket.length)) {
    for (const bucket of buckets) {
      const entry = bucket.shift();
      if (entry) ordered.push(entry);
    }
  }
  return ordered;
}

function createPulsedSpawnQueue(planned, arrivedCount) {
  const arrived = roundRobinByCamp(planned.slice(0, arrivedCount));
  const reinforcements = roundRobinByCamp(planned.slice(arrivedCount));
  const pulseSize = planned.length >= 60 ? 12 : planned.length >= 28 ? 10 : 8;
  const orders = Array(SIEGE_CAMP_COUNT).fill(0);
  const queue = [];
  let pulseOffset = 0;

  for (const [groupIndex, group] of [arrived, reinforcements].entries()) {
    if (groupIndex === 1 && queue.length) pulseOffset = Math.ceil(queue.length / pulseSize);
    group.forEach((entry, index) => {
      const camp = clampCampIndex(entry?.camp);
      queue.push({
        type: String(entry?.type || "raider"),
        camp,
        orderInCamp: orders[camp]++,
        pulseIndex: pulseOffset + Math.floor(index / pulseSize),
        slotInPulse: index % pulseSize,
        reinforcement: groupIndex === 1,
        powerScale: Math.max(0.2, Number(entry?.powerScale) || 1),
        rewardScale: Math.max(0.15, Number(entry?.rewardScale) || 1),
      });
    });
    if (groupIndex === 0) pulseOffset = Math.ceil(queue.length / pulseSize);
  }
  return queue;
}

export function beginSiegeAttack(
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
  const siege = state.siege;
  if (state.inWave || gameOver || !siege?.active) return null;

  setPaused(false);
  state.supportTimer = 0;
  state.repairActive = false;
  assignCraftsmen();
  hideRepairDecision();

  const arrived = siege.planned.slice(0, siege.arrived);
  const reinforcements = siege.planned.slice(siege.arrived);

  state.inWave = true;
  state.spawnQueue = createPulsedSpawnQueue(siege.planned, siege.arrived);
  state.toSpawn = state.spawnQueue.length;
  state.spawnTimer = 0.08;
  siege.active = false;

  setBuildMode(null);
  setSelected(null);
  const waveType = getWaveTypeInfo(state.wave, siege.waveType);
  showToast(
    arrived.length
      ? `${waveType.icon} ${waveType.label}: ${arrived.length} Gegner greifen an`
      : `${waveType.icon} ${waveType.label}: Angriff frühzeitig ausgelöst`
  );

  return { arrived, reinforcements };
}

export function getSiegeReleasePoint(entry, orderInCamp, campPositions, random = Math.random) {
  const campIndex = clampCampIndex(entry?.camp);
  const camp = campPositions[campIndex] || campPositions[0];
  const slotCount = 10;
  const ring = Math.floor(orderInCamp / slotCount);
  const slot = orderInCamp % slotCount;
  const distance = 40 + ring * 29;
  const angle = (slot / slotCount) * Math.PI * 2 + ring * 0.39;

  return {
    x: camp.x + Math.cos(angle) * distance + (random() - 0.5) * 8,
    y: camp.y + Math.sin(angle) * distance + (random() - 0.5) * 8,
  };
}

export function serializeSiegeState(siege) {
  if (!siege || !Array.isArray(siege.planned)) return null;

  const waveType = typeof siege.waveType === "string"
    ? getWaveTypeInfo(siege.wave, siege.waveType).key
    : "standard";

  return {
    active: siege.active === true,
    wave: Math.max(1, Number(siege.wave) || 1),
    waveType,
    baseTotal: Math.max(0, Number(siege.baseTotal) || Number(siege.total) || 0),
    total: Math.max(0, Number(siege.total) || 0),
    densityMultiplier: Math.max(1, Number(siege.densityMultiplier) || 1),
    arrived: Math.max(0, Number(siege.arrived) || 0),
    elapsed: Math.max(0, Number(siege.elapsed) || 0),
    gatherDuration: Math.max(1, Number(siege.gatherDuration) || SIEGE_GATHER_SECONDS),
    planned: siege.planned.map((entry) => ({
      type: String(entry?.type || "raider"),
      camp: clampCampIndex(entry?.camp),
      powerScale: Math.max(0.2, Number(entry?.powerScale) || 1),
      rewardScale: Math.max(0.15, Number(entry?.rewardScale) || 1),
    })),
  };
}

export function restoreSiegeState(savedSiege, wave) {
  const siege = serializeSiegeState(savedSiege);
  if (!siege || siege.wave !== Number(wave) || siege.planned.length !== siege.total) {
    return null;
  }

  siege.arrived = Math.min(siege.total, siege.arrived);
  return siege;
}
