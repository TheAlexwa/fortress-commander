/**
 * Globale Kampagnenkarte, Weltsiegel und Kommandantenlager.
 *
 * Der globale Kartenfortschritt liegt getrennt von den weltbezogenen
 * Festungsständen. Format 3 bewahrt den Fortschritt aller bekannten Welten.
 */

import {
  DEFAULT_WORLD_ID,
  WORLD_DEFINITIONS,
  getWorldDefinition,
  isKnownWorldId,
  isWorldUnlocked,
} from "./world-definitions.js";

export {
  WORLD_DEFINITIONS,
  getWorldDefinition,
  isKnownWorldId,
} from "./world-definitions.js";

export const WORLD_MAP_STORAGE_KEY = "fortressCommander.worldMap.v1";
export const WORLD_MAP_FORMAT = 3;
export const ACTIVE_WORLD_ID = DEFAULT_WORLD_ID;
export const COMMANDER_ACTIVE_LIMIT = 2;
export const COMMANDER_SEAL_BONUS_TARGET = 20;
export const CAMPAIGN_BOSS_WAVES = Object.freeze([
  ...getWorldDefinition(ACTIVE_WORLD_ID).campaign.bossWaves,
]);

export const COMMANDER_PERKS = Object.freeze([
  Object.freeze({ id: "gold-crate", icon: "🪙", name: "Kriegskasse", cost: 8, description: "+100 Startgold", bonuses: Object.freeze({ gold: 100 }) }),
  Object.freeze({ id: "timber-convoy", icon: "🪵", name: "Holzkonvoi", cost: 8, description: "+75 Startholz", bonuses: Object.freeze({ wood: 75 }) }),
  Object.freeze({ id: "stone-reserve", icon: "🪨", name: "Steinreserve", cost: 10, description: "+35 Startstein", bonuses: Object.freeze({ stone: 35 }) }),
  Object.freeze({ id: "field-research", icon: "🔬", name: "Feldforschung", cost: 12, description: "+2 Forschungspunkte", bonuses: Object.freeze({ researchPoints: 2 }) }),
  Object.freeze({ id: "hero-offering", icon: "🗿", name: "Ehrengabe", cost: 12, description: "+250 Opferpunkte für Andreas", bonuses: Object.freeze({ heroOffering: 250 }) }),
]);

const VALID_PERKS = new Map(COMMANDER_PERKS.map((perk) => [perk.id, perk]));

function uniqueValidPerks(value) {
  return [...new Set(Array.isArray(value) ? value.filter((id) => VALID_PERKS.has(id)) : [])];
}

function bossWavesFor(worldId) {
  return getWorldDefinition(worldId).campaign.bossWaves;
}

function uniqueBossWaves(value, worldId = ACTIVE_WORLD_ID) {
  const valid = new Set(bossWavesFor(worldId));
  return [...new Set(Array.isArray(value) ? value.map(Number).filter((wave) => valid.has(wave)) : [])].sort((a, b) => a - b);
}

function emptyWorldProgress() {
  return {
    bestWave: 0,
    currentWave: 1,
    completed: false,
    bossesDefeated: 0,
    bonusObjectivesCompleted: 0,
    bonusObjectivesFailed: 0,
    heroSealCompleted: false,
    lastPlayedAt: null,
  };
}

export function createWorldRunStats() {
  return {
    bonusObjectivesCompleted: 0,
    bonusObjectivesFailed: 0,
    heroBossWavesSurvived: [],
  };
}

export function normalizeWorldRunStats(value, worldId = ACTIVE_WORLD_ID) {
  const source = value && typeof value === "object" ? value : {};
  return {
    bonusObjectivesCompleted: Math.max(0, Math.floor(Number(source.bonusObjectivesCompleted) || 0)),
    bonusObjectivesFailed: Math.max(0, Math.floor(Number(source.bonusObjectivesFailed) || 0)),
    heroBossWavesSurvived: uniqueBossWaves(source.heroBossWavesSurvived, worldId),
  };
}

export function ensureWorldRunStats(state) {
  if (!state || typeof state !== "object") return createWorldRunStats();
  state.worldRun = normalizeWorldRunStats(state.worldRun, state.worldId);
  return state.worldRun;
}

export function serializeWorldRunStats(value, worldId = ACTIVE_WORLD_ID) {
  const stats = normalizeWorldRunStats(value, worldId);
  return { ...stats, heroBossWavesSurvived: [...stats.heroBossWavesSurvived] };
}

