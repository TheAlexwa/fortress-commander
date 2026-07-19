/**
 * Belagerungsphase von Fortress Commander.
 *
 * Zwischen den Angriffswellen sammelt sich die bereits festgelegte nächste
 * Welle an drei Außenlagern. Langes Warten erhöht nur die Größe des ersten
 * Angriffspulks; die gesamte Wellenstärke bleibt unverändert.
 */

export const SIEGE_GATHER_SECONDS = 45;

export function getSiegeCampPositions({ WORLD_W, WORLD_H }) {
  return [
    { x: 185, y: 235, angle: 0.55, label: "Westlager" },
    { x: WORLD_W - 185, y: 235, angle: Math.PI - 0.55, label: "Ostlager" },
    { x: WORLD_W / 2, y: WORLD_H - 145, angle: -Math.PI / 2, label: "Südlager" },
  ];
}

function chooseCamp(type, campCounts, random) {
  if (type === "boss") return 2;

  const minimum = Math.min(...campCounts);
  const candidates = campCounts
    .map((count, index) => (count === minimum ? index : -1))
    .filter((index) => index >= 0);

  if (["shield", "berserker"].includes(type) && candidates.includes(2)) {
    return 2;
  }

  return candidates[Math.floor(random() * candidates.length)] ?? 0;
}

export function prepareSiegePhase(
  state,
  { getWaveEnemyCount, selectWaveEnemyType, random = Math.random }
) {
  const total = getWaveEnemyCount(state.wave);
  const campCounts = [0, 0, 0];
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

export function getSiegeCampCounts(siege) {
  const counts = [0, 0, 0];
  if (!siege?.active || !Array.isArray(siege.planned)) return counts;

  for (const entry of siege.planned.slice(0, siege.arrived)) {
    const camp = Math.max(0, Math.min(2, Number(entry?.camp) || 0));
    counts[camp]++;
  }
  return counts;
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
  state.spawnQueue = reinforcements.map((entry) => entry.type);
  state.toSpawn = state.spawnQueue.length;
  state.spawnTimer = arrived.length ? 1.15 : 0.1;
  siege.active = false;

  setBuildMode(null);
  setSelected(null);
  showToast(
    arrived.length
      ? `Welle ${state.wave}: ${arrived.length} Gegner brechen aus den Lagern auf`
      : `Welle ${state.wave}: Angriff frühzeitig ausgelöst`
  );

  return { arrived, reinforcements };
}

export function getSiegeReleasePoint(entry, orderInCamp, campPositions, random = Math.random) {
  const campIndex = Math.max(0, Math.min(2, Number(entry?.camp) || 0));
  const camp = campPositions[campIndex];
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
      camp: Math.max(0, Math.min(2, Number(entry?.camp) || 0)),
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
