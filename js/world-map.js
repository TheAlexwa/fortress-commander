/**
 * Globale Kampagnenkarte, Weltsiegel und Kommandantenlager.
 *
 * Der globale Kartenfortschritt liegt getrennt vom aktuellen Festungsstand.
 * Dadurch bleiben Siegel, freigeschaltete Startvorteile und Bestwerte erhalten,
 * selbst wenn Welt 1 neu begonnen wird.
 */

export const WORLD_MAP_STORAGE_KEY = "fortressCommander.worldMap.v1";
export const ACTIVE_WORLD_ID = "borderlands";
export const COMMANDER_ACTIVE_LIMIT = 2;
export const COMMANDER_SEAL_BONUS_TARGET = 20;
export const CAMPAIGN_BOSS_WAVES = Object.freeze([8, 16, 24, 32]);

export const WORLD_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: ACTIVE_WORLD_ID,
    number: 1,
    icon: "🏰",
    name: "Die Grenzmark",
    subtitle: "Welt 1 · Die erste Festung",
    description: "Verteidige die grüne Grenzmark in 32 Wellen gegen die Eisenclans und entscheide danach über den Endlosmodus.",
    feature: "Ausgewogene Angriffe · klassische Eisenclan-Kampagne",
    status: "playable",
  }),
  Object.freeze({ id: "mistwood", number: 2, icon: "🌲", name: "Der Nebelwald", subtitle: "Welt 2 · Verborgene Waldpfade", description: "Ein dichter Wald, in dem Nebel und versteckte Wege die Aufklärung erschweren.", feature: "Geplant: Nebel, Waldpfade und der Wolfsfürst", status: "construction" }),
  Object.freeze({ id: "frozen-pass", number: 3, icon: "❄️", name: "Der gefrorene Pass", subtitle: "Welt 3 · Eisige Gebirgsfestung", description: "Ein verschneiter Pass mit vereisten Wegen und schweren Schildformationen.", feature: "Geplant: Frost, Lagerfeuer und der Frostriese", status: "construction" }),
  Object.freeze({ id: "scorched-plains", number: 4, icon: "🔥", name: "Die verbrannten Ebenen", subtitle: "Welt 4 · Krieg im Flammenland", description: "Eine verwüstete Ebene mit Feuerangriffen, knappen Holzvorräten und mächtigen Belagerungswaffen.", feature: "Geplant: Brände und der Flammenhäuptling", status: "construction" }),
  Object.freeze({ id: "ironclan-heart", number: 5, icon: "🌋", name: "Das Herz des Eisenclans", subtitle: "Welt 5 · Das letzte Reich", description: "Die vulkanische Heimat der Eisenclans und das zukünftige Finale der großen Weltkampagne.", feature: "Geplant: Elitearmeen und der Hochkönig", status: "construction" }),
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

function uniqueBossWaves(value) {
  const valid = new Set(CAMPAIGN_BOSS_WAVES);
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

export function normalizeWorldRunStats(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    bonusObjectivesCompleted: Math.max(0, Math.floor(Number(source.bonusObjectivesCompleted) || 0)),
    bonusObjectivesFailed: Math.max(0, Math.floor(Number(source.bonusObjectivesFailed) || 0)),
    heroBossWavesSurvived: uniqueBossWaves(source.heroBossWavesSurvived),
  };
}

export function ensureWorldRunStats(state) {
  if (!state || typeof state !== "object") return createWorldRunStats();
  state.worldRun = normalizeWorldRunStats(state.worldRun);
  return state.worldRun;
}

export function serializeWorldRunStats(value) {
  const stats = normalizeWorldRunStats(value);
  return { ...stats, heroBossWavesSurvived: [...stats.heroBossWavesSurvived] };
}

export function restoreWorldRunStats(value) {
  return normalizeWorldRunStats(value);
}