export function restoreWorldRunStats(value, worldId = ACTIVE_WORLD_ID) {
  return normalizeWorldRunStats(value, worldId);
}

export function recordWorldRunWave(state, completedWave, { bonusSuccess = false, bossWave = false, heroAlive = false } = {}) {
  const worldId = isKnownWorldId(state?.worldId) ? state.worldId : ACTIVE_WORLD_ID;
  const stats = ensureWorldRunStats(state);
  if (bonusSuccess) stats.bonusObjectivesCompleted += 1;
  else stats.bonusObjectivesFailed += 1;
  const wave = Math.floor(Number(completedWave) || 0);
  if (bossWave && heroAlive && bossWavesFor(worldId).includes(wave) && !stats.heroBossWavesSurvived.includes(wave)) {
    stats.heroBossWavesSurvived.push(wave);
    stats.heroBossWavesSurvived.sort((a, b) => a - b);
  }
  return stats;
}

function createWorldProgressMap(sourceWorlds = {}) {
  return Object.fromEntries(
    WORLD_DEFINITIONS.map((world) => [world.id, normalizeProgress(sourceWorlds?.[world.id])])
  );
}

export function createWorldMapProfile() {
  return {
    format: WORLD_MAP_FORMAT,
    selectedWorldId: ACTIVE_WORLD_ID,
    lastPlayedWorldId: ACTIVE_WORLD_ID,
    worlds: createWorldProgressMap(),
    commander: { unlockedPerks: [], activePerks: [] },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeProgress(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    bestWave: Math.max(0, Math.floor(Number(source.bestWave) || 0)),
    currentWave: Math.max(1, Math.floor(Number(source.currentWave) || 1)),
    completed: source.completed === true,
    bossesDefeated: Math.max(0, Math.floor(Number(source.bossesDefeated) || 0)),
    bonusObjectivesCompleted: Math.max(0, Math.floor(Number(source.bonusObjectivesCompleted) || 0)),
    bonusObjectivesFailed: Math.max(0, Math.floor(Number(source.bonusObjectivesFailed) || 0)),
    heroSealCompleted: source.heroSealCompleted === true,
    lastPlayedAt: typeof source.lastPlayedAt === "string" ? source.lastPlayedAt : null,
  };
}

export function normalizeWorldMapProfile(value) {
  const fallback = createWorldMapProfile();
  const source = value && typeof value === "object" ? value : fallback;
  const unlockedPerks = uniqueValidPerks(source.commander?.unlockedPerks);
  const activePerks = uniqueValidPerks(source.commander?.activePerks)
    .filter((id) => unlockedPerks.includes(id))
    .slice(0, COMMANDER_ACTIVE_LIMIT);
  return {
    format: WORLD_MAP_FORMAT,
    selectedWorldId: isKnownWorldId(source.selectedWorldId) ? source.selectedWorldId : ACTIVE_WORLD_ID,
    lastPlayedWorldId: isKnownWorldId(source.lastPlayedWorldId) ? source.lastPlayedWorldId : ACTIVE_WORLD_ID,
    worlds: createWorldProgressMap(source.worlds),
    commander: { unlockedPerks, activePerks },
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : fallback.updatedAt,
  };
}

export function loadWorldMapProfile() {
  try {
    const raw = localStorage.getItem(WORLD_MAP_STORAGE_KEY);
    return raw ? normalizeWorldMapProfile(JSON.parse(raw)) : createWorldMapProfile();
  } catch (error) {
    console.warn("Kampagnenkarte konnte nicht geladen werden:", error);
    return createWorldMapProfile();
  }
}

export function saveWorldMapProfile(profile) {
  const normalized = normalizeWorldMapProfile(profile);
  normalized.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(WORLD_MAP_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.warn("Kampagnenkarte konnte nicht gespeichert werden:", error);
  }
  return normalized;
}

export function selectWorldOnMap(profile, worldId) {
  const normalized = normalizeWorldMapProfile(profile);
  normalized.selectedWorldId = isKnownWorldId(worldId) ? worldId : ACTIVE_WORLD_ID;
  return normalized;
}

function resolveProgressWorldId(explicitWorldId, source) {
  if (explicitWorldId !== undefined && explicitWorldId !== null) {
    return isKnownWorldId(explicitWorldId) ? explicitWorldId : null;
  }
  if (source?.worldId !== undefined && source?.worldId !== null) {
    return isKnownWorldId(source.worldId) ? source.worldId : null;
  }
  return ACTIVE_WORLD_ID;
}

function campaignProgressFromMetadata(metadata, worldId) {
  const campaign = metadata?.campaign && typeof metadata.campaign === "object" ? metadata.campaign : null;
  const highest = Math.max(0, Math.floor(Number(campaign?.highestCompletedWave) || Math.max(0, Number(metadata?.wave || 1) - 1)));
  const bossWaves = bossWavesFor(worldId);
  const claimed = Array.isArray(campaign?.milestoneRewardsClaimed)
    ? campaign.milestoneRewardsClaimed.length
    : bossWaves.filter((wave) => wave <= highest).length;
  const run = normalizeWorldRunStats(metadata?.worldRun, worldId);
  const finalWave = getWorldDefinition(worldId).campaign.finalWave;
  return {
    currentWave: Math.max(1, Math.floor(Number(metadata?.wave) || highest + 1)),
    bestWave: finalWave ? Math.min(finalWave, highest) : highest,
    completed: campaign?.completed === true || (finalWave !== null && highest >= finalWave),
    bossesDefeated: Math.max(0, Math.min(bossWaves.length || claimed, claimed)),
    run,
  };
}

export function syncWorldMapProfileFromSave(profile, metadata, worldId = null) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!metadata?.valid) return normalized;
  const targetWorldId = resolveProgressWorldId(worldId, metadata);
  if (!targetWorldId) return normalized;
  const progress = campaignProgressFromMetadata(metadata, targetWorldId);
  const target = normalized.worlds[targetWorldId];
  target.currentWave = progress.currentWave;
  target.bestWave = Math.max(target.bestWave, progress.bestWave);
  target.completed = target.completed || progress.completed;
  target.bossesDefeated = Math.max(target.bossesDefeated, progress.bossesDefeated);
  target.bonusObjectivesCompleted = Math.max(target.bonusObjectivesCompleted, progress.run.bonusObjectivesCompleted);
  target.bonusObjectivesFailed = Math.max(target.bonusObjectivesFailed, progress.run.bonusObjectivesFailed);
  target.heroSealCompleted = target.heroSealCompleted || (
    bossWavesFor(targetWorldId).length > 0 &&
    progress.run.heroBossWavesSurvived.length === bossWavesFor(targetWorldId).length
  );
  target.lastPlayedAt = metadata.savedAt || target.lastPlayedAt;
  normalized.lastPlayedWorldId = targetWorldId;
  return normalized;
}

