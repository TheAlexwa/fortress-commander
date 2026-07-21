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

function chooseCamp(_type, campCounts, random) {
  const minimum = Math.min(...campCounts);
  const candidates = campCounts
    .map((count, index) => (count === minimum ? index : -1))
    .filter((index) => index >= 0);

  return candidates[Math.floor(random() * candidates.length)] ?? 0;
}

export function prepareSiegePhase(
  state,
  { getWaveEnemyCount, selectWaveEnemyType, random = Math.random }
) {
  const total = getWaveEnemyCount(state.wave);
  const campCounts = Array(SIEGE_CAMP_COUNT).fill(0);
  const planned = [];

  for (let remaining = total; remaining > 0; remaining--) {
    const type = selectWaveEnemyType(state.wave, remaining, random);
    const camp = chooseCamp(type, campCounts, random);
    campCounts[camp]++;
    planned.push({ type, camp });
  }

  state.siege = {
    active: true,
    wave: state.wave,
    total,
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
    camp.threat += ENEMY_THREAT[type] || 1;
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
  const reinforcementOrders = Array(SIEGE_CAMP_COUNT).fill(0);

  state.inWave = true;
  state.spawnQueue = reinforcements.map((entry) => {
    const camp = clampCampIndex(entry?.camp);
    return {
      type: String(entry?.type || "raider"),
      camp,
      orderInCamp: reinforcementOrders[camp]++,
    };
  });
  state.toSpawn = state.spawnQueue.length;
  state.spawnTimer = arrived.length ? 1.15 : 0.1;
  siege.active = false;

  setBuildMode(null);
  setSelected(null);
  showToast(
    arrived.length
      ? `Welle ${state.wave}: ${arrived.length} Gegner brechen aus vier Lagern auf`
      : `Welle ${state.wave}: Angriff frühzeitig ausgelöst`
  );

  return { arrived, reinforcements };
}

export function getSiegeReleasePoint(entry, orderInCamp, campPositions, random = Math.random) {
  const campIndex = clampCampIndex(entry?.camp);
  const camp = campPositions[campIndex] || campPositions[0];
  const ring = Math.floor(orderInCamp / 7);
  const slot = orderInCamp % 7;
  const distance = 32 + ring * 22;
  const angle = (slot / 7) * Math.PI * 2 + ring * 0.45;

  return {
    x: camp.x + Math.cos(angle) * distance + (random() - 0.5) * 8,
    y: camp.y + Math.sin(angle) * distance + (random() - 0.5) * 8,
  };
}

export function serializeSiegeState(siege) {
  if (!siege || !Array.isArray(siege.planned)) return null;

  return {
    active: siege.active === true,
    wave: Math.max(1, Number(siege.wave) || 1),
    total: Math.max(0, Number(siege.total) || 0),
    arrived: Math.max(0, Number(siege.arrived) || 0),
    elapsed: Math.max(0, Number(siege.elapsed) || 0),
    gatherDuration: Math.max(1, Number(siege.gatherDuration) || SIEGE_GATHER_SECONDS),
    planned: siege.planned.map((entry) => ({
      type: String(entry?.type || "raider"),
      camp: clampCampIndex(entry?.camp),
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