export function recordWorldRunWave(state, completedWave, { bonusSuccess = false, bossWave = false, heroAlive = false } = {}) {
  const stats = ensureWorldRunStats(state);
  if (bonusSuccess) stats.bonusObjectivesCompleted += 1;
  else stats.bonusObjectivesFailed += 1;
  const wave = Math.floor(Number(completedWave) || 0);
  if (bossWave && heroAlive && CAMPAIGN_BOSS_WAVES.includes(wave) && !stats.heroBossWavesSurvived.includes(wave)) {
    stats.heroBossWavesSurvived.push(wave);
    stats.heroBossWavesSurvived.sort((a, b) => a - b);
  }
  return stats;
}

export function createWorldMapProfile() {
  return {
    format: 2,
    selectedWorldId: ACTIVE_WORLD_ID,
    lastPlayedWorldId: ACTIVE_WORLD_ID,
    worlds: { [ACTIVE_WORLD_ID]: emptyWorldProgress() },
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
    bossesDefeated: Math.max(0, Math.min(4, Math.floor(Number(source.bossesDefeated) || 0))),
    bonusObjectivesCompleted: Math.max(0, Math.floor(Number(source.bonusObjectivesCompleted) || 0)),
    bonusObjectivesFailed: Math.max(0, Math.floor(Number(source.bonusObjectivesFailed) || 0)),
    heroSealCompleted: source.heroSealCompleted === true,
    lastPlayedAt: typeof source.lastPlayedAt === "string" ? source.lastPlayedAt : null,
  };
}