export function syncWorldMapProfileFromState(profile, state, worldId = null) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!state || typeof state !== "object") return normalized;
  const targetWorldId = resolveProgressWorldId(worldId, state);
  if (!targetWorldId) return normalized;
  const campaign = state.campaign && typeof state.campaign === "object" ? state.campaign : {};
  const run = normalizeWorldRunStats(state.worldRun, targetWorldId);
  const highest = Math.max(0, Math.floor(Number(campaign.highestCompletedWave) || Math.max(0, Number(state.wave || 1) - 1)));
  const definition = getWorldDefinition(targetWorldId);
  const target = normalized.worlds[targetWorldId];
  target.currentWave = Math.max(1, Math.floor(Number(state.wave) || 1));
  target.bestWave = Math.max(target.bestWave, definition.campaign.finalWave ? Math.min(definition.campaign.finalWave, highest) : highest);
  target.completed = target.completed || campaign.completed === true || (definition.campaign.finalWave !== null && highest >= definition.campaign.finalWave);
  target.bossesDefeated = Math.max(
    target.bossesDefeated,
    Array.isArray(campaign.milestoneRewardsClaimed)
      ? Math.min(definition.campaign.bossWaves.length, campaign.milestoneRewardsClaimed.length)
      : definition.campaign.bossWaves.filter((wave) => wave <= highest).length
  );
  target.bonusObjectivesCompleted = Math.max(target.bonusObjectivesCompleted, run.bonusObjectivesCompleted);
  target.bonusObjectivesFailed = Math.max(target.bonusObjectivesFailed, run.bonusObjectivesFailed);
  target.heroSealCompleted = target.heroSealCompleted || (
    definition.campaign.bossWaves.length > 0 &&
    run.heroBossWavesSurvived.length === definition.campaign.bossWaves.length
  );
  target.lastPlayedAt = new Date().toISOString();
  normalized.lastPlayedWorldId = targetWorldId;
  return normalized;
}

export function getWorldSeals(progress, worldId = ACTIVE_WORLD_ID) {
  const normalized = normalizeProgress(progress);
  const definition = getWorldDefinition(worldId);
  const finalWave = definition.campaign.finalWave;
  return [
    { id: "defense", icon: "🛡️", name: "Siegel der Verteidigung", description: `${definition.name} abschließen`, earned: normalized.completed },
    { id: "hero", icon: "👑", name: "Siegel des Helden", description: "Andreas überlebt alle Bosswellen", earned: normalized.heroSealCompleted },
    { id: "commander", icon: "🎯", name: "Siegel des Kommandanten", description: `${COMMANDER_SEAL_BONUS_TARGET} Bonusziele in einer Kampagne erfüllen`, earned: normalized.bonusObjectivesCompleted >= COMMANDER_SEAL_BONUS_TARGET },
  ].map((seal) => ({ ...seal, available: finalWave !== null }));
}

export function getCommanderPointSummary(profile) {
  const normalized = normalizeWorldMapProfile(profile);
  const earned = WORLD_DEFINITIONS.reduce((sum, world) => {
    const progress = normalized.worlds[world.id];
    return sum + progress.bonusObjectivesCompleted + progress.bossesDefeated * 5 + (progress.completed ? 20 : 0);
  }, 0);
  const spent = normalized.commander.unlockedPerks.reduce((sum, id) => sum + (VALID_PERKS.get(id)?.cost || 0), 0);
  return { earned, spent, available: Math.max(0, earned - spent) };
}

export function unlockCommanderPerk(profile, perkId) {
  const normalized = normalizeWorldMapProfile(profile);
  const perk = VALID_PERKS.get(perkId);
  if (!perk) return { profile: normalized, success: false, reason: "Unbekannter Vorteil" };
  if (normalized.commander.unlockedPerks.includes(perkId)) return { profile: normalized, success: true, alreadyUnlocked: true, perk };
  const points = getCommanderPointSummary(normalized);
  if (points.available < perk.cost) return { profile: normalized, success: false, reason: "Nicht genug Kommandantenpunkte", perk };
  normalized.commander.unlockedPerks.push(perkId);
  return { profile: normalized, success: true, perk };
}

export function toggleCommanderPerk(profile, perkId) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!normalized.commander.unlockedPerks.includes(perkId)) return { profile: normalized, success: false, reason: "Vorteil noch nicht freigeschaltet" };
  const active = normalized.commander.activePerks;
  if (active.includes(perkId)) {
    normalized.commander.activePerks = active.filter((id) => id !== perkId);
    return { profile: normalized, success: true, active: false };
  }
  if (active.length >= COMMANDER_ACTIVE_LIMIT) return { profile: normalized, success: false, reason: `Höchstens ${COMMANDER_ACTIVE_LIMIT} Startvorteile gleichzeitig` };
  active.push(perkId);
  return { profile: normalized, success: true, active: true };
}

export function getActiveStartBonuses(profile) {
  const normalized = normalizeWorldMapProfile(profile);
  const bonuses = { gold: 0, wood: 0, stone: 0, researchPoints: 0, heroOffering: 0 };
  for (const id of normalized.commander.activePerks) {
    const perk = VALID_PERKS.get(id);
    if (!perk) continue;
    for (const [key, amount] of Object.entries(perk.bonuses)) bonuses[key] += Number(amount) || 0;
  }
  return bonuses;
}

export function formatStartBonuses(profile) {
  const bonuses = getActiveStartBonuses(profile);
  const parts = [];
  if (bonuses.gold) parts.push(`+${bonuses.gold} Gold`);
  if (bonuses.wood) parts.push(`+${bonuses.wood} Holz`);
  if (bonuses.stone) parts.push(`+${bonuses.stone} Stein`);
  if (bonuses.researchPoints) parts.push(`+${bonuses.researchPoints} Forschung`);
  if (bonuses.heroOffering) parts.push(`+${bonuses.heroOffering} Opferpunkte`);
  return parts.join(" · ") || "Keine Startvorteile aktiv";
}

export function getWorldMapView(profile, metadata = null, worldId = null) {
  const normalized = syncWorldMapProfileFromSave(profile, metadata, worldId);
  return {
    profile: normalized,
    points: getCommanderPointSummary(normalized),
    worlds: WORLD_DEFINITIONS.map((world) => {
      const progress = normalized.worlds[world.id];
      const unlocked = isWorldUnlocked(world, normalized.worlds);
      return {
        ...world,
        progress,
        seals: getWorldSeals(progress, world.id),
        unlocked,
        playable: world.status === "playable" && unlocked,
        underConstruction: world.status === "construction",
      };
    }),
  };
}