export function normalizeWorldMapProfile(value) {
  const fallback = createWorldMapProfile();
  const source = value && typeof value === "object" ? value : fallback;
  const validIds = new Set(WORLD_DEFINITIONS.map((world) => world.id));
  const unlockedPerks = uniqueValidPerks(source.commander?.unlockedPerks);
  const activePerks = uniqueValidPerks(source.commander?.activePerks)
    .filter((id) => unlockedPerks.includes(id))
    .slice(0, COMMANDER_ACTIVE_LIMIT);
  return {
    format: 2,
    selectedWorldId: validIds.has(source.selectedWorldId) ? source.selectedWorldId : ACTIVE_WORLD_ID,
    lastPlayedWorldId: validIds.has(source.lastPlayedWorldId) ? source.lastPlayedWorldId : ACTIVE_WORLD_ID,
    worlds: { [ACTIVE_WORLD_ID]: normalizeProgress(source.worlds?.[ACTIVE_WORLD_ID]) },
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
  localStorage.setItem(WORLD_MAP_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function getWorldDefinition(worldId) {
  return WORLD_DEFINITIONS.find((world) => world.id === worldId) || WORLD_DEFINITIONS[0];
}

export function selectWorldOnMap(profile, worldId) {
  const normalized = normalizeWorldMapProfile(profile);
  normalized.selectedWorldId = getWorldDefinition(worldId).id;
  return normalized;
}

function campaignProgressFromMetadata(metadata) {
  const campaign = metadata?.campaign && typeof metadata.campaign === "object" ? metadata.campaign : null;
  const highest = Math.max(0, Math.floor(Number(campaign?.highestCompletedWave) || Math.max(0, Number(metadata?.wave || 1) - 1)));
  const claimed = Array.isArray(campaign?.milestoneRewardsClaimed) ? campaign.milestoneRewardsClaimed.length : Math.floor(highest / 8);
  const run = normalizeWorldRunStats(metadata?.worldRun);
  return {
    currentWave: Math.max(1, Math.floor(Number(metadata?.wave) || highest + 1)),
    bestWave: Math.min(32, highest),
    completed: campaign?.completed === true || highest >= 32,
    bossesDefeated: Math.max(0, Math.min(4, claimed)),
    run,
  };
}

export function syncWorldMapProfileFromSave(profile, metadata) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!metadata?.valid) return normalized;
  const progress = campaignProgressFromMetadata(metadata);
  const target = normalized.worlds[ACTIVE_WORLD_ID];
  target.currentWave = progress.currentWave;
  target.bestWave = Math.max(target.bestWave, progress.bestWave);
  target.completed = target.completed || progress.completed;
  target.bossesDefeated = Math.max(target.bossesDefeated, progress.bossesDefeated);
  target.bonusObjectivesCompleted = Math.max(target.bonusObjectivesCompleted, progress.run.bonusObjectivesCompleted);
  target.bonusObjectivesFailed = Math.max(target.bonusObjectivesFailed, progress.run.bonusObjectivesFailed);
  target.heroSealCompleted = target.heroSealCompleted || progress.run.heroBossWavesSurvived.length === 4;
  target.lastPlayedAt = metadata.savedAt || target.lastPlayedAt;
  normalized.lastPlayedWorldId = ACTIVE_WORLD_ID;
  return normalized;
}

export function syncWorldMapProfileFromState(profile, state) {
  const normalized = normalizeWorldMapProfile(profile);
  if (!state || typeof state !== "object") return normalized;
  const campaign = state.campaign && typeof state.campaign === "object" ? state.campaign : {};
  const run = ensureWorldRunStats(state);
  const highest = Math.max(0, Math.floor(Number(campaign.highestCompletedWave) || Math.max(0, Number(state.wave || 1) - 1)));
  const target = normalized.worlds[ACTIVE_WORLD_ID];
  target.currentWave = Math.max(1, Math.floor(Number(state.wave) || 1));
  target.bestWave = Math.max(target.bestWave, Math.min(32, highest));
  target.completed = target.completed || campaign.completed === true || highest >= 32;
  target.bossesDefeated = Math.max(target.bossesDefeated, Array.isArray(campaign.milestoneRewardsClaimed) ? Math.min(4, campaign.milestoneRewardsClaimed.length) : Math.min(4, Math.floor(highest / 8)));
  target.bonusObjectivesCompleted = Math.max(target.bonusObjectivesCompleted, run.bonusObjectivesCompleted);
  target.bonusObjectivesFailed = Math.max(target.bonusObjectivesFailed, run.bonusObjectivesFailed);
  target.heroSealCompleted = target.heroSealCompleted || run.heroBossWavesSurvived.length === 4;
  target.lastPlayedAt = new Date().toISOString();
  normalized.lastPlayedWorldId = ACTIVE_WORLD_ID;
  return normalized;
}

export function getWorldSeals(progress) {
  const normalized = normalizeProgress(progress);
  return [
    { id: "defense", icon: "🛡️", name: "Siegel der Verteidigung", description: "Die Grenzmark abschließen", earned: normalized.completed },
    { id: "hero", icon: "👑", name: "Siegel des Helden", description: "Andreas überlebt alle vier Bosswellen", earned: normalized.heroSealCompleted },
    { id: "commander", icon: "🎯", name: "Siegel des Kommandanten", description: `${COMMANDER_SEAL_BONUS_TARGET} Bonusziele in einer Kampagne erfüllen`, earned: normalized.bonusObjectivesCompleted >= COMMANDER_SEAL_BONUS_TARGET },
  ];
}

export function getCommanderPointSummary(profile) {
  const normalized = normalizeWorldMapProfile(profile);
  const progress = normalized.worlds[ACTIVE_WORLD_ID];
  const earned = progress.bonusObjectivesCompleted + progress.bossesDefeated * 5 + (progress.completed ? 20 : 0);
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

export function getWorldMapView(profile, metadata = null) {
  const normalized = syncWorldMapProfileFromSave(profile, metadata);
  return {
    profile: normalized,
    points: getCommanderPointSummary(normalized),
    worlds: WORLD_DEFINITIONS.map((world) => {
      const progress = world.id === ACTIVE_WORLD_ID ? normalized.worlds[ACTIVE_WORLD_ID] : emptyWorldProgress();
      return { ...world, progress, seals: getWorldSeals(progress), playable: world.status === "playable", underConstruction: world.status === "construction" };
    }),
  };
}
